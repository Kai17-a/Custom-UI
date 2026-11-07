"""The Kav-UI skill's markup checker finds layout mistakes agents make (stdlib only)."""
import importlib.util
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / 'skills/kav-ui'
SCRIPT = SKILL / 'scripts/check_markup.py'
SPEC = importlib.util.spec_from_file_location('kav_check_markup', SCRIPT)
CHECK = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = CHECK
sys.dont_write_bytecode = True  # importing must not leave __pycache__ inside the published skill
SPEC.loader.exec_module(CHECK)
sys.dont_write_bytecode = False
INVENTORY = CHECK.build_inventory(ROOT / 'assets/css/ui.css')


def rules(markup, path='page.html', **options):
    checker = CHECK.Checker(INVENTORY, **options)
    return [(finding.rule, finding.level) for finding in checker.check_text(markup, Path(path), path)]


def rule_names(markup, path='page.html', **options):
    return {rule for rule, _ in rules(markup, path, **options)}


class InventoryTests(unittest.TestCase):
    def test_bundled_list_matches_the_stylesheets(self):
        bundled = json.loads((SKILL / 'scripts/kav-ui-classes.json').read_text())
        self.assertEqual(bundled, INVENTORY)

    def test_inventory_reads_imports_escapes_and_display(self):
        classes, containers = set(INVENTORY['classes']), set(INVENTORY['containers'])
        self.assertTrue({'fx', 'fx-row', 'tablet:fx-col-6', 'ui-cluster', 'mobile:ui-flex'} <= classes)
        self.assertTrue({'fx', 'fx-grid', 'ui-cluster', 'ui-stack', 'ui-flex', 'ui-card-footer'} <= containers)
        self.assertFalse({'fx-row', 'fx-items-center', 'ui-card-body'} & containers)
        self.assertNotIn('svg', classes)

    def test_attribute_and_icon_inventory_sources(self):
        self.assertEqual(len(INVENTORY['icons']), 128)
        self.assertTrue({'mdi-close', 'mdi-check'} <= set(INVENTORY['icons']))
        self.assertTrue({'data-ui-tooltip', 'data-ui-sidebar-desktop', 'data-ui-min',
                         'data-ui-size', 'data-ui-max-files'} <= set(INVENTORY['data_attributes']))
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            css = root / 'css/ui.css'
            css.parent.mkdir()
            css.write_text('[data-ui-css-only] { display: block }')
            fallback = CHECK.build_inventory(css)
            self.assertEqual(fallback['icons'], INVENTORY['icons'])
            self.assertTrue(set(INVENTORY['data_attributes']) <= set(fallback['data_attributes']))
            for js in (root / 'js/ui.js', root / 'runtime.js'):
                js.parent.mkdir(exist_ok=True)
                js.write_text('const mdiPaths = Object.freeze({"mdi-custom": "M0"}); '
                              'node.getAttribute("data-ui-custom");')
                current = CHECK.build_inventory(css)
                self.assertEqual(current['icons'], ['mdi-custom'])
                self.assertEqual(current['data_attributes'], ['data-ui-css-only', 'data-ui-custom'])
                js.unlink()

    def test_scanned_folder_wins_over_the_current_directory(self):
        with tempfile.TemporaryDirectory() as directory:
            work = Path(directory)
            sheets = {}
            for name in ('cwd', 'app'):
                sheet = work / name / 'node_modules/@kav-ui/core/dist/css/ui.css'
                sheet.parent.mkdir(parents=True)
                sheet.write_text('.ui-' + name + ' {}')
                sheets[name] = sheet
            (work / 'app/src').mkdir()
            previous = Path.cwd()
            os.chdir(work / 'cwd')
            try:
                self.assertEqual(CHECK.find_kav_css([work / 'app/src']).resolve(), sheets['app'].resolve())
                # Without a package next to the scanned files, the current directory is the fallback.
                (work / 'other').mkdir()
                self.assertEqual(CHECK.find_kav_css([work / 'other']).resolve(), sheets['cwd'].resolve())
            finally:
                os.chdir(previous)

    def test_finds_package_and_html_distribution_inventories(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            package = root / 'node_modules/@kav-ui/core/dist'
            (package / 'css').mkdir(parents=True)
            sheet = package / 'css/ui.css'
            sheet.write_text('.ui-custom {}')
            (package / 'runtime.js').write_text(
                'const mdiPaths = Object.freeze({"mdi-package": "M0"}); "data-ui-package";')
            self.assertEqual(CHECK.find_kav_css([root]), sheet)
            self.assertEqual(CHECK.build_inventory(sheet)['icons'], ['mdi-package'])
            shutil.rmtree(root / 'node_modules')
            sheet = root / 'assets/css/ui.css'
            (sheet.parent / 'components').mkdir(parents=True)
            (sheet.parent / 'components/flex.css').write_text('.fx {}')
            sheet.write_text('@import "components/flex.css";')
            (root / 'assets/js').mkdir()
            (root / 'assets/js/ui.js').write_text(
                'const mdiPaths = Object.freeze({"mdi-html": "M0"}); "data-ui-html";')
            self.assertEqual(CHECK.find_kav_css([root]), sheet)
            self.assertEqual(CHECK.build_inventory(sheet)['icons'], ['mdi-html'])

    def test_build_docs_publishes_and_checks_the_bundled_list(self):
        spec = importlib.util.spec_from_file_location('kav_build_docs', ROOT / 'scripts/build-docs.py')
        build = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(build)
        files = build.public_files()
        expected = (json.dumps(INVENTORY, indent=1) + '\n').encode()
        self.assertEqual(files[SKILL / 'scripts/kav-ui-classes.json'], expected)
        self.assertEqual(files[ROOT / 'docs/skills/kav-ui/scripts/kav-ui-classes.json'], expected)


class ScreenMarkupTests(unittest.TestCase):
    def test_portable_screen_markup(self):
        samples = sorted((SKILL / 'samples/html').glob('*.html'))
        self.assertEqual(len(samples), 13)
        for page in samples:
            with self.subTest(page=page.name):
                source = page.read_text()
                findings = CHECK.Checker(INVENTORY).check_text(source, page, str(page))
                self.assertEqual([(f.level, f.rule) for f in findings], [])
                self.assertNotRegex(source, r'catalog-|data-demo-|templates\.(?:css|js)|layout\.css')
                self.assertNotRegex(source, r'<(?:link|script)\b[^>]*(?:href|src)=')


class RuleTests(unittest.TestCase):
    def test_unknown_icons_and_attributes_have_suggestions(self):
        markup = '<span icon="mdi-clsoe" data-ui-tooltp="Help"></span>'
        findings = CHECK.Checker(INVENTORY).check_text(markup)
        self.assertEqual([(f.rule, f.level) for f in findings],
                         [('unknown-icon', 'error'), ('unknown-data-attribute', 'error')])
        self.assertIn('mdi-close', findings[0].message)
        self.assertIn('data-ui-tooltip', findings[1].message)
        self.assertEqual(rules('<span icon="mdi-close" data-ui-tooltip="Help" data-app-x></span>'), [])
        self.assertEqual(rules('<div data-ui-tooltip="anything" data-ui-placement="anything"></div>'), [])

    def test_id_references_are_same_file_and_allow_forward_references(self):
        markup = ('<button data-ui-target="#panel" aria-controls="panel" aria-labelledby="title help" '
                  'aria-describedby="help"></button><label for="field"></label>'
                  '<div id="panel"></div><h2 id="title"></h2><p id="help"></p><input id="field">')
        self.assertEqual(rules(markup), [])
        for attr in ('data-ui-target="#pnael"', 'aria-controls="pnael"',
                     'aria-labelledby="title pnael"', 'aria-describedby="pnael"', 'for="pnael"'):
            tag = 'label' if attr.startswith('for=') else 'button'
            findings = CHECK.Checker(INVENTORY).check_text(
                f'<{tag} {attr}></{tag}><div id="panel"></div><h2 id="title"></h2>')
            self.assertEqual([(f.rule, f.level) for f in findings], [('missing-id-reference', 'warning')])
            self.assertIn('panel', findings[0].message)
        self.assertEqual(rules('<div for="missing" data-ui-target=".panel"></div>'), [])
        self.assertEqual(rules('<label for="a&amp;b"></label><input id="a&#38;b">'), [])
        checker = CHECK.Checker(INVENTORY)
        checker.check_text('<div id="other-file"></div>')
        self.assertEqual([f.rule for f in checker.check_text('<label for="other-file"></label>')],
                         ['missing-id-reference'])

    def test_bound_attributes_and_template_values_are_skipped(self):
        vue = ("""<template><div :class="{'data-ui-fake': open}" :data-ui-fake="value" """
               'v-bind:data-ui-fake="value" :aria-controls="panel" v-bind:aria-labelledby="title" '
               ':icon="name" icon="{{ name }}" aria-describedby="help-{{ key }}"></div></template>')
        self.assertEqual(rules(vue, 'Panel.vue'), [])
        astro = ('<div aria-controls={panel} aria-labelledby={prefix + " title"} '
                 'data-ui-target={`#${panel}`} icon={name} '
                 'class:list={["data-ui-fake", { "data-ui-another": open }]} '
                 'aria-describedby="<%= help %>"></div>')
        self.assertEqual(rules(astro, 'Panel.astro'), [])
        self.assertEqual(rules('<span icon="${name}" aria-controls="{% panel %}"></span>'), [])

    def test_flex_alignment_needs_a_flex_container(self):
        self.assertIn('missing-flex-container', rule_names('<div class="fx-row fx-justify-between"></div>'))
        self.assertIn('missing-flex-container', rule_names('<div class="mobile:fx-column sp-gap-2"></div>'))
        self.assertIn('missing-flex-container', rule_names('<div class="fx-grid-3"></div>'))
        for markup in ('<div class="fx fx-row fx-justify-between"></div>',
                       '<div class="ui-cluster sp-gap-2"></div>',
                       '<div class="ui-card-footer fx-justify-end"></div>',
                       '<div class="fx-grid fx-grid-3 fx-gap-4"></div>',
                       '<div class="ui-hidden mobile:ui-flex sp-gap-2"></div>',
                       '<div style="display: flex" class="fx-items-center"></div>'):
            self.assertEqual(rules(markup), [], markup)

    def test_app_classes_are_trusted_only_as_far_as_known(self):
        markup = '<div class="toolbar fx-items-center"></div>'
        self.assertEqual(rules(markup), [('missing-flex-container', 'warning')])
        self.assertEqual(rules(markup, app_classes={'toolbar'}, app_containers={'toolbar'}), [])
        styled = '<style>.toolbar { display: flex; }</style><div class="toolbar fx-items-center"></div>'
        self.assertEqual(rules(styled), [])
        self.assertEqual(rules('<section class="project-summary"></section>'), [])

    def test_foreign_classes_get_kav_ui_suggestions(self):
        checker = CHECK.Checker(INVENTORY)
        findings = checker.check_text('<div class="justify-content-between items-center mb-3 gap-x-4 md:flex"></div>')
        text = '\n'.join(str(finding) for finding in findings)
        self.assertEqual({finding.rule for finding in findings}, {'foreign-class'})
        for expected in ('fx-justify-between', 'fx-items-center', 'sp-mb-3', 'sp-gap-x-4', 'tablet:'):
            self.assertIn(expected, text)
        self.assertIn('unknown-class', rule_names('<div class="fx-justify-around fx-itmes-center"></div>'))
        self.assertEqual(rule_names('<div class="justify-content-between"></div>',
                                    app_classes={'justify-content-between'}), set())

    def test_columns_and_items_need_the_right_parent(self):
        self.assertIn('column-outside-grid',
                      rule_names('<div class="fx-grid"><div><div class="fx-col-6"></div></div></div>'))
        self.assertEqual(rules('<div class="fx-grid"><div class="fx-col-6 mobile:fx-col-12"></div></div>'), [])
        self.assertIn('item-outside-flex', rule_names('<div class="ui-card-body"><p class="fx-flex-1"></p></div>'))
        self.assertEqual(rules('<div class="fx"><p class="fx-flex-1"></p></div>'), [])
        # A component boundary or template root may be a flex container we cannot see.
        self.assertEqual(rules('<template><KavCard><div class="fx-col-6 fx-flex-1"></div></KavCard></template>',
                               'Card.vue'), [])

    def test_bootstrap_grid_breakpoints_overflow_and_legacy(self):
        self.assertIn('bootstrap-grid', rule_names('<div class="row"><div class="col-md-6"></div></div>'))
        self.assertNotIn('bootstrap-grid', rule_names('<div class="row"><span class="badge"></span></div>'))
        self.assertIn('mixed-breakpoints', rule_names('<div class="fx fx-md-row mobile:fx-column"></div>'))
        overflow = '<div class="fx"><div class="fx-flex-1"><p class="type-truncate">long</p></div></div>'
        self.assertEqual(rules(overflow), [('flex-item-overflow', 'warning')])
        self.assertEqual(rules(overflow.replace('fx-flex-1', 'fx-flex-1 fx-min-0')), [])
        self.assertEqual(rules('<div class="d-flex gap-3"></div>'), [('legacy-utility', 'warning')] * 2)

    def test_vue_and_astro_keep_line_numbers_and_read_literal_bindings(self):
        vue = ('<script setup>\nconst open = true\n</script>\n\n<template>\n  <div class="fx">\n'
               '    <span :class="[\'fx-row\', open ? \'align-items-center\' : \'\']"></span>\n'
               '  </div>\n</template>\n<style scoped>\n.x { display: flex }\n</style>\n')
        findings = CHECK.Checker(INVENTORY).check_text(vue, Path('Panel.vue'), 'Panel.vue')
        self.assertEqual([(finding.rule, finding.line) for finding in findings], [('foreign-class', 7)])
        astro = '---\nconst title = "a > b"\n---\n<div class="fx">\n  <p class:list={["d-none"]}>x</p>\n</div>\n'
        findings = CHECK.Checker(INVENTORY).check_text(astro, Path('index.astro'), 'index.astro')
        self.assertEqual([(finding.rule, finding.line) for finding in findings], [('foreign-class', 5)])


class RecipeTests(unittest.TestCase):
    def test_recipes_pass_and_each_ng_example_is_caught(self):
        recipes = (SKILL / 'references/layout-recipes.md').read_text()
        blocks = re.findall(r'```html\n(.*?)```', recipes, re.S)
        good = [block for block in blocks if not block.startswith('<!-- NG:')]
        bad = [block for block in blocks if block.startswith('<!-- NG:')]
        self.assertGreaterEqual(len(good), 10)
        self.assertGreaterEqual(len(bad), 7)
        for block in good:
            self.assertEqual(rules(block), [], block)
        for block in bad:
            expected = re.match(r'<!-- NG: ([a-z-]+) -->', block)[1]
            self.assertIn(expected, rule_names(block), block)

    def test_catalog_uses_only_defined_kav_ui_classes(self):
        # Catalog-only demo classes live in the site CSS; ui-* names must come from Kav-UI.
        defined = set(INVENTORY['classes'])
        undefined = set()
        for page in (ROOT / 'docs').rglob('*.html'):
            for value in re.findall(r'\bclass="([^"]*)"', page.read_text()):
                undefined.update((page.relative_to(ROOT).as_posix(), name) for name in value.split()
                                 if name.startswith('ui-') and name not in defined)
        self.assertEqual(sorted(undefined), [])

    def test_catalog_pages_declare_theme_color_and_avoid_legacy_utilities(self):
        pages = [*(ROOT / 'docs').glob('*.html'), *(ROOT / 'docs/components').glob('*.html'), *(ROOT / 'docs/templates').glob('*.html')]
        for page in pages:
            text = page.read_text()
            with self.subTest(page=page.name):
                self.assertEqual(len(re.findall(r'<meta name="theme-color" content="#[0-9a-f]{6}" media="\(prefers-color-scheme: (?:light|dark)\)">', text)), 2)
                self.assertEqual([rule for rule, _ in rules(text, page.name) if rule == 'legacy-utility'], [])

    def test_skill_reference_examples_have_no_errors(self):
        for page in (SKILL / 'references').glob('*.md'):
            for block in re.findall(r'```html\n(.*?)```', page.read_text(), re.S):
                if not block.startswith('<!-- NG:'):
                    errors = [rule for rule, level in rules(block) if level == 'error']
                    self.assertEqual(errors, [], (page.name, block))


class CommandTests(unittest.TestCase):
    def test_copied_skill_runs_alone_and_reports_locations(self):
        with tempfile.TemporaryDirectory() as directory:
            work = Path(directory)
            shutil.copytree(SKILL, work / 'kav-ui')
            app = work / 'app'
            app.mkdir()
            (app / 'index.html').write_text('<main>\n  <div class="d-flex justify-content-between"></div>\n</main>\n')
            (app / 'ok.html').write_text('<div class="ui-cluster"><button class="btn btn-primary">OK</button></div>')
            result = subprocess.run([sys.executable, str(work / 'kav-ui/scripts/check_markup.py'), str(app)],
                                    cwd=work, text=True, capture_output=True)
            self.assertEqual(result.returncode, 1, result.stderr)
            self.assertIn(f'{app / "index.html"}:2:3: error [foreign-class]', result.stdout)
            self.assertIn('bundled list', result.stderr)
            self.assertIn('2 file(s), 1 error(s), 1 warning(s)', result.stderr)
            (app / 'index.html').unlink()
            clean = subprocess.run([sys.executable, str(work / 'kav-ui/scripts/check_markup.py'), str(app),
                                    '--strict'], cwd=work, text=True, capture_output=True)
            self.assertEqual(clean.returncode, 0, clean.stdout + clean.stderr)

    def test_copied_skill_uses_bundled_attribute_and_icon_lists(self):
        with tempfile.TemporaryDirectory() as directory:
            work = Path(directory)
            shutil.copytree(SKILL, work / 'kav-ui')
            page = work / 'page.html'
            page.write_text('<span icon="mdi-clsoe" data-ui-tooltp aria-controls="absent"></span>')
            command = [sys.executable, str(work / 'kav-ui/scripts/check_markup.py'), str(page)]
            result = subprocess.run(command, cwd=work, text=True, capture_output=True)
            self.assertEqual(result.returncode, 1, result.stderr)
            for rule in ('unknown-icon', 'unknown-data-attribute', 'missing-id-reference'):
                self.assertIn(f'[{rule}]', result.stdout)
            self.assertIn('bundled list', result.stderr)
            self.assertIn(f'{page}:1:1: error [unknown-icon]', result.stdout)
            page.write_text('<span icon="mdi-close" data-ui-tooltip aria-controls="panel"></span>'
                            '<div id="panel"></div>')
            clean = subprocess.run(command + ['--strict'], cwd=work, text=True, capture_output=True)
            self.assertEqual(clean.returncode, 0, clean.stdout + clean.stderr)

    def test_app_stylesheet_option_and_explicit_kav_css(self):
        with tempfile.TemporaryDirectory() as directory:
            work = Path(directory)
            (work / 'app.css').write_text('.toolbar { display: flex }')
            (work / 'page.html').write_text('<div class="toolbar fx-items-center"></div>')
            base = [sys.executable, str(SCRIPT), str(work / 'page.html'), '--css', str(ROOT / 'assets/css/ui.css')]
            warned = subprocess.run(base + ['--strict'], text=True, capture_output=True)
            self.assertEqual(warned.returncode, 1)
            self.assertIn('assets/css/ui.css', warned.stderr)
            trusted = subprocess.run(base + ['--strict', '--app-css', str(work / 'app.css')],
                                     text=True, capture_output=True)
            self.assertEqual(trusted.returncode, 0, trusted.stdout)
            missing = subprocess.run(base + ['--app-css', str(work / 'none.css')], text=True, capture_output=True)
            self.assertEqual(missing.returncode, 2)


if __name__ == '__main__':
    unittest.main()
