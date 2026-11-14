/* Registry publication only. Build, test, pack and checksum verification run first. */
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {releasePlan,verifyChecksums} from './library-release.mjs';
const registry='--registry=https://npm.pkg.github.com';
export function publishPackages(plan,run=args=>spawnSync('npm',args,{encoding:'utf8'})){
 function exists(name){
  const result=run(['view',`${name}@${plan.version}`,'version','--json',registry]);
  let data;try{data=JSON.parse(result.stdout);}catch{throw new Error(`Cannot query ${name}; registry response was not JSON`);}
  if(result.status===0&&data===plan.version)return true;
  if(result.status!==0&&data?.error?.code==='E404')return false;
  throw new Error(`Cannot query ${name}; check registry access or service availability`);
 }
 for(const {name,file} of plan.packages){
  if(exists(name)){console.log(`Skip ${name}@${plan.version}: already published`);continue;}
  const result=run(['publish',`dist/packages/${file}`,'--ignore-scripts','--access=restricted',...(plan.prerelease?['--tag=next']:[]),registry]);
  if(result.status!==0&&!exists(name))throw new Error(`Publication failed: ${name}`);
  console.log(`Available: ${name}@${plan.version}`);
 }
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 try{
  const tag=process.argv[2];
  if(!tag?.startsWith('v'))throw new Error('Registry publication requires a Kav-UI vVERSION tag');
  const plan=releasePlan(tag);verifyChecksums(tag);publishPackages(plan);
 }catch(error){console.error(error.message);process.exitCode=1;}
}
