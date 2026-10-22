import {tmpdir} from 'node:os';import {join} from 'node:path';
import {test} from 'node:test';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';import {readFile} from 'node:fs/promises';
test('distribution: runtime CSS imports resolve; catalog assets do not leak into the core package',async()=>{
 const result=JSON.parse(execFileSync('npm',['pack','--workspace','@kav-ui/core','--dry-run','--ignore-scripts','--json','--cache',join(tmpdir(),'kav-ui-package-test-cache')],{encoding:'utf8'}))[0];
 const files=new Set(result.files.map(f=>f.path));assert.ok(files.has('dist/css/ui.css'));assert.ok(files.has('dist/runtime.js'));assert.ok(files.has('dist/MDI-LICENSE'));assert.ok(files.has('dist/licenses/material-color-utilities/LICENSE'));
 assert.ok(!files.has('dist/css/catalog.css'));assert.ok(!files.has('dist/css/layout.css'));
 for(const name of files)if(name.endsWith('.css')){const css=await readFile('packages/core/'+name,'utf8');for(const match of css.matchAll(/@import\s+url\(["']([^"']+)["']\)/g)){const path=await import('node:path');assert.ok(files.has(path.posix.join(path.posix.dirname(name),match[1])),name+' resolves '+match[1]);}}
});
test('distribution: Vue and Astro exports, types and private publication boundary are included',async()=>{
 for(const name of ['vue','astro']){
  const result=JSON.parse(execFileSync('npm',['pack','--workspace','@kav-ui/'+name,'--dry-run','--ignore-scripts','--json','--cache',join(tmpdir(),'kav-ui-package-test-cache')],{encoding:'utf8'}))[0];
  const files=new Set(result.files.map(f=>f.path));assert.ok(files.has('src/index.js'));assert.ok(files.has('src/index.d.ts'));
  const manifest=JSON.parse(await readFile('packages/'+name+'/package.json','utf8'));assert.equal(manifest.dependencies['@kav-ui/core'],'0.1.0');assert.equal(manifest.private,true);
  if(name==='astro')assert.ok(files.has('src/components/KavSidebar.astro'));
 }
});
