"""AI documentation stays linked, reproducible and portable (stdlib only)."""
import importlib.util
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import unittest
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('kav_ai_docs', ROOT / 'scripts/generate-ai-docs.py')
GENERATOR = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = GENERATOR
SPEC.loader.exec_module(GENERATOR)


def links(path):
    lines = []
    fence = None
    for line in path.read_text().splitlines():
        marker = re.match(r'^\s*(`{3,}|~{3,})', line)
        if marker:
            if fence is None:
                fence = marker[1]
            elif marker[1][0] == fence[0] and len(marker[1]) >= len(fence):
                fence = None
            continue
        if fence is None:
            lines.append(line)
    return re.findall(r'\[[^\]\n]*\]\(([^)\s]+)\)', '\n'.join(lines))


class AiDocumentationTests(unittest.TestCase):
    def test_generated_files_match_html_sources(self):
        outputs = GENERATOR.outputs()
        self.assertGreater(sum(path.name.endswith('.html.md') for path in outputs), 40)
        for path, expected in outputs.items():
            self.assertTrue(path.is_file(), str(path))
            self.assertEqual(path.read_text(), expected, str(path.relative_to(ROOT)))

    def test_check_detects_drift_without_writing(self):
        with tempfile.TemporaryDirectory() as directory:
            copied = Path(directory)
            shutil.copytree(ROOT / 'docs', copied / 'docs')
            (copied / 'scripts').mkdir()
            shutil.copy2(ROOT / 'scripts/generate-ai-docs.py', copied / 'scripts/generate-ai-docs.py')
            shutil.copy2(ROOT / 'index.html', copied / 'index.html')
            target = copied / 'docs/components/buttons.html.md'
            original = target.read_text()
            changed = original + '\nStale fixture\n'
            target.write_text(changed)
            command = [sys.executable, str(copied / 'scripts/generate-ai-docs.py')]
            check = subprocess.run(command + ['--check'], cwd=copied, text=True, capture_output=True)
            self.assertEqual(check.returncode, 1, check.stderr)
            self.assertIn('docs/components/buttons.html.md', check.stdout)
            self.assertEqual(target.read_text(), changed)
            regenerate = subprocess.run(command, cwd=copied, text=True, capture_output=True)
            self.assertEqual(regenerate.returncode, 0, regenerate.stderr)
            self.assertEqual(target.read_text(), original)

    def test_llms_routes_to_every_public_component(self):
        index = ROOT / 'docs/llms.txt'
        actual = {(index.parent / unquote(urlsplit(value).path)).resolve()
                  for value in links(index) if value.startswith('components/')}
        expected = {Path(str(page) + '.md').resolve()
                    for page in (ROOT / 'docs/components').glob('*.html') if page.name != 'preview.html'}
        self.assertEqual(actual, expected)

    def test_local_markdown_references_resolve(self):
        for page in [ROOT / 'docs/llms.txt', *(ROOT / 'docs').rglob('*.html.md'), *(ROOT / 'skills/kav-ui').rglob('*.md')]:
            for value in links(page):
                url = urlsplit(value)
                if url.scheme or url.netloc or not url.path or url.path.startswith('/'):
                    continue
                target = (page.parent / unquote(url.path)).resolve()
                self.assertTrue(target.is_relative_to(ROOT), (page, value))
                self.assertTrue(target.is_file(), (page.relative_to(ROOT), value))

    def test_export_retains_sample_markup_and_code(self):
        sample = '<button type="button" data-ui-toast="A &amp; B">通知</button><input type="text" value="例">'
        source = '<html><head></head><body><aside>SIDEBAR-NOISE</aside><main><h1>Example</h1><p>Read <code>ui.css</code> &amp; JS.</p><div data-example>' + sample + '</div><pre><code>&lt;p&gt;A &amp;amp; B&lt;/p&gt;</code></pre></main></body></html>'
        document = GENERATOR.Document(source)
        main = next(node for node in document.root.walk() if node.tag == 'main')
        result = GENERATOR.Markdown(ROOT / 'docs/example.html', document, set()).blocks(main)
        self.assertNotIn('SIDEBAR-NOISE', result)
        self.assertIn('```html\n' + sample + '\n```', result)
        self.assertIn('<p>A &amp; B</p>', result)
        self.assertIn('`ui.css` & JS.', result)
        self.assertTrue(GENERATOR.fence('```').startswith('````\n'))

    def test_copied_skill_keeps_its_reference_files(self):
        with tempfile.TemporaryDirectory() as directory:
            copied = Path(directory) / 'kav-ui'
            shutil.copytree(ROOT / 'skills/kav-ui', copied)
            local = []
            for path in copied.rglob('*.md'):
                for value in links(path):
                    url = urlsplit(value)
                    if not url.scheme and not url.netloc and url.path:
                        target = (path.parent / unquote(url.path)).resolve()
                        self.assertTrue(target.is_relative_to(copied), (path.name, value))
                        self.assertTrue(target.is_file(), (path.name, value))
                        local.append(target)
            self.assertIn(copied / 'references/integration.md', local)
            # A copied skill must lead to every bundled reference without the source tree.
            reachable = set()
            pending = [copied / 'SKILL.md']
            while pending:
                path = pending.pop()
                if path in reachable:
                    continue
                reachable.add(path)
                for value in links(path):
                    url = urlsplit(value)
                    if not url.scheme and not url.netloc and url.path:
                        target = (path.parent / unquote(url.path)).resolve()
                        if target.suffix == '.md':
                            pending.append(target)
            self.assertEqual(reachable, set(copied.rglob('*.md')))
