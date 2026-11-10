export async function check({navigate,evaluate,click,key,send}){
 await navigate('components/transfer-list.html');const assert=async(x,m)=>{if(!await evaluate(x))throw Error(m)};
 await evaluate(`window.s=document.querySelector('[data-ui-transfer]');window.r=document.querySelector('.ui-transfer-list');window.left=r.querySelector('select');window.right=r.querySelectorAll('select')[1];window.f=s.form;window.events=[];s.addEventListener('ui:transferchange',e=>events.push(e.detail));[...left.options].forEach(o=>o.selected=true);left.dispatchEvent(new Event('change',{bubbles:true}));r.querySelector('button').focus()`);await key('Enter');
 await assert(`s.selectedOptions.length===4&&new FormData(f).getAll('members').join(',')==='aoki,mori,ito'&&events.length===1`,'multi transfer/form/disabled');
 await evaluate(`window.search=r.querySelectorAll('input')[1];search.value='森';search.dispatchEvent(new Event('input',{bubbles:true}))`);await assert(`right.options.length===1&&s.selectedOptions.length===4`,'search retains state');
 await evaluate(`right.options[0].selected=true;right.dispatchEvent(new Event('change',{bubbles:true}))`);await click('.ui-transfer-side:nth-child(2) button');await assert(`!s.options[1].selected&&s.options[3].selected`,'remove one');
 await evaluate(`f.reset()`);await new Promise(r=>setTimeout(r,30));await assert(`s.selectedOptions.length===2&&!search.value`,'reset');
 await evaluate(`s.disabled=true`);await new Promise(r=>setTimeout(r,30));await assert(`left.disabled&&right.disabled&&r.querySelector('input').disabled`,'disabled sync');
 await evaluate(`s.disabled=false;s.options[0].selected=false;s.options[3].selected=false;KavUI.sync(s)`);await assert(`!s.checkValidity()&&document.activeElement===left`,'required focus');
 for(const width of [390,1280])for(const mode of ['light','dark']){await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});await evaluate(`KavUI.setColorTheme('${mode}')`);await assert(`document.documentElement.scrollWidth<=innerWidth+1`,'responsive');}
 await evaluate(`KavUI.destroy(f);KavUI.init(f);KavUI.init(f)`);await assert(`f.querySelectorAll('.ui-transfer-list').length===1`,'lifecycle');
}
