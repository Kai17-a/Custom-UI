/* node tests/run-browser.mjs — uses an installed Chromium, no npm dependencies.
   Set CHROME_BIN if Chromium is not installed in one of the detected locations. */
import {spawn} from 'node:child_process';
import {existsSync, mkdtempSync, readdirSync, writeFileSync, rmSync} from 'node:fs';
import {homedir, tmpdir} from 'node:os';
import {join, resolve, dirname} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cache = join(homedir(), '.cache/ms-playwright');
const cached = existsSync(cache) ? readdirSync(cache).filter(name => name.startsWith('chromium_headless_shell-')).sort().reverse().map(name=>join(cache,name,'chrome-headless-shell-linux64/chrome-headless-shell')) : [];
const executable = [process.env.CHROME_BIN, '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome', ...cached].find(path=>path && existsSync(path));
if (!executable) throw new Error('Chromiumがありません。インストール済みブラウザの実行ファイルをCHROME_BINで指定してください。');
const profile = mkdtempSync(join(tmpdir(), 'orchtop-browser-'));
const artifacts = mkdtempSync(join(tmpdir(), 'orchtop-screenshots-'));
const child = spawn(executable, ['--no-sandbox','--disable-dev-shm-usage','--disable-background-networking','--remote-debugging-pipe','--user-data-dir='+profile], {stdio:['ignore','ignore','pipe','pipe','pipe']});
let buffer = '';
let sequence = 0;
let session;
const pending = new Map();
const errors = [];
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
  await send('Page.navigate',{url:pathToFileURL(join(root,path)).href});
  for(let i=0;i<150;i++) {
    await delay(30);
    const loaded=await evaluate('document.readyState === "complete" && typeof OrchtopUI !== "undefined"');
    if(loaded)return;
  }
  throw new Error('Page load timed out: '+path);
}
async function key(key,code=key) { const vk={Escape:27,ArrowRight:39,ArrowLeft:37,Tab:9,Enter:13,ArrowDown:40,ArrowUp:38,' ':32}[key] || 0; await send('Input.dispatchKeyEvent',{type:key==='Enter'?'keyDown':'rawKeyDown',key,code,windowsVirtualKeyCode:vk,...(key==='Enter'?{text:'\r',unmodifiedText:'\r'}:{})}); await send('Input.dispatchKeyEvent',{type:'keyUp',key,code,windowsVirtualKeyCode:vk}); }
async function click(selector) {
  const box=await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});el.scrollIntoView({block:'center'});const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
  await send('Input.dispatchMouseEvent',{type:'mousePressed',...box,button:'left',clickCount:1});
  await send('Input.dispatchMouseEvent',{type:'mouseReleased',...box,button:'left',clickCount:1});
}
const timeout=setTimeout(()=>{console.error('Browser checks timed out');child.kill();process.exitCode=1;},90000);
try {
  const {targetId}=await send('Target.createTarget',{url:'about:blank'},null);
  ({sessionId:session}=await send('Target.attachToTarget',{targetId,flatten:true},null));
  await send('Runtime.enable');await send('Page.enable');
  // Block deferred UI code to expose the document's first rendered theme.
  await send('Network.enable');
  await send('Network.setBlockedURLs',{urls:['*assets/js/ui.js','*assets/js/catalog-demo.js']});
  async function firstPaintPage(path) {
    const url=pathToFileURL(join(root,path)).href;
    await send('Page.navigate',{url});
    for(let i=0;i<150;i++) {
      await delay(20);
      if(await evaluate('location.href==='+JSON.stringify(url)+' && document.readyState==="complete"'))return;
    }
    throw new Error('First-paint load timeout: '+path);
  }
  for(const mode of ['light','dark']) {
    const {identifier}=await send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('orchtop-theme',${JSON.stringify(mode)});localStorage.setItem('orchtop-design-theme','glass');`});
    await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:mode==='dark'?'light':'dark'}]});
    for(const path of ['index.html','getting-started.html','components/toasts.html','components/theme-switcher.html','starter.html']) {
      await firstPaintPage(path);
      const state=await evaluate('({mode:document.documentElement.dataset.bsTheme,design:document.body.dataset.uiTheme,background:getComputedStyle(document.documentElement).backgroundColor,ui:typeof OrchtopUI})');
      if(state.mode!==mode || state.design!=='glass' || state.background!==(mode==='dark'?'rgb(27, 28, 30)':'rgb(250, 249, 247)') || state.ui!=='undefined')throw new Error('Theme before UI: '+path+' '+JSON.stringify(state));
    }
    const {data}=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    writeFileSync(join(artifacts,'first-paint-'+mode+'.png'),Buffer.from(data,'base64'));
    await send('Page.removeScriptToEvaluateOnNewDocument',{identifier});
  }
  const systemSeed=await send('Page.addScriptToEvaluateOnNewDocument',{source:"localStorage.setItem('orchtop-theme','system');"});
  for(const os of ['light','dark']) {
    await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:os}]});
    await firstPaintPage('components/theme-switcher.html');
    if(!await evaluate('document.documentElement.dataset.uiColorPreference===\"system\" && document.documentElement.dataset.bsTheme==='+JSON.stringify(os)+' && typeof OrchtopUI===\"undefined\"'))throw new Error('System preference before first paint: '+os);
  }
  await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:systemSeed.identifier});
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'dark'}]});
  for(const source of [
    "localStorage.removeItem('orchtop-theme');localStorage.removeItem('orchtop-design-theme');",
    "localStorage.setItem('orchtop-theme','unknown');localStorage.setItem('orchtop-design-theme','unknown');",
    "Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Storage unavailable','SecurityError');}});"
  ]) {
    const {identifier}=await send('Page.addScriptToEvaluateOnNewDocument',{source});
    await firstPaintPage('components/forms.html');
    if(!await evaluate('document.documentElement.dataset.bsTheme==="dark" && !document.body.hasAttribute("data-ui-theme") && getComputedStyle(document.documentElement).backgroundColor==="rgb(27, 28, 30)"'))throw new Error('First-paint OS fallback failed');
    await send('Page.removeScriptToEvaluateOnNewDocument',{identifier});
  }
  await send('Network.setBlockedURLs',{urls:[]});
  await send('Emulation.setEmulatedMedia',{features:[]});
  await navigate('starter.html');
  await evaluate("localStorage.removeItem('orchtop-theme');localStorage.removeItem('orchtop-design-theme')");
  console.log('First paint with UI blocked: saved light/dark before rendering across 5 pages, glass restoration, OS fallback with absent/invalid/blocked storage');
  for (const width of [320,768,1440]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    await navigate('tests/ui.html');
    const result=await evaluate('window.uiTestsDone');
    console.log('Real browser tests @'+width+':',JSON.stringify(result));
    if(result.failures.length)throw new Error(result.failures.join('\n'));
  }
  for (const timezoneId of ['Asia/Tokyo','America/New_York']) {
    await send('Emulation.setTimezoneOverride',{timezoneId});
    const value=await evaluate(`(()=>{const root=document.createElement('div');root.dataset.uiCalendar='';root.dataset.uiMonth='2026-03';document.body.append(root);OrchtopUI.init(root);root.querySelector('[data-ui-calendar-date="2026-03-08"]').click();const value=root.dataset.uiValue;root.remove();return value;})()`);
    if(value!=='2026-03-08')throw new Error('Calendar timezone shifted: '+timezoneId);
  }
  await send('Emulation.setTimezoneOverride',{timezoneId:''});
  console.log('Calendar timezone checks: Asia/Tokyo and America/New_York');
  await navigate('tests/catalog.html');
  const formatting=await evaluate('window.catalogTestsDone');
  console.log('Source formatting tests:',JSON.stringify(formatting));
  if(formatting.failures.length)throw new Error(formatting.failures.join('\n'));
  // Audit file:// loading and responsive overflow across every catalog page.
  const pages=['index.html','getting-started.html','starter.html',...readdirSync(join(root,'components')).filter(name=>name.endsWith('.html')).map(name=>'components/'+name)];
  let checks=0; let sourceChecks=0;
  for(const width of [320,768,1440]) {
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
  await navigate('starter.html');
  await click('[data-ui-target="#starter-project"]');
  if(!await evaluate('document.querySelector("#starter-project").open'))throw new Error('Pointer did not open dialog');
  await key('Tab'); await key('Tab');
  if(!await evaluate('document.querySelector("#starter-project").contains(document.activeElement)'))throw new Error('Native dialog Tab focus escaped');
  await key('Escape'); await delay(30);
  if(!await evaluate('!document.querySelector("#starter-project").open && document.activeElement.dataset.uiTarget === "#starter-project"'))throw new Error('Native Escape/focus restoration failed: '+JSON.stringify(await evaluate('({open:document.querySelector("#starter-project").open,focus:document.activeElement.outerHTML})')));
  await click('[data-ui-target="#starter-project"]');
  await click('#starter-project [data-ui-dismiss]');await delay(30);
  if(!await evaluate('!document.querySelector("#starter-project").open'))throw new Error('Pointer dismissal failed');
  await evaluate('document.querySelector("[data-ui-toggle=tab]").focus()');await key('ArrowRight');
  if(!await evaluate('document.activeElement.getAttribute("aria-selected") === "true" && document.activeElement.dataset.uiTarget === "settings"'))throw new Error('Native keyboard tab navigation failed');
  console.log('Native pointer/keyboard checks: dialog open/dismiss/Escape/focus return; tab ArrowRight');
  for(const width of [320,1440]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    await navigate('components/forms.html');
    await evaluate('OrchtopUI.setDesignTheme("glassmorphism");OrchtopUI.setColorTheme('+JSON.stringify(width===320?'dark':'light')+')');
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
  await evaluate('OrchtopUI.setDesignTheme("default")');
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
    await evaluate('OrchtopUI.setDesignTheme("glassmorphism");OrchtopUI.setColorTheme('+JSON.stringify(mode)+');document.querySelector("#checkbox-radio").scrollIntoView({block:"start"})');await delay(200);
    const {data}=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    writeFileSync(join(artifacts,'checks-'+width+'-'+mode+'.png'),Buffer.from(data,'base64'));
  }
  await send('Emulation.setEmulatedMedia',{features:[{name:'forced-colors',value:'active'}]});
  if(!await evaluate('getComputedStyle(document.querySelector("#check-report")).appearance==="auto"'))throw new Error('Custom checks forced-colors fallback');
  await send('Emulation.setEmulatedMedia',{features:[]});await evaluate('OrchtopUI.setDesignTheme("default")');
  console.log('Custom checkbox/radio: native label click, Space/focus, ArrowRight/radio selection, forced colors and light/dark @320/1440');
  // Verify the selected preference survives OS changes and page navigation.
  await navigate('components/theme-switcher.html');
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'light'}]});
  await click('#color-mode-buttons [data-ui-color-mode=system]');
  await delay(60);
  if(!await evaluate('document.documentElement.dataset.bsTheme==="light" && document.documentElement.dataset.uiColorPreference==="system" && localStorage.getItem("orchtop-theme")==="system"'))throw new Error('System selection/persistence');
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
  await evaluate('OrchtopUI.setColorTheme("light",{persist:true})');
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
      await evaluate('OrchtopUI.setDesignTheme('+JSON.stringify(design)+');OrchtopUI.setColorTheme('+JSON.stringify(mode)+')');
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
  await key('Escape');await evaluate('OrchtopUI.setDesignTheme("default")');
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
    OrchtopUI.init(fixture);
    const dialog=fixture.querySelector('dialog');dialog.showModal();
    const panel=fixture.querySelector('#reduced-panel');OrchtopUI.show(panel);
    const alert=fixture.querySelector('.alert');OrchtopUI.show(alert);
    const note=OrchtopUI.toast('通知',{duration:0});
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
  await evaluate('OrchtopUI.setDesignTheme("default");document.querySelector("[data-ui-theme-select]").focus()');
  await key('ArrowDown');await key('Enter');
  if(!await evaluate('document.body.dataset.uiTheme==="glass" && [...document.querySelectorAll("[data-ui-theme-select]")].every(select=>select.value==="glass")'))throw new Error('Custom design theme select did not synchronize');
  await navigate('components/themes.html');
  if(!await evaluate('document.body.dataset.uiTheme==="glass"'))throw new Error('Design theme did not survive reload');
  await navigate('starter.html');
  if(!await evaluate('document.body.dataset.uiTheme==="glass"'))throw new Error('Design theme did not carry to the starter');
  // Exercise every design and light/dark combination at phone and desktop widths.
  for(const width of [320,1440]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    for(const mode of ['light','dark']) for(const design of ['default','glass','glassmorphism','flat','soft']) {
      await navigate('components/themes.html');
      await evaluate('if(document.documentElement.dataset.bsTheme!=='+JSON.stringify(mode)+')document.querySelector("[data-ui-toggle=theme]").click();OrchtopUI.setDesignTheme('+JSON.stringify(design)+')');
      await evaluate('document.querySelector(".ui-card [data-ui-toggle=dialog]").click()');
      await delay(180);
      await evaluate('document.querySelector("#theme-dialog [data-ui-tooltip]").focus({preventScroll:true})');
      const geometry=await evaluate(`(()=>{
        const dialog=document.querySelector('#theme-dialog');const tip=document.querySelector('.ui-tooltip');
        return [dialog,tip].every(el=>{if(!el)return false;const r=el.getBoundingClientRect();return r.left>=0 && r.right<=innerWidth+1 && r.top>=0 && r.bottom<=innerHeight+1;});
      })()`);
      if(!geometry)throw new Error('Theme modal/tooltip bounds: '+[width,mode,design]+' '+await evaluate('JSON.stringify({open:document.querySelector("#theme-dialog").open,active:document.activeElement.outerHTML,tooltip:document.querySelector(".ui-tooltip")?.outerHTML})'));
      await evaluate('document.querySelector("#theme-dialog [data-ui-dismiss=dialog]").click();document.querySelector("[data-ui-datepicker]").scrollIntoView({block:"center"});document.querySelector("[data-ui-datepicker] .ui-datepicker-toggle").click()');
      const popup=await evaluate(`(()=>{const r=document.querySelector('.ui-datepicker-popup').getBoundingClientRect();return r.left>=0 && r.right<=innerWidth+1 && r.top>=0 && r.bottom<=innerHeight+1;})()`);
      if(!popup)throw new Error('Theme date picker bounds: '+[width,mode,design]);
      await key('Escape');
      await evaluate('document.querySelector("[data-ui-toast-copy]").click()');
      if(!await evaluate('document.documentElement.scrollWidth<=innerWidth+1 && document.querySelector(".ui-toast")'))throw new Error('Theme layout/toast: '+[width,mode,design]+' '+await evaluate('JSON.stringify({width:document.documentElement.scrollWidth,viewport:innerWidth,toast:!!document.querySelector(".ui-toast"),dialog:document.querySelector("#theme-dialog").open,popup:document.querySelector(".ui-datepicker-popup").matches(":popover-open"),active:document.activeElement.outerHTML})'));
      if(width===1440) {
        await evaluate('scrollTo(0,0)');await delay(180);
        const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});
        writeFileSync(join(artifacts,'theme-'+design+'-'+mode+'.png'),Buffer.from(shot.data,'base64'));
      }
    }
  }
  // Custom select uses the popup, retains form values and stays in the viewport.
  for(const width of [320,1440]) for(const mode of ['light','dark']) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    await navigate('components/theme-switcher.html');
    await evaluate('OrchtopUI.setDesignTheme("glassmorphism");OrchtopUI.setColorTheme('+JSON.stringify(mode)+')');
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
  await evaluate(`(()=>{const dialog=document.querySelector('#theme-dialog');const label=document.createElement('label');label.textContent='表示方法';const select=document.createElement('select');select.className='form-select';select.innerHTML='<option>一覧</option><option>カード</option>';label.append(select);dialog.querySelector('.buttons').before(label);OrchtopUI.init(label);})()`);
  await click('#theme-dialog .ui-select-trigger');await delay(180);
  if(!await evaluate('!!document.querySelector("#theme-dialog .ui-select-menu:popover-open")'))throw new Error('Custom select in modal did not open');
  await key('Escape');
  if(!await evaluate('document.querySelector("#theme-dialog").open && !document.querySelector(".ui-select-menu:popover-open") && document.activeElement.matches(".ui-select-trigger")'))throw new Error('Custom select Escape closed parent modal or lost focus');
  await evaluate(`(()=>{const label=document.createElement('label');label.textContent='時刻';const input=document.createElement('input');input.type='time';input.className='form-control';label.append(input);document.querySelector('#theme-dialog .buttons').before(label);OrchtopUI.init(label);})()`);
  await click('#theme-dialog .ui-input-picker-trigger');await delay(180);await key('Escape');
  if(!await evaluate('document.querySelector("#theme-dialog").open && !document.querySelector(".ui-input-popup:popover-open") && document.activeElement.matches(".ui-input-picker-trigger")'))throw new Error('Input picker Escape closed parent modal or lost focus');
  await key('Escape');
  console.log('Custom select: native pointer, End/Enter, Escape, button synchronization, viewport bounds @320/1440 light/dark; select/input popups preserve parent modal');
  await evaluate('OrchtopUI.setDesignTheme("default",{persist:true})');
  console.log('Design themes: custom select, synchronization, reload/navigation persistence, all 10 designs/modes @320 and1440; modal, tooltip, date picker and toast');
  await navigate('components/animations.html');
  await click('[data-ui-target="#motion-dialog"]');await delay(180);
  await key('Escape');await delay(20);
  if(!await evaluate('!document.querySelector("#motion-dialog").open && !!document.querySelector("[data-ui-motion-ghost]")'))throw new Error('Native dialog exit motion or immediate close failed');
  await delay(180);
  if(!await evaluate('!document.querySelector("[data-ui-motion-ghost]")'))throw new Error('Exit visual was not cleaned up');
  await click('[data-ui-target="#motion-panel"]');await delay(180);
  await click('[data-ui-target="#motion-panel"]');
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await delay(30);
  await evaluate(`(()=>{
    const button=document.querySelector('.switch input');button.click();
    OrchtopUI.show('#motion-panel');OrchtopUI.hide('#motion-panel');
    OrchtopUI.setDesignTheme('soft');
  })()`);
  const reducedMotionState=await evaluate(`({ghosts:document.querySelectorAll('[data-ui-motion-ghost]').length,web:document.body.getAnimations().length,switchTransition:getComputedStyle(document.querySelector('.switch input'),'::after').transitionDuration})`);
  if(reducedMotionState.ghosts || reducedMotionState.web || reducedMotionState.switchTransition!=='0s')throw new Error('Interaction reduced motion failed: '+JSON.stringify(reducedMotionState));
  await send('Emulation.setEmulatedMedia',{features:[]});
  await evaluate('OrchtopUI.setDesignTheme("default")');
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
  for(const [path,width,theme] of [['starter.html',1440,'light'],['starter.html',320,'dark'],['components/flex-grid.html',1440,'light'],['components/flex-grid.html',320,'dark'],['components/toasts.html',1440,'light'],['components/toasts.html',320,'dark'],['components/cards.html',1440,'light'],['components/calendar.html',1440,'light'],['components/calendar.html',320,'dark'],['components/datepicker.html',1440,'light'],['components/datepicker.html',320,'dark'],['components/loading.html',1440,'light'],['components/loading.html',320,'dark'],['components/clipboard.html',1440,'light'],['components/clipboard.html',320,'dark'],['components/buttons.html',1440,'light'],['components/buttons.html',320,'dark'],['components/animations.html',1440,'light'],['components/animations.html',320,'dark'],['components/theme-switcher.html',1440,'light'],['components/theme-switcher.html',320,'dark'],['components/forms.html',1440,'light'],['components/spacing.html',1440,'light'],['components/spacing.html',320,'dark']]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    await navigate(path);await evaluate('if (document.documentElement.dataset.bsTheme !== '+JSON.stringify(theme)+') document.querySelector("[data-ui-toggle=theme]").click()');
    if (path==='components/datepicker.html') await click('[data-ui-datepicker-button=icon] .ui-datepicker-toggle');
    if (path==='components/cards.html') await evaluate('document.querySelector("details.source").open=true');
    if (path==='components/toasts.html') {
      await evaluate("OrchtopUI.toast({title:'保存しました',body:'プロジェクトの設定を保存しました。',meta:'たった今',variant:'success',copy:true,duration:0});OrchtopUI.toast({title:'長いタイトルも固定幅で折り返します',body:'処理が完了しました。\\n詳細: https://example.test/projects/a-very-long-unbroken-project-identifier-for-wrapping-check-2026-001',variant:'info',duration:0})");
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
