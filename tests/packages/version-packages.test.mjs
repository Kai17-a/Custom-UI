import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,copyFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';
test('version preparation synchronizes manifests, internal dependencies and lockfile without tags or publication',()=>{
 const root=mkdtempSync(join(tmpdir(),'kav-version-'));
 const read=path=>JSON.parse(readFileSync(join(root,path),'utf8'));
 const write=(path,data)=>writeFileSync(join(root,path),JSON.stringify(data));
 try{
  mkdirSync(join(root,'scripts'));
  for(const name of ['version-packages.mjs','library-release.mjs'])copyFileSync('scripts/'+name,join(root,'scripts',name));
  write('package.json',{name:'test-workspace',version:'0.0.5',private:true,workspaces:['packages/*','examples/*']});
  const paths=[];
  for(const kind of ['packages','examples'])for(const name of kind==='packages'?['core','vue','astro']:['vue','astro']){
   const path=`${kind}/${name}`;mkdirSync(join(root,path),{recursive:true});paths.push(path);
   write(path+'/package.json',{name:'@kai17-a/kav-ui-'+(kind==='examples'?'example-':'')+name,version:'0.0.5',dependencies:name==='core'?{}:{'@kai17-a/kav-ui-core':'0.0.5'}});
  }
  const invalid=spawnSync(process.execPath,['scripts/version-packages.mjs','v01.2.3'],{cwd:root});
  assert.notEqual(invalid.status,0);assert.equal(read('package.json').version,'0.0.5');
  execFileSync(process.execPath,['scripts/version-packages.mjs','v0.0.6'],{cwd:root,stdio:'pipe'});
  assert.equal(read('package.json').version,'0.0.6');
  const lock=read('package-lock.json');assert.equal(lock.version,'0.0.6');
  for(const path of paths){
   assert.equal(read(path+'/package.json').version,'0.0.6');assert.equal(lock.packages[path].version,'0.0.6');
   if(!path.endsWith('/core'))assert.equal(read(path+'/package.json').dependencies['@kai17-a/kav-ui-core'],'0.0.6');
  }
 }finally{rmSync(root,{recursive:true,force:true});}
});
