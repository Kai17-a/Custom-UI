(function () {
  const initialize = (signal) => {
    if (signal && !document.querySelector('.catalog-main')) return;
    const search = document.getElementById('catalog-search');
    const items = [...document.querySelectorAll('[data-catalog-item]')];
    const filterCatalog = () => {
      const query = search.value.trim().normalize('NFKC').toLowerCase();
      let count = 0;
      for (const item of items) {
        item.hidden = window.KavCatalogSearch ? !KavCatalogSearch.matches(item, query) : !item.textContent.normalize('NFKC').toLowerCase().includes(query);
        if (!item.hidden) count++;
      }
      for (const group of document.querySelectorAll('main > section.specimen')) {
        const cards = [...group.querySelectorAll('[data-catalog-item]')];
        if (cards.length) group.hidden = cards.every(item => item.hidden);
      }
      document.getElementById('search-result').textContent = count + ' コンポーネント';
      document.getElementById('search-empty').hidden = count > 0;
      document.dispatchEvent(new Event('catalog:filterchange'));
    };
    if (search) {
      if (signal) {
        search.value = new URLSearchParams(location.search).get('q') ?? '';
        filterCatalog();
      }
      search.addEventListener('input', () => {
        if (signal) {
          const url = new URL(location.href);
          const query = search.value.trim();
          if (query) url.searchParams.set('q', query);
          else url.searchParams.delete('q');
          if (url.href !== location.href) history.replaceState(history.state, '', url);
        }
        filterCatalog();
      });
    }
    // The empty result offers a way back instead of a dead end.
    document.querySelector('[data-catalog-search-clear]')?.addEventListener('click', () => {
      search.value = '';
      search.dispatchEvent(new Event('input', {bubbles:true}));
      search.focus();
    });
    // Format a snapshot for display; the live example is never rewritten.
    const voidTags = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
    const inlineTags = new Set(['a','abbr','b','bdi','bdo','cite','code','del','em','i','ins','kbd','mark','q','s','samp','small','span','strong','sub','sup','time','u','var']);
    const rawTags = new Set(['pre','textarea','script','style']);
    const escapeText = value => value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
    const escapeAttribute = value => escapeText(value).replaceAll('"','&quot;').replaceAll('\r','&#13;').replaceAll('\n','&#10;').replaceAll('\t','&#9;');
    function formatNode(node, depth = 0) {
      const indent = '  '.repeat(depth);
      if (node.nodeType === Node.TEXT_NODE) return node.textContent.trim() ? indent + escapeText(node.textContent.trim()) : '';
      if (node.nodeType === Node.COMMENT_NODE) return indent + '<!--' + node.data + '-->';
      if (node.nodeType !== Node.ELEMENT_NODE) return '';
      const tag = node.localName;
      // Whitespace inside these elements is content, including its indentation.
      if (rawTags.has(tag) || /^(pre|break-spaces)/.test(node.style.whiteSpace)) return indent + node.outerHTML;
      const attributes = [...node.attributes].map(attr => attr.name + '="' + escapeAttribute(attr.value) + '"');
      const singleLine = '<' + tag + (attributes.length ? ' ' + attributes.join(' ') : '') + '>';
      const wrapped = indent.length + singleLine.length > 100 && attributes.length > 1;
      const opening = wrapped
        ? indent + '<' + tag + '\n' + attributes.map(attr => indent + '  ' + attr).join('\n') + '\n' + indent + '>'
        : indent + singleLine;
      if (node.namespaceURI === 'http://www.w3.org/1999/xhtml' && voidTags.has(tag)) return opening;
      const nodes = [...(tag === 'template' ? node.content.childNodes : node.childNodes)];
      if (!nodes.length) return opening + '</' + tag + '>';
      const hasText = nodes.some(child => child.nodeType === Node.TEXT_NODE && child.textContent.trim());
      const hasStructure = nodes.some(child => child.nodeType === Node.ELEMENT_NODE && !inlineTags.has(child.localName));
      // Keep text and inline markup together so spaces around links/emphasis are preserved.
      if ((hasText || inlineTags.has(tag)) && !hasStructure) return opening + node.innerHTML + '</' + tag + '>';
      const children = nodes.map(child => formatNode(child, depth + 1)).filter(Boolean).join('\n');
      return opening + '\n' + children + '\n' + indent + '</' + tag + '>';
    }
    function formatExample(example) {
      return [...example.childNodes].map(node => formatNode(node)).filter(Boolean).join('\n');
    }
    const sampleData = window.KavComponentCodeSamples?.[location.pathname.split('/').pop()] || {};
    if (sampleData.widget) {
      const note = document.createElement('p');
      note.className = 'dim';
      note.innerHTML = 'Vue・Astro では <code>KavWidget</code> で囲んで使えます。<a href="../vue.html#scope">Vueの使い方</a>・<a href="../astro.html#scope">Astroの使い方</a>';
      document.querySelector('main .page-heading')?.after(note);
    }
    document.querySelectorAll('[data-example]').forEach((example, index) => {
      const details = document.createElement('details');
      details.className = 'source';
      const summary = document.createElement('summary');
      summary.textContent = 'HTMLを表示';
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.textContent = formatExample(example);
      pre.append(code);
      const clipboard = document.createElement('div');
      clipboard.className = 'ui-clipboard ui-cluster';
      const copy = document.createElement('button');
      copy.type = 'button'; copy.className = 'btn btn-sm btn-outline-secondary';
      copy.textContent = 'HTMLをコピー'; copy.dataset.uiCopy = code.textContent;
      const status = document.createElement('span');
      status.className = 'ui-copy-status'; status.dataset.uiCopyStatus = '';
      status.setAttribute('role','status');
      clipboard.append(copy,status);
      const samples = sampleData.examples?.[index];
      if (samples) {
        summary.textContent = 'コードを表示';
        const group = document.createElement('div');
        group.dataset.uiTabs = '';
        group.dataset.codeTabs = '';
        const bar = document.createElement('div');
        bar.className = 'tabs';
        bar.setAttribute('role', 'tablist');
        bar.setAttribute('aria-label', 'コードの言語');
        group.append(bar);
        for (const [language, source] of Object.entries({html: code.textContent, ...samples})) {
          const key = 'code-' + index + '-' + language;
          const tab = document.createElement('button');
          tab.type = 'button';
          tab.className = 'tab' + (language === 'html' ? ' active' : '');
          tab.dataset.uiToggle = 'tab';
          tab.dataset.uiTarget = key;
          tab.dataset.codeLanguage = language;
          tab.textContent = language === 'html' ? 'HTML' : language === 'vue' ? 'Vue' : 'Astro';
          tab.setAttribute('aria-selected', String(language === 'html'));
          bar.append(tab);
          const panel = document.createElement('div');
          panel.dataset.uiPanel = key;
          panel.hidden = language !== 'html';
          const sourcePre = document.createElement('pre');
          const sourceCode = document.createElement('code');
          sourceCode.textContent = source;
          sourcePre.append(sourceCode);
          const actions = clipboard.cloneNode(true);
          const button = actions.querySelector('button');
          button.textContent = tab.textContent + 'をコピー';
          button.dataset.uiCopy = source;
          panel.append(actions, sourcePre);
          group.append(panel);
        }
        details.append(summary, group);
      } else {
        details.append(summary, clipboard, pre);
      }
      example.after(details);
    });
    // ui.js owns activation, ARIA and keyboard handling; synchronize through it.
    let syncing = false;
    document.addEventListener('ui:tabchange', event => {
      if (syncing || !event.target.matches('[data-code-tabs]')) return;
      const language = event.detail.tab.dataset.codeLanguage;
      syncing = true;
      try {
        document.querySelectorAll('[data-code-tabs]').forEach(group => {
          const tab = group.querySelector('[data-code-language="' + language + '"]');
          if (tab && tab.getAttribute('aria-selected') !== 'true') tab.click();
        });
      } finally { syncing = false; }
    }, {signal});
  };
  if (window.KavDocsPage) window.KavDocsPage.register(initialize);
  else initialize();
})();
