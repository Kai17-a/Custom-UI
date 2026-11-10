export async function check({navigate,evaluate,click,key,send}) {
  await navigate('components/forms.html');
  await evaluate(`(()=>{
    const f=document.createElement('form');f.id='test';f.innerHTML='<label for="members">担当者</label><select id="members" name="members" multiple required data-ui-tokenizer><option value="a" selected>青木</option><option value="b">森</option><option value="c" disabled>無効</option></select><button type="reset">リセット</button>';document.querySelector('main').prepend(f);KavUI.init(f);
    window.s=f.querySelector('select');window.f=f;
  })()`);
  const assert=async(e,m)=>{if(!await evaluate(e))throw Error(m);};
  await assert(`!!f.querySelector('.ui-tokenizer')`,'tokenizer is initialized');
  await click('.ui-tokenizer input');
  await send('Input.insertText',{text:'森'});await key('ArrowDown');await key('Enter');
  await assert(`new FormData(f).getAll('members').join(',')==='a,b'`,'multiple submitted');
  await evaluate(`f.querySelector('input').dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',isComposing:true,bubbles:true}))`);
  await assert(`s.selectedOptions.length===2`,'composition does not select');
  await click('[data-ui-token-remove="a"]');
  await assert(`s.selectedOptions.length===1&&s.value==='b'`,'remove one');
  await click('[data-ui-token-clear]');
  await assert(`!s.checkValidity()`,'required empty invalid');
  await evaluate(`f.reset()`);await new Promise(r=>setTimeout(r,30));
  await assert(`s.value==='a'&&f.querySelectorAll('[data-ui-token-remove]').length===1`,'reset sync');
  await evaluate(`s.disabled=true`);await new Promise(r=>setTimeout(r,30));
  await assert(`f.querySelector('.ui-tokenizer input').disabled`,'disabled sync');
  await evaluate(`s.disabled=false;KavUI.destroy(f);KavUI.init(f);KavUI.init(f)`);
  await assert(`f.querySelectorAll('.ui-tokenizer').length===1`,'lifecycle idempotent');
  for(const width of [390,1280])for(const theme of ['light','dark']){
    await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
    await evaluate(`document.documentElement.dataset.bsTheme='${theme}'`);
    await assert(`f.querySelector('.ui-tokenizer').getBoundingClientRect().right<=innerWidth`,'responsive');
  }
}
