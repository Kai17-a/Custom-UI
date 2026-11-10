export async function check({navigate,evaluate,click,key,send}){
 await navigate('components/tour.html');const assert=async(x,m)=>{if(!await evaluate(x))throw Error(m)};
 await evaluate(`window.r=document.querySelector('[data-ui-tour]');window.p=document.querySelector('.ui-tour-panel');window.opener=document.querySelector('[data-ui-tour-start]');window.ends=[];r.addEventListener('ui:tourend',e=>ends.push(e.detail));opener.focus()`);await key('Enter');
 await assert(`!p.hidden&&p.textContent.includes('1 / 2')&&document.querySelector('#tour-search').hasAttribute('data-ui-tour-active')&&document.activeElement===p`,'open semantics/target/focus');
 await click('.ui-tour-actions button:nth-child(2)');await assert(`p.textContent.includes('2 / 2')&&p.textContent.includes('完了')`,'next');
 await click('.ui-tour-actions button:nth-child(1)');await assert(`p.textContent.includes('1 / 2')`,'back');
 await key('Escape');await assert(`p.hidden&&document.activeElement===opener&&ends.at(-1).reason==='dismissed'&&!document.querySelector('[data-ui-tour-active]')`,'dismiss/focus cleanup');
 await evaluate(`document.querySelector('#tour-search').style.display='none'`);await click('[data-ui-tour-start]');await assert(`p.textContent.includes('2 / 2')`,'skip hidden');await click('.ui-tour-actions button:nth-child(2)');await assert(`p.hidden&&ends.at(-1).reason==='completed'`,'complete');
 await evaluate(`document.querySelector('#tour-create').remove()`);await click('[data-ui-tour-start]');await assert(`p.hidden&&ends.at(-1).reason==='missing-target'`,'missing all targets');
 await evaluate(`document.querySelector('#tour-search').style.display=''`);
 for(const width of [390,1280])for(const mode of ['light','dark']){await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});await evaluate(`KavUI.setColorTheme('${mode}')`);await click('[data-ui-tour-start]');await assert(`p.getBoundingClientRect().right<=innerWidth+1&&p.getBoundingClientRect().bottom<=innerHeight+1`,'bounds');await key('Escape');}
 await evaluate(`KavUI.destroy(r);KavUI.init(r);KavUI.init(r)`);await assert(`document.querySelectorAll('.ui-tour-panel').length===1`,'lifecycle');
}
