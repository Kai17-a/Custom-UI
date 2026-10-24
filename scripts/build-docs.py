#!/usr/bin/env python3
"""Synchronize the standalone docs site. Python stdlib only; never uploads files."""
from __future__ import annotations
import argparse
import importlib.util
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'docs'
MANAGED = (DOCS / 'assets/ui', DOCS / 'skills/kav-ui', DOCS / 'packages')


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
