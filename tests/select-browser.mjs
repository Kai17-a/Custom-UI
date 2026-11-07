// Public select synchronization and width utilities, exercised in the shared Chromium session.
export async function checkSelect({navigate, evaluate, click, key, send}) {
  await checkSearchable({navigate,evaluate,click,key,send});
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

async function checkSearchable({navigate,evaluate,click,key,send}) {
  await navigate('components/forms.html');
  const assert=async(expression,message)=>{if(!await evaluate(expression))throw new Error('Searchable select: '+message);};
  await evaluate(`(()=>{
    const form=document.createElement('form');form.id='search-test';
    form.innerHTML='<label for="search-project">プロジェクト</label><select id="search-project" name="project" class="form-select" data-ui-searchable required><option value="">選択してください</option><optgroup label="開発"><option value="alpha" data-ui-keywords="Tokyo 開発">Ａｌｐｈａ Project</option><option value="beta" data-ui-keywords="Osaka">Beta Project</option><option value="disabled" disabled>Alpha Disabled</option></optgroup><optgroup label="保管"><option value="old">Old Project</option></optgroup><optgroup label="無効" disabled><option>Alpha Group Disabled</option></optgroup><option hidden>Alpha Hidden</option></select><button type="submit">送信</button>';
    document.querySelector('main').prepend(form);window.searchChanges=0;form.querySelector('select').addEventListener('change',()=>searchChanges++);KavUI.init(form);
    window.searchQuery=value=>{const input=form.querySelector('input');input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));};
    window.searchItems=()=>[...form.querySelectorAll('[role="option"]')].filter(e=>!e.hidden);
  })()`);
  await click('#search-test .ui-select-trigger');
  await assert(`document.activeElement.matches('#search-test input[role="combobox"]')`,'focus search on open');
  await assert(`(()=>{const i=document.activeElement;return i.getAttribute('aria-expanded')==='true'&&i.getAttribute('aria-autocomplete')==='list'&&document.getElementById(i.getAttribute('aria-controls')).getAttribute('role')==='listbox'&&document.getElementById(i.getAttribute('aria-activedescendant')).getAttribute('role')==='option';})()`,'combobox ARIA');
  for(const query of ['alpha tokyo','ＡＬＰＨＡ　開発','project ALPHA']) {
    await evaluate(`searchQuery(${JSON.stringify(query)})`);
    await assert(`searchItems().length===1&&searchItems()[0].textContent==='Ａｌｐｈａ Project'&&document.querySelector('#search-test [role="status"]').textContent.includes('1件')`,'normalization / AND / keywords '+query);
  }
  await evaluate(`searchQuery('alpha')`);
  await assert(`searchItems().length===3&&searchItems().filter(e=>e.getAttribute('aria-disabled')==='true').length===2`,'disabled matches visible');
  await click('#search-test [role="option"][aria-disabled="true"]');
  await assert(`searchChanges===0&&document.activeElement.matches('#search-test input')`,'disabled pointer selection');
  await key('ArrowDown');
  await assert(`document.getElementById(document.activeElement.getAttribute('aria-activedescendant')).textContent==='Ａｌｐｈａ Project'`,'skip disabled');
  await evaluate(`document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',isComposing:true,bubbles:true,cancelable:true}))`);
  await assert(`searchChanges===0&&document.querySelector('#search-test .ui-select-menu').matches(':popover-open')`,'IME Enter');
  await key('Enter');
  await assert(`searchChanges===1&&document.querySelector('#search-project').value==='alpha'&&new FormData(document.querySelector('#search-test')).get('project')==='alpha'&&document.querySelector('#search-test').checkValidity()&&document.activeElement.matches('.ui-select-trigger')`,'commit / change once / form');
  await click('#search-test .ui-select-trigger');
  await key('Enter');
  await assert(`searchChanges===1`,'same value does not emit change');
  await click('#search-test .ui-select-trigger');
  await evaluate(`searchQuery('no results')`);
  await assert(`searchItems().length===0&&[...document.querySelectorAll('#search-test [role="listbox"] .ui-select-group')].every(e=>e.hidden)&&document.querySelector('#search-test [role="status"]').textContent.includes('0件')&&!document.activeElement.hasAttribute('aria-activedescendant')`,'empty groups / status / active');
  await key('Enter');
  await assert(`searchChanges===1`,'empty Enter');
  await evaluate(`searchQuery('project');const s=document.querySelector('#search-project');s.value='beta';KavUI.sync(s)`);
  await assert(`document.activeElement.value==='project'&&document.getElementById(document.activeElement.getAttribute('aria-activedescendant')).textContent==='Beta Project'&&searchChanges===1`,'sync filtered list without events');
  await key('ArrowUp');await key('ArrowDown');await key('Escape');
  await assert(`document.activeElement.matches('#search-test .ui-select-trigger')&&document.querySelector('#search-test input').getAttribute('aria-expanded')==='false'&&!document.querySelector('#search-test input').hasAttribute('aria-activedescendant')`,'Escape focus / ARIA');
  await evaluate(`(()=>{const s=document.querySelector('#search-project');s.value='';KavUI.sync(s);})()`);
  await assert(`!document.querySelector('#search-test').checkValidity()`,'required native validation');
  await evaluate(`KavUI.destroy(document.querySelector('#search-test'));KavUI.init(document.querySelector('#search-test'))`);
  await click('#search-test .ui-select-trigger');
  await assert(`document.querySelectorAll('#search-test input[role="combobox"]').length===1&&document.activeElement.value===''`,'destroy / re-init / query reset');
  await key('Escape');
  for(const width of [390,1280])for(const theme of ['default','glass','glassmorphism','flat','soft'])for(const dark of [false,true]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    await evaluate(`KavUI.setDesignTheme(${JSON.stringify(theme)});KavUI.setColorTheme(${JSON.stringify(dark?'dark':'light')})`);
    await click('#search-test .ui-select-trigger');
    await assert(`(()=>{const p=document.querySelector('#search-test .ui-select-menu'),i=p.querySelector('input'),r=p.getBoundingClientRect(),q=i.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&q.left>=r.left&&q.right<=r.right&&p.scrollWidth<=p.clientWidth&&i.getBoundingClientRect().height>0;})()`,'layout '+width+' '+theme+' '+dark);
    await key('Escape');
  }
  await send('Emulation.setEmulatedMedia',{features:[{name:'forced-colors',value:'active'}]});
  await click('#search-test .ui-select-trigger');
  await assert(`getComputedStyle(document.querySelector('#search-test .is-active')).outlineStyle!=='none'`,'forced colors active outline');
  await key('Escape');
  await send('Emulation.setEmulatedMedia',{features:[]});
  await navigate('components/forms.html');
  for(const width of [390,1280]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    await click('#searchable-select .ui-select-trigger');
    await assert(`document.querySelector('#searchable-project').options.length>=20&&document.querySelector('#searchable-select [role="status"]').textContent.includes('21件')`,'catalog sample');
    await send('Input.insertText',{text:'ＣＡＴＡＬＯＧ design'});
    await assert(`document.querySelectorAll('#searchable-select [role="option"]:not([hidden])').length===1`,'real input in catalog');
    await key('Escape');
  }
  await evaluate(`(()=>{const s=document.createElement('select');s.dataset.uiSearchable='';s.innerHTML='<option>Plain</option>';document.querySelector('main').prepend(s);KavUI.init(s);s.nextElementSibling.click();})()`);
  await assert(`document.activeElement.matches('input[role="combobox"]')`,'attribute without form-select');
  await key('Tab');
  await assert(`!document.querySelector('.ui-select-searchable:popover-open')`,'Tab dismiss');
  console.log('Searchable select: normalize/AND/keywords, disabled/groups/empty, keyboard/IME, ARIA, change/form/required, sync/lifecycle, themes @390/1280 and forced colors');
}
