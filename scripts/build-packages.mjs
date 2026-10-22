/* Optional package maintainer build; standard Node only. HTML/ZIP users need no build. */
import {readFile,writeFile,mkdir,cp,rm} from 'node:fs/promises';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const output=join(root,'packages/core/dist');await rm(output,{recursive:true,force:true});await mkdir(output,{recursive:true});
const visited=new Set();
async function copyCSS(name){
 if(visited.has(name))return;visited.add(name);
 const source=join(root,'assets/css',name),css=await readFile(source,'utf8');
 for(const match of css.matchAll(/@import\s+url\(["']([^"']+)["']\)/g)){
  const dependency=join(dirname(name),match[1]);if(dependency.startsWith('..'))throw new Error('CSS dependency escapes source');await copyCSS(dependency);
 }
 const target=join(output,'css',name);await mkdir(dirname(target),{recursive:true});await writeFile(target,css);
}
await copyCSS('ui.css');
await cp(join(root,'assets/js/theme-init.js'),join(output,'theme-init.js'));
const ui=await readFile(join(root,'assets/js/ui.js'),'utf8');
const marker='    init();\n    iconObserver.observe';
if(!ui.includes(marker)||!ui.includes('destroy,'))throw new Error('Runtime must expose destroy and an explicit boot init point');
await writeFile(join(output,'runtime.js'),ui.replace(marker,'    // Package entry: explicit mounting owns component initialization.\n    iconObserver.observe'));
const begin=ui.indexOf('const mdiPaths = Object.freeze('),end=ui.indexOf('\n});',begin);
if(begin<0||end<0)throw new Error('MDI source not found');
const paths=JSON.parse(ui.slice(begin+'const mdiPaths = Object.freeze('.length,end+2));
await writeFile(join(output,'icons.js'),'// Generated from assets/js/ui.js; MDI Apache-2.0 notices in MDI-LICENSE and Apache-2.0.txt.\nexport const mdiPaths=Object.freeze('+JSON.stringify(paths)+');\n');
await cp(join(root,'assets/icons/mdi/LICENSE'),join(output,'MDI-LICENSE'));
await cp(join(root,'assets/icons/mdi/Apache-2.0.txt'),join(output,'Apache-2.0.txt'));
await cp(join(root,'assets/icons/mdi/README.md'),join(output,'MDI-README.md'));
await cp(join(root,'assets/vendor/material-color-utilities'),join(output,'licenses/material-color-utilities'),{recursive:true});
console.log('Built @kav-ui/core from canonical CSS/runtime and '+Object.keys(paths).length+' MDI icons.');
