// Renders the skill's layout recipes with the real ui.css/ui.js and checks that the
// recommended markup stays inside its box at phone/tablet/desktop widths, while the
// NG examples really do break. Usage: node tests/run-layout-recipes-browser.mjs
import {spawn} from 'node:child_process';
import {existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync} from 'node:fs';
import {homedir, tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cache = join(homedir(), '.cache/ms-playwright');
const cached = existsSync(cache) ? readdirSync(cache).filter(name => name.startsWith('chromium_headless_shell-')).sort().reverse().map(name => join(cache, name, 'chrome-headless-shell-linux64/chrome-headless-shell')) : [];
const executable = [process.env.CHROME_BIN, '/usr/bin/chromium', '/usr/bin/chromium-browser', ...cached].find(path => path && existsSync(path));
if (!executable) throw new Error('Chromium is required');

const recipes = readFileSync(join(root, 'skills/kav-ui/references/layout-recipes.md'), 'utf8');
const blocks = [...recipes.matchAll(/```html\n([\s\S]*?)```/g)].map(match => match[1]);
const good = blocks.filter(block => !block.startsWith('<!-- NG:'));
const bad = blocks.filter(block => block.startsWith('<!-- NG:'));
const work = mkdtempSync(join(tmpdir(), 'kav-ui-layout-recipes-'));
const asset = path => pathToFileURL(join(root, 'assets', path)).href;
function page(name, list) {
  const sections = list.map((block, index) => `<section class="recipe" data-recipe="${index}">${block}</section>`).join('\n');
  writeFileSync(join(work, name), `<!doctype html><html lang="ja" data-bs-theme="light"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="${asset('css/ui.css')}">
<style>.recipe{padding:16px;border-bottom:1px dashed #999}</style><script defer src="${asset('js/ui.js')}"></script></head>
<body>${sections}</body></html>`);
  return pathToFileURL(join(work, name)).href;
}
const goodUrl = page('good.html', good);
const badUrl = page('bad.html', bad);

const profile = mkdtempSync(join(tmpdir(), 'kav-ui-layout-recipes-profile-'));
const child = spawn(executable, ['--no-sandbox', '--disable-dev-shm-usage', '--disable-background-networking', '--allow-file-access-from-files', '--remote-debugging-pipe', '--user-data-dir=' + profile], {stdio: ['ignore', 'ignore', 'pipe', 'pipe', 'pipe']});
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
async function navigate(url) {
  await send('Page.navigate', {url});
  for (let i = 0; i < 100; i++) {
    await delay(30);
    if (await evaluate('document.readyState === "complete"')) return;
  }
  throw new Error('Page load timed out: ' + url);
}

// Elements that leave their recipe box, ignoring content inside scroll/clip containers.
const escapes = `(()=>{
  const out=[];
  for (const section of document.querySelectorAll('.recipe')) {
    const box=section.getBoundingClientRect();
    for (const element of section.querySelectorAll('*')) {
      let clipped=false;
      for (let node=element.parentElement; node && node!==section; node=node.parentElement) {
        if (getComputedStyle(node).overflowX !== 'visible') { clipped=true; break; }
      }
      const rect=element.getBoundingClientRect();
      if (clipped || !rect.width) continue;
      if (rect.right > box.right + 1 || rect.left < box.left - 1)
        out.push(section.dataset.recipe + ': ' + element.outerHTML.slice(0, 90));
    }
  }
  return out;
})()`;
const rect = selector => `(document.querySelector(${JSON.stringify(selector)})?.getBoundingClientRect().toJSON())`;
const beside = (a, b) => `(()=>{const x=${rect(a)},y=${rect(b)};return x&&y&&y.left>=x.right-1&&y.top<x.bottom-1})()`;
const below = (a, b) => `(()=>{const x=${rect(a)},y=${rect(b)};return x&&y&&y.top>=x.bottom-1})()`;

const timeout = setTimeout(() => { child.kill(); process.exitCode = 1; }, 60000);
try {
  const {targetId} = await send('Target.createTarget', {url: 'about:blank'}, null);
  ({sessionId: session} = await send('Target.attachToTarget', {targetId, flatten: true}, null));
  await send('Runtime.enable');
  await send('Page.enable');

  for (const width of [390, 820, 1440]) {
    await send('Emulation.setDeviceMetricsOverride', {width, height: 900, deviceScaleFactor: 1, mobile: width < 768});
    await navigate(goodUrl);
    assert(!await evaluate('document.documentElement.scrollWidth > innerWidth + 1'), `Horizontal page overflow at ${width}`);
    const escaped = await evaluate(escapes);
    assert(!escaped.length, `Recipe content overflows at ${width}:\n${escaped.join('\n')}`);

    const columns = await evaluate(`(()=>{const items=[...document.querySelector('.fx-grid-3').children];return items.filter(item=>Math.abs(item.getBoundingClientRect().top-items[0].getBoundingClientRect().top)<2).length})()`);
    assert(columns === (width >= 1024 ? 3 : width >= 768 ? 2 : 1), `Card grid shows ${columns} columns at ${width}`);
    const truncated = await evaluate(`(()=>{const p=document.querySelector('.fx-flex-1.fx-min-0 > .type-truncate');return p.scrollWidth>p.clientWidth||p.closest('.recipe').clientWidth>500})()`);
    assert(truncated, `Long file name must be truncated at ${width}`);
    if (width >= 768) {
      assert(await evaluate(beside('label[for="member-email"]', '#member-email')), `Label and input must share a row at ${width}`);
      assert(await evaluate(beside('.fx-col-8', '.fx-col-4')), `8:4 columns must share a row at ${width}`);
      assert(await evaluate(beside('.ui-card-header .ui-card-title', '.ui-card-header .badge')), `Card title and badge must share a row at ${width}`);
    } else {
      assert(await evaluate(below('label[for="member-email"]', '#member-email')), `Label must stack above the input at ${width}`);
      assert(await evaluate(below('.fx-col-8', '.fx-col-4')), `8:4 columns must stack at ${width}`);
    }
    if (width === 1440) assert(await evaluate(beside('.ui-page-heading', '.ui-page-actions')), 'Page actions must sit beside the heading');
  }

  await send('Emulation.setDeviceMetricsOverride', {width: 1440, height: 900, deviceScaleFactor: 1, mobile: false});
  await navigate(badUrl);
  const recipe = (rule, selector) => `[...document.querySelectorAll('.recipe')].find(s=>s.innerHTML.includes('NG: ${rule}'))?.querySelector(${JSON.stringify(selector)})`;
  const ngHeader = await evaluate(`(()=>{const b=${recipe('foreign-class', '.btn')},s=b.closest('.recipe');return s.getBoundingClientRect().right-16-b.getBoundingClientRect().right})()`);
  assert(ngHeader > 100, `NG header button should not reach the right edge (gap ${ngHeader})`);
  assert(await evaluate(`(()=>{const t=${recipe('missing-flex-container', '.ui-card-title')}.getBoundingClientRect(),b=${recipe('missing-flex-container', '.badge')}.getBoundingClientRect();return b.top>=t.bottom-1})()`), 'NG card header should stack');
  assert(await evaluate(`(()=>{const a=${recipe('column-outside-grid', '.fx-col-8')}.getBoundingClientRect(),b=${recipe('column-outside-grid', '.fx-col-4')}.getBoundingClientRect();return b.top>=a.bottom-1})()`), 'NG columns should stack');
  await send('Emulation.setDeviceMetricsOverride', {width: 390, height: 900, deviceScaleFactor: 1, mobile: true});
  await navigate(badUrl);
  assert(await evaluate(`(()=>{const b=${recipe('flex-item-overflow', '.btn')}.getBoundingClientRect(),s=${recipe('flex-item-overflow', '.btn')}.closest('.recipe').getBoundingClientRect();return b.right>s.right-16+1||b.height>60})()`), 'NG growing item should push out or squash the button');

  console.log(`PASS: ${good.length} layout recipes fit at 390/820/1440px; ${bad.length} NG examples reproduce their breakage`);
} finally {
  clearTimeout(timeout);
  try { await send('Browser.close', {}, null); } catch {}
  child.kill();
  await delay(100);
  rmSync(profile, {recursive: true, force: true, maxRetries: 5, retryDelay: 100});
  rmSync(work, {recursive: true, force: true});
}
