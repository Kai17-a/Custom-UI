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
            'ナビゲーション': {'navigation.html', 'sidebar.html', 'command.html', 'dropdown.html', 'disclosure.html'},
            '通知・補助表示': {'alerts.html', 'banner.html', 'toasts.html', 'tips.html', 'popover.html', 'dialog.html', 'drawer.html'},
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
