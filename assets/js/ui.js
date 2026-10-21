/* Orchtop UI: dependency-free data attributes. Load once with defer. */
(() => {
  'use strict';
  if (window.OrchtopUI) return;
  const doc = document;
  const openers = new WeakMap();
  const timers = new WeakMap();
  const pageStates = new WeakMap();
  let sequence = 0;
  let tooltip = null;
  let dragging = null;
  const all = (scope, selector) => [...scope.querySelectorAll(selector)];
  const closest = (node, selector) => node instanceof Element ? node.closest(selector) : null;
  const owned = (scope, selector, owner) => all(scope, selector).filter(item => item.closest(owner) === scope);
  const emit = (element, name, detail = {}, cancelable = false) => element.dispatchEvent(new CustomEvent('ui:' + name, {bubbles:true, cancelable, detail}));
  const disabled = element => element.disabled || element.getAttribute('aria-disabled') === 'true';
  // Browsers can retain :focus-visible when an already-focused control is clicked.
  // Track the last input method without blurring or moving the user's focus.
  doc.addEventListener('pointerdown',()=>{doc.documentElement.dataset.uiFocusModality='pointer';},true);
  doc.addEventListener('keydown',event=>{
    if(!['Shift','Control','Alt','Meta'].includes(event.key))doc.documentElement.dataset.uiFocusModality='keyboard';
  },true);
  // Motion never delays state, focus or application events.
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionAnimations = new Set();
  const elementMotions = new WeakMap();
  const exitVisuals = new WeakMap();
  function motion(element, frames, duration = 180) {
    if (!element?.isConnected || !element.animate || reducedMotion.matches) return null;
    elementMotions.get(element)?.cancel();
    const animation = element.animate(frames, {duration, easing:'cubic-bezier(.2,.7,.3,1)'});
    elementMotions.set(element, animation);
    motionAnimations.add(animation);
    const cleanup = () => {
      motionAnimations.delete(animation);
      if (elementMotions.get(element) === animation) elementMotions.delete(element);
    };
    animation.finished.then(cleanup, cleanup);
    return animation;
  }
  reducedMotion.addEventListener('change', event => {
    if (event.matches) for (const animation of motionAnimations) animation.cancel();
  });
  function cancelExit(element) {
    const visual = exitVisuals.get(element);
    if (visual) { visual.animation.cancel(); visual.host.remove(); exitVisuals.delete(element); }
  }
  function prepareExit(element) {
    if (reducedMotion.matches || !element?.isConnected || !element.animate) return () => {};
    const bounds = element.getBoundingClientRect();
    const opacity = Number(getComputedStyle(element).opacity);
    const destination = element.matches('.app-sidebar') ? '-12px 0' : '0 5px';
    if (!bounds.width || !bounds.height || opacity < .01) return () => {};
    // A closed shadow contains a frozen, inert visual copy. No duplicate IDs,
    // controls, live regions or UI selectors enter the application document.
    const host = doc.createElement('div');
    host.setAttribute('data-ui-motion-ghost', '');
    host.setAttribute('aria-hidden', 'true');
    host.inert = true;
    Object.assign(host.style, {position:'fixed',left:bounds.left+'px',top:bounds.top+'px',width:bounds.width+'px',height:bounds.height+'px',pointerEvents:'none',zIndex:'2147483000',margin:'0'});
    const shadow = host.attachShadow({mode:'closed'});
    const clone = element.cloneNode(true);
    const originals = [element, ...all(element, '*')];
    const copies = [clone, ...all(clone, '*')];
    originals.forEach((original, index) => {
      const copy = copies[index];
      if (copy.matches('script, style, iframe, object, embed, audio, video') || (original !== element && original.matches('[popover], .ui-tooltip'))) { copy.remove(); return; }
      const style = getComputedStyle(original);
      for (const property of style) copy.style.setProperty(property, style.getPropertyValue(property));
      for (const attribute of [...copy.attributes]) {
        if (attribute.name === 'id' || attribute.name === 'popover' || attribute.name.startsWith('on') || attribute.name.startsWith('data-ui-')) copy.removeAttribute(attribute.name);
      }
      copy.style.setProperty('animation', 'none', 'important');
      copy.style.setProperty('transition', 'none', 'important');
      copy.style.pointerEvents = 'none';
      if (original.matches('input, textarea, select')) copy.value = original.value;
    });
    // A cloned dialog must not participate in the browser's dialog lifecycle.
    const surface = element.tagName === 'DIALOG' ? doc.createElement('div') : clone;
    if (surface !== clone) { surface.style.cssText = clone.style.cssText; surface.append(...clone.childNodes); }
    surface.removeAttribute('hidden');
    Object.assign(surface.style, {position:'relative',inset:'auto',margin:'0',width:'100%',height:'100%',minWidth:'0',minHeight:'0',maxWidth:'none',maxHeight:'none',boxSizing:'border-box',opacity:'1',transform:'none',translate:'none',scale:'none'});
    shadow.append(surface);
    const backdrop = element.tagName === 'DIALOG' ? getComputedStyle(element, '::backdrop') : null;
    const backdropColor = backdrop?.backgroundColor;
    const backdropFilter = backdrop?.backdropFilter;
    return () => {
      if (reducedMotion.matches) return;
      cancelExit(element);
      doc.body.append(host);
      const animation = motion(host, [{opacity,translate:'0 0'},{opacity:0,translate:destination}], 140);
      if (!animation) { host.remove(); return; }
      exitVisuals.set(element, {host, animation});
      const cleanup = () => { host.remove(); if (exitVisuals.get(element)?.host === host) exitVisuals.delete(element); };
      animation.finished.then(cleanup, cleanup);
      if (backdropColor && backdropColor !== 'rgba(0, 0, 0, 0)') {
        const shade = doc.createElement('div');
        shade.setAttribute('aria-hidden','true');shade.inert=true;
        Object.assign(shade.style,{position:'fixed',inset:'0',background:backdropColor,backdropFilter,pointerEvents:'none',zIndex:'2147482999'});
        doc.body.append(shade);
        const fade = motion(shade,[{opacity:1},{opacity:0}],140);
        if (fade) fade.finished.then(()=>shade.remove(),()=>shade.remove()); else shade.remove();
      }
    };
  }
  function exitMotion(element) { prepareExit(element)(); }
  function enterMotion(element) { motion(element, [{opacity:.25},{opacity:1}]); }

  function id(element) {
    if (!element.id) {
      do { element.id = 'ui-' + (++sequence); } while (doc.getElementById(element.id) && doc.getElementById(element.id) !== element);
    }
    return element.id;
  }
  function query(selector) {
    if (!selector) return null;
    try { return doc.querySelector(selector); } catch { return null; }
  }
  function target(trigger) {
    const selector = trigger.getAttribute('data-ui-target');
    if (selector) return query(selector);
    return doc.getElementById(trigger.getAttribute('aria-controls'));
  }
  function describedBy(element, reference, add) {
    const tokens = new Set((element.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
    if (add) tokens.add(reference); else tokens.delete(reference);
    if (tokens.size) element.setAttribute('aria-describedby', [...tokens].join(' '));
    else element.removeAttribute('aria-describedby');
  }
  function sync(panel) {
    for (const button of all(doc, '[data-ui-toggle="collapse"], [data-ui-toggle="sidebar"]')) {
      if (target(button) !== panel) continue;
      button.setAttribute('aria-controls', id(panel));
      button.setAttribute('aria-expanded', String(!panel.hidden));
      const label = button.getAttribute(panel.hidden ? 'data-ui-label-closed' : 'data-ui-label-open');
      if (label) button.textContent = label;
    }
    if (panel.matches('.app-sidebar')) {
      const shell = panel.closest('.app-shell');
      if (shell) shell.dataset.sidebarCollapsed = String(panel.hidden);
    }
  }
  function focusAfterHide(panel, trigger) {
    if (!panel.contains(doc.activeElement)) return;
    const explicit = query(trigger?.getAttribute('data-ui-focus'));
    const controls = all(doc, 'button, a[href], input, select, textarea, [tabindex]').filter(item => !disabled(item) && !item.closest('[hidden], [inert]') && item.tabIndex >= 0 && item.getClientRects().length > 0);
    const index = controls.indexOf(doc.activeElement);
    const linked = controls.find(item => !panel.contains(item) && target(item) === panel);
    const following = controls.slice(index + 1).find(item => !panel.contains(item));
    const previous = controls.slice(0, Math.max(0, index)).reverse().find(item => !panel.contains(item));
    (explicit || linked || following || previous)?.focus();
  }
  function show(panel, opener) {
    if (typeof panel === 'string') panel = query(panel);
    if (!panel) return;
    cancelExit(panel);
    if (panel.tagName === 'DIALOG') {
      if (panel.open) return;
      hideTooltip();
      openers.set(panel, opener || doc.activeElement);
      panel.showModal();
    } else {
      const opening = panel.hidden;
      const existingAnimation = getComputedStyle(panel).animationName;
      if (opening && existingAnimation === 'none') panel.classList.add('ui-reveal');
      panel.hidden = false;
      sync(panel);
      if (opening && existingAnimation !== 'none') enterMotion(panel);
      if (opening && panel.matches('.app-sidebar')) motion(panel,[{translate:'-12px 0'},{translate:'0 0'}]);
    }
    emit(panel, 'shown');
  }
  function hide(panel, trigger) {
    if (typeof panel === 'string') panel = query(panel);
    if (!panel) return;
    if (tooltip && panel.contains(tooltip.trigger)) hideTooltip();
    if (activeInputPicker && panel.contains(activeInputPicker.root)) activeInputPicker.close();
    if (panel.tagName === 'DIALOG') {
      if (panel.open) { exitMotion(panel); panel.close(); }
    } else {
      exitMotion(panel);
      focusAfterHide(panel, trigger);
      panel.hidden = true;
      sync(panel);
      clearTimeout(timers.get(panel));
      emit(panel, 'hidden');
    }
  }
  function hideTooltip() {
    if (!tooltip) return;
    describedBy(tooltip.trigger, tooltip.bubble.id, false);
    exitMotion(tooltip.bubble);
    tooltip.bubble.remove();
    tooltip = null;
  }
  function showTooltip(trigger) {
    if (disabled(trigger) || !trigger.dataset.uiTooltip) return;
    if (tooltip?.trigger === trigger) return;
    hideTooltip();
    const bubble = doc.createElement('span');
    bubble.className = 'ui-tooltip';
    bubble.setAttribute('role', 'tooltip');
    bubble.textContent = trigger.dataset.uiTooltip;
    // A tooltip inside a native modal must also be inside its top layer.
    (trigger.closest('dialog[open]') || doc.body).append(bubble);
    describedBy(trigger, id(bubble), true);
    const box = trigger.getBoundingClientRect();
    const bounds = bubble.getBoundingClientRect();
    const left = Math.max(8, Math.min(box.left, window.innerWidth - bounds.width - 8));
    const below = box.bottom + 8;
    const top = below + bounds.height <= window.innerHeight - 8 ? below : Math.max(8, box.top - bounds.height - 8);
    bubble.style.left = left + 'px';
    bubble.style.top = top + 'px';
    tooltip = {trigger, bubble};
  }
  async function copy(text) {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard API is unavailable');
    await navigator.clipboard.writeText(String(text));
  }
  const copying = new WeakSet();
  const copyOutputs = new WeakMap();
  const copyIcons = new WeakMap();
  const copyResetTimers = new WeakMap();
  const copyPath = 'M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1m3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m0 16H8V7h11v14z';
  const checkPath = 'M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z';
  function initCopyIcon(button) {
    if (!button.classList.contains('ui-copy-icon')) return null;
    if (copyIcons.has(button)) return copyIcons.get(button);
    const label = button.getAttribute('aria-label') || button.textContent.trim() || 'コピー';
    const title = button.getAttribute('title') || label;
    const svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const path = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', copyPath);
    svg.append(path);
    button.replaceChildren(svg);
    button.classList.add('ui-copy-icon');
    button.setAttribute('aria-label', label);
    button.title = title;
    const feedback = button.closest('.ui-clipboard')?.querySelector('[data-ui-copy-status]');
    if (feedback) feedback.dataset.uiCopyFeedback = 'icon';
    const state = {label, title, path};
    copyIcons.set(button, state);
    return state;
  }
  function resetCopyIcon(button) {
    clearTimeout(copyResetTimers.get(button));
    const state = initCopyIcon(button);
    if (!state) return;
    state.path.setAttribute('d', copyPath);
    button.removeAttribute('data-ui-copy-state');
    button.setAttribute('aria-label', state.label);
    button.title = state.title;
  }
  function copiedIcon(button) {
    const state = initCopyIcon(button);
    if (!state) return;
    state.path.setAttribute('d', checkPath);
    button.dataset.uiCopyState = 'success';
    button.setAttribute('aria-label', 'コピーしました');
    button.title = 'コピーしました';
    copyResetTimers.set(button, setTimeout(() => resetCopyIcon(button), 2000));
  }

  async function copyFromButton(button) {
    if (disabled(button) || copying.has(button)) return;
    resetCopyIcon(button);
    const container = button.closest('.ui-clipboard, .ui-toast');
    let output = container?.querySelector('[data-ui-copy-status]') || copyOutputs.get(button);
    if (!output?.isConnected) {
      output = doc.createElement('span');
      output.className = 'ui-copy-status';
      output.setAttribute('data-ui-copy-status', '');
      output.setAttribute('role', 'status');
      button.after(output);
      copyOutputs.set(button, output);
    }
    if (button.classList.contains('ui-copy-icon')) output.dataset.uiCopyFeedback = 'icon';
    else output.removeAttribute('data-ui-copy-feedback');
    const previous = {busy:button.getAttribute('aria-busy'), disabled:button.getAttribute('aria-disabled')};
    copying.add(button);
    button.setAttribute('aria-busy', 'true');
    button.setAttribute('aria-disabled', 'true');
    output.dataset.uiCopyState = 'pending';
    output.textContent = 'コピー中…';
    emit(button, 'copying');
    let text;
    let error = null;
    try {
      if (button.hasAttribute('data-ui-copy-target')) {
        const source = query(button.dataset.uiCopyTarget);
        if (!source) throw new Error('Copy target not found');
        text = source.matches('input, textarea') ? source.value : source.textContent;
      } else text = button.getAttribute('data-ui-copy') ?? '';
      await copy(text);
      output.dataset.uiCopyState = 'success';
      output.textContent = 'コピーしました。';
      copiedIcon(button);
    } catch (failure) {
      error = failure;
      output.dataset.uiCopyState = 'error';
      output.textContent = 'コピーできませんでした。内容を選択して手動でコピーしてください。';
    } finally {
      for (const [name, value] of [['aria-busy', previous.busy], ['aria-disabled', previous.disabled]]) {
        if (value === null) button.removeAttribute(name); else button.setAttribute(name, value);
      }
      copying.delete(button);
    }
    emit(button, error ? 'copyerror' : 'copy', error ? {error} : {text});
  }
  doc.addEventListener('click', event => {
    const button = closest(event.target, 'button[data-ui-copy], button[data-ui-copy-target]');
    if (!button) return;
    event.preventDefault();
    copyFromButton(button);
  });

  function toast(message = '', options = {}) {
    // Keep toast('message', options) working; structured notifications accept one object.
    if (message !== null && typeof message === 'object' && !Array.isArray(message)) {
      options = {...message, ...options};
      message = '';
    }
    const title = options.title == null ? '' : String(options.title);
    const body = String(options.body ?? message ?? '');
    const meta = options.meta == null ? '' : String(options.meta);
    const variant = ['success','danger','warning','info'].includes(options.variant) ? options.variant : 'success';
    let region = doc.querySelector('.ui-toasts');
    if (!region) {
      region = doc.createElement('div');
      region.className = 'ui-toasts';
      region.setAttribute('aria-label', '通知');
      doc.body.append(region);
    }
    const note = doc.createElement('div');
    note.className = 'ui-toast notice alert alert-' + variant;
    note.setAttribute('role', variant === 'danger' ? 'alert' : 'status');
    const words = doc.createElement('span');
    words.className = 'words ui-toast-content';
    note.setAttribute('aria-atomic', 'true');
    if (title || meta) {
      const header = doc.createElement('div');
      header.className = 'ui-toast-header';
      if (title) {
        const heading = doc.createElement('strong');
        heading.className = 'ui-toast-title';
        heading.textContent = title;
        header.append(heading);
      }
      if (meta) {
        const detail = doc.createElement('small');
        detail.className = 'ui-toast-meta';
        detail.textContent = meta;
        header.append(detail);
      }
      words.append(header);
    }
    if (body) {
      const content = doc.createElement('div');
      content.className = 'ui-toast-body';
      content.textContent = body;
      words.append(content);
    }
    if (options.copy === true) {
      const actions = doc.createElement('div');
      actions.className = 'ui-toast-actions';
      const copyButton = doc.createElement('button');
      copyButton.type = 'button';
      copyButton.className = 'ui-copy-icon';
      copyButton.setAttribute('data-ui-copy', String(options.copyText ?? (body || title)));
      copyButton.setAttribute('aria-label', String(options.copyLabel ?? 'コピー'));
      initCopyIcon(copyButton);
      const status = doc.createElement('span');
      status.className = 'ui-copy-status';
      status.setAttribute('data-ui-copy-status', '');
      status.setAttribute('role', 'status');
      actions.append(copyButton, status);
      words.append(actions);
    }
    const close = doc.createElement('button');
    close.type = 'button';
    close.className = 'btn-close';
    close.setAttribute('data-ui-dismiss', 'toast');
    close.setAttribute('aria-label', '通知を閉じる');
    note.append(words, close);
    region.append(note);
    while (region.children.length > 5) {
      const first = region.firstElementChild;
      if (first.contains(doc.activeElement)) break;
      clearTimeout(timers.get(first));
      exitMotion(first);
      first.remove();
    }
    const requested = options.duration === undefined ? (variant === 'danger' ? 0 : 6000) : Number(options.duration);
    const duration = Number.isFinite(requested) ? Math.max(0, requested) : 6000;
    const remove = () => { exitMotion(note); note.remove(); clearTimeout(timers.get(note)); };
    const pause = () => clearTimeout(timers.get(note));
    const resume = () => { pause(); if (duration && !note.contains(doc.activeElement) && !note.matches(':hover') && !note.querySelector('[data-ui-copy][aria-busy="true"]')) timers.set(note, setTimeout(remove, duration)); };
    note.addEventListener('pointerenter', pause);
    note.addEventListener('pointerleave', resume);
    note.addEventListener('focusin', pause);
    note.addEventListener('ui:copying', pause);
    note.addEventListener('ui:copy', resume);
    note.addEventListener('ui:copyerror', resume);
    note.addEventListener('focusout', () => setTimeout(resume, 0));
    resume();
    return note;
  }
  function tabData(group) {
    const tabs = owned(group, '[data-ui-toggle="tab"]', '[data-ui-tabs]');
    const panels = owned(group, '[data-ui-panel]', '[data-ui-tabs]');
    return {tabs, panels};
  }
  function tabPanel(tab, panels) {
    const key = tab.dataset.uiTarget;
    return panels.find(panel => panel.dataset.uiPanel === key || '#' + panel.id === key);
  }
  function activateTab(tab, notify = true) {
    const group = tab.closest('[data-ui-tabs]');
    if (!group || disabled(tab)) return;
    const {tabs, panels} = tabData(group);
    const selected = tabPanel(tab, panels);
    if (!selected) return;
    for (const item of tabs) {
      const panel = tabPanel(item, panels);
      if (!panel) continue;
      item.setAttribute('role','tab');
      item.setAttribute('aria-controls', id(panel));
      item.setAttribute('aria-selected', String(item === tab));
      item.tabIndex = item === tab ? 0 : -1;
      panel.setAttribute('role','tabpanel');
      panel.setAttribute('aria-labelledby', id(item));
      panel.tabIndex = 0;
      panel.hidden = panel !== selected;
    }
    if (notify) emit(group, 'tabchange', {tab, panel:selected});
  }
  function renderPage(group, requested = 1, notify = true) {
    const items = owned(group, '[data-ui-page-item]', '[data-ui-pagination]');
    const parsed = Number(group.dataset.uiPageSize);
    const size = Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 8;
    const count = Math.max(1, Math.ceil(items.length / size));
    const page = Math.max(1, Math.min(count, Math.floor(Number(requested)) || 1));
    const previousPage = pageStates.get(group);
    pageStates.set(group, page);
    items.forEach((item, index) => { item.hidden = index < (page - 1) * size || index >= page * size; });
    for (const button of owned(group, '[data-ui-page]', '[data-ui-pagination]')) {
      const value = Number(button.dataset.uiPage);
      if (value === page) button.setAttribute('aria-current','page'); else button.removeAttribute('aria-current');
      button.disabled = value < 1 || value > count;
    }
    for (const button of owned(group, '[data-ui-page-step]', '[data-ui-pagination]')) {
      button.disabled = page + Number(button.dataset.uiPageStep) < 1 || page + Number(button.dataset.uiPageStep) > count;
    }
    for (const status of owned(group, '[data-ui-page-status]', '[data-ui-pagination]')) {
      status.setAttribute('role','status');
      status.textContent = items.length ? `全${items.length}件のうち ${(page - 1) * size + 1}–${Math.min(page * size, items.length)}件を表示` : '0件';
    }
    if (notify && page !== previousPage) items.filter(item=>!item.hidden).forEach(enterMotion);
    if (notify) emit(group, 'pagechange', {page, pageSize:size, total:items.length});
  }
  function fields(form) { return all(form, 'input, select, textarea').filter(field => field.willValidate && !field.closest('.ui-input-popup')); }
  function validateField(field) {
    const valid = field.checkValidity();
    if (!valid && field.getAttribute('aria-invalid') !== 'true') motion(field,[{translate:'-3px 0'},{translate:'3px 0'},{translate:'0 0'}],160);
    field.setAttribute('aria-invalid', String(!valid));
    const wrapper = field.closest('[data-ui-field]');
    let error = wrapper?.querySelector('[data-ui-error]') || (field.getAttribute('aria-describedby') || '').split(/\s+/).map(key => doc.getElementById(key)).find(node => node?.hasAttribute('data-ui-error'));
    if (!error && !valid) {
      error = doc.createElement('small');
      error.className = 'ui-invalid-feedback';
      error.setAttribute('data-ui-error','');
      field.after(error);
    }
    if (error) {
      describedBy(field, id(error), true);
      error.setAttribute('aria-live','polite');
      error.hidden = valid;
      error.textContent = valid ? '' : field.dataset.uiMessage || field.validationMessage;
    }
    return valid;
  }
  function updateBoard(board) {
    for (const column of owned(board, '[data-ui-column]', '[data-ui-board]')) {
      const cards = all(column, '[data-ui-card]').filter(card => card.closest('[data-ui-column]') === column);
      const count = column.querySelector('[data-ui-count]');
      if (count) {
        const changed = count.textContent !== String(cards.length);
        count.textContent = String(cards.length);
        if (changed) enterMotion(count);
      }
      const empty = column.querySelector('[data-ui-empty]');
      if (empty) empty.hidden = cards.length > 0;
      cards.forEach(card => {
        card.draggable = true;
        all(card, '[data-ui-move]').forEach(select => { select.value = column.dataset.uiColumn; syncSelect(select); });
      });
    }
  }
  function moveCard(card, column) {
    const board = card.closest('[data-ui-board]');
    const from = card.closest('[data-ui-column]');
    if (!board || column.closest('[data-ui-board]') !== board || column === from) return;
    const before = card.getBoundingClientRect();
    elementMotions.get(card)?.cancel();
    (column.querySelector('[data-ui-cards]') || column).append(card);
    updateBoard(board);
    const after = card.getBoundingClientRect();
    motion(card,[{translate:(before.left-after.left)+'px '+(before.top-after.top)+'px',opacity:.6},{translate:'0 0',opacity:1}],220);
    emit(board, 'move', {card, from:from?.dataset.uiColumn, to:column.dataset.uiColumn});
  }
  function endDrag() {
    if (!dragging) return;
    all(dragging.board, '.drop, .dragged').forEach(item => item.classList.remove('drop','dragged'));
    dragging = null;
  }
  // Calendar dates use local noon; date-only values never go through UTC parsing.
  const calendarStates = new WeakMap();
  function calendarDate(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
    if (!match || Number(match[1]) < 1) return null;
    const date = new Date(0);
    date.setHours(12,0,0,0);
    date.setFullYear(Number(match[1]), Number(match[2])-1, Number(match[3]));
    return date.getFullYear() === Number(match[1]) && date.getMonth() === Number(match[2])-1 && date.getDate() === Number(match[3]) ? date : null;
  }
  function calendarISO(date) {
    return String(date.getFullYear()).padStart(4,'0') + '-' + String(date.getMonth()+1).padStart(2,'0') + '-' + String(date.getDate()).padStart(2,'0');
  }
  function calendarShift(date, days) { const next = new Date(date); next.setDate(next.getDate()+days); return next; }
  function calendarMonth(date, delta = 0) {
    const next = new Date(date); next.setDate(1); next.setMonth(next.getMonth()+delta); return next;
  }
  const calendarLabel = date => new Intl.DateTimeFormat('ja-JP',{year:'numeric',month:'long',day:'numeric',weekday:'long'}).format(date);
  function calendarNode(tag, className, text) {
    const node = doc.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function calendarConfig(root) {
    const min = calendarDate(root.dataset.uiMin) || calendarDate('0001-01-01');
    const max = calendarDate(root.dataset.uiMax) || calendarDate('9999-12-31');
    const today = calendarDate(calendarISO(new Date()));
    return {min,max,today,start:root.dataset.uiWeekStart === 'monday' ? 1 : 0};
  }
  const calendarClamp = (date, config) => new Date(Math.max(config.min.getTime(),Math.min(config.max.getTime(),date.getTime())));
  function renderCalendar(root, restore = false) {
    root.classList.add('ui-calendar');
    const config = calendarConfig(root);
    let state = calendarStates.get(root);
    if (!state) {
      const view = calendarNode('div','ui-calendar-view'); view.setAttribute('data-ui-calendar-view','');
      const status = calendarNode('span','visually-hidden'); status.setAttribute('role','status');
      root.append(view,status);
      state = {view,status,focus:'',events:new Map(),dialog:null}; calendarStates.set(root,state);
    }
    const active = state.view.contains(doc.activeElement) ? doc.activeElement : null;
    const activeAction = active?.dataset.uiCalendarAction;
    restore = restore || !!active;
    state.view.replaceChildren();
    if (config.min > config.max) {
      root.dataset.uiValue='';
      owned(root,'[data-ui-calendar-input]','[data-ui-calendar]').forEach(input=>{input.value='';});
      const error=calendarNode('p','alert alert-danger','選択可能な日付の範囲を確認してください。');
      error.setAttribute('role','alert');state.view.append(error);
      return;
    }
    const selected = calendarDate(root.dataset.uiValue);
    const value = selected && selected >= config.min && selected <= config.max ? calendarISO(selected) : '';
    root.dataset.uiValue = value;
    const requested = calendarDate((root.dataset.uiMonth || '') + '-01');
    const month = calendarMonth(calendarClamp(requested || selected || config.today,config));
    const monthKey = calendarISO(month).slice(0,7);
    root.dataset.uiMonth = monthKey;
    let input = owned(root,'[data-ui-calendar-input]','[data-ui-calendar]')[0];
    if (!input && root.dataset.uiName) {
      input = doc.createElement('input'); input.type='hidden'; input.setAttribute('data-ui-calendar-input',''); root.append(input);
    }
    if (input) { input.value = value; if (root.dataset.uiName) input.name = root.dataset.uiName; }
    const events = new Map();
    for (const list of owned(root,'[data-ui-calendar-events]','[data-ui-calendar]')) {
      list.hidden = true;
      for (const item of all(list,'[data-ui-date]')) {
        if (!calendarDate(item.dataset.uiDate)) continue;
        const group = events.get(item.dataset.uiDate) || [];
        group.push({text:item.textContent.trim(),variant:['success','warning','danger','info'].includes(item.dataset.uiVariant) ? item.dataset.uiVariant : 'info'});
        events.set(item.dataset.uiDate,group);
      }
    }
    state.events=events;
    const modalOption=root.getAttribute('data-ui-calendar-modal');
    const modalEnabled=modalOption!==null && modalOption!=='false';
    const toolbar = calendarNode('div','ui-calendar-toolbar');
    const title = calendarNode('h3','ui-calendar-title',new Intl.DateTimeFormat('ja-JP',{year:'numeric',month:'long'}).format(month));
    title.tabIndex = -1;
    const actions = calendarNode('div','ui-calendar-actions');
    for (const [action,label,name] of [['prev','‹','前の月'],['today','今日','今日へ移動'],['next','›','次の月']]) {
      const button = calendarNode('button','btn btn-sm btn-outline-secondary',label); button.type='button';
      button.dataset.uiCalendarAction=action; button.setAttribute('aria-label',name);
      button.disabled = action === 'prev' ? calendarMonth(month,-1) < calendarMonth(config.min) : action === 'next' ? calendarMonth(month,1) > calendarMonth(config.max) : config.today < config.min || config.today > config.max;
      actions.append(button);
    }
    toolbar.append(title,actions); state.view.append(toolbar);
    const hint = calendarNode('p','ui-calendar-hint','矢印キーで日付移動、Enterで選択。PageUp / PageDownで月を切り替えます。');
    state.view.append(hint);
    const table = calendarNode('table','ui-calendar-table');
    table.setAttribute('aria-labelledby',id(title)); table.setAttribute('aria-describedby',id(hint));
    const head=doc.createElement('thead'), headings=doc.createElement('tr');
    const weekdays=['日','月','火','水','木','金','土'];
    for(let i=0;i<7;i++) {
      const day=(i+config.start)%7;
      const cell=calendarNode('th',day===0?'is-sunday':day===6?'is-saturday':'',weekdays[day]); cell.scope='col'; headings.append(cell);
    }
    head.append(headings); table.append(head);
    const body=doc.createElement('tbody');
    const first=calendarShift(month,-((month.getDay()-config.start+7)%7));
    let focused=calendarDate(state.focus);
    if (!focused || focused.getMonth()!==month.getMonth() || focused.getFullYear()!==month.getFullYear() || focused<config.min || focused>config.max) {
      focused = value && value.slice(0,7)===monthKey ? calendarDate(value) : calendarISO(config.today).slice(0,7)===monthKey ? calendarClamp(config.today,config) : calendarClamp(month,config);
    }
    state.focus=calendarISO(focused);
    for(let week=0;week<6;week++) {
      const row=doc.createElement('tr');
      for(let day=0;day<7;day++) {
        const date=calendarShift(first,week*7+day), key=calendarISO(date), entries=events.get(key)||[];
        const cell=doc.createElement('td');
        const button=calendarNode('button','ui-calendar-day'); button.type='button'; button.dataset.uiCalendarDate=key;
        button.disabled=date<config.min || date>config.max;
        button.tabIndex=key===state.focus && !button.disabled ? 0 : -1;
        button.classList.toggle('is-outside',date.getMonth()!==month.getMonth());
        button.classList.toggle('is-sunday',date.getDay()===0);button.classList.toggle('is-saturday',date.getDay()===6);
        button.setAttribute('aria-pressed',String(key===value));
        if(modalEnabled)button.setAttribute('aria-haspopup','dialog');
        const today=key===calendarISO(config.today);
        if(today)button.setAttribute('aria-current','date');
        button.setAttribute('aria-label',calendarLabel(date)+(today?'・今日':'')+(entries.length?'・'+entries.length+'件の予定':'')+(button.disabled?'・選択範囲外':''));
        button.append(calendarNode('span','ui-calendar-number',String(date.getDate())));
        if(entries.length) {
          const preview=calendarNode('span','ui-calendar-preview'); preview.setAttribute('aria-hidden','true');
          for(const entry of entries.slice(0,2))preview.append(calendarNode('span','ui-calendar-event is-'+entry.variant,entry.text));
          preview.append(calendarNode('span','ui-calendar-event-count',entries.length+'件'));
          button.append(preview);
        }
        cell.append(button);row.append(cell);
      }
      body.append(row);
    }
    table.append(body); state.view.append(table);
    const agenda=calendarNode('section','ui-calendar-agenda');agenda.hidden=modalEnabled;
    const agendaTitle=calendarNode('h4','ui-calendar-agenda-title',value?calendarLabel(calendarDate(value))+'の予定':'日付を選択してください');
    agenda.setAttribute('aria-labelledby',id(agendaTitle));agenda.append(agendaTitle);
    if(value) {
      const selectedEvents=events.get(value)||[];
      if(selectedEvents.length) {
        const list=calendarNode('ul','ui-calendar-agenda-list');
        selectedEvents.forEach(entry=>list.append(calendarNode('li','ui-calendar-agenda-event is-'+entry.variant,entry.text)));agenda.append(list);
      } else agenda.append(calendarNode('p','ui-calendar-empty','予定はありません。'));
    }
    state.view.append(agenda);
    if(restore) {
      const action=activeAction && state.view.querySelector('[data-ui-calendar-action="'+activeAction+'"]');
      const day=state.view.querySelector('[data-ui-calendar-date="'+state.focus+'"]');
      (action && !action.disabled ? action : activeAction ? title : day)?.focus();
    }
  }
  function changeCalendarMonth(root, date, restore = true) {
    const state=calendarStates.get(root), config=calendarConfig(root);
    const old=root.dataset.uiMonth;
    const clamped=calendarClamp(date,config);
    root.dataset.uiMonth=calendarISO(clamped).slice(0,7);
    if(state)state.focus=calendarISO(clamped);
    renderCalendar(root,restore);
    if(old!==root.dataset.uiMonth) {
      motion(state.view,[{opacity:.35,translate:(old < root.dataset.uiMonth ? '6px 0' : '-6px 0')},{opacity:1,translate:'0 0'}]);
      state.status.textContent=root.dataset.uiMonth.replace('-','年')+'月を表示';
      emit(root,'monthchange',{month:root.dataset.uiMonth});
    }
  }
  function openCalendarDay(root,value) {
    const option=root.getAttribute('data-ui-calendar-modal'),state=calendarStates.get(root);
    if(option===null || option==='false' || !state || !root.isConnected)return;
    let dialog;
    if(option==='' || option==='true') {
      dialog=state.dialog;
      if(!dialog) {
        dialog=calendarNode('dialog','ui-dialog ui-calendar-modal');dialog.dataset.uiDialog='';
        const title=calendarNode('h2');title.dataset.uiCalendarModalTitle='';title.tabIndex=-1;title.setAttribute('autofocus','');
        dialog.setAttribute('aria-labelledby',id(title));
        const content=calendarNode('div');content.dataset.uiCalendarModalEvents='';
        const actions=calendarNode('div','buttons');
        const close=calendarNode('button','btn btn-sm btn-outline-secondary','閉じる');close.type='button';close.dataset.uiDismiss='dialog';
        actions.append(close);dialog.append(title,content,actions);root.append(dialog);state.dialog=dialog;
      }
    } else dialog=query(option);
    if(dialog?.tagName!=='DIALOG') {
      state.status.textContent='日付詳細のモーダルが見つかりません。';state.view.querySelector('.ui-calendar-agenda').hidden=false;return;
    }
    dialog.classList.add('ui-calendar-modal');dialog.dataset.uiDialog='';dialog.dataset.uiCalendarModalValue=value;
    const entries=state.events.get(value)||[];
    all(dialog,'[data-ui-calendar-modal-title]').forEach(title=>{title.textContent=calendarLabel(calendarDate(value))+'の予定';});
    all(dialog,'[data-ui-calendar-modal-events]').forEach(content=>{
      content.replaceChildren();
      if(entries.length) {
        const list=calendarNode('ul','ui-calendar-agenda-list');
        entries.forEach(entry=>list.append(calendarNode('li','ui-calendar-agenda-event is-'+entry.variant,entry.text)));content.append(list);
      } else content.append(calendarNode('p','ui-calendar-empty','予定はありません。'));
    });
    const opener=state.view.querySelector('[data-ui-calendar-date="'+value+'"]');
    if(dialog.open)openers.set(dialog,opener);else show(dialog,opener);
    emit(root,'dayopen',{value,dialog,events:entries.map(entry=>({...entry}))});
  }
  function selectCalendarDate(root,date) {
    const config=calendarConfig(root);
    if(date<config.min || date>config.max)return;
    const previousValue=root.dataset.uiValue||'',value=calendarISO(date);
    root.dataset.uiValue=value;
    changeCalendarMonth(root,date,true);
    const state=calendarStates.get(root);
    motion(state.view.querySelector('[aria-pressed="true"]'),[{scale:.9},{scale:1}],160);
    state.status.textContent=calendarLabel(date)+'を選択しました';
    emit(root,'dateselect',{value,previousValue});
    if(previousValue!==value) {
      const input=owned(root,'[data-ui-calendar-input]','[data-ui-calendar]')[0];
      if(input){input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));}
      emit(root,'datechange',{value,previousValue});
    }
    openCalendarDay(root,value);
  }
  doc.addEventListener('click',event=>{
    const button=closest(event.target,'[data-ui-calendar-action], [data-ui-calendar-date]');
    const root=button?.closest('[data-ui-calendar]');
    if(!root || disabled(button))return;
    event.preventDefault();
    if(!calendarStates.has(root))renderCalendar(root);
    const action=button.dataset.uiCalendarAction;
    if(action==='today')selectCalendarDate(root,calendarConfig(root).today);
    else if(action)changeCalendarMonth(root,calendarMonth(calendarDate(root.dataset.uiMonth+'-01'),action==='prev'?-1:1));
    else {const date=calendarDate(button.dataset.uiCalendarDate);if(date)selectCalendarDate(root,date);}
  });
  doc.addEventListener('keydown',event=>{
    const button=closest(event.target,'[data-ui-calendar-date]');
    const root=button?.closest('[data-ui-calendar]');
    if(!root || disabled(button))return;
    const current=calendarDate(button.dataset.uiCalendarDate),config=calendarConfig(root);
    let next;
    const offsets={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7};
    if(event.key in offsets)next=calendarShift(current,offsets[event.key]);
    if(event.key==='Home')next=calendarShift(current,-((current.getDay()-config.start+7)%7));
    if(event.key==='End')next=calendarShift(current,6-((current.getDay()-config.start+7)%7));
    if(event.key==='PageUp' || event.key==='PageDown') {
      next=calendarMonth(current,(event.key==='PageUp'?-1:1)*(event.shiftKey?12:1));
      const last=calendarShift(calendarMonth(next,1),-1).getDate();next.setDate(Math.min(current.getDate(),last));
    }
    if(!next)return;
    event.preventDefault();changeCalendarMonth(root,next,true);
  });

  // A real date input owns form values/constraints; the calendar is an optional picker.
  const datepickerStates = new WeakMap();
  let activeDatepicker = null;
  const datepickerLocked = input => input.readOnly || input.matches(':disabled');
  function syncDatepicker(state, resetMonth = false) {
    const {input,calendar,toggle,clear} = state;
    calendar.dataset.uiWeekStart=state.root.dataset.uiWeekStart || 'sunday';
    toggle.disabled = datepickerLocked(input);
    clear.disabled = datepickerLocked(input) || !input.value;
    for (const [attribute,value] of [['data-ui-value',input.value],['data-ui-min',input.min],['data-ui-max',input.max]]) {
      if(value)calendar.setAttribute(attribute,value);else calendar.removeAttribute(attribute);
    }
    if(resetMonth) {
      const selected=calendarDate(input.value);
      calendar.dataset.uiMonth=calendarISO(selected || calendarConfig(calendar).today).slice(0,7);
      const calendarState=calendarStates.get(calendar);if(calendarState)calendarState.focus=input.value;
    }
    renderCalendar(calendar);
  }
  function positionDatepicker(state) {
    const {root,popup} = state;
    const box=root.getBoundingClientRect();
    const below=Math.max(0,window.innerHeight-box.bottom-8);
    const above=Math.max(0,Math.min(box.top,window.innerHeight)-8);
    const natural=popup.getBoundingClientRect().height;
    const placeBelow=below>=natural || below>=above;
    const available=Math.min(window.innerHeight-16,Math.max(80,placeBelow?below:above));
    popup.style.maxHeight=Math.max(0,available)+'px';
    const bounds=popup.getBoundingClientRect();
    popup.style.left=Math.max(8,Math.min(box.left,window.innerWidth-bounds.width-8))+'px';
    const desired=placeBelow?box.bottom+8:box.top-bounds.height-8;
    popup.style.top=Math.max(8,Math.min(desired,window.innerHeight-bounds.height-8))+'px';
  }
  function closeDatepicker(state, restore = false) {
    if(!state)return;
    if(state.open)exitMotion(state.popup);
    state.open=false;
    if(state.popup.hidePopover && state.popup.matches(':popover-open'))state.popup.hidePopover();
    else state.popup.hidden=true;
    state.toggle.setAttribute('aria-expanded','false');
    if(activeDatepicker===state)activeDatepicker=null;
    if(restore && state.input.isConnected)state.input.focus();
  }
  function openDatepicker(root) {
    const state=initDatepicker(root);
    if(!state || datepickerLocked(state.input))return;
    if(state.open){closeDatepicker(state,true);return;}
    if(activeDatepicker)closeDatepicker(activeDatepicker);
    cancelExit(state.popup);
    syncDatepicker(state,true);
    state.popup.style.maxHeight='calc(100dvh - 16px)';
    state.popup.hidden=false;
    if(state.popup.showPopover)state.popup.showPopover();
    state.open=true;activeDatepicker=state;
    state.toggle.setAttribute('aria-expanded','true');
    positionDatepicker(state);
    (state.calendar.querySelector('[data-ui-calendar-date][tabindex="0"]') || state.popup.querySelector('button:not(:disabled)'))?.focus();
  }
  function updateDatepickerButton(state) {
    const icon=state.root.dataset.uiDatepickerButton === 'icon';
    if(state.iconMode===icon)return;
    state.iconMode=icon;
    state.toggle.classList.toggle('ui-datepicker-toggle-icon',icon);
    state.toggle.replaceChildren();
    if(icon) {
      const svg=doc.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
      const path=doc.createElementNS('http://www.w3.org/2000/svg','path');
      path.setAttribute('d','M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m0 16H5V10h14v10m0-12H5V6h14v2M7 12h5v5H7z');
      svg.append(path);state.toggle.append(svg);
      state.toggle.title=state.toggle.getAttribute('aria-label');
    } else {
      state.toggle.textContent='カレンダー';state.toggle.removeAttribute('title');
    }
  }
  function initDatepicker(root) {
    let state=datepickerStates.get(root);
    if(state){
      state.toggle.disabled=datepickerLocked(state.input);
      updateDatepickerButton(state);
      if(state.open){if(state.toggle.disabled)closeDatepicker(state);else syncDatepicker(state,state.calendar.dataset.uiValue!==state.input.value);}
      return state;
    }
    const input=all(root,'input[type="date"]').find(field=>field.closest('[data-ui-datepicker]')===root);
    if(!input)return null;
    root.classList.add('ui-datepicker');
    const name=input.getAttribute('aria-label') || input.labels?.[0]?.textContent.trim() || '日付';
    const toggle=calendarNode('button','btn btn-outline-secondary ui-datepicker-toggle','カレンダー');
    toggle.type='button';toggle.setAttribute('data-ui-datepicker-action','toggle');
    toggle.setAttribute('aria-label',name+'のカレンダーを開く');toggle.setAttribute('aria-haspopup','dialog');toggle.setAttribute('aria-expanded','false');
    const popup=calendarNode('div','ui-datepicker-popup');popup.hidden=true;popup.setAttribute('popover','auto');popup.setAttribute('role','dialog');popup.setAttribute('aria-label',name+'を選択');
    const calendar=calendarNode('div','ui-calendar ui-calendar-compact');calendar.setAttribute('data-ui-calendar','');
    if(root.dataset.uiWeekStart)calendar.dataset.uiWeekStart=root.dataset.uiWeekStart;
    const footer=calendarNode('div','ui-datepicker-footer');
    const clear=calendarNode('button','btn btn-sm btn-outline-secondary','クリア');clear.type='button';clear.setAttribute('data-ui-datepicker-action','clear');
    const close=calendarNode('button','btn btn-sm btn-outline-secondary','閉じる');close.type='button';close.setAttribute('data-ui-datepicker-action','close');
    footer.append(clear,close);popup.append(calendar,footer);root.append(toggle,popup);
    toggle.setAttribute('aria-controls',id(popup));
    state={root,input,toggle,popup,calendar,clear,open:false,syncing:false};datepickerStates.set(root,state);
    updateDatepickerButton(state);
    toggle.disabled=datepickerLocked(input);
    popup.addEventListener('toggle',event=>{
      if(event.newState==='closed' && state.open){state.open=false;toggle.setAttribute('aria-expanded','false');if(activeDatepicker===state)activeDatepicker=null;}
    });
    return state;
  }
  function setDatepickerValue(state,value) {
    if(datepickerLocked(state.input)){closeDatepicker(state);return;}
    const previousValue=state.input.value;
    state.input.value=value;
    state.syncing=true;
    try {
      if(previousValue!==state.input.value){state.input.dispatchEvent(new Event('input',{bubbles:true}));state.input.dispatchEvent(new Event('change',{bubbles:true}));}
    } finally {state.syncing=false;}
    closeDatepicker(state,true);
  }
  doc.addEventListener('click',event=>{
    const button=closest(event.target,'[data-ui-datepicker-action]');
    const root=button?.closest('[data-ui-datepicker]');
    if(!root || disabled(button))return;
    event.preventDefault();
    const state=initDatepicker(root);if(!state)return;
    if(button.dataset.uiDatepickerAction==='toggle')openDatepicker(root);
    else if(button.dataset.uiDatepickerAction==='clear')setDatepickerValue(state,'');
    else closeDatepicker(state,true);
  });
  doc.addEventListener('ui:dateselect',event=>{
    const root=closest(event.target,'[data-ui-datepicker]');
    const state=root && datepickerStates.get(root);
    if(state?.calendar===event.target){
      setDatepickerValue(state,event.detail.value);
    }
  });
  doc.addEventListener('input',event=>{
    const root=closest(event.target,'[data-ui-datepicker]'),state=root && datepickerStates.get(root);
    if(state && event.target===state.input && !state.syncing && state.open)syncDatepicker(state,true);
  });
  doc.addEventListener('change',event=>{
    const root=closest(event.target,'[data-ui-datepicker]'),state=root && datepickerStates.get(root);
    if(state && event.target===state.input && !state.syncing && state.open)syncDatepicker(state,true);
  });
  doc.addEventListener('keydown',event=>{
    const root=closest(event.target,'[data-ui-datepicker]'),state=root && datepickerStates.get(root);
    if(!state)return;
    if(event.key==='Escape' && state.open){event.preventDefault();event.stopPropagation();closeDatepicker(state,true);}
    if(event.key==='ArrowDown' && event.altKey && event.target===state.input){event.preventDefault();openDatepicker(root);}
  });
  doc.addEventListener('pointerdown',event=>{if(activeDatepicker && !activeDatepicker.root.contains(event.target))closeDatepicker(activeDatepicker);});
  doc.addEventListener('focusout',event=>{
    const state=activeDatepicker;
    if(state && state.root.contains(event.target) && event.relatedTarget && !state.root.contains(event.relatedTarget))closeDatepicker(state);
  });
  doc.addEventListener('reset',event=>{
    queueMicrotask(()=>{
      if(event.defaultPrevented)return;
      all(event.target,'[data-ui-datepicker]').forEach(root=>{
        const state=datepickerStates.get(root);if(!state)return;
        closeDatepicker(state);state.input.removeAttribute('aria-invalid');
        const error=state.input.closest('[data-ui-field]')?.querySelector('[data-ui-error]');
        if(error){error.hidden=true;error.textContent='';}
      });
    });
  });
  window.addEventListener('resize',()=>{if(activeDatepicker)positionDatepicker(activeDatepicker);});
  doc.addEventListener('scroll',event=>{
    if(activeDatepicker && !activeDatepicker.popup.contains(event.target))positionDatepicker(activeDatepicker);
  },true);

  // Saves the pre-request state once; repeated starts do not overwrite it.
  const loadingStates = new WeakMap();
  function loading(target, active = true) {
    const element = typeof target === 'string' ? query(target) : target;
    if (!(element instanceof Element)) return false;
    if (active) {
      if (!loadingStates.has(element)) loadingStates.set(element, {
        busy:element.getAttribute('aria-busy'),
        disabled:element instanceof HTMLButtonElement ? element.disabled : null
      });
      element.setAttribute('aria-busy', 'true');
      if (element instanceof HTMLButtonElement) element.disabled = true;
    } else {
      const previous = loadingStates.get(element);
      if (!previous) return false;
      if (previous.busy === null) element.removeAttribute('aria-busy');
      else element.setAttribute('aria-busy', previous.busy);
      if (previous.disabled !== null) element.disabled = previous.disabled;
      loadingStates.delete(element);
    }
    return true;
  }

  // Keep native form values and constraints; render the single-select popup ourselves.
  const selectControls = new WeakMap();
  let openSelect = null;
  function syncSelect(select) { selectControls.get(select)?.sync(); }
  function initSelect(select) {
    if (selectControls.has(select)) { syncSelect(select); return; }
    if (select.multiple || select.size > 1 || !HTMLElement.prototype.showPopover) return;
    const wrapper = doc.createElement('span'); wrapper.className = 'ui-select';
    const button = doc.createElement('button'); button.type = 'button';
    button.className = select.className;
    button.classList.add('form-select','ui-select-trigger');
    if(select.hasAttribute('tabindex'))button.tabIndex=select.tabIndex;
    if(select.classList.contains('w-auto'))wrapper.classList.add('w-auto');
    button.style.cssText = select.style.cssText;
    if (select.style.width) wrapper.style.width = select.style.width;
    button.setAttribute('role','combobox'); button.setAttribute('aria-haspopup','listbox');
    button.setAttribute('aria-expanded','false');
    const popup = doc.createElement('div'); popup.className = 'ui-select-menu';
    popup.setAttribute('popover','auto'); popup.setAttribute('role','listbox');
    button.setAttribute('aria-controls',id(popup));
    select.before(wrapper); wrapper.append(select, button, popup);
    select.classList.add('ui-select-native'); select.tabIndex = -1;
    select.setAttribute('aria-hidden','true');
    let active = -1, search = '', searchedAt = 0, nativeError = null;
    const enabled = option => !!option && !option.disabled && !option.hidden && !option.closest('optgroup')?.disabled && !option.closest('optgroup')?.hidden;
    const isOpen = () => popup.matches(':popover-open');
    function syncControl() {
      button.disabled = select.matches(':disabled');
      wrapper.hidden=select.hidden;
      button.textContent = select.selectedOptions[0]?.label || '選択してください';
      const labels = [...(select.labels || [])];
      const labelText=labels.map(label=>{const clone=label.cloneNode(true);all(clone,'select, input, textarea, button, .ui-select, .ui-invalid-feedback, [data-ui-error]').forEach(node=>node.remove());return clone.textContent.trim();}).join(' ');
      const labelledby = select.getAttribute('aria-labelledby');
      if (labelledby) button.setAttribute('aria-labelledby',labelledby);
      else {button.removeAttribute('aria-labelledby');button.setAttribute('aria-label',select.getAttribute('aria-label') || labelText || '選択してください');}
      for (const attribute of ['aria-describedby','aria-invalid']) {
        if(select.hasAttribute(attribute)) button.setAttribute(attribute,select.getAttribute(attribute));
        else button.removeAttribute(attribute);
      }
      button.setAttribute('aria-required',String(select.required));
      popup.setAttribute('aria-label',select.getAttribute('aria-label') || labelText || '選択肢');
      if(nativeError) {
        nativeError.hidden=select.validity.valid;
        if(!select.validity.valid) {describedBy(button,id(nativeError),true);button.setAttribute('aria-invalid','true');}
      }
      if (button.disabled && isOpen()) close();
    }
    function highlight(index) {
      active = index;
      all(popup,'[role="option"]').forEach(item=>item.classList.toggle('is-active',Number(item.dataset.index)===active));
      const item = popup.querySelector('[data-index="'+active+'"]');
      if(item) { button.setAttribute('aria-activedescendant',item.id); item.scrollIntoView({block:'nearest'}); }
      else button.removeAttribute('aria-activedescendant');
    }
    function render() {
      popup.replaceChildren();
      for (const child of select.children) {
        if(child.hidden)continue;
        if(child.tagName==='OPTGROUP') {
          const heading=doc.createElement('div');heading.className='ui-select-group';heading.textContent=child.label;popup.append(heading);
        }
        const options=child.tagName==='OPTGROUP'?[...child.children]:[child];
        for(const option of options) {
          if(option.tagName!=='OPTION' || option.hidden) continue;
          const item=doc.createElement('div');item.className='ui-select-option';
          item.setAttribute('role','option');item.setAttribute('aria-selected',String(option.selected));
          item.setAttribute('aria-disabled',String(!enabled(option)));id(item);
          item.dataset.index=String([...select.options].indexOf(option));item.textContent=option.label;
          popup.append(item);
        }
      }
    }
    function close() {
      if(isOpen()) { exitMotion(popup); popup.hidePopover(); }
      button.setAttribute('aria-expanded','false');button.removeAttribute('aria-activedescendant');
      if(openSelect?.select===select) openSelect=null;
    }
    function open() {
      syncControl();if(button.disabled || isOpen())return;
      openSelect?.close();render();popup.showPopover();
      const r=button.getBoundingClientRect(), gap=6, margin=8;
      const width=Math.min(Math.max(r.width,180),innerWidth-margin*2);
      const below=innerHeight-r.bottom-gap-margin, above=r.top-gap-margin;
      const upwards=below<Math.min(popup.scrollHeight,220) && above>below;
      const height=Math.min(320,Math.max(40,upwards?above:below));
      Object.assign(popup.style,{width:width+'px',maxHeight:height+'px',left:Math.max(margin,Math.min(r.left,innerWidth-width-margin))+'px',top:'0px'});
      popup.style.top=(upwards?Math.max(margin,r.top-gap-popup.getBoundingClientRect().height):r.bottom+gap)+'px';
      button.setAttribute('aria-expanded','true');openSelect={select,popup,close};
      const index=enabled(select.options[select.selectedIndex])?select.selectedIndex:[...select.options].findIndex(enabled);
      highlight(index);enterMotion(popup);
    }
    function commit(index) {
      const option=select.options[index];if(!option || !enabled(option))return;
      const previous=select.selectedIndex;select.selectedIndex=index;close();syncControl();
      if(previous!==index) {
        select.dispatchEvent(new Event('input',{bubbles:true}));select.dispatchEvent(new Event('change',{bubbles:true}));
      }
      button.focus();
    }
    button.addEventListener('click',()=>{if(isOpen())close();else open();});
    button.addEventListener('keydown',event=>{
      const options=[...select.options];
      if(event.key==='Escape' && isOpen()) { event.preventDefault();event.stopPropagation();close();return; }
      if(event.key==='Tab') { close();return; }
      if(['Enter',' '].includes(event.key)) {
        event.preventDefault();if(isOpen())commit(active);else open();return;
      }
      if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)) {
        event.preventDefault();const wasOpen=isOpen();if(!wasOpen)open();
        const indices=options.map((option,index)=>enabled(option)?index:-1).filter(index=>index>=0);
        let position=indices.indexOf(active);
        if(event.key==='Home')position=0;
        else if(event.key==='End')position=indices.length-1;
        else position=Math.max(0,Math.min(indices.length-1,position+(event.key==='ArrowDown'?1:-1)));
        highlight(indices[position]??-1);return;
      }
      if(event.key.length===1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();if(!isOpen())open();
        const now=Date.now();search=(now-searchedAt>700?'':search)+event.key.toLocaleLowerCase();searchedAt=now;
        const index=options.findIndex(option=>enabled(option) && option.label.toLocaleLowerCase().startsWith(search));
        if(index>=0)highlight(index);
      }
    });
    popup.addEventListener('pointerdown',event=>event.preventDefault());
    popup.addEventListener('click',event=>{
      const item=closest(event.target,'[role="option"]');if(item)commit(Number(item.dataset.index));
    });
    popup.addEventListener('toggle',()=>{if(!isOpen()){button.setAttribute('aria-expanded','false');button.removeAttribute('aria-activedescendant');if(openSelect?.select===select)openSelect=null;}});
    button.addEventListener('blur',close);
    select.addEventListener('focus',()=>button.focus());
    select.addEventListener('change',syncControl);
    select.addEventListener('input',syncControl);
    select.addEventListener('invalid',event=>{
      event.preventDefault();button.setAttribute('aria-invalid','true');
      if(!select.closest('form[data-ui-validate]')) {
        if(!nativeError) {nativeError=doc.createElement('small');nativeError.className='ui-invalid-feedback';nativeError.setAttribute('role','alert');wrapper.after(nativeError);}
        nativeError.hidden=false;nativeError.textContent=select.dataset.uiMessage || select.validationMessage;describedBy(button,id(nativeError),true);
      }
      button.focus();
    });
    for(const label of select.labels || [])label.addEventListener('click',event=>{
      if(event.target===label || !closest(event.target,'button, select, a, input, textarea')){event.preventDefault();button.focus();}
    });
    select.form?.addEventListener('reset',()=>setTimeout(()=>{close();syncControl();},0));
    const observer=new MutationObserver(()=>{syncControl();if(isOpen()){render();highlight(select.selectedIndex);}});
    observer.observe(select,{attributes:true,childList:true,subtree:true,characterData:true});
    for(let parent=select.parentElement;parent;parent=parent.parentElement)if(parent.tagName==='FIELDSET')observer.observe(parent,{attributes:true,attributeFilter:['disabled']});
    selectControls.set(select,{sync:syncControl});syncControl();
  }
  window.addEventListener('resize',()=>openSelect?.close());
  doc.addEventListener('scroll',event=>{if(openSelect && !openSelect.popup.contains(event.target))openSelect.close();},true);

  const inputPickers = new WeakMap();
  let activeInputPicker = null;
  const pickerTypes = {time:'時刻', 'datetime-local':'日時', month:'月', week:'週', color:'色'};
  function initInputPicker(input) {
    if(inputPickers.has(input)) { inputPickers.get(input).sync(); return; }
    const type=input.getAttribute('type');
    if(!pickerTypes[type] || !HTMLElement.prototype.showPopover)return;
    const root=calendarNode('span','ui-input-picker');
    const trigger=calendarNode('button',input.className+' ui-input-picker-trigger');trigger.type='button';
    trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-expanded','false');
    if(input.hasAttribute('tabindex'))trigger.tabIndex=input.tabIndex;
    const popup=calendarNode('div','ui-input-popup');popup.setAttribute('popover','auto');popup.setAttribute('role','dialog');
    trigger.setAttribute('aria-controls',id(popup));
    input.before(root);root.append(input,trigger,popup);
    input.classList.add('ui-picker-native');input.tabIndex=-1;input.setAttribute('aria-hidden','true');
    const state={root,input,trigger,popup,sync};inputPickers.set(input,state);
    let controls={},error=null,pointerWasOpen=false;
    const locked=()=>input.matches(':disabled') || input.readOnly;
    const opened=()=>popup.matches(':popover-open');
    const pad=value=>String(value).padStart(2,'0');
    function labelText() {
      return input.getAttribute('aria-label') || [...(input.labels || [])].map(label=>{
        const clone=label.cloneNode(true);all(clone,'input, button, select, .ui-input-picker, [data-ui-error], small').forEach(node=>node.remove());return clone.textContent.trim();
      }).join(' ') || pickerTypes[type];
    }
    function sync() {
      root.hidden=input.hidden;trigger.disabled=locked();
      const value=input.value;
      trigger.textContent=value || pickerTypes[type]+'を選択';
      if(type==='color') {const swatch=calendarNode('span','ui-color-preview');swatch.style.backgroundColor=value;swatch.setAttribute('aria-hidden','true');trigger.prepend(swatch);}
      trigger.setAttribute('aria-label',labelText()+'：'+(value || '未選択'));
      popup.setAttribute('aria-label',labelText()+'を選択');
      for(const attribute of ['aria-describedby','aria-invalid']) {
        if(input.hasAttribute(attribute))trigger.setAttribute(attribute,input.getAttribute(attribute));else trigger.removeAttribute(attribute);
      }
      const feedback=root.nextElementSibling;
      if(feedback?.hasAttribute('data-ui-picker-error') && input.validity.valid)feedback.hidden=true;
      if(locked() && opened())close();
    }
    function position() {
      const r=trigger.getBoundingClientRect();
      popup.style.maxHeight=(innerHeight-16)+'px';
      const below=innerHeight-r.bottom-8,above=r.top-8;
      const down=popup.getBoundingClientRect().height<=below || below>=above;
      popup.style.maxHeight=Math.max(0,Math.min(innerHeight-16,down?below:above))+'px';
      const box=popup.getBoundingClientRect();
      popup.style.left=Math.max(8,Math.min(r.left,innerWidth-box.width-8))+'px';
      popup.style.top=Math.max(8,Math.min(down?r.bottom+8:r.top-box.height-8,innerHeight-box.height-8))+'px';
    }
    function close(restore=false) {
      if(opened()){openSelect?.close();exitMotion(popup);popup.hidePopover();}
      trigger.setAttribute('aria-expanded','false');if(activeInputPicker===state)activeInputPicker=null;
      if(restore && trigger.isConnected)trigger.focus();
    }
    state.close=close;state.position=position;
    function field(title,part,tag='select') {
      const label=calendarNode('label','ui-picker-field',title);
      const field=calendarNode(tag,tag==='select'?'form-select form-select-sm':'form-control form-control-sm');
      field.dataset.uiPickerPart=part;
      // Draft controls must not participate in the owning form's native validation.
      field.setAttribute('form',popup.id+'-draft');
      if(tag==='input')field.type='number';
      label.append(field);controls[part]=field;return label;
    }
    function options(select,count,start=0,format=String) {
      for(let n=start;n<start+count;n++)select.add(new Option(format(n),String(n)));
    }
    function weeksIn(year) {
      const first=new Date(0);first.setUTCFullYear(year,0,1);const day=first.getUTCDay();
      return day===4 || (day===3 && year%4===0 && (year%100!==0 || year%400===0))?53:52;
    }
    function refreshWeeks() {
      if(!controls.week)return;
      const previous=Number(controls.week.value)||1;controls.week.replaceChildren();
      options(controls.week,weeksIn(Number(controls.year.value)||new Date().getFullYear()),1,n=>'第'+n+'週');
      controls.week.value=String(Math.min(previous,controls.week.options.length));syncSelect(controls.week);
    }
    function render() {
      popup.replaceChildren();controls={};
      const now=new Date(),value=input.value;
      if(type==='datetime-local') {
        const calendar=calendarNode('div','ui-calendar ui-calendar-compact');calendar.dataset.uiCalendar='';
        calendar.dataset.uiValue=value.slice(0,10)||calendarISO(now);calendar.dataset.uiMonth=calendar.dataset.uiValue.slice(0,7);
        if(input.min)calendar.dataset.uiMin=input.min.slice(0,10);if(input.max)calendar.dataset.uiMax=input.max.slice(0,10);
        controls.calendar=calendar;popup.append(calendar);renderCalendar(calendar);
      }
      const row=calendarNode('div','ui-picker-fields');
      if(type==='month' || type==='week') {
        row.append(field('年','year','input'),field(type==='month'?'月':'週',type));
        Object.assign(controls.year,{min:'1',max:'9999',step:'1',value:value.slice(0,4)||String(now.getFullYear())});
        if(type==='month') {options(controls.month,12,1,n=>n+'月');controls.month.value=String(Number(value.slice(5,7))||now.getMonth()+1);}
        else {refreshWeeks();controls.week.value=String(Number(value.slice(6,8))||1);controls.year.addEventListener('input',refreshWeeks);}
      }
      if(type==='time' || type==='datetime-local') {
        row.append(field('時','hour'),field('分','minute'));
        options(controls.hour,24,0,pad);options(controls.minute,60,0,pad);
        const time=(type==='time'?value:value.split('T')[1]) || '09:00';
        controls.hour.value=String(Number(time.slice(0,2)));controls.minute.value=String(Number(time.slice(3,5)));
        if(input.step==='any' || (input.step && Number(input.step)<60) || time.length>5) {
          row.append(field('秒','second','input'));Object.assign(controls.second,{min:'0',max:'59.999',step:'0.001',value:String(Number(time.slice(6))||0)});
        }
      }
      if(type==='color') {
        const palette=calendarNode('div','ui-color-palette');palette.setAttribute('role','group');palette.setAttribute('aria-label','色の候補');
        for(const color of ['#2f6fc4','#6b9de0','#2b95a9','#3d9a63','#d4a537','#cf4f4f','#a86cc1','#e789ab','#ffffff','#faf9f7','#c8c9cc','#8a8d94','#555961','#2b2b2e','#1b1c1e','#000000']) {
          const choice=calendarNode('button','ui-color-choice');choice.type='button';choice.style.backgroundColor=color;choice.setAttribute('aria-label',color);choice.setAttribute('aria-pressed',String(value.toLowerCase()===color));
          choice.addEventListener('click',()=>{controls.hex.value=color;all(palette,'button').forEach(button=>button.setAttribute('aria-pressed',String(button===choice)));});palette.append(choice);
        }
        popup.append(palette);row.append(field('カラーコード（#RRGGBB）','hex','input'));
        Object.assign(controls.hex,{type:'text',value:value||'#000000',maxLength:7,placeholder:'#2f6fc4'});controls.hex.spellcheck=false;
      }
      popup.append(row);
      error=calendarNode('p','ui-picker-error');error.hidden=true;error.setAttribute('role','alert');popup.append(error);
      const footer=calendarNode('div','ui-picker-footer');
      const clear=calendarNode('button','btn btn-sm btn-outline-secondary','クリア');clear.type='button';clear.disabled=type==='color';clear.addEventListener('click',()=>save(''));
      const cancel=calendarNode('button','btn btn-sm btn-outline-secondary','キャンセル');cancel.type='button';cancel.addEventListener('click',()=>close(true));
      const apply=calendarNode('button','btn btn-sm btn-primary','適用');apply.type='button';apply.dataset.uiPickerApply='';apply.addEventListener('click',applyDraft);
      footer.append(clear,cancel,apply);popup.append(footer);
      all(popup,'select').forEach(initSelect);
    }
    function save(value) {
      if(locked()) {close();return;}
      const previous=input.value;input.value=value;sync();close(true);
      if(previous!==input.value) {input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));}
    }
    function showError(message,field) {error.hidden=false;error.textContent=message;position();field?.focus();}
    function applyDraft() {
      if(locked()) {close();return;}
      let value='';
      if(type==='month' || type==='week') {
        if(!controls.year.validity.valid || !controls.year.value) {showError('年を1〜9999で入力してください。',controls.year);return;}
        value=String(controls.year.value).padStart(4,'0')+'-'+(type==='week'?'W':'')+pad(controls[type].value);
      } else if(type==='color') {
        value=controls.hex.value.trim();
        if(!/^#[0-9a-f]{6}$/i.test(value)) {showError('#に続けて6桁の16進数で入力してください。',controls.hex);return;}
      } else {
        if(controls.second && (!controls.second.value || !controls.second.validity.valid)) {showError('秒を0〜59.999で入力してください。',controls.second);return;}
        value=pad(controls.hour.value)+':'+pad(controls.minute.value);
        if(controls.second){const [seconds,fraction]=controls.second.value.split('.');value+=':'+pad(seconds)+(fraction?'.'+fraction:'');}
        if(type==='datetime-local')value=(controls.calendar.dataset.uiValue||'')+'T'+value;
      }
      const previous=input.value;input.value=value;
      const valid=!!input.value && input.validity.valid;
      const message=input.validationMessage;input.value=previous;
      if(!valid) {showError(message||'指定された範囲・間隔で値を選択してください。');return;}
      save(value);
    }
    function open() {
      if(locked())return;if(opened()){close(true);return;}
      activeInputPicker?.close();render();cancelExit(popup);popup.showPopover();position();
      trigger.setAttribute('aria-expanded','true');activeInputPicker=state;enterMotion(popup);
      (popup.querySelector('.ui-calendar-day[tabindex="0"]') || popup.querySelector('.ui-select-trigger, input:not(.ui-select-native), button') || popup).focus({preventScroll:true});
    }
    trigger.addEventListener('pointerdown',()=>{pointerWasOpen=opened();});
    trigger.addEventListener('pointercancel',()=>{pointerWasOpen=false;});
    trigger.addEventListener('click',()=>{if(pointerWasOpen){pointerWasOpen=false;close(true);}else open();});input.addEventListener('focus',()=>trigger.focus());
    input.addEventListener('input',sync);input.addEventListener('change',sync);
    input.addEventListener('invalid',event=>{
      event.preventDefault();trigger.setAttribute('aria-invalid','true');
      if(!input.closest('form[data-ui-validate]')) {
        let feedback=root.nextElementSibling;
        if(!feedback?.hasAttribute('data-ui-picker-error')){feedback=calendarNode('small','ui-invalid-feedback');feedback.dataset.uiPickerError='';root.after(feedback);}
        feedback.textContent=input.validationMessage;feedback.hidden=false;feedback.setAttribute('role','alert');describedBy(trigger,id(feedback),true);
      }
      trigger.focus();
    });
    popup.addEventListener('keydown',event=>{
      if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close(true);}
      else if(event.key==='Enter' && event.target.tagName==='INPUT'){event.preventDefault();applyDraft();}
    });
    popup.addEventListener('toggle',()=>{if(!opened()){trigger.setAttribute('aria-expanded','false');if(activeInputPicker===state)activeInputPicker=null;}});
    root.addEventListener('focusout',()=>setTimeout(()=>{if(opened() && !root.contains(doc.activeElement))close();},0));
    for(const label of input.labels || [])label.addEventListener('click',event=>{if(popup.contains(event.target))return;if(event.target===label || !closest(event.target,'input, button, select, a')){event.preventDefault();trigger.focus();}});
    input.form?.addEventListener('reset',()=>setTimeout(()=>{close();sync();},0));
    const observer=new MutationObserver(sync);observer.observe(input,{attributes:true});
    for(let parent=input.parentElement;parent;parent=parent.parentElement)if(parent.tagName==='FIELDSET')observer.observe(parent,{attributes:true,attributeFilter:['disabled']});
    sync();
  }
  window.addEventListener('resize',()=>activeInputPicker?.position());
  doc.addEventListener('scroll',event=>{
    if(!activeInputPicker || activeInputPicker.popup.contains(event.target))return;
    const bounds=activeInputPicker.trigger.getBoundingClientRect();
    if(bounds.bottom<0 || bounds.top>innerHeight)activeInputPicker.close();else activeInputPicker.position();
  },true);

  const mixedCheckboxes = new WeakSet();
  function initMixedCheckbox(input) {
    if(mixedCheckboxes.has(input))return;
    mixedCheckboxes.add(input);
    const initial=input.dataset.uiIndeterminate!=='false';input.indeterminate=initial;
    input.form?.addEventListener('reset',event=>setTimeout(()=>{if(!event.defaultPrevented)input.indeterminate=initial;},0));
  }
  function init(scope = doc) {
    const scan = selector => [...(scope.matches?.(selector) ? [scope] : []), ...all(scope, selector)];
    scan('[data-ui-tabs]').forEach(group => {
      const {tabs} = tabData(group);
      const tab = tabs.find(item => item.getAttribute('aria-selected') === 'true' && !disabled(item)) || tabs.find(item => !disabled(item));
      if (tab) activateTab(tab, false);
    });
    scan('[data-ui-pagination]').forEach(group => {
      renderPage(group, pageStates.get(group) || 1, false);
    });
    scan('input[type="checkbox"][data-ui-indeterminate]').forEach(initMixedCheckbox);
    scan('form[data-ui-validate]').forEach(form => { form.noValidate = true; });
    scan('[data-ui-board]').forEach(updateBoard);
    scan('[data-ui-calendar]').forEach(root => renderCalendar(root));
    scan('[data-ui-datepicker]').forEach(initDatepicker);
    scan('input.form-control[type="time"], input.form-control[type="datetime-local"], input.form-control[type="month"], input.form-control[type="week"], input.form-control[type="color"]').forEach(initInputPicker);
    scan('button[data-ui-copy], button[data-ui-copy-target]').forEach(initCopyIcon);
    syncDesignThemeControls(scope);
    syncColorThemeControls(scope);
    scan('select.form-select, select[data-ui-theme-select], select[data-ui-color-select]').forEach(initSelect);
    scan('[data-ui-toggle="collapse"], [data-ui-toggle="sidebar"]').forEach(button => {
      const panel = target(button);
      if (panel) sync(panel);
    });
  }
  const designThemes = ['default', 'glass', 'glassmorphism', 'flat', 'soft'];
  function syncDesignThemeControls(scope = doc) {
    const value = doc.body.dataset.uiTheme || 'default';
    if (scope.matches?.('select[data-ui-theme-select]')) scope.value = value;
    all(scope, 'select[data-ui-theme-select]').forEach(select => { select.value = value; syncSelect(select); });
    if (scope.matches?.('select[data-ui-theme-select]')) syncSelect(scope);
    [...(scope.matches?.('[data-ui-design]')?[scope]:[]),...all(scope, '[data-ui-design]')].forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.uiDesign===value)));
  }
  function applyDesignTheme(theme, notify = true) {
    const before = doc.body.dataset.uiTheme || 'default';
    doc.body.dataset.uiTheme = theme;
    syncDesignThemeControls();
    if (notify && before !== theme) { enterMotion(doc.body); emit(doc.body, 'designchange', {theme}); }
  }
  function setDesignTheme(theme, {persist = false} = {}) {
    if (!designThemes.includes(theme)) return false;
    applyDesignTheme(theme);
    if (persist) {
      try { localStorage.setItem('orchtop-design-theme', theme); } catch { /* Theme selection still works without storage. */ }
    }
    return true;
  }
  doc.addEventListener('change', event => {
    const select = closest(event.target, 'select[data-ui-theme-select]');
    if (!select || disabled(select)) return;
    setDesignTheme(select.value, {persist:doc.body.hasAttribute('data-ui-theme-persist')});
    syncDesignThemeControls();
  });
  // Store the selected preference separately from the resolved light/dark palette.
  const preference = window.matchMedia('(prefers-color-scheme: dark)');
  const colorModes = ['light','dark','system'];
  let chosen = null;
  try { chosen = localStorage.getItem('orchtop-theme'); } catch { /* Storage is optional. */ }
  if (!colorModes.includes(chosen)) chosen = 'system';
  const resolvedColorTheme = () => chosen === 'system' ? (preference.matches ? 'dark' : 'light') : chosen;
  function syncColorThemeControls(scope = doc) {
    [...(scope.matches?.('button[data-ui-color-mode]')?[scope]:[]),...all(scope,'button[data-ui-color-mode]')].forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.uiColorMode===chosen)));
    [...(scope.matches?.('select[data-ui-color-select]')?[scope]:[]),...all(scope,'select[data-ui-color-select]')].forEach(select=>{select.value=chosen;syncSelect(select);});
  }
  function setColorTheme(mode, {persist = false} = {}) {
    if(!colorModes.includes(mode))return false;
    chosen=mode;const theme=resolvedColorTheme();applyTheme(theme,doc.documentElement.dataset.bsTheme!==theme);
    if(persist)try {localStorage.setItem('orchtop-theme',mode);} catch { /* Storage is optional. */ }
    return true;
  }
  doc.addEventListener('change',event=>{
    const select=closest(event.target,'select[data-ui-color-select]');
    if(select && !disabled(select))setColorTheme(select.value,{persist:doc.body.hasAttribute('data-ui-theme-persist')});
  });
  doc.addEventListener('click',event=>{
    const button=closest(event.target,'button[data-ui-design], button[data-ui-color-mode]');
    if(!button || disabled(button))return;
    const persist=doc.body.hasAttribute('data-ui-theme-persist');
    if(button.hasAttribute('data-ui-design'))setDesignTheme(button.dataset.uiDesign,{persist});
    else setColorTheme(button.dataset.uiColorMode,{persist});
  });
  function applyTheme(theme, animate = false, notify = true) {
    const before=doc.documentElement.dataset.bsTheme,previousMode=doc.documentElement.dataset.uiColorPreference;
    doc.documentElement.dataset.bsTheme = theme;
    doc.documentElement.dataset.uiColorPreference = chosen;
    syncColorThemeControls();
    if (animate) enterMotion(doc.body);
    all(doc, '[data-ui-toggle="theme"]').forEach(button => {
      button.textContent = theme === 'dark' ? 'ライトに切替' : 'ダークに切替';
      button.setAttribute('aria-label',button.textContent);
    });
    if(notify && (before!==theme || previousMode!==chosen))emit(doc.body,'colorchange',{mode:chosen,theme});
  }
  preference.addEventListener('change', () => { if (chosen==='system') applyTheme(resolvedColorTheme(), true); });
  doc.addEventListener('click', event => {
    const button = closest(event.target, '[data-ui-toggle], [data-ui-dismiss], [data-ui-toast], [data-ui-tooltip], [data-ui-page], [data-ui-page-step]');
    if (!button || disabled(button)) return;
    const action = button.dataset.uiToggle;
    if (button.hasAttribute('data-ui-tooltip')) showTooltip(button);
    if (button.hasAttribute('data-ui-toast')) {
      event.preventDefault();
      toast(button.dataset.uiToast, {title:button.dataset.uiTitle, body:button.dataset.uiBody, meta:button.dataset.uiMeta, variant:button.dataset.uiVariant, duration:button.dataset.uiDuration, copy:button.hasAttribute('data-ui-toast-copy') && button.dataset.uiToastCopy !== 'false', copyText:button.dataset.uiCopyText, copyLabel:button.dataset.uiCopyLabel});
    }
    if (button.hasAttribute('data-ui-dismiss')) {
      const kind = button.dataset.uiDismiss;
      const panel = target(button) || (kind === 'dialog' ? button.closest('dialog') : button.closest(kind === 'toast' ? '.ui-toast' : '.alert'));
      if (panel) {
        event.preventDefault();
        hide(panel, button);
        if (kind === 'toast') panel.remove();
      }
    }
    if (action === 'theme') {
      event.preventDefault();
      setColorTheme(doc.documentElement.dataset.bsTheme === 'dark' ? 'light' : 'dark', {persist:true});
    } else if (action === 'tab') {
      event.preventDefault(); activateTab(button);
    } else if (['collapse','sidebar','dialog','show','hide'].includes(action)) {
      const panel = target(button);
      if (panel) {
        event.preventDefault();
        if (action === 'hide' || (['collapse','sidebar'].includes(action) && !panel.hidden)) hide(panel, button);
        else show(panel, button);
      }
    }
    if (button.hasAttribute('data-ui-page') || button.hasAttribute('data-ui-page-step')) {
      const group = button.closest('[data-ui-pagination]');
      if (!group) return;
      event.preventDefault();
      const next = button.hasAttribute('data-ui-page') ? Number(button.dataset.uiPage) : (pageStates.get(group) || 1) + Number(button.dataset.uiPageStep);
      renderPage(group, next);
      if (button.disabled) group.querySelector('[data-ui-page][aria-current]')?.focus();
    }
  });
  doc.addEventListener('keydown', event => {
    if (event.key === 'Escape' && tooltip) { hideTooltip(); event.preventDefault(); return; }
    const tab = closest(event.target, '[data-ui-toggle="tab"]');
    const group = tab?.closest('[data-ui-tabs]');
    if (!group) return;
    const tabs = tabData(group).tabs.filter(item => !disabled(item));
    const vertical = tab.closest('[role="tablist"]')?.getAttribute('aria-orientation') === 'vertical';
    const index = tabs.indexOf(tab);
    const previous = vertical ? 'ArrowUp' : 'ArrowLeft';
    const next = vertical ? 'ArrowDown' : 'ArrowRight';
    let position;
    if (event.key === next) position = (index + 1) % tabs.length;
    if (event.key === previous) position = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') position = 0;
    if (event.key === 'End') position = tabs.length - 1;
    if (position === undefined) return;
    event.preventDefault(); activateTab(tabs[position]); tabs[position].focus();
  });
  doc.addEventListener('focusin', event => {
    const trigger = closest(event.target, '[data-ui-tooltip]');
    if (trigger) showTooltip(trigger);
  });
  doc.addEventListener('focusout', event => {
    if (tooltip && tooltip.trigger.contains(event.target) && !tooltip.bubble.contains(event.relatedTarget)) hideTooltip();
  });
  doc.addEventListener('pointerover', event => {
    const trigger = closest(event.target, '[data-ui-tooltip]');
    if (trigger) showTooltip(trigger);
  });
  doc.addEventListener('pointerout', event => {
    if (!tooltip) return;
    const {trigger, bubble} = tooltip;
    if ((trigger.contains(event.target) || bubble.contains(event.target)) && !trigger.contains(event.relatedTarget) && !bubble.contains(event.relatedTarget) && doc.activeElement !== trigger) hideTooltip();
  });
  doc.addEventListener('pointerdown', event => {
    if (tooltip && !tooltip.trigger.contains(event.target) && !tooltip.bubble.contains(event.target)) hideTooltip();
  });
  window.addEventListener('resize', hideTooltip);
  doc.addEventListener('scroll', hideTooltip, true);
  doc.addEventListener('cancel', event => {
    const dialog = event.target;
    if (!dialog.matches?.('dialog[data-ui-dialog]')) return;
    const play = prepareExit(dialog);
    setTimeout(() => { if (!event.defaultPrevented && !dialog.open) play(); }, 0);
  }, true);
  doc.addEventListener('submit', event => {
    const form = event.target;
    const dialog = form.closest('dialog[data-ui-dialog][open]');
    const method = event.submitter?.getAttribute('formmethod') || form.method;
    if (!dialog || method !== 'dialog' || event.defaultPrevented || !form.checkValidity()) return;
    const play = prepareExit(dialog);
    setTimeout(() => { if (!event.defaultPrevented && !dialog.open) play(); }, 0);
  });
  const detailExits = new WeakMap();
  doc.addEventListener('click', event => {
    const summary = closest(event.target, 'summary');
    const details = summary?.parentElement;
    if (details?.matches('details[open]')) detailExits.set(details, [...details.children].filter(child=>child!==summary).map(prepareExit));
  }, true);
  doc.addEventListener('toggle', event => {
    const details = event.target;
    if (!details.matches?.('details')) return;
    if (!details.open) detailExits.get(details)?.forEach(play=>play());
    else [...details.children].forEach(cancelExit);
    detailExits.delete(details);
  }, true);
  doc.addEventListener('change', event => {
    const input = event.target;
    if (input.matches('input[type="checkbox"], input[type="radio"]') && !disabled(input)) motion(input,[{scale:.9},{scale:1}],140);
  });
  doc.addEventListener('close', event => {
    if (!event.target.matches('dialog[data-ui-dialog]')) return;
    const opener = openers.get(event.target);
    if (opener?.isConnected && !opener.closest('[hidden], [inert]')) opener.focus();
    emit(event.target, 'hidden');
  }, true);
  doc.addEventListener('click', event => {
    const dialog = event.target;
    if (!dialog.matches?.('dialog[data-ui-dialog][open]') || dialog.dataset.uiBackdrop === 'static') return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) hide(dialog);
  });
  doc.addEventListener('submit', event => {
    const form = event.target;
    if (!form.matches('form[data-ui-validate]')) return;
    const results = fields(form).map(field => ({field, valid:validateField(field)}));
    const invalid = results.find(item => !item.valid);
    if (invalid) { event.preventDefault(); invalid.field.focus(); }
    else if (!emit(form, 'valid', {form}, true)) event.preventDefault();
  }, true);
  doc.addEventListener('input', event => {
    const field = event.target;
    if (field.matches('input, select, textarea') && field.closest('form[data-ui-validate]') && field.hasAttribute('aria-invalid')) validateField(field);
  });
  doc.addEventListener('change', event => {
    const select = closest(event.target, '[data-ui-move]');
    const card = select?.closest('[data-ui-card]');
    const board = card?.closest('[data-ui-board]');
    if (!board) return;
    const column = owned(board, '[data-ui-column]', '[data-ui-board]').find(item => item.dataset.uiColumn === select.value);
    if (column) { moveCard(card, column); select.focus(); }
  });
  doc.addEventListener('dragstart', event => {
    const card = closest(event.target, '[data-ui-card]');
    const board = card?.closest('[data-ui-board]');
    if (!board || !event.dataTransfer) return;
    dragging = {card, board};
    card.classList.add('dragged');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', card.dataset.uiCard || 'card');
  });
  doc.addEventListener('dragover', event => {
    const column = closest(event.target, '[data-ui-column]');
    if (!dragging || column?.closest('[data-ui-board]') !== dragging.board) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    column.classList.add('drop');
  });
  doc.addEventListener('dragleave', event => {
    const column = closest(event.target, '[data-ui-column]');
    if (column && !column.contains(event.relatedTarget)) column.classList.remove('drop');
  });
  doc.addEventListener('drop', event => {
    const column = closest(event.target, '[data-ui-column]');
    if (!dragging || column?.closest('[data-ui-board]') !== dragging.board) return;
    event.preventDefault(); moveCard(dragging.card, column); endDrag();
  });
  doc.addEventListener('dragend', endDrag);
  window.OrchtopUI = Object.freeze({init, show, hide, toast, loading, copy, setDesignTheme, setColorTheme});
  function boot() {
    applyTheme(resolvedColorTheme(), false, false);
    let savedDesign = null;
    if (doc.body.hasAttribute('data-ui-theme-persist')) {
      try { savedDesign = localStorage.getItem('orchtop-design-theme'); } catch { /* Storage is optional. */ }
    }
    const explicitDesign = doc.body.getAttribute('data-ui-theme');
    applyDesignTheme(designThemes.includes(explicitDesign) ? explicitDesign : designThemes.includes(savedDesign) ? savedDesign : 'default', false);
    init();
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();
