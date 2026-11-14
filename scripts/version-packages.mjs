/* Prepare a Kav-UI release commit; never creates tags or publishes. */
import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {releaseVersion,releasePlan} from './library-release.mjs';
const version=releaseVersion(process.argv[2]);
if(!process.argv[2].startsWith('v'))throw new Error('Use the Kav-UI release tag vVERSION');
for(const path of ['package.json',...['core','vue','astro'].map(n=>`packages/${n}/package.json`),...['vue','astro'].map(n=>`examples/${n}/package.json`)]){
 const manifest=JSON.parse(readFileSync(path,'utf8'));manifest.version=version;
 for(const name of Object.keys(manifest.dependencies||{}))if(name.startsWith('@kai17-a/kav-ui-'))manifest.dependencies[name]=version;
 writeFileSync(path,JSON.stringify(manifest,null,2)+'\n');
}
execFileSync('npm',['install','--package-lock-only','--ignore-scripts','--no-audit','--no-fund'],{stdio:'inherit'});
releasePlan('v'+version);
