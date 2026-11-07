"""The committed docs snapshot can be refreshed without npm or a root index."""
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


class StandaloneDocsBuildTests(unittest.TestCase):
    def test_screen_samples_are_extracted_from_sources(self):
        import importlib.util
        spec = importlib.util.spec_from_file_location('screen_build', ROOT / 'scripts/build-docs.py')
        build = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(build)
        samples = build.screen_samples()
        self.assertEqual(len(samples), 13)
        for path, expected in samples.items():
            self.assertEqual(path.read_bytes(), expected)
            self.assertEqual((ROOT / 'docs/skills/kav-ui/samples/html' / path.name).read_bytes(), expected)

    def test_check_is_non_mutating_and_build_refreshes_only_managed_copies(self):
        with tempfile.TemporaryDirectory() as directory:
            copied = Path(directory)
            for name in ('docs', 'assets', 'skills'):
                shutil.copytree(ROOT / name, copied / name)
            for directory in ('components/samples', 'pages/samples'):
                shutil.copytree(ROOT / 'examples/astro/src' / directory,
                                copied / 'examples/astro/src' / directory)
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
            # Both copied fragments and their source region participate in --check.
            sample = copied / 'skills/kav-ui/samples/html/settings.html'
            original_sample = sample.read_bytes()
            sample.write_bytes(original_sample + b'<!-- drift -->')
            self.assertEqual(run('--check').returncode, 1)
            self.assertTrue(sample.read_bytes().endswith(b'<!-- drift -->'))
            self.assertEqual(run().returncode, 0)
            self.assertEqual(sample.read_bytes(), original_sample)
            template = copied / 'docs/templates/settings.html'
            template.write_text(template.read_text().replace('ワークスペース名', '制作室の名前'))
            self.assertEqual(run('--check').returncode, 1)
            self.assertEqual(run().returncode, 0)
            self.assertIn('制作室の名前', sample.read_text())
            self.assertEqual(run('--check').returncode, 0)
            for framework, directory in (('vue', 'components'), ('astro', 'pages')):
                source = copied / f'examples/astro/src/{directory}/samples/settings.{framework}'
                sample = copied / f'skills/kav-ui/samples/{framework}/settings.{framework}'
                original = source.read_bytes()
                sample.write_bytes(original + b'\n<!-- copy drift -->')
                self.assertEqual(run('--check').returncode, 1)
                self.assertEqual(run().returncode, 0)
                self.assertEqual(sample.read_bytes(), original)
                source.write_bytes(original + b'\n<!-- source drift -->')
                self.assertEqual(run('--check').returncode, 1)
                self.assertEqual(run().returncode, 0)
                self.assertEqual(sample.read_bytes(), source.read_bytes())
                stale_sample = sample.with_name('obsolete.' + framework)
                stale_sample.write_text('obsolete')
                self.assertEqual(run('--check').returncode, 1)
                self.assertEqual(run().returncode, 0)
                self.assertFalse(stale_sample.exists())
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
