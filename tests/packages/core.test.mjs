import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('core: SSR import does not access browser globals; shared classes and escaped content', async()=>{
  const core=await import('../../packages/core/src/index.js');
  assert.equal(core.buttonClass({color:'danger',variant:'outline',size:'sm'}),'btn btn-outline-danger btn-sm');
  assert.equal(core.escapeHTML('<button title="x">&'), '&lt;button title=&quot;x&quot;&gt;&amp;');
  assert.ok(core.mdiPaths['mdi-home']);
  assert.equal(typeof core.mount,'function');
  await assert.rejects(core.loadRuntime(),/browser/);
});
test('core: packaged CSS and runtime follow the canonical HTML implementation',async()=>{
  const css=await readFile('packages/core/dist/css/ui.css','utf8');
  assert.equal(css,await readFile('assets/css/ui.css','utf8'));
  const runtime=await readFile('packages/core/dist/runtime.js','utf8');
  assert.match(runtime,/destroy/);
  assert.match(runtime,/Package entry: explicit mounting/);
  assert.doesNotMatch(runtime,/    init\(\);\n    iconObserver/);
});

test('core: layout helpers validate values and preserve breakpoint order',async()=>{
 const {stackClass,clusterClass,flexClass,gridClass,gridItemClass,layoutClasses,headingTag}=await import('../../packages/core/src/shared.js');
 assert.equal(stackClass({gap:{mobile:1,base:4,tablet:3},align:'stretch'}),'ui-stack sp-gap-4 tablet:sp-gap-3 mobile:sp-gap-1 fx-items-stretch');
 assert.equal(clusterClass({gap:0,align:'start',justify:'between'}),'fx fx-wrap fx-min-0 sp-gap-0 fx-justify-between fx-items-start');
 assert.equal(clusterClass(),'ui-cluster');
 assert.equal(flexClass({direction:{base:'row',mobile:'column'},wrap:{base:false,tablet:true},justify:'evenly'}),'fx fx-row mobile:fx-column fx-justify-evenly fx-nowrap tablet:fx-wrap');
 assert.equal(gridClass({cols:{base:3,tablet:2,mobile:1},gap:3}),'fx-grid sp-gap-3 fx-grid-3 tablet:fx-grid-2 mobile:fx-grid-1');
 assert.equal(gridClass({cols:'auto'}),'ui-page-grid');
 assert.equal(gridItemClass({span:{base:6,mobile:12}}),'fx-col-6 mobile:fx-col-12');
 assert.equal(layoutClasses({gap:5,cols:5,span:13,align:'middle',justify:'space-between',direction:'diagonal',wrap:'true'}),'');
 for(const invalid of [null,[],true,NaN,{},()=>{}])assert.equal(layoutClasses({gap:invalid}),'');
 assert.equal(gridClass({cols:{base:'auto',tablet:'auto',mobile:5}}),'fx-grid');
 assert.equal(layoutClasses({gap:{base:0,tablet:5,mobile:2,desktop:4}}),'sp-gap-0 mobile:sp-gap-2');
 assert.equal(headingTag(6),'h6');assert.equal(headingTag(9,2),'h2');
});

test('core: every allowed layout prop emits selectors from canonical imported CSS',async()=>{
 const {resolve,dirname}=await import('node:path');
 const {layoutClasses,stackClass,clusterClass,flexClass,gridClass,gridItemClass}=await import('../../packages/core/src/shared.js');
 const visited=new Set();let css='';
 async function collect(path){if(visited.has(path))return;visited.add(path);const source=await readFile(path,'utf8');css+='\n'+source;for(const match of source.matchAll(/@import\s+url\(["']([^"']+)["']\)/g))await collect(resolve(dirname(path),match[1]));}
 await collect(resolve('assets/css/ui.css'));
 const selectors=new Set([...css.matchAll(/\.((?:\\:|[a-zA-Z_-])(?:\\:|[\w-])*)/g)].map(match=>match[1].replaceAll('\\:',':')));
 const values={gap:[0,1,2,3,4,6,8,12],direction:['row','column'],justify:['start','center','end','between','around','evenly'],align:['start','center','end','stretch','baseline'],wrap:[true,false],cols:[1,2,3,4,6,12],span:Array.from({length:12},(_,i)=>i+1)};
 const check=classes=>{for(const cls of classes.split(/\s+/).filter(Boolean))assert.ok(selectors.has(cls),'missing CSS selector: '+cls);};
 for(const [prop,allowed] of Object.entries(values))for(const value of allowed){
  for(const option of [value,{base:value},{tablet:value},{mobile:value},{base:value,tablet:value,mobile:value}]){
   const props={[prop]:option};check(layoutClasses(props));
   for(const helper of [stackClass,clusterClass,flexClass,gridClass,gridItemClass])check(helper(props));
  }
 }
 check(gridClass({cols:'auto'}));
 for(const cls of ['ui-layout','ui-page','ui-page-with-aside','ui-page-with-rail','ui-page-aside','ui-page-aside-sticky','ui-page-rail','ui-page-body','ui-page-header','ui-page-heading','ui-page-eyebrow','ui-page-title','ui-page-description','ui-page-actions','ui-toolbar','ui-toolbar-group','ui-toolbar-end','ui-section','ui-section-header','ui-section-title','ui-section-description'])check(cls);
 assert.match(css,/\.sp-gap-3\s*\{[^}]*gap:[^}]*!important/);
});
