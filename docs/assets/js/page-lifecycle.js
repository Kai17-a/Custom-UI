/* Keep the shared UI runtime loaded and scope catalog behavior to each page. */
(() => {
  const initializers = [];
  let page = new AbortController();
  let mountedBody;

  window.KavDocsPage = Object.freeze({
    register(initializer) {
      initializers.push(initializer);
    },
  });

  document.addEventListener('astro:before-swap', ({ newDocument }) => {
    page.abort();
    page = new AbortController();
    window.KavUI?.destroy(document.body);

    const currentRoot = document.documentElement;
    for (const name of ['data-bs-theme', 'data-ui-color-preference', 'data-ui-palette', 'data-ui-focus-modality']) {
      const value = currentRoot.getAttribute(name);
      if (value !== null) newDocument.documentElement.setAttribute(name, value);
    }
    let design = document.body.dataset.uiTheme;
    let opacity = document.body.style.getPropertyValue('--ui-theme-surface-opacity');
    try {
      design = localStorage.getItem('kav-ui-design-theme') || 'default';
      opacity = localStorage.getItem('kav-ui-surface-opacity') || '';
    } catch { /* Use the current theme if storage is unavailable. */ }
    if (design) newDocument.body.dataset.uiTheme = design;
    if (opacity && Number.isFinite(parseFloat(opacity))) {
      newDocument.body.style.setProperty('--ui-theme-surface-opacity', parseFloat(opacity) + '%');
    }
    const paletteStyle = document.querySelector('style[data-ui-custom-palette-style]');
    if (paletteStyle) newDocument.head.append(paletteStyle.cloneNode(true));
  });

  document.addEventListener('astro:page-load', () => {
    if (mountedBody === document.body) return;
    mountedBody = document.body;
    for (const initialize of initializers) initialize(page.signal);
    // Preserve the normal submit behavior of forms shown in the demos.
    for (const form of mountedBody.querySelectorAll('form')) form.setAttribute('data-astro-reload', '');
    window.KavUI?.init(document.body);
  });
})();
