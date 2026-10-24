#!/usr/bin/env python3
"""Generate llms.txt and main-content Markdown from the HTML catalog (stdlib only)."""
from __future__ import annotations
import argparse
from dataclasses import dataclass, field
from html.parser import HTMLParser
import os
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit, urlunsplit

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'docs'
LLMS = DOCS / 'llms.txt'
VOID = set('area base br col embed hr img input link meta param source track wbr'.split())
SKIP = {'script', 'style', 'svg', 'noscript', 'template'}
MARKER = re.compile(r'\n?<!-- Kav-UI AI discovery -->.*?<!-- /Kav-UI AI discovery -->\n?', re.S)


@dataclass
class Node:
    tag: str
    attrs: dict = field(default_factory=dict)
    children: list = field(default_factory=list)
    inner_start: int = 0
    inner_end: int = 0

    def walk(self):
        yield self
        for child in self.children:
            if isinstance(child, Node):
                yield from child.walk()

    def text(self):
        return ''.join(child.text() if isinstance(child, Node) else child for child in self.children)

    def has_class(self, name):
        return name in self.attrs.get('class', '').split()


class Document(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.source = source
        self.lines = [0]
        self.lines.extend(match.end() for match in re.finditer('\n', source))
        self.root = Node('document')
        self.stack = [self.root]
        self.feed(source)

    def position(self):
        line, column = self.getpos()
        return self.lines[line - 1] + column

    def handle_starttag(self, tag, attrs):
        start = self.position() + len(self.get_starttag_text())
        node = Node(tag, dict((key, value or '') for key, value in attrs), inner_start=start, inner_end=start)
        self.stack[-1].children.append(node)
        if tag not in VOID:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.stack.pop()

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                for node in self.stack[index:]:
                    node.inner_end = self.position()
                del self.stack[index:]
                break

    def handle_data(self, data):
        self.stack[-1].children.append(data)


def compact(text):
    return re.sub(r'\s+', ' ', text).strip()


def fence(text, language=''):
    delimiter = '`' * max(3, max((len(value) + 1 for value in re.findall(r'`+', text)), default=3))
    return delimiter + language + '\n' + text.strip('\n') + '\n' + delimiter


class Markdown:
    def __init__(self, page, document, pages):
        self.page, self.document, self.pages = page, document, pages

    def link(self, value):
        url = urlsplit(value)
        if url.scheme or url.netloc or not url.path or url.path.startswith('/'):
            return value
        target = (self.page.parent / unquote(url.path)).resolve()
        if target in self.pages:
            url = url._replace(path=url.path + '.md')
        return urlunsplit(url)

    def inline(self, node):
        if isinstance(node, str):
            return re.sub(r'\s+', ' ', node)
        if node.tag in SKIP:
            return ''
        text = ''.join(self.inline(child) for child in node.children)
        if node.tag == 'code':
            value = node.text().strip()
            marks = '`' * (max((len(part) for part in re.findall(r'`+', value)), default=0) + 1)
            return marks + value + marks
        if node.tag == 'a' and node.attrs.get('href'):
            return '[' + compact(text or node.attrs.get('aria-label', 'リンク')) + '](' + self.link(node.attrs['href']) + ')'
        if node.tag == 'strong':
            return '**' + text + '**'
        if node.tag == 'em':
            return '*' + text + '*'
        if node.tag == 'br':
            return '\n'
        if node.tag == 'img':
            return node.attrs.get('alt', '')
        return text

    def blocks(self, node):
        if isinstance(node, str):
            return compact(node)
        if node.tag in SKIP:
            return ''
        if 'data-example' in node.attrs:
            # Preserve authored markup, not runtime-generated state or source widgets.
            return fence(self.document.source[node.inner_start:node.inner_end].strip(), 'html')
        if 'hidden' in node.attrs or node.has_class('eyebrow'):
            return ''
        if node.has_class('mdi-icon-card'):
            title = next((item.text() for item in node.walk() if item.tag == 'h3'), '')
            description = next((item.text() for item in node.walk() if item.has_class('mdi-icon-description')), '')
            source = next((item.attrs.get('href', '') for item in node.walk() if item.tag == 'a' and urlsplit(item.attrs.get('href', '')).path.endswith('.svg')), '')
            label = '`' + compact(title) + '`'
            return '- ' + ('[' + label + '](' + self.link(source) + ')' if source else label) + ': ' + compact(description)
        if node.tag == 'pre':
            code = node.text()
            language = 'html' if code.lstrip().startswith('<') else ''
            return fence(code, language)
        if node.has_class('catalog-card'):
            title = next((item.text() for item in node.walk() if item.tag == 'h2'), node.text())
            description = next((item.text() for item in node.walk() if item.tag == 'p'), '')
            return '- [' + compact(title) + '](' + self.link(node.attrs.get('href', '')) + '): ' + compact(description)
        if node.tag in {'h1', 'h2', 'h3', 'h4', 'h5', 'h6'}:
            return '#' * int(node.tag[1]) + ' ' + compact(self.inline(node))
        if node.tag in {'p', 'summary', 'dt', 'dd'}:
            return self.inline(node).strip()
        if node.tag in {'ul', 'ol'}:
            lines = []
            for index, item in enumerate(child for child in node.children if isinstance(child, Node) and child.tag == 'li'):
                content = ''.join(self.inline(child) for child in item.children if not isinstance(child, Node) or child.tag not in {'ul', 'ol'})
                prefix = str(index + 1) + '. ' if node.tag == 'ol' else '- '
                lines.append(prefix + compact(content))
                for child in item.children:
                    if isinstance(child, Node) and child.tag in {'ul', 'ol'}:
                        lines.extend('  ' + line for line in self.blocks(child).splitlines())
            return '\n'.join(lines)
        if node.tag == 'table':
            rows = [item for item in node.walk() if item.tag == 'tr']
            values = [[self.inline(cell).strip().replace('|', '\\|').replace('\n', '<br>') for cell in row.children if isinstance(cell, Node) and cell.tag in {'th', 'td'}] for row in rows]
            values = [row for row in values if row]
            if not values:
                return ''
            width = max(map(len, values))
            lines = ['| ' + ' | '.join(row + [''] * (width - len(row))) + ' |' for row in values]
            lines.insert(1, '| ' + ' | '.join(['---'] * width) + ' |')
            caption = next((item.text() for item in node.walk() if item.tag == 'caption'), '')
            return (compact(caption) + '\n\n' if caption else '') + '\n'.join(lines)
        result = '\n\n'.join(value for child in node.children if (value := self.blocks(child)))
        if node.tag == 'section' and node.attrs.get('id'):
            return '<a id="' + node.attrs['id'] + '"></a>\n\n' + result
        return result


def discovery(page, source, markdown=True):
    llms = Path(os.path.relpath(LLMS, page.parent)).as_posix()
    links = ['<!-- Kav-UI AI discovery -->', '<link rel="describedby" type="text/plain" href="' + llms + '">']
    if markdown:
        links.append('<link rel="alternate" type="text/markdown" href="' + page.name + '.md">')
    links.append('<!-- /Kav-UI AI discovery -->')
    block = '\n' + '\n'.join(links) + '\n'
    if MARKER.search(source):
        return MARKER.sub(lambda _: block, source, count=1)
    return source.replace('</head>', block + '</head>', 1)


def outputs():
    pages = sorted(path.resolve() for path in DOCS.rglob('*.html') if path.name != 'preview.html')
    page_set = set(pages)
    documents, generated = {}, {}
    for page in pages:
        source = page.read_text()
        document = Document(source)
        main = next((node for node in document.root.walk() if node.tag == 'main'), None)
        if main is None:
            raise ValueError('Missing main content: ' + str(page.relative_to(ROOT)))
        documents[page] = (document, main)
        generated[page] = discovery(page, source)
        body = Markdown(page, document, page_set).blocks(main)
        relative = page.relative_to(ROOT).as_posix()
        llms = Path(os.path.relpath(LLMS, page.parent)).as_posix()
        generated[Path(str(page) + '.md')] = '<!-- Generated from ' + relative + '; run python3 scripts/generate-ai-docs.py. -->\n\n[HTML版](' + page.name + ') · [llms.txt](' + llms + ')\n\n' + body.strip() + '\n'
    lines = ['# Kav-UI', '', '> npm・ビルド不要のHTML/CSS/JavaScript UIフレームワーク。classで見た目、data-ui-*属性で操作を指定します。Vue/Astro向けの追加パッケージもあります。', '',
             '通常HTMLはassets/css/ui.cssとdefer付きのassets/js/ui.jsで自動初期化します。CSSはimport先を含めフォルダ一式を配置します。動的なDOMにはKavUI.init、置き換え前にはKavUI.destroyを使います。', '',
             '以下は本文・コード例のMarkdown版です。必要な部品だけを読み、外部フレームワークのクラスや未確認のAPIを推測で追加しないでください。リンクはこのファイルからの相対パスです。', '', '## 導入とAIエージェント', '',
             '- [ダウンロード・導入](installation.html.md): ZIPの入手、assets配置、最小HTML、テーマ復元。',
             '- [使い方・属性一覧](getting-started.html.md): data属性とイベント、初期化、アプリとの組み合わせ。',
             '- [AIエージェント用ガイド](ai-agents.html.md): スキルの持ち出し方と資料の更新方法。',
             '- [Kav-UIスキル](skills/kav-ui/SKILL.md): 別プロジェクトで使える同梱資料付きスキル。元ソース・通信なしでHTML/Vue/Astroの実装を案内。',
             '- [組み込みリファレンス](skills/kav-ui/references/integration.md): 持ち出せる基本HTMLと連携の例。']
    index = documents[(DOCS / 'index.html').resolve()][0]
    for group in (node for node in index.root.walk() if node.has_class('catalog-nav-group')):
        title = next((node.text() for node in group.walk() if node.tag == 'h2'), 'コンポーネント')
        lines.extend(['', '## ' + compact(title), ''])
        for anchor in (node for node in group.walk() if node.tag == 'a'):
            value = anchor.attrs.get('href', '')
            target = ((DOCS / 'index.html').parent / unquote(urlsplit(value).path)).resolve()
            if target not in documents:
                continue
            _, main = documents[target]
            summary = next((compact(node.text()) for node in main.walk() if node.has_class('lede')), '')
            summary = re.split(r'。|\.\s', summary, maxsplit=1)[0].rstrip('.')
            summary = summary if len(summary) <= 100 else summary[:97] + '…'
            lines.append('- [' + compact(anchor.text()) + '](' + target.relative_to(DOCS).as_posix() + '.md)' + (': ' + summary + '。' if summary else ''))
    lines.extend(['', '## Optional', '',
                  '- [Vue/Astroパッケージ](packages/README.md): ローカルtarball・GitHub Releases向けの導入と対応範囲。',
                  '- [Vue](packages/vue/README.md): props、slots、v-modelとKavWidget。',
                  '- [Astro](packages/astro/README.md): Provider、静的HTMLとクライアント遷移。',
                  '- [テンプレート](templates.html.md): ドキュメント・ダッシュボード・changelog・エラー画面。',
                  '- [動く最小HTML](starter.html): ブラウザで開く実例。',
                  '- [共通CSS](assets/ui/css/ui.css): CSSの入口。フォルダ内の参照先も必要。',
                  '- [共通JavaScript](assets/ui/js/ui.js): 自動初期化する通常HTML用ランタイム。',
                  '- [初期テーマ復元](assets/ui/js/theme-init.js): 任意の同期headスクリプト。',
                  '- [ソースリポジトリ](https://github.com/Kai17-a/Custom-UI): 配布構成・開発・生成と検証。',
                  '- [MDIライセンス](assets/ui/icons/mdi/LICENSE): 同梱アイコンの出典。',
                  '- [Material Color Utilitiesライセンス](assets/ui/vendor/material-color-utilities/LICENSE): HCTの出典。', ''])
    generated[LLMS] = '\n'.join(lines)
    return generated


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Report stale or missing outputs without writing')
    args = parser.parse_args()
    generated = outputs()
    changed = [path for path, text in generated.items() if not path.is_file() or path.read_text() != text]
    if args.check:
        if changed:
            print('AI docs are out of date:\n' + '\n'.join(str(path.relative_to(ROOT)) for path in changed))
            return 1
        print('AI docs are up to date.')
        return 0
    for path in changed:
        path.write_text(generated[path])
    print(f'Generated llms.txt and {sum(path.name.endswith(".html.md") for path in generated)} Markdown pages; updated {len(changed)} files.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
