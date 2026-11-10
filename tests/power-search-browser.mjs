export async function check({navigate,evaluate,click,key,send}){
 await navigate('components/power-search.html');
 const assert=async(x,m)=>{if(!await evaluate(x))throw Error(m)};
 await evaluate(`window.r=document.querySelector('[data-ui-power-search]');window.t=document.querySelector('#power-table');window.owner=r.querySelector('[data-ui-power-filter=owner]');window.state=r.querySelector('[data-ui-power-filter=status]');window.q=r.querySelector('input');window.rows=()=>[...t.querySelectorAll('tbody tr:not([data-ui-table-empty])')].filter(x=>!x.hidden);window.events=[];r.addEventListener('ui:powerchange',e=>events.push(e.detail));owner.value='aoki';owner.dispatchEvent(new Event('change',{bubbles:true}));state.value='open';state.dispatchEvent(new Event('change',{bubbles:true}))`);
 await assert(`rows().length===1&&rows()[0].textContent.includes('カタログ')&&events.at(-1).filters.length===2`,'AND filtering/events');
 await click('.ui-power-search-tags button');await assert(`rows().length===2`,'individual clear');
 await click('[data-ui-power-clear]');await assert(`rows().length===3&&!q.value&&!owner.value&&!state.value`,'clear all');
 await click('[data-ui-power-query]');await send('Input.insertText',{text:'導入'});await assert(`rows().length===1&&rows()[0].textContent.includes('導入')`,'query');
 await evaluate(`KavUI.destroy(r)`);await assert(`rows().length===3`,'destroy removes filter');await evaluate(`KavUI.init(r);KavUI.init(r)`);await assert(`r.querySelectorAll('.ui-power-search-tags').length===1`,'idempotent');
 for(const width of [390,1280])for(const mode of ['light','dark']){await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});await evaluate(`KavUI.setColorTheme('${mode}')`);await assert(`document.documentElement.scrollWidth<=innerWidth+1`,'responsive');}
}
