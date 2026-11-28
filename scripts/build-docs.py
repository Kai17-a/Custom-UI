#!/usr/bin/env python3
"""Prepare public assets and generated guides for the Astro build."""
from __future__ import annotations
import argparse
import json
import re
from html.parser import HTMLParser
import importlib.util
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / 'dist/docs'
ASSETS = ROOT / 'docs/assets'
SAMPLE_ROOT = ROOT / 'skills/kav-ui/samples'
SAMPLES = SAMPLE_ROOT / 'html'
MANAGED_DIRS = ('assets/ui', 'skills/kav-ui', 'packages')


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


def catalog_search_script(site_dir=SITE):
    parser = CatalogSearch()
    parser.feed((site_dir / 'index.html').read_text())
    data = json.dumps(parser.cards, ensure_ascii=False, sort_keys=True)
    return ('''/* Generated from the rendered catalog by scripts/build-docs.py. */
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


def class_inventory():
    """The skill's markup checker ships a class list built from assets/css for copies without the CSS."""
    spec = importlib.util.spec_from_file_location('kav_check_markup', ROOT / 'skills/kav-ui/scripts/check_markup.py')
    checker = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = checker
    # Keep the published skill free of bytecode caches.
    previous, sys.dont_write_bytecode = sys.dont_write_bytecode, True
    try:
        spec.loader.exec_module(checker)
    finally:
        sys.dont_write_bytecode = previous
    return (json.dumps(checker.build_inventory(ROOT / 'assets/css/ui.css'), indent=1) + '\n').encode()


def screen_samples(site_dir=SITE):
    """Extract app-only fragments from marked template sources; no catalog assets."""
    files = {}
    for page in sorted((site_dir / 'templates').glob('*.html')):
        source = page.read_text()
        start, end = '<!-- kav-sample:start -->', '<!-- kav-sample:end -->'
        if start not in source and end not in source:
            continue
        if source.count(start) != 1 or source.count(end) != 1:
            raise ValueError('Expected exactly one sample region: ' + str(page))
        match = re.search(re.escape(start) + r'(.*?)' + re.escape(end), source, re.S)
        if match is None or not match[1].strip():
            raise ValueError('Invalid sample region: ' + str(page))
        files[SAMPLES / page.name] = (match[1].strip() + '\n').encode()
    return files


def framework_samples():
    """Copy the compiled example sources verbatim, including public imports."""
    files = {}
    for framework, directory in (
            ('vue', 'examples/astro/src/components/samples'),
            ('astro', 'examples/astro/src/pages/samples')):
        for source in sorted((ROOT / directory).glob('*.' + framework)):
            files[SAMPLE_ROOT / framework / source.name] = source.read_bytes()
    return files


def public_files(site_dir=SITE):
    files = {}
    ui_dir, skill_dir, package_dir = (site_dir / name for name in MANAGED_DIRS)
    for path in ASSETS.rglob('*'):
        if path.is_file():
            files[site_dir / 'assets' / path.relative_to(ASSETS)] = path.read_bytes()
    for source, destination in ((ROOT / 'assets', ui_dir),
                                (ROOT / 'skills/kav-ui', skill_dir)):
        for path in source.rglob('*'):
            # Importing the skill's checker leaves bytecode caches that are not part of the skill.
            if (path.is_file() and '__pycache__' not in path.relative_to(source).parts
                    and not (source == ROOT / 'skills/kav-ui' and path.is_relative_to(SAMPLE_ROOT))):
                files[destination / path.relative_to(source)] = path.read_bytes()
    for name in ('README.md', 'vue/README.md', 'astro/README.md'):
        source = ROOT / 'packages' / name
        # The package guide links back to the catalog, which is now the site root.
        text = source.read_text().replace('](../docs/src/pages/index.astro)', '](../index.html)')
        files[package_dir / name] = text.encode()
    files[site_dir / 'assets/js/catalog-search.js'] = catalog_search_script(site_dir)
    inventory = class_inventory()
    files[skill_dir / 'scripts/kav-ui-classes.json'] = inventory
    # Build public skill samples from their sources.
    for path, data in (screen_samples(site_dir) | framework_samples()).items():
        files[skill_dir / path.relative_to(ROOT / 'skills/kav-ui')] = data
    return files


def sync_skill(site_dir):
    """Refresh the generated files shipped with the standalone skill."""
    public_skill = site_dir / 'skills/kav-ui'
    skill = ROOT / 'skills/kav-ui'
    inventory = 'scripts/kav-ui-classes.json'
    files = {skill / inventory: (public_skill / inventory).read_bytes()}
    for source in (public_skill / 'samples').rglob('*'):
        if source.is_file():
            files[skill / source.relative_to(public_skill)] = source.read_bytes()
    for path, data in files.items():
        if not path.is_file() or path.read_bytes() != data:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)
    for path in SAMPLE_ROOT.rglob('*'):
        if path.is_file() and path not in files:
            path.unlink()
    print('Refreshed generated skill files in skills/kav-ui.')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Check without changing files')
    parser.add_argument('--site-dir', type=Path, default=SITE, help='Directory containing rendered HTML')
    parser.add_argument('--sync-skill', action='store_true', help='Refresh the standalone skill from the built site')
    args = parser.parse_args()
    site_dir = args.site_dir.resolve()
    if not (site_dir / 'index.html').is_file():
        parser.error(f'No rendered index.html in {site_dir}')
    if args.sync_skill:
        if args.check:
            parser.error('--sync-skill requires write mode')
        sync_skill(site_dir)
        return 0
    files = public_files(site_dir)
    spec = importlib.util.spec_from_file_location('kav_ai_docs', ROOT / 'scripts/generate-ai-docs.py')
    generator = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = generator
    spec.loader.exec_module(generator)
    data = {}
    for page in sorted((site_dir / 'components').glob('*.html')):
        source = page.read_text()
        data[page.name] = generator.component_samples.page_data(page.stem, generator.Document(source))
    files[site_dir / 'assets/js/component-code-samples.js'] = ('// Generated by scripts/build-docs.py.\nwindow.KavComponentCodeSamples = ' + json.dumps(data, ensure_ascii=False, indent=2) + ';\n').encode()
    managed = [site_dir / name for name in MANAGED_DIRS]
    stale = [path for directory in managed for path in directory.rglob('*')
             if path.is_file() and path not in files]
    changed = [path for path, data in files.items()
               if not path.is_file() or path.read_bytes() != data]

    generated = generator.outputs(site_dir)
    markdown_changes = [path for path, value in generated.items()
                        if not path.is_file() or path.read_text() != value]
    if args.check:
        pending = [*changed, *stale, *markdown_changes]
        if pending:
            print('Docs are out of date:\n' + '\n'.join(str(path.relative_to(ROOT) if path.is_relative_to(ROOT) else path) for path in pending))
            return 1
        print('Generated docs are up to date.')
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
