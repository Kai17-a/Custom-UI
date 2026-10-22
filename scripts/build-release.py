#!/usr/bin/env python3
"""Package the runtime dependency tree with Python's standard library only."""
import argparse
import hashlib
import re
import tempfile
import zipfile
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
VERSION = re.compile(r'v[0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z]+(?:[.-][0-9A-Za-z]+)*)?(?:\+[0-9A-Za-z]+(?:[.-][0-9A-Za-z]+)*)?')
IMPORT = re.compile(r'@import\s+(?:url\(\s*[\'\"]([^\'\"]+)[\'\"]\s*\)|[\'\"]([^\'\"]+)[\'\"])\s*;', re.I)
URL = re.compile(r'url\(\s*(?:"([^"]*)"|\'([^\']*)\'|([^\s\'\")]+))\s*\)', re.I)


def build_release(source, output, version):
    if len(version) > 128 or not VERSION.fullmatch(version):
        raise ValueError('Version must be a tag such as v1.2.3 or v1.2.3-rc.1.')
    source, output = Path(source).resolve(), Path(output).resolve()
    files, visiting = {}, set()
    css_root = (source / 'assets/css').resolve()

    def add_file(path):
        path = Path(path)
        resolved = path.resolve()
        if not resolved.is_relative_to(source) or not path.is_file():
            raise ValueError(f'Missing or out-of-tree file: {path}')
        relative = path.relative_to(source).as_posix()
        files[relative] = path.read_bytes()
        return relative

    def dependency(value, parent, boundary):
        url = urlsplit(value)
        if url.scheme or url.netloc or not url.path:
            raise ValueError(f'Only local file dependencies are supported: {value}')
        path = (parent / unquote(url.path)).resolve()
        if not path.is_relative_to(boundary):
            raise ValueError(f'Dependency escapes its asset directory: {value}')
        return path

    def add_css(path):
        path = path.resolve()
        if path in visiting:
            raise ValueError(f'Circular CSS import: {path}')
        relative = path.relative_to(source).as_posix()
        if relative in files:
            return
        visiting.add(path)
        css = re.sub(r'/\*.*?\*/', '', path.read_text(), flags=re.S)
        imports = list(IMPORT.finditer(css))
        if len(re.findall(r'@import\b', css, re.I)) != len(imports):
            raise ValueError(f'Unsupported CSS import syntax: {relative}')
        for match in imports:
            target = dependency(match[1] or match[2], path.parent, css_root)
            if target.suffix != '.css':
                raise ValueError(f'CSS import is not a stylesheet: {target}')
            add_css(target)
        # Keep any local images/fonts referenced by runtime CSS as well.
        resources = IMPORT.sub('', css)
        for match in URL.finditer(resources):
            value = next(group for group in match.groups() if group is not None)
            if value.startswith(('data:', '#')):
                continue
            add_file(dependency(value, path.parent, source / 'assets'))
        add_file(path)
        visiting.remove(path)

    add_css(source / 'assets/css/ui.css')
    for name in ('assets/js/ui.js', 'assets/js/theme-init.js',
                 'assets/vendor/material-color-utilities/LICENSE',
                 'assets/vendor/material-color-utilities/README.md', 'assets/icons/mdi/LICENSE', 'assets/icons/mdi/Apache-2.0.txt',
                 'assets/icons/mdi/README.md', 'README.md'):
        add_file(source / name)
    files['VERSION'] = (version + '\n').encode()
    output.mkdir(parents=True, exist_ok=True)
    archive = output / f'kav-ui-{version}.zip'
    checksum = archive.with_suffix('.zip.sha256')
    with tempfile.TemporaryDirectory(dir=output) as temporary:
        staged = Path(temporary) / archive.name
        with zipfile.ZipFile(staged, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as package:
            for name, content in sorted(files.items()):
                info = zipfile.ZipInfo('kav-ui/' + name, date_time=(1980, 1, 1, 0, 0, 0))
                info.create_system = 3
                info.external_attr = 0o100644 << 16
                info.compress_type = zipfile.ZIP_DEFLATED
                package.writestr(info, content)
        digest = hashlib.sha256(staged.read_bytes()).hexdigest()
        staged.replace(archive)
        checksum.write_text(digest + '  ' + archive.name + '\n')
    return archive, checksum


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--version', required=True, help='Existing release tag, e.g. v1.2.3')
    parser.add_argument('--output', type=Path, default=ROOT / 'dist')
    parser.add_argument('--source', type=Path, default=ROOT, help=argparse.SUPPRESS)
    args = parser.parse_args()
    try:
        paths = build_release(args.source, args.output, args.version)
    except (OSError, ValueError) as error:
        parser.exit(1, f'Cannot build release: {error}\n')
    for path in paths:
        print(path)


if __name__ == '__main__':
    main()
