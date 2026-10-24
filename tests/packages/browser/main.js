import {createApp,h,ref,nextTick} from 'vue';
import {KavInput,KavSelect,KavTabs,KavSidebar,KavTextarea,KavWidget,KavCheckbox,KavRadio,KavSwitch} from '@kav-ui/vue';
import '@kav-ui/core/style.css';
const date=ref('2026-10-20'),choice=ref(1),items=ref([]),selected=ref(),overlay=ref(true),body=ref('Initial body'),tag=ref('div'),checked=ref(true),radio=ref('one'),enabled=ref(true),timeModel=ref('09:30');
const extraVisible=ref(true);
const extraHTML='<div data-ui-command><input data-ui-command-input aria-label=Search><div data-ui-command-list><button type=button data-ui-command-item data-ui-value=one>One</button><button type=button data-ui-command-item data-ui-value=two>Two</button></div></div><div class=ui-carousel data-ui-carousel aria-label=Slides><div class=ui-carousel-viewport data-ui-carousel-viewport><section class=ui-carousel-slide>First</section><section class=ui-carousel-slide>Second</section></div><button type=button data-ui-carousel-next>Next</button></div><div data-ui-data-table data-ui-page-size=0><input data-ui-table-search aria-label=Filter><table><thead><tr><th><button type=button data-ui-table-sort=number>Number</button></th></tr></thead><tbody><tr><td>10</td></tr><tr><td>2</td></tr></tbody></table></div>';
let focused=0,blurred=0,keyed=0,committedInputs=0,committedChanges=0;
const bind=state=>({modelValue:state.value,'onUpdate:modelValue':value=>state.value=value});
createApp({setup:()=>()=>h('main',[
 extraVisible.value?h(KavWidget,{id:'extra-components',html:extraHTML}):null,
 h('form',{id:'reset-form'},[
  h(KavInput,{...bind(date),type:'date',name:'date'}),
  h(KavCheckbox,{...bind(checked),name:'checked',label:'Check'}),
  h(KavRadio,{...bind(radio),name:'radio',value:'one',label:'One'}),h(KavRadio,{...bind(radio),name:'radio',value:'two',label:'Two'}),
  h(KavSwitch,{...bind(enabled),name:'enabled',label:'Switch'}),
  h(KavTextarea,{...bind(body),name:'body'}),
  h(KavSelect,{...bind(choice),name:'choice',options:[{value:1,label:'One'},{value:2,label:'Two'}]})
 ]),
 h(KavInput,{...bind(timeModel),type:'time',name:'time','aria-label':'Time of day',onInput:()=>committedInputs++,onChange:()=>committedChanges++,onFocus:()=>focused++,onBlur:()=>blurred++,onKeydown:()=>keyed++}),
 h('form',{id:'external-form'}),h(KavSelect,{form:'external-form',name:'external','aria-label':'External choice',modelValue:'one',options:['one','two']}),
 h(KavWidget,{id:'changing-host',as:tag.value,html:'<select class="form-select"><option>One</option></select>'}),
 h(KavTabs,{...bind(selected),items:items.value}),
 h(KavSidebar,{...bind(overlay),desktop:'top',title:'Initially open menu'},()=>h('p','Body'))
])}).mount('#app');
const wait=()=>new Promise(resolve=>setTimeout(resolve,30));
const assert=(value,message)=>{if(!value)throw new Error(message);};
window.runPackageRegressions=async()=>{
 await nextTick();await wait();
 assert(document.querySelector('.ui-sidebar-dialog').open,'Initial top sidebar must be visible');
 overlay.value=false;await nextTick();
 date.value='2026-10-25';choice.value=2;body.value='Edited body';await nextTick();await wait();
 const form=document.getElementById('reset-form');form.elements.checked.click();form.querySelector('[value=two]').click();form.elements.enabled.click();await nextTick();
 assert(!checked.value&&radio.value==='two'&&!enabled.value,'Check controls must change before reset');
 form.reset();await nextTick();await wait();
 assert(checked.value&&radio.value==='one'&&enabled.value&&form.elements.checked.checked&&form.querySelector('[value=one]').checked&&form.elements.enabled.checked,'Check/radio/switch reset restores initial models and DOM');
 const time=document.querySelector('input[name=time]');time.focus();time.dispatchEvent(new KeyboardEvent('keydown',{key:'Shift',bubbles:true}));document.activeElement.blur();
 assert(focused===1&&blurred===1&&keyed===1,'Enhanced inputs forward native focus, blur and keydown handlers '+JSON.stringify({focused,blurred,keyed,active:document.activeElement.outerHTML.slice(0,100)}));
 assert(time.getAttribute('aria-label')==='Time of day'&&time.closest('.ui-input-picker').querySelector('.ui-input-picker-trigger').getAttribute('aria-label').startsWith('Time of day：'),'Input aria-label reaches its enhanced trigger');
 assert(document.querySelector('select[name=external]').closest('.ui-select').querySelector('.ui-select-trigger').getAttribute('aria-label')==='External choice','Select aria-label reaches its enhanced trigger');
 const picker=time.closest('.ui-input-picker'),trigger=picker.querySelector('.ui-input-picker-trigger');
 const draftHour=()=>{const hour=picker.querySelector('[data-ui-picker-part=hour]');hour.value='10';hour.dispatchEvent(new Event('input',{bubbles:true}));hour.dispatchEvent(new Event('change',{bubbles:true}));};
 trigger.click();await wait();draftHour();await nextTick();
 assert(timeModel.value==='09:30'&&time.value==='09:30'&&committedInputs===0&&committedChanges===0,'Draft picker changes must not update the model or emit committed input/change');
 [...picker.querySelectorAll('.ui-input-popup button')].find(button=>button.textContent==='キャンセル').click();await nextTick();
 assert(timeModel.value==='09:30'&&time.value==='09:30','Cancelling a picker preserves the committed value');
 trigger.click();await wait();draftHour();picker.querySelector('[data-ui-picker-apply]').click();await nextTick();
 assert(timeModel.value==='10:30'&&time.value==='10:30'&&committedInputs===1&&committedChanges===1,'Applying a picker updates the model and emits each committed event once');
 assert(date.value==='2026-10-20'&&form.elements.date.value===date.value,'Date reset must synchronize model and DOM');
 assert(body.value==='Initial body'&&form.elements.body.value===body.value,'Textarea reset must synchronize model and DOM');
 assert(new FormData(document.getElementById('external-form')).get('external')==='one','Select forwards its external form association');
 const oldHost=document.getElementById('changing-host'),oldSelect=oldHost.querySelector('select');tag.value='section';await nextTick();await wait();
 assert(document.querySelector('section#changing-host .ui-select-trigger'),'Widget must initialize a replacement host');
 assert(!oldHost.querySelector('.ui-select-trigger')&&!oldSelect.classList.contains('ui-select-native'),'Widget must dispose its replaced host');
 assert(choice.value===1&&form.elements.choice.value==='1','Select reset must retain the numeric model type');
 date.value='2026-10-26';choice.value=2;await nextTick();
 form.addEventListener('reset',e=>e.preventDefault(),{once:true});form.reset();await wait();
 assert(date.value==='2026-10-26'&&choice.value===2,'Cancelled reset must preserve models');
 items.value=[{value:'disabled',label:'Disabled',disabled:true},{value:'first',label:'First'},{value:'second',label:'Second'}];await nextTick();
 assert(selected.value==='first','Async tabs must select the first enabled item');
 assert(document.querySelector('[role=tab][tabindex="0"]').textContent==='First','Async tabs must be reachable by keyboard');
 items.value=[{value:'disabled',label:'Disabled',disabled:true},{value:'second',label:'Second'}];await nextTick();
 assert(selected.value==='second','Removing the active tab must select an available tab');
 items.value=[];await nextTick();items.value=[{value:'last',label:'Last'}];await nextTick();
 assert(selected.value==='last','Empty tabs must recover when repopulated');
 const extra=document.querySelector('#extra-components'),search=extra.querySelector('input'),slides=extra.querySelector('[data-ui-carousel]');
 assert(search.getAttribute('role')==='combobox'&&slides.hasAttribute('data-ui-carousel-ready'),'Widget initializes command and carousel');
 let commandSelection;extra.addEventListener('ui:commandselect',event=>commandSelection=event.detail.value);
 search.value='Two';search.dispatchEvent(new Event('input',{bubbles:true}));search.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));
 assert(commandSelection==='two','Widget forwards searchable command selection');
 slides.querySelector('[data-ui-carousel-next]').click();assert(slides.dataset.uiCarouselIndex==='1','Widget carousel control works');
 const dataTable=extra.querySelector('[data-ui-data-table]');
 dataTable.querySelector('[data-ui-table-sort]').click();
 assert([...dataTable.querySelectorAll('tbody tr:not([data-ui-table-empty])')].map(row=>row.textContent).join()==='2,10','Widget initializes data table sorting');
 const filter=dataTable.querySelector('[data-ui-table-search]');filter.value='10';filter.dispatchEvent(new Event('input',{bubbles:true}));
 assert([...dataTable.querySelectorAll('tbody tr:not([data-ui-table-empty])')].filter(row=>!row.hidden).map(row=>row.textContent).join()==='10','Widget data table search works');
 extraVisible.value=false;await nextTick();await wait();
 assert(!dataTable.hasAttribute('data-ui-table-ready')&&!dataTable.querySelector('[data-ui-table-empty]'),'Widget disposes data table state');
 assert(!search.hasAttribute('role')&&!slides.hasAttribute('data-ui-carousel-ready')&&!slides.querySelector('.ui-carousel-slide').inert,'Widget teardown restores command/carousel attributes');
 return 'PASS: form reset, async tabs, initial overlay sidebar, Command/Carousel/Data table widget mount/events/disposal';
};
