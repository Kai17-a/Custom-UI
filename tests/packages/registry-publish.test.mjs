import {test} from 'node:test';
import assert from 'node:assert/strict';
import {publishPackages} from '../../scripts/publish-packages.mjs';
const plan={packages:['core','vue','astro'].map(n=>({name:'@kai17-a/kav-ui-'+n,file:n+'.tgz'})),version:'0.0.5'};
const ok=value=>({status:0,stdout:JSON.stringify(value)});
const missing={status:1,stdout:JSON.stringify({error:{code:'E404'}})};
test('registry: publish missing packages in dependency order; skip existing versions',()=>{
 const calls=[];
 publishPackages(plan,(args)=>{calls.push(args);return args[0]==='view'?(args[1].includes('-vue@')?ok('0.0.5'):missing):ok('');});
 assert.deepEqual(calls.filter(a=>a[0]==='publish').map(a=>a[1]),['dist/packages/core.tgz','dist/packages/astro.tgz']);
 assert.ok(calls.every(a=>a.includes('--registry=https://npm.pkg.github.com')));
});
test('registry: auth/network failure aborts without publishing',()=>{
 for(const code of ['E401','E403','E500','ECONNRESET']){
  const calls=[];
  assert.throws(()=>publishPackages(plan,args=>{calls.push(args);return {status:1,stdout:JSON.stringify({error:{code}})};}));
  assert.equal(calls.length,1);
 }
});
test('registry: a concurrent publication is accepted only after confirming the exact version',()=>{
 let count=0;
 publishPackages(plan,args=>args[0]==='publish'?{status:1}:++count===1?missing:ok('0.0.5'));
 assert.throws(()=>publishPackages(plan,args=>args[0]==='publish'?{status:1}:missing));
});
