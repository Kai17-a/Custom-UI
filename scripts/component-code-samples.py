"""Central framework sample rules. Preserve complex authored widgets verbatim.

Only the README's dedicated-component pages get language tabs. Other pages
with runtime data-ui-* hooks get Widget guidance; CSS-only examples do not.
"""
import json
import re
from html import escape

PAGES = set('icons mdi-icons buttons cards layouts badges forms alerts banner loading dialog disclosure calendar chart sidebar'.split())
VUE_ONLY = {'drawer', 'navigation'}


def languages(page):
    return ('vue', 'astro') if page in PAGES else ('vue',) if page in VUE_ONLY else ()


def widget(markup, framework):
    # Escape JavaScript interpolation and SFC closing tags, retaining readable HTML.
    safe = markup.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${').replace('</script', '<\\/script')
    value = '`\n' + '\n'.join('  ' + line for line in safe.splitlines()) + '\n`'
    if framework == 'vue':
        return '<script setup>\nimport { KavWidget } from "@kai17-a/kav-ui-vue";\nconst html = ' + value + ';\n</script>\n\n<template>\n  <KavWidget :html="html" />\n</template>'
    return '---\nimport { KavWidget } from "@kai17-a/kav-ui-astro";\nconst html = ' + value + ';\n---\n\n<KavWidget html={html} />'


def sample(document, example, framework):
    """Use dedicated primitives where equivalent; Widget retains advanced HTML APIs.

    Never invent props for features only available through the HTML runtime.
    Native HTML and CSS classes remain usable alongside framework components.
    """
    imports = set()
    complex_widget = any(any(k.startswith('data-ui-') for k in n.attrs)
                         for n in example.walk())
    markup = document.source[example.inner_start:example.inner_end].strip()
    if complex_widget:
        return widget(markup, framework)

    def render(node, depth=0):
        if isinstance(node, str):
            return ('  ' * depth + escape(node.strip())) if node.strip() else ''
        attrs = dict(node.attrs)
        classes = attrs.get('class', '').split()
        tag = node.tag
        props = {}
        if 'btn' in classes and tag in ('button', 'a'):
            tag = 'KavButton'
            for c in classes:
                match = re.fullmatch(r'btn-(outline-|ghost-|soft-)?(primary|secondary|success|danger|warning|info|light|dark)', c)
                if match:
                    props['color'] = match[2]
                    if match[1]: props['variant'] = match[1][:-1]
                if c in ('btn-sm', 'btn-lg'): props['size'] = c[4:]
            if 'icon' in attrs: props['icon'] = attrs.pop('icon')
        elif 'icon' in attrs and not node.children:
            tag = 'KavIcon'
            props['name'] = attrs.pop('icon')
            if 'aria-label' in attrs: props['label'] = attrs.pop('aria-label')
            attrs.pop('role', None)
        elif 'ui-card' in classes and node.tag in ('article', 'section', 'div'):
            imports.add('KavCard')
            children = []
            for child in node.children:
                if isinstance(child, str):
                    if child.strip(): children.append(render(child, depth + 1))
                elif 'ui-card-body' in child.attrs.get('class', '').split():
                    children.extend(render(c, depth + 1) for c in child.children)
                elif child.tag in ('header', 'footer'):
                    slot = child.tag
                    opening = f'<template #{slot}>' if framework == 'vue' else f'<Fragment slot="{slot}">'
                    closing = '</template>' if framework == 'vue' else '</Fragment>'
                    children.append('  ' * (depth + 1) + opening)
                    children.extend(render(c, depth + 2) for c in child.children)
                    children.append('  ' * (depth + 1) + closing)
                else: children.append(render(child, depth + 1))
            attributes = ' '.join(f'{k}="{escape(v, quote=True)}"' for k, v in attrs.items())
            return '  ' * depth + '<KavCard ' + attributes + '>\n' + '\n'.join(filter(None, children)) + '\n' + '  ' * depth + '</KavCard>'
        elif 'badge' in classes:
            tag = 'KavBadge'
            for c in classes:
                if c.startswith('text-bg-'): props['color'] = c[8:]
        elif 'ui-container' in classes:
            tag = 'KavContainer'
            for c in classes:
                if c in ('ui-container-sm', 'ui-container-lg', 'ui-container-fluid'): props['size'] = c[13:]
        elif 'ui-spinner' in classes:
            tag = 'KavSpinner'
            for c in classes:
                if c in ('ui-spinner-xs', 'ui-spinner-sm', 'ui-spinner-lg', 'ui-spinner-xl'): props['size'] = c[11:]
            props['label'] = attrs.pop('aria-label', '読み込み中')
        elif node.tag == 'progress' and 'ui-progress' in classes:
            tag = 'KavProgress'
            for key in ('value', 'max'):
                if key in attrs: props[':' + key if framework == 'vue' else key] = attrs.pop(key)
        if tag.startswith('Kav'):
            imports.add(tag)
            # Native attributes/classes are forwarded by these primitives.
            attrs.update(props)
        values = []
        for key, value in attrs.items():
            if framework == 'astro' and tag == 'KavProgress' and key in ('value', 'max'):
                values.append(f'{key}={{{value}}}')
            else: values.append(key if value == '' else f'{key}="{escape(value, quote=True)}"')
        opening = '  ' * depth + '<' + tag + (' ' + ' '.join(values) if values else '')
        if node.tag in {'input','br','hr','img','area','source','wbr'}: return opening + ' />'
        if tag in ('KavSpinner','KavIcon','KavProgress'): return opening + ' />'
        children = '\n'.join(filter(None, (render(c, depth + 1) for c in node.children)))
        return opening + '>\n' + children + '\n' + '  ' * depth + '</' + tag + '>'

    content = '\n'.join(filter(None, (render(c, 1 if framework == 'vue' else 0) for c in example.children)))
    if not imports:
        return widget(markup, framework)
    statement = 'import { ' + ', '.join(sorted(imports)) + ' } from "@kai17-a/kav-ui-' + framework + '";'
    if framework == 'vue':
        return '<script setup>\n' + statement + '\n</script>\n\n<template>\n' + content + '\n</template>'
    return '---\n' + statement + '\n---\n\n' + content


def page_data(page, document):
    examples = [n for n in document.root.walk() if 'data-example' in n.attrs]
    langs = languages(page)
    if langs:
        return {'examples': [{lang: sample(document, n, lang) for lang in langs} for n in examples]}
    runtime = any(any(k.startswith('data-ui-') for k in n.attrs) for e in examples for n in e.walk())
    return {'widget': True} if runtime else {}
