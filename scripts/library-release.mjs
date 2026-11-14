/* Release metadata/checksums only; no network access or registry publication. */
import {readFileSync,readdirSync,lstatSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const project=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const names=['core','vue','astro'];
const numeric='(?:0|[1-9][0-9]*)';
const identifier='(?:0|[1-9][0-9]*|[0-9A-Za-z-]*[A-Za-z-][0-9A-Za-z-]*)';
const tagPattern=new RegExp(`^v(${numeric}\\.${numeric}\\.${numeric}(?:-${identifier}(?:\\.${identifier})*)?(?:\\+[0-9A-Za-z-]+(?:\\.[0-9A-Za-z-]+)*)?)$`);
export function releaseVersion(tag){
 const match=typeof tag==='string'&&tag.length<=128&&tag.match(tagPattern);
 if(!match||match[0]!==tag)throw new Error('Use vVERSION');
 return match[1];
}
export function releasePlan(tag,root=project){
 const version=releaseVersion(tag);
 if(JSON.parse(readFileSync(join(root,'package.json'),'utf8')).version!==version)throw new Error('Root version must match '+tag);
 const packages=names.map(name=>{
  const manifest=JSON.parse(readFileSync(join(root,'packages',name,'package.json'),'utf8'));
  if(manifest.name!==`@kai17-a/kav-ui-${name}`||manifest.version!==version)throw new Error(`${name}: package name/version must match ${tag}`);
  if(name!=='core'&&manifest.dependencies?.['@kai17-a/kav-ui-core']!==version)throw new Error(`${name}: @kai17-a/kav-ui-core dependency must be ${version}`);
  return {name:manifest.name,file:`kai17-a-kav-ui-${name}-${version}.tgz`};
 });
 return {version,packages,prerelease:version.split('+')[0].includes('-')};
}
function checksumText(tag,root,output){
 const {packages}=releasePlan(tag,root),expected=packages.map(p=>p.file).sort();
 const actual=readdirSync(output).filter(file=>file.endsWith('.tgz')).sort();
 if(JSON.stringify(actual)!==JSON.stringify(expected))throw new Error('Expected exactly three versioned packages; missing or unexpected tarballs');
 return packages.map(({file})=>{
  const path=join(output,file);
  if(!lstatSync(path).isFile())throw new Error(`Not a regular package file: ${file}`);
  return createHash('sha256').update(readFileSync(path)).digest('hex')+'  '+file+'\n';
 }).join('');
}
export function writeChecksums(tag,root=project,output=join(root,'dist/packages')){
 const text=checksumText(tag,root,output);writeFileSync(join(output,'SHA256SUMS'),text);
}
export function verifyChecksums(tag,root=project,output=join(root,'dist/packages')){
 const expected=checksumText(tag,root,output);
 if(readFileSync(join(output,'SHA256SUMS'),'utf8')!==expected)throw new Error('Package checksum mismatch');
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 try{
  const [command,tag]=process.argv.slice(2);
  if(command==='validate')console.log(releasePlan(tag).version);
  else if(command==='checksums')writeChecksums(tag);
  else if(command==='verify')verifyChecksums(tag);
  else throw new Error('Usage: node scripts/library-release.mjs validate|checksums|verify vVERSION');
 }catch(error){console.error(error.message);process.exitCode=1;}
}
