/* Maintainer only: node scripts/bundle-material-colors.mjs (Node 24+, no npm).
   Applications consume the generated ui.js without imports or a build step. */
import {readFileSync, writeFileSync, readdirSync} from 'node:fs';
import {dirname, join, relative, resolve, posix} from 'node:path';
import {fileURLToPath} from 'node:url';
import {stripTypeScriptTypes} from 'node:module';
const root=resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source=join(root,'vendor/material-color-utilities');
const files=readdirSync(source,{recursive:true}).filter(path=>path.endsWith('.ts')).sort();
const modules=files.map(path=>{
  const id=path.replaceAll('\\','/').replace(/\.ts$/,'');
  let js=stripTypeScriptTypes(readFileSync(join(source,path),'utf8'),{mode:'transform'});
  js=js.replace(/^import\s+(\*\s+as\s+\w+|\{[^}]+\})\s+from\s+['"]([^'"]+)['"];?/gm,(_,binding,dependency)=>{
    const dependencyId=posix.normalize(posix.join(posix.dirname(id),dependency)).replace(/\.js$/,'');
    return 'const '+binding.replace(/^\*\s+as\s+/,'')+' = require('+JSON.stringify(dependencyId)+');';
  });
  const names=[...js.matchAll(/^export\s+(?:class|function|const|let|var)\s+(\w+)/gm)].map(match=>match[1]);
  js=js.replace(/^export\s+/gm,'');
  if(/^\s*(import|export)\s/m.test(js))throw new Error('Unsupported module syntax in '+path);
  return JSON.stringify(id)+': (require) => {\n'+js+'\nreturn {'+names.join(',')+'};\n}';
});
const begin='  // BEGIN BUNDLED MATERIAL COLOR UTILITIES';
const end='  // END BUNDLED MATERIAL COLOR UTILITIES';
const bundle=begin+`\n  // Apache-2.0, Google LLC; notices: assets/vendor/material-color-utilities.\n  const materialColors = (() => {\n    const modules = {\n${modules.join(',\n')}\n    };\n    const cache = new Map();\n    function require(id) {\n      if (!cache.has(id)) cache.set(id,modules[id](require));\n      return cache.get(id);\n    }\n    return require('hct/hct');\n  })();\n`+end;
const target=join(root,'assets/js/ui.js');let ui=readFileSync(target,'utf8');
if(ui.includes(begin))ui=ui.slice(0,ui.indexOf(begin))+bundle+ui.slice(ui.indexOf(end)+end.length);
else ui=ui.replace('  // Palette hue is independent',bundle+'\n  // Palette hue is independent');
writeFileSync(target,ui);
console.log('Bundled '+files.length+' official Material HCT modules into '+relative(root,target));
