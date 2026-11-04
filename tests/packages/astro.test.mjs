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

async function compileComponent(name){
 const sourceURL=new URL('../../packages/astro/src/components/'+name+'.astro',import.meta.url);
 const {code}=transform(await readFile(sourceURL,'utf8'),{filename:sourceURL.pathname,internalURL:import.meta.resolve('astro/compiler-runtime'),resolvePath:specifier=>specifier});
 const resolvedCode=code.replace(/(\bfrom\s*)(['"])([^'"]+)\2/g,(_,prefix,quote,specifier)=>prefix+quote+import.meta.resolve(specifier)+quote);
 return (await import('data:text/javascript;base64,'+Buffer.from(resolvedCode).toString('base64'))).default;
}

test('Astro: Tabs renders named slots, stable ARIA links, selection and outer attributes',async()=>{
 const KavTabs=await compileComponent('KavTabs'),container=await AstroContainer.create();
 const items=[{value:'blocked',label:'無効',disabled:true},{value:'overview',label:'概要'},{value:'activity',label:'履歴'}];
 const render=props=>container.renderToString(KavTabs,{props:{items,...props},slots:{overview:'<strong>概要の本文</strong>',activity:'<p>履歴の本文</p>'}});
 const html=await render({id:'projects',label:'プロジェクト',class:'custom','data-test':'tabs','aria-describedby':'help'});
 const root=html.match(/<div\b[^>]*>/)[0];
 assert.equal((root.match(/\bclass=/g)||[]).length,1);assert.match(root,/class="custom"/);
 assert.match(root,/data-test="tabs"/);assert.match(root,/aria-describedby="help"/);assert.match(root,/data-ui-tabs/);assert.match(root,/data-kav-ui-widget/);
 assert.match(html,/role="tablist" aria-label="プロジェクト"/);
 assert.match(html,/<button[^>]*id="projects-tab-0"[^>]*disabled[^>]*aria-selected="false"/);
 assert.match(html,/<button[^>]*role="tab"[^>]*data-ui-toggle="tab"[^>]*data-ui-target="overview"[^>]*aria-selected="true"[^>]*aria-controls="projects-panel-1"[^>]*tabindex="0"/);
 assert.match(html,/<div[^>]*data-ui-panel="overview"[^>]*role="tabpanel"[^>]*id="projects-panel-1"[^>]*aria-labelledby="projects-tab-1"[^>]*tabindex="0"><strong>概要の本文<\/strong><\/div>/);
 assert.match(html,/<div[^>]*data-ui-panel="activity"[^>]*hidden[^>]*><p>履歴の本文<\/p><\/div>/);
 const selected=await render({value:'activity'});
 assert.match(selected,/<button[^>]*data-ui-target="activity"[^>]*aria-selected="true"/);
 for(const value of ['blocked','missing'])assert.match(await render({value}),/<button[^>]*data-ui-target="overview"[^>]*aria-selected="true"/);
 const first=await render({}),second=await render({});
 assert.equal(first.match(/id="([^"]+)-tab-0"/)[1],second.match(/id="([^"]+)-tab-0"/)[1]);
 const disabled=await render({items:[items[0]]});assert.doesNotMatch(disabled,/aria-selected="true"/);assert.match(disabled,/<div[^>]*role="tabpanel"[^>]*hidden/);
 assert.doesNotMatch(await render({items:[]}),/role="tab"|role="tabpanel"/);
});

test('Astro: Drawer matches HTML drawer regions and forwards attributes with one class',async()=>{
 const KavDrawer=await compileComponent('KavDrawer'),container=await AstroContainer.create();
 for(const placement of [undefined,'start','end','top','bottom']){
  const html=await container.renderToString(KavDrawer,{props:{id:'drawer',title:'設定',placement,class:'custom','data-test':'drawer','aria-describedby':'help'},slots:{default:'<p>本文</p>',footer:'<button data-ui-dismiss="dialog">閉じる</button>'}});
  const dialog=html.match(/<dialog\b[^>]*>/)[0];
  assert.equal((dialog.match(/\bclass=/g)||[]).length,1);
  assert.match(dialog,new RegExp('class="ui-dialog ui-drawer ui-drawer-'+(placement??'end')+' custom"'));
  assert.match(dialog,/id="drawer"/);assert.match(dialog,/data-ui-dialog/);assert.match(dialog,/data-test="drawer"/);assert.match(dialog,/aria-describedby="help"/);assert.match(dialog,/aria-labelledby="drawer-title"/);assert.doesNotMatch(dialog,/\bopen\b/);
  assert.match(html,/data-kav-ui-widget/);assert.match(html,/<header class="ui-drawer-header"><h2 id="drawer-title">設定<\/h2><button[^>]*type="button"[^>]*data-ui-dismiss="dialog"[^>]*aria-label="閉じる"[^>]*><span[^>]*icon="mdi-close"[^>]*aria-hidden="true"[^>]*><\/span><\/button><\/header>/);
  assert.match(html,/<div class="ui-drawer-body"><p>本文<\/p><\/div>/);assert.match(html,/<footer class="ui-drawer-footer"><button data-ui-dismiss="dialog">閉じる<\/button><\/footer>/);
 }
 const plain=await container.renderToString(KavDrawer,{props:{id:'plain','aria-label':'属性の名前'}});
 assert.match(plain,/aria-label="属性の名前"/);assert.doesNotMatch(plain,/<header|<footer|aria-labelledby=/);
 const labelled=await container.renderToString(KavDrawer,{props:{id:'labelled',label:'優先する名前','aria-label':'属性の名前'}});
 assert.match(labelled,/aria-label="優先する名前"/);
});
