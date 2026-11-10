import {spawn} from 'node:child_process';
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
// Text squeezed into a column narrower than two characters wraps one character per line.
const squeezedText=`[...document.querySelectorAll('main :is(p,li,h1,h2,h3,h4,h5,h6,dt,dd,summary,label,strong,a,button,td,th)')].filter(el=>{const text=el.textContent.trim();if(text.length<4||!el.getClientRects().length)return false;const r=el.getBoundingClientRect(),size=parseFloat(getComputedStyle(el).fontSize);return r.width>0&&r.width<size*2&&r.height>size*4;}).map(el=>el.tagName+':'+el.textContent.trim().slice(0,12))`;
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
  // Right after a viewport or theme change the layout can still move under load,
  // so wait until the measured point actually hits the element.
  const box=await evaluate(`(async()=>{const el=document.querySelector(${JSON.stringify(selector)});let point;for(let i=0;i<10;i++){el.scrollIntoView({behavior:"instant",block:'center'});await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));const r=el.getBoundingClientRect();point={x:r.x+r.width/2,y:r.y+r.height/2};const hit=document.elementFromPoint(point.x,point.y);if(hit&&el.contains(hit))break;}return point;})()`);
  await send('Input.dispatchMouseEvent',{type:'mousePressed',...box,button:'left',clickCount:1});
  await send('Input.dispatchMouseEvent',{type:'mouseReleased',...box,button:'left',clickCount:1});
}
const timeout=setTimeout(()=>{console.error('Browser checks timed out');child.kill();process.exitCode=1;},600000);
try {
  const {targetId}=await send('Target.createTarget',{url:'about:blank'},null);
  ({sessionId:session}=await send('Target.attachToTarget',{targetId,flatten:true},null));
  await send('Runtime.enable');await send('Page.enable');
  const {check}=await import(pathToFileURL(resolve(process.argv[2])).href);
  await check({navigate,evaluate,click,key,send});
  if(errors.length)throw new Error(errors.join('\n'));
  console.log('PASS',process.argv[2]);
} finally {
  clearTimeout(timeout);
  try {await send('Browser.close',{},null);} catch {}
  child.kill();await delay(100);
  rmSync(profile,{recursive:true,force:true,maxRetries:5,retryDelay:100});
}
