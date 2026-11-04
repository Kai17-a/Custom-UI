import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {transform} from '@astrojs/compiler-rs';
import {experimental_AstroContainer as AstroContainer} from 'astro/container';

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
   const {code}=transform(await readFile(sourceURL,'utf8'),{filename:sourceURL.pathname,internalURL:import.meta.resolve('astro/compiler-runtime'),resolvePath:specifier=>specifier});
   const resolvedCode=code.replace(/(\bfrom\s*)(['"])([^'"]+)\2/g,(_,prefix,quote,specifier)=>prefix+quote+import.meta.resolve(specifier)+quote);
   compiled.set(name,(await import('data:text/javascript;base64,'+Buffer.from(resolvedCode).toString('base64'))).default);
  }
  const attributes={...props,id:'layout-test',class:'custom','data-layout':'yes','aria-describedby':'help'};
  const html=await container.renderToString(compiled.get(name),{props:attributes,slots:Object.fromEntries(slotNames.map(slot=>[slot,'<span>'+slot+'</span>']))});
  assertLayout(assert,html,name,props,slotNames);
  const vueHTML=await renderToString(createSSRApp({render:()=>h(vue[name],attributes,Object.fromEntries(slotNames.map(slot=>[slot,()=>h('span',slot)])))}));
  assert.deepEqual(classStructure(html),classStructure(vueHTML),name+' class structure');
 }
});
