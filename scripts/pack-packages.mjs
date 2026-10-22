import {tmpdir} from 'node:os';import {join} from 'node:path';
/* Create local tarballs only; publishing is a separate, explicit maintainer action. */
import {mkdir} from 'node:fs/promises';import {execFileSync} from 'node:child_process';
await mkdir('dist/packages',{recursive:true});
for(const name of ['core','vue','astro'])execFileSync('npm',['pack','--workspace','@kav-ui/'+name,'--pack-destination','dist/packages','--ignore-scripts','--cache',join(tmpdir(),'kav-ui-package-pack-cache')],{stdio:'inherit'});
