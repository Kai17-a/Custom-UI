/* Visual regression for structure-only changes. Uses installed Chromium, no npm dependencies.
   Set CHROME_BIN if Chromium is not installed in one of the detected locations. */
import {spawn} from 'node:child_process';
import {inflateSync} from 'node:zlib';
import {existsSync, mkdtempSync, readdirSync, readFileSync, writeFileSync, rmSync, mkdirSync} from 'node:fs';
import {homedir, tmpdir} from 'node:os';
import {join, resolve, dirname} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [mode,folder]=process.argv.slice(2);
if(!['capture','compare'].includes(mode)||!folder)throw new Error('Usage: node tests/run-visual-comparison.mjs capture|compare /tmp/baseline');
const destination=resolve(folder);mkdirSync(destination,{recursive:true});
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
const site=existsSync(join(root,'docs/index.html'))?join(root,'docs'):root;
const pages=['index.html','components/buttons.html','components/forms.html','components/cards.html','components/navigation.html','components/loading.html','components/splitter.html','components/toasts.html','templates/dashboard.html'];

// Chromium may round a few antialiased border pixels differently across runs.
// Report these separately; shifts, broad color changes and missing content fail.
function pngPixels(buffer) {
 const width=buffer.readUInt32BE(16),height=buffer.readUInt32BE(20),depth=buffer[24],type=buffer[25];
 if(depth!==8||![2,6].includes(type))throw new Error('Expected Chromium RGB/RGBA 8-bit PNG');
 const channels=type===2?3:4,stride=width*channels,chunks=[];
 for(let offset=8;offset<buffer.length;){const size=buffer.readUInt32BE(offset);if(buffer.toString('ascii',offset+4,offset+8)==='IDAT')chunks.push(buffer.subarray(offset+8,offset+8+size));offset+=size+12;}
 const raw=inflateSync(Buffer.concat(chunks)),pixels=Buffer.alloc(stride*height);
 const paeth=(a,b,c)=>{const p=a+b-c,x=Math.abs(p-a),y=Math.abs(p-b),z=Math.abs(p-c);return x<=y&&x<=z?a:y<=z?b:c;};
 for(let y=0;y<height;y++){
  const filter=raw[y*(stride+1)];if(filter>4)throw new Error('Unknown PNG row filter');
  for(let x=0;x<stride;x++){
   const i=y*stride+x,a=x>=channels?pixels[i-channels]:0,b=y?pixels[i-stride]:0,c=y&&x>=channels?pixels[i-stride-channels]:0;
   const prediction=filter===0?0:filter===1?a:filter===2?b:filter===3?Math.floor((a+b)/2):paeth(a,b,c);
   pixels[i]=(raw[y*(stride+1)+1+x]+prediction)&255;
  }
 }
 return {width,height,channels,pixels};
}
function pixelDifference(before,after){
 const a=pngPixels(before),b=pngPixels(after);if(a.width!==b.width||a.height!==b.height||a.channels!==b.channels)return null;
 let changed=0,maximum=0;
 for(let i=0;i<a.pixels.length;i+=a.channels){let different=false;for(let j=0;j<a.channels;j++){const delta=Math.abs(a.pixels[i+j]-b.pixels[i+j]);maximum=Math.max(maximum,delta);different ||= delta>0;}if(different)changed++;}
 return {pixels:changed,maxChannelDelta:maximum,minor:maximum<=2&&changed<=Math.max(50,a.width*a.height*.0001)};
}

const report={mode,scenarios:0,differences:[],minorDifferences:[],artifacts};
const timeout=setTimeout(()=>{child.kill();process.exitCode=1;},300000);
try {
 const {targetId}=await send('Target.createTarget',{url:'about:blank'},null);({sessionId:session}=await send('Target.attachToTarget',{targetId,flatten:true},null));
 await send('Runtime.enable');await send('Page.enable');
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'},{name:'prefers-color-scheme',value:'light'}]});
 await send('Page.addScriptToEvaluateOnNewDocument',{source:"localStorage.clear();document.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent='*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}';document.head.append(s);},{once:true});"});
 for(const width of [390,820,1440])for(const page of pages){
  await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:pathToFileURL(join(site,page)).href});
  let ready=false;for(let i=0;i<200;i++){await delay(20);if(await evaluate('document.readyState==="complete"&&typeof KavUI!=="undefined"')){ready=true;break;}}
  if(!ready)throw new Error('Page failed to load: '+page);
  for(const color of ['light','dark'])for(const design of ['default','glass','glassmorphism']){
   await evaluate(`KavUI.setColorTheme('${color}');KavUI.setDesignTheme('${design}');scrollTo(0,0)`);
   await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:0,y:0});await delay(70);
   const {data}=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
   const filename=page.replaceAll('/','-').replace('.html','')+'-'+width+'-'+color+'-'+design+'.png';
   const bytes=Buffer.from(data,'base64');
   if(mode==='capture')writeFileSync(join(destination,filename),bytes);
   else if(!existsSync(join(destination,filename)))report.differences.push(filename);
   else {const baseline=readFileSync(join(destination,filename));if(!baseline.equals(bytes)){const difference=pixelDifference(baseline,bytes);if(difference?.minor)report.minorDifferences.push({file:filename,...difference});else report.differences.push(filename);writeFileSync(join(artifacts,filename),bytes);}}
   report.scenarios++;
  }
 }
 if(errors.length)throw new Error(errors.join('\n'));
 console.log(JSON.stringify(report,null,2));
 if(report.differences.length)process.exitCode=1;
} finally {
 clearTimeout(timeout);try{await send('Browser.close',{},null);}catch{}child.kill();await delay(100);rmSync(profile,{recursive:true,force:true,maxRetries:5,retryDelay:100});
}
