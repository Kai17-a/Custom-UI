// Shared fixtures keep the two adapters' public contract in sync.
export const layoutCases=[
 ['KavStack',{gap:{base:4,tablet:3,mobile:1},align:'stretch',as:'article'},['default']],
 ['KavCluster',{gap:0,align:'start',justify:{base:'between',mobile:'center'},as:'nav'},['default']],
 ['KavFlex',{direction:{base:'row',mobile:'column'},justify:'evenly',align:'baseline',wrap:{base:false,tablet:true},gap:2},['default']],
 ['KavGrid',{cols:{base:3,tablet:2,mobile:1},gap:{base:6,mobile:2}},['default']],
 ['KavGrid',{cols:'auto'},['default']],
 ['KavGridItem',{span:{base:6,mobile:12},as:'article'},['default']],
 ['KavPageHeader',{title:'Title',description:'Description',eyebrow:'Eyebrow',level:3},['default','actions']],
 ['KavPageHeader',{title:'Title'},['default']],
 ['KavPageHeader',{title:'Title',level:9},['default']],
 ['KavSection',{title:'Title'},['default']],
 ['KavToolbar',{label:'Tools'},['default','end']],
 ['KavSection',{title:'Title',description:'Description',level:4},['default','actions']],
 ['KavPage',{asideLabel:'Navigation',railLabel:'Details',stickyAside:true},['default','aside','rail']],
 ['KavPage',{},['default']],
 ['KavPage',{},['default','rail']],
 ['KavPage',{},['default','aside']],
 ['KavSection',{},['default']],
 ['KavToolbar',{},['default']],
 ['KavFlex',{gap:5,direction:'bad',wrap:'bad'},['default']]
];
export function assertLayout(assert,html,name,props,slots){
 assert.match(html,/id="layout-test"/);assert.match(html,/data-layout="yes"/);assert.match(html,/aria-describedby="help"/);assert.match(html,/class="[^"]*custom/);
 for(const slot of slots)assert.match(html,new RegExp('>'+slot+'<'));
 if(name==='KavPageHeader'){assert.match(html,new RegExp('<h'+([1,2,3,4,5,6].includes(props.level)?props.level:1)+'\\b[^>]*class="ui-page-title"'));if(props.eyebrow)assert.match(html,/ui-page-eyebrow/);assert.equal(/ui-page-actions/.test(html),slots.includes('actions'));}
 if(name==='KavSection'&&props.title){assert.match(html,new RegExp('<h'+(props.level||2)+'\\b[^>]*class="ui-section-title"'));assert.match(html,/ui-section-header/);}
 if(name==='KavToolbar'){
  assert.equal(/role="group"/.test(html),Boolean(props.label));
  if(props.label)assert.match(html,/aria-label="Tools"/);
  assert.equal(/ui-toolbar-end/.test(html),slots.includes('end'));
 }
 if(name==='KavPage'){
  assert.equal(/ui-page-with-aside/.test(html),slots.includes('aside'));assert.equal(/ui-page-with-rail/.test(html),slots.includes('rail'));
  assert.equal((html.match(/<aside\b/g)||[]).length,slots.filter(slot=>slot!=='default').length);
  if(props.stickyAside){assert.match(html,/ui-page-aside-sticky/);assert.match(html,/aria-label="Navigation"/);assert.match(html,/aria-label="Details"/);}
 }
 if(props.as)assert.match(html,new RegExp('^<'+props.as+'\\b'));
}
export function classStructure(html){return [...html.matchAll(/<([a-z][\w-]*)\b([^>]*)>/g)].map(([,tag,attrs])=>[tag,(attrs.match(/\bclass="([^"]*)"/)?.[1]||'').trim().split(/\s+/).filter(Boolean)]);}
