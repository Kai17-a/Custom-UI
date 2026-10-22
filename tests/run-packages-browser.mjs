/* node tests/run-browser.mjs — uses an installed Chromium, no npm dependencies.
   Set CHROME_BIN if Chromium is not installed in one of the detected locations. */
import {spawn} from 'node:child_process';
import {build} from 'vite';
import {createServer} from 'node:http';
import {existsSync, mkdtempSync, readdirSync, readFileSync, writeFileSync, rmSync} from 'node:fs';
import {homedir, tmpdir} from 'node:os';
import {join, resolve, dirname} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cache = join(homedir(), '.cache/ms-playwright');
const cached = existsSync(cache) ? readdirSync(cache).filter(name => name.startsWith('chromium_headless_shell-')).sort().reverse().map(name=>join(cache,name,'chrome-headless-shell-linux64/chrome-headless-shell')) : [];
const executable = [process.env.CHROME_BIN, '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome', ...cached].find(path=>path && existsSync(path));
if (!executable) throw new Error('Chromiumがありません。インストール済みブラウザの実行ファイルをCHROME_BINで指定してください。');
const profile = mkdtempSync(join(tmpdir(), 'kav-ui-browser-'));
const artifacts = mkdtempSync(join(tmpdir(), 'kav-ui-screenshots-'));
const fixtureOutput=mkdtempSync(join(tmpdir(),'kav-ui-package-fixture-'));
await build({configFile:false,root:join(root,'tests/packages/browser'),logLevel:'error',build:{outDir:fixtureOutput,emptyOutDir:true}});
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
    } else if(message.method==='Runtime.consoleAPICalled' && ['error','warning'].includes(message.params.type)){
      const value=message.params.args.map(arg=>arg.value||arg.description||'').join(' ');if(/hydration|unhandled|\[Vue warn\]/i.test(value))errors.push(value);
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
    const loaded=await evaluate('document.readyState === "complete" && typeof KavUI !== "undefined"');
    if(loaded)return;
  }
  throw new Error('Page load timed out: '+path);
}
async function key(key,code=key) { const vk={Escape:27,ArrowRight:39,ArrowLeft:37,Tab:9,Enter:13,ArrowDown:40,ArrowUp:38,' ':32}[key] || 0; await send('Input.dispatchKeyEvent',{type:key==='Enter'?'keyDown':'rawKeyDown',key,code,windowsVirtualKeyCode:vk,...(key==='Enter'?{text:'\r',unmodifiedText:'\r'}:{})}); await send('Input.dispatchKeyEvent',{type:'keyUp',key,code,windowsVirtualKeyCode:vk}); }
async function click(selector) {
  // Deliver programmatic scroll events before opening a scroll-sensitive popup.
  const box=await evaluate(`(async()=>{const el=document.querySelector(${JSON.stringify(selector)});el.scrollIntoView({block:'center'});await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
  await send('Input.dispatchMouseEvent',{type:'mousePressed',...box,button:'left',clickCount:1});
  await send('Input.dispatchMouseEvent',{type:'mouseReleased',...box,button:'left',clickCount:1});
}
const timeout=setTimeout(()=>{console.error('Browser checks timed out');child.kill();process.exitCode=1;},360000);
// Serve the built examples and canonical file tests without external test dependencies.
const mime={'.js':'text/javascript','.css':'text/css','.html':'text/html','.svg':'image/svg+xml','.json':'application/json'};
const servers=[];
async function serve(directory,transformHTML){
 const server=createServer((req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);let file=resolve(directory,'.'+pathname);if(!file.startsWith(directory+'/')&&file!==directory){res.writeHead(403);res.end();return;}if(!existsSync(file)||!file.includes('.'))file=join(file,'index.html');const extension=file.slice(file.lastIndexOf('.'));res.setHeader('Content-Type',mime[extension]||'application/octet-stream');const content=readFileSync(file);res.end(extension==='.html'&&transformHTML?transformHTML(content.toString()):content);}catch{res.writeHead(404);res.end('Not found');}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));servers.push(server);return 'http://127.0.0.1:'+server.address().port;
}
async function visit(url,ready){await send('Page.navigate',{url});for(let i=0;i<200;i++){await delay(25);if(await evaluate('document.readyState==="complete" && ('+ready+')'))return;}throw new Error('Page readiness: '+url);}
async function until(expression,label){for(let i=0;i<100;i++){if(await evaluate(expression))return;await delay(20);}throw new Error(label+': '+expression);}
function assert(value,label){if(!value)throw new Error(label);}
try {
 const {targetId}=await send('Target.createTarget',{url:'about:blank'},null);({sessionId:session}=await send('Target.attachToTarget',{targetId,flatten:true},null));
 await send('Runtime.enable');await send('Page.enable');
 const initialTheme=await serve(join(root,'examples/astro/dist'),html=>html.replace('<html ', '<html data-bs-theme="dark" '));
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'light'}]});
 await visit(initialTheme,`document.querySelector('.ui-select-trigger')&&document.querySelector('[data-testid=astro-vue] input')`);
 assert(await evaluate(`document.documentElement.dataset.bsTheme==='dark'&&document.documentElement.dataset.uiColorPreference==='dark'`),'Explicit initial Astro theme wins over the OS preference');
 await send('Emulation.setEmulatedMedia',{features:[]});
 const fixture=await serve(fixtureOutput);
 await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 await visit(fixture,'window.runPackageRegressions&&document.querySelector(".ui-select-trigger")');
 console.log(await evaluate('window.runPackageRegressions()'));
 const vue=await serve(join(root,'examples/vue/dist')),astro=await serve(join(root,'examples/astro/dist'));
 for(const width of [390,820,1440]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
  await visit(vue,`document.querySelector('[data-testid=vue-select] .ui-select-trigger')&&document.querySelector('[data-testid=vue-widget] .ui-chart-output')`);
  assert(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'Vue overflow '+width);
  await until(`document.querySelector('[data-testid=vue-chart] svg')`,'Vue default chart renders');
  await click('[data-testid=vue-input]');await send('Input.insertText',{text:' 追加'});await until(`document.querySelector('[data-testid=vue-state]').textContent.includes('追加')`,'Vue v-model input');
  await click('[data-testid=vue-select] .ui-select-trigger');await key('End');await key('Enter');await until(`JSON.parse(document.querySelector('[data-testid=vue-state]').textContent).plan===2`,'Vue numeric v-model select');
  assert(await evaluate(`document.activeElement===document.querySelector('[data-testid=vue-select] .ui-select-trigger')`),'Vue select keeps focus after model update');
  await click('[data-testid=vue-checkbox]');await until(`JSON.parse(document.querySelector('[data-testid=vue-state]').textContent).checked===true`,'Vue checkbox');
  await click('[data-testid=vue-calendar] [data-ui-calendar-date="2026-10-24"]');await until(`JSON.parse(document.querySelector('[data-testid=vue-state]').textContent).date==='2026-10-24'`,'Vue calendar model');
  assert(await evaluate(`document.activeElement?.dataset.uiCalendarDate==='2026-10-24'`),'Vue calendar focus survives model sync');
  await click('[data-testid=vue-open]');await until(`document.querySelector('[data-testid=vue-dialog]').open`,'Vue modal open');await key('Escape');await until(`!document.querySelector('[data-testid=vue-dialog]').open`,'Vue modal Escape');
  await click('[data-testid=vue-banner] .ui-banner-close');await until(`!document.querySelector('[data-testid=vue-banner]')`,'Vue banner model');
  await click('[data-testid=vue-widget] .ui-select-trigger');await click('[data-testid=vue-widget-toggle]');await until(`!document.querySelector('[data-testid=vue-widget]')&&!document.querySelector('.ui-select-menu:popover-open')`,'Vue unmount cleanup');
  await click('[data-testid=vue-widget-toggle]');await until(`document.querySelector('[data-testid=vue-widget] .ui-select-trigger')`,'Vue remount');
  const toggle='.app-shell > .app-content > .btn';await click(toggle);
  if(width<768){await until(`document.querySelector('.ui-sidebar-dialog').open`,'Vue sidebar drawer');await key('Escape');await until(`!document.querySelector('.ui-sidebar-dialog').open`,'Vue sidebar close');}
  else assert(await evaluate(`document.querySelector('.app-shell').dataset.uiSidebarState==='expanded'`),'Vue sidebar rail expansion');
  const {data}=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});writeFileSync(join(artifacts,'vue-'+width+'.png'),Buffer.from(data,'base64'));
 }
 for(const width of [390,820,1440]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
  await visit(astro,`document.querySelector('.ui-select-trigger')&&document.querySelector('[data-testid=astro-vue] input')`);
  assert(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'Astro overflow '+width);
  await click('.ui-select-trigger');await key('End');await key('Enter');assert(await evaluate(`document.querySelector('select[name=plan]').value==='team'`),'Astro select');
  await click('[data-testid=astro-open]');await until(`document.getElementById('astro-dialog').open`,'Astro modal');await key('Escape');await until(`!document.getElementById('astro-dialog').open`,'Astro Escape');
  await click('[data-testid=astro-vue] input');await send('Input.insertText',{text:' / Vue'});await until(`document.querySelector('[data-testid=astro-vue] output').textContent.includes('/ Vue')`,'Astro Vue island hydration');
  await evaluate(`window.__persistedKavIsland=document.querySelector('astro-island');window.__persistedKavIsland.setAttribute('data-astro-transition-persist','kav-persist-test');document.addEventListener('astro:before-swap',event=>{const target=event.newDocument.querySelector('astro-island')||event.newDocument.body.appendChild(window.__persistedKavIsland.cloneNode(true));target.setAttribute('data-astro-transition-persist','kav-persist-test');},{capture:true});`);
  await evaluate(`window.KavUI.setColorTheme('dark');window.KavUI.setDesignTheme('glass');window.KavUI.setCustomPalette('#7d6b91',{chroma:24});window.__kavCustomPrimary=getComputedStyle(document.documentElement).getPropertyValue('--bs-primary');${width===390?'':"window.KavUI.setPalette('sage')"};window.__kavThemePrimary=getComputedStyle(document.documentElement).getPropertyValue('--bs-primary');window.__kavNavigationProbe=123`);await click('[data-testid=astro-next]');await until(`location.pathname.startsWith('/second')&&document.querySelector('.ui-select-trigger')`,'Astro client navigation');
  assert(await evaluate('window.__kavNavigationProbe===123'),'Astro navigation must not reload page');
  assert(await evaluate(`document.documentElement.dataset.bsTheme==='dark'&&document.body.dataset.uiTheme==='glass'&&document.documentElement.dataset.uiPalette==='${width===390?'custom':'sage'}'&&getComputedStyle(document.documentElement).getPropertyValue('--bs-primary')===window.__kavThemePrimary`),'Astro navigation preserves color and design themes');
  await until(`!document.documentElement.hasAttribute('data-astro-transition')`,'Astro view transition finished');
  if(width!==390)assert(await evaluate(`(()=>{window.KavUI.setPalette('custom');const restored=getComputedStyle(document.documentElement).getPropertyValue('--bs-primary')===window.__kavCustomPrimary;window.KavUI.setPalette('sage');return restored;})()`),'Inactive custom palette CSS survives navigation and can be selected again');
  assert(await evaluate(`document.querySelectorAll('.ui-select-trigger').length===2&&!document.querySelector('dialog[open]')`),'Astro old page cleanup');
  assert(await evaluate(`window.__persistedKavIsland===document.querySelector('astro-island')&&window.__persistedKavIsland.querySelector('.ui-select-trigger')&&window.__persistedKavIsland.querySelector('output').textContent.includes('/ Vue')`),'Persisted Vue island keeps its initialized widgets and state');
  await click('.ui-select-trigger');await key('End');await key('Enter');assert(await evaluate(`document.querySelector('select').value==='two'`),'Astro select after swap '+JSON.stringify(await evaluate(`({value:document.querySelector('select').value,active:document.activeElement.outerHTML.slice(0,220),menus:[...document.querySelectorAll('.ui-select-trigger')].map(b=>b.outerHTML.slice(0,260))})`)));
  await click('[data-testid=astro-open]');await until(`document.getElementById('second-dialog').open`,'Astro modal after swap');await key('Escape');
  await click('[data-testid=astro-back]');await until(`location.pathname==='/'&&document.querySelector('[data-testid=astro-vue] input')&&document.querySelector('.ui-select-trigger')`,'Astro navigation back');
  assert(await evaluate(`document.documentElement.dataset.bsTheme==='dark'&&document.body.dataset.uiTheme==='glass'&&getComputedStyle(document.documentElement).getPropertyValue('--bs-primary')===window.__kavThemePrimary`),'Astro return navigation preserves themes');
  await until(`!document.documentElement.hasAttribute('data-astro-transition')`,'Astro return view transition finished');
  // Give the incoming document an explicit theme, then let the actual router swap it.
  await evaluate(`document.addEventListener('astro:before-swap',event=>{event.newDocument.documentElement.dataset.bsTheme='light';event.newDocument.documentElement.dataset.uiPalette='custom';event.newDocument.documentElement.dataset.uiPaletteSeed='#667788';event.newDocument.documentElement.dataset.uiPaletteChroma='20';},{once:true,capture:true});`);
  await click('[data-testid=astro-next]');await until(`location.pathname.startsWith('/second')&&document.querySelector('.ui-select-trigger')`,'Astro explicit-theme navigation');
  await until(`!document.documentElement.hasAttribute('data-astro-transition')`,'Astro explicit-theme transition finished');
  assert(await evaluate(`document.documentElement.dataset.bsTheme==='light'&&document.documentElement.dataset.uiColorPreference==='light'`),'Explicit destination theme synchronizes the runtime preference');
  assert(await evaluate(`window.KavUI.getCustomPalette().seed==='#667788'&&window.KavUI.getCustomPalette().chroma===20`),'Explicit destination custom palette seed and chroma are applied');
  assert(await evaluate(`(()=>{const button=document.createElement('button');button.dataset.uiColorMode='light';document.body.append(button);window.KavUI.init(button);const selected=button.getAttribute('aria-pressed')==='true';window.KavUI.destroy(button);button.remove();return selected;})()`),'Theme controls reflect the explicit destination preference');
 }
 await visit(pathToFileURL(join(root,'tests/ui.html')).href,'window.uiTestsDone');const unit=await evaluate('window.uiTestsDone');console.log('Canonical UI regression:',JSON.stringify(unit));assert(!unit.failures.length,'Legacy UI regressions');
 if(errors.length)throw new Error(errors.join('\n'));
 console.log('PASS: Vue/Astro @390/820/1440; model updates, SSR hydration, dialogs, Teleport sidebar, disposal and Astro ClientRouter. Screenshots:',artifacts);
}finally{rmSync(fixtureOutput,{recursive:true,force:true});clearTimeout(timeout);for(const server of servers)server.close();try{await send('Browser.close',{},null);}catch{}child.kill();}
