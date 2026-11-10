export async function check({navigate,evaluate,click,key,send}){
 await navigate('components/context-menu.html');
 const assert=async(x,m)=>{if(!await evaluate(x))throw Error(m)};
 await evaluate(`window.r=document.querySelector('[data-ui-context-menu]');window.item=r.querySelector('[data-ui-context-item]');window.panel=r.querySelector('[data-ui-context-panel]');window.events=[];r.addEventListener('ui:contextaction',e=>events.push(e.detail));item.focus()`);await evaluate(`new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))`);await evaluate(`item.dispatchEvent(new KeyboardEvent('keydown',{key:'F10',shiftKey:true,bubbles:true}))`);
 await assert(`!panel.hidden&&document.activeElement.dataset.uiContextAction==='rename'`,'keyboard open');
 await key('End');await assert(`document.activeElement.dataset.uiContextAction==='duplicate'`,'skip disabled');
 await key('Escape');await assert(`panel.hidden&&document.activeElement===item`,'Escape/focus');
 await click('[data-ui-context-open]');await key('Enter');await assert(`panel.hidden&&events.at(-1).value==='rename'&&events.at(-1).target===item`,'button and action');
 for(const width of [390,1280])for(const mode of ['light','dark']){
 await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});await evaluate(`KavUI.setColorTheme('${mode}')`);await evaluate(`new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))`);await evaluate(`item.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,clientX:innerWidth-1,clientY:innerHeight-1}))`);
 await assert(`!panel.hidden&&panel.getBoundingClientRect().right<=innerWidth&&panel.getBoundingClientRect().bottom<=innerHeight`,'pointer edge bounds');await key('Escape');}
 await evaluate(`KavUI.destroy(r);KavUI.init(r);KavUI.init(r)`);await click('[data-ui-context-open]');await key('Enter');await assert(`events.length===2`,'lifecycle once');
}
