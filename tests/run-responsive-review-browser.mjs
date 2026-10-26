import {spawn} from 'node:child_process';
import {existsSync, mkdtempSync, readdirSync, rmSync} from 'node:fs';
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

const timeout = setTimeout(() => { child.kill(); process.exitCode = 1; }, 60000);
try {
  const {targetId} = await send('Target.createTarget', {url: 'about:blank'}, null);
  ({sessionId: session} = await send('Target.attachToTarget', {targetId, flatten: true}, null));
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Network.enable');

  for (const width of [768, 1024, 1279, 1440]) {
    await send('Emulation.setDeviceMetricsOverride', {width, height: 900, deviceScaleFactor: 1, mobile: false});
    await navigate('components/ai-visuals.html');
    const state = await evaluate(`(()=>({open:document.querySelector('.catalog-page-toc').open,mainTop:document.querySelector('main').getBoundingClientRect().top,overflow:document.documentElement.scrollWidth>innerWidth+1}))()`);
    assert(state.open === (width >= 1280), `TOC state at ${width}: ${JSON.stringify(state)}`);
    assert(width >= 1280 || state.mainTop < 220, `Page title follows an oversized TOC at ${width}: ${state.mainTop}`);
    assert(!state.overflow, `Horizontal overflow at ${width}`);
    if (width === 768) {
      await evaluate(`document.querySelector('.catalog-page-toc > summary').focus()`);
      await key('Enter');
      const opened = await evaluate(`({open:document.querySelector('.catalog-page-toc').open,visible:!!document.querySelector('.catalog-toc-link').getClientRects().length,focused:document.activeElement?.outerHTML.slice(0,120)})`);
      assert(opened.open && opened.visible, `Tablet TOC must open with Enter: ${JSON.stringify(opened)}`);
    }
  }

  await send('Emulation.setDeviceMetricsOverride', {width: 320, height: 900, deviceScaleFactor: 1, mobile: true});
  await send('Emulation.setTouchEmulationEnabled', {enabled: true, maxTouchPoints: 1});
  await navigate('components/ai-visuals.html');
  assert(await evaluate(`matchMedia('(pointer: coarse)').matches`), 'Touch emulation must use coarse pointer');
  const touch = await evaluate(`(()=>{document.querySelector('.catalog-mobile-menu').open=true;document.querySelector('.catalog-navigation').open=true;document.querySelectorAll('.catalog-nav-category,.catalog-nav-branch').forEach(item=>item.open=true);const controls=[...document.querySelectorAll('.catalog-sidebar nav a,.catalog-sidebar nav summary')].filter(item=>item.getClientRects().length);return {count:controls.length,short:controls.filter(item=>item.getBoundingClientRect().height<44).slice(0,5).map(item=>[item.textContent.trim(),item.getBoundingClientRect().height])};})()`);
  assert(touch.count >= 46 && !touch.short.length, `Touch menu targets below 44px: ${JSON.stringify(touch)}`);

  for (const path of ['dashboard.html', 'docs.html', 'changelog.html', 'error-403.html', 'error-404.html', 'error-500.html', 'error-503.html']) {
    await navigate('templates/' + path);
    const labels = await evaluate(`[...document.querySelectorAll('.template-palette-label > span:first-child,.template-design-label > span:first-child')].map(item=>({text:item.textContent.trim(),visible:!!item.getClientRects().length}))`);
    assert(labels.length === 2 && labels.every(item => item.visible) && labels[0].text !== labels[1].text, `Theme controls need distinct visible labels in ${path}: ${JSON.stringify(labels)}`);
    assert(await evaluate(`document.documentElement.scrollWidth<=innerWidth+1`), `Template overflow in ${path}`);
  }

  await send('Network.setBlockedURLs', {urls: ['*.js']});
  await navigate('components/ai-visuals.html');
  const fallback = await evaluate(`(()=>({menu:document.querySelector('.catalog-navigation')?.open,mainTop:document.querySelector('main').getBoundingClientRect().top,links:document.querySelectorAll('.catalog-sidebar nav a').length,script:typeof KavUI}))()`);
  assert(fallback.script === 'undefined' && fallback.menu === false && fallback.links >= 46 && fallback.mainTop < 900, `No-JS mobile navigation: ${JSON.stringify(fallback)}`);
  await evaluate(`document.querySelector('.catalog-navigation > summary').focus()`);
  await key('Enter');
  assert(await evaluate(`document.querySelector('.catalog-navigation').open && !!document.querySelector('.catalog-sidebar nav a').getClientRects().length`), 'No-JS menu opens with Enter');

  await send('Emulation.setDeviceMetricsOverride', {width: 1440, height: 900, deviceScaleFactor: 1, mobile: false});
  await send('Emulation.setTouchEmulationEnabled', {enabled: false});
  await navigate('components/ai-visuals.html');
  await evaluate(`document.querySelector('.catalog-navigation > summary').focus()`);
  await key('Enter');
  const desktopFallback = await evaluate(`(()=>{const link=document.querySelector('.catalog-sidebar nav a');link.focus();return {visible:!!link.getClientRects().length,focused:document.activeElement===link,menu:document.querySelector('.catalog-navigation').open}})()`);
  assert(desktopFallback.visible && desktopFallback.focused && desktopFallback.menu, `No-JS desktop navigation must be keyboard reachable: ${JSON.stringify(desktopFallback)}`);

  console.log('PASS: tablet TOC, mobile no-JS navigation, touch targets, visible template labels, responsive overflow');
} finally {
  clearTimeout(timeout);
  try { await send('Browser.close', {}, null); } catch {}
  child.kill();
  await delay(100);
  rmSync(profile, {recursive: true, force: true, maxRetries: 5, retryDelay: 100});
}
