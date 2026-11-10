"""Documentation/runtime boundaries and local references; standard library only."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import re
import shutil
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'docs'


class References(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []

    def handle_starttag(self, tag, attrs):
        for name, value in attrs:
            if value and name in ('href', 'src', 'poster', 'action'):
                self.urls.append(value)


class DocumentationStructureTests(unittest.TestCase):
    def test_preview_page_is_removed(self):
        self.assertFalse((DOCS / 'components/preview.html').exists())
        for page in DOCS.rglob('*.html'):
            self.assertNotIn('preview.html', page.read_text(), str(page.relative_to(ROOT)))

    def test_catalog_categories_are_consistent_and_group_related_components(self):
        expected = {
            'ナビゲーション': {'navigation.html', 'sidebar.html', 'command.html', 'dropdown.html', 'disclosure.html', 'power-search.html', 'context-menu.html'},
            '通知・補助表示': {'alerts.html', 'banner.html', 'toasts.html', 'tips.html', 'popover.html', 'dialog.html', 'drawer.html', 'tour.html'},
            'AI・ワークフロー': {'agent-workflow.html', 'ai-visuals.html'},
        }
        reference = None
        for page in DOCS.rglob('*.html'):
            nav = re.search(r'<nav aria-label="コンポーネント">(.*?)</nav>', page.read_text(), re.S)
            if not nav:
                continue
            groups = re.findall(r'<div class="catalog-nav-group">\s*<h2>(.*?)</h2>(.*?)</div>', nav.group(1), re.S)
            categories = {name: tuple(Path(href).name for href in re.findall(r'<a href="([^"]+)"', content))
                          for name, content in groups}
            self.assertEqual(len(groups), len(categories), str(page))
            for name, components in expected.items():
                self.assertEqual(set(categories.get(name, ())), components, (page, name))
            if reference is None:
                reference = categories
            self.assertEqual(list(categories.items()), list(reference.items()), str(page))
        self.assertIsNotNone(reference)

    def test_home_groups_follow_sidebar_and_preserve_destinations(self):
        source = (DOCS / 'index.html').read_text()
        nav = re.search(r'<nav aria-label="コンポーネント">(.*?)</nav>', source, re.S).group(1)
        categories = re.findall(r'<div class="catalog-nav-group">\s*<h2>(.*?)</h2>(.*?)</div>', nav, re.S)
        main = source.split('<main', 1)[1]
        groups = re.findall(r'<section class="specimen"[^>]*>\s*<h2>(.*?)</h2>\s*<div class="catalog-grid">(.*?)</div>\s*</section>', main, re.S)
        self.assertEqual([name for name, _ in groups], [name for name, _ in categories])
        self.assertNotIn('card-number', main)
        cards = []
        for (name, content), (_, navigation) in zip(groups, categories):
            links = re.findall(r'href="([^"]+)"', content)
            nav_links = re.findall(r'href="([^"]+)"', navigation)
            self.assertTrue(links, name)
            self.assertEqual(links, [href for href in nav_links if href in links], name)
            self.assertEqual(len(links), content.count('data-catalog-item'), name)
            self.assertNotIn('<h2>', content)
            cards.extend(links)
        self.assertGreaterEqual(len(cards), 46)
        self.assertEqual(len(set(cards)), len(cards))

    def test_home_has_live_design_preview(self):
        source = (DOCS / 'index.html').read_text()
        match = re.search(r'<section[^>]*aria-label="デザインと配色の見本"[^>]*>(.*?)</section>', source, re.S)
        self.assertIsNotNone(match, 'Home needs a live design preview')
        preview = match.group(1)
        # The switches sit in the copy column, in their own labelled group.
        controls = re.search(r'<div class="ui-stack catalog-hero-controls" role="group" aria-label="見本のデザインと配色を切り替える">(.*?)\n</div>\n</div>\n<section', source, re.S)
        self.assertIsNotNone(controls, 'Home needs labelled design switches')
        switches = controls.group(1)
        self.assertEqual(re.findall(r'data-ui-design="([^"]+)"', switches),
                         ['default', 'glass', 'glassmorphism', 'flat', 'soft'])
        self.assertEqual(re.findall(r'data-ui-palette-value="([^"]+)"', switches),
                         ['default', 'slate', 'sage', 'teal', 'mauve', 'sand', 'clay'])
        self.assertIn('data-ui-toggle="theme"', switches)
        self.assertIn('data-ui-theme-icon', switches)
        ids = re.findall(r'\bid="([^"]+)"', source)
        self.assertEqual(len(ids), len(set(ids)), 'IDs must remain unique on the home page')
        for target in re.findall(r'<label[^>]*for="([^"]+)"', preview):
            self.assertIn(target, ids)


    def test_home_entry_points_precede_component_groups(self):
        main = (DOCS / 'index.html').read_text().split('<main', 1)[1]
        first_group = main.index('<section')
        for href in ('templates.html', 'getting-started.html'):
            self.assertLess(main.index('href="' + href + '"'), first_group)

    def test_top_level_overview_marks_only_current_page(self):
        for name in ('index.html', 'getting-started.html', 'installation.html', 'ai-agents.html', 'templates.html'):
            source = (DOCS / name).read_text()
            links = re.findall(r'<a class="overview-link" href="([^"]+)"([^>]*)>', source)
            self.assertTrue(all(attrs.count('aria-current="page"') <= 1 for _, attrs in links), name)
            self.assertEqual([href for href, attrs in links if 'aria-current="page"' in attrs], [name], name)

    def test_internal_catalog_links_do_not_use_external_arrow(self):
        for page in [*DOCS.glob('*.html'), *(DOCS / 'components').glob('*.html')]:
            for href, text in re.findall(r'<a[^>]+href="([^"]+)"[^>]*>(.*?)</a>', page.read_text(), re.S):
                if not urlsplit(href).scheme and not href.startswith('//'):
                    self.assertNotIn('↗', text, (page.name, href))

    def test_template_cards_name_screen_types_and_share_action(self):
        source = (DOCS / 'templates.html').read_text()
        cards = dict(re.findall(r'<a class="catalog-card" href="templates/([^"]+)">(.*?)</a>', source, re.S))
        for file, title in {'profile.html': 'プロフィール', 'detail.html': '詳細', 'pricing.html': '料金プラン', 'auth.html': 'ログイン・新規登録', 'empty-onboarding.html': 'オンボーディング', 'ai-chat.html': 'AIチャット'}.items():
            self.assertIn('<h3>' + title + '</h3>', cards[file])
        for content in cards.values():
            self.assertIn('<span class="card-link">画面を開く →</span>', content)
        for file, name in {'profile.html': 'こもれび', 'detail.html': '秋の展示会', 'pricing.html': 'チームに合うプラン'}.items():
            self.assertRegex(cards[file], r'<p>[^<]*' + name)

    def test_retired_app_sample_is_not_published(self):
        self.assertFalse((DOCS / 'starter.html').exists())
        self.assertFalse((DOCS / 'starter.html.md').exists())
        for path in DOCS.rglob('*'):
            if path.is_file() and path.suffix in ('.html', '.md', '.txt'):
                self.assertNotIn('starter.html', path.read_text(), str(path.relative_to(ROOT)))

    def test_docs_copy_resolves_without_repository_files(self):
        with tempfile.TemporaryDirectory() as directory:
            copied = Path(directory) / 'site'
            shutil.copytree(DOCS, copied)
            for page in copied.rglob('*'):
                if page.suffix == '.html':
                    parser = References()
                    parser.feed(page.read_text())
                    urls = parser.urls
                elif page.suffix == '.css':
                    urls = re.findall(r'url\([\'"]?([^\'"()]+)[\'"]?\)', page.read_text())
                elif page.suffix in ('.md', '.txt'):
                    source = re.sub(r'(?ms)^(`{3,})[^\n]*\n.*?^\1\s*$', '', page.read_text())
                    urls = re.findall(r'\[[^\]\n]*\]\(([^)\s]+)\)', source)
                else:
                    continue
                for value in urls:
                    url = urlsplit(value)
                    if url.scheme or url.netloc or not url.path or url.path.startswith('/'):
                        continue
                    target = (page.parent / unquote(url.path)).resolve()
                    self.assertTrue(target.is_relative_to(copied), (page.relative_to(copied), value))
                    self.assertTrue(target.is_file(), (page.relative_to(copied), value))

    def test_public_runtime_and_skill_match_their_sources(self):
        for source, destination in [(ROOT / 'assets', DOCS / 'assets/ui'),
                                    (ROOT / 'skills/kav-ui', DOCS / 'skills/kav-ui')]:
            for path in source.rglob('*'):
                if path.is_file():
                    target = destination / path.relative_to(source)
                    self.assertTrue(target.is_file(), str(target.relative_to(ROOT)))
                    self.assertEqual(path.read_bytes(), target.read_bytes(), str(path.relative_to(ROOT)))

    def test_documentation_has_its_own_entry_and_assets(self):
        for name in ('index.html', 'installation.html', 'getting-started.html',
                     'components/buttons.html', 'templates/dashboard.html',
                     'assets/css/catalog.css', 'assets/css/icons.css', 'assets/js/catalog-demo.js'):
            self.assertTrue((DOCS / name).is_file(), name)
        self.assertFalse((ROOT / 'index.html').exists())
        self.assertFalse((ROOT / 'components').exists())

    def test_every_template_is_listed(self):
        index = (DOCS / 'templates.html').read_text()
        for page in (DOCS / 'templates').glob('*.html'):
            self.assertIn('href="templates/' + page.name + '"', index)

    def test_catalog_navigation_lists_every_component(self):
        destinations = {p.name for p in (DOCS / 'components').glob('*.html')}
        for page in DOCS.rglob('*.html'):
            match = re.search(r'<nav aria-label="コンポーネント">(.*?)</nav>', page.read_text(), re.S)
            if not match:
                continue
            links = re.findall(r'<a href="([^"]+)"([^>]*)>', match.group(1))
            self.assertEqual({Path(href).name for href, _ in links}, destinations, str(page))
            self.assertEqual(len(links), len(destinations), str(page))
            if page.parent == DOCS / 'components':
                self.assertEqual([Path(href).name for href, attrs in links if 'aria-current="page"' in attrs], [page.name])

    def test_documentation_local_references_resolve(self):
        pages = [*DOCS.rglob('*.html'), *(ROOT / 'tests').glob('*.html')]
        self.assertGreater(len(pages), 40)
        for page in pages:
            parser = References()
            parser.feed(page.read_text())
            for value in parser.urls:
                url = urlsplit(value)
                if url.scheme or url.netloc or not url.path or url.path.startswith('/'):
                    continue
                target = (page.parent / unquote(url.path)).resolve()
                self.assertTrue(target.is_relative_to(ROOT), (page, value))
                self.assertTrue(target.is_file(), (page.relative_to(ROOT), value))
        for css in (DOCS / 'assets/css').glob('*.css'):
            for value in re.findall(r'url\([\'"]?([^\'"()]+)[\'"]?\)', css.read_text()):
                if value.startswith(('data:', '#')):
                    continue
                self.assertTrue((css.parent / value).is_file(), (css, value))

    def test_runtime_does_not_import_documentation(self):
        seen = set()

        def visit(path):
            path = path.resolve()
            self.assertTrue(path.is_relative_to(ROOT / 'assets'), path)
            if path in seen:
                return
            seen.add(path)
            for dependency in re.findall(r'@import\s+url\([\'"]([^\'"]+)[\'"]\)', path.read_text()):
                visit(path.parent / dependency)

        visit(ROOT / 'assets/css/ui.css')
        self.assertGreater(len(seen), 30)
        self.assertEqual(seen, {p.resolve() for p in (ROOT / 'assets/css').rglob('*.css')})
        for name in ('catalog.js', 'catalog-demo.js', 'catalog-navigation.js', 'templates.js'):
            self.assertFalse((ROOT / 'assets/js' / name).exists(), name)


if __name__ == '__main__':
    unittest.main()


class CatalogConsistencyTests(unittest.TestCase):
    """P3 polish: one eyebrow rule, one related-link position, spacing on the 4px scale."""

    def test_eyebrows_follow_the_navigation_labels(self):
        root = Path(__file__).resolve().parents[1] / 'docs'
        index = (root / 'index.html').read_text()
        # Allowed labels are the sidebar's category headings and overview links.
        labels = set(re.findall(r'<div class="catalog-nav-group">\s*<h2>([^<]+)</h2>', index))
        labels |= {re.sub(r'\s*→$', '', text) for text in re.findall(r'<a class="overview-link"[^>]*>([^<]+)</a>', index)}
        for page in [*root.glob('*.html'), *(root / 'components').glob('*.html')]:
            heading = re.search(r'<header class="page-heading">\s*<p class="eyebrow">([^<]*)</p>', page.read_text())
            with self.subTest(page=page.name):
                self.assertIsNotNone(heading)
                self.assertTrue(heading.group(1).startswith('Kav-UI / '))
                self.assertIn(heading.group(1).removeprefix('Kav-UI / '), labels)
        for page in (root / 'templates').glob('*.html'):
            for eyebrow in re.findall(r'<p class="ui-page-eyebrow">([^<]*)</p>', page.read_text()):
                with self.subTest(page=page.name):
                    self.assertEqual(eyebrow, '木の葉制作室')

    def test_related_links_follow_the_lede(self):
        root = Path(__file__).resolve().parents[1] / 'docs/components'
        before = re.compile(r'</header>\s*<p>\s*<a [^>]*>[^<]*</a>\s*</p>\s*<p class="lede">')
        self.assertEqual([p.name for p in root.glob('*.html') if before.search(p.read_text())], [])

    def test_catalog_spacing_uses_the_4px_scale(self):
        css = (Path(__file__).resolve().parents[1] / 'docs/assets/css/layout.css').read_text()
        odd = re.findall(r'(?:margin|padding|gap|inset-block)[a-z-]*:[^;{}]*?(?<![\d.])(?:5|7|9|15)px', css)
        self.assertEqual(odd, [])

    def test_search_inputs_have_names(self):
        root = Path(__file__).resolve().parents[1] / 'docs/templates'
        for page in root.glob('*.html'):
            for tag in re.findall(r'<input[^>]*type="search"[^>]*>', page.read_text()):
                with self.subTest(page=page.name):
                    self.assertIn(' name="', tag)
                    self.assertIn('autocomplete="off"', tag)


class UnslopTests(unittest.TestCase):
    """Catalog chrome stays quiet: no tracked uppercase labels, real copy in examples."""
    root = Path(__file__).resolve().parents[1]

    def test_labels_are_not_tracked_uppercase(self):
        css = (self.root / 'docs/assets/css/layout.css').read_text()
        spacing = [float(value) for value in re.findall(r'\.eyebrow[^{]*\{[^}]*letter-spacing:([\d.]+)em', css)]
        self.assertTrue(spacing)
        self.assertTrue(all(value <= .02 for value in spacing), spacing)
        for page in [*(self.root / 'docs').glob('*.html'), *(self.root / 'docs/components').glob('*.html')]:
            with self.subTest(page=page.name):
                self.assertNotIn('<p class="eyebrow">COMPONENTS</p>', page.read_text())

    def test_badges_use_semibold_and_real_statuses(self):
        self.assertIn('font-weight: 600', (self.root / 'assets/css/components/badges.css').read_text().split('\n')[1])
        badges = (self.root / 'docs/components/badges.html').read_text()
        for word in ('進行中', '確認待ち', '完了', 'エラー'):
            self.assertIn(f'>{word}</span>', badges)
        self.assertNotIn('>danger</span>', badges)

    def test_section_headings_and_cards_say_what_they_show(self):
        workflow = (self.root / 'docs/components/agent-workflow.html').read_text()
        self.assertEqual(re.findall(r'<h2>([A-Za-z ]+)</h2>', workflow), [])
        self.assertNotIn('サンプルを見る', (self.root / 'docs/index.html').read_text())
