import {spawn} from 'node:child_process';
import {existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync, mkdirSync, readFileSync} from 'node:fs';
import {homedir, tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cache = join(homedir(), '.cache/ms-playwright');
const cached = existsSync(cache) ? readdirSync(cache).filter(name => name.startsWith('chromium_headless_shell-')).sort().reverse().map(name => join(cache, name, 'chrome-headless-shell-linux64/chrome-headless-shell')) : [];
const executable = [process.env.CHROME_BIN, '/usr/bin/chromium', '/usr/bin/chromium-browser', ...cached].find(path => path && existsSync(path));
if (!executable) throw new Error('Chromium is required');

const profile = mkdtempSync(join(tmpdir(), 'kav-ui-responsive-review-'));
const child = spawn(executable, ['--no-sandbox', '--disable-dev-shm-usage', '--disable-background-networking', '--remote-debugging-pipe', '--user-data-dir=' + profile], {stdio: ['ignore', 'ignore', 'pipe', 'pipe', 'pipe']});
let buffer = '', sequence = 0, session, stderr = '';
const pending = new Map();
child.stderr.on('data', chunk => { stderr = (stderr + chunk.toString()).slice(-1000); });
child.on('exit', () => { for (const {reject} of pending.values()) reject(new Error('Chromium exited: ' + stderr)); pending.clear(); });
child.stdio[4].on('data', chunk => {
  buffer += chunk.toString();
  let boundary;
  while ((boundary = buffer.indexOf('\0')) >= 0) {
    const message = JSON.parse(buffer.slice(0, boundary));
    buffer = buffer.slice(boundary + 1);
    if (!message.id) continue;
    const callback = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) callback?.reject(new Error(JSON.stringify(message.error)));
    else callback?.resolve(message.result);
  }
});
function send(method, params = {}, to = session) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    pending.set(id, {resolve, reject});
    child.stdio[3].write(JSON.stringify({id, method, params, ...(to ? {sessionId: to} : {})}) + '\0');
  });
}
async function evaluate(expression) {
  const response = await send('Runtime.evaluate', {expression, awaitPromise: true, returnByValue: true});
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
  return response.result.value;
}
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
async function navigate(path) {
  await send('Page.navigate', {url: pathToFileURL(join(root, 'docs', path)).href});
  for (let i = 0; i < 100; i++) {
    await delay(30);
    if (await evaluate('document.readyState === "complete"')) return;
  }
  throw new Error('Page load timed out: ' + path);
}
async function key(key, code = key) {
  const virtualKey = {Enter: 13, Space: 32}[code];
  await send('Input.dispatchKeyEvent', {type: key === 'Enter' ? 'keyDown' : 'rawKeyDown', key, code, windowsVirtualKeyCode: virtualKey, ...(key === 'Enter' ? {text: '\r', unmodifiedText: '\r'} : {})});
  await send('Input.dispatchKeyEvent', {type: 'keyUp', key, code, windowsVirtualKeyCode: virtualKey});
}

const failures=[];
const check=(value,message)=>{if(!value)failures.push(message);};
const timeout=setTimeout(()=>child.kill(),60000);
try {
  const {targetId}=await send('Target.createTarget',{url:'about:blank'},null);
  ({sessionId:session}=await send('Target.attachToTarget',{targetId,flatten:true},null));
  await send('Runtime.enable');await send('Page.enable');
  await send('Emulation.setTouchEmulationEnabled',{enabled:true});
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:900,deviceScaleFactor:1,mobile:false});
  await navigate('index.html');
  const home=await evaluate(`({height:document.documentElement.scrollHeight,top:document.querySelector('h1').getBoundingClientRect().top})`);
  console.log('390px home',home);
  check(home.height<=7500,'390px home must be at least 25% shorter than the 10,000px baseline');
  for(const path of ['index.html','getting-started.html','components/forms.html','components/splitter.html']) {
    await navigate(path);
    const top=await evaluate(`document.querySelector('h1').getBoundingClientRect().top`);
    // Touch emulation enlarges the header controls to 44px and the theme labels stay visible.
    check(top<=170,path+' h1 top '+top);
  }
  await navigate('getting-started.html');
  const toc=await evaluate(`(()=>{const list=document.querySelector('.catalog-page-toc nav > ol');return {groups:list.children.length,nested:list.querySelectorAll(':scope > li > ol a').length,broken:[...list.querySelectorAll('a')].filter(a=>!document.getElementById(decodeURIComponent(a.hash.slice(1)))).length};})()`);
  check(toc.groups>=4&&toc.groups<=6&&toc.nested>=21&&!toc.broken,'Grouped TOC '+JSON.stringify(toc));
  // Freeze authored and generated anchors from before grouping, including external links.
  const anchors=JSON.parse(readFileSync(join(root,'tests/catalog-getting-started-anchors.json'),'utf8'));
  check(await evaluate(`(${JSON.stringify(anchors)}).every(id=>document.getElementById(id))`),'Old anchors must resolve');
  await send('Emulation.setDeviceMetricsOverride',{width:320,height:900,deviceScaleFactor:1,mobile:false});
  await navigate('components/splitter.html');
  const squeezed=await evaluate(`[...document.querySelectorAll('[data-ui-splitter-panel] :is(a,p,h3)')].filter(el=>{const r=el.getBoundingClientRect(),s=parseFloat(getComputedStyle(el).fontSize);return el.textContent.trim().length>=4&&r.width>0&&r.width<s*2&&r.height>s*4;}).map(el=>el.textContent)`);
  check(!squeezed.length,'Splitter squeezed text '+JSON.stringify(squeezed));
  for(const width of [768,820,1440]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});await navigate('index.html');
    check(await evaluate(`(()=>{const cards=[...document.querySelectorAll('.catalog-card')];return cards.every((a,i)=>!i||Math.abs(a.offsetTop-cards[i-1].offsetTop)>1||a.offsetHeight===cards[i-1].offsetHeight);})()`),'Cards align at '+width);
  }
  if(failures.length)throw new Error(failures.join('\n'));
  if(process.env.CATALOG_SCREENSHOTS) {
    const dir=resolve(process.env.CATALOG_SCREENSHOTS);mkdirSync(dir,{recursive:true});
    for(const path of ['index.html','getting-started.html','components/forms.html','components/splitter.html']) {
      for(const width of (path.includes('splitter')?[320,390,820,1440]:[390,820,1440]))for(const mode of ['light','dark']) {
        await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
        await navigate(path);await evaluate(`KavUI.setColorTheme('${mode}')`);await delay(80);
        const dimensions=await evaluate(`({width:innerWidth,height:document.documentElement.scrollHeight})`);
        const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,...dimensions,scale:1}});
        writeFileSync(join(dir,path.replaceAll('/','-').replace('.html','')+'-'+width+'-'+mode+'.png'),Buffer.from(shot.data,'base64'));
      }
    }
    console.log('Screenshots: '+dir);
  }
  console.log('PASS: compact home/header, grouped TOC, preserved anchors, readable splitter, aligned rows');
} finally {
  clearTimeout(timeout);try{await send('Browser.close',{},null);}catch{}child.kill();await delay(100);rmSync(profile,{recursive:true,force:true});
}
