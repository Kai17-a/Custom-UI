#!/usr/bin/env python3
"""Check HTML/Vue/Astro markup for Kav-UI class and layout mistakes.

Usage:
  python3 check_markup.py src/                 # scan files or directories
  python3 check_markup.py page.html --css public/assets/css/ui.css
  python3 check_markup.py src/ --app-css src/styles/app.css

Kav-UI classes come from --css, the app's installed @kav-ui/core, a ui.css found
under the scanned paths, or the class list bundled with this skill, in that order.
Classes defined by --app-css or <style> blocks are treated as the app's own.
Exit status: 0 = no errors, 1 = errors found, 2 = usage error.
Python standard library only.
"""
from __future__ import annotations

import argparse
import difflib
import json
import os
import re
import sys
from dataclasses import dataclass
from html import unescape
from html.parser import HTMLParser
from pathlib import Path

HERE = Path(__file__).resolve().parent
BUNDLED = HERE / 'kav-ui-classes.json'
MARKUP_SUFFIXES = {'.html', '.htm', '.vue', '.astro'}
SKIP_DIRS = {'node_modules', '.git', 'dist', 'build', '.nuxt', '.output', '.astro', 'vendor', 'coverage'}
RESPONSIVE = re.compile(r'^(?:tablet|mobile|md|lg):')
KAV_PREFIX = re.compile(r'^(?:ui|fx|sp|type|btn|app|mdi)-')

# Classes that need a flex (or grid, for gaps) container on the same element.
CONTAINER_ONLY = re.compile(
    r'^fx-(?:row|row-reverse|column|column-reverse|wrap|nowrap|wrap-reverse|justify-[a-z]+|items-[a-z]+|'
    r'content-[a-z]+|gap(?:-\d+)?|row-gap|column-gap|grid-\d+|md-[a-z]+|lg-[a-z]+)$|^sp-gap(?:-[xy])?-\d+$')
# Classes that only work on a direct child of a flex container.
ITEM_ONLY = re.compile(r'^fx-(?:self-[a-z]+|flex-[a-z0-9]+|grow(?:-\d+)?|shrink(?:-\d+)?|basis(?:-[a-z0-9]+)?|order-[a-z0-9]+)$')
GROWING = {'fx-flex-1', 'fx-flex-auto', 'fx-grow', 'fx-grow-2', 'fx-basis-0'}
NEEDS_MIN_0 = {'type-truncate', 'ui-table-scroll'}
NEEDS_MIN_0_TAGS = {'pre', 'table'}

# Kav-UI keeps a few Bootstrap-style helpers for compatibility. Their scale differs
# from fx-/sp- (gap-3 = 1rem, fx-gap-3 = .75rem), so mixing them misaligns rows.
LEGACY = {
    'd-flex': 'fx', 'd-block': 'ui-block', 'gap-1': 'sp-gap-1', 'gap-2': 'sp-gap-2', 'gap-3': 'sp-gap-4',
    'px-2': 'sp-px-2', 'px-3': 'sp-px-4', 'py-0': 'sp-py-0', 'py-1': 'sp-py-1', 'py-2': 'sp-py-2',
    'ms-auto': 'fx-ms-auto', 'me-1': 'sp-me-1', 'ms-1': 'sp-ms-1', 'w-auto': 'ui-w-auto',
    'justify-content-start': 'fx-justify-start',
}

FOREIGN_EXACT = {
    'flex': 'fx', 'inline-flex': 'fx-inline', 'grid': 'fx-grid', 'hidden': 'ui-hidden', 'block': 'ui-block',
    'container': 'ui-container', 'container-fluid': 'ui-container ui-container-fluid',
    'flex-row': 'fx-row', 'flex-col': 'fx-column', 'flex-column': 'fx-column', 'flex-wrap': 'fx-wrap',
    'flex-nowrap': 'fx-nowrap', 'flex-1': 'fx-flex-1', 'flex-fill': 'fx-flex-1', 'flex-grow-1': 'fx-grow',
    'grow': 'fx-grow', 'flex-shrink-0': 'fx-shrink-0', 'shrink-0': 'fx-shrink-0', 'min-w-0': 'fx-min-0',
    'd-grid': 'fx-grid', 'd-none': 'ui-hidden', 'd-inline-flex': 'fx-inline', 'w-100': 'ui-w-full',
    'w-full': 'ui-w-full', 'mx-auto': 'sp-mx-auto', 'me-auto': 'fx-me-auto', 'ml-auto': 'fx-ms-auto',
    'mr-auto': 'fx-me-auto', 'text-muted': 'type-color-muted', 'truncate': 'type-truncate',
    'text-truncate': 'type-truncate', 'fw-bold': 'type-weight-bold', 'fw-semibold': 'type-weight-semibold',
    'font-bold': 'type-weight-bold', 'font-semibold': 'type-weight-semibold', 'card': 'ui-card',
    'card-body': 'ui-card-body', 'card-header': 'ui-card-header', 'card-footer': 'ui-card-footer',
    'card-title': 'ui-card-title', 'card-text': 'ui-card-description',
    'align-items-center': 'fx-items-center', 'align-items-start': 'fx-items-start',
    'align-items-end': 'fx-items-end', 'align-items-stretch': 'fx-items-stretch',
    'align-items-baseline': 'fx-items-baseline', 'justify-content-between': 'fx-justify-between',
    'justify-content-center': 'fx-justify-center', 'justify-content-end': 'fx-justify-end',
    'justify-content-around': 'fx-justify-around', 'items-center': 'fx-items-center',
    'items-start': 'fx-items-start', 'items-end': 'fx-items-end', 'justify-between': 'fx-justify-between',
    'justify-center': 'fx-justify-center', 'justify-end': 'fx-justify-end', 'space-x-2': 'fx sp-gap-2',
    'space-y-4': 'ui-stack',
}
SPACING_SIDES = {'': 'p', 't': 'pt', 'b': 'pb', 's': 'pl', 'e': 'pr', 'l': 'pl', 'r': 'pr', 'x': 'px', 'y': 'py'}
FOREIGN_PATTERNS = (
    (re.compile(r'^(?:col|col-(?:xs|sm|md|lg|xl|xxl))(?:-(\d+|auto))?$'), 'col'),
    (re.compile(r'^(?:sm|md|lg|xl|2xl):[a-z0-9:-]+$'), 'tailwind-breakpoint'),
    (re.compile(r'^(?:gap|gap-x|gap-y)-(\d+)$'), 'gap'),
    (re.compile(r'^([mp])([tbselrxy]?)-(\d+|auto)$'), 'spacing'),
    (re.compile(r'^grid-cols-(\d+)$'), 'grid-cols'),
    (re.compile(r'^(?:d|align-items|align-self|justify-content|flex|text|fw|fs|w|h)-[a-z0-9-]+$'), 'bootstrap'),
    (re.compile(r'^(?:items|justify|self|place|space-[xy]|text|font|bg|border|rounded|shadow)-[a-z0-9-]+$'), 'tailwind'),
)
SPACE_STEPS = (0, 1, 2, 3, 4, 6, 8, 12)


@dataclass(frozen=True)
class Finding:
    path: str
    line: int
    column: int
    level: str
    rule: str
    message: str

    def __str__(self):
        return f'{self.path}:{self.line}:{self.column}: {self.level} [{self.rule}] {self.message}'


# --- CSS -----------------------------------------------------------------

COMMENT = re.compile(r'/\*.*?\*/', re.S)
STRING = re.compile(r'"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'')
URL = re.compile(r'url\([^)]*\)', re.I)
CLASS_SELECTOR = re.compile(r'\.(-?[_a-zA-Z](?:[\w-]|\\.)*)')
IMPORT = re.compile(r'@import\s+(?:url\()?\s*["\']?([^"\')\s;]+)', re.I)
DISPLAY = re.compile(r'(?:^|[;{\s])display\s*:\s*(?:inline-)?(flex|grid)\b', re.I)


def _unescape(name):
    return re.sub(r'\\(.)', r'\1', name)


def _rules(css):
    """Yield (selector, declarations) for every rule, including those inside @media/@container."""
    css = URL.sub('url()', STRING.sub('""', COMMENT.sub('', css)))
    depth, start, selector_start, stack = 0, 0, 0, []
    for index, char in enumerate(css):
        if char == '{':
            stack.append(css[selector_start:index].strip())
            start = index + 1
            selector_start = index + 1
            depth += 1
        elif char == '}':
            selector = stack.pop() if stack else ''
            body = css[start:index]
            if '{' not in body and not selector.startswith('@'):
                yield selector, body
            depth -= 1
            start = selector_start = index + 1
        elif char == ';' and (not stack or stack[-1].startswith('@')):
            selector_start = index + 1


def css_inventory(css):
    """Return (classes, flex_or_grid_containers) defined by a stylesheet."""
    classes, containers = set(), set()
    for selector, body in _rules(css):
        names = {_unescape(name) for name in CLASS_SELECTOR.findall(selector)}
        classes |= names
        if DISPLAY.search(body):
            for part in selector.split(','):
                last = re.split(r'[\s>+~]+', part.strip())[-1]
                simple = re.fullmatch(r'\.(-?[_a-zA-Z](?:[\w-]|\\.)*)((?::[\w-]+(?:\((?:[^()]|\([^()]*\))*\))?)*)', last)
                if simple and not re.search(r':(?:hover|focus|active|checked|has|target|open|disabled|empty|first|last|nth|only)', simple[2] or ''):
                    containers.add(_unescape(simple[1]))
    return classes, containers


def read_stylesheet(path, seen=None):
    """Read a stylesheet and the local files it @imports."""
    seen = set() if seen is None else seen
    path = path.resolve()
    if path in seen or not path.is_file():
        return ''
    seen.add(path)
    text = path.read_text(encoding='utf-8', errors='replace')
    parts = [text]
    for target in IMPORT.findall(COMMENT.sub('', text)):
        if not re.match(r'^[a-z]+:', target) and not target.startswith('/'):
            parts.append(read_stylesheet(path.parent / target, seen))
    return '\n'.join(parts)


def build_inventory(stylesheet):
    stylesheet = Path(stylesheet)
    css = read_stylesheet(stylesheet)
    classes, containers = css_inventory(css)
    # HTML distribution: css/../js/ui.js; @kav-ui/core: dist/css/../runtime.js.
    javascript = next((path for path in (stylesheet.parent.parent / 'js/ui.js',
                                        stylesheet.parent.parent / 'runtime.js') if path.is_file()), None)
    attributes = set(re.findall(r'\bdata-ui-[a-z0-9]+(?:-[a-z0-9]+)*', css))
    if javascript:
        js = javascript.read_text(encoding='utf-8', errors='replace')
        attributes.update(re.findall(r'\bdata-ui-[a-z0-9]+(?:-[a-z0-9]+)*', js))
        # The runtime also uses dataset.uiFoo and dataset[key] with 'uiFoo' keys.
        for key in re.findall(r"\bui[A-Z][a-zA-Z0-9]*", js):
            attributes.add('data-' + re.sub(r'([A-Z])', r'-\1', key).lower())
        # sidebarMode reads data-ui-sidebar- + sidebarDevice().
        if "'data-ui-sidebar-'+device" in js:
            attributes.update('data-ui-sidebar-' + device for device in ('desktop', 'tablet', 'mobile'))
        match = re.search(r'const mdiPaths\s*=\s*Object\.freeze\(\s*(\{.*?\})\s*\)', js, re.S)
        icons = json.loads(match[1]) if match else {}
    else:
        bundled = json.loads(BUNDLED.read_text(encoding='utf-8'))
        attributes.update(bundled['data_attributes'])
        icons = bundled['icons']
    return {'classes': sorted(classes), 'containers': sorted(containers),
            'data_attributes': sorted(attributes), 'icons': sorted(icons)}


def find_kav_css(paths):
    for start in [Path.cwd(), *paths]:
        start = start.resolve()
        for folder in [start, *start.parents]:
            candidate = folder / 'node_modules/@kav-ui/core/dist/css/ui.css'
            if candidate.is_file():
                return candidate
    for start in paths:
        for candidate in walk_files(start):
            if candidate.name == 'ui.css' and (candidate.parent / 'components/flex.css').is_file():
                return candidate
    return None


def walk_files(path):
    """Yield files under path in a stable order, without descending into SKIP_DIRS."""
    if path.is_file():
        yield path
        return
    for folder, directories, files in os.walk(path):
        directories[:] = sorted(name for name in directories if name not in SKIP_DIRS)
        for name in sorted(files):
            yield Path(folder) / name


# --- Markup --------------------------------------------------------------

@dataclass
class Element:
    tag: str
    raw_tag: str
    classes: list
    dynamic: list
    style: str
    line: int
    column: int
    parent: 'Element | None'
    children: list
    attributes: tuple = ()


def literal_attributes(tag):
    """Read literal names without mistaking Vue strings or Astro expressions for attributes."""
    position = re.match(r'<[^\s/>]+', tag).end()
    while position < len(tag):
        match = re.match(r'\s+([^\s=/>]+)', tag[position:])
        if not match:
            break
        name = match[1].lower()
        position += match.end()
        name_end = position
        while position < len(tag) and tag[position].isspace():
            position += 1
        value = ''
        if position < len(tag) and tag[position] == '=':
            position += 1
            while position < len(tag) and tag[position].isspace():
                position += 1
            if position < len(tag) and tag[position] in ('"', "'"):
                quote = tag[position]
                end = tag.find(quote, position + 1)
                if end == -1:
                    break
                value = tag[position + 1:end]
                position = end + 1
            elif position < len(tag) and tag[position] == '{':
                # Balanced expressions may contain quoted attribute-like strings.
                depth, quote = 0, None
                while position < len(tag):
                    char = tag[position]
                    position += 1
                    if quote:
                        if char == "\\":
                            position += 1
                        elif char == quote:
                            quote = None
                    elif char in ('"', "'", '`'):
                        quote = char
                    elif char == '{':
                        depth += 1
                    elif char == '}':
                        depth -= 1
                        if depth == 0:
                            break
                value = None
            else:
                match = re.match(r'[^\s>]+', tag[position:])
                if match:
                    value = match[0]
                    position += match.end()
        else:
            position = name_end
        yield name, unescape(value) if value is not None else None


def literal_value(value):
    return value is not None and not any(token in value for token in ('{', '}', '<%', '%>', '${'))


class MarkupParser(HTMLParser):
    VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Element('#root', '#root', [], [], '', 1, 1, None, [])
        self.stack = [self.root]
        self.styles = []
        self._in_style = False

    def _open(self, tag, attrs, closed):
        raw = (self.get_starttag_text() or '')[1:].split(None, 1)[0].rstrip('/>') or tag
        classes, dynamic, style = [], [], ''
        for name, value in attrs:
            value = value or ''
            if name in ('class', 'classname'):
                classes += value.split()
            elif name in (':class', 'v-bind:class', 'class:list', '[class]'):
                for literal in re.findall(r'"([^"]*)"|\'([^\']*)\'|`([^`$]*)`', value):
                    dynamic += ''.join(literal).split()
            elif name == 'style':
                style = value
        line, offset = self.getpos()
        element = Element(tag, raw, classes, dynamic, style, line, offset + 1, self.stack[-1], [])
        element.attributes = tuple(literal_attributes(self.get_starttag_text() or ''))
        self.stack[-1].children.append(element)
        if not closed and tag not in self.VOID:
            self.stack.append(element)
        if tag == 'style' and not closed:
            self._in_style = True

    def handle_starttag(self, tag, attrs):
        self._open(tag, attrs, False)

    def handle_startendtag(self, tag, attrs):
        self._open(tag, attrs, True)

    def handle_endtag(self, tag):
        if tag == 'style':
            self._in_style = False
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                del self.stack[index:]
                return

    def handle_data(self, data):
        if self._in_style:
            self.styles.append(data)


def markup_source(path, text):
    """Return the parseable markup, keeping line numbers."""
    blank = lambda value: re.sub(r'[^\n]', ' ', value)
    if path.suffix == '.astro':
        match = re.match(r'\s*---\n.*?\n---', text, re.S)
        if match:
            text = blank(match[0]) + text[match.end():]
    if path.suffix == '.vue':
        start, end = text.find('<template'), text.rfind('</template>')
        styles = ''.join(re.findall(r'<style[^>]*>.*?</style>', text, re.S))
        if start == -1 or end == -1:
            return '', styles
        end += len('</template>')
        return blank(text[:start]) + text[start:end], styles
    return text, ''


def is_component(element):
    return (element.tag in ('#root', 'template', 'slot') or any(c.isupper() for c in element.raw_tag)
            or '-' in element.tag or ':' in element.raw_tag)


def walk(element):
    for child in element.children:
        yield child
        yield from walk(child)


def base_name(name):
    return RESPONSIVE.sub('', name)


class Checker:
    def __init__(self, inventory, app_classes=(), app_containers=()):
        self.kav = set(inventory['classes'])
        self.kav_containers = set(inventory['containers'])
        self.icons = set(inventory.get('icons', ()))
        self.data_attributes = set(inventory.get('data_attributes', ()))
        self.app = set(app_classes)
        self.app_containers = set(app_containers)

    def check_file(self, path, display=None):
        display = display or str(path)
        text = Path(path).read_text(encoding='utf-8', errors='replace')
        return self.check_text(text, Path(path), display)

    def check_text(self, text, path=Path('input.html'), display='input.html'):
        source, extra_css = markup_source(path, text)
        parser = MarkupParser()
        parser.feed(source)
        parser.close()
        local, local_containers = css_inventory(extra_css + '\n'.join(parser.styles))
        app, app_containers = self.app | local, self.app_containers | local_containers
        findings = []
        ids = {value for element in walk(parser.root) for name, value in element.attributes
               if name == 'id' and value and literal_value(value)}

        def report(element, level, rule, message):
            findings.append(Finding(display, element.line, element.column, level, rule, message))

        def known(name):
            return name in self.kav or name in app

        def unverified(element):
            return [name for name in element.classes
                    if not known(name) and not KAV_PREFIX.match(base_name(name)) and not self.foreign(name)]

        def container(element):
            if re.search(r'display\s*:\s*(?:inline-)?(?:flex|grid)', element.style, re.I):
                return True
            return any(base_name(name) in self.kav_containers or base_name(name) in app_containers
                       or name in self.kav_containers or name in app_containers for name in element.classes)

        for element in walk(parser.root):
            for name, value in element.attributes:
                if name.startswith('data-ui-') and name not in self.data_attributes:
                    close = difflib.get_close_matches(name, sorted(self.data_attributes), n=1, cutoff=.75)
                    report(element, 'error', 'unknown-data-attribute',
                           f'"{name}" is not a Kav-UI attribute.'
                           + (f' Did you mean "{close[0]}"?' if close else ''))
                if not literal_value(value):
                    continue
                if name == 'icon' and value not in self.icons:
                    close = difflib.get_close_matches(value, sorted(self.icons), n=1, cutoff=.75)
                    report(element, 'error', 'unknown-icon',
                           f'"{value}" is not a bundled Kav-UI icon.'
                           + (f' Did you mean "{close[0]}"?' if close else ''))
                references = []
                if name in ('aria-controls', 'aria-labelledby', 'aria-describedby'):
                    references = value.split()
                elif name == 'for' and element.tag == 'label':
                    references = [value] if value else []
                elif name == 'data-ui-target' and re.fullmatch(r'#[^\s#.,>+~\[\]:]+', value):
                    references = [value[1:]]
                for reference in references:
                    if reference not in ids:
                        close = difflib.get_close_matches(reference, sorted(ids), n=1, cutoff=.75)
                        report(element, 'warning', 'missing-id-reference',
                               f'"{name}" references ID "{reference}" not found in this file.'
                               + (f' Did you mean "{close[0]}"?' if close else ''))
            names = element.classes
            for name in names + element.dynamic:
                if known(name):
                    continue
                suggestion = self.foreign(name)
                if suggestion is not None:
                    report(element, 'error', 'foreign-class',
                           f'"{name}" is not a Kav-UI class.' + (f' Use {suggestion}.' if suggestion else '')
                           + ' If the app defines it, pass that stylesheet with --app-css.')
                elif KAV_PREFIX.match(base_name(name)) or RESPONSIVE.match(name):
                    close = difflib.get_close_matches(name, self.kav, n=1, cutoff=.75)
                    report(element, 'error', 'unknown-class',
                           f'"{name}" is not defined by Kav-UI.' + (f' Did you mean "{close[0]}"?' if close else ''))
            for name in names:
                if name in LEGACY and name in self.kav and name not in app:
                    report(element, 'warning', 'legacy-utility',
                           f'"{name}" is a compatibility helper with a different scale. Use {LEGACY[name]}.')

            needs = [name for name in names if CONTAINER_ONLY.match(base_name(name)) and known(name)]
            if needs and not container(element):
                grid_cols = [name for name in needs if base_name(name).startswith('fx-grid-')]
                if grid_cols:
                    message = f'{", ".join(grid_cols)} needs "fx-grid" on the same element.'
                else:
                    message = f'{", ".join(needs)} has no effect without "fx" (display:flex) on the same element.'
                if unverified(element):
                    report(element, 'warning', 'missing-flex-container',
                           message + ' Pass the app stylesheet with --app-css if one of its classes sets display.')
                else:
                    report(element, 'error', 'missing-flex-container', message)

            parent = element.parent
            columns = [name for name in names if re.fullmatch(r'fx-col-\d+', base_name(name))]
            if columns and parent is not None and not is_component(parent) \
                    and not any(base_name(name) == 'fx-grid' for name in parent.classes):
                report(element, 'error', 'column-outside-grid',
                       f'{", ".join(columns)} works only on a direct child of "fx-grid".')
            items = [name for name in names if ITEM_ONLY.match(base_name(name)) and known(name)]
            if items and parent is not None and not is_component(parent) and not container(parent) \
                    and not unverified(parent):
                report(element, 'warning', 'item-outside-flex',
                       f'{", ".join(items)} affects only a child of a flex container; the parent <{parent.raw_tag}> is not one.')

            if 'row' in names and any(self.foreign(name) is not None and base_name(name).startswith('col')
                                      for child in element.children for name in child.classes):
                report(element, 'error', 'bootstrap-grid',
                       'Kav-UI "row" is a simple wrapping row, not a 12-column grid. '
                       'Use "fx-grid" with "fx-col-*" children, or "fx-grid fx-grid-N".')

            prefixes = {name.split(':', 1)[0] for name in names if ':' in name and RESPONSIVE.match(name)}
            legacy_breakpoints = prefixes & {'md', 'lg'} or any(re.match(r'fx-(?:md|lg)-', name) for name in names)
            if legacy_breakpoints and prefixes & {'tablet', 'mobile'}:
                report(element, 'warning', 'mixed-breakpoints',
                       'Do not mix tablet:/mobile: with md:/lg: or fx-md-*/fx-lg-* on one element.')

            if set(names) & GROWING and 'fx-min-0' not in names and parent is not None and container(parent):
                risky = [child for child in walk(element)
                         if child.tag in NEEDS_MIN_0_TAGS or set(child.classes) & NEEDS_MIN_0]
                if risky or set(names) & NEEDS_MIN_0:
                    report(element, 'warning', 'flex-item-overflow',
                           'This growing flex item holds content that cannot shrink '
                           '(truncate, table or pre). Add "fx-min-0" so it does not overflow the row.')
        return findings

    def foreign(self, name):
        """Return a suggestion (possibly '') when name looks like Bootstrap/Tailwind, else None."""
        if name in self.kav or name in self.app:
            return None
        if name in FOREIGN_EXACT:
            return FOREIGN_EXACT[name]
        for pattern, kind in FOREIGN_PATTERNS:
            match = pattern.match(name)
            if not match:
                continue
            if kind == 'col':
                span = match[1] if match[1] and match[1].isdigit() else '6'
                return f'"fx-col-{span}" inside an "fx-grid" parent (or "fx-grid fx-grid-N" on the parent)'
            if kind == 'tailwind-breakpoint':
                return '"tablet:" (768-1023px) or "mobile:" (<768px) with a Kav-UI class'
            if kind == 'gap':
                axis = {'gap': '', 'gap-x': 'x-', 'gap-y': 'y-'}[name.rsplit('-', 1)[0]]
                return f'"sp-gap-{axis}{self.step(match[1])}"'
            if kind == 'spacing':
                if match[3] == 'auto':
                    return '"sp-mx-auto" or "fx-ms-auto" / "fx-me-auto"'
                prop = SPACING_SIDES[match[2]].replace('p', match[1], 1)
                return f'"sp-{prop}-{self.step(match[3])}"'
            if kind == 'grid-cols':
                return f'"fx-grid fx-grid-{match[1]}"'
            return ''
        return None

    @staticmethod
    def step(value):
        number = int(value)
        return min(SPACE_STEPS, key=lambda step: (abs(step - number), step))


def markup_files(paths):
    for path in paths:
        if path.is_file():
            yield path
        else:
            yield from (candidate for candidate in walk_files(path) if candidate.suffix in MARKUP_SUFFIXES)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    parser.add_argument('paths', nargs='*', type=Path, help='markup files or directories')
    parser.add_argument('--css', type=Path, help="the app's Kav-UI ui.css (follows @import)")
    parser.add_argument('--app-css', type=Path, action='append', default=[], help='app stylesheet; repeatable')
    parser.add_argument('--strict', action='store_true', help='also fail on warnings')
    args = parser.parse_args(argv)

    if not args.paths:
        parser.error('give at least one file or directory')

    if args.css and not args.css.is_file():
        parser.error(f'--css not found: {args.css}')
    missing = [str(path) for path in args.paths if not path.exists()]
    if missing:
        parser.error('not found: ' + ', '.join(missing))
    stylesheet = args.css or find_kav_css(args.paths)
    if stylesheet:
        inventory, source = build_inventory(stylesheet), str(stylesheet)
    else:
        inventory, source = json.loads(BUNDLED.read_text()), f'bundled list ({BUNDLED.name})'
    app_classes, app_containers = set(), set()
    for sheet in args.app_css:
        if not sheet.is_file():
            parser.error(f'--app-css not found: {sheet}')
        classes, containers = css_inventory(read_stylesheet(sheet))
        app_classes |= classes
        app_containers |= containers

    checker = Checker(inventory, app_classes, app_containers)
    files = list(markup_files(args.paths))
    findings = [finding for path in files for finding in checker.check_file(path)]
    for finding in findings:
        print(finding)
    errors = sum(finding.level == 'error' for finding in findings)
    warnings = len(findings) - errors
    print(f'Kav-UI classes: {source}', file=sys.stderr)
    print(f'{len(files)} file(s), {errors} error(s), {warnings} warning(s)', file=sys.stderr)
    return 1 if errors or (args.strict and warnings) else 0


if __name__ == '__main__':
    sys.exit(main())
