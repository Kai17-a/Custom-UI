// Public select synchronization and width utilities, exercised in the shared Chromium session.
export async function checkSelect({navigate, evaluate, click, key, send}) {
  await navigate('components/forms.html');
  const preInit = await evaluate(`(()=>{
    const select=document.createElement('select');select.id='sync-test';select.className='form-select ui-w-auto';
    select.innerHTML='<option value="list">並べる</option><option value="stack">子タスクを重ねて表示する</option>';
    window.selectEvents={input:0,change:0};for(const type of ['input','change'])select.addEventListener(type,()=>selectEvents[type]++);
    select.value='stack';KavUI.sync(select);
    const host=document.createElement('div');host.id='select-test';host.className='ui-toolbar';
    host.innerHTML='<div class="ui-toolbar-group"><label for="sync-test">表示方法</label></div><div class="ui-toolbar-group"><button type="button" class="btn">適用</button></div>';
    host.firstElementChild.append(select);document.querySelector('main').prepend(host);KavUI.init(host);
    return select.nextElementSibling.textContent;
  })()`);
  if(preInit!=='子タスクを重ねて表示する')throw new Error('Select pre-init value/sync');
  await click('#select-test .ui-select-trigger');
  if(!await evaluate(`(()=>{const s=document.querySelector('#sync-test');s.value='list';KavUI.sync(s);const p=s.closest('.ui-select').querySelector('.ui-select-menu');return s.nextElementSibling.textContent==='並べる'&&p.matches(':popover-open')&&p.querySelector('[aria-selected="true"]').textContent==='並べる'&&p.querySelectorAll('[aria-selected="true"]').length===1&&selectEvents.input===0&&selectEvents.change===0;})()`))throw new Error('Select sync text/open selection/events '+JSON.stringify(await evaluate(`({text:document.querySelector('#sync-test').nextElementSibling.textContent,open:!!document.querySelector('#select-test .ui-select-menu:popover-open'),events:selectEvents,selected:[...document.querySelectorAll('#select-test [aria-selected=true]')].map(e=>e.textContent)})`)));
  await key('Escape');
  for(const width of [1280,768,390]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    const result=await evaluate(`(()=>{
      const s=document.querySelector('#sync-test'),w=s.closest('.ui-select'),host=document.querySelector('#select-test'),label=host.querySelector('label'),next=host.lastElementChild;
      s.value='list';KavUI.sync(s);const before=w.getBoundingClientRect(),adjacent=next.getBoundingClientRect();
      s.value='stack';KavUI.sync(s);const after=w.getBoundingClientRect(),l=label.getBoundingClientRect(),n=next.getBoundingClientRect();
      return {transferred:w.classList.contains('ui-w-auto'),compact:after.width<host.clientWidth*.85,min:after.width>=96,stable:Math.abs(before.width-after.width)<1&&Math.abs(adjacent.x-n.x)<1&&Math.abs(adjacent.y-n.y)<1,row:l.bottom>after.top&&l.top<after.bottom,wrap:innerWidth!==390||n.top>=host.firstElementChild.getBoundingClientRect().bottom,overflow:host.scrollWidth>host.clientWidth};
    })()`);
    if(!result.transferred||!result.compact||!result.min||!result.stable||!result.row||!result.wrap||result.overflow)throw new Error('Select toolbar @'+width+' '+JSON.stringify(result));
    for(const classes of ['ui-w-full','ui-w-full tablet:ui-w-auto mobile:ui-w-auto','ui-w-auto tablet:ui-w-full mobile:ui-w-full','w-auto']) {
      const geometry=await evaluate(`(()=>{const host=document.createElement('div');host.style.width='320px';const s=document.createElement('select');s.className='form-select '+${JSON.stringify(classes)};s.innerHTML='<option>短い</option><option>少し長い項目</option>';host.append(s);document.body.append(host);KavUI.init(host);const w=s.closest('.ui-select'),r=w.getBoundingClientRect(),result={width:r.width,classes:[...w.classList]};KavUI.destroy(host);host.remove();return result;})()`);
      const full=classes==='ui-w-full'||(classes.startsWith('ui-w-full ')?width>=1024:classes.startsWith('ui-w-auto ')?width<1024:false);
      if((full?Math.abs(geometry.width-320)>1:geometry.width>=310)||!classes.split(' ').every(c=>geometry.classes.includes(c)))throw new Error('Select width utility @'+width+' '+classes+' '+JSON.stringify(geometry));
    }
  }
  await navigate('components/layouts.html');
  for(const width of [1280,768,390]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    const layout=await evaluate(`(()=>{const s=document.querySelector('#layout-view'),w=s.closest('.ui-select'),g=w.closest('.ui-toolbar-group'),label=g.querySelector('label');s.value='list';KavUI.sync(s);const before=w.getBoundingClientRect();s.value='stack';KavUI.sync(s);const after=w.getBoundingClientRect(),l=label.getBoundingClientRect(),toolbar=g.closest('.ui-toolbar');return {row:l.bottom>after.top&&l.top<after.bottom,stable:Math.abs(before.width-after.width)<1,overflow:toolbar.scrollWidth>toolbar.clientWidth};})()`);
    if(!layout.row||!layout.stable||layout.overflow)throw new Error('Catalog toolbar @'+width+' '+JSON.stringify(layout));
  }
  console.log('Select: pre-init and open-list sync without input/change; stable content width and toolbar grouping; full/auto/legacy/responsive widths @1280/768/390');
}
