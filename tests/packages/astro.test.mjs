import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {transform} from '@astrojs/compiler-rs';
import {experimental_AstroContainer as AstroContainer} from 'astro/container';

// Compile local Astro imports recursively; data: modules need absolute JS URLs.
const compiledURLs=new Map();
async function compileAstro(sourceURL){
 const key=sourceURL.href;
 if(!compiledURLs.has(key)){
  // CSS side effects belong to Astro's bundler and have no role in container SSR.
  const source=(await readFile(sourceURL,'utf8')).replace(/^import\s*(['"])[^'"]+\.css\1\s*;?/gm,'');
  const {code}=transform(source,{filename:sourceURL.pathname,internalURL:import.meta.resolve('astro/compiler-runtime'),resolvePath:specifier=>specifier});
  let resolvedCode=code;
  for(const [statement,prefix,quote,specifier] of code.matchAll(/(\bfrom\s*)(['"])([^'"]+)\2/g)){
   const resolved=specifier.endsWith('.astro')?await compileAstro(new URL(specifier,sourceURL)):specifier.startsWith('.')?new URL(specifier,sourceURL).href:import.meta.resolve(specifier);
   resolvedCode=resolvedCode.replace(statement,prefix+quote+resolved+quote);
  }
  compiledURLs.set(key,'data:text/javascript;base64,'+Buffer.from(resolvedCode).toString('base64'));
 }
 return compiledURLs.get(key);
}
async function loadAstroComponent(sourceURL){
 return (await import(await compileAstro(sourceURL))).default;
}

test('Astro: chart SSR keeps external labels inside its JSON script and preserves their values',async()=>{
  const sourceURL=new URL('../../packages/astro/src/components/KavChart.astro',import.meta.url);
  const source=await readFile(sourceURL,'utf8');
  const {code}=transform(source,{
    filename:sourceURL.pathname,
    internalURL:import.meta.resolve('astro/compiler-runtime'),
    resolvePath:specifier=>specifier
  });
  const {default:KavChart}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
  const container=await AstroContainer.create();
  const config={
    type:'bar',
    labels:['</script><img src=x onerror=alert(1)>','</ScRiPt><script>alert(2)</script>','日本語 < & " \\'],
    series:[{name:'<利用者>',values:[1,2,3]}]
  };
  const html=await container.renderToString(KavChart,{props:{config}});
  const match=html.match(/<script type="application\/json" data-ui-chart-data>([\s\S]*?)<\/script>/i);
  assert.ok(match,'the SSR output contains chart JSON');
  assert.doesNotMatch(match[1],/</,'JSON cannot contain an HTML script closing tag or injected markup');
  assert.deepEqual(JSON.parse(match[1]),config,'JSON decoding preserves labels and series names');
  assert.doesNotMatch(html,/<img\b|<script>alert/i,'external labels do not become HTML elements');
});

test('Astro: Field exposes stable and overridable description IDs in static HTML',async()=>{
  const sourceURL=new URL('../../packages/astro/src/components/KavField.astro',import.meta.url);
  const {code}=transform(await readFile(sourceURL,'utf8'),{filename:sourceURL.pathname,internalURL:import.meta.resolve('astro/compiler-runtime'),resolvePath:specifier=>specifier});
  const {default:KavField}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
  const container=await AstroContainer.create();
  const html=await container.renderToString(KavField,{props:{for:'email',label:'メール',hint:'説明',error:'入力を確認'}});
  assert.match(html,/<label for="email">メール<\/label>/);
  assert.match(html,/<small[^>]*id="email-hint"[^>]*>説明<\/small>/);
  assert.match(html,/<small[^>]*id="email-error"[^>]*role="alert"[^>]*>入力を確認<\/small>/);
  const custom=await container.renderToString(KavField,{props:{for:'email',hint:'説明',hintId:'custom-hint',error:'入力を確認',errorId:'custom-error'}});
  assert.match(custom,/id="custom-hint"/);assert.match(custom,/id="custom-error"/);
});

test('Astro: layout structure and classes match Vue for identical props and slots',async()=>{
 const {createSSRApp,h}=await import('vue');const {renderToString}=await import('vue/server-renderer');
 const vue=await import('../../packages/vue/src/index.js');
 const {layoutCases,assertLayout,classStructure}=await import('./layout-cases.mjs');
 const container=await AstroContainer.create(),compiled=new Map();
 for(const [name,props,slotNames] of layoutCases){
  if(!compiled.has(name)){
   const sourceURL=new URL('../../packages/astro/src/components/'+name+'.astro',import.meta.url);
   compiled.set(name,await loadAstroComponent(sourceURL));
  }
  const attributes={...props,id:'layout-test',class:'custom','data-layout':'yes','aria-describedby':'help'};
  const html=await container.renderToString(compiled.get(name),{props:attributes,slots:Object.fromEntries(slotNames.map(slot=>[slot,'<span>'+slot+'</span>']))});
  assertLayout(assert,html,name,props,slotNames);
  const vueHTML=await renderToString(createSSRApp({render:()=>h(vue[name],attributes,Object.fromEntries(slotNames.map(slot=>[slot,()=>h('span',slot)])))}));
  assert.deepEqual(classStructure(html),classStructure(vueHTML),name+' class structure');
 }
});

test('Astro: every public component renders caller class once and preserves native attributes',async t=>{
 const indexURL=new URL('../../packages/astro/src/index.js',import.meta.url);
 const exports=[...(await readFile(indexURL,'utf8')).matchAll(/export\s*\{default as (\w+)\}\s*from\s*['"]([^'"]+)['"]/g)];
 assert.ok(exports.length>0,'the public Astro entry point exports components');
 const container=await AstroContainer.create();
 for(const [,name,path] of exports){
  await t.test(name,async()=>{
   const component=await loadAstroComponent(new URL(path,indexURL));
   const required=name==='KavWidget'?{html:'<p>既存HTML</p>'}:name==='KavChart'?{config:{labels:['月'],series:[{name:'数',values:[1]}]}}:name==='KavIcon'?{name:'mdi-home'}:{};
   // Exercise both input targets, including the datepicker's nested input.
   for(const variant of name==='KavInput'?[{},{type:'date'}]:[{}]){
    const html=await container.renderToString(component,{props:{...required,...variant,class:'kav-test-class',id:'kav-test-id','data-kav-test':'yes','aria-describedby':'kav-test-help'},slots:{default:'<span data-provider-slot>内容</span>'}});
    const classes=[...html.matchAll(/\bclass="([^"]*)"/g)].flatMap(match=>match[1].split(/\s+/));
    if(name==='KavProvider'){
     // Provider only renders its slot; it has no element to receive attributes.
     assert.equal(classes.filter(value=>value==='kav-test-class').length,0);
     assert.doesNotMatch(html,/id="kav-test-id"|data-kav-test="yes"/);
     assert.match(html,/data-provider-slot/);
     continue;
    }
    assert.equal(classes.filter(value=>value==='kav-test-class').length,1,name+' caller class occurs once');
    const target=[...html.matchAll(/<[a-z][^>]*>/gi)].map(match=>match[0]).find(tag=>/\bclass="[^"]*\bkav-test-class\b/.test(tag));
    assert.ok(target,name+' has a class target');
    assert.match(target,/\bclass="(?:[^" ]+\s+)*kav-test-class"/,name+' caller class follows component classes');
    assert.match(target,/\bid="kav-test-id"/,name+' preserves id on the class target');
    assert.match(target,/\bdata-kav-test="yes"/,name+' preserves data attributes on the class target');
    assert.match(target,/\baria-describedby="kav-test-help"/,name+' preserves ARIA on the class target');
   }
  });
 }
});
