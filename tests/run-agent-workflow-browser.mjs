/* node tests/run-agent-workflow-browser.mjs — uses an installed Chromium, no npm dependencies.
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
async function until(expression){for(let i=0;i<80;i++){if(await evaluate(expression))return;await delay(25);}throw new Error('Timed out: '+expression);}
const timeout=setTimeout(()=>{child.kill();process.exitCode=1;},60000);
try {
  const {targetId}=await send('Target.createTarget',{url:'about:blank'},null);
  ({sessionId:session}=await send('Target.attachToTarget',{targetId,flatten:true},null));
  await send('Runtime.enable');await send('Page.enable');
  await navigate('components/agent-workflow.html');
  assert(await evaluate(`document.querySelectorAll('[data-ui-agent-flow]').length===3`),'Three diagrams offer flowing connections');
  for(const width of [320,768,1440])for(const mode of ['light','dark']) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
    await evaluate(`KavUI.setColorTheme('${mode}')`);
    for(const id of ['agent-flow','agent-hierarchy','agent-orchestration']) {
      await evaluate(`document.getElementById('${id}').scrollIntoView({behavior:'instant',block:'start'});window.flowRoot=document.getElementById('${id}').querySelector('[data-ui-agent-flow]');window.flowLine=flowRoot.querySelector('.ui-agent-flow > li:not(:last-child), .ui-agent-tree ul');window.flowPseudo=flowLine.matches('li')?'::after':'::before'`);
      await until(`flowRoot.hasAttribute('data-ui-agent-visible')`);
      const start=await evaluate(`({position:getComputedStyle(flowLine,flowPseudo).backgroundPosition,box:JSON.stringify(flowRoot.getBoundingClientRect()),border:getComputedStyle(flowLine,flowPseudo).borderImageSource})`);
      await delay(180);
      assert(await evaluate(`getComputedStyle(flowLine,flowPseudo).backgroundPosition!==${JSON.stringify(start.position)} && getComputedStyle(flowLine,flowPseudo).backgroundImage.includes('gradient')`),'Chase highlight travels '+[width,mode,id]);
      assert(await evaluate(`JSON.stringify(flowRoot.getBoundingClientRect())===${JSON.stringify(start.box)}&&document.documentElement.scrollWidth<=innerWidth+1`),'Motion does not move nodes or overflow '+[width,mode,id]);
      await evaluate(`flowRoot.querySelector('input[type=checkbox]').focus()`);await key(' ');
      await evaluate(`new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))`);
      const paused=await evaluate(`getComputedStyle(flowLine,flowPseudo).backgroundPosition`);await delay(100);
      assert(await evaluate(`getComputedStyle(flowLine,flowPseudo).animationPlayState==='paused' && getComputedStyle(flowLine,flowPseudo).backgroundPosition===${JSON.stringify(paused)}`),'Keyboard pauses the chase '+JSON.stringify(await evaluate(`({checked:flowRoot.querySelector('input').checked,play:getComputedStyle(flowLine,flowPseudo).animationPlayState,position:getComputedStyle(flowLine,flowPseudo).backgroundPosition,variable:getComputedStyle(flowRoot).getPropertyValue('--ui-agent-flow-play')})`)));
      await key(' ');
      assert(await evaluate(`getComputedStyle(flowLine,flowPseudo).animationPlayState==='running'`),'Keyboard resumes the chase');
    }
    const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    writeFileSync(join(artifacts,'flow-'+width+'-'+mode+'.png'),Buffer.from(shot.data,'base64'));
  }
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  assert(await evaluate(`getComputedStyle(flowLine,flowPseudo).animationName==='none' && getComputedStyle(flowLine,flowPseudo).backgroundImage.includes('gradient')`),'Reduced motion keeps static connections');
  await send('Emulation.setEmulatedMedia',{features:[{name:'forced-colors',value:'active'}]});
  assert(await evaluate(`getComputedStyle(flowLine,flowPseudo).animationName==='none' && getComputedStyle(flowLine,flowPseudo).maskImage==='none' && getComputedStyle(flowLine,flowPseudo).borderLeftStyle==='solid'`),'Forced colors keeps solid visible connections');
  await send('Emulation.setEmulatedMedia',{features:[]});
  await evaluate(`document.querySelector('#task-tree').scrollIntoView({behavior:'instant',block:'start'})`);
  await until(`!flowRoot.hasAttribute('data-ui-agent-visible')`);
  assert(await evaluate(`getComputedStyle(flowLine,flowPseudo).animationPlayState==='paused'`),'Offscreen diagram pauses');
  await evaluate(`flowRoot.scrollIntoView({behavior:'instant',block:'start'})`);await until(`flowRoot.hasAttribute('data-ui-agent-visible')`);
  await evaluate(`Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))`);
  assert(await evaluate(`!flowRoot.hasAttribute('data-ui-agent-visible')`),'Hidden document pauses');
  await evaluate(`delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))`);await until(`flowRoot.hasAttribute('data-ui-agent-visible')`);
  await evaluate(`KavUI.destroy(flowRoot)`);
  assert(await evaluate(`!flowRoot.hasAttribute('data-ui-agent-visible')`),'Destroy restores authored attributes');
  await evaluate(`KavUI.init(flowRoot)`);await until(`flowRoot.hasAttribute('data-ui-agent-visible')`);
  // No runtime: diagrams and connector patterns remain visible and static.
  await send('Network.enable');await send('Network.setBlockedURLs',{urls:['*assets/ui/js/ui.js']});
  await send('Page.navigate',{url:pathToFileURL(documentPath('components/agent-workflow.html')).href});
  await until(`document.readyState==='complete'&&typeof KavUI==='undefined'`);
  assert(await evaluate(`(()=>{const root=document.querySelector('[data-ui-agent-flow]'),line=root.querySelector('.ui-agent-flow > li');return !root.hasAttribute('data-ui-agent-visible')&&getComputedStyle(line,'::after').animationPlayState==='paused'&&getComputedStyle(line,'::after').backgroundImage.includes('gradient');})()`),'CSS-only fallback keeps static connections');
  if(errors.length)throw new Error(errors.join('\n'));
  console.log('PASS: chase frames, pause/resume, 3 diagrams × 3 widths × light/dark; reduced motion, forced colors, offscreen/visibility, destroy/reinit and no-runtime fallback');
  console.log('Screenshots:',artifacts);
} finally {
  clearTimeout(timeout);try{await send('Browser.close',{},null);}catch{}child.kill();await delay(100);
  rmSync(profile,{recursive:true,force:true,maxRetries:5,retryDelay:100});
}
