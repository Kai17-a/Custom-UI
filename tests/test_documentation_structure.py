"""Documentation/runtime boundaries and local references; standard library only."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import re
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
    def test_documentation_has_its_own_entry_and_assets(self):
        for name in ('index.html', 'installation.html', 'getting-started.html', 'starter.html',
                     'components/buttons.html', 'templates/dashboard.html',
                     'assets/css/catalog.css', 'assets/css/icons.css', 'assets/js/catalog-demo.js'):
            self.assertTrue((DOCS / name).is_file(), name)
        self.assertIn('docs/index.html', (ROOT / 'index.html').read_text())
        self.assertFalse((ROOT / 'components').exists())

    def test_catalog_navigation_lists_every_component(self):
        destinations = {p.name for p in (DOCS / 'components').glob('*.html') if p.name != 'preview.html'}
        for page in DOCS.rglob('*.html'):
            match = re.search(r'<nav aria-label="コンポーネント">(.*?)</nav>', page.read_text(), re.S)
            if not match:
                continue
            links = re.findall(r'<a href="([^"]+)"([^>]*)>', match.group(1))
            self.assertEqual({Path(href).name for href, _ in links}, destinations, str(page))
            self.assertEqual(len(links), len(destinations), str(page))
            if page.parent == DOCS / 'components' and page.name != 'preview.html':
                self.assertEqual([Path(href).name for href, attrs in links if 'aria-current="page"' in attrs], [page.name])

    def test_documentation_local_references_resolve(self):
        pages = [ROOT / 'index.html', *DOCS.rglob('*.html'), *(ROOT / 'tests').glob('*.html')]
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
