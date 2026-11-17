"""Generated examples must refer to exported components and declared props."""
import json
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]


def samples():
    source = (ROOT / 'docs/assets/js/component-code-samples.js').read_text()
    return json.loads(source.split(' = ', 1)[1].rstrip(';\n'))


class ComponentCodeSamplesTests(unittest.TestCase):
    def test_readme_scope_and_page_alignment(self):
        data = samples()
        self.assertEqual(len([p for p in data.values() if 'examples' in p]), 18)
        self.assertEqual(set(data['drawer.html']['examples'][0]), {'vue'})
        self.assertEqual(set(data['navigation.html']['examples'][0]), {'vue'})
        for name in ('rating', 'timeline', 'typography', 'spacing'):
            self.assertEqual(data[name + '.html'], {})
        for name in ('data-table', 'command', 'carousel', 'clipboard', 'splitter'):
            self.assertTrue(data[name + '.html']['widget'])

    def test_sortable_uses_widget_tabs(self):
        examples = samples()['sortable.html']['examples']
        self.assertEqual(len(examples), 2)
        for example in examples:
            self.assertEqual(set(example), {'vue', 'astro'})
            for source in example.values():
                self.assertIn('KavWidget', source)
                self.assertIn('data-ui-sortable', source)

    def test_components_and_props_are_declared(self):
        vue = (ROOT / 'packages/vue/src/index.d.ts').read_text()
        astro = (ROOT / 'packages/astro/src/index.d.ts').read_text()
        count = 0
        for page, data in samples().items():
            for example in data.get('examples', []):
                for framework, source in example.items():
                    # Only parse framework markup, not quoted HTML passed to Widget.
                    markup = source.split('</script>', 1)[-1] if framework == 'vue' else source.split('---')[-1]
                    for name, attributes in re.findall(r'<(Kav\w+)\b([^>]*?)/?>', markup):
                        with self.subTest(page=page, framework=framework, component=name):
                            self.assertRegex(vue if framework == 'vue' else astro, rf'\b{name}\b')
                            declaration = re.search(rf'{name}:Component<(.+)>;', vue)
                            self.assertIsNotNone(declaration, name)
                            props = set(re.findall(r"(?:^|[;{])([\w]+)\??:", declaration[1]))
                            if framework == 'astro':
                                component = (ROOT / f'packages/astro/src/components/{name}.astro').read_text()
                                props &= set(re.findall(r'(\w+)\??:', component)) | ({'value', 'max'} if name == 'KavProgress' else set())
                            for attr in re.findall(r'([:\w-]+)(?:="[^"]*"|=\{[^}]*\})?(?:\s|$)', attributes.strip()):
                                key = attr.lstrip(':')
                                if key in ('class', 'style', 'type', 'href', 'disabled', 'title', 'id') or key.startswith(('aria-', 'data-')):
                                    continue  # Native HTML attributes forwarded by these primitives.
                                self.assertIn(key, props, (name, key))
                        count += 1
        self.assertGreater(count, 100)
