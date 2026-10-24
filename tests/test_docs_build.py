"""The committed docs snapshot can be refreshed without npm or a root index."""
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


class StandaloneDocsBuildTests(unittest.TestCase):
    def test_check_is_non_mutating_and_build_refreshes_only_managed_copies(self):
        with tempfile.TemporaryDirectory() as directory:
            copied = Path(directory)
            for name in ('docs', 'assets', 'skills'):
                shutil.copytree(ROOT / name, copied / name)
            (copied / 'scripts').mkdir()
            for name in ('build-docs.py', 'generate-ai-docs.py'):
                shutil.copy2(ROOT / 'scripts' / name, copied / 'scripts' / name)
            for name in ('README.md', 'vue/README.md', 'astro/README.md'):
                target = copied / 'packages' / name
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(ROOT / 'packages' / name, target)

            def run(*args):
                return subprocess.run([sys.executable, str(copied / 'scripts/build-docs.py'), *args],
                                      cwd=copied, text=True, capture_output=True)

            self.assertEqual(run('--check').returncode, 0)
            source = copied / 'assets/js/ui.js'
            target = copied / 'docs/assets/ui/js/ui.js'
            original = target.read_bytes()
            source.write_bytes(source.read_bytes() + b'\n/* Updated source fixture */\n')
            stale = copied / 'docs/assets/ui/obsolete.css'
            stale.write_text('/* Removed public asset */')
            custom = copied / 'docs/assets/js/custom-example.js'
            custom.write_text('/* Catalog-owned example */')
            check = run('--check')
            self.assertEqual(check.returncode, 1, check.stderr)
            self.assertIn('docs/assets/ui/js/ui.js', check.stdout)
            self.assertEqual(target.read_bytes(), original)
            self.assertTrue(stale.exists())
            built = run()
            self.assertEqual(built.returncode, 0, built.stderr)
            self.assertEqual(source.read_bytes(), target.read_bytes())
            self.assertFalse(stale.exists())
            self.assertEqual(custom.read_text(), '/* Catalog-owned example */')
            self.assertFalse((copied / 'index.html').exists())
            self.assertEqual(run('--check').returncode, 0)
