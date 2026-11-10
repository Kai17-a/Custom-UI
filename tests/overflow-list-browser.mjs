export async function check({navigate,evaluate,click,key,send}){
 await navigate('components/overflow-list.html');const assert=async(x,m)=>{if(!await evaluate(x))throw Error(m)};
 const settle=()=>new Promise(r=>setTimeout(r,100));
 await evaluate(`window.r=document.querySelector('[data-ui-overflow]');window.strip=r.querySelector('[data-ui-overflow-items]');window.more=r.querySelector('details');window.panel=r.querySelector('.ui-overflow-panel');window.original=[...strip.children,...panel.children];r.style.width='240px'`);await settle();
 await assert(`!more.hidden&&panel.children.length>0&&strip.children.length+panel.children.length===5`,'overflow count');
 await click('.ui-overflow-more summary');await evaluate(`window.focused=panel.querySelector('button');focused.focus();r.style.width='180px'`);await settle();await assert(`document.activeElement===focused&&more.open`,'resize focus retained');
 await key('Escape');await assert(`!more.open&&document.activeElement===more.querySelector('summary')`,'Escape');
 await evaluate(`window.added=document.createElement('button');added.textContent='非常に長いラベル'.repeat(30);strip.append(added)`);await settle();await assert(`strip.children.length+panel.children.length===6&&panel.contains(added)`,'added item');
 await click('.ui-overflow-more summary');await new Promise(r=>setTimeout(r,50));await assert(`panel.getBoundingClientRect().right<=innerWidth+1&&panel.scrollWidth<=panel.clientWidth+1`,'long label bounds');
 await evaluate(`added.remove();r.style.width='100%'`);await settle();await assert(`strip.children.length+panel.children.length===5&&original.every(x=>r.contains(x))`,'remove/order identity');
 for(const width of [390,1280])for(const mode of ['light','dark']){await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});await evaluate(`KavUI.setColorTheme('${mode}')`);await settle();await assert(`document.documentElement.scrollWidth<=innerWidth+1`,'responsive');}
 await evaluate(`KavUI.destroy(r)`);await assert(`strip.children.length===5&&!r.querySelector('details')`,'destroy restores items');await evaluate(`KavUI.init(r);KavUI.init(r)`);await assert(`r.querySelectorAll('details').length===1`,'reinit');
}
