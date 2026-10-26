/* node tests/run-ai-visuals-browser.mjs — uses an installed Chromium, no npm dependencies.
   Set CHROME_BIN if Chromium is not installed in one of the detected locations. */
import {spawn} from 'node:child_process';
import {existsSync, mkdtempSync, readdirSync, writeFileSync, rmSync} from 'node:fs';
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
  await send('Page.navigate',{url:pathToFileURL(documentPath(path)).href});
  for(let i=0;i<150;i++) {
    await delay(30);
    const loaded=await evaluate('document.readyState === "complete" && typeof KavUI !== "undefined"');
    if(loaded)return;
  }
  throw new Error('Page load timed out: '+path);
}
async function key(key,code=key) { const vk={Escape:27,ArrowRight:39,ArrowLeft:37,Tab:9,Enter:13,ArrowDown:40,ArrowUp:38,' ':32}[key] || 0; await send('Input.dispatchKeyEvent',{type:key==='Enter'?'keyDown':'rawKeyDown',key,code,windowsVirtualKeyCode:vk,...(key==='Enter'?{text:'\r',unmodifiedText:'\r'}:{})}); await send('Input.dispatchKeyEvent',{type:'keyUp',key,code,windowsVirtualKeyCode:vk}); }
const assert=(value,message)=>{if(!value)throw new Error(message);};
async function ready(expression){for(let i=0;i<100;i++){if(await evaluate(expression))return;await delay(25);}throw new Error('Timed out: '+expression);}
async function checkNativeControls(){
  for(const id of ['ai-answer','ai-tools','ai-retrieval']) {
    await evaluate(`(()=>{const d=document.querySelector('#${id} details');d.open=false;d.querySelector('summary').focus();})()`);
    await key('Enter');assert(await evaluate(`document.querySelector('#${id} details').open`),'Keyboard opens '+id);
    await key(' ');assert(await evaluate(`!document.querySelector('#${id} details').open`),'Keyboard closes '+id);
  }
  await evaluate(`document.querySelector('#ai-voice-state').checked=false;document.querySelector('#ai-voice-state').focus()`);
  await key(' ');
  assert(await evaluate(`document.querySelector('#ai-voice-state').checked&&getComputedStyle(document.querySelector('.ui-ai-voice-active')).display!=='none'&&getComputedStyle(document.querySelector('.ui-ai-voice-idle')).display==='none'`),'Keyboard changes voice to processing');
  await key(' ');
  assert(await evaluate(`!document.querySelector('#ai-voice-state').checked&&getComputedStyle(document.querySelector('.ui-ai-voice-active')).display==='none'`),'Keyboard restores voice idle state');
}
const timeout=setTimeout(()=>{child.kill();process.exitCode=1;},60000);
try {
  const {targetId}=await send('Target.createTarget',{url:'about:blank'},null);
  ({sessionId:session}=await send('Target.attachToTarget',{targetId,flatten:true},null));await send('Runtime.enable');await send('Page.enable');
  await navigate('index.html');
  assert(await evaluate(`!!document.querySelector('[data-catalog-item][href="components/ai-visuals.html"]')`),'AI visuals must be discoverable in the catalog');
  await evaluate(`(()=>{const s=document.querySelector('#catalog-search');s.value='RAG';s.dispatchEvent(new Event('input',{bubbles:true}));})()`);
  assert(await evaluate(`!document.querySelector('[data-catalog-item][href="components/ai-visuals.html"]').hidden`),'RAG keyword finds AI visuals');
  await navigate('components/ai-visuals.html');
  assert(await evaluate(`document.querySelectorAll('main [data-example]').length===6`),'Six AI visual patterns');
  await checkNativeControls();
  assert(await evaluate(`document.querySelector('#ai-map svg[role=img] title').textContent.includes('意味')&&document.querySelectorAll('#ai-map .ui-ai-map-list li').length===3`),'Semantic map has an accessible description and matching document list');
  await send('Emulation.setDeviceMetricsOverride',{width:320,height:900,deviceScaleFactor:1,mobile:false});
  await evaluate(`document.querySelector('.ui-ai-map-canvas').scrollIntoView({behavior:'instant',block:'center'});document.querySelector('.ui-ai-map-canvas').focus()`);await key('ArrowRight');await delay(180);
  assert(await evaluate(`document.querySelector('.ui-ai-map-canvas').scrollLeft>0&&document.documentElement.scrollWidth<=innerWidth+1`),'Keyboard scrolls the map within its own region');
  assert(await evaluate(`(()=>{const root=document.querySelector('#ai-context'),meter=root.querySelector('[role=meter]'),entries=[...root.querySelectorAll('.ui-ai-budget-breakdown data')],used=entries.slice(0,-1).reduce((sum,d)=>sum+Number(d.value),0),all=entries.reduce((sum,d)=>sum+Number(d.value),0);return used===Number(meter.getAttribute('aria-valuenow'))&&all===Number(meter.getAttribute('aria-valuemax'))&&meter.getAttribute('aria-label');})()`),'Context totals and accessible meter agree');
  for(const width of [320,768,1440])for(const mode of ['light','dark']) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
    for(const design of ['default','glass','glassmorphism','flat','soft']) {
      await evaluate(`KavUI.setColorTheme('${mode}');KavUI.setDesignTheme('${design}')`);
      assert(await evaluate(`document.documentElement.scrollWidth<=innerWidth+1&&[...document.querySelectorAll('main .ui-ai')].every(root=>root.getBoundingClientRect().width>0)`),'AI visuals fit '+[width,mode,design]);
    }
    await evaluate(`KavUI.setDesignTheme('default');scrollTo({top:0,left:0,behavior:'instant'})`);
    const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});writeFileSync(join(artifacts,'ai-visuals-'+width+'-'+mode+'.png'),Buffer.from(shot.data,'base64'));
  }
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  assert(await evaluate(`getComputedStyle(document.querySelector('.ui-ai-wave span')).transitionDuration==='0s'`),'Reduced motion disables waveform transitions');
  await send('Emulation.setEmulatedMedia',{features:[{name:'forced-colors',value:'active'}]});await checkNativeControls();
  assert(await evaluate(`document.querySelector('[role=meter]').getAttribute('aria-valuenow')==='47600'`),'Forced colors retains numeric information');
  await send('Emulation.setEmulatedMedia',{features:[]});
  // All functionality remains native when every external script is blocked.
  await send('Network.enable');await send('Network.setBlockedURLs',{urls:['*.js']});
  await send('Page.navigate',{url:pathToFileURL(documentPath('components/ai-visuals.html')).href});
  await ready(`document.readyState==='complete'&&typeof KavUI==='undefined'`);await checkNativeControls();
  assert(await evaluate(`document.documentElement.scrollWidth<=innerWidth+1`),'No-script fallback stays in bounds');
  if(errors.length)throw new Error(errors.join('\n'));
  console.log('PASS: six patterns, catalog search, native disclosures and voice keyboard states, context totals, 3 widths × 10 themes/modes, reduced motion, forced colors and no-JS');
  console.log('Screenshots:',artifacts);
} finally {
  clearTimeout(timeout);try{await send('Browser.close',{},null);}catch{}child.kill();await delay(100);rmSync(profile,{recursive:true,force:true,maxRetries:5,retryDelay:100});
}
