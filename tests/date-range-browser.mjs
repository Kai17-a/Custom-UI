export async function check({navigate,evaluate,click,key,send}) {
 await navigate('components/date-range.html');
 const assert=async(x,m)=>{if(!await evaluate(x))throw Error(m)};
 await evaluate(`window.r=document.querySelector('[data-ui-date-range]');window.a=r.querySelector('[data-ui-range-start]');window.b=r.querySelector('[data-ui-range-end]');window.events=[];r.addEventListener('ui:rangechange',e=>events.push(e.detail));`);
 await evaluate(`a.value='2026-11-20';b.value='2026-11-10';a.dispatchEvent(new Event('input',{bubbles:true}))`);
 await assert(`!b.checkValidity()`,'reversed range');
 await evaluate(`a.value='';a.dispatchEvent(new Event('input',{bubbles:true}))`);
 await assert(`!b.checkValidity()`,'partial range');
 await click('[data-ui-range-clear]');
 await assert(`a.value===''&&b.value===''`,'clear');
 await evaluate(`r.querySelector('[data-ui-range-preset]').focus()`);await key('Enter');
 await assert(`!!a.value&&!!b.value&&a.value<=b.value&&events.length>0`,'keyboard preset/events');
 await evaluate(`a.min='2099-01-01';a.dispatchEvent(new Event('input',{bubbles:true}))`);
 await assert(`!a.checkValidity()`,'min validation');
 await evaluate(`a.removeAttribute('min');a.form.reset()`);await new Promise(r=>setTimeout(r,30));
 await assert(`a.value===a.defaultValue&&b.value===b.defaultValue`,'reset');
 await evaluate(`KavUI.destroy(r);KavUI.init(r);KavUI.init(r)`);
 await assert(`r.querySelectorAll('.ui-date-range-status').length===1`,'lifecycle');
 for(const width of [390,1280])for(const mode of ['light','dark']){
 await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
 await evaluate(`KavUI.setColorTheme('${mode}')`);
 await assert(`r.getBoundingClientRect().right<=innerWidth+1`,'responsive');}
}
