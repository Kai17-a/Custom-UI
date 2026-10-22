import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('core: SSR import does not access browser globals; shared classes and escaped content', async()=>{
  const core=await import('../../packages/core/src/index.js');
  assert.equal(core.buttonClass({color:'danger',variant:'outline',size:'sm'}),'btn btn-outline-danger btn-sm');
  assert.equal(core.escapeHTML('<button title="x">&'), '&lt;button title=&quot;x&quot;&gt;&amp;');
  assert.ok(core.mdiPaths['mdi-home']);
  assert.equal(typeof core.mount,'function');
  await assert.rejects(core.loadRuntime(),/browser/);
});
test('core: packaged CSS and runtime follow the canonical HTML implementation',async()=>{
  const css=await readFile('packages/core/dist/css/ui.css','utf8');
  assert.equal(css,await readFile('assets/css/ui.css','utf8'));
  const runtime=await readFile('packages/core/dist/runtime.js','utf8');
  assert.match(runtime,/destroy/);
  assert.match(runtime,/Package entry: explicit mounting/);
  assert.doesNotMatch(runtime,/    init\(\);\n    iconObserver/);
});
