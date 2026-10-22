import {defineComponent,h,ref} from 'vue';
import {KavButton,KavBanner,KavInput,KavSelect,KavCheckbox,KavField,KavCard,KavDialog,KavTabs,KavSidebar,KavWidget,KavCalendar,KavChart,toast,setColorTheme} from '@kav-ui/vue';
export default defineComponent({name:'KavExample',setup(){
 const name=ref('Kav-UI'),selection=ref(1),checked=ref(false),date=ref('2026-10-23'),open=ref(false),notice=ref(true),tab=ref('overview'),widget=ref(true);
 const bind=state=>({'modelValue':state.value,'onUpdate:modelValue':value=>state.value=value});
 return ()=>h('div',[
 h('header',{class:'ui-header'},[h('div',{class:'ui-container ui-header-inner'},[h('a',{href:'/',class:'ui-brand'},'Kav-UI / Vue'),h(KavButton,{color:'secondary',variant:'ghost',icon:'mdi-weather-night',onClick:()=>setColorTheme(document.documentElement.dataset.bsTheme==='dark'?'light':'dark')},()=> 'テーマ切替')])]),
 h(KavSidebar,{title:'Workspace',items:[{label:'概要',href:'#vue-main',icon:'mdi-home',active:true},{label:'ドキュメント',href:'#vue-docs',icon:'mdi-information-outline'}],tablet:'rail',desktop:'rail'}, {default:()=>h('main',{id:'vue-main',class:'sp-p-4'},[
 h('h1','Vueコンポーネント'),h('p','既存のデザインを属性・スロット・v-modelで利用できます。'),
 h(KavBanner,{...bind(notice),title:'パッケージ版',closable:true,'data-testid':'vue-banner'},()=> '共通スタイルを使ったVue用コンポーネントです。'),
 h(KavCard,{title:'設定',class:'sp-mt-4'},{default:()=>h('div',{class:'ui-stack sp-gap-4'},[
 h(KavField,{label:'名前',for:'vue-name'},()=>h(KavInput,{...bind(name),id:'vue-name',name:'name','data-testid':'vue-input'})),
 h(KavSelect,{...bind(selection),label:'プラン',name:'plan',options:[{value:1,label:'個人'},{value:2,label:'チーム'}],'data-testid':'vue-select'}),
 h(KavCheckbox,{...bind(checked),label:'通知を受け取る','data-testid':'vue-checkbox'}),
 h(KavInput,{...bind(date),type:'date',name:'date',label:'日付','data-testid':'vue-date'}),
 h('pre',{'data-testid':'vue-state'},JSON.stringify({name:name.value,plan:selection.value,checked:checked.value,date:date.value},null,2)),
 h(KavButton,{onClick:()=>open.value=true,'data-testid':'vue-open'},()=> 'モーダルを開く'),
 h(KavButton,{variant:'outline',onClick:()=>toast({title:'保存しました',body:name.value,variant:'success'})},()=> '通知を表示')]),footer:()=>h('p','イベントと入力値はVueで管理します。')}),
 h(KavDialog,{...bind(open),title:'確認','data-testid':'vue-dialog'},{default:()=>h('p','入力内容：'+name.value),footer:()=>h(KavButton,{onClick:()=>open.value=false},()=> '閉じる')}),
 h(KavTabs,{...bind(tab),class:'sp-mt-4',items:[{value:'overview',label:'概要'},{value:'details',label:'詳細'}]}, {overview:()=>h('p','概要の内容'),details:()=>h('p','詳細の内容')}),
 h('h2',{id:'vue-docs',class:'sp-mt-4'},'既存HTMLの利用と破棄'),
 h(KavButton,{variant:'outline','data-testid':'vue-widget-toggle',onClick:()=>widget.value=!widget.value},()=>widget.value?'既存部品を削除':'既存部品を再作成'),
 widget.value?h(KavWidget,{'data-testid':'vue-widget',html:'<label>既存の選択欄<select class="form-select"><option>個人</option><option>チーム</option></select></label><figure data-ui-chart="line"><script type="application/json" data-ui-chart-data>{"labels":["月","火"],"series":[{"name":"利用者","values":[10,20]}]}</script></figure>'}):null,
 h(KavCalendar,{...bind(date),month:'2026-10','data-testid':'vue-calendar',class:'sp-mt-4'}),h(KavChart,{'data-testid':'vue-chart',config:{labels:['月','火','水'],series:[{name:'利用者',values:[12,18,24]}]}})
 ])})]);
}});
