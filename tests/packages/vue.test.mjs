import {test} from 'node:test';import assert from 'node:assert/strict';import {createSSRApp,h} from 'vue';import {renderToString} from 'vue/server-renderer';

test('Vue: SSR renders props, slots, controlled values and escaped user content',async()=>{
 const {KavButton,KavInput,KavCard,KavIcon,KavDialog}=await import('../../packages/vue/src/index.js');
 const html=await renderToString(createSSRApp({render:()=>h('main',[
 h(KavButton,{variant:'outline',color:'danger',loading:true},{default:()=>'<保存>'}),
 h(KavInput,{modelValue:'hello',name:'title',label:'タイトル'}),
 h(KavCard,{title:'カード'},{default:()=>h('p','本文'),footer:()=>h('span','補足')}),
 h(KavIcon,{name:'mdi-home'}),h(KavDialog,{modelValue:true,title:'確認'},()=>h('p','内容'))])}));
 assert.match(html,/btn-outline-danger/);assert.match(html,/aria-busy="true"/);assert.match(html,/&lt;保存&gt;/);
 assert.match(html,/value="hello"/);assert.match(html,/ui-card-footer/);assert.match(html,/<svg/);assert.match(html,/<dialog/);
 assert.doesNotMatch(html,/<dialog[^>]* open/);
});

test('Vue: every public component renders on a server without browser globals',async()=>{
 const components=await import('../../packages/vue/src/index.js');let count=0;
 for(const [name,component] of Object.entries(components).filter(([name])=>name.startsWith('Kav'))){
  const props=name==='KavWidget'?{html:'<p>既存HTML</p>'}:name==='KavChart'?{config:{labels:['月'],series:[{name:'数',values:[1]}]}}:name==='KavIcon'?{name:'mdi-home'}:name==='KavTabs'?{items:[{value:'one',label:'項目1'}]}:{};
  const result=await renderToString(createSSRApp({render:()=>h(component,props)}));
  assert.equal(typeof result,'string',name);count++;
 }
 assert.ok(count>=24);
});

test('Vue: native aria-label reaches inputs and selects when label prop is omitted',async()=>{
 const {KavInput,KavSelect}=await import('../../packages/vue/src/index.js');
 for(const props of [{},{type:'time'},{type:'date'}]){
  const html=await renderToString(createSSRApp({render:()=>h(KavInput,{...props,'aria-label':'入力の名前'})}));
  assert.match(html,/<input[^>]*aria-label="入力の名前"/);
 }
 const select=await renderToString(createSSRApp({render:()=>h(KavSelect,{'aria-label':'選択の名前',options:['one']})}));
 assert.match(select,/<select[^>]*aria-label="選択の名前"/);
 const override=await renderToString(createSSRApp({render:()=>h(KavInput,{label:'優先する名前','aria-label':'属性の名前'})}));
 assert.match(override,/<input[^>]*aria-label="優先する名前"/);
});

test('Vue: Field descriptions can be referenced from caller-owned input ARIA on the server',async()=>{
 const {KavField,KavInput}=await import('../../packages/vue/src/index.js');
 const html=await renderToString(createSSRApp({render:()=>h(KavField,{label:'メール',for:'email',hint:'業務用アドレス',error:'アドレスを確認'},()=>h(KavInput,{id:'email','aria-describedby':'existing email-hint email-error','aria-invalid':'true'}))}));
 assert.match(html,/<label for="email">メール<\/label>/);
 assert.match(html,/<small[^>]*id="email-hint"[^>]*>業務用アドレス<\/small>/);
 assert.match(html,/<small[^>]*id="email-error"[^>]*role="alert"[^>]*>アドレスを確認<\/small>/);
 assert.match(html,/<input[^>]*aria-describedby="existing email-hint email-error"[^>]*aria-invalid="true"/);
 const custom=await renderToString(createSSRApp({render:()=>h(KavField,{for:'name',hint:'説明',hintId:'custom-hint',error:'エラー',errorId:'custom-error'})}));
 assert.match(custom,/id="custom-hint"/);assert.match(custom,/id="custom-error"/);
});
