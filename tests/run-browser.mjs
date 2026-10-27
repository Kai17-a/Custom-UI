/* node tests/run-browser.mjs — uses an installed Chromium, no npm dependencies.
   Set CHROME_BIN if Chromium is not installed in one of the detected locations. */
import {spawn} from 'node:child_process';
import {checkControlAppearance} from './control-appearance.mjs';
import {existsSync, mkdtempSync, readdirSync, readFileSync, writeFileSync, rmSync} from 'node:fs';
import {homedir, tmpdir} from 'node:os';
import {join, resolve, dirname} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const site = join(root, 'docs');
const documentPath = path => join(path.startsWith('tests/') ? root : site, path);
const cache = join(homedir(), '.cache/ms-playwright');
const cached = existsSync(cache) ? readdirSync(cache).filter(name => name.startsWith('chromium_headless_shell-')).sort().reverse().map(name=>join(cache,name,'chrome-headless-shell-linux64/chrome-headless-shell')) : [];
const executable = [process.env.CHROME_BIN, '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome', ...cached].find(path=>path && existsSync(path));
if (!executable) throw new Error('Chromiumがありません。インストール済みブラウザの実行ファイルをCHROME_BINで指定してください。');
const profile = mkdtempSync(join(tmpdir(), 'kav-ui-browser-'));
const artifacts = mkdtempSync(join(tmpdir(), 'kav-ui-screenshots-'));
const child = spawn(executable, ['--no-sandbox','--disable-dev-shm-usage','--disable-background-networking','--remote-debugging-pipe','--user-data-dir='+profile], {stdio:['ignore','ignore','pipe','pipe','pipe']});
let buffer = '';
let sequence = 0;
let session;
const pending = new Map();
const errors = [];
let fileChooserEvents = 0;
let stderr = '';
child.stderr.on('data',chunk=>{stderr=(stderr+chunk.toString()).slice(-2000);});
for (const pipe of [child.stdio[3],child.stdio[4]]) pipe.on('error',()=>{});
child.on('exit',()=>{for(const {reject} of pending.values())reject(new Error('Chromium exited: '+stderr));pending.clear();});
child.stdio[4].on('data',chunk=>{
  buffer += chunk.toString(); let boundary;
  while ((boundary=buffer.indexOf('\0')) >= 0) {
    const message=JSON.parse(buffer.slice(0,boundary));buffer=buffer.slice(boundary+1);
    if (message.id) {
      const callback=pending.get(message.id);pending.delete(message.id);
      if (message.error) callback?.reject(new Error(JSON.stringify(message.error))); else callback?.resolve(message.result);
    } else if (message.method==='Page.fileChooserOpened') {
      fileChooserEvents++;
    } else if (message.method==='Runtime.exceptionThrown') {
      errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    }
  }
});
function send(method,params={},to=session) {
  return new Promise((resolve,reject)=>{
    const id=++sequence;pending.set(id,{resolve,reject});
    child.stdio[3].write(JSON.stringify({id,method,params,...(to?{sessionId:to}:{})})+'\0');
  });
}
async function evaluate(expression) {
  const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
  if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);
  return result.result.value;
}
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function navigate(path) {
  await send('Page.navigate',{url:pathToFileURL(documentPath(path)).href});
  for(let i=0;i<150;i++) {
    await delay(30);
    const loaded=await evaluate('document.readyState === "complete" && typeof KavUI !== "undefined"');
    if(loaded)return;
  }
  throw new Error('Page load timed out: '+path);
}
async function key(key,code=key) { const vk={Escape:27,ArrowRight:39,ArrowLeft:37,Tab:9,Enter:13,ArrowDown:40,ArrowUp:38,' ':32}[key] || 0; await send('Input.dispatchKeyEvent',{type:key==='Enter'?'keyDown':'rawKeyDown',key,code,windowsVirtualKeyCode:vk,...(key==='Enter'?{text:'\r',unmodifiedText:'\r'}:{})}); await send('Input.dispatchKeyEvent',{type:'keyUp',key,code,windowsVirtualKeyCode:vk}); }
async function click(selector) {
  // Deliver programmatic scroll events before opening a scroll-sensitive popup.
  const box=await evaluate(`(async()=>{const el=document.querySelector(${JSON.stringify(selector)});el.scrollIntoView({behavior:"instant",block:'center'});await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
  await send('Input.dispatchMouseEvent',{type:'mousePressed',...box,button:'left',clickCount:1});
  await send('Input.dispatchMouseEvent',{type:'mouseReleased',...box,button:'left',clickCount:1});
}
const timeout=setTimeout(()=>{console.error('Browser checks timed out');child.kill();process.exitCode=1;},360000);
try {
  const {targetId}=await send('Target.createTarget',{url:'about:blank'},null);
  ({sessionId:session}=await send('Target.attachToTarget',{targetId,flatten:true},null));
  await send('Runtime.enable');await send('Page.enable');
  // Agent diagrams retain native list, disclosure and form behavior without UI JavaScript.
  await navigate('components/agent-workflow.html');
  if(!await evaluate(`document.querySelectorAll('main [data-example]').length===4`))throw new Error('Agent workflow: four examples');
  if(!await evaluate(`(() => {
    const branches=[...document.querySelectorAll('.ui-agent-tree ul')];
    const merge=document.querySelector('.ui-agent-merge');
    return branches.every(el=>parseFloat(getComputedStyle(el).paddingTop)>0 && parseFloat(getComputedStyle(el,'::before').height)>0)
      && parseFloat(getComputedStyle(merge).paddingTop)>0
      && parseFloat(getComputedStyle(document.querySelector('.ui-agent-node')).borderTopLeftRadius)>0;
  })()`))throw new Error('Agent graph must retain connector space and shared corner tokens');
  if(!await evaluate(`(() => {
    const nodes=[...document.querySelectorAll('.ui-agent-tree-parallel > li > ul > li > .ui-agent-node')].map(node=>node.getBoundingClientRect());
    return Math.max(...nodes.map(r=>r.bottom))-Math.min(...nodes.map(r=>r.bottom))<1;
  })()`))throw new Error('Parallel agent nodes must meet merge connectors at the same baseline');
  await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
  await send('Emulation.setDeviceMetricsOverride',{width:375,height:900,deviceScaleFactor:1,mobile:true});
  if(!await evaluate(`(() => {const r=document.querySelector('.catalog-header [data-ui-toggle="theme"]').getBoundingClientRect();return matchMedia('(pointer:coarse)').matches&&r.width>=44&&r.height>=44&&document.documentElement.scrollWidth<=innerWidth+1;})()`))throw new Error('Touch theme toggle minimum target');
  await send('Emulation.setTouchEmulationEnabled',{enabled:false});
  for(const activation of ['Enter',' ']) {
    await evaluate(`document.querySelector('#task-tree details').open=true;document.querySelector('#task-tree summary').focus()`);
    await key(activation);
    if(!await evaluate(`!document.querySelector('#task-tree details').open && document.activeElement.matches('#task-tree summary')`))throw new Error('Task tree keyboard collapse '+activation);
    await key(activation);
    if(!await evaluate(`document.querySelector('#task-tree details').open`))throw new Error('Task tree keyboard expand '+activation);
  }
  await evaluate(`document.querySelector('#task-tree input:not(:checked)').focus()`);
  await key(' ');
  if(!await evaluate(`document.activeElement.checked`))throw new Error('Task completion by keyboard');
  await evaluate(`document.querySelector('#task-tree form').reset()`);
  if(!await evaluate(`!document.activeElement.checked`))throw new Error('Task reset restores authored state');
  for(const width of [320,768,1440]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    for(const mode of ['light','dark'])for(const design of ['default','glass','glassmorphism','flat','soft']) {
      await evaluate(`KavUI.setColorTheme(${JSON.stringify(mode)});KavUI.setDesignTheme(${JSON.stringify(design)})`);
      if(!await evaluate(`document.documentElement.scrollWidth<=innerWidth+1 && [...document.querySelectorAll('.ui-agent-node')].every(node=>node.getBoundingClientRect().width>0)`))throw new Error('Agent diagram bounds '+[width,mode,design]);
    }
    await evaluate(`KavUI.setColorTheme('${width===320?'dark':'light'}');KavUI.setDesignTheme('default');scrollTo({top:0,left:0,behavior:'instant'})`);
    const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});
    writeFileSync(join(artifacts,'agent-workflow-'+width+'.png'),Buffer.from(shot.data,'base64'));
  }
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  console.log('Agent workflow: four examples, native Enter/Space disclosure, checkbox/reset, 3 widths × 10 themes/modes');
  // Block deferred UI code to expose the document's first rendered theme.
  await send('Network.enable');
  await send('Network.setBlockedURLs',{urls:['*assets/ui/js/ui.js','*assets/js/catalog-demo.js']});
  async function firstPaintPage(path) {
    const url=pathToFileURL(documentPath(path)).href;
    await send('Page.navigate',{url});
    for(let i=0;i<150;i++) {
      await delay(20);
      if(await evaluate('location.href==='+JSON.stringify(url)+' && document.readyState==="complete"'))return;
    }
    throw new Error('First-paint load timeout: '+path);
  }
  for(const mode of ['light','dark']) {
    const {identifier}=await send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('kav-ui-theme',${JSON.stringify(mode)});localStorage.setItem('kav-ui-design-theme','glass');`});
    await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:mode==='dark'?'light':'dark'}]});
    for(const path of ['index.html','getting-started.html','components/toasts.html','components/theme-switcher.html','components/dialog.html']) {
      await firstPaintPage(path);
      const state=await evaluate('({mode:document.documentElement.dataset.bsTheme,design:document.body.dataset.uiTheme,background:getComputedStyle(document.documentElement).backgroundColor,ui:typeof KavUI})');
      if(state.mode!==mode || state.design!=='glass' || state.background!==(mode==='dark'?'rgb(27, 28, 30)':'rgb(244, 243, 240)') || state.ui!=='undefined')throw new Error('Theme before UI: '+path+' '+JSON.stringify(state));
    }
    const {data}=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    writeFileSync(join(artifacts,'first-paint-'+mode+'.png'),Buffer.from(data,'base64'));
    await send('Page.removeScriptToEvaluateOnNewDocument',{identifier});
  }
  const systemSeed=await send('Page.addScriptToEvaluateOnNewDocument',{source:"localStorage.setItem('kav-ui-theme','system');"});
  for(const os of ['light','dark']) {
    await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:os}]});
    await firstPaintPage('components/theme-switcher.html');
    if(!await evaluate('document.documentElement.dataset.uiColorPreference===\"system\" && document.documentElement.dataset.bsTheme==='+JSON.stringify(os)+' && typeof KavUI===\"undefined\"'))throw new Error('System preference before first paint: '+os);
  }
  await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:systemSeed.identifier});
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'dark'}]});
  for(const source of [
    "localStorage.removeItem('kav-ui-theme');localStorage.removeItem('kav-ui-design-theme');",
    "localStorage.setItem('kav-ui-theme','unknown');localStorage.setItem('kav-ui-design-theme','unknown');",
    "Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Storage unavailable','SecurityError');}});"
  ]) {
    const {identifier}=await send('Page.addScriptToEvaluateOnNewDocument',{source});
    await firstPaintPage('components/forms.html');
    if(!await evaluate('document.documentElement.dataset.bsTheme==="dark" && !document.body.hasAttribute("data-ui-theme") && getComputedStyle(document.documentElement).backgroundColor==="rgb(27, 28, 30)"'))throw new Error('First-paint OS fallback failed');
    await send('Page.removeScriptToEvaluateOnNewDocument',{identifier});
  }
  await send('Network.setBlockedURLs',{urls:[]});
  await send('Emulation.setEmulatedMedia',{features:[]});
  await navigate('components/dialog.html');
  await evaluate("localStorage.removeItem('kav-ui-theme');localStorage.removeItem('kav-ui-design-theme')");
  console.log('First paint with UI blocked: saved light/dark before rendering across 5 pages, glass restoration, OS fallback with absent/invalid/blocked storage');
  await checkControlAppearance({navigate,evaluate,send,key});
  for (const width of [320,768,1440]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    await navigate('tests/ui.html');
    const result=await evaluate('window.uiTestsDone');
    console.log('Real browser tests @'+width+':',JSON.stringify(result));
    if(result.failures.length)throw new Error(result.failures.join('\n'));
  }
  for (const timezoneId of ['Asia/Tokyo','America/New_York']) {
    await send('Emulation.setTimezoneOverride',{timezoneId});
    const value=await evaluate(`(()=>{const root=document.createElement('div');root.dataset.uiCalendar='';root.dataset.uiMonth='2026-03';document.body.append(root);KavUI.init(root);root.querySelector('[data-ui-calendar-date="2026-03-08"]').click();const value=root.dataset.uiValue;root.remove();return value;})()`);
    if(value!=='2026-03-08')throw new Error('Calendar timezone shifted: '+timezoneId);
  }
  await send('Emulation.setTimezoneOverride',{timezoneId:''});
  console.log('Calendar timezone checks: Asia/Tokyo and America/New_York');
  await navigate('tests/catalog.html');
  const formatting=await evaluate('window.catalogTestsDone');
  console.log('Source formatting tests:',JSON.stringify(formatting));
  if(formatting.failures.length)throw new Error(formatting.failures.join('\n'));
  // Both search controls use the same canonical card descriptions and aliases.
  await navigate('index.html');
  for(const [query,expected] of [['フォーム','forms.html'],['ボタン','buttons.html'],['ＦＯＲＭＳ','forms.html'],['入力 検証','forms.html']]) {
    const result=await evaluate(`(()=>{
      const a=document.querySelector('#catalog-search'),b=document.querySelector('.catalog-sidebar-search input');
      a.value=${JSON.stringify(query)};a.dispatchEvent(new Event('input',{bubbles:true}));b.value=a.value;b.dispatchEvent(new Event('input',{bubbles:true}));
      const name=a=>a.getAttribute('href').split('/').pop(),all=[...document.querySelectorAll('[data-catalog-item]')];
      const known=new Set(all.map(name));
      return {main:all.filter(a=>!a.hidden).map(name).sort(),sidebar:[...document.querySelectorAll('.catalog-sidebar nav[aria-label="コンポーネント"] a')].filter(a=>!a.closest('li').hidden&&known.has(name(a))).map(name).sort()};
    })()`);
    if(!result.main.includes(expected)||JSON.stringify(result.main)!==JSON.stringify(result.sidebar))throw new Error('Japanese catalog search '+query+': '+JSON.stringify(result));
  }
  console.log('Catalog search: Japanese aliases, full-width normalization and multiple words agree across index/sidebar');
  // Audit file:// loading and responsive overflow across every catalog page.
  const componentDestinations=readdirSync(join(site,'components')).filter(name=>name.endsWith('.html')).sort();
  const pages=['index.html','ai-agents.html','installation.html','getting-started.html','templates.html',...readdirSync(join(site,'templates')).filter(name=>name.endsWith('.html')).map(name=>'templates/'+name),...readdirSync(join(site,'components')).filter(name=>name.endsWith('.html')).map(name=>'components/'+name)];
  let checks=0; let sourceChecks=0;
  for(const width of [320,767,768,1023,1024,1440]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    for(const path of pages) {
      await navigate(path);
      const state=await evaluate('({overflow:document.documentElement.scrollWidth>innerWidth+1, css:getComputedStyle(document.body).fontFamily, broken:[...document.querySelectorAll("link[rel=stylesheet]")].filter(link=>!link.sheet).length})');
      if(state.overflow||state.broken)throw new Error(path+' @'+width+': '+JSON.stringify(state));
      if(path==='components/flex-grid.html') {
        const alignment=await evaluate('getComputedStyle(document.querySelector("#responsive-alignment .fx-grid")).justifyContent');
        const expected=width>=1024?'flex-end':width>=768?'space-between':'center';
        if(alignment!==expected)throw new Error('Grid responsive alignment @'+width+': '+alignment);
      }
      if(path==='components/spacing.html') {
        const padding=await evaluate('getComputedStyle(document.querySelector("#spacing-responsive-demo")).paddingTop');
        const expected=width>=1024?'32px':width>=768?'24px':'8px';
        if(padding!==expected)throw new Error('Responsive spacing @'+width+': '+padding);
      }
      if(!path.startsWith('templates/')) {
        const navigation=await evaluate(`(()=>{const nav=document.querySelector('.catalog-sidebar nav[aria-label="コンポーネント"]');const links=[...nav.querySelectorAll('a')];const toc=[...document.querySelectorAll('.catalog-toc-link')];return {paths:links.map(a=>a.href.split('/').pop()),active:links.filter(a=>a.getAttribute('aria-current')==='page').map(a=>a.href.split('/').pop()),tocValid:toc.every(a=>!!document.getElementById(decodeURIComponent(a.hash.slice(1)))),menuOpen:document.querySelector('.catalog-navigation').open,branch:document.querySelector('[data-catalog-family="animations"]').open};})()`);
        if(JSON.stringify([...navigation.paths].sort())!==JSON.stringify(componentDestinations) || new Set(navigation.paths).size!==componentDestinations.length || !navigation.tocValid || navigation.menuOpen!==(width>=768))throw new Error('Catalog navigation '+path+' '+width+': '+JSON.stringify(navigation));
        const tocLayout=await evaluate(`(()=>{const toc=document.querySelector('.catalog-page-toc');if(!toc)return null;const rail=toc.closest('.catalog-toc-rail').getBoundingClientRect(),article=document.querySelector('.catalog-main').getBoundingClientRect();return {outside:!toc.closest('.catalog-sidebar'),expanded:toc.open && !!toc.querySelector("a")?.getClientRects().length,unlined:[toc,toc.closest(".catalog-toc-rail"),toc.querySelector("ol")].every(el=>getComputedStyle(el).borderInlineStartWidth==="0px" && getComputedStyle(el).borderBottomWidth==="0px"),right:rail.left>=article.right-1,above:rail.bottom<=article.top+1};})()`);
        if(tocLayout && (!tocLayout.outside || tocLayout.expanded!==(width>=1280) || !tocLayout.unlined || !(width>=1280?tocLayout.right:tocLayout.above)))throw new Error('Catalog TOC rail placement '+path+' '+width+': '+JSON.stringify(tocLayout));
        const filename=path.split('/').pop();
        if(path.startsWith('components/') && (navigation.active.length!==1 || navigation.active[0]!==filename))throw new Error('Current page destination: '+path);
        if(filename.startsWith('animations') && !navigation.branch)throw new Error('Current animation branch must open');
      }
      if(width===1440) {
        const sources=await evaluate(`(()=>{
          const examples=[...document.querySelectorAll('[data-example]')];
          return {count:examples.length,missing:examples.some(example=>!example.nextElementSibling?.matches('details.source') || !example.nextElementSibling.querySelector('pre code')?.textContent.trim())};
        })()`);
        if(sources.missing)throw new Error('Missing source output: '+path);
        sourceChecks+=sources.count;
      }
      checks++;
    }
  }
  console.log('Source blocks checked:',sourceChecks);
  console.log('Responsive file:// checks:',checks,'pages/widths without document overflow or missing stylesheets');
  await send('Emulation.setDeviceMetricsOverride',{width:320,height:1000,deviceScaleFactor:1,mobile:false});
  await navigate('components/flex.html');
  if(!await evaluate('!document.querySelector(".catalog-page-toc").open && document.querySelector(".catalog-main h1").getBoundingClientRect().top<innerHeight'))throw new Error('Mobile title must precede an expanded TOC');
  await click('.catalog-page-toc > summary');
  await evaluate('document.querySelectorAll(".catalog-toc-link")[5].focus()');
  await key('Enter');await delay(1800);
  if(!await evaluate('document.activeElement.id===decodeURIComponent(location.hash.slice(1)) && document.querySelector(".catalog-toc-link[aria-current=location]").hash===location.hash'))throw new Error('TOC keyboard anchor/focus/location');
  await send('Page.reload');await delay(200);
  if(!await evaluate('!!document.getElementById(decodeURIComponent(location.hash.slice(1))) && Math.abs(document.getElementById(decodeURIComponent(location.hash.slice(1))).getBoundingClientRect().top-document.querySelector(".catalog-header").getBoundingClientRect().bottom-20)<3'))throw new Error('TOC bookmark reload');
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await delay(80);
  if(!await evaluate('document.querySelector(".catalog-navigation").open && !!document.querySelector(".catalog-toc-link").getClientRects().length && Math.abs(document.querySelector(".catalog-sidebar").getBoundingClientRect().top-document.querySelector(".catalog-header").getBoundingClientRect().bottom)<2'))throw new Error('Desktop sticky navigation/media sync');
  if(!await evaluate('Math.abs(document.querySelector(".catalog-toc-rail").getBoundingClientRect().top-document.querySelector(".catalog-header").getBoundingClientRect().bottom)<2 && document.querySelector(".catalog-toc-rail").getBoundingClientRect().bottom<=innerHeight+1'))throw new Error('Right TOC sticky viewport bounds');
  for(const width of [1279,1280]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});await delay(60);
    if(!await evaluate('document.querySelector(".catalog-page-toc").open==='+(width>=1280)+' && document.documentElement.scrollWidth<=innerWidth+1'))throw new Error('TOC breakpoint/overflow '+width);
  }
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});await delay(60);
  console.log('Catalog navigation: consistent component destinations; independent right TOC, compact mobile / expanded desktop unlined TOC, keyboard section focus, scroll location, bookmark reload, sticky bounds and 1280px boundary');
  const openCategories=await evaluate('[...document.querySelectorAll(".catalog-nav-category")].map(el=>el.open)');
  await evaluate(`(()=>{const input=document.querySelector('.catalog-sidebar-search input');input.value='heartbeat';input.dispatchEvent(new Event('input',{bubbles:true}));})()`);
  // Destinations are searched by page name/label, never by hidden source code.
  if(!await evaluate('!document.querySelector(".catalog-search-empty").hidden'))throw new Error('Sidebar empty search result');
  await evaluate(`(()=>{const input=document.querySelector('.catalog-sidebar-search input');input.value='animations';input.dispatchEvent(new Event('input',{bubbles:true}));})()`);
  if(!await evaluate('document.querySelectorAll(".catalog-nav-group:not([hidden])").length===1 && [...document.querySelectorAll("[data-catalog-family=animations] a")].every(a=>!a.closest("li").hidden) && document.querySelector("[data-catalog-family=animations]").open'))throw new Error('Sidebar nested search results');
  await evaluate(`(()=>{const input=document.querySelector('.catalog-sidebar-search input');input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));})()`);
  if(JSON.stringify(await evaluate('[...document.querySelectorAll(".catalog-nav-category")].map(el=>el.open)'))!==JSON.stringify(openCategories))throw new Error('Sidebar search did not restore categories');
  await click('.catalog-nav-category > summary');
  await key('Enter');
  if(!await evaluate('!document.querySelector(".catalog-nav-category").open'))throw new Error('Sidebar category keyboard toggle');
  console.log('Sidebar design: header/footer, nested page search, empty/clear restoration and native category keyboard toggle');

  await navigate('components/sidebar.html');
  await evaluate(`(()=>{const a=document.createElement('a');a.href='#sidebar-icons-title';a.id='sidebar-outline-demo';a.innerHTML='<span class="sidebar-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 12h16"/></svg></span><span class="sidebar-label">線のアイコン</span>';document.querySelector('#sidebar-icons .app-sidebar-group').append(a)})()`);
  for(const width of [320,1440])for(const mode of ['light','dark'])for(const design of ['default','glass','glassmorphism']) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    await evaluate('KavUI.setColorTheme('+JSON.stringify(mode)+');KavUI.setDesignTheme('+JSON.stringify(design)+')');
    const icons=await evaluate(`(()=>{
      const root=document.querySelector('#sidebar-icons');
      const active=root.querySelector('a[aria-current=page]'),icon=active.querySelector('.sidebar-icon'),label=active.querySelector('.sidebar-label');
      const task=root.querySelector('a[href="board.html"]'),meta=task.querySelector('.sidebar-meta'),taskLabel=task.querySelector('.sidebar-label');
      const a=icon.getBoundingClientRect(),b=label.getBoundingClientRect(),m=meta.getBoundingClientRect(),l=taskLabel.getBoundingClientRect();
      const outline=document.querySelector('#sidebar-outline-demo svg');
      return {size:a.width,aligned:Math.abs(a.top+a.height/2-(b.top+b.height/2))<1,ordered:a.right<=b.left && l.right<=m.left,metaInside:m.right<=task.getBoundingClientRect().right,fill:getComputedStyle(icon).fill,color:getComputedStyle(active).color,stroke:getComputedStyle(outline).stroke,outlineFill:getComputedStyle(outline).fill,outlineColor:getComputedStyle(outline.closest('a')).color,overflow:document.documentElement.scrollWidth>innerWidth+1};
    })()`);
    if(icons.size!==18||!icons.aligned||!icons.ordered||!icons.metaInside||icons.fill!==icons.color||icons.outlineFill!=='none'||icons.stroke!==icons.outlineColor||icons.overflow)throw new Error('Sidebar icon layout/theme '+[width,mode,design]+JSON.stringify(icons));
  }
  await click('#sidebar-icons summary .sidebar-icon');
  if(!await evaluate('!document.querySelector("#sidebar-icons details").open'))throw new Error('Summary SVG click did not collapse');
  await key('Enter');
  if(!await evaluate('document.querySelector("#sidebar-icons details").open'))throw new Error('Summary keyboard reopen');
  const sidebarExampleURL=await evaluate('location.href');
  await click('#sidebar-icons a[href="board.html"] .sidebar-icon');await delay(80);
  if(await evaluate('location.href')!==sidebarExampleURL || !await evaluate(`document.querySelector('#sidebar-icons a[href="board.html"]').href.endsWith("board.html")`))throw new Error('Sidebar sample SVG link must stay local and retain its destination');
  console.log('Sidebar icons: aligned SVG/label/count, outlined SVG wrapper, inherited color and long-label bounds at 320/1440 × light/dark × 3 designs; SVG click and keyboard disclosure');
  let presetCount=0;
  for(const page of ['animations-entrances','animations-movement','animations-attention']) {
  await navigate('components/'+page+'.html');
  const presetButtons=await evaluate('[...document.querySelectorAll("[data-demo-animation-replay]")].map(button=>button.dataset.demoAnimationReplay)');
  if(presetButtons.length!==6)throw new Error('Missing animation group demos: '+page);
  presetCount+=presetButtons.length;
  for(const target of presetButtons) {
    const selector='[data-demo-animation-replay='+JSON.stringify(target)+']';
    await click(selector);
    const first=await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(target)});const animation=el.getAnimations().find(a=>a.animationName?.startsWith('ui-fx-'));if(!animation)return false;window.__presetAnimation=animation;const timing=animation.effect.getTiming();animation.finish();return timing.duration===600 && timing.iterations===1;})()`);
    if(!first)throw new Error('Preset did not run: '+target);
    if(target.endsWith('fade-out')||target.endsWith('zoom-out')) {
      if(!await evaluate('getComputedStyle(document.querySelector('+JSON.stringify(target)+')).opacity==="0"'))throw new Error('Exit preset final frame: '+target);
    }
    await click(selector);
    if(!await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(target)});const animation=el.getAnimations().find(a=>a.animationName?.startsWith('ui-fx-'));return animation && animation!==window.__presetAnimation && animation.playState==='running' && document.activeElement.dataset.demoAnimationReplay===${JSON.stringify(target)};})()`))throw new Error('Preset replay/focus: '+target);
  }
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  if(!await evaluate('[...document.querySelectorAll(".animation-demo-target")].every(el=>getComputedStyle(el).opacity==="1" && !el.getAnimations().length)'))throw new Error('Reduced motion group: '+page);
  await send('Emulation.setEmulatedMedia',{features:[]});
  }
  if(presetCount!==18)throw new Error('Missing animation presets after page split');
  await evaluate(`(()=>{const el=document.querySelector('#animation-pulse');el.classList.add('ui-animate-slow','ui-animate-delay-500','ui-animate-repeat');document.querySelector('[data-demo-animation-replay="#animation-pulse"]').click()})()`);
  const timing=await evaluate(`(()=>{const el=document.querySelector('#animation-pulse'),a=el.getAnimations()[0],t=a.effect.getTiming();el.classList.add('ui-animate-paused');return {duration:t.duration,delay:t.delay,infinite:t.iterations===Infinity};})()`);
  if(timing.duration!==1200||timing.delay!==500||!timing.infinite)throw new Error('Preset speed/delay/repeat');
  await delay(40);
  const pausedAt=await evaluate('document.querySelector("#animation-pulse").getAnimations()[0].currentTime');
  await delay(60);
  if(!await evaluate('Math.abs(document.querySelector("#animation-pulse").getAnimations()[0].currentTime-'+pausedAt+')<2'))throw new Error('Preset pause');
  await evaluate('document.querySelector("#animation-pulse").classList.remove("ui-animate-paused")');
  if(!await evaluate('document.querySelector("#animation-pulse").getAnimations()[0].playState==="running"'))throw new Error('Preset resume');
  // The OS preference must also cancel a running/repeating effect and reveal exit examples.
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  if(!await evaluate('[...document.querySelectorAll(".animation-demo-target")].every(el=>!el.getAnimations().some(a=>a.animationName?.startsWith("ui-fx-")) && getComputedStyle(el).opacity==="1")'))throw new Error('Preset reduced motion visibility');
  await send('Emulation.setEmulatedMedia',{features:[]});
  await evaluate("delete window.__presetAnimation");
  console.log('Animation presets: 18 effects, native pointer replay/focus, exit final frames, speed/delay/repeat, pause/resume and live reduced motion');
  // Verify reusable layout CSS without the catalog stylesheet, at real viewport widths.
  await navigate('components/layouts.html');
  const layoutMarkup=await evaluate(`JSON.stringify({columns:document.querySelector('#layout-columns-demo').outerHTML,dashboard:document.querySelector('#layout-dashboard [data-example]').innerHTML})`);
  await evaluate(`(()=>{
    document.querySelector('link[rel=stylesheet]').href=${JSON.stringify(pathToFileURL(join(root,'assets/css/ui.css')).href)};
    const markup=JSON.parse(${JSON.stringify(layoutMarkup)});
    document.body.className='ui-app';
    document.body.innerHTML='<header class="ui-header ui-header-sticky"><div class="ui-container ui-header-inner"><a class="ui-brand" href="#layout-main">My workspace</a><nav class="ui-header-nav" aria-label="メイン"><a href="#layout-main" aria-current="page">概要</a><a href="#layout-dashboard-sidebar">メニュー</a></nav></div></header><main id="layout-main" class="ui-app-main"><div class="ui-container">'+markup.columns+markup.dashboard+'</div></main><footer class="ui-footer"><div class="ui-container ui-footer-inner"><p>© My workspace</p><a href="#layout-main">ページの先頭へ</a></div></footer>';
    KavUI.init(document.body);
  })()`);
  await delay(150);
  for(const width of [320,768,1024,1440]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    for(const mode of ['light','dark']) for(const design of ['default','glass','glassmorphism','flat','soft']) {
      await evaluate('KavUI.setColorTheme('+JSON.stringify(mode)+');KavUI.setDesignTheme('+JSON.stringify(design)+')');
      const state=await evaluate(`(()=>{
        const page=document.querySelector('.ui-page');const [left,body,right]=[...page.children].map(el=>el.getBoundingClientRect());
        const container=document.querySelector('.ui-container');const footer=document.querySelector('.ui-footer').getBoundingClientRect();
        return {overflow:document.documentElement.scrollWidth>innerWidth+1,cols:getComputedStyle(page).gridTemplateColumns.split(' ').length,left:left.toJSON(),body:body.toJSON(),right:right.toJSON(),footer:footer.bottom,container:container.getBoundingClientRect().width};
      })()`);
      const cols=width>=1056?3:width>=800?2:1;
      if(state.overflow || state.cols!==cols || state.footer<1000-1)throw new Error('Standalone layout geometry '+[width,mode,design]+': '+JSON.stringify(state));
      if(cols===3 && (Math.abs(state.left.top-state.body.top)>1 || Math.abs(state.right.top-state.body.top)>1))throw new Error('Three-column alignment');
      if(cols===2 && (Math.abs(state.left.top-state.body.top)>1 || state.right.top<=state.body.top))throw new Error('Two-column rail placement');
      if(cols===1 && (state.body.top<=state.left.top || state.right.top<=state.body.top))throw new Error('Stacked reading order');
      // No hidden navigation links remain in the keyboard path after collapse.
      await click('[data-ui-target="#layout-dashboard-sidebar"]');
      if(!await evaluate('document.querySelector("#layout-dashboard-sidebar").hidden && document.querySelector("[data-ui-toggle=sidebar]").getAttribute("aria-expanded")==="false"'))throw new Error('Layout sidebar collapse');
      await key('Enter');
      if(!await evaluate('!document.querySelector("#layout-dashboard-sidebar").hidden'))throw new Error('Layout sidebar keyboard reopen');
      if(design==='glassmorphism' && ((width===320 && mode==='dark') || (width===1440 && mode==='light'))) {
        await evaluate('scrollTo({top:0,left:0,behavior:"instant"})'); await delay(300);
        const {data}=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});
        writeFileSync(join(artifacts,'layout-standalone-'+width+'-'+mode+'.png'),Buffer.from(data,'base64'));
      }
    }
  }
  for(const variant of ['ui-page-with-aside','ui-page-with-rail','']) {
    await evaluate('document.querySelector(".ui-page").className="ui-page "+'+JSON.stringify(variant));
    const count=await evaluate('getComputedStyle(document.querySelector(".ui-page")).gridTemplateColumns.split(" ").length');
    if(count!==(variant?2:1))throw new Error('Single aside/rail variant: '+variant);
  }
  await evaluate('document.querySelector(".ui-page").className="ui-page ui-page-with-aside ui-page-with-rail"');
  // A narrow embedded container must stack even on a wide desktop viewport.
  await evaluate(`document.querySelector('#layout-columns-demo').style.maxWidth='400px'`);
  if(!await evaluate('getComputedStyle(document.querySelector(".ui-page")).gridTemplateColumns.split(" ").length===1'))throw new Error('Embedded layout must follow its container width');
  // Short content keeps the footer at the viewport bottom; long content pushes it down.
  await evaluate('document.querySelector("main").innerHTML="<div class=ui-container>短い本文</div>"');
  if(!await evaluate('Math.abs(document.querySelector(".ui-footer").getBoundingClientRect().bottom-innerHeight)<2'))throw new Error('Short page footer');
  await evaluate('document.querySelector("main").style.minHeight="1500px"');
  if(!await evaluate('document.querySelector(".ui-footer").getBoundingClientRect().top>=1500'))throw new Error('Long page footer');
  console.log('Standalone layouts: 4 widths × light/dark × 5 designs; responsive column geometry, embedded width, sidebar pointer/keyboard, short/long footer');
  await navigate('components/dialog.html');
  await click('[data-ui-target="#project-dialog"]');
  if(!await evaluate('document.querySelector("#project-dialog").open'))throw new Error('Pointer did not open dialog');
  await key('Tab'); await key('Tab');
  if(!await evaluate('document.querySelector("#project-dialog").contains(document.activeElement)'))throw new Error('Native dialog Tab focus escaped');
  await key('Escape'); await delay(30);
  if(!await evaluate('!document.querySelector("#project-dialog").open && document.activeElement.dataset.uiTarget === "#project-dialog"'))throw new Error('Native Escape/focus restoration failed: '+JSON.stringify(await evaluate('({open:document.querySelector("#project-dialog").open,focus:document.activeElement.outerHTML})')));
  await click('[data-ui-target="#project-dialog"]');
  await click('#project-dialog [data-ui-dismiss]');await delay(30);
  if(!await evaluate('!document.querySelector("#project-dialog").open'))throw new Error('Pointer dismissal failed');
  await navigate('components/navigation.html');
  await evaluate('document.querySelector("[data-ui-tabs] [data-ui-toggle=tab]").focus()');await key('ArrowRight');
  if(!await evaluate('document.activeElement.getAttribute("aria-selected") === "true" && document.activeElement.dataset.uiTarget === "activity"'))throw new Error('Native keyboard tab navigation failed');
  console.log('Native pointer/keyboard checks: dialog open/dismiss/Escape/focus return; tab ArrowRight');
  for(const width of [320,1440]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    await navigate('components/forms.html');
    await evaluate('KavUI.setDesignTheme("glassmorphism");KavUI.setColorTheme('+JSON.stringify(width===320?'dark':'light')+')');
    for(const type of ['time','datetime-local','month','week','color']) {
      const input='#input-types input[name="'+type+'"]';
      const button=input+' + .ui-input-picker-trigger';
      if(type==='datetime-local')await evaluate('document.querySelector('+JSON.stringify(input)+').value="2026-10-21T09:00"');
      await click(button);await delay(180);
      const state=await evaluate(`(()=>{const p=document.querySelector('.ui-input-popup:popover-open');if(!p)return false;const r=p.getBoundingClientRect();return r.left>=0 && r.right<=innerWidth+1 && r.top>=0 && r.bottom<=innerHeight+1 && p.contains(document.activeElement);})()`);
      if(!state)throw new Error('Input popup bounds/focus: '+[width,type]+' '+await evaluate('JSON.stringify({active:document.activeElement.outerHTML,open:[...document.querySelectorAll(".ui-input-popup:popover-open")].map(p=>p.getBoundingClientRect().toJSON())})'));
      const {data}=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
      writeFileSync(join(artifacts,'input-picker-'+type+'-'+width+'.png'),Buffer.from(data,'base64'));
      if(type==='time') {
        await click('.ui-input-popup:popover-open [data-ui-picker-part=hour] + .ui-select-trigger');await key('ArrowDown');await key('Enter');
        if(!await evaluate('!!document.querySelector(".ui-input-popup:popover-open") && !document.querySelector(".ui-select-menu:popover-open")'))throw new Error('Time nested select closed parent');
        await key('Escape');
        if(!await evaluate('document.querySelector('+JSON.stringify(input)+').value==="" && document.activeElement.matches(".ui-input-picker-trigger")'))throw new Error('Time Escape cancellation');
        await click(button);await click(button);
        if(await evaluate('!!document.querySelector(".ui-input-popup:popover-open")'))throw new Error('Input popup pointer toggle did not close');
      } else {
        if(type==='month' || type==='week')await evaluate(`document.querySelector('.ui-input-popup:popover-open [data-ui-picker-part=year]').value='2026';document.querySelector('.ui-input-popup:popover-open [data-ui-picker-part=${type}]').value='${type==='month'?'10':'53'}'`);
        if(type==='datetime-local')await click('.ui-input-popup:popover-open [data-ui-calendar-date="2026-10-22"]');
        if(type==='color')await click('.ui-input-popup:popover-open .ui-color-choice[aria-label="#3d9a63"]');
        await click('.ui-input-popup:popover-open [data-ui-picker-apply]');
        const expected={'month':'2026-10','week':'2026-W53','datetime-local':'2026-10-22T09:00','color':'#3d9a63'}[type];
        if(!await evaluate('document.querySelector('+JSON.stringify(input)+').value==='+JSON.stringify(expected)+' && !document.querySelector(".ui-input-popup:popover-open")'))throw new Error('Input popup native commit: '+[width,type]);
      }
    }
    await evaluate('document.querySelector("#input-types input[type=range]").focus()');await key('ArrowRight');
    if(!await evaluate('document.querySelector("#input-types input[type=range]").value==="51"'))throw new Error('Framework range keyboard input');
  }
  await evaluate('KavUI.setDesignTheme("default")');
  console.log('Forms input pickers: native pointer, nested select, keyboard cancel, toggle, commit and bounds for time/datetime/month/week/color @320/1440; range keyboard');
  await navigate('components/forms.html');
  await click('#checks-demo label:has(#check-report)');
  if(!await evaluate('document.querySelector("#check-report").checked'))throw new Error('Custom checkbox label click');
  await evaluate('document.querySelector("#check-notice").focus()');await key(' ','Space');
  if(!await evaluate('!document.querySelector("#check-notice").checked && document.querySelector("#check-notice").matches(":focus-visible")'))throw new Error('Custom checkbox Space/focus');
  await evaluate('document.querySelector("#radio-personal").focus()');await key('ArrowRight');
  if(!await evaluate('document.querySelector("#radio-team").checked && !document.querySelector("#radio-personal").checked && document.activeElement.id==="radio-team"'))throw new Error('Custom radio ArrowRight/focus');
  for(const width of [320,1440]) for(const mode of ['light','dark']) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    await evaluate('KavUI.setDesignTheme("glassmorphism");KavUI.setColorTheme('+JSON.stringify(mode)+');document.querySelector("#checkbox-radio").scrollIntoView({behavior:"instant",block:"start"})');await delay(200);
    const {data}=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    writeFileSync(join(artifacts,'checks-'+width+'-'+mode+'.png'),Buffer.from(data,'base64'));
  }
  await send('Emulation.setEmulatedMedia',{features:[{name:'forced-colors',value:'active'}]});
  if(!await evaluate('getComputedStyle(document.querySelector("#check-report")).appearance==="auto"'))throw new Error('Custom checks forced-colors fallback');
  await send('Emulation.setEmulatedMedia',{features:[]});await evaluate('KavUI.setDesignTheme("default")');
  console.log('Custom checkbox/radio: native label click, Space/focus, ArrowRight/radio selection, forced colors and light/dark @320/1440');
  // Verify the selected preference survives OS changes and page navigation.
  await navigate('components/theme-switcher.html');
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'light'}]});
  await click('#color-mode-buttons [data-ui-color-mode=system]');
  await delay(60);
  if(!await evaluate('document.documentElement.dataset.bsTheme==="light" && document.documentElement.dataset.uiColorPreference==="system" && localStorage.getItem("kav-ui-theme")==="system"'))throw new Error('System selection/persistence');
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'dark'}]});await delay(80);
  if(!await evaluate('document.documentElement.dataset.bsTheme==="dark" && [...document.querySelectorAll("[data-ui-color-mode=system]")].every(b=>b.getAttribute("aria-pressed")==="true") && document.querySelector("[data-ui-color-select]").value==="system"'))throw new Error('System did not follow OS dark');
  await navigate('components/theme-switcher.html');
  if(!await evaluate('document.documentElement.dataset.uiColorPreference==="system" && document.documentElement.dataset.bsTheme==="dark"'))throw new Error('System selection did not survive navigation');
  await click('#color-mode-icons [data-ui-color-mode=light]');
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'light'}]});await delay(60);
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'dark'}]});await delay(60);
  if(!await evaluate('document.documentElement.dataset.bsTheme==="light" && document.documentElement.dataset.uiColorPreference==="light"'))throw new Error('Explicit light followed OS unexpectedly');
  await click('#color-mode-select .ui-select-trigger');await key('End');await key('Enter');
  if(!await evaluate('document.documentElement.dataset.uiColorPreference==="system" && document.documentElement.dataset.bsTheme==="dark"'))throw new Error('Color select system keyboard change');
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'light'}]});await delay(80);
  if(!await evaluate('document.documentElement.dataset.bsTheme==="light" && document.querySelector("#color-mode-icons [data-ui-color-mode=system]").getAttribute("aria-pressed")==="true"'))throw new Error('System did not follow OS light');
  await send('Emulation.setEmulatedMedia',{features:[]});
  await evaluate('KavUI.setColorTheme("light",{persist:true})');
  console.log('Light/dark/system: native buttons, icon buttons and select; live OS light/dark, explicit override, synchronization and navigation persistence');
  await navigate('components/calendar.html');
  await click('[data-ui-calendar-date="2026-10-21"]');
  const before=await evaluate('document.activeElement.dataset.uiCalendarDate');
  await key('ArrowRight');
  if(!await evaluate('document.activeElement.dataset.uiCalendarDate === "2026-10-22"'))throw new Error('Calendar native arrow navigation failed');
  await key('Enter');
  if(!await evaluate('document.activeElement.closest("[data-ui-calendar]").dataset.uiValue === "2026-10-22"'))throw new Error('Calendar native keyboard selection failed from '+before);
  console.log('Calendar native pointer/keyboard: click date, ArrowRight and Enter selection');
  for(const width of [320,1440]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    await navigate('components/calendar.html');
    for(const mode of ['light','dark']) for(const design of ['default','glass','glassmorphism','flat','soft']) {
      await evaluate('KavUI.setDesignTheme('+JSON.stringify(design)+');KavUI.setColorTheme('+JSON.stringify(mode)+')');
      await click('#calendar-day-modal-demo [data-ui-calendar-date="2026-10-21"]');await delay(180);
      const state=await evaluate(`(()=>{const d=document.querySelector('#calendar-day-modal-demo > dialog');if(!d?.open)return false;const r=d.getBoundingClientRect();return r.left>=0 && r.right<=innerWidth+1 && r.top>=0 && r.bottom<=innerHeight+1 && d.contains(document.activeElement) && d.dataset.uiCalendarModalValue==='2026-10-21' && d.querySelectorAll('.ui-calendar-agenda-event').length===2;})()`);
      if(!state)throw new Error('Calendar day modal bounds/focus/content '+[width,mode,design]);
      if(design==='glassmorphism' && ((width===320 && mode==='dark') || (width===1440 && mode==='light'))) {
        const {data}=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
        writeFileSync(join(artifacts,'calendar-day-modal-'+width+'-'+mode+'.png'),Buffer.from(data,'base64'));
      }
      await key('Escape');await delay(30);
      if(!await evaluate('!document.querySelector("#calendar-day-modal-demo > dialog").open && document.activeElement.dataset.uiCalendarDate==="2026-10-21"'))throw new Error('Calendar day modal Escape/focus return');
      await key('ArrowRight');
      if(await evaluate('document.querySelector("#calendar-day-modal-demo > dialog").open'))throw new Error('Calendar arrow navigation opened modal');
      await key('Enter');await delay(180);
      if(!await evaluate('document.querySelector("#calendar-day-modal-demo > dialog").open && document.querySelector("#calendar-day-modal-demo > dialog").dataset.uiCalendarModalValue==="2026-10-22" && !!document.querySelector("#calendar-day-modal-demo > dialog .ui-calendar-empty")'))throw new Error('Calendar day modal keyboard/empty date');
      await click('#calendar-day-modal-demo > dialog [data-ui-dismiss=dialog]');await delay(30);
      if(!await evaluate('document.activeElement.dataset.uiCalendarDate==="2026-10-22" && document.querySelectorAll("#calendar-day-modal-demo > dialog").length===1'))throw new Error('Calendar day modal button close/reuse');
    }
  }
  await click('#calendar-custom-modal-demo [data-ui-calendar-date="2026-10-21"]');
  if(!await evaluate('document.querySelector("#calendar-custom-dialog").open && document.querySelector("#calendar-custom-dialog").dataset.uiCalendarModalValue==="2026-10-21"'))throw new Error('Calendar existing custom dialog');
  await key('Escape');await evaluate('KavUI.setDesignTheme("default")');
  console.log('Calendar day modal: pointer/Enter selection, empty dates, Escape/button close, focus return and bounds across all 10 modes/designs @320/1440; existing dialog');

  await navigate('components/datepicker.html');
  await click('[data-ui-datepicker-action="toggle"]');
  if(!await evaluate('document.querySelector(".ui-datepicker-popup").matches(":popover-open")'))throw new Error('Native pointer did not open date picker');
  const picked=await evaluate(`document.querySelector('.ui-datepicker-popup [data-ui-calendar-date][tabindex="0"]').dataset.uiCalendarDate`);
  await click('.ui-datepicker-popup [data-ui-calendar-date="'+picked+'"]');
  if(!await evaluate('document.querySelector("[data-ui-datepicker] input").value === '+JSON.stringify(picked)+' && !document.querySelector(".ui-datepicker-popup").matches(":popover-open")'))throw new Error('Native pointer did not select date');
  await click('[data-ui-datepicker-action="toggle"]');
  await key('Escape');
  if(!await evaluate('document.activeElement.type === "date" && !document.querySelector(".ui-datepicker-popup").matches(":popover-open")'))throw new Error('Date picker native Escape/focus failed');
  console.log('Date picker native pointer/keyboard: open, select date, Escape and input focus return');
  await click('[data-ui-datepicker-button="icon"] .ui-datepicker-toggle svg');
  if(!await evaluate('document.querySelector("[data-ui-datepicker-button=icon] .ui-datepicker-popup").matches(":popover-open")'))throw new Error('Icon date picker did not open');
  await key('Escape');
  if(!await evaluate('document.activeElement.id === "datepicker-icon"'))throw new Error('Icon picker focus did not return');
  await evaluate('document.querySelector("[data-ui-datepicker-button=icon] .ui-datepicker-toggle").focus()');await key('Enter');
  if(!await evaluate('document.querySelector("[data-ui-datepicker-button=icon] .ui-datepicker-popup").matches(":popover-open")'))throw new Error('Icon keyboard activation failed');
  await key('Escape');
  console.log('Date picker icon: native SVG click, Enter activation, Escape and focus return');
  await navigate('components/loading.html');
  await click('[data-demo-loading-start="error"]');
  if(!await evaluate('[...document.querySelectorAll("[data-demo-loading-start]")].every(button=>button.disabled) && document.querySelector("[data-demo-loading-panel]").getAttribute("aria-busy")==="true"'))throw new Error('Loading demo did not enter busy state');
  await delay(1100);
  if(!await evaluate('document.querySelector("[data-demo-loading-result]").textContent.includes("失敗") && document.querySelector("#loading-demo-progress").value===60 && [...document.querySelectorAll("[data-demo-loading-start]")].every(button=>!button.disabled)'))throw new Error('Loading failure did not restore controls');
  await evaluate('document.querySelector("[data-demo-loading-start=success]").focus()');
  await key('Enter');
  await delay(1700);
  if(!await evaluate('document.querySelector("[data-demo-loading-result]").textContent==="保存しました（デモ）。" && document.querySelector("#loading-demo-progress").value===100 && [...document.querySelectorAll("[data-demo-loading-start]")].every(button=>!button.disabled)'))throw new Error('Loading retry via keyboard failed');
  const loadingFrames = () => evaluate(`(()=>({
    spinner:getComputedStyle(document.querySelector('.ui-spinner')).transform,
    border:getComputedStyle(document.querySelector('.ui-loading-border[aria-busy="true"]'),'::after').getPropertyValue('--ui-loading-angle'),
    progress:getComputedStyle(document.querySelector('#loading-indeterminate')).backgroundPosition,
    shimmer:getComputedStyle(document.querySelector('.skeleton-shimmer'),'::after').transform
  }))()`);
  const frameBefore=await loadingFrames();await delay(150);const frameAfter=await loadingFrames();
  if(Object.keys(frameBefore).some(key=>frameBefore[key]===frameAfter[key]))throw new Error('A loading animation did not move: '+JSON.stringify({frameBefore,frameAfter}));
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  const motion=await evaluate(`(()=>{
    const spinner=document.querySelector('.ui-spinner');
    const border=document.querySelector('.ui-loading-border[aria-busy="true"]');
    const progress=document.querySelector('#loading-indeterminate');
    return [getComputedStyle(spinner).animationName,getComputedStyle(border,'::after').animationName,getComputedStyle(progress).animationName,getComputedStyle(document.querySelector('.skeleton-shimmer'),'::after').animationName];
  })()`);
  if(motion.some(name=>name!=='none'))throw new Error('Loading reduced motion failed: '+JSON.stringify(motion));
  await send('Emulation.setEmulatedMedia',{features:[]});
  console.log('Loading: pointer failure, keyboard retry, restored buttons, progress, skeleton shimmer motion and reduced motion');
  // Verify that reduced motion suppresses entrance fades, including native opens.
  await navigate('tests/ui.html');await evaluate('window.uiTestsDone');
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  const reducedEntrance=await evaluate(`(()=>{
    const fixture=document.querySelector('#fixture');
    fixture.innerHTML='<dialog class="ui-dialog"><button data-ui-tooltip="補足">説明</button><button>閉じる</button></dialog><div id="reduced-panel" hidden>パネル</div><div class="alert alert-info" hidden>通知</div><div class="accordion"><details open><summary>項目</summary><p>内容</p></details></div><div class="ui-datepicker" data-ui-datepicker><input type="date" aria-label="日付"></div>';
    KavUI.init(fixture);
    const dialog=fixture.querySelector('dialog');dialog.showModal();
    const panel=fixture.querySelector('#reduced-panel');KavUI.show(panel);
    const alert=fixture.querySelector('.alert');KavUI.show(alert);
    const note=KavUI.toast('通知',{duration:0});
    fixture.querySelector('[data-ui-tooltip]').focus();
    const tooltip=document.querySelector('.ui-tooltip');
    const animations=[dialog,panel,alert,note,tooltip,fixture.querySelector('details p')].map(element=>getComputedStyle(element).animationName);
    animations.push(getComputedStyle(dialog,'::backdrop').animationName);
    dialog.close();fixture.querySelector('.ui-datepicker-toggle').click();
    animations.push(getComputedStyle(fixture.querySelector('.ui-datepicker-popup')).animationName);
    return animations;
  })()`);
  if(reducedEntrance.some(name=>name!=='none'))throw new Error('Entrance reduced motion failed: '+JSON.stringify(reducedEntrance));
  await send('Emulation.setEmulatedMedia',{features:[]});
  console.log('Entrance fade: native modal, toast, tooltip, alert, panel, repeated opens and reduced motion');
  await navigate('components/buttons.html');
  await click('[data-ui-toast] .btn-icon');
  if(!await evaluate('document.querySelector(".ui-toast").textContent.includes("アイコン付きボタン")'))throw new Error('Button SVG click failed');
  await evaluate('document.querySelector(".ui-toasts").remove();document.querySelector("[data-ui-toast]").focus()');
  await key('Enter');
  if(!await evaluate('document.querySelector(".ui-toast") && document.activeElement.matches("[data-ui-toast]")'))throw new Error('Button keyboard activation failed');
  console.log('Buttons: SVG pointer click, native Enter activation and focus');
  await navigate('components/themes.html');
  await evaluate('KavUI.setDesignTheme("default");document.querySelector("[data-ui-theme-select]").focus()');
  await key('ArrowDown');await key('Enter');
  if(!await evaluate('document.body.dataset.uiTheme==="glass" && [...document.querySelectorAll("[data-ui-theme-select]")].every(select=>select.value==="glass")'))throw new Error('Custom design theme select did not synchronize');
  await navigate('components/themes.html');
  if(!await evaluate('document.body.dataset.uiTheme==="glass"'))throw new Error('Design theme did not survive reload');
  await navigate('components/dialog.html');
  if(!await evaluate('document.body.dataset.uiTheme==="glass"'))throw new Error('Design theme did not carry to another component page');
  // Exercise every design and light/dark combination at phone and desktop widths.
  for(const width of [320,1440]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    for(const mode of ['light','dark']) for(const design of ['default','glass','glassmorphism','flat','soft']) {
      await navigate('components/themes.html');
      await evaluate('if(document.documentElement.dataset.bsTheme!=='+JSON.stringify(mode)+')document.querySelector("[data-ui-toggle=theme]").click();KavUI.setDesignTheme('+JSON.stringify(design)+')');
      await evaluate('document.querySelector(".ui-card [data-ui-toggle=dialog]").click()');
      await delay(180);
      await evaluate('document.querySelector("#theme-dialog [data-ui-tooltip]").focus({preventScroll:true})');
      const geometry=await evaluate(`(()=>{
        const dialog=document.querySelector('#theme-dialog');const tip=document.querySelector('.ui-tooltip');
        return [dialog,tip].every(el=>{if(!el)return false;const r=el.getBoundingClientRect();return r.left>=0 && r.right<=innerWidth+1 && r.top>=0 && r.bottom<=innerHeight+1;});
      })()`);
      if(!geometry)throw new Error('Theme modal/tooltip bounds: '+[width,mode,design]+' '+await evaluate('JSON.stringify({open:document.querySelector("#theme-dialog").open,active:document.activeElement.outerHTML,tooltip:document.querySelector(".ui-tooltip")?.outerHTML})'));
      await evaluate('document.querySelector("#theme-dialog [data-ui-dismiss=dialog]").click();document.querySelector("[data-ui-datepicker]").scrollIntoView({behavior:"instant",block:"center"});document.querySelector("[data-ui-datepicker] .ui-datepicker-toggle").click()');
      const popup=await evaluate(`(()=>{const r=document.querySelector('.ui-datepicker-popup').getBoundingClientRect();return r.left>=0 && r.right<=innerWidth+1 && r.top>=0 && r.bottom<=innerHeight+1;})()`);
      if(!popup)throw new Error('Theme date picker bounds: '+[width,mode,design]);
      await key('Escape');
      await evaluate('document.querySelector("[data-ui-toast-copy]").click()');
      if(!await evaluate('document.documentElement.scrollWidth<=innerWidth+1 && document.querySelector(".ui-toast")'))throw new Error('Theme layout/toast: '+[width,mode,design]+' '+await evaluate('JSON.stringify({width:document.documentElement.scrollWidth,viewport:innerWidth,toast:!!document.querySelector(".ui-toast"),dialog:document.querySelector("#theme-dialog").open,popup:document.querySelector(".ui-datepicker-popup").matches(":popover-open"),active:document.activeElement.outerHTML})'));
      if(width===1440) {
        await evaluate('scrollTo({top:0,left:0,behavior:"instant"})');await delay(180);
        const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});
        writeFileSync(join(artifacts,'theme-'+design+'-'+mode+'.png'),Buffer.from(shot.data,'base64'));
      }
    }
  }
  // Custom select uses the popup, retains form values and stays in the viewport.
  for(const width of [320,1440]) for(const mode of ['light','dark']) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    await navigate('components/theme-switcher.html');
    await evaluate('KavUI.setDesignTheme("glassmorphism");KavUI.setColorTheme('+JSON.stringify(mode)+')');
    await click('.catalog-header .ui-select-trigger');await delay(200);
    const bounds=await evaluate(`(()=>{const p=document.querySelector('.ui-select-menu:popover-open');if(!p)return false;const r=p.getBoundingClientRect();return r.left>=0 && r.right<=innerWidth && r.top>=0 && r.bottom<=innerHeight;})()`);
    if(!bounds)throw new Error('Custom select popup bounds '+[width,mode]);
    const {data}=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    writeFileSync(join(artifacts,'select-open-'+width+'-'+mode+'.png'),Buffer.from(data,'base64'));
    await click('.ui-select-menu:popover-open [data-index="1"]');
    if(!await evaluate('document.body.dataset.uiTheme==="glass" && document.querySelector("[data-ui-design=glass]").getAttribute("aria-pressed")==="true" && !document.querySelector(".ui-select-menu:popover-open")'))throw new Error('Custom select pointer synchronization');
    await click('.catalog-header .ui-select-trigger');await key('End');await key('Enter');
    if(!await evaluate('document.body.dataset.uiTheme==="soft"'))throw new Error('Custom select End/Enter');
    await click('.catalog-header .ui-select-trigger');await key('Home');await key('Escape');
    if(!await evaluate('document.body.dataset.uiTheme==="soft" && !document.querySelector(".ui-select-menu:popover-open")'))throw new Error('Custom select Escape cancellation');
  }
  await navigate('components/themes.html');
  await click('.ui-card [data-ui-toggle=dialog]');await delay(200);
  await evaluate(`(()=>{const dialog=document.querySelector('#theme-dialog');const label=document.createElement('label');label.textContent='表示方法';const select=document.createElement('select');select.className='form-select';select.innerHTML='<option>一覧</option><option>カード</option>';label.append(select);dialog.querySelector('.buttons').before(label);KavUI.init(label);})()`);
  await click('#theme-dialog .ui-select-trigger');await delay(180);
  if(!await evaluate('!!document.querySelector("#theme-dialog .ui-select-menu:popover-open")'))throw new Error('Custom select in modal did not open');
  await key('Escape');
  if(!await evaluate('document.querySelector("#theme-dialog").open && !document.querySelector(".ui-select-menu:popover-open") && document.activeElement.matches(".ui-select-trigger")'))throw new Error('Custom select Escape closed parent modal or lost focus');
  await evaluate(`(()=>{const label=document.createElement('label');label.textContent='時刻';const input=document.createElement('input');input.type='time';input.className='form-control';label.append(input);document.querySelector('#theme-dialog .buttons').before(label);KavUI.init(label);})()`);
  await click('#theme-dialog .ui-input-picker-trigger');await delay(180);await key('Escape');
  if(!await evaluate('document.querySelector("#theme-dialog").open && !document.querySelector(".ui-input-popup:popover-open") && document.activeElement.matches(".ui-input-picker-trigger")'))throw new Error('Input picker Escape closed parent modal or lost focus');
  await key('Escape');
  console.log('Custom select: native pointer, End/Enter, Escape, button synchronization, viewport bounds @320/1440 light/dark; select/input popups preserve parent modal');
  await evaluate('KavUI.setDesignTheme("default",{persist:true})');
  console.log('Design themes: custom select, synchronization, reload/navigation persistence, all 10 designs/modes @320 and1440; modal, tooltip, date picker and toast');
  await navigate('components/animations-interactions.html');
  await click('[data-ui-target="#motion-dialog"]');await delay(180);
  await key('Escape');await delay(20);
  if(!await evaluate('!document.querySelector("#motion-dialog").open && !!document.querySelector("[data-ui-motion-ghost]")'))throw new Error('Native dialog exit motion or immediate close failed');
  // Animation completion depends on browser frames, not the Node timer alone.
  for(let attempt=0;attempt<40 && await evaluate('!!document.querySelector("[data-ui-motion-ghost]")');attempt++)await delay(25);
  if(!await evaluate('!document.querySelector("[data-ui-motion-ghost]")'))throw new Error('Exit visual was not cleaned up');
  await click('[data-ui-target="#motion-panel"]');await delay(180);
  await click('[data-ui-target="#motion-panel"]');
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await delay(30);
  await evaluate(`(()=>{
    const button=document.querySelector('.switch input');button.click();
    KavUI.show('#motion-panel');KavUI.hide('#motion-panel');
    KavUI.setDesignTheme('soft');
  })()`);
  const reducedMotionState=await evaluate(`({ghosts:document.querySelectorAll('[data-ui-motion-ghost]').length,web:document.body.getAnimations().length,switchTransition:getComputedStyle(document.querySelector('.switch input'),'::after').transitionDuration})`);
  if(reducedMotionState.ghosts || reducedMotionState.web || reducedMotionState.switchTransition!=='0s')throw new Error('Interaction reduced motion failed: '+JSON.stringify(reducedMotionState));
  await send('Emulation.setEmulatedMedia',{features:[]});
  await evaluate('KavUI.setDesignTheme("default")');
  console.log('Interaction motion: native Escape, immediate close, exit cleanup and mid-animation reduced motion');
  // This disposable browser profile cannot display a permission prompt.
  await send('Browser.grantPermissions',{permissions:['clipboardReadWrite','clipboardSanitizedWrite']},null);
  await navigate('components/clipboard.html');
  await send('Page.bringToFront');
  await evaluate("window.copyTestError=null;document.addEventListener('ui:copyerror',event=>{window.copyTestError=event.detail.error.name+': '+event.detail.error.message;})");
  await click('[data-ui-copy]');await delay(150);
  if(!await evaluate('document.querySelector("[data-ui-copy-status]").dataset.uiCopyState==="success"'))throw new Error('Native clipboard write failed');
  await evaluate('document.querySelector("#clipboard-input").focus();document.querySelector("#clipboard-input").select()');
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'v',code:'KeyV',windowsVirtualKeyCode:86,modifiers:2});
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'v',code:'KeyV',windowsVirtualKeyCode:86,modifiers:2});
  if(!await evaluate('document.querySelector("#clipboard-input").value==="https://example.test/projects/design-catalog"'))throw new Error('Native clipboard paste did not match copied text');
  const copyGlyph=await evaluate('document.querySelector(".ui-copy-icon path").getAttribute("d")');
  await evaluate('document.querySelector(".ui-copy-icon").focus()');await key('Enter');await delay(150);
  if(!await evaluate('document.querySelector(".ui-copy-icon").closest(".ui-clipboard").querySelector("[data-ui-copy-status]").dataset.uiCopyState==="success" && document.activeElement.matches(".ui-copy-icon")'))throw new Error('Clipboard icon keyboard activation or focus failed');
  if(!await evaluate('document.querySelector(".ui-copy-icon").dataset.uiCopyState==="success" && document.querySelector(".ui-copy-icon path").getAttribute("d")!=='+JSON.stringify(copyGlyph)))throw new Error('Copy checkmark did not appear');
  await delay(2050);
  if(!await evaluate('!document.querySelector(".ui-copy-icon").hasAttribute("data-ui-copy-state") && document.querySelector(".ui-copy-icon path").getAttribute("d")==='+JSON.stringify(copyGlyph)))throw new Error('Copy icon did not reset');
  await navigate('components/toasts.html');
  await click('[data-ui-toast-copy][data-ui-copy-text]');
  await click('.ui-toast [data-ui-copy]');await delay(150);
  if(!await evaluate('document.querySelector(".ui-toast [data-ui-copy-status]").dataset.uiCopyState==="success"'))throw new Error('Toast clipboard write failed');
  console.log('Clipboard: native copy/paste, SVG click, checkmark and reset, keyboard and focus, toast copy action');
  await navigate('components/mdi-icons.html');
  if(!await evaluate(`(()=>{const icons=[...document.querySelectorAll('[data-mdi-icon]')];return icons.length===128 && icons.every(card=>{const template=document.createElement('template');template.innerHTML=card.querySelector('code').textContent;const svg=template.content.firstElementChild;return svg?.localName==='svg' && svg.querySelector('path[d]') && !svg.querySelector('use, image, script, foreignObject') && !svg.querySelector('[href]') && svg.getAttribute('fill')==='currentColor' && svg.getAttribute('width')==='24';});})()`))throw new Error('MDI SVG snippets must be self-contained');
  for(const width of [320,768,1440]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    for(const [query,count] of [['ＭＤＩ－ＨＯＭＥ',2],['設定',2],['再生',1],['radiobox',2],['no-such-icon-name',0],['',128]]) {
      await evaluate(`(()=>{const input=document.querySelector('[data-mdi-search]');input.value=${JSON.stringify(query)};input.dispatchEvent(new Event('input',{bubbles:true}));})()`);
      await delay(20);
      if(!await evaluate(`document.querySelectorAll('[data-mdi-icon]:not([hidden])').length===${count} && document.querySelector('[data-mdi-empty]').hidden===${count>0} && document.documentElement.scrollWidth<=innerWidth+1`))throw new Error('MDI search/overflow '+[width,query]);
    }
  }
  await click('[data-ui-copy-target="#mdi-code-home"]');await delay(80);
  const copiedSVG=await evaluate('navigator.clipboard.readText()');
  if(copiedSVG!==await evaluate('document.getElementById("mdi-code-home").textContent'))throw new Error('MDI copied SVG differs from displayed source');
  await send('Page.navigate',{url:'about:blank'});
  for(let i=0;i<100;i++){await delay(10);if(await evaluate('location.href==="about:blank" && document.readyState==="complete"'))break;}
  await evaluate('document.body.style.color="rgb(47,111,196)";document.body.innerHTML='+JSON.stringify(copiedSVG));
  if(!await evaluate('document.querySelector("svg").getBoundingClientRect().width===24 && document.querySelector("path").getBBox().width>0 && getComputedStyle(document.querySelector("path")).fill==="rgb(47, 111, 196)" && !document.styleSheets.length && typeof KavUI==="undefined"'))throw new Error('Copied SVG must render alone without CSS or JS');
  await send('Network.enable');await send('Network.setBlockedURLs',{urls:['*assets/ui/js/*','*assets/js/*','https://*','http://*']});
  await send('Page.navigate',{url:pathToFileURL(join(site,'components/mdi-icons.html')).href});
  for(let i=0;i<100;i++){await delay(20);if(await evaluate('document.readyState==="complete" && !!document.querySelector("[data-mdi-search]")'))break;}
  if(!await evaluate('typeof KavUI==="undefined" && document.querySelectorAll(".mdi-icon-preview > svg").length===128 && [...document.querySelectorAll(".mdi-icon-preview path")].every(path=>path.getBBox().width>0)'))throw new Error('MDI gallery SVGs must render with scripts/network blocked');
  await send('Network.setBlockedURLs',{urls:[]});
  console.log('MDI: 128 self-contained SVGs, English/Japanese search at 3 widths, native clipboard copy, standalone rendering with no CSS/JS, all previews with scripts/network blocked');
  await send('Network.setBlockedURLs',{urls:['https://*','http://*','*assets/ui/icons/mdi/*.svg']});
  await navigate('components/mdi-icons.html');
  if(!await evaluate(`(async()=>{
    const container=document.createElement('div');container.style.cssText='position:fixed;left:-9999px;color:rgb(47,111,196)';
    const cards=[...document.querySelectorAll('[data-mdi-icon]')];
    for(const card of cards){const icon=document.createElement('span');icon.setAttribute('icon',card.querySelector('h3').textContent);container.append(icon);}
    document.body.append(container);await new Promise(resolve=>setTimeout(resolve,0));
    const icons=[...container.children];
    const ok=icons.length===128 && icons.every((host,index)=>host.querySelector('path')?.getAttribute('d')===cards[index].querySelector('.mdi-icon-preview path').getAttribute('d') && host.querySelector('path').getBBox().width>0 && getComputedStyle(host.querySelector('path')).fill==='rgb(47, 111, 196)');
    container.remove();return ok;
  })()`))throw new Error('All 128 attribute icons must match SVG assets and render without fetching');
  await send('Network.setBlockedURLs',{urls:[]});
  console.log('MDI attributes: all 128 names render matching paths with inherited color and SVG/network requests blocked');

  // Newly added framework components: native pointer/keyboard and theme bounds.
  for(const width of [320,768,1440])for(const mode of ['light','dark'])for(const design of ['default','glass','glassmorphism','flat','soft']) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    await navigate('components/dropdown.html');
    await evaluate('KavUI.setColorTheme('+JSON.stringify(mode)+');KavUI.setDesignTheme('+JSON.stringify(design)+')');
    await click('[data-ui-target="#dropdown-basic-menu"]');
    if(!await evaluate(`(()=>{const panel=document.getElementById('dropdown-basic-menu'),r=panel.getBoundingClientRect();return panel.matches(':popover-open') && r.left>=0 && r.right<=innerWidth+1 && r.top>=0 && r.bottom<=innerHeight+1 && document.activeElement===panel.querySelector('button');})()`))throw new Error('Dropdown native bounds/focus '+[width,mode,design]);
    await key('ArrowDown');
    if(!await evaluate('document.activeElement.matches("a.ui-dropdown-item")'))throw new Error('Dropdown native arrow skips disabled item');
    await key('End');await key('Enter');
    if(!await evaluate('!document.getElementById("dropdown-basic-menu").matches(":popover-open") && document.activeElement.matches("[data-ui-target=\\"#dropdown-basic-menu\\"]") && !!document.querySelector(".ui-toast")'))throw new Error('Dropdown selection/native Enter/toast');
    await click('[data-ui-target="#dropdown-up"]');await key('Tab');
    if(!await evaluate('!document.getElementById("dropdown-up").matches(":popover-open") && document.activeElement.matches("[data-ui-target=\\"#dropdown-end\\"]")'))throw new Error('Dropdown Tab closes and advances focus');
    await click('[data-ui-target="#dropdown-end"]');
    await click('.page-heading h1');
    if(!await evaluate('!document.getElementById("dropdown-end").matches(":popover-open") && document.querySelector("[data-ui-target=\\"#dropdown-end\\"]").getAttribute("aria-expanded")==="false"'))throw new Error('Dropdown outside click and aria');
  }
  await navigate('components/popover.html');
  await click('[data-ui-target="#popover-form-panel"]');
  if(!await evaluate('document.activeElement.id==="popover-project-name"'))throw new Error('Popover autofocus');
  await click('#popover-form-panel .ui-select-trigger');
  if(!await evaluate('document.getElementById("popover-form-panel").matches(":popover-open") && !!document.querySelector(".ui-select-menu:popover-open")'))throw new Error('Nested select must preserve parent popover');
  await key('End');await key('Enter');
  if(!await evaluate('document.getElementById("popover-form-panel").matches(":popover-open") && document.getElementById("popover-view").selectedIndex===1'))throw new Error('Nested select commit');
  await key('Escape');
  if(!await evaluate('!document.getElementById("popover-form-panel").matches(":popover-open") && document.activeElement.matches("[data-ui-target=\\"#popover-form-panel\\"]")'))throw new Error('Popover Escape focus return');

  await navigate('components/drawer.html');
  for(const width of [320,768,1440])for(const mode of ['light','dark'])for(const design of ['default','glass','glassmorphism','flat','soft'])for(const direction of ['end','start','bottom','top']) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    await evaluate('KavUI.setColorTheme('+JSON.stringify(mode)+');KavUI.setDesignTheme('+JSON.stringify(design)+')');
    await click('[data-ui-target="#drawer-'+direction+'"]');
    await evaluate('document.querySelector(".ui-drawer[open]").getAnimations().forEach(animation=>animation.finish())');
    if(!await evaluate(`(()=>{const drawer=document.getElementById('drawer-${direction}'),r=drawer.getBoundingClientRect();return drawer.open && r.left>=-.5 && r.right<=innerWidth+1 && r.top>=-.5 && r.bottom<=innerHeight+1 && getComputedStyle(document.documentElement).overflow==='hidden' && drawer.contains(document.activeElement);})()`))throw new Error('Drawer bounds/scroll lock/focus '+[width,mode,design,direction]);
    await key('Escape');await delay(10);
    if(!await evaluate('!document.querySelector(".ui-drawer[open]") && getComputedStyle(document.documentElement).overflow!=="hidden" && document.activeElement.matches("[data-ui-target=\\"#drawer-'+direction+'\\"]")'))throw new Error('Drawer native Escape and focus '+direction);
  }
  await navigate('components/input-group.html');await click('#input-group-select .ui-select-trigger');await key('End');await key('Enter');
  if(!await evaluate('document.getElementById("group-format").value==="TXT" && document.getElementById("group-format").closest(".ui-input-group").getBoundingClientRect().right<=innerWidth'))throw new Error('Input group native custom select');
  await navigate('components/button-group.html');await click('#button-group-radio label:nth-child(2)');await key('ArrowRight');
  if(!await evaluate('new FormData(document.querySelector("#button-group-radio form")).get("period")==="month" && document.activeElement.value==="month"'))throw new Error('Button group native radio keyboard/FormData');
  await click('#button-group-checkbox label:first-child');
  if(!await evaluate('document.querySelector("#button-group-checkbox input").checked'))throw new Error('Button group native checkbox');
  await navigate('components/list-group.html');await click('#list-group-flush label:nth-child(2)');
  if(!await evaluate('document.querySelector("#list-group-flush input[name=reports]").checked'))throw new Error('List group native label click');
  for(const width of [320,768,1440]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});await navigate('components/input-group.html');
    const stacks=await evaluate(`(()=>{const group=document.querySelector('.ui-input-group-stack'),input=group.querySelector('input'),r=group.getBoundingClientRect(),i=input.getBoundingClientRect();return i.width>50 && i.left>=r.left-1 && i.right<=r.right+1 && (innerWidth>=768 || Math.abs(i.width-r.width)<2);})()`);
    if(!stacks)throw new Error('Responsive stacked input group width '+width);
  }
  console.log('Added components: dropdown pointer/Arrow/Home/End/Tab/Enter/outside click at 3 widths × 10 modes/designs; rich popover/nested select; all 4 drawers × 3 widths × 10 modes/designs, scroll lock/Escape/focus return; input/button/list native values');

  // New device overrides must also work with JavaScript disabled.
  await send('Network.enable');await send('Network.setBlockedURLs',{urls:['*assets/ui/js/*','*assets/js/*']});
  for(const width of [320,375,767,768,820,1023,1024,1440]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    await send('Page.navigate',{url:pathToFileURL(join(site,'components/layouts.html')).href});
    for(let i=0;i<100;i++){await delay(20);if(await evaluate('document.readyState==="complete" && !!document.getElementById("device-grid-demo")'))break;}
    for(const theme of ['light','dark']) {
      await evaluate('document.documentElement.dataset.bsTheme='+JSON.stringify(theme));
      const expected=width<768?{cols:1,gap:8,font:16,padding:12}:width<1024?{cols:2,gap:12,font:18,padding:16}:{cols:3,gap:16,font:24,padding:24};
      const result=await evaluate(`(()=>{
        const grid=document.getElementById('device-grid-demo'),cells=[...grid.children].map(el=>el.getBoundingClientRect());
        const expected=${JSON.stringify(expected)},demo=document.getElementById('device-utilities-demo');
        const link=demo.querySelector('a'),row=demo.querySelector('.fx');
        return {cssOnly:typeof KavUI==='undefined',columns:cells.slice(0,expected.cols).every(r=>Math.abs(r.top-cells[0].top)<1) && (expected.cols===3 || cells[expected.cols].top>cells[0].top),gap:parseFloat(getComputedStyle(grid).columnGap)===expected.gap,typography:parseFloat(getComputedStyle(demo.querySelector('h3')).fontSize)===expected.font,spacing:parseFloat(getComputedStyle(demo).paddingLeft)===expected.padding,phone:${width}<768?getComputedStyle(row).flexDirection==='column' && Math.abs(link.getBoundingClientRect().width-row.getBoundingClientRect().width)<2:getComputedStyle(row).flexDirection==='row',overflow:document.documentElement.scrollWidth<=innerWidth+1};
      })()`);
      if(Object.values(result).some(value=>!value))throw new Error('Device defaults/overrides '+[width,theme]+JSON.stringify(result));
    }
  }
  await send('Network.setBlockedURLs',{urls:[]});
  await navigate('components/dialog.html');
  await evaluate(`(()=>{const wrapper=document.createElement('div');wrapper.id='wide-table-test';wrapper.className='ui-table-scroll';wrapper.tabIndex=0;wrapper.setAttribute('role','region');wrapper.setAttribute('aria-label','横長の一覧');wrapper.innerHTML='<table class="table" style="min-width:1200px"><tr><th>プロジェクト</th><th>担当者</th><th>更新日時</th></tr><tr><td>Design catalog</td><td>チーム</td><td>2026-10-22</td></tr></table>';document.querySelector('main').prepend(wrapper);wrapper.focus();})()`);
  await send('Emulation.setDeviceMetricsOverride',{width:375,height:1000,deviceScaleFactor:1,mobile:false});
  await key('ArrowRight');await delay(200);
  if(!await evaluate('document.getElementById("wide-table-test").scrollLeft>0 && document.documentElement.scrollWidth<=innerWidth+1'))throw new Error('Wide table must scroll by keyboard inside its region');
  console.log('Device responsiveness: PC/tablet/mobile CSS-only grid/gap/type/padding/stack/full-width across 8 widths × light/dark, 767/768 and 1023/1024 boundaries, keyboard horizontal table scrolling');

  const headerPages=['index.html','ai-agents.html','installation.html','getting-started.html','templates.html',...readdirSync(join(site,'components')).filter(name=>name.endsWith('.html')).map(name=>'components/'+name)];
  for(const width of [320,1440]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    for(const path of headerPages) {
      await navigate(path);
      for(const mode of ['light','dark']) {
        await evaluate('KavUI.setColorTheme('+JSON.stringify(mode)+')');
        const expected=mode==='light'?'mdi-weather-night':'mdi-weather-sunny';
        if(!await evaluate(`(()=>{const button=document.querySelector('.catalog-header [data-ui-theme-icon]');const svg=button?.querySelector('svg');return button?.getAttribute('icon')===${JSON.stringify(expected)} && !button.textContent && button.title===button.getAttribute('aria-label') && !!button.title && svg?.getBoundingClientRect().width===18 && svg.querySelector('path').getBBox().width>0 && button.getBoundingClientRect().right<=innerWidth+1 && document.documentElement.scrollWidth<=innerWidth+1;})()`))throw new Error('Catalog header theme icon '+[path,width,mode]);
      }
      if(!await evaluate(`(async()=>{
        scrollTo({top:600,left:0,behavior:"instant"});await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
        const header=document.querySelector('.catalog-header'),box=header.getBoundingClientRect();
        const sidebar=document.querySelector('.catalog-sidebar'),rail=document.querySelector('.catalog-toc-rail');
        return getComputedStyle(header).position==='sticky' && Math.abs(box.top)<1 && header.contains(document.elementFromPoint(box.width/2,8)) && (innerWidth<768 || (sidebar.getBoundingClientRect().top>=box.bottom-1 && sidebar.getBoundingClientRect().bottom<=innerHeight+1)) && (!rail || innerWidth<1280 || rail.getBoundingClientRect().top>=box.bottom-1);
      })()`))throw new Error('Catalog sticky header/sidebar bounds '+[path,width]);
    }
  }
  await navigate('index.html');await evaluate('KavUI.setColorTheme("light")');
  await click('.catalog-header [data-ui-theme-icon] path');
  if(!await evaluate('document.documentElement.dataset.bsTheme==="dark" && document.querySelector(".catalog-header [data-ui-theme-icon]").getAttribute("aria-label")==="ライトに切替"'))throw new Error('Theme icon native SVG click');
  await key('Enter');
  if(!await evaluate('document.documentElement.dataset.bsTheme==="light" && document.querySelector(".catalog-header [data-ui-theme-icon]").getAttribute("aria-label")==="ダークに切替"'))throw new Error('Theme icon native Enter');
  await send('Page.reload');await delay(100);
  if(!await evaluate('document.documentElement.dataset.bsTheme==="light" && document.querySelector(".catalog-header [data-ui-theme-icon]").getAttribute("icon")==="mdi-weather-night"'))throw new Error('Theme icon reload persistence');
  console.log('Catalog theme icons: all '+headerPages.length+' headers × 2 widths × light/dark, icon-only rendering, labels/title, SVG click, keyboard Enter and reload persistence');

  await navigate('components/typography.html');
  for(const width of [320,768,1440])for(const mode of ['light','dark'])for(const design of ['default','glass','glassmorphism']) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    await evaluate('KavUI.setColorTheme('+JSON.stringify(mode)+');KavUI.setDesignTheme('+JSON.stringify(design)+');scrollTo({top:1200,left:0,behavior:"instant"})');await delay(35);
    // Font/layout completion can extend this page after the first scroll is clamped.
    await evaluate('scrollTo({top:1200,left:0,behavior:"instant"})');
    const point=await evaluate(`(()=>{const button=document.querySelector('.catalog-header [data-ui-theme-icon]'),box=button.getBoundingClientRect();return {x:box.x+box.width/2,y:box.y+box.height/2};})()`);
    await send('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',clickCount:1});
    await send('Input.dispatchMouseEvent',{type:'mouseReleased',...point,button:'left',clickCount:1});
    if(!await evaluate('document.documentElement.dataset.bsTheme!=='+JSON.stringify(mode)+' && scrollY>500 && Math.abs(document.querySelector(".catalog-header").getBoundingClientRect().top)<1'))throw new Error('Sticky header native click while scrolled '+[width,mode,design]);
  }
  console.log('Sticky catalog header: all pages at 2 widths, unobscured sidebars, native control clicks while scrolled across 3 widths × light/dark × default/glass/glassmorphism');

  const dropTextPath=join(profile,'drop-example.txt'),dropPDFPath=join(profile,'drop-example.pdf');
  writeFileSync(dropTextPath,'file drop example');writeFileSync(dropPDFPath,'%PDF-1.7\nexample');
  await send('Page.setInterceptFileChooserDialog',{enabled:true});
  for(const width of [320,1440]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    await navigate('components/forms.html');
    for(const mode of ['light','dark']) {
      await evaluate('document.documentElement.dataset.bsTheme='+JSON.stringify(mode)+';document.body.dataset.uiTheme="glassmorphism"');
      const point=await evaluate(`(async()=>{const zone=document.querySelector('#file-drop [data-ui-file-zone]');zone.scrollIntoView({behavior:"instant",block:'center'});await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));const rect=zone.getBoundingClientRect();return {x:rect.x+rect.width/2,y:rect.y+rect.height/2};})()`);
      const data={items:[],files:[dropTextPath,dropPDFPath],dragOperationsMask:1};
      for(const type of ['dragEnter','dragOver','drop'])await send('Input.dispatchDragEvent',{type,...point,data});
      if(!await evaluate('document.getElementById("drop-documents").files.length===2 && document.querySelectorAll("#file-drop .ui-file-list li").length===2 && new FormData(document.querySelector("#file-drop form")).getAll("documents").length===2 && !document.querySelector("#file-drop [data-ui-file-dragging]") && document.documentElement.scrollWidth<=innerWidth+1'))throw new Error('Native file drop/FormData/bounds '+[width,mode]);
      await click('#file-drop .ui-file-list button');
      if(!await evaluate('document.getElementById("drop-documents").files.length===1 && document.activeElement.id==="drop-documents"'))throw new Error('Native file removal and focus');
      await click('#file-drop button[type=reset]');await delay(20);
      if(!await evaluate('!document.getElementById("drop-documents").files.length && document.querySelector("#file-drop .ui-file-list").hidden'))throw new Error('Native file form reset');
    }
    let beforeChooser=fileChooserEvents;
    await click('#file-drop [data-ui-file-zone]');await delay(30);
    if(fileChooserEvents!==beforeChooser+1)throw new Error('Click label must open native file chooser');
    const {root:dom}=await send('DOM.getDocument');const {nodeId}=await send('DOM.querySelector',{nodeId:dom.nodeId,selector:'#drop-documents'});
    await send('DOM.setFileInputFiles',{nodeId,files:[dropTextPath]});
    if(!await evaluate('document.getElementById("drop-documents").files[0].name==="drop-example.txt" && document.querySelectorAll("#file-drop .ui-file-list li").length===1'))throw new Error('Native file chooser selection');
    beforeChooser=fileChooserEvents;
    await evaluate('(()=>{const input=document.getElementById("drop-documents");const before=document.createElement("button");before.id="file-tab-start";input.before(before);before.focus();})()');
    await key('Tab');
    if(!await evaluate('document.activeElement.id==="drop-documents" && getComputedStyle(document.querySelector("#file-drop [data-ui-file-zone]")).outlineStyle==="solid"'))throw new Error('File input keyboard tab order and focus ring');
    await evaluate('document.getElementById("file-tab-start").remove()');await key('Enter');await delay(30);
    if(fileChooserEvents!==beforeChooser+1)throw new Error('Keyboard file chooser activation');
    await send('DOM.setFileInputFiles',{nodeId,files:[]});
  }
  await send('Page.setInterceptFileChooserDialog',{enabled:false});
  console.log('File drop: native OS file drag, click/keyboard chooser, FileList/FormData, removal/focus/reset and responsive bounds @320/1440 light/dark glassmorphism');

  // Typography must work using shared CSS, even when all UI scripts are blocked.
  await send('Network.setBlockedURLs',{urls:['*assets/ui/js/*','*assets/js/*']});
  for(const width of [320,768,1440]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    await send('Page.navigate',{url:pathToFileURL(join(site,'components/typography.html')).href});
    for(let i=0;i<100;i++){await delay(20);if(await evaluate('document.readyState==="complete" && !!document.getElementById("type-combine")'))break;}
    for(const theme of ['light','dark']) {
      await evaluate('document.documentElement.dataset.bsTheme='+JSON.stringify(theme));
      const result=await evaluate(`(()=>{
        const heading=document.querySelector('#type-combine h3'), body=document.querySelector('#type-combine .type-body'), alert=document.querySelector('#type-combine .type-caption');
        const h=getComputedStyle(heading),b=getComputedStyle(body),a=getComputedStyle(alert);
        const clamped=document.querySelector('.type-clamp-2');
        const truncate=document.querySelector('.type-truncate');
        const reference=document.createElement('span');reference.style.color='var(--bs-danger-text-emphasis)';document.body.append(reference);
        const color=getComputedStyle(reference).color;reference.remove();
        const defaults=document.querySelector('[data-typography-defaults]');
        const defaultH1=getComputedStyle(defaults.querySelector('h1')), defaultH2=getComputedStyle(defaults.querySelector('h2'));
        return {defaults:defaultH1.fontSize==='24px' && defaultH1.fontWeight==='600' && defaultH2.fontSize==='18px' && getComputedStyle(defaults.querySelector('p')).fontSize==='14px' && getComputedStyle(defaults.querySelector('blockquote')).borderInlineStartWidth==='2px',cssOnly:typeof KavUI==='undefined',heading:h.fontSize==='24px' && h.fontWeight==='700',body:b.fontSize==='16px' && Math.abs(parseFloat(b.lineHeight)-28.8)<.1,alert:a.color===color && a.fontWeight==='600',clamp:clamped.scrollHeight>clamped.clientHeight && Math.abs(clamped.clientHeight-parseFloat(getComputedStyle(clamped).lineHeight)*2)<2,truncate:truncate.scrollWidth>truncate.clientWidth && getComputedStyle(truncate).textOverflow==='ellipsis',overflow:document.documentElement.scrollWidth<=innerWidth+1};
      })()`);
      if(Object.values(result).some(value=>!value))throw new Error('Typography CSS-only combinations '+[width,theme]+' '+JSON.stringify(result));
    }
  }
  await send('Network.setBlockedURLs',{urls:[]});
  console.log('Typography: CSS-only classless HTML defaults and combined roles/size/weight/semantic color, line-height, truncation and 2-line clamp at 3 widths × light/dark');

  // Splitter uses native capture, touch and keyboard; no framework is required.
  async function splitterDragHandle(selector,dx,dy=0,cancel=false) {
    const box=await evaluate(`(async()=>{const el=document.querySelector(${JSON.stringify(selector)});el.addEventListener('pointerdown',e=>{window.__splitterTestPointer=e.pointerId;},{once:true});el.scrollIntoView({behavior:"instant",block:'center'});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const rect=el.getBoundingClientRect();return {x:rect.x+rect.width/2,y:rect.y+rect.height/2};})()`);
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',...box});
    await send('Input.dispatchMouseEvent',{type:'mousePressed',...box,button:'left',clickCount:1});
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:box.x+dx,y:box.y+dy,button:'left',buttons:1});
    if(cancel===true)await key('Escape');
    if(cancel==='capture')await evaluate('document.querySelector('+JSON.stringify(selector)+').releasePointerCapture(window.__splitterTestPointer)');
    if(cancel==='pointercancel')await evaluate('document.querySelector('+JSON.stringify(selector)+').dispatchEvent(new PointerEvent("pointercancel",{pointerId:window.__splitterTestPointer,bubbles:true}))');
    await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:box.x+dx,y:box.y+dy,button:'left',clickCount:1});
  }
  for(const width of [320,768,1440]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});await navigate('components/splitter.html');
    for(const mode of ['light','dark'])for(const design of ['default','glass','glassmorphism','flat','soft']) {
      await evaluate(`KavUI.setColorTheme(${JSON.stringify(mode)});KavUI.setDesignTheme(${JSON.stringify(design)})`);
      if(!await evaluate('document.documentElement.scrollWidth<=innerWidth+1 && [...document.querySelectorAll("[data-ui-splitter]")].every(root=>{const sizes=KavUI.splitter(root),r=root.getBoundingClientRect();return Array.isArray(sizes) && Math.abs(sizes.reduce((a,b)=>a+b,0)-100)<.001 && r.left>=0 && r.right<=innerWidth+1;})'))throw new Error('Splitter responsive/theme '+[width,mode,design]);
    }
    await evaluate('KavUI.setDesignTheme("glassmorphism");KavUI.setColorTheme("light");KavUI.splitter("#splitter-basic",{reset:true})');
    await splitterDragHandle('#splitter-basic > [role=separator]',30);
    if(!await evaluate('KavUI.splitter("#splitter-basic")[0]>30 && !document.documentElement.hasAttribute("data-ui-splitter-resizing")'))throw new Error('Splitter native pointer drag/capture cleanup');
    await click('[data-ui-splitter-reset="#splitter-basic"]');
    if(!await evaluate('KavUI.splitter("#splitter-basic")[0]===30'))throw new Error('Splitter reset button');
    await splitterDragHandle('#splitter-basic > [role=separator]',35,0,true);
    if(!await evaluate('KavUI.splitter("#splitter-basic")[0]===30 && !document.documentElement.hasAttribute("data-ui-splitter-resizing")'))throw new Error('Splitter Escape cancels drag');
    for(const cancel of ['capture','pointercancel']) {await splitterDragHandle('#splitter-basic > [role=separator]',25,0,cancel);if(!await evaluate('KavUI.splitter("#splitter-basic")[0]===30 && !document.documentElement.hasAttribute("data-ui-splitter-resizing")'))throw new Error('Splitter pointer cancellation '+cancel);}
    await evaluate('document.getElementById("splitter-basic").dir="rtl"');await splitterDragHandle('#splitter-basic > [role=separator]',-20);
    if(!await evaluate('KavUI.splitter("#splitter-basic")[0]>30'))throw new Error('Splitter RTL pointer direction');
    await evaluate('document.getElementById("splitter-basic").removeAttribute("dir");KavUI.splitter("#splitter-basic",{reset:true})');
    await splitterDragHandle('#splitter-vertical-demo > [role=separator]',0,25);
    if(!await evaluate('KavUI.splitter("#splitter-vertical-demo")[0]>35 && KavUI.splitter("#splitter-vertical-demo")[2]===30'))throw new Error('Splitter vertical adjacent-only drag');
    await evaluate('document.querySelector("#splitter-basic > [role=separator]").focus()');await key('End');
    if(!await evaluate('KavUI.splitter("#splitter-basic")[0]===60'))throw new Error('Splitter native keyboard max');await key('Home');
    if(!await evaluate('KavUI.splitter("#splitter-basic")[0]===15'))throw new Error('Splitter native keyboard min');
    await evaluate('document.querySelector("#splitter-collapse-demo > [role=separator]").focus()');await key('Enter');
    if(!await evaluate('KavUI.splitter("#splitter-collapse-demo")[0]===0 && document.querySelector("#splitter-collapse-demo > [data-ui-splitter-panel]").inert'))throw new Error('Splitter native collapse');
    await key('Enter');if(!await evaluate('KavUI.splitter("#splitter-collapse-demo")[0]===30'))throw new Error('Splitter restore previous size');
    const nested=await evaluate('KavUI.splitter("#splitter-nested-demo > [data-ui-splitter-panel] > [data-ui-splitter]")');
    await splitterDragHandle('#splitter-nested-demo > [role=separator]',width<768?0:20,width<768?20:0);
    if(JSON.stringify(nested)!==JSON.stringify(await evaluate('KavUI.splitter("#splitter-nested-demo > [data-ui-splitter-panel] > [data-ui-splitter]")')))throw new Error('Splitter nested independence');
    await evaluate('KavUI.splitter("#splitter-saved-demo",{sizes:[55,45]})');await send('Page.reload');await delay(150);
    if(!await evaluate('Math.abs(KavUI.splitter("#splitter-saved-demo")[0]-55)<.001'))throw new Error('Splitter saved sizes reload');
    await click('[data-ui-splitter-reset="#splitter-saved-demo"]');
    for(const id of ['splitter-horizontal','splitter-nested']) {
      await evaluate('document.getElementById('+JSON.stringify(id)+').scrollIntoView({behavior:"instant"})');await delay(50);
      const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});writeFileSync(join(artifacts,id+'-'+width+'.png'),Buffer.from(shot.data,'base64'));
    }
  }
  for(const width of [767,768,390,1440]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});await delay(50);
    if(!await evaluate('getComputedStyle(document.getElementById("splitter-nested-demo")).flexDirection===(innerWidth<768?"column":"row") && document.querySelector("#splitter-nested-demo > [role=separator]").getAttribute("aria-orientation")===(innerWidth<768?"horizontal":"vertical")'))throw new Error('Splitter live mobile orientation/ARIA '+width);
  }
  await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});await send('Emulation.setDeviceMetricsOverride',{width:390,height:900,deviceScaleFactor:1,mobile:true});await navigate('components/splitter.html');
  const touch=await evaluate(`(async()=>{const el=document.querySelector('#splitter-basic > [role=separator]');el.scrollIntoView({behavior:"instant",block:'center'});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const b=el.getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2};})()`);
  await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...touch,id:1}]});await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:touch.x+35,y:touch.y,id:1}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  if(!await evaluate('KavUI.splitter("#splitter-basic")[0]>30 && !document.documentElement.hasAttribute("data-ui-splitter-resizing")'))throw new Error('Splitter native touch');
  await send('Emulation.setTouchEmulationEnabled',{enabled:false});await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await navigate('components/splitter.html');
  const removed=await evaluate(`(async()=>{const root=document.getElementById('splitter-basic'),handle=root.querySelector('[role=separator]');root.addEventListener('ui:splitterend',e=>{window.__splitterRemovedCancelled=e.detail.cancelled;});handle.scrollIntoView({behavior:"instant",block:'center'});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const b=handle.getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2};})()`);
  await send('Input.dispatchMouseEvent',{type:'mousePressed',...removed,button:'left',clickCount:1});await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:removed.x+20,y:removed.y,buttons:1});await evaluate('document.getElementById("splitter-basic").remove()');await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:removed.x+20,y:removed.y,button:'left',clickCount:1});
  if(!await evaluate('window.__splitterRemovedCancelled===true && !document.documentElement.hasAttribute("data-ui-splitter-resizing")'))throw new Error('Splitter removal must release drag state');
  await send('Network.setBlockedURLs',{urls:['*assets/ui/js/ui.js','*assets/js/catalog-demo.js']});await firstPaintPage('components/splitter.html');
  if(!await evaluate('!document.querySelector("[role=separator]") && [...document.querySelectorAll("#splitter-basic > [data-ui-splitter-panel]")].every(p=>p.getBoundingClientRect().width>0) && document.documentElement.scrollWidth<=innerWidth+1'))throw new Error('Splitter no-JS equal panels');
  await send('Network.setBlockedURLs',{urls:[]});
  const splitterBlockedStorage=await send('Page.addScriptToEvaluateOnNewDocument',{source:"Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Storage unavailable','SecurityError');}});"});
  await navigate('components/splitter.html');if(!await evaluate('KavUI.splitter("#splitter-saved-demo",{sizes:[50,50]})[0]===50'))throw new Error('Splitter blocked storage');
  await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:splitterBlockedStorage.identifier});
  await navigate('index.html');await evaluate('KavUI.setDesignTheme("default",{persist:true});KavUI.setColorTheme("light",{persist:true})');
  console.log('Splitter: 3 widths × 10 themes/modes; native horizontal/vertical pointer capture, Escape rollback, nested independence, keyboard bounds/collapse/restore, reset and persistence/reload, native touch, no-JS and blocked storage');

  // Optional glass wallpaper: CSS-only core plus local catalog preview controls.
  for(const width of [320,768,1440]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});await navigate('components/themes.html');
    if(!await evaluate('!getComputedStyle(document.body).backgroundImage.includes("url(")'))throw new Error('Background must be optional');
    await click('[data-demo-background-action=sample]');
    const loaded=await evaluate(`(async()=>{const source=getComputedStyle(document.body).backgroundImage.match(/url[(]["]([^"]+)["][)]/)?.[1];if(source!==new URL('../assets/images/theme-background.svg',location.href).href)throw new Error('Actual wallpaper URL: '+source);const image=new Image();image.src=source;await image.decode();return image.naturalWidth>0 && document.body.dataset.uiTheme==='glassmorphism';})()`);
    if(!loaded)throw new Error('Background sample/loading');
    for(const mode of ['light','dark'])for(const design of ['glass','glassmorphism']) {
      await evaluate(`KavUI.setColorTheme(${JSON.stringify(mode)});KavUI.setDesignTheme(${JSON.stringify(design)});document.getElementById('theme-background').scrollIntoView({behavior:"instant"})`);await delay(60);
      if(!await evaluate('getComputedStyle(document.body).backgroundImage.includes("theme-background.svg") && getComputedStyle(document.body).backgroundAttachment.split(",").every(v=>v.trim()==="fixed") && document.documentElement.scrollWidth<=innerWidth+1'))throw new Error('Wallpaper bounds/fixed '+[width,mode,design]);
      const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});writeFileSync(join(artifacts,'background-'+width+'-'+mode+'-'+design+'.png'),Buffer.from(shot.data,'base64'));
      const normal=await evaluate('getComputedStyle(document.body).backgroundImage');
      await evaluate('scrollTo({top:document.documentElement.scrollHeight,left:0,behavior:"instant"})');await delay(40);
      if(!await evaluate('getComputedStyle(document.body).backgroundImage==='+JSON.stringify(normal)+' && document.elementFromPoint(innerWidth/2,innerHeight-10)!==null'))throw new Error('Wallpaper at bottom of long page');
    }
    for(const design of ['default','flat','soft']) {await evaluate('KavUI.setDesignTheme('+JSON.stringify(design)+')');if(!await evaluate('!getComputedStyle(document.body).backgroundImage.includes("theme-background.svg")'))throw new Error('Wallpaper must be glass-only');}
    await evaluate('KavUI.setDesignTheme("glass")');
    const changes=await evaluate(`(()=>{const range=document.querySelector('[data-demo-theme-background] [type=range]');const colors=[0,18,100].map(value=>{range.value=value;range.dispatchEvent(new Event('input',{bubbles:true}));return getComputedStyle(document.body).backgroundImage;});return new Set(colors).size===3 && document.querySelector('[data-demo-theme-background] output').value==='100%';})()`);
    if(!changes)throw new Error('Wallpaper opacity controls');
    await evaluate('(()=>{const range=document.querySelector("[data-demo-theme-background] [type=range]");range.value=18;range.dispatchEvent(new Event("input",{bubbles:true}));})()');
    // Decode an actual local image selected through the browser file-input API.
    const {root:dom}=await send('DOM.getDocument');const {nodeId}=await send('DOM.querySelector',{nodeId:dom.nodeId,selector:'[data-demo-theme-background] input[type=file]'});
    await send('DOM.setFileInputFiles',{nodeId,files:[join(site,'assets/images/theme-background.svg')]});await delay(100);
    if(!await evaluate('document.body.style.getPropertyValue("--ui-theme-background-image").includes("blob:") && document.querySelector("[data-demo-background-status]").textContent.includes("このページ内のみ")'))throw new Error('Local image preview');
    await click('[data-demo-theme-background] .ui-file-list button');
    if(!await evaluate('!getComputedStyle(document.body).backgroundImage.includes("url(")'))throw new Error('Removing selected file clears wallpaper');
    await evaluate(`(()=>{const data=new DataTransfer();data.items.add(new File(['<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"><path fill="gray" d="M0 0h2v2H0z"/></svg>'],'dropped.svg',{type:'image/svg+xml'}));document.querySelector('[data-demo-theme-background] [data-ui-file-zone]').dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:data}));})()`);await delay(60);
    if(!await evaluate('getComputedStyle(document.body).backgroundImage.includes("blob:") && document.querySelector("[data-demo-background-status]").textContent.includes("dropped.svg")'))throw new Error('Dropped image updates wallpaper');
    await evaluate(`(()=>{const input=document.querySelector('[data-demo-theme-background] input[type=file]'),data=new DataTransfer();data.items.add(new File(['not an image'],'invalid.png',{type:'image/png'}));input.files=data.files;input.dispatchEvent(new Event('change',{bubbles:true}));})()`);await delay(60);
    if(!await evaluate('document.querySelector("[data-demo-background-status]").textContent.includes("読み込めません") && getComputedStyle(document.body).backgroundImage.includes("blob:")'))throw new Error('Invalid image keeps last working background');
    await click('[data-demo-background-action=clear]');
    if(!await evaluate('!getComputedStyle(document.body).backgroundImage.includes("url(") && !document.querySelector("[data-demo-theme-background] input[type=file]").value'))throw new Error('Wallpaper clear/reset');
    await click('[data-demo-background-action=sample]');await send('Page.reload');await delay(150);
    if(!await evaluate('!getComputedStyle(document.body).backgroundImage.includes("url(")'))throw new Error('Catalog image preview must not persist');
  }
  await evaluate('KavUI.setDesignTheme("glassmorphism");document.body.style.setProperty("--ui-theme-background-image",\'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22/%3E")\')');
  await send('Emulation.setEmulatedMedia',{features:[{name:'forced-colors',value:'active'}]});
  if(!await evaluate('getComputedStyle(document.body).backgroundImage==="none"'))throw new Error('Wallpaper hidden in forced colors');
  await send('Emulation.setEmulatedMedia',{features:[]});
  // A static application can configure an image without loading ui.js.
  await send('Network.setBlockedURLs',{urls:['*assets/ui/js/ui.js','*assets/js/catalog-demo.js']});
  const wallpaperSeed=await send('Page.addScriptToEvaluateOnNewDocument',{source:`const observer=new MutationObserver(()=>{if(document.body){document.body.dataset.uiTheme='glass';document.body.style.setProperty('--ui-theme-background-image','url("'+new URL('../assets/images/theme-background.svg',location.href).href+'")');observer.disconnect();}});observer.observe(document,{childList:true,subtree:true});`});
  await firstPaintPage('components/dialog.html');
  if(!await evaluate('typeof KavUI==="undefined" && getComputedStyle(document.body).backgroundImage.includes("theme-background.svg")'))throw new Error('Wallpaper CSS-only application');
  await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:wallpaperSeed.identifier});await send('Network.setBlockedURLs',{urls:[]});
  await navigate('components/themes.html');await evaluate('KavUI.setDesignTheme("default",{persist:true});KavUI.setColorTheme("light",{persist:true})');
  console.log('Glass wallpaper: optional/clear, 3 widths × 2 modes × 2 designs, fixed background at page bottom, opacity, local file decode/failure, no preview persistence, forced colors and CSS-only application');

  // Catalog examples must exercise widgets without navigating away.
  for(const width of [390,1440]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    await navigate('components/navigation.html');
    const catalogURL=await evaluate('location.href');
    await click('#nav-navbar .navbar-brand');await delay(80);
    if(await evaluate('location.href')!==catalogURL)throw new Error('Sample brand link navigated away');
    if(width<1024)await click('#nav-navbar [data-ui-navbar-toggle]');
    await click('#nav-navbar .nav-link[href="#nav-navbar"]');await delay(80);
    if(await evaluate('location.href')!==catalogURL)throw new Error('Sample hash link changed the URL');
    if(width<1024&&!await evaluate('document.querySelector("#nav-navbar [data-ui-navbar-panel]").hidden'))throw new Error('Sample link must still close navbar');
    await click('#nav-links .nav-pills a[href="buttons.html"]');
    if(!await evaluate(`document.querySelector('#nav-links .nav-pills a[href="buttons.html"]').getAttribute('aria-current')==='page'&&document.querySelector('#nav-links .nav-pills').querySelectorAll('[aria-current]').length===1&&location.href===${JSON.stringify(catalogURL)}`))throw new Error('Sample nav current item');
    await evaluate(`document.querySelector('#nav-links .nav-pills a[href="forms.html"]').focus({preventScroll:true})`);await key('Enter');
    if(!await evaluate(`document.querySelector('#nav-links .nav-pills a[href="forms.html"]').getAttribute('aria-current')==='page'&&location.href===${JSON.stringify(catalogURL)}`))throw new Error('Sample nav keyboard current item');

    await evaluate(`(()=>{const root=document.createElement('div');root.id='catalog-guard-fixture';root.dataset.example='';root.innerHTML='<a id="guard-blank" href="buttons.html" target="_blank"><svg viewBox="0 0 24 24"><path d="M0 0h24v24H0z"/></svg>Link</a><form id="guard-submit" action="../index.html"><label>Value<input name="value" value="demo"></label><button type="submit">Submit</button><button type="reset">Reset</button></form><form id="guard-outer" action="../index.html"></form><button id="guard-external-submit" type="submit" form="guard-outer">External submitter</button>';document.querySelector('main').append(root);root.after(root.querySelector('#guard-outer'));})()`);
    const canceled=await evaluate(`(()=>{const link=document.getElementById('guard-blank'),svg=link.querySelector('path');return [new MouseEvent('click',{bubbles:true,cancelable:true,ctrlKey:true}),new MouseEvent('click',{bubbles:true,cancelable:true,metaKey:true}),new MouseEvent('click',{bubbles:true,cancelable:true,shiftKey:true}),new MouseEvent('auxclick',{bubbles:true,cancelable:true,button:1})].every(event=>!svg.dispatchEvent(event)&&event.defaultPrevented)&&link.getAttribute('href')==='buttons.html';})()`);
    if(!canceled)throw new Error('Modified/middle sample links or SVG targets escaped the guard');
    await evaluate('document.getElementById("guard-blank").focus()');await key('Enter');await delay(70);
    if(await evaluate('location.href')!==catalogURL)throw new Error('Keyboard sample link navigated');
    await click('#guard-submit button[type=submit]');await delay(70);
    if(await evaluate('location.href')!==catalogURL)throw new Error('Sample form submitted');
    await evaluate('document.querySelector("#guard-submit input").focus()');await key('Enter');await delay(70);
    if(await evaluate('location.href')!==catalogURL)throw new Error('Sample implicit submit navigated');
    await evaluate('document.querySelector("#guard-submit input").value="changed"');await click('#guard-submit button[type=reset]');
    if(!await evaluate('document.querySelector("#guard-submit input").value==="demo"'))throw new Error('Sample reset must remain functional');
    await click('#guard-external-submit');await delay(70);
    if(await evaluate('location.href')!==catalogURL)throw new Error('Sample submitter navigated');
    await navigate('components/dropdown.html');const dropdownURL=await evaluate('location.href');
    await click('[data-ui-target="#dropdown-basic-menu"]');await click('#dropdown-basic-menu a');await delay(100);
    if(await evaluate('location.href')!==dropdownURL||!await evaluate('!document.getElementById("dropdown-basic-menu").matches(":popover-open")'))throw new Error('Sample dropdown link navigation/close');
    await navigate('components/dialog.html');const dialogURL=await evaluate('location.href');
    await click('[data-ui-target="#project-dialog"]');await click('#project-dialog button[type=submit]');
    if(!await evaluate('document.getElementById("project-dialog").open&&document.querySelector("#project-dialog input").getAttribute("aria-invalid")==="true"'))throw new Error('Sample dialog validation');
    await evaluate(`(()=>{document.querySelector('#project-dialog input').value='Demo';const b=document.createElement('button');b.type='submit';b.id='guard-dialog-get';b.setAttribute('formmethod','get');b.textContent='Send';document.querySelector('#project-dialog form').append(b);})()`);
    await click('#guard-dialog-get');await delay(70);
    if(await evaluate('location.href')!==dialogURL||!await evaluate('document.getElementById("project-dialog").open'))throw new Error('Submitter formmethod=get escaped the guard');
    await evaluate('document.getElementById("guard-dialog-get").remove()');
    await click('#project-dialog button[type=submit]');await delay(200);
    if(!await evaluate('!document.getElementById("project-dialog").open')||await evaluate('location.href')!==dialogURL)throw new Error('Sample method=dialog must still close');
    await navigate('components/forms.html');await evaluate('document.querySelector("[data-demo-form] input[name=project]").value="Demo"');await click('[data-demo-form] button[type=submit]');
    if(!await evaluate('document.querySelector("[data-demo-result]").textContent.includes("入力を確認")'))throw new Error('Sample validation demo result');
    await click('.catalog-header .brand');await delay(100);
    if(!await evaluate('location.pathname.endsWith("/index.html")'))throw new Error('Real catalog navigation was blocked');
  }
  const outside=await evaluate(`(()=>{const root=document.createElement('div');root.innerHTML='<a href="components/buttons.html" id="outside-catalog-link">Docs</a><form id="outside-catalog-form"></form>';document.body.append(root);const a=root.querySelector('a'),form=root.querySelector('form');let linkAllowed=false;const stop=event=>{linkAllowed=!event.defaultPrevented;event.preventDefault();};window.addEventListener('click',stop,{once:true});a.click();const event=new Event('submit',{bubbles:true,cancelable:true});return linkAllowed&&form.dispatchEvent(event)&&!event.defaultPrevented;})()`);
  if(!outside)throw new Error('Links/forms outside samples were blocked');
  console.log('Catalog samples: links/buttons, hashes, Enter, modifier/middle/SVG clicks and form submits stay local; menu close, validation, dialog confirm, reset and real docs navigation remain functional at 390/1440');

  // Expanded navigation: actual pointer/keyboard and responsive state changes.
  for(const width of [320,768,1440]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});await navigate('components/navigation.html');
    for(const mode of ['light','dark'])for(const design of ['default','glass','glassmorphism','flat','soft']) {
      await evaluate(`KavUI.setColorTheme(${JSON.stringify(mode)});KavUI.setDesignTheme(${JSON.stringify(design)})`);
      const state=await evaluate(`(()=>{const navs=[...document.querySelectorAll('[data-ui-navbar]')];return {overflow:document.documentElement.scrollWidth>innerWidth+1,navs:navs.map(nav=>({hidden:nav.querySelector('[data-ui-navbar-panel]').hidden,toggle:nav.querySelector('[data-ui-navbar-toggle]').hidden})),tabs:[...document.querySelectorAll('.tabs')].every(list=>list.getBoundingClientRect().right<=innerWidth+1)};})()`);
      if(state.overflow || !state.tabs || state.navs.some((nav,index)=>nav.hidden!==(width<(index?768:1024)) || nav.toggle!==(width>=(index?768:1024))))throw new Error('Navigation responsive bounds '+[width,mode,design]+JSON.stringify(state));
    }
    await evaluate('KavUI.setColorTheme("light");KavUI.setDesignTheme("glassmorphism")');
    if(width<1024) {
      await click('#nav-navbar [data-ui-navbar-toggle]');
      if(!await evaluate('!document.querySelector("#nav-navbar [data-ui-navbar-panel]").hidden'))throw new Error('Navbar native SVG button click');
      await click('#nav-navbar [data-ui-toggle=dropdown]');await key('Escape');
      if(!await evaluate('!document.querySelector("#navbar-resources").matches(":popover-open") && !document.querySelector("#nav-navbar [data-ui-navbar-panel]").hidden'))throw new Error('Dropdown Escape must preserve navbar');
      await key('Escape');
      if(!await evaluate('document.querySelector("#nav-navbar [data-ui-navbar-panel]").hidden && document.activeElement.matches("[data-ui-navbar-toggle]")'))throw new Error('Navbar Escape/focus return');
      await key('Enter');await click('#nav-navbar .nav-link[href="#nav-navbar"]');
      if(!await evaluate('document.querySelector("#nav-navbar [data-ui-navbar-panel]").hidden'))throw new Error('Navbar native link closes menu');
    }
    await evaluate('document.querySelector("#nav-tabs-vertical [role=tab]").focus()');await key('ArrowDown');
    if(!await evaluate('document.activeElement.dataset.uiTarget==="notifications" && !document.querySelector("#nav-tabs-vertical [data-ui-panel=profile]").hidden'))throw new Error('Manual vertical tab focus only');
    await key('Enter');
    if(!await evaluate('!document.querySelector("#nav-tabs-vertical [data-ui-panel=notifications]").hidden'))throw new Error('Manual vertical tab Enter commit');
    await key('End');await key(' ');
    if(!await evaluate('!document.querySelector("#nav-tabs-vertical [data-ui-panel=appearance]").hidden'))throw new Error('Manual vertical tab Space/End');
    await key('Home');
    if(!await evaluate('document.activeElement.dataset.uiTarget==="profile" && !document.querySelector("#nav-tabs-vertical [data-ui-panel=appearance]").hidden'))throw new Error('Manual vertical tab Home focus only');
    await evaluate('document.getElementById("nav-navbar").scrollIntoView({behavior:"instant"})');await delay(100);
    const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});writeFileSync(join(artifacts,'navigation-expanded-'+width+'.png'),Buffer.from(shot.data,'base64'));
    for(const id of ['nav-tabs-vertical','nav-steps']) {
      await evaluate('document.getElementById('+JSON.stringify(id)+').scrollIntoView({behavior:"instant"})');await delay(60);
      const detail=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});writeFileSync(join(artifacts,id+'-'+width+'.png'),Buffer.from(detail.data,'base64'));
    }
  }
  for(const width of [767,768,1023,1024,320]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});await delay(60);
    if(!await evaluate('[...document.querySelectorAll("[data-ui-navbar]")].every((nav,index)=>nav.querySelector("[data-ui-navbar-panel]").hidden===(innerWidth<(index?768:1024)))'))throw new Error('Navbar live resize '+width);
  }
  await click('#nav-navbar [data-ui-navbar-toggle]');await evaluate('document.querySelector("#nav-navbar .nav-link").focus()');
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});await delay(60);
  if(!await evaluate('!document.querySelector("#nav-navbar [data-ui-navbar-panel]").hidden && !document.activeElement.closest("[hidden]")'))throw new Error('Navbar desktop focus/expansion');
  await send('Emulation.setDeviceMetricsOverride',{width:320,height:1000,deviceScaleFactor:1,mobile:false});await delay(60);
  if(!await evaluate('document.activeElement.matches("[data-ui-navbar-toggle]") && document.querySelector("#nav-navbar [data-ui-navbar-panel]").hidden'))throw new Error('Navbar shrinking focus return');
  // CSS-only navigation keeps links available and its toggle hidden without scripts.
  await send('Network.setBlockedURLs',{urls:['*assets/ui/js/ui.js','*assets/js/catalog-demo.js']});await firstPaintPage('components/navigation.html');
  if(!await evaluate('[...document.querySelectorAll("[data-ui-navbar-panel]")].every(panel=>getComputedStyle(panel).display!=="none") && [...document.querySelectorAll("[data-ui-navbar-toggle]")].every(button=>getComputedStyle(button).display==="none")'))throw new Error('Navbar no-JS fallback');
  await send('Network.setBlockedURLs',{urls:[]});
  console.log('Expanded navigation: 3 widths × 10 themes/modes, native navbar/dropdown/Escape/link/focus, manual vertical tabs Enter/Space/Home/End, live 768/1024 breakpoints and no-JS link fallback');

  // User-defined Material palettes: real controls, reuse, persistence and pre-paint.
  for(const width of [320,768,1440]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    await navigate('components/color-palettes.html');
    await evaluate('KavUI.setColorTheme("light",{persist:true});KavUI.setDesignTheme("glass",{persist:true})');
    await click('#custom-palette-seed + .ui-input-picker-trigger');
    await evaluate(`(()=>{const input=document.querySelector('.ui-input-popup:popover-open [data-ui-picker-part=hex]');input.value='#52796f';input.dispatchEvent(new Event('input',{bubbles:true}));})()`);
    await click('.ui-input-popup:popover-open [data-ui-picker-apply]');
    await evaluate('document.getElementById("custom-palette-chroma").focus()');await key('ArrowLeft');
    if(!await evaluate('document.querySelector("[data-ui-palette-chroma-output]").textContent==="23" && document.documentElement.dataset.uiPalette==="default"'))throw new Error('Custom palette draft must not change applied colors');
    await click('[data-ui-palette-editor] [type=submit]');
    if(!await evaluate('KavUI.getCustomPalette().seed==="#52796f" && KavUI.getCustomPalette().chroma===23 && document.documentElement.dataset.uiPalette==="custom" && document.querySelector("[data-ui-palette-status]").textContent.includes("適用しました") && document.documentElement.scrollWidth<=innerWidth+1'))throw new Error('Custom palette real form '+width);
    await evaluate('document.getElementById("palette-custom").scrollIntoView({behavior:"instant",block:"start"})');await delay(180);
    const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});writeFileSync(join(artifacts,'custom-palette-'+width+'.png'),Buffer.from(shot.data,'base64'));
    await click('[data-ui-palette-editor] [data-ui-palette-value=default]');
    await click('.catalog-header [data-ui-palette-select] + .ui-select-trigger');await key('End');await key('Enter');
    if(!await evaluate('document.documentElement.dataset.uiPalette==="custom" && localStorage.getItem("kav-ui-palette")==="custom" && document.querySelectorAll("style[data-ui-custom-palette-style]").length===1'))throw new Error('Custom palette select reuse '+width);
    await navigate('templates/dashboard.html');
    if(!await evaluate('KavUI.getCustomPalette().seed==="#52796f" && document.documentElement.dataset.uiPalette==="custom" && document.body.dataset.uiTheme==="glass" && document.querySelector("[data-ui-palette-select]").value==="custom" && [...document.querySelectorAll(".ui-chart-svg")].every(svg=>!!svg.getClientRects().length)'))throw new Error('Custom palette template navigation '+width);
    await evaluate('KavUI.setColorTheme("dark",{persist:true})');await send('Page.reload');await delay(150);
    if(!await evaluate('document.documentElement.dataset.bsTheme==="dark" && document.documentElement.dataset.uiPalette==="custom" && KavUI.getCustomPalette().chroma===23'))throw new Error('Custom palette reload/mode '+width);
    // Fresh document without a stored custom definition for the next iteration.
    await evaluate('KavUI.setPalette("default",{persist:true});localStorage.removeItem("kav-ui-custom-palette")');
  }
  await navigate('components/color-palettes.html');
  await evaluate('KavUI.setCustomPalette("#7d6b91",{chroma:24,persist:true})');
  const customSaved=await evaluate('JSON.parse(localStorage.getItem("kav-ui-custom-palette"))');
  await send('Network.setBlockedURLs',{urls:['*assets/ui/js/ui.js','*assets/js/catalog-demo.js','*assets/js/templates.js']});
  for(const mode of ['light','dark']) {
    const {identifier}=await send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('kav-ui-theme',${JSON.stringify(mode)});`});
    for(const path of ['index.html','components/dialog.html','components/color-palettes.html','templates/dashboard.html']) {
      await firstPaintPage(path);
      if(!await evaluate(`document.documentElement.dataset.uiPalette==='custom' && getComputedStyle(document.documentElement).getPropertyValue('--bs-primary').trim()===${JSON.stringify(customSaved[mode]['--bs-primary'])} && typeof KavUI==='undefined' && document.querySelectorAll('style[data-ui-custom-palette-style]').length===1`))throw new Error('Custom palette pre-paint '+[mode,path]);
    }
    await send('Page.removeScriptToEvaluateOnNewDocument',{identifier});
  }
  // Invalid cached CSS cannot reach a style element; runtime regenerates trusted roles from the seed.
  const invalidCache={...customSaved,light:{...customSaved.light,'--bs-primary':'red; } body{display:none}'}};
  const corrupt=await send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('kav-ui-custom-palette',${JSON.stringify(JSON.stringify(invalidCache))});`});
  await firstPaintPage('components/dialog.html');
  if(!await evaluate('!document.querySelector("style[data-ui-custom-palette-style]") && document.documentElement.dataset.uiPalette!=="custom"'))throw new Error('Invalid cached CSS was accepted');
  await send('Network.setBlockedURLs',{urls:[]});await navigate('components/dialog.html');
  if(!await evaluate('document.documentElement.dataset.uiPalette==="custom" && KavUI.getCustomPalette().seed==="#7d6b91" && !document.querySelector("style[data-ui-custom-palette-style]").textContent.includes("display:none")'))throw new Error('Custom palette must regenerate cached tokens');
  await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:corrupt.identifier});
  const explicitCustom=await send('Page.addScriptToEvaluateOnNewDocument',{source:`const observer=new MutationObserver(()=>{if(document.documentElement){Object.assign(document.documentElement.dataset,{uiPalette:'custom',uiPaletteSeed:'#52796f',uiPaletteChroma:'20'});observer.disconnect();}});observer.observe(document,{childList:true});`});
  await navigate('components/dialog.html');
  if(!await evaluate('KavUI.getCustomPalette().seed==="#52796f" && KavUI.getCustomPalette().chroma===20 && document.documentElement.dataset.uiPalette==="custom"'))throw new Error('Explicit custom seed priority');
  await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:explicitCustom.identifier});
  const noStorage=await send('Page.addScriptToEvaluateOnNewDocument',{source:"Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Storage unavailable','SecurityError');}});"});
  await navigate('components/color-palettes.html');
  if(!await evaluate('KavUI.setCustomPalette("#52796f",{persist:true}) && document.documentElement.dataset.uiPalette==="custom"'))throw new Error('Custom palette with blocked storage');
  await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:noStorage.identifier});
  await navigate('index.html');await evaluate('KavUI.setPalette("default",{persist:true});localStorage.removeItem("kav-ui-custom-palette");KavUI.setDesignTheme("default",{persist:true});KavUI.setColorTheme("light",{persist:true})');await navigate('index.html');
  console.log('Custom palettes: real color picker/range/form/select at 3 widths, template navigation/reload, 4 entry pages × 2 modes pre-paint without UI code, strict cache values, seed regeneration/explicit priority and blocked storage');

  const paletteData=JSON.parse(readFileSync(join(root,'scripts/color-palettes.json'),'utf8')).palettes;
  for(const width of [320,768,1440]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    await navigate('components/color-palettes.html');
    for(const palette of paletteData)for(const mode of ['light','dark'])for(const design of ['default','glass','glassmorphism','flat','soft']) {
      await evaluate(`KavUI.setPalette(${JSON.stringify(palette.name)});KavUI.setColorTheme(${JSON.stringify(mode)});KavUI.setDesignTheme(${JSON.stringify(design)})`);await delay(180);
      const result=await evaluate(`(()=>{
        const rootStyle=getComputedStyle(document.documentElement),buttons=[...document.querySelectorAll('#palette-preview .btn')];
        const luminance=color=>{const values=color.match(/[\\d.]+/g).slice(0,3).map(Number).map(c=>c/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);return values[0]*.2126+values[1]*.7152+values[2]*.0722;};
        const contrast=(a,b)=>{const values=[luminance(a),luminance(b)].sort((a,b)=>a-b);return (values[1]+.05)/(values[0]+.05);};
        return {overflow:document.documentElement.scrollWidth>innerWidth+1,primary:rootStyle.getPropertyValue('--md-sys-color-primary').trim(),pair:rootStyle.getPropertyValue('--md-sys-color-on-primary').trim(),contrast:buttons.filter(b=>['btn-primary','btn-success','btn-warning','btn-danger','btn-info'].some(name=>b.classList.contains(name))).every(b=>{const css=getComputedStyle(b);return contrast(css.color,css.backgroundColor)>=4.5;}),selected:[...document.querySelectorAll('#palette-choose [aria-pressed=true]')].map(b=>b.dataset.uiPaletteValue)};
      })()`);
      if(result.overflow || !result.contrast || result.primary!==palette.modes[mode].roles.primary || result.pair!==palette.modes[mode].roles['on-primary'] || result.selected.join()!==palette.name)throw new Error('Palette roles/contrast/controls '+[width,palette.name,mode,design]+': '+JSON.stringify(result));
      if(width===1440 && design==='default') {
        await evaluate('document.getElementById("palette-preview").scrollIntoView({behavior:"instant"})');await delay(70);
        const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});writeFileSync(join(artifacts,'palette-'+palette.name+'-'+mode+'.png'),Buffer.from(shot.data,'base64'));
      }
    }
    // Use the actual custom select with keyboard input, then navigate and reload.
    await evaluate('KavUI.setPalette("default")');
    await click('.catalog-header [data-ui-palette-select] + .ui-select-trigger');await key('End');await key('Enter');
    if(!await evaluate(`document.documentElement.dataset.uiPalette==='clay' && localStorage.getItem('kav-ui-palette')==='clay' && [...document.querySelectorAll('select[data-ui-palette-select]')].every(s=>s.value==='clay')`))throw new Error('Palette native select/synchronization/persistence');
    await navigate('templates/dashboard.html');
    if(!await evaluate('document.documentElement.dataset.uiPalette==="clay" && document.querySelector("[data-ui-palette-select]").value==="clay"'))throw new Error('Palette restored on template navigation');
    await click('[data-ui-palette-select] + .ui-select-trigger');await key('ArrowUp');await key('Enter');
    await send('Page.reload');await delay(120);
    if(!await evaluate('document.documentElement.dataset.uiPalette==="sand" && document.querySelector("[data-ui-palette-select]").value==="sand"'))throw new Error('Palette custom select/reload');
    for(const mode of ['light','dark'])for(const palette of paletteData) {
      await evaluate(`KavUI.setColorTheme(${JSON.stringify(mode)});KavUI.setDesignTheme('glassmorphism');KavUI.setPalette(${JSON.stringify(palette.name)})`);
      if(!await evaluate('document.documentElement.scrollWidth<=innerWidth+1 && [...document.querySelectorAll(".ui-chart-svg")].every(svg=>!!svg.getClientRects().length)'))throw new Error('Palette dashboard/chart '+[width,mode,palette.name]);
    }
    await evaluate('KavUI.setPalette("default",{persist:true});KavUI.setDesignTheme("default",{persist:true});KavUI.setColorTheme("light",{persist:true})');
  }
  // Block ui.js to prove CSS-only palettes and pre-paint restoration on all entry types.
  await send('Network.setBlockedURLs',{urls:['*assets/ui/js/ui.js','*assets/js/catalog-demo.js','*assets/js/templates.js']});
  for(const mode of ['light','dark']) {
    const {identifier}=await send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('kav-ui-theme',${JSON.stringify(mode)});localStorage.setItem('kav-ui-palette','sage');localStorage.removeItem('kav-ui-design-theme');`});
    for(const path of ['index.html','getting-started.html','components/dialog.html','components/color-palettes.html','templates.html','templates/docs.html','templates/dashboard.html','templates/changelog.html']) {
      await firstPaintPage(path);
      if(!await evaluate(`document.documentElement.dataset.uiPalette==='sage' && getComputedStyle(document.documentElement).getPropertyValue('--md-sys-color-primary').trim()===${JSON.stringify(paletteData.find(p=>p.name==='sage').modes[mode].roles.primary)} && typeof KavUI==='undefined'`))throw new Error('Palette CSS-only first paint '+[mode,path]);
    }
    await send('Page.removeScriptToEvaluateOnNewDocument',{identifier});
  }
  await send('Network.setBlockedURLs',{urls:[]});
  const explicit=await send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('kav-ui-palette','sage');const observer=new MutationObserver(()=>{if(document.documentElement){document.documentElement.dataset.uiPalette='clay';observer.disconnect();}});observer.observe(document,{childList:true});`});
  await navigate('components/color-palettes.html');
  if(!await evaluate('document.documentElement.dataset.uiPalette==="clay" && document.querySelector("[data-ui-palette-select]").value==="clay"'))throw new Error('Explicit HTML palette wins over stored palette');
  await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:explicit.identifier});
  const optOut=await send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('kav-ui-palette','sage');const observer=new MutationObserver(()=>{if(document.body){document.body.removeAttribute('data-ui-theme-persist');observer.disconnect();}});observer.observe(document,{childList:true,subtree:true});`});
  await navigate('components/dialog.html');
  if(!await evaluate('document.documentElement.dataset.uiPalette==="default"'))throw new Error('Stored palette requires persist opt-in');
  await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:optOut.identifier});
  const invalid=await send('Page.addScriptToEvaluateOnNewDocument',{source:"localStorage.setItem('kav-ui-palette','unknown');"});await navigate('components/color-palettes.html');
  if(!await evaluate('document.documentElement.dataset.uiPalette==="default"'))throw new Error('Invalid stored palette falls back');
  await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:invalid.identifier});
  const blocked=await send('Page.addScriptToEvaluateOnNewDocument',{source:"Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Storage unavailable','SecurityError');}});"});await navigate('components/color-palettes.html');
  if(!await evaluate('KavUI.setPalette("mauve",{persist:true}) && document.documentElement.dataset.uiPalette==="mauve"'))throw new Error('Palette works with blocked storage');
  await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:blocked.identifier});
  await navigate('index.html');await evaluate('KavUI.setPalette("default",{persist:true});KavUI.setDesignTheme("default",{persist:true});KavUI.setColorTheme("light",{persist:true})');
  console.log('Color palettes: 6 × 2 modes × 5 designs × 3 widths, Material role pairs/text contrast, native select/keyboard, independent persistence/navigation/reload, CSS-only pre-paint on 8 entry pages, explicit priority, opt-out, invalid/blocked storage');

  // Error pages remain useful without JavaScript and preserve service themes.
  for(const width of [320,768,1440]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    for(const code of ['404','403','500','503']) {
      await navigate('templates/error-'+code+'.html');
      for(const mode of ['light','dark'])for(const design of ['default','glass','glassmorphism','flat','soft']) {
        await evaluate(`KavUI.setColorTheme(${JSON.stringify(mode)});KavUI.setDesignTheme(${JSON.stringify(design)})`);
        const valid=await evaluate(`(()=>{const card=document.querySelector('.template-error-card').getBoundingClientRect(),main=document.querySelector('main'),links=[...main.querySelectorAll('a')];return document.documentElement.scrollWidth<=innerWidth+1 && card.left>=0 && card.right<=innerWidth+1 && !!document.getElementById('error-title').textContent.includes(${JSON.stringify(code)}) && main.querySelectorAll('h1').length===1 && links.some(a=>a.getAttribute('href')==='dashboard.html') && document.querySelector('footer').getBoundingClientRect().top>=main.getBoundingClientRect().bottom-1;})()`);
        if(!valid)throw new Error('Error page responsive/theme '+[width,code,mode,design]);
      }
      await evaluate('KavUI.setColorTheme('+JSON.stringify(width===320?'dark':'light')+');KavUI.setDesignTheme('+JSON.stringify(width===768?'glassmorphism':'default')+');scrollTo({top:0,left:0,behavior:"instant"})');await delay(60);
      const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});writeFileSync(join(artifacts,'error-'+code+'-'+width+'.png'),Buffer.from(shot.data,'base64'));
      await evaluate('document.querySelector(".template-skip").focus()');await key('Enter');
      if(!await evaluate('location.hash==="#main" && document.activeElement===document.getElementById("main")'))throw new Error('Error page keyboard skip link '+code);
      if(['500','503'].includes(code)) {
        await evaluate('window.__errorReloadProbe=true;document.querySelector("[data-template-reload]").focus()');await key('Enter');
        let reloaded=false;
        for(let i=0;i<100;i++) {await delay(20);try{if(await evaluate('!window.__errorReloadProbe && document.readyState==="complete" && typeof KavUI!=="undefined"')){reloaded=true;break;}}catch(error){if(!/context|navigat/i.test(error.message))throw error;}}
        if(!reloaded)throw new Error('Error page manual reload '+code);
      }
    }
  }
  await send('Network.setBlockedURLs',{urls:['*assets/ui/js/ui.js','*assets/js/templates.js']});
  for(const code of ['404','403','500','503']) {
    await firstPaintPage('templates/error-'+code+'.html');
    if(!await evaluate('document.getElementById("error-title").getClientRects().length>0 && [...document.querySelectorAll("main a")].some(a=>a.getAttribute("href")==="dashboard.html") && (!document.querySelector("[data-template-reload]") || document.querySelector("[data-template-reload]").hidden)'))throw new Error('Error page no-JS recovery '+code);
  }
  await send('Network.setBlockedURLs',{urls:[]});await navigate('templates.html');
  if(!await evaluate('document.querySelectorAll("#template-errors .catalog-card").length===4'))throw new Error('Error template catalog destinations');
  console.log('Error templates: 4 pages × 3 widths × 10 themes/modes, recovery links, native skip focus/Enter reload, no-JS fallback and catalog entry points');

  // Service templates: file://, every visual theme, native controls and sample data.
  for(const width of [320,768,1440]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    for(const path of ['templates/docs.html','templates/dashboard.html','templates/changelog.html','components/chart.html']) {
      await navigate(path);
      for(const mode of ['light','dark'])for(const design of ['default','glass','glassmorphism','flat','soft']) {
        await evaluate('KavUI.setColorTheme('+JSON.stringify(mode)+');KavUI.setDesignTheme('+JSON.stringify(design)+')');await delay(15);
        const valid=await evaluate(`(()=>{
          const graphs=[...document.querySelectorAll('.ui-chart-output > svg')];
          return document.documentElement.scrollWidth<=innerWidth+1 && graphs.every(svg=>{const r=svg.getBoundingClientRect();return r.width>0 && r.left>=-1 && r.right<=innerWidth+1 && !/NaN|Infinity/.test(svg.outerHTML);}) && !document.querySelector('.ui-chart-message')?.textContent.includes('表示できません');
        })()`);
        if(!valid)throw new Error('Template/chart bounds '+[path,width,mode,design]);
      }
      // Keep representative screenshots for review.
      await evaluate('KavUI.setColorTheme("'+(width===320?'dark':'light')+'");KavUI.setDesignTheme("'+(width===768?'glassmorphism':'default')+'");scrollTo({top:0,left:0,behavior:"instant"})');await delay(60);
      const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});writeFileSync(join(artifacts,path.replaceAll('/','-')+'-'+width+'.png'),Buffer.from(shot.data,'base64'));
    }
    await navigate('templates/docs.html');
    if(width<768)await click('.template-doc-menu > summary');
    await evaluate(`(()=>{const search=document.querySelector('[data-doc-search]');search.value='リマインダー';search.dispatchEvent(new Event('input',{bubbles:true}));})()`);
    if(!await evaluate(`document.querySelectorAll('[data-doc-section]:not([hidden])').length===1 && !document.getElementById('notifications').hidden && document.querySelector('[data-doc-results]').textContent.includes('1件')`))throw new Error('Docs body search');
    await evaluate(`(()=>{const search=document.querySelector('[data-doc-search]');search.value='該当しない文字列';search.dispatchEvent(new Event('input',{bubbles:true}));})()`);
    if(!await evaluate('!document.querySelector("[data-doc-empty]").hidden'))throw new Error('Docs empty state');
    await evaluate(`(()=>{const search=document.querySelector('[data-doc-search]');search.value='';search.dispatchEvent(new Event('input',{bubbles:true}));})()`);
    await click('.ui-aside-nav a[href="#members"]');await delay(100);
    if(!await evaluate(`(()=>{const section=document.getElementById('members').getBoundingClientRect(),header=document.querySelector('.ui-header').getBoundingClientRect();return location.hash==='#members' && section.top>=header.bottom-2 && (innerWidth>=768 || !document.querySelector('.template-doc-menu').open);})()`))throw new Error('Docs anchor below sticky header/mobile menu');
    await navigate('templates/changelog.html');
    await click('[data-release-filter="added"]');
    if(!await evaluate(`document.querySelectorAll('[data-release]:not([hidden])').length===2 && document.querySelector('[data-release-filter="added"]').getAttribute('aria-pressed')==='true'`))throw new Error('Changelog category filter');
    await evaluate(`(()=>{const search=document.querySelector('[data-release-search]');search.value='CSV';search.dispatchEvent(new Event('input',{bubbles:true}));})()`);
    if(!await evaluate(`document.querySelectorAll('[data-release]:not([hidden])').length===1 && !document.getElementById('v-1-8-0').hidden`))throw new Error('Changelog combined filters');
    await click('[data-release-filter="fixed"]');
    if(!await evaluate(`!document.querySelector('[data-release-empty]').hidden && document.querySelector('[data-release-results]').textContent==='0件の更新'`))throw new Error('Changelog empty state');
    await evaluate(`(()=>{const search=document.querySelector('[data-release-search]');search.value='';search.dispatchEvent(new Event('input',{bubbles:true}));})()`);
    if(!await evaluate(`document.querySelectorAll('[data-release]:not([hidden])').length===1 && !document.getElementById('v-1-7-2').hidden`))throw new Error('Changelog clear search preserves category');
    await navigate('templates/dashboard.html');
    await click('#dashboard-period + .ui-select-trigger');await key('End');await key('Enter');
    if(!await evaluate(`document.getElementById('dashboard-period').value==='30' && document.querySelectorAll('#revenue-chart tbody tr').length===30 && document.querySelector('[data-metric=orders]').textContent==='498' && document.querySelector('#dashboard-status').textContent.includes('30日')`))throw new Error('Dashboard custom period select updates metrics and chart');
    const csv=await evaluate(`(async()=>{
      let blob;const original=URL.createObjectURL;URL.createObjectURL=value=>{blob=value;return original(value);};
      document.getElementById('dashboard-export').click();URL.createObjectURL=original;
      const text=await blob.text();const lines=text.replace(/^\\uFEFF/,'').split('\\r\\n');
      return lines.length===31 && lines[0]==='"日付","売上（円）"' && lines[1].startsWith('"9/23",') && lines.at(-1).startsWith('"10/22",');
    })()`);
    if(!csv)throw new Error('Dashboard CSV matches selected sample data');
    await click('#revenue-chart summary');
    if(!await evaluate('document.querySelector("#revenue-chart details").open'))throw new Error('Chart data table pointer toggle');
    await evaluate('document.querySelector("#revenue-chart summary").focus()');await key(' ');
    if(!await evaluate('!document.querySelector("#revenue-chart details").open'))throw new Error('Chart data table keyboard toggle');
    await evaluate('scrollTo({top:600,left:0,behavior:"instant"})');await delay(50);
    if(!await evaluate('Math.abs(document.querySelector(".ui-header").getBoundingClientRect().top)<1'))throw new Error('Service sticky header');
  }
  console.log('Service templates and chart: 4 pages × 3 widths × 10 themes/modes; docs search/empty/anchors, changelog combined filters, dashboard native select/metrics/chart/CSV, keyboard data table and sticky header');

  for(const [path,width,theme] of [['components/dialog.html',1440,'light'],['components/dialog.html',320,'dark'],['components/flex-grid.html',1440,'light'],['components/flex-grid.html',320,'dark'],['components/toasts.html',1440,'light'],['components/toasts.html',320,'dark'],['components/cards.html',1440,'light'],['components/calendar.html',1440,'light'],['components/calendar.html',320,'dark'],['components/datepicker.html',1440,'light'],['components/datepicker.html',320,'dark'],['components/loading.html',1440,'light'],['components/loading.html',320,'dark'],['components/clipboard.html',1440,'light'],['components/clipboard.html',320,'dark'],['components/buttons.html',1440,'light'],['components/buttons.html',320,'dark'],['components/animations.html',1440,'light'],['components/animations.html',320,'dark'],['components/theme-switcher.html',1440,'light'],['components/theme-switcher.html',320,'dark'],['components/forms.html',1440,'light'],['components/spacing.html',1440,'light'],['components/spacing.html',320,'dark']]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    await navigate(path);await evaluate('if (document.documentElement.dataset.bsTheme !== '+JSON.stringify(theme)+') document.querySelector("[data-ui-toggle=theme]").click()');
    if (path==='components/datepicker.html') await click('[data-ui-datepicker-button=icon] .ui-datepicker-toggle');
    if (path==='components/cards.html') await evaluate('document.querySelector("details.source").open=true');
    if (path==='components/toasts.html') {
      await evaluate("KavUI.toast({title:'保存しました',body:'プロジェクトの設定を保存しました。',meta:'たった今',variant:'success',copy:true,duration:0});KavUI.toast({title:'長いタイトルも固定幅で折り返します',body:'処理が完了しました。\\n詳細: https://example.test/projects/a-very-long-unbroken-project-identifier-for-wrapping-check-2026-001',variant:'info',duration:0})");
    }
    if (path==='components/clipboard.html') { await click('[data-ui-copy-target="#clipboard-id"]'); }
    if (path==='components/toasts.html') { await click('.ui-toast [data-ui-copy]'); }
    await delay(200);
    const {data}=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});
    writeFileSync(join(artifacts,path.replaceAll('/','-')+'-'+width+'-'+theme+'.png'),Buffer.from(data,'base64'));
    if(path==='components/flex-grid.html') {
      const y=await evaluate('[...document.querySelectorAll(".specimen > h2")].find(heading=>heading.textContent.includes("justify-content")).getBoundingClientRect().top+scrollY');
      const detail=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:Math.floor(y),width,height:1000,scale:1}});
      writeFileSync(join(artifacts,'grid-alignment-'+width+'-'+theme+'.png'),Buffer.from(detail.data,'base64'));
    }
  }
  {
  async function settleSidebar(){await evaluate(`Promise.all(document.querySelector('.ui-sidebar-dialog').getAnimations().map(a=>a.finished.catch(()=>{})))`);}
  // Responsive sidebars: current catalog and existing application shells.
  await navigate('components/sidebar.html');
  for(const width of [320,767,768,820,1023,1024,1440]){
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});await delay(35);
    for(const mode of ['light','dark'])for(const design of ['default','glass','glassmorphism','flat','soft']){
      const invalid=await evaluate(`(()=>{
        KavUI.setColorTheme('${mode}');KavUI.setDesignTheme('${design}');const bad=[];
        for(const root of document.querySelectorAll('.app-shell[data-ui-sidebar]')){
          const state=KavUI.sidebar(root),panel=root.querySelector('.app-sidebar'),box=root.getBoundingClientRect();
          if(root.scrollWidth>root.clientWidth+1||document.documentElement.scrollWidth>innerWidth+1)bad.push('overflow '+root.id);
          if(state.mode==='rail'&&!state.open){
            if(panel.hidden||panel.getBoundingClientRect().width>80)bad.push('rail width');
            const label=panel.querySelector('.sidebar-label');if(getComputedStyle(label).position!=='absolute')bad.push('rail label');
            if(!panel.querySelector('a').title)bad.push('rail name');
          }
          if(innerWidth<768&&root.id==='sidebar-responsive-demo'&&!panel.hidden)bad.push('mobile starts closed');
          if(innerWidth>=1024&&root.id==='sidebar-responsive-demo'&&(!state.open||panel.hidden))bad.push('desktop starts expanded');
        }
        return bad;
      })()`);
      if(invalid.length)throw new Error('Sidebar '+width+' '+mode+' '+design+': '+invalid.join(';'));
    }
  }
  // Native SVG hamburger, Escape, backdrop, focus containment, menu link and responsive relocation.
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:900,deviceScaleFactor:1,mobile:true});await delay(40);
  for(const demo of ['sidebar-responsive-demo','sidebar-rail-demo','sidebar-bottom-demo']){
    const trigger='#'+demo+' [data-ui-toggle="sidebar-responsive"]';
    await click(trigger+' svg');await settleSidebar();
    const check=await evaluate(`(()=>{const dialog=document.querySelector('.ui-sidebar-dialog[open]'),b=dialog?.getBoundingClientRect();return {open:!!dialog,inside:dialog?.contains(document.activeElement),bounds:b&&b.left>=-1&&b.right<=innerWidth+1&&b.top>=-1&&b.bottom<=innerHeight+1,locked:getComputedStyle(document.documentElement).overflow==='hidden',bottom:dialog?.classList.contains('ui-drawer-bottom'),right:b&&b.right};})()`);
    if(!check.open||!check.inside||!check.bounds||!check.locked || (demo==='sidebar-bottom-demo'&&!check.bottom) || (demo==='sidebar-rail-demo'&&Math.abs(check.right-390)>1))throw new Error('Sidebar mobile drawer '+demo+' '+JSON.stringify(check));
    await key('Tab');if(!await evaluate(`document.querySelector('.ui-sidebar-dialog').contains(document.activeElement)`))throw new Error('Sidebar Tab containment');
    const {data}=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});writeFileSync(join(artifacts,demo+'-390.png'),Buffer.from(data,'base64'));
    await key('Escape');await delay(40);
    if(!await evaluate(`!document.querySelector('.ui-sidebar-dialog')&&document.activeElement===document.querySelector('${trigger}')&&document.querySelector('#${demo} > .app-sidebar').hidden`))throw new Error('Sidebar Escape restoration '+demo);
    await click(trigger);await settleSidebar();await click('.ui-sidebar-dialog-close svg');await delay(30);
    if(!await evaluate(`!document.querySelector('.ui-sidebar-dialog')`))throw new Error('Sidebar close icon');
  }
  await click('#sidebar-responsive-demo [data-ui-toggle="sidebar-responsive"]');await settleSidebar();
  const b=await evaluate(`(()=>{const r=document.querySelector('.ui-sidebar-dialog').getBoundingClientRect();return {x:Math.min(innerWidth-2,r.right+20),y:innerHeight/2};})()`);
  await send('Input.dispatchMouseEvent',{type:'mousePressed',...b,button:'left',clickCount:1});await send('Input.dispatchMouseEvent',{type:'mouseReleased',...b,button:'left',clickCount:1});await delay(30);
  if(!await evaluate(`!document.querySelector('.ui-sidebar-dialog')`))throw new Error('Sidebar backdrop');
  await click('#sidebar-responsive-demo [data-ui-toggle="sidebar-responsive"]');await settleSidebar();
  await evaluate(`document.querySelector('.ui-sidebar-dialog a').href='#sidebar-responsive'`);await click('.ui-sidebar-dialog a');await delay(30);
  if(!await evaluate(`!document.querySelector('.ui-sidebar-dialog')&&!KavUI.sidebar('#sidebar-responsive-demo').open`))throw new Error('Sidebar navigation closes');
  await click('#sidebar-collapse-demo [data-ui-toggle="sidebar-responsive"]');
  if(!await evaluate(`!document.querySelector('#sidebar-collapse-demo > .app-sidebar').hidden&&document.querySelector('#sidebar-collapse-demo').dataset.uiSidebarMode==='collapse'`))throw new Error('Sidebar inline collapse');
  await evaluate(`document.querySelector('#sidebar-collapse-demo .app-sidebar a').focus()`);await key('Escape');
  if(!await evaluate(`document.querySelector('#sidebar-collapse-demo > .app-sidebar').hidden&&document.activeElement.matches('[data-ui-toggle="sidebar-responsive"]')`))throw new Error('Sidebar inline Escape/focus');
  await click('#sidebar-responsive-demo [data-ui-toggle="sidebar-responsive"]');await settleSidebar();
  await send('Emulation.setDeviceMetricsOverride',{width:820,height:1000,deviceScaleFactor:1,mobile:false});await delay(60);
  if(!await evaluate(`!document.querySelector('.ui-sidebar-dialog')&&document.querySelector('#sidebar-responsive-demo > .app-sidebar')&&!KavUI.sidebar('#sidebar-responsive-demo').open&&KavUI.sidebar('#sidebar-responsive-demo').mode==='rail'&&getComputedStyle(document.documentElement).overflow!=='hidden'`))throw new Error('Sidebar drawer to tablet');
  await click('#sidebar-responsive-demo [data-ui-toggle="sidebar-responsive"] svg');
  if(!await evaluate(`KavUI.sidebar('#sidebar-responsive-demo').open&&getComputedStyle(document.querySelector('#sidebar-responsive-demo .sidebar-label')).position!=='absolute'`))throw new Error('Sidebar rail expansion');
  await click('#sidebar-responsive-demo [data-ui-toggle="sidebar-responsive"]');
  await click('#sidebar-responsive-demo summary svg');
  if(!await evaluate(`KavUI.sidebar('#sidebar-responsive-demo').open&&document.querySelector('#sidebar-responsive-demo details').open`))throw new Error('Sidebar rail submenu expansion');
  for(const width of [820,1440]){
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});await delay(40);
    await evaluate(`KavUI.setDesignTheme('glassmorphism');KavUI.setColorTheme('dark');document.querySelector('#sidebar-rail-demo').scrollIntoView({behavior:"instant",block:'center'})`);await delay(180);
    const {data}=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});writeFileSync(join(artifacts,'sidebar-rail-'+width+'.png'),Buffer.from(data,'base64'));
  }
  // Top/bottom are edge overlays at every documented device size, independent of RTL.
  await navigate('components/sidebar.html');
  for(const width of [320,768,1440]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});await delay(40);
    for(const direction of ['top','bottom'])for(const theme of ['default','glass','glassmorphism','flat','soft']) {
      await evaluate(`KavUI.setDesignTheme('${theme}');KavUI.setColorTheme('dark');`);
      const selector='#sidebar-'+direction+'-demo [data-ui-toggle="sidebar-responsive"]';await click(selector+' svg');
      const animation=await evaluate(`(()=>{const d=document.querySelector('.ui-sidebar-dialog'),a=d.getAnimations()[0];return {classes:d.className,y:getComputedStyle(d).getPropertyValue('--ui-drawer-y').trim(),x:getComputedStyle(d).getPropertyValue('--ui-drawer-x').trim(),frames:a?.effect.getKeyframes().map(f=>f.translate)};})()`);
      if(!animation.classes.includes('ui-drawer-'+direction)||animation.x!=='0'||animation.y!==(direction==='top'?'-100%':'100%'))throw new Error('Sidebar edge direction '+JSON.stringify(animation));
      await settleSidebar();
      const bounds=await evaluate(`(()=>{const d=document.querySelector('.ui-sidebar-dialog'),r=d.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,height:r.height,focus:d.contains(document.activeElement)};})()`);
      if(!bounds.focus||bounds.left< -1||bounds.right>width+1||bounds.height<=0||(direction==='top'?Math.abs(bounds.top)>1:Math.abs(bounds.bottom-1000)>1))throw new Error('Sidebar edge bounds '+width+' '+direction+' '+JSON.stringify(bounds));
      if(theme==='glassmorphism') {const {data}=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});writeFileSync(join(artifacts,'sidebar-'+direction+'-'+width+'.png'),Buffer.from(data,'base64'));}
      await key('Escape');
      for(let attempt=0;attempt<30;attempt++){if(await evaluate(`!document.querySelector('.ui-sidebar-dialog')&&document.activeElement===document.querySelector('${selector}')`))break;await delay(20);}
      if(!await evaluate(`!document.querySelector('.ui-sidebar-dialog')&&document.activeElement===document.querySelector('${selector}')`))throw new Error('Sidebar edge close/focus '+width+' '+direction+' '+theme+' '+JSON.stringify(await evaluate(`({dialog:!!document.querySelector('.ui-sidebar-dialog'),active:document.activeElement.outerHTML.slice(0,400)})`)));
    }
  }
  console.log('Sidebar top/bottom: correct vertical animation and viewport edge at 320/768/1440 × 5 themes; native SVG open, Escape and focus return');

  // Touch-sized controls and reduced-motion presentation remain usable.
  await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:900,deviceScaleFactor:1,mobile:true});await delay(50);
  await navigate('components/sidebar.html');await evaluate(`document.getElementById('sidebar-responsive-demo').dir='rtl'`);
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await evaluate(`document.querySelector('#sidebar-responsive-demo [data-ui-toggle="sidebar-responsive"]').focus()`);await key('Enter');await settleSidebar();
  const touch=await evaluate(`(()=>{const d=document.querySelector('.ui-sidebar-dialog'),r=d.getBoundingClientRect(),b=d.querySelector('.ui-sidebar-dialog-close').getBoundingClientRect();return {rtl:d.dir==='rtl'&&r.right>=innerWidth-1,reduced:getComputedStyle(d).animationName==='none',touch:b.width>=44&&b.height>=44};})()`);
  if(!touch.rtl||!touch.reduced||!touch.touch)throw new Error('Sidebar RTL/reduced/touch '+JSON.stringify(touch));
  const tap=await evaluate(`(()=>{const r=document.querySelector('.ui-sidebar-dialog-close').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
  await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...tap,radiusX:2,radiusY:2}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await delay(40);
  if(!await evaluate(`!document.querySelector('.ui-sidebar-dialog')`))throw new Error('Sidebar native touch close');
  await send('Emulation.setTouchEmulationEnabled',{enabled:false});await send('Emulation.setEmulatedMedia',{features:[]});
  for(const width of [320,768,1440])for(const path of ['components/layouts.html','components/dialog.html','templates/dashboard.html']){
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});await navigate(path);
    if(!await evaluate(`document.documentElement.scrollWidth<=innerWidth+1`))throw new Error('Existing sidebar consumer overflow '+path+' '+width);
  }
  await send('Network.setBlockedURLs',{urls:['*assets/ui/js/ui.js','*assets/js/catalog-demo.js']});
  await send('Emulation.setDeviceMetricsOverride',{width:320,height:1000,deviceScaleFactor:1,mobile:false});await firstPaintPage('components/sidebar.html');
  if(!await evaluate(`[...document.querySelectorAll('.app-shell[data-ui-sidebar] > .app-sidebar')].every(panel=>panel.getBoundingClientRect().width>0&&!panel.hidden)&&document.documentElement.scrollWidth<=innerWidth+1`))throw new Error('Sidebar no-JS fallback');
  await send('Network.setBlockedURLs',{urls:[]});
  console.log('Responsive sidebar: 7 widths × 10 themes/modes; SVG/keyboard toggle, rail names/submenus, native drawers/bottom/inline, backdrop/Escape/focus, resize cleanup, RTL, native touch, reduced motion, existing consumers and no-JS');
  }

  // Banner: responsive actions, semantic colors, pointer/keyboard dismissal and fixed placement.
  await navigate('components/banner.html');
  for(const width of [320,768,1440]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    for(const mode of ['light','dark'])for(const design of ['default','glass','glassmorphism','flat','soft']) {
      const check=await evaluate(`(()=>{
        KavUI.setColorTheme('${mode}');KavUI.setDesignTheme('${design}');
        const bad=[];
        for(const b of document.querySelectorAll('.ui-banner:not([hidden])')){
          const r=b.getBoundingClientRect();if(r.width<=0||r.width>innerWidth||b.scrollWidth>b.clientWidth+1)bad.push('overflow '+b.className);
          if([...b.querySelectorAll('[icon]')].some(icon=>!icon.querySelector('svg')))bad.push('missing icon');
          const c=b.querySelector('.ui-banner-content'),a=b.querySelector('.ui-banner-actions');
          if(a&&r.width<768&&a.getBoundingClientRect().top<c.getBoundingClientRect().bottom-1)bad.push('actions did not wrap');
        }
        return bad;
      })()`);
      if(check.length)throw new Error('Banner '+width+' '+mode+' '+design+': '+check.join(';'));
    }
  }
  const colors=await evaluate(`(()=>{
    const host=document.createElement('div');document.body.append(host);const bad=[];
    const ctx=document.createElement('canvas').getContext('2d');
    const luminance=color=>{ctx.clearRect(0,0,1,1);ctx.fillStyle=color;ctx.fillRect(0,0,1,1);const n=[...ctx.getImageData(0,0,1,1).data].slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return .2126*n[0]+.7152*n[1]+.0722*n[2];};
    for(const palette of ['default','slate','sage','teal','mauve','sand','clay'])for(const mode of ['light','dark']) {
      KavUI.setPalette(palette);KavUI.setColorTheme(mode);
      for(const color of ['primary','info','success','warning','danger','neutral'])for(const variant of ['','ui-banner-solid','ui-banner-outline']){
        host.innerHTML='<div class="ui-banner ui-banner-'+color+' '+variant+'">案内</div>';
        const style=getComputedStyle(host.firstChild),fg=luminance(style.color),bg=luminance(style.backgroundColor);
        const ratio=(Math.max(fg,bg)+.05)/(Math.min(fg,bg)+.05);
        if(ratio<4.5)bad.push({palette,mode,color,variant,ratio});
      }
    }
    host.remove();KavUI.setPalette('default');KavUI.setColorTheme('light');KavUI.setDesignTheme('default');return bad;
  })()`);
  if(colors.length)throw new Error('Banner contrast: '+JSON.stringify(colors));
  await click('#banner-dismissible .ui-banner-close svg');
  if(!await evaluate(`document.getElementById('banner-dismissible').hidden && document.activeElement.getAttribute('data-ui-target')==='#banner-dismissible'`))throw new Error('Banner SVG dismissal/focus');
  await key('Enter');
  if(!await evaluate(`!document.getElementById('banner-dismissible').hidden`))throw new Error('Banner keyboard reopen');
  await evaluate(`document.querySelector('#banner-dismissible .ui-banner-close').focus()`);await key('Enter');
  if(!await evaluate(`document.getElementById('banner-dismissible').hidden`))throw new Error('Banner keyboard dismiss');
  for(const width of [320,768,1440]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    await click('[data-ui-target="#banner-floating-example"]');await delay(180);
    const fixed=await evaluate(`(()=>{const b=document.getElementById('banner-floating-example'),r=b.getBoundingClientRect();return !b.hidden&&r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight&&r.bottom>=innerHeight-40&&r.top>=0&&getComputedStyle(b).position==='fixed';})()`);
    if(!fixed)throw new Error('Banner floating bounds '+width);
    const {data}=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});writeFileSync(join(artifacts,'banner-'+width+'.png'),Buffer.from(data,'base64'));
    await click('#banner-floating-example .ui-banner-close');
  }
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  if(!await evaluate(`KavUI.show('#banner-dismissible');getComputedStyle(document.getElementById('banner-dismissible')).animationName==='none'`))throw new Error('Banner reduced motion');
  await send('Emulation.setEmulatedMedia',{features:[]});
  await send('Network.setBlockedURLs',{urls:['*assets/ui/js/ui.js','*assets/js/catalog-demo.js']});await firstPaintPage('components/banner.html');
  if(!await evaluate(`getComputedStyle(document.querySelector('.ui-banner-inner')).display==='flex' && document.querySelector('#banner-floating-example').hidden && document.documentElement.scrollWidth<=innerWidth+1`))throw new Error('Banner no-JS content');
  await send('Network.setBlockedURLs',{urls:[]});
  console.log('Banner: responsive actions @320/768/1440 × light/dark × 5 designs; 7 palettes × 6 colors × 3 styles contrast; native pointer/keyboard, focus return, floating placement, reduced motion and no-JS');

  // Additional OSS-style primitives keep native keyboard, form and scroll behavior.
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await navigate('components/command.html');
  await click('#command-inline-demo [data-ui-command-input]');
  await send('Input.insertText',{text:'ＳＥＴＴＩＮＧＳ'});
  if(!await evaluate(`(()=>{const root=document.querySelector('#command-inline-demo');return [...root.querySelectorAll('[data-ui-command-item]')].filter(el=>!el.hidden).map(el=>el.dataset.uiValue).join()==='settings';})()`))throw new Error('Command native search');
  await key('Enter');
  if(!await evaluate(`document.querySelector('#command-inline-demo').closest('[data-example]').querySelector('[data-demo-command-result]').textContent.includes('settings')`))throw new Error('Command native Enter event');
  await key('Escape');await send('Input.insertText',{text:'no-such-command'});
  if(!await evaluate(`!document.querySelector('#command-inline-demo [data-ui-command-empty]').hidden && !document.activeElement.hasAttribute('aria-activedescendant')`))throw new Error('Command empty result');
  await click('[data-ui-target="#command-dialog-demo"]');await delay(100);
  if(!await evaluate(`document.querySelector('#command-dialog-demo').open && document.activeElement.matches('#command-dialog-demo [data-ui-command-input]')`))throw new Error('Command dialog focus');
  await key('ArrowDown');await key('Enter');await delay(100);
  if(!await evaluate(`!document.querySelector('#command-dialog-demo').open && document.activeElement.matches('[data-ui-target="#command-dialog-demo"]')`))throw new Error('Command selection focus return');
  await send('Input.dispatchKeyEvent',{type:'rawKeyDown',key:'k',code:'KeyK',windowsVirtualKeyCode:75,modifiers:2});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'k',code:'KeyK',windowsVirtualKeyCode:75});
  if(!await evaluate(`document.querySelector('#command-dialog-demo').open`))throw new Error('Command Ctrl+K');await key('Escape');await delay(80);
  await send('Emulation.setDeviceMetricsOverride',{width:320,height:360,deviceScaleFactor:1,mobile:false});
  await evaluate(`(()=>{const root=document.querySelector('#command-dialog-demo'),list=root.querySelector('[data-ui-command-list]');for(let i=0;i<30;i++){const item=document.createElement('button');item.type='button';item.className='ui-command-item';item.dataset.uiCommandItem='';item.textContent='操作 '+i;list.append(item);}KavUI.init(root);})()`);
  await click('[data-ui-target="#command-dialog-demo"]');await delay(80);
  if(!await evaluate(`(()=>{const root=document.querySelector('#command-dialog-demo'),list=root.querySelector('[data-ui-command-list]'),close=root.querySelector('[data-ui-dismiss]'),r=close.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&list.scrollHeight>list.clientHeight&&root.getBoundingClientRect().width<=innerWidth;})()`))throw new Error('Command short viewport keeps close action visible');
  await key('Escape');await delay(80);
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await navigate('components/carousel.html');
  await click('#carousel-basic-demo [data-ui-carousel-next]');await delay(550);
  if(!await evaluate(`(()=>{const root=document.querySelector('#carousel-basic-demo'),v=root.querySelector('[data-ui-carousel-viewport]');return root.dataset.uiCarouselIndex==='1'&&Math.abs(v.scrollLeft-v.clientWidth)<3&&root.querySelector('[data-ui-carousel-to="1"]').getAttribute('aria-pressed')==='true'&&root.querySelector('.ui-carousel-slide').inert;})()`))throw new Error('Carousel native next/scroll');
  await click('#carousel-basic-demo [data-ui-carousel-to="2"]');await delay(550);
  if(!await evaluate(`document.querySelector('#carousel-basic-demo [data-ui-carousel-next]').disabled`))throw new Error('Carousel boundary');
  await evaluate(`document.querySelector('#carousel-basic-demo [data-ui-carousel-viewport]').focus()`);await key('Home');await delay(550);
  if(!await evaluate(`document.querySelector('#carousel-basic-demo').dataset.uiCarouselIndex==='0'`))throw new Error('Carousel Home');
  await evaluate(`document.querySelector('#carousel-basic-demo').dir='rtl';KavUI.init(document.querySelector('#carousel-basic-demo'))`);await delay(100);
  await key('ArrowLeft');await delay(550);
  if(!await evaluate(`(()=>{const root=document.querySelector('#carousel-basic-demo'),v=root.querySelector('[data-ui-carousel-viewport]');return root.dataset.uiCarouselIndex==='1'&&Math.abs(Math.abs(v.scrollLeft)-v.clientWidth)<3;})()`))throw new Error('Carousel RTL');
  await evaluate(`document.querySelector('#carousel-basic-demo').dir='ltr';KavUI.init(document.querySelector('#carousel-basic-demo'))`);
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await click('#carousel-basic-demo [data-ui-carousel-to="0"]');await delay(100);
  // A horizontal touch gesture changes the slide without tapping a control.
  await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
  const carouselTouch=await evaluate(`(()=>{const v=document.querySelector('#carousel-basic-demo [data-ui-carousel-viewport]');v.scrollIntoView({behavior:"instant",block:'center'});const r=v.getBoundingClientRect();return {x:r.right-30,y:r.top+r.height/2,width:r.width};})()`);
  await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:carouselTouch.x,y:carouselTouch.y}]});
  for(let step=1;step<=8;step++){await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:carouselTouch.x-carouselTouch.width*.8*step/8,y:carouselTouch.y}]});await delay(20);}
  await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await delay(700);await send('Emulation.setTouchEmulationEnabled',{enabled:false});
  if(!await evaluate(`document.querySelector('#carousel-basic-demo').dataset.uiCarouselIndex!=='0'`))throw new Error('Carousel touch swipe');
  const beforeResize=await evaluate(`document.querySelector('#carousel-basic-demo').dataset.uiCarouselIndex`);
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:1000,deviceScaleFactor:1,mobile:false});await delay(100);
  if(!await evaluate(`(()=>{const root=document.querySelector('#carousel-basic-demo'),v=root.querySelector('[data-ui-carousel-viewport]');return root.dataset.uiCarouselIndex===${JSON.stringify(beforeResize)}&&Math.abs(v.scrollLeft-v.clientWidth*Number(root.dataset.uiCarouselIndex))<3;})()`))throw new Error('Carousel resize preserves current slide');
  await send('Emulation.setEmulatedMedia',{features:[]});
  await navigate('components/rating.html');
  await click('#rating-form .ui-rating-choice:has([value="5"])');
  if(!await evaluate(`new FormData(document.querySelector('#rating-form')).get('rating')==='5' && [...document.querySelectorAll('#rating-form .ui-rating-star')].every(el=>getComputedStyle(el).fill!=='none')`))throw new Error('Rating native selection/star fill');
  await key('ArrowLeft');
  if(!await evaluate(`new FormData(document.querySelector('#rating-form')).get('rating')==='4' && getComputedStyle(document.querySelector('#rating-form .ui-rating-choice:has([value="5"]) svg')).fill==='none'`))throw new Error('Rating keyboard');
  await click('#rating-form [type="reset"]');
  if(!await evaluate(`new FormData(document.querySelector('#rating-form')).get('rating')==='3'`))throw new Error('Rating reset');
  await click('#rating-form .ui-rating-clear');
  if(!await evaluate(`new FormData(document.querySelector('#rating-form')).get('rating')==='0'&&[...document.querySelectorAll('#rating-form .ui-rating-star')].every(el=>getComputedStyle(el).fill==='none')`))throw new Error('Rating clear');
  for(const component of ['command','carousel','timeline','rating']) {
    await navigate('components/'+component+'.html');
    for(const width of [320,820,1440])for(const mode of ['light','dark'])for(const design of ['default','glass','glassmorphism','flat','soft']) {
      await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
      await evaluate(`KavUI.setColorTheme(${JSON.stringify(mode)});KavUI.setDesignTheme(${JSON.stringify(design)})`);
      await delay(25);
      const overflow=await evaluate(`(()=>{const bad=[...document.querySelectorAll('[data-example]')].filter(el=>el.scrollWidth>el.clientWidth+2).map(el=>el.closest('section').id);return {page:document.documentElement.scrollWidth>innerWidth+1,bad};})()`);
      if(overflow.page||overflow.bad.length)throw new Error('New component overflow '+JSON.stringify({component,width,mode,design,...overflow}));
      if(design==='glassmorphism'&&mode==='dark'&&width!==820){
        await evaluate(`document.querySelector('[data-example]').scrollIntoView({behavior:"instant",block:'center'})`);
        const {data}=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});writeFileSync(join(artifacts,component+'-'+width+'.png'),Buffer.from(data,'base64'));
      }
    }
  }
  await send('Network.setBlockedURLs',{urls:['*assets/ui/js/ui.js','*assets/js/catalog-demo.js']});
  for(const component of ['carousel','timeline','rating']) {
    await send('Page.navigate',{url:pathToFileURL(documentPath('components/'+component+'.html')).href});
    for(let i=0;i<150;i++){await delay(20);if(await evaluate('document.readyState==="complete"'))break;}
    if(!await evaluate(`typeof KavUI==='undefined' && document.documentElement.scrollWidth<=innerWidth+1`))throw new Error('No-JS component fallback '+component);
    if(component==='carousel'&&!await evaluate(`getComputedStyle(document.querySelector('.ui-carousel-controls')).display==='none'&&getComputedStyle(document.querySelector('.ui-carousel-viewport')).overflowX==='auto'`))throw new Error('Carousel no-JS scroll fallback');
    if(component==='rating'){
      await click('#rating-form .ui-rating-choice:has([value="5"])');
      if(!await evaluate(`new FormData(document.querySelector('#rating-form')).get('rating')==='5'`))throw new Error('Rating no-JS input');
    }
  }
  await send('Network.setBlockedURLs',{urls:[]});
  console.log('Command, Carousel, Timeline, Rating: native search/keyboard/dialog/touch/RTL/forms/reset; @320/820/1440 × light/dark × 5 designs; CSS-only fallbacks');

  // Smooth scrolling is opt-in CSS; anchors keep native history and focus behavior.
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  for(const width of [320,820,1440]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:720,deviceScaleFactor:1,mobile:false});
    await navigate('components/flex.html');
    await evaluate(`document.querySelector('.catalog-page-toc').open=true;scrollTo({top:0,behavior:"instant"});document.querySelectorAll('.catalog-toc-link')[5].focus({preventScroll:true})`);
    await key('Enter');await delay(60);
    const middle=await evaluate(`({y:scrollY,top:document.getElementById(decodeURIComponent(location.hash.slice(1))).getBoundingClientRect().top})`);
    if(middle.y<=0||middle.top<=100)throw new Error('TOC scroll must animate through intermediate frames '+width+' '+JSON.stringify(middle));
    await delay(1800);
    if(!await evaluate(`(()=>{const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));return document.activeElement===target&&Math.abs(target.getBoundingClientRect().top-document.querySelector('.catalog-header').getBoundingClientRect().bottom-20)<3;})()`))throw new Error('Smooth TOC final position/hash/focus '+width);
    await send('Page.reload');await delay(250);
    if(!await evaluate(`Math.abs(document.getElementById(decodeURIComponent(location.hash.slice(1))).getBoundingClientRect().top-document.querySelector('.catalog-header').getBoundingClientRect().bottom-20)<3`))throw new Error('Smooth TOC bookmark restores immediately '+width);
  }
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:600,deviceScaleFactor:1,mobile:false});
  await navigate('components/animations-processing.html');await delay(1000);
  if(!await evaluate(`(()=>{const root=document.querySelector('.catalog-sidebar-body'),current=root.querySelector('[aria-current=page]'),a=root.getBoundingClientRect(),b=current.getBoundingClientRect();return root.scrollTop>0&&b.top>=a.top-1&&b.bottom<=a.bottom+1&&scrollY===0;})()`))throw new Error('Left sidebar reveals current page without moving article');
  await navigate('components/navigation.html');
  await evaluate(`window.__scrollMotion=new Promise(resolve=>{
    const button=document.querySelector('[data-demo-scroll-current=last]'),root=document.querySelector('#scroll-active-demo');
    button.addEventListener('click',()=>{const positions=[],start=performance.now();function frame(time){positions.push(root.scrollTop);if(time-start<1100)requestAnimationFrame(frame);else resolve({positions,current:root.querySelector('[aria-current]').textContent,focus:document.activeElement===button,behavior:getComputedStyle(root).scrollBehavior});}requestAnimationFrame(frame);},{once:true});
  });true`);
  await click('[data-demo-scroll-current=last]');
  const activeMotion=await evaluate('window.__scrollMotion');
  const scrollEnd=activeMotion.positions.at(-1);
  if(!activeMotion.focus||!activeMotion.current.includes('16')||!activeMotion.positions.some(position=>position>0&&position<scrollEnd))throw new Error('Active-item smooth motion/focus '+JSON.stringify(activeMotion));
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await click('[data-demo-scroll-current=first]');await delay(70);
  if(!await evaluate(`document.querySelector('#scroll-active-demo').scrollTop===0&&getComputedStyle(document.documentElement).scrollBehavior==='auto'`))throw new Error('Reduced motion active item');
  await evaluate(`document.querySelector('.catalog-page-toc').open=true;scrollTo({top:0,behavior:"instant"});document.querySelectorAll('.catalog-toc-link')[5].focus({preventScroll:true})`);await key('Enter');await delay(70);
  if(!await evaluate(`Math.abs(document.getElementById(decodeURIComponent(location.hash.slice(1))).getBoundingClientRect().top-document.querySelector('.catalog-header').getBoundingClientRect().bottom-20)<3`))throw new Error('Reduced motion page anchor');
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  await send('Network.setBlockedURLs',{urls:['*assets/ui/js/ui.js','*assets/js/catalog-demo.js']});
  await send('Page.navigate',{url:pathToFileURL(documentPath('components/navigation.html')).href});
  for(let i=0;i<150;i++){await delay(20);if(await evaluate(`document.readyState==='complete'&&typeof KavUI==='undefined'`))break;}
  if(!await evaluate(`getComputedStyle(document.documentElement).scrollBehavior==='smooth'&&getComputedStyle(document.querySelector('#scroll-active-demo')).overflowY==='auto'`))throw new Error('Smooth CSS works without runtime');
  await send('Network.setBlockedURLs',{urls:[]});await send('Emulation.setEmulatedMedia',{features:[]});
  console.log('Smooth scroll: native page anchors @320/820/1440; intermediate/final frames, sticky offset/hash/focus/bookmark; left sidebar current-item visibility; reduced motion and CSS-only fallback');

  // Toast copy stays in the message's inline flow at the surrounding font size.
  for(const width of [320,820,1440])for(const mode of ['light','dark'])for(const design of ['default','glass','glassmorphism','flat','soft']) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
    await navigate('components/toasts.html');
    await evaluate(`KavUI.setColorTheme(${JSON.stringify(mode)});KavUI.setDesignTheme(${JSON.stringify(design)});`);
    const layout=await evaluate(`(()=>{
      const messages=[{title:'保存完了',body:'短いメッセージ'},{title:'タイトルだけ'},{body:'1行目\\nメッセージの最後'},{body:'長い通知の本文・'.repeat(30)+'https://example.test/'+ 'x'.repeat(100)}];
      const bad=[];
      for(const options of messages){
        const toast=KavUI.toast({...options,copy:true,duration:0}),button=toast.querySelector('[data-ui-copy]'),message=button.closest('.ui-toast-body, .ui-toast-title, .ui-toast-meta')||button.parentElement,b=button.getBoundingClientRect(),m=message.getBoundingClientRect();
        const text=message.querySelector('.ui-toast-copy-tail')?.firstChild||message.firstChild,range=document.createRange();range.setStart(text,Math.max(0,text.length-1));range.setEnd(text,text.length);const last=range.getBoundingClientRect();
        const font=parseFloat(getComputedStyle(message).fontSize),size=button.querySelector('svg').getBoundingClientRect().width;
        if(!message.lastElementChild.contains(button)||Math.abs(size-font)>.5||b.left<m.left-1||b.right>m.right+1||b.top<last.top-5||b.top>last.bottom+1||toast.scrollWidth>toast.clientWidth+1)bad.push({options,b:{x:b.x,y:b.y,width:b.width},last:{y:last.y},font,size});
      }
      return bad;
    })()`);
    if(layout.length)throw new Error('Inline toast copy layout '+JSON.stringify({width,mode,design,layout}));
    if(mode==='light'&&design==='default'&&width===1440){const {data}=await send('Page.captureScreenshot',{format:'png'});writeFileSync(join(artifacts,'inline-toast-light.png'),Buffer.from(data,'base64'));}
  }
  await send('Browser.grantPermissions',{permissions:['clipboardReadWrite','clipboardSanitizedWrite']},null);
  await navigate('components/toasts.html');await send('Page.bringToFront');await click('[data-ui-toast-copy][data-ui-copy-text]');await delay(180);await click('.ui-toast [data-ui-copy]');await delay(100);
  if(!await evaluate(`document.querySelector('.ui-toast [data-ui-copy]').dataset.uiCopyState==='success'`))throw new Error('Inline toast native copy');
  await navigate('components/clipboard.html');
  if(!await evaluate(`document.querySelector('.ui-copy-icon').getBoundingClientRect().width>=30`))throw new Error('Standalone clipboard icon size changed');
  await navigate('components/color-palettes.html');
  const cache=await evaluate(`KavUI.setCustomPalette('#52796f',{chroma:20,persist:true});JSON.parse(localStorage.getItem('kav-ui-custom-palette'))`);
  const legacy=structuredClone(cache);legacy.version=1;legacy.light['--md-sys-color-surface']=legacy.light['--bs-body-bg']=cache.light['--md-sys-color-surface-container-lowest'];legacy.light['--md-sys-color-surface-container-lowest']='#ffffff';
  const seed=await send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('kav-ui-custom-palette',${JSON.stringify(JSON.stringify(legacy))});localStorage.setItem('kav-ui-palette','custom');localStorage.setItem('kav-ui-theme','light');`});
  await send('Network.setBlockedURLs',{urls:['*assets/ui/js/ui.js','*assets/js/catalog-demo.js','*assets/js/templates.js']});
  for(const path of ['index.html','components/toasts.html','templates/dashboard.html']){
    await send('Page.navigate',{url:pathToFileURL(documentPath(path)).href});
    for(let i=0;i<150;i++){await delay(20);if(await evaluate(`document.readyState==='complete'&&typeof KavUI==='undefined'`))break;}
    if(!await evaluate(`(()=>{const s=getComputedStyle(document.documentElement);return document.documentElement.dataset.uiPalette==='custom'&&s.getPropertyValue('--bs-body-bg').trim()===${JSON.stringify(cache.light['--bs-body-bg'])}&&s.getPropertyValue('--md-sys-color-surface-container-lowest').trim()===${JSON.stringify(cache.light['--md-sys-color-surface-container-lowest'])};})()`))throw new Error('Legacy palette migrates before first paint '+path);
  }
  await send('Network.setBlockedURLs',{urls:[]});await navigate('components/color-palettes.html');
  if(!await evaluate(`KavUI.getCustomPalette().seed==='#52796f'&&getComputedStyle(document.documentElement).getPropertyValue('--bs-body-bg').trim()===${JSON.stringify(cache.light['--bs-body-bg'])}`))throw new Error('Legacy seed/chroma runtime restore');
  await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:seed.identifier});
  await evaluate(`KavUI.setPalette('default',{persist:true});KavUI.setColorTheme('light',{persist:true});KavUI.setDesignTheme('default',{persist:true})`);
  console.log('Toast/light surfaces: inline copy/body/title/long text @320/820/1440 × light/dark × 5 designs; native copy; standalone clipboard unchanged; v1 HCT palette migration before paint and runtime restoration');

  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await navigate('components/data-table.html');
  await evaluate(`window.__tableChanges=[];document.querySelector('#data-table-projects').addEventListener('ui:tablechange',event=>window.__tableChanges.push(event.detail))`);
  const visibleProjects=`[...document.querySelectorAll('#data-table-projects tbody tr[data-ui-row-id]')].filter(row=>!row.hidden).map(row=>row.dataset.uiRowId)`;
  if(JSON.stringify(await evaluate(visibleProjects))!==JSON.stringify(['project-01','project-02','project-03','project-04','project-05']))throw new Error('Data table initial page');
  await click('#data-table-projects [data-ui-table-search]');await send('Input.insertText',{text:'ＤＥＳＩＧＮ'});
  if(!await evaluate(`${visibleProjects}.join()==='project-01'&&window.__tableChanges.at(-1).filtered===1`))throw new Error('Data table native search');
  await key('Enter');
  await evaluate(`const input=document.querySelector('#data-table-projects [data-ui-table-search]');input.value='';input.dispatchEvent(new Event('input',{bubbles:true}))`);
  await click('#data-table-projects [data-ui-table-sort="number"]');
  if(!await evaluate(`${visibleProjects}[0]==='project-03'`))throw new Error('Data table numeric sort');
  await key('Enter');
  if(!await evaluate(`${visibleProjects}.slice(0,2).join()==='project-01,project-04'&&document.activeElement.matches('#data-table-projects [data-ui-table-sort="number"]')&&window.__tableChanges.at(-1).sort.direction==='descending'`))throw new Error('Data table keyboard sort/stability/focus');
  await key('Enter');
  if(!await evaluate(`${visibleProjects}[0]==='project-01'&&!document.querySelector('#data-table-projects th[aria-sort]')`))throw new Error('Data table restores original order');
  await click('#data-table-projects [data-ui-row-id="project-01"] [data-ui-row-select]');
  if(!await evaluate(`document.querySelector('#data-table-projects [data-ui-table-select-all]').indeterminate&&document.activeElement.matches('[data-ui-row-select]')`))throw new Error('Data table indeterminate/focus');
  await click('#data-table-projects [data-ui-table-select-all]');
  await click('#data-table-projects [data-ui-table-next]');
  if(!await evaluate(`${visibleProjects}[0]==='project-06'&&document.querySelector('#data-table-projects [data-ui-table-selection]').textContent==='5件を選択'&&!document.querySelector('#data-table-projects [data-ui-table-select-all]').checked`))throw new Error('Data table selection across pages');
  await click('#data-table-projects [data-ui-row-id="project-06"] [data-ui-row-select]');await key(' ' ,'Space');
  if(!await evaluate(`document.querySelector('#data-table-projects [data-ui-table-selection]').textContent==='5件を選択'`))throw new Error('Data table native checkbox Space');
  await click('#data-table-projects .ui-data-table-size .ui-select-trigger');await key('End');await key('Enter');
  if(!await evaluate(`${visibleProjects}.length===12&&document.querySelector('#data-table-projects [data-ui-table-page-size]').value==='0'`))throw new Error('Data table native page-size select');
  await click('#data-table-projects [data-ui-table-select-all]');
  if(!await evaluate(`document.querySelector('#data-table-projects [data-ui-table-selection]').textContent==='11件を選択'&&!document.querySelector('#data-table-projects [data-ui-row-id="project-12"] [data-ui-row-select]').checked`))throw new Error('Data table excludes disabled selection');
  if(!await evaluate(`[...document.querySelectorAll('#data-table-stock tbody tr:not([data-ui-table-empty])')].map(row=>row.textContent.trim()).join().includes('ノート10,ペン2,カード0')`))throw new Error('Independent data table changed');
  await evaluate(`(()=>{const root=document.querySelector('#data-table-projects'),select=root.querySelector('[data-ui-table-page-size]');select.value='5';select.dispatchEvent(new Event('change',{bubbles:true}));})()`);
  for(const width of [320,820,1440])for(const mode of ['light','dark'])for(const design of ['default','glass','glassmorphism','flat','soft']) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    await evaluate(`KavUI.setColorTheme(${JSON.stringify(mode)});KavUI.setDesignTheme(${JSON.stringify(design)})`);await delay(25);
    if(!await evaluate(`document.documentElement.scrollWidth<=innerWidth+1&&[...document.querySelectorAll('[data-example]')].every(example=>example.scrollWidth<=example.clientWidth+1)&&document.querySelector('#data-table-projects [data-ui-table-status]').textContent.includes('12')`))throw new Error('Data table responsive '+[width,mode,design]);
    if((width===1440&&design==='default'&&mode==='light')||(width===320&&design==='glassmorphism'&&mode==='dark')){
      await evaluate(`document.querySelector('#data-table-projects').scrollIntoView({behavior:'instant',block:'start'})`);await delay(50);const {data}=await send('Page.captureScreenshot',{format:'png'});writeFileSync(join(artifacts,'data-table-'+width+'-'+mode+'.png'),Buffer.from(data,'base64'));
    }
  }
  await evaluate(`KavUI.setCustomPalette('#7d6b91',{chroma:24})`);
  const contrasts=await evaluate(`(()=>{const bad=[],ctx=document.createElement('canvas').getContext('2d');const lum=color=>{ctx.clearRect(0,0,1,1);ctx.fillStyle=color;ctx.fillRect(0,0,1,1);const c=[...ctx.getImageData(0,0,1,1).data].slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return c[0]*.2126+c[1]*.7152+c[2]*.0722;};for(const palette of ['default','slate','sage','teal','mauve','sand','clay','custom'])for(const mode of ['light','dark']){KavUI.setPalette(palette);KavUI.setColorTheme(mode);const style=getComputedStyle(document.querySelector('#data-table-projects tr[data-ui-row-selected]')),a=lum(style.color),b=lum(style.backgroundColor),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);if(ratio<4.5)bad.push({palette,mode,ratio});}return bad;})()`);
  if(contrasts.length)throw new Error('Data table selected-row contrast '+JSON.stringify(contrasts));
  await evaluate(`KavUI.setPalette('default');KavUI.setColorTheme('light');KavUI.setDesignTheme('default')`);
  await send('Emulation.setDeviceMetricsOverride',{width:320,height:1000,deviceScaleFactor:1,mobile:false});
  await evaluate(`const area=document.querySelector('#data-table-projects .ui-table-scroll');area.scrollIntoView({behavior:'instant',block:'center'});area.scrollLeft=0;area.focus({preventScroll:true})`);await key('ArrowRight');await delay(180);
  if(!await evaluate(`document.querySelector('#data-table-projects .ui-table-scroll').scrollLeft>0&&scrollX===0`))throw new Error('Data table native horizontal keyboard scroll');
  await send('Emulation.setEmulatedMedia',{features:[{name:'forced-colors',value:'active'}]});
  if(!await evaluate(`parseFloat(getComputedStyle(document.querySelector('#data-table-projects tr[data-ui-row-selected]')).outlineWidth)>0`))throw new Error('Data table forced-colors selection');
  await send('Emulation.setEmulatedMedia',{features:[]});
  await send('Network.enable');await send('Network.setBlockedURLs',{urls:['*assets/ui/js/ui.js','*assets/js/catalog-demo.js']});
  await send('Page.navigate',{url:pathToFileURL(documentPath('components/data-table.html')).href});
  for(let i=0;i<150;i++){await delay(20);if(await evaluate(`document.readyState==='complete'&&typeof KavUI==='undefined'`))break;}
  if(!await evaluate(`document.querySelectorAll('#data-table-projects tbody tr:not([hidden])').length===12&&getComputedStyle(document.querySelector('#data-table-projects [data-ui-table-controls]')).display==='none'&&document.documentElement.scrollWidth<=innerWidth+1`))throw new Error('Data table no-JS fallback');
  await send('Network.setBlockedURLs',{urls:[]});
  console.log('Data table: native search/sort/checkbox/Space/selection/page-size, stable/missing values, independent instances; 3 widths × light/dark × 5 designs; 8 palettes contrast; keyboard horizontal scrolling/forced colors/no-JS');

  // User-operated disclosure must not be pulled back to the current page.
  async function verifyCatalogFold(selector,activation='click') {
    await evaluate(`(()=>{
      const summary=document.querySelector(${JSON.stringify(selector)}),root=document.querySelector('.catalog-sidebar-body');
      window.__foldResult=new Promise(resolve=>summary.addEventListener('click',()=>{
        const before={scroll:root.scrollTop,top:summary.getBoundingClientRect().top,y:scrollY,open:summary.parentElement.open},positions=[],start=performance.now();
        function record(time){positions.push({scroll:root.scrollTop,top:summary.getBoundingClientRect().top,y:scrollY});if(time-start<450)requestAnimationFrame(record);else resolve({before,positions,open:summary.parentElement.open,focus:document.activeElement===summary});}requestAnimationFrame(record);
      },{once:true}));
    })();true`);
    if(activation==='click')await click(selector);
    else {await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({behavior:'instant',block:'center'});document.querySelector(${JSON.stringify(selector)}).focus({preventScroll:true})`);await key(activation,activation===' '?'Space':activation);}
    const result=await evaluate('window.__foldResult');
    if(!result.focus||result.open===result.before.open||result.positions.some(point=>Math.abs(point.scroll-result.before.scroll)>1||Math.abs(point.top-result.before.top)>1||Math.abs(point.y-result.before.y)>1))throw new Error('Catalog fold position '+JSON.stringify({selector,activation,...result}));
  }
  for(const width of [820,1440]){
    await send('Emulation.setDeviceMetricsOverride',{width,height:720,deviceScaleFactor:1,mobile:false});
    await navigate('components/animations-processing.html');await delay(900);
    if(!await evaluate(`(()=>{const root=document.querySelector('.catalog-sidebar-body'),current=root.querySelector('[aria-current=page]'),a=root.getBoundingClientRect(),b=current.getBoundingClientRect();return b.top>=a.top-1&&b.bottom<=a.bottom+1;})()`))throw new Error('Sidebar initial current-page reveal '+width);
    await evaluate(`document.querySelector('.catalog-sidebar-body').scrollTo({top:0,behavior:'instant'})`);
    for(const activation of ['click','Enter',' '])await verifyCatalogFold('.catalog-nav-category > summary',activation);
    for(const activation of ['click','Enter',' '])await verifyCatalogFold('[data-catalog-family="icons"] > summary',activation);
    await evaluate(`document.querySelector('.catalog-sidebar-search input').value='forms';document.querySelector('.catalog-sidebar-search input').dispatchEvent(new Event('input',{bubbles:true}))`);
    if(!await evaluate(`!document.querySelector('.catalog-search-empty').hidden===false&&document.querySelectorAll('.catalog-nav-group:not([hidden])').length>0`))throw new Error('Sidebar search after folding');
  }
  await send('Emulation.setDeviceMetricsOverride',{width:320,height:900,deviceScaleFactor:1,mobile:false});
  await navigate('components/animations-processing.html');await delay(150);
  for(const activation of ['click','Enter',' '])await verifyCatalogFold('.catalog-mobile-menu > summary',activation);
  for(const activation of ['click','Enter',' '])await verifyCatalogFold('.catalog-navigation > summary',activation);
  for(const activation of ['click','Enter',' '])await verifyCatalogFold('.catalog-nav-category > summary',activation);
  for(const activation of ['click','Enter',' '])await verifyCatalogFold('[data-catalog-family="icons"] > summary',activation);
  console.log('Sidebar folding: initial current-page reveal preserved; click/Enter/Space keep scroll, summary position and focus for categories/nested/mobile disclosures @320/820/1440');

  if(errors.length)throw new Error('Uncaught browser errors:\n'+errors.join('\n'));
  console.log('Screenshots:',artifacts);
  console.log('PASS: no uncaught browser errors');
} finally {
  clearTimeout(timeout);
  try {await send('Browser.close',{},null);} catch {}
  child.kill();
  // Chromium can still be shutting down when it acknowledges Browser.close.
  await delay(100);
  rmSync(profile,{recursive:true,force:true,maxRetries:5,retryDelay:100});
}
