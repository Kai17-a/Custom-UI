import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {releasePlan,writeChecksums,verifyChecksums} from '../../scripts/library-release.mjs';

function fixture(version='1.2.3'){
 const root=mkdtempSync(join(tmpdir(),'kav-library-release-')),output=join(root,'dist/packages');mkdirSync(output,{recursive:true});
 writeFileSync(join(root,'package.json'),JSON.stringify({version}));
 for(const name of ['core','vue','astro']){
  const dir=join(root,'packages',name);mkdirSync(dir,{recursive:true});
  writeFileSync(join(dir,'package.json'),JSON.stringify({name:'@kai17-a/kav-ui-'+name,version,dependencies:name==='core'?{}:{'@kai17-a/kav-ui-core':version}}));
  writeFileSync(join(output,`kai17-a-kav-ui-${name}-${version}.tgz`),name+' package');
 }
 return {root,output,clean:()=>rmSync(root,{recursive:true,force:true})};
}
test('library release: dedicated tag, package versions and core dependencies must agree',()=>{
 const f=fixture();try{
  assert.equal(releasePlan('libraries-v1.2.3',f.root).version,'1.2.3');
  for(const tag of ['libraries-v2.0.0','libraries-v01.2.3','libraries-v1.2.3/extra','libraries-v1.2.3;echo bad','libraries-v1.2.3-01','libraries-v1.2.3\n'])assert.throws(()=>releasePlan(tag,f.root));
  const path=join(f.root,'packages/vue/package.json'),manifest=JSON.parse(readFileSync(path));manifest.dependencies['@kai17-a/kav-ui-core']='0.0.1';writeFileSync(path,JSON.stringify(manifest));
  assert.throws(()=>releasePlan('libraries-v1.2.3',f.root),/core/);
 }finally{f.clean();}
});
test('library release: checksums cover exactly three packages and reject tampering/stale files',()=>{
 const f=fixture();try{
  writeChecksums('libraries-v1.2.3',f.root,f.output);verifyChecksums('libraries-v1.2.3',f.root,f.output);
  assert.equal(readFileSync(join(f.output,'SHA256SUMS'),'utf8').trim().split('\n').length,3);
  writeFileSync(join(f.output,'kai17-a-kav-ui-core-1.2.3.tgz'),'tampered');assert.throws(()=>verifyChecksums('libraries-v1.2.3',f.root,f.output),/checksum/i);
  writeChecksums('libraries-v1.2.3',f.root,f.output);writeFileSync(join(f.output,'old.tgz'),'stale');assert.throws(()=>writeChecksums('libraries-v1.2.3',f.root,f.output),/three|unexpected/i);
 }finally{f.clean();}
});
test('library release: prerelease is decided before build metadata',()=>{
 for(const version of ['1.2.3-rc.1','1.2.3+build-4']){
  const f=fixture(version);try{assert.equal(releasePlan('libraries-v'+version,f.root).prerelease,version.includes('-rc.'));}finally{f.clean();}
 }
});
test('release: Kav-UI tag, root version, every package and dependency agree',()=>{
 const version=JSON.parse(readFileSync('package.json')).version;
 assert.equal(releasePlan('v'+version).version,version);
 assert.throws(()=>releasePlan('v999.0.0'),/version/);
 const f=fixture();try{
  const path=join(f.root,'packages/core/package.json'),manifest=JSON.parse(readFileSync(path));
  manifest.version='2.0.0';writeFileSync(path,JSON.stringify(manifest));
  assert.throws(()=>releasePlan('v1.2.3',f.root),/version/);
  writeFileSync(join(f.root,'package.json'),JSON.stringify({version:'2.0.0'}));
  assert.throws(()=>releasePlan('libraries-v1.2.3',f.root),/version/);
 }finally{f.clean();}
});
