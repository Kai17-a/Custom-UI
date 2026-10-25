#!/usr/bin/env python3
"""Synchronize the standalone docs site. Python stdlib only; never uploads files."""
from __future__ import annotations
import argparse
import json
from html.parser import HTMLParser
import importlib.util
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'docs'
MANAGED = (DOCS / 'assets/ui', DOCS / 'skills/kav-ui', DOCS / 'packages')


class CatalogSearch(HTMLParser):
    """Use index card descriptions and aliases for both catalog searches."""
    def __init__(self):
        super().__init__()
        self.cards = {}
        self.card = None
        self.text = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'a' and 'data-catalog-item' in attrs:
            self.card = Path(attrs['href']).name
            self.text = [attrs.get('data-catalog-keywords', '')]

    def handle_data(self, data):
        if self.card:
            self.text.append(data)

    def handle_endtag(self, tag):
        if tag == 'a' and self.card:
            self.cards[self.card] = ' '.join(' '.join(self.text).split())
            self.card = None


def catalog_search_script():
    parser = CatalogSearch()
    parser.feed((DOCS / 'index.html').read_text())
    data = json.dumps(parser.cards, ensure_ascii=False, sort_keys=True)
    return ('''/* Generated from docs/index.html by scripts/build-docs.py. */
(() => {
  const metadata = ''' + data + ''';
  const normalize = text => String(text || '').normalize('NFKC').toLowerCase().trim();
  function matches(link, query) {
    const filename = new URL(link.getAttribute('href'), document.baseURI).pathname.split('/').pop();
    const text = normalize(metadata[filename] || `${link.textContent} ${filename}`);
    return normalize(query).split(/\\s+/).every(word => text.includes(word));
  }
  window.KavCatalogSearch = Object.freeze({normalize, matches});
})();
''').encode()


def public_files():
    files = {}
    for source, destination in ((ROOT / 'assets', MANAGED[0]),
                                (ROOT / 'skills/kav-ui', MANAGED[1])):
        for path in source.rglob('*'):
            if path.is_file():
                files[destination / path.relative_to(source)] = path.read_bytes()
    for name in ('README.md', 'vue/README.md', 'astro/README.md'):
        source = ROOT / 'packages' / name
        # The package guide links back to the catalog, which is now the site root.
        text = source.read_text().replace('](../docs/index.html)', '](../index.html)')
        files[MANAGED[2] / name] = text.encode()
    files[DOCS / 'assets/js/catalog-search.js'] = catalog_search_script()
    return files


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Check without changing files')
    args = parser.parse_args()
    files = public_files()
    # These directories contain generated copies only; preserve every other docs file.
    stale = [path for directory in MANAGED for path in directory.rglob('*')
             if path.is_file() and path not in files]
    changed = [path for path, data in files.items()
               if not path.is_file() or path.read_bytes() != data]

    spec = importlib.util.spec_from_file_location('kav_ai_docs', ROOT / 'scripts/generate-ai-docs.py')
    generator = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = generator
    spec.loader.exec_module(generator)
    generated = generator.outputs()
    markdown_changes = [path for path, value in generated.items()
                        if not path.is_file() or path.read_text() != value]
    if args.check:
        pending = [*changed, *stale, *markdown_changes]
        if pending:
            print('Docs are out of date:\n' + '\n'.join(str(path.relative_to(ROOT)) for path in pending))
            return 1
        print('Standalone docs are up to date.')
        return 0
    for path in stale:
        path.unlink()
    for path in changed:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(files[path])
    for path in markdown_changes:
        path.write_text(generated[path])
    print(f'Synchronized {len(files)} public assets/guides; updated {len(changed) + len(markdown_changes)} files.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
