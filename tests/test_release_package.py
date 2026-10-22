"""Distribution checks; Python standard library only, no publishing or network."""
import hashlib
import re
import subprocess
import sys
import tempfile
import unittest
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / 'scripts/build-release.py'


class ReleasePackageTests(unittest.TestCase):
    def build(self, directory, version='v1.2.3', source=ROOT):
        return subprocess.run(
            [sys.executable, str(SCRIPT), '--version', version,
             '--output', str(directory), '--source', str(source)],
            capture_output=True, text=True, check=False,
        )

    def test_archive_contains_runtime_and_resolves_css_imports(self):
        with tempfile.TemporaryDirectory() as temporary:
            result = self.build(temporary)
            self.assertEqual(result.returncode, 0, result.stderr)
            archive = Path(temporary) / 'kav-ui-v1.2.3.zip'
            with zipfile.ZipFile(archive) as package:
                names = set(package.namelist())
                self.assertIn('kav-ui/assets/css/ui.css', names)
                self.assertIn('kav-ui/assets/js/ui.js', names)
                self.assertIn('kav-ui/assets/js/theme-init.js', names)
                self.assertIn('kav-ui/assets/vendor/material-color-utilities/LICENSE', names)
                self.assertIn('kav-ui/assets/vendor/material-color-utilities/README.md', names)
                self.assertIn('kav-ui/assets/icons/mdi/LICENSE', names)
                self.assertIn('kav-ui/assets/icons/mdi/README.md', names)
                self.assertIn('kav-ui/assets/icons/mdi/Apache-2.0.txt', names)
                self.assertIn('kav-ui/README.md', names)
                self.assertEqual(package.read('kav-ui/VERSION'), b'v1.2.3\n')
                self.assertFalse(any('catalog' in name or 'templates' in name for name in names))
                self.assertEqual(package.read('kav-ui/assets/js/ui.js'), (ROOT / 'assets/js/ui.js').read_bytes())
                for name in names:
                    self.assertFalse(name.startswith('/') or '..' in Path(name).parts)
                    if name.endswith('.css'):
                        css = package.read(name).decode()
                        for imported in re.findall(r'@import url\("([^"]+)"\)', css):
                            target = (Path(name).parent / imported).as_posix()
                            self.assertIn(target, names, f'Missing CSS dependency: {target}')
                checksum = archive.with_suffix('.zip.sha256').read_text()
                self.assertEqual(checksum, hashlib.sha256(archive.read_bytes()).hexdigest() + '  ' + archive.name + '\n')

    def test_same_source_and_version_produce_identical_zip(self):
        with tempfile.TemporaryDirectory() as first, tempfile.TemporaryDirectory() as second:
            self.assertEqual(self.build(first, 'v1.0.0-rc.1').returncode, 0)
            self.assertEqual(self.build(second, 'v1.0.0-rc.1').returncode, 0)
            self.assertEqual((Path(first) / 'kav-ui-v1.0.0-rc.1.zip').read_bytes(),
                             (Path(second) / 'kav-ui-v1.0.0-rc.1.zip').read_bytes())

    def test_invalid_tag_is_rejected_before_writing(self):
        with tempfile.TemporaryDirectory() as temporary:
            for tag in ['main', '../../escape', 'v1.0.0;echo bad', '-v1.0.0', 'v1.0']:
                with self.subTest(tag=tag):
                    result = self.build(temporary, tag)
                    self.assertNotEqual(result.returncode, 0)
                    self.assertEqual(list(Path(temporary).iterdir()), [])

    def test_missing_or_escaping_dependency_fails_without_artifact(self):
        with tempfile.TemporaryDirectory() as source, tempfile.TemporaryDirectory() as output:
            source = Path(source)
            (source / 'assets/css').mkdir(parents=True)
            (source / 'assets/js').mkdir()
            (source / 'assets/icons/mdi').mkdir(parents=True)
            (source / 'assets/js/ui.js').write_text('/* example */')
            (source / 'assets/icons/mdi/LICENSE').write_text('Test notice')
            (source / 'assets/icons/mdi/Apache-2.0.txt').write_text('Test license')
            (source / 'assets/icons/mdi/README.md').write_text('Test credits')
            (source / 'README.md').write_text('Test instructions')
            for imported in ['missing.css', '../../private.css', 'https://example.test/style.css']:
                with self.subTest(imported=imported):
                    (source / 'assets/css/ui.css').write_text(f'@import url("{imported}");')
                    result = self.build(output, source=source)
                    self.assertNotEqual(result.returncode, 0)
                    self.assertEqual(list(Path(output).iterdir()), [])


if __name__ == '__main__':
    unittest.main()
