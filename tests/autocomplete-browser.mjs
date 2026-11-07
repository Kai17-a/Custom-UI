export async function checkAutocomplete({navigate,evaluate,click,key,send}) {
  const assert=async(expression,message)=>{if(!await evaluate(expression))throw new Error('Autocomplete: '+message);};
  await navigate('components/forms.html');
  await evaluate(`(()=>{
    const f=document.createElement('form');f.id='autocomplete-test';
    f.innerHTML='<label for="ac">担当</label><input id="ac" class="form-control" name="assignee" list="ac-list" data-ui-autocomplete required pattern=".{2,}"><datalist id="ac-list"><option value="Alpha Project" label="アルファ" data-ui-keywords="Tokyo 開発"></option><option value="Beta Project"></option><option value="Alpha Disabled" disabled></option><option value="Alpha Hidden" hidden></option></datalist><input id="native-ac" list="ac-list"><button>送信</button>';
    document.querySelector('main').prepend(f);window.ac=document.getElementById('ac');window.acForm=f;window.acChanges=0;window.acInputs=0;window.acSubmits=[];
    ac.addEventListener('change',()=>acChanges++);ac.addEventListener('input',()=>acInputs++);
    f.addEventListener('submit',e=>{e.preventDefault();acSubmits.push(new FormData(f).get('assignee'));});
    window.acType=value=>{ac.value=value;ac.dispatchEvent(new Event('input',{bubbles:true}));};
    window.acItems=()=>[...f.querySelectorAll('[role=option]')];KavUI.init(f);
  })()`);
  await assert(`!ac.hasAttribute('list')&&document.getElementById('native-ac').getAttribute('list')==='ac-list'&&ac.getAttribute('role')==='combobox'&&ac.getAttribute('aria-autocomplete')==='list'`,'enhancement / native untouched');
  await click('#ac');
  for(const q of ['ＡＬＰＨＡ　開発','alpha TOKYO','project アルファ']) {
    await evaluate(`acType(${JSON.stringify(q)})`);
    await assert(`acItems().length===1&&acItems()[0].textContent.includes('Alpha Project')&&ac.getAttribute('aria-expanded')==='true'&&!ac.hasAttribute('aria-activedescendant')&&acForm.querySelector('[role=status]').textContent.includes('1件')`,'filter '+q);
  }
  await key('ArrowDown');
  await assert(`document.getElementById(ac.getAttribute('aria-activedescendant')).getAttribute('role')==='option'&&document.getElementById(ac.getAttribute('aria-controls')).getAttribute('role')==='listbox'`,'active ARIA');
  await evaluate(`ac.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',isComposing:true,bubbles:true,cancelable:true}))`);
  await assert(`acChanges===0&&ac.getAttribute('aria-expanded')==='true'`,'IME Enter');
  await evaluate(`window.beforeInputs=acInputs`);await key('Enter');
  await assert(`ac.value==='Alpha Project'&&acChanges===1&&acInputs===beforeInputs+1&&ac.getAttribute('aria-expanded')==='false'&&!ac.hasAttribute('aria-activedescendant')&&document.activeElement===ac`,'commit events once');
  await key('Tab');await assert(`acChanges===1`,'blur must not duplicate change');
  await click('#ac');await evaluate(`acType('Unlisted value')`);await key('Enter');
  await assert(`acSubmits.at(-1)==='Unlisted value'&&acItems().length===0`,'free text submit without active');
  await evaluate(`acType('Beta')`);await key('Enter');
  await assert(`acSubmits.at(-1)==='Beta'`,'matching text Enter without active submits');
  await evaluate(`acType('')`);await assert(`!acForm.checkValidity()`,'required');
  await evaluate(`acType('x')`);await assert(`!acForm.checkValidity()`,'pattern');
  await evaluate(`acType('Beta')`);await key('Escape');await key('Escape');
  await assert(`ac.value==='Beta'&&ac.getAttribute('aria-expanded')==='false'`,'Escape preserves value');
  await evaluate(`acType('New');document.getElementById('ac-list').insertAdjacentHTML('beforeend','<option value="New Option">')`);
  await assert(`acItems().length===1&&acItems()[0].textContent==='New Option'`,'datalist mutation');
  await key('ArrowUp');await key('Enter');await assert(`ac.value==='New Option'`,'ArrowUp first item');
  await evaluate(`(()=>{const g=document.createElement('div');g.className='ui-input-group';g.id='ac-group';g.innerHTML='<span class="ui-input-addon">@</span><input id="ac-grouped" class="form-control" list="ac-list" data-ui-autocomplete aria-label="グループ内の担当">';acForm.append(g);KavUI.init(acForm);})()`);
  await assert(`(()=>{const g=document.getElementById('ac-group'),i=document.getElementById('ac-grouped');return g.lastElementChild===i&&g.nextElementSibling?.classList.contains('ui-select-menu')&&parseFloat(getComputedStyle(i).borderEndEndRadius)>0;})()`,'input-group keeps last-child corners');
  await evaluate(`KavUI.destroy(acForm)`);
  await assert(`!document.querySelector('#ac-group + .ui-select-menu')&&document.getElementById('ac-grouped').getAttribute('list')==='ac-list'`,'input-group destroy removes popup');
  await evaluate(`document.getElementById('ac-group').remove();KavUI.init(acForm)`);
  await evaluate(`KavUI.destroy(acForm)`);
  await assert(`ac.getAttribute('list')==='ac-list'&&!ac.hasAttribute('role')&&!acForm.querySelector('.ui-select-menu')`,'destroy restores native');
  await evaluate(`KavUI.init(acForm);KavUI.init(acForm)`);
  await assert(`acForm.querySelectorAll('.ui-select-menu').length===1&&!ac.hasAttribute('list')`,'re-init idempotent');
  await click('#ac');await evaluate(`acType('Beta')`);
  await evaluate(`window.beforePointerChanges=acChanges;window.beforePointerInputs=acInputs`);
  await click('#autocomplete-test [role=option]');
  await assert(`ac.value==='Beta Project'&&acChanges===beforePointerChanges+1&&acInputs===beforePointerInputs+1&&document.activeElement===ac`,'pointer commit keeps focus / events');
  for(const width of [390,1280])for(const theme of ['default','glass','glassmorphism','flat','soft'])for(const mode of ['light','dark']) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    await evaluate(`KavUI.setDesignTheme('${theme}');KavUI.setColorTheme('${mode}')`);
    await click('#ac');await evaluate(`acType('')`);await key('ArrowDown');
    await assert(`(()=>{const p=acForm.querySelector('.ui-select-menu'),r=p.getBoundingClientRect();return r.width>0&&r.left>=0&&r.right<=innerWidth&&p.scrollWidth<=p.clientWidth&&document.documentElement.scrollWidth<=innerWidth;})()`,'layout '+width+theme+mode);
    await key('Escape');
  }
  await send('Emulation.setEmulatedMedia',{features:[{name:'forced-colors',value:'active'}]});
  await evaluate(`acType('')`);await key('ArrowDown');
  await assert(`getComputedStyle(acForm.querySelector('.is-active')).outlineStyle!=='none'`,'forced colors');
  await key('Escape');await send('Emulation.setEmulatedMedia',{features:[]});
  await navigate('components/forms.html');
  for(const width of [390,1280])for(const theme of ['default','glass','glassmorphism','flat','soft'])for(const mode of ['light','dark']) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    await evaluate(`KavUI.setDesignTheme('${theme}');KavUI.setColorTheme('${mode}')`);
    await click('#autocomplete-assignee');
    await evaluate(`(()=>{const i=document.getElementById('autocomplete-assignee');i.value='';i.dispatchEvent(new Event('input',{bubbles:true}));})()`);
    await assert(`(()=>{const p=document.querySelector('#autocomplete .ui-select-menu'),r=p.getBoundingClientRect();return r.width>0&&r.left>=0&&r.right<=innerWidth&&p.scrollWidth<=p.clientWidth&&document.documentElement.scrollWidth<=innerWidth;})()`,'catalog layout '+width+theme+mode);
    await key('Escape');
  }
  await click('#autocomplete-assignee');
  await send('Input.insertText',{text:'ＴＯＫＹＯ'});
  await assert(`document.getElementById('autocomplete-assignee').getAttribute('aria-expanded')==='true'&&document.querySelector('#autocomplete [role=option]')`,'catalog real typing');
  await key('Escape');
  await click('#autocomplete-assignee');
  await evaluate(`(()=>{const i=document.getElementById('autocomplete-assignee');i.value='';window.realAcChanges=0;window.realAcInputs=0;i.addEventListener('change',()=>realAcChanges++);i.addEventListener('input',()=>realAcInputs++);})()`);
  await send('Input.insertText',{text:'Tokyo'});await key('ArrowDown');await key('Enter');
  await assert(`realAcChanges===1&&realAcInputs===2&&document.getElementById('autocomplete-assignee').value==='田中 花子'`,'real typing commit events');
  await key('Tab');await assert(`realAcChanges===1`,'real typing blur change count');
  await click('#autocomplete-assignee');
  await send('Input.insertText',{text:'自由入力'});await key('Tab');
  await assert(`realAcChanges===2`,'free edit after commit retains native change');
  await click('#autocomplete-assignee');
  await evaluate(`(()=>{const i=document.getElementById('autocomplete-assignee');i.dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true}));i.value='佐';i.dispatchEvent(new InputEvent('input',{bubbles:true,isComposing:true}));i.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,isComposing:true}));})()`);
  await assert(`document.getElementById('autocomplete-assignee').getAttribute('aria-expanded')==='false'`,'composition input and arrows ignored');
  await evaluate(`document.getElementById('autocomplete-assignee').dispatchEvent(new CompositionEvent('compositionend',{bubbles:true}))`);
  await assert(`document.getElementById('autocomplete-assignee').getAttribute('aria-expanded')==='true'&&document.querySelectorAll('#autocomplete [role=option]').length===1`,'composition end filters');
  await key('Tab');
  await assert(`document.getElementById('autocomplete-assignee').getAttribute('aria-expanded')==='false'`,'Tab closes');
  console.log('Autocomplete: filtering, keyboard/IME, free text/validation, events, ARIA, mutations/lifecycle, themes @390/1280, forced colors');
}
