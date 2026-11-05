"""Framework screen sources are compiled, portable, linked and synchronized."""
import importlib.util
from pathlib import Path
import re
import unittest
from test_ai_documentation import links

ROOT = Path(__file__).resolve().parents[1]
NAMES = ('settings', 'auth', 'list', 'detail', 'wizard', 'kanban', 'profile',
         'pricing', 'notifications', 'ai-chat', 'files', 'empty-onboarding')


class FrameworkSampleTests(unittest.TestCase):
    def test_sources_copies_imports_and_routes(self):
        skill = ROOT / 'skills/kav-ui'
        pending, reached = [skill / 'SKILL.md'], set()
        while pending:
            path = pending.pop().resolve()
            if path in reached:
                continue
            reached.add(path)
            if path.suffix == '.md':
                pending.extend((path.parent / link).resolve() for link in links(path)
                               if not re.match(r'\w+:|/|#', link))
        for framework in ('vue', 'astro'):
            samples = skill / 'samples' / framework
            self.assertEqual({p.stem for p in samples.iterdir()}, set(NAMES))
            for name in NAMES:
                suffix = '.' + framework
                source = ROOT / 'examples/astro/src' / (
                    f'components/samples/{name}.vue' if framework == 'vue'
                    else f'pages/samples/{name}.astro')
                bundled = samples / (name + suffix)
                with self.subTest(framework=framework, name=name):
                    self.assertIn(bundled.resolve(), reached)
                    self.assertEqual(source.read_bytes(), bundled.read_bytes())
                    self.assertEqual(source.read_bytes(), (ROOT / 'docs/skills/kav-ui/samples' / framework / bundled.name).read_bytes())
                    imports = re.findall(r'(?:from\s+|import\s*)[\'\"]([^\'\"]+)', source.read_text())
                    self.assertTrue(imports)
                    self.assertTrue(all(i in ('vue', '@kav-ui/vue', '@kav-ui/astro', '@kav-ui/core/style.css') for i in imports), imports)
                    self.assertNotRegex(source.read_text(), r'catalog-|data-demo-|<style|data-screen-sample|data-kav-ui-vue')
                    self.assertNotRegex(source.read_text(), r'<main[^>]*data-kav-ui-widget')
                    if framework == 'vue':
                        route = ROOT / f'examples/astro/src/pages/samples/vue/{name}.astro'
                        self.assertIn(f'components/samples/{name}.vue', route.read_text())
                        self.assertIn('client:load', route.read_text())
                        self.assertIn('lang="ts"', source.read_text())

    def test_generator_reads_framework_sources(self):
        spec = importlib.util.spec_from_file_location('framework_build', ROOT / 'scripts/build-docs.py')
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        files = module.framework_samples()
        self.assertEqual(len(files), 24)
        for path, data in files.items():
            self.assertEqual(path.read_bytes(), data)


class StatusBadgeTests(unittest.TestCase):
    """A status keeps one color across the catalog, templates and framework samples."""

    def test_each_status_uses_one_badge_color(self):
        pattern = re.compile(r'<span class="(badge[^"]*)">([^<]{1,8})</span>|<KavBadge color="([a-z]+)">([^<]{1,8})</KavBadge>')
        colors = {}
        sources = [*(ROOT / 'docs/templates').glob('*.html'), ROOT / 'docs/components/data-table.html',
                   *(ROOT / 'examples/astro/src').rglob('*.vue'), *(ROOT / 'examples/astro/src').rglob('*.astro')]
        for path in sources:
            for html_class, html_text, kav_color, kav_text in pattern.findall(path.read_text()):
                text = html_text or kav_text
                color = html_class.split()[-1] if html_class else ('badge-neutral' if kav_color not in ('danger', 'success', 'warning') else 'text-bg-' + kav_color)
                colors.setdefault(text, {}).setdefault(color, []).append(path.relative_to(ROOT).as_posix())
        mixed = {text: found for text, found in colors.items() if len(found) > 1}
        self.assertEqual(mixed, {})
        self.assertEqual(set(colors['進行中']), {'badge-neutral'})
        self.assertEqual(set(colors['完了']), {'text-bg-success'})
