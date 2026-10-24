/* Catalog navigation only; applications do not need this script. */
(() => {
  const sidebar = document.querySelector('.catalog-sidebar');
  const main = document.querySelector('.catalog-main');
  const pageHeader = document.querySelector('.catalog-header');
  const navigation = sidebar?.querySelector('nav[aria-label="コンポーネント"]');
  if (!sidebar || !main || !navigation) return;

  document.documentElement.classList.add('ui-scroll-smooth');

  // Keep destinations as real HTML links. Only the mobile presentation folds.
  const menu = document.createElement('details');
  menu.className = 'catalog-navigation';
  const menuLabel = document.createElement('summary');
  menuLabel.textContent = 'コンポーネント一覧';
  navigation.before(menu);
  menu.append(menuLabel, navigation);

  const headings = [...main.querySelectorAll(':scope > h2, :scope > section > h2')];
  let toc, tocRail;
  if (headings.length >= 4) {
    toc = document.createElement('div');
    toc.className = 'catalog-page-toc';
    const label = document.createElement('p');
    label.className = 'catalog-toc-heading';
    label.textContent = 'このページの目次';
    const title = document.createElement('p');
    title.className = 'catalog-toc-title';
    title.textContent = main.querySelector('h1')?.textContent || '';
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'このページの目次');
    const list = document.createElement('ol');
    list.className = 'ui-scroll-smooth';
    list.setAttribute('data-ui-scroll-active','');
    const used = new Set();
    const entries = headings.map((heading, index) => {
      const section = heading.parentElement;
      const target = section.matches('section') && !used.has(section) ? section : heading;
      used.add(target);
      if (!target.id) {
        const slug = heading.textContent.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 72) || String(index + 1);
        const base = 'section-' + slug;
        let id = base, suffix = 2;
        while (document.getElementById(id)) id = base + '-' + suffix++;
        target.id = id;
      }
      // Native anchor navigation moves keyboard focus into the selected section.
      target.tabIndex = -1;
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.className = 'catalog-toc-link';
      link.href = '#' + encodeURIComponent(target.id);
      link.textContent = heading.textContent.trim().replace(/\s+/g, ' ');
      item.append(link); list.append(item);
      return {target, link};
    });
    nav.append(list); toc.append(label, title, nav);
    const content = document.createElement('div');
    content.className = 'catalog-content';
    tocRail = document.createElement('aside');
    tocRail.className = 'catalog-toc-rail';
    tocRail.setAttribute('aria-label', 'ページ内ナビゲーション');
    tocRail.append(toc);
    main.before(content);
    content.append(tocRail, main);

    let frame = 0;
    const updateLocation = () => {
      frame = 0;
      if (!main.isConnected) return;
      const visible = entries.filter(entry => entry.target.getClientRects().length > 0);
      for (const entry of entries) entry.link.closest('li').hidden = !visible.includes(entry);
      let current = visible[0];
      const threshold = (pageHeader?.getBoundingClientRect().bottom || 0) + 40;
      for (const entry of visible) {
        if (entry.target.getBoundingClientRect().top <= threshold) current = entry;
      }
      for (const entry of entries) {
        if (entry === current) { if (entry.link.getAttribute('aria-current') !== 'location') entry.link.setAttribute('aria-current', 'location'); }
        else entry.link.removeAttribute('aria-current');
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(updateLocation); };
    window.addEventListener('scroll', schedule, {passive:true});
    window.addEventListener('resize', schedule);
    document.addEventListener('toggle', schedule, true);
    document.addEventListener('catalog:filterchange', schedule);
    updateLocation();
    // Generated IDs must also work when opening a bookmarked file:// fragment.
    let fragment;
    try { fragment = decodeURIComponent(location.hash.slice(1)); } catch { fragment = ''; }
    const initial = entries.find(entry => entry.target.id === fragment);
    // Run after native scroll restoration: the compact menu changes page height.
    if (initial) window.addEventListener('pageshow', () => {
      requestAnimationFrame(() => initial.target.scrollIntoView({block:'start',behavior:'instant'}));
    }, {once:true});
  }

  // A stable header and footer surround one scrollable navigation body.
  const header = document.createElement('div');
  header.className = 'catalog-sidebar-header';
  const overview = [...sidebar.querySelectorAll(':scope > .overview-link')];
  header.append(...overview.slice(0, 3));
  const searchLabel = document.createElement('label');
  searchLabel.className = 'catalog-sidebar-search';
  const searchText = document.createElement('span');
  searchText.className = 'catalog-search-label';
  searchText.textContent = 'コンポーネントを検索';
  const search = document.createElement('input');
  search.type = 'search'; search.className = 'form-control form-control-sm';
  search.placeholder = '名前で検索…';
  searchLabel.append(searchText, search); header.append(searchLabel);
  const body = document.createElement('div');
  body.className = 'catalog-sidebar-body ui-scroll-smooth';
  body.setAttribute('data-ui-scroll-active','once');
  const eyebrow = sidebar.querySelector(':scope > .eyebrow');
  if (eyebrow) body.append(eyebrow);
  body.append(menu);
  const footer = document.createElement('div');
  footer.className = 'catalog-sidebar-bottom';
  footer.append(...overview.slice(3));
  const note = sidebar.querySelector(':scope > .sidebar-note');
  if (note) footer.append(note);
  sidebar.append(header, body, footer);

  const categories = [...navigation.querySelectorAll('.catalog-nav-group')].map((group, index) => {
    const heading = group.querySelector('h2');
    const details = document.createElement('details');
    details.className = 'catalog-nav-category';
    const summary = document.createElement('summary');
    const icons = [
      "M3,11H11V3H3M3,21H11V13H3M13,21H21V13H13M13,3V11H21V3",
      "M13,3V9H21V3M13,21H21V11H13M3,21H11V15H3M3,13H11V3H3V13Z",
      "M13,9H18.5L13,3.5V9M6,2H14L20,8V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V4C4,2.89 4.89,2 6,2M15,18V16H6V18H15M18,14V12H6V14H18Z",
      "M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z",
      "M5,4H19A2,2 0 0,1 21,6V18A2,2 0 0,1 19,20H5A2,2 0 0,1 3,18V6A2,2 0 0,1 5,4M5,8V12H11V8H5M13,8V12H19V8H13M5,14V18H11V14H5M13,14V18H19V14H13Z",
      "M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M14,21A2,2 0 0,1 12,23A2,2 0 0,1 10,21",
      "M13,2.03V2.05L13,4.05C17.39,4.59 20.5,8.58 19.96,12.97C19.5,16.61 16.64,19.5 13,19.93V21.93C18.5,21.38 22.5,16.5 21.95,11C21.5,6.25 17.73,2.5 13,2.03M11,2.06C9.05,2.25 7.19,3 5.67,4.26L7.1,5.74C8.22,4.84 9.57,4.26 11,4.06V2.06M4.26,5.67C3,7.19 2.25,9.04 2.05,11H4.05C4.24,9.58 4.8,8.23 5.69,7.1L4.26,5.67M2.06,13C2.26,14.96 3.03,16.81 4.27,18.33L5.69,16.9C4.81,15.77 4.24,14.42 4.06,13H2.06M7.1,18.37L5.67,19.74C7.18,21 9.04,21.79 11,22V20C9.58,19.82 8.23,19.25 7.1,18.37M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"
];
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.classList.add('sidebar-icon'); svg.setAttribute('viewBox','0 0 24 24');
    svg.setAttribute('fill','currentColor'); svg.setAttribute('aria-hidden','true'); svg.setAttribute('focusable','false');
    const path = document.createElementNS(svg.namespaceURI,'path'); path.setAttribute('d',icons[index] || icons[0]); svg.append(path);
    const label = document.createElement('span'); label.className = 'sidebar-label'; label.textContent = heading.textContent;
    summary.append(svg,label);
    details.open = !!group.querySelector('[aria-current="page"]') || (index === 0 && !navigation.querySelector('[aria-current="page"]'));
    heading.remove(); details.append(summary, ...group.childNodes); group.append(details);
    return details;
  });
  const empty = document.createElement('p');
  empty.className = 'catalog-search-empty'; empty.hidden = true;
  empty.setAttribute('role', 'status'); empty.textContent = '一致するコンポーネントがありません。';
  navigation.after(empty);
  let savedOpen, savedMenuOpen;
  const normalize = value => value.normalize('NFKC').toLowerCase().trim();
  search.addEventListener('input', () => {
    const query = normalize(search.value);
    if (query && !savedOpen) {
      savedOpen = new Map([...navigation.querySelectorAll('details')].map(item => [item,item.open]));
      savedMenuOpen = menu.open;
    }
    if (query) menu.open = true;
    let matches = 0;
    for (const category of categories) {
      const categoryMatch = query && normalize(category.querySelector('summary').textContent).includes(query);
      let visible = 0;
      for (const link of category.querySelectorAll('a')) {
        const match = !query || categoryMatch || normalize(link.textContent).includes(query) || normalize(link.getAttribute('href')).includes(query);
        link.closest('li').hidden = !match;
        if (match) { visible++; matches++; }
      }
      for (const branch of category.querySelectorAll('.catalog-nav-branch')) {
        branch.closest('li').hidden = ![...branch.querySelectorAll('a')].some(link => !link.closest('li').hidden);
        if (query) branch.open = true;
      }
      category.closest('.catalog-nav-group').hidden = !visible;
      if (query) category.open = !!visible;
    }
    empty.hidden = matches > 0;
    if (!query && savedOpen) {
      for (const [details,open] of savedOpen) details.open = open;
      menu.open = savedMenuOpen; savedOpen = null;
    }
  });
  let fitFrame = 0;
  const fitSidebar = () => {
    fitFrame = 0;
    const headerBox = pageHeader?.getBoundingClientRect();
    const offset = Math.max(0, headerBox?.bottom || 0);
    document.documentElement.style.setProperty('--catalog-header-height', (headerBox?.height || 0) + 'px');
    sidebar.style.setProperty('--catalog-sidebar-offset', offset + 'px');
    tocRail?.style.setProperty('--catalog-sidebar-offset', offset + 'px');
  };
  const scheduleFit = () => { if (!fitFrame) fitFrame = requestAnimationFrame(fitSidebar); };
  window.addEventListener('scroll', scheduleFit, {passive:true});
  window.addEventListener('resize', scheduleFit);
  if (pageHeader) new ResizeObserver(scheduleFit).observe(pageHeader);
  fitSidebar();
  const compact = matchMedia('(width < 768px)');
  const sync = () => {
    menu.open = !compact.matches;
  };
  compact.addEventListener('change', sync);
  sync();
})();
