export async function check({navigate,evaluate,click,key,send}){
 await navigate('components/log-stream.html');const assert=async(x,m)=>{if(!await evaluate(x))throw Error(m)};
 await evaluate(`window.r=document.querySelector('[data-ui-log-stream]');window.v=r.querySelector('.ui-log-viewport');window.events=[];r.addEventListener('ui:logchange',e=>events.push(e.detail));window.append=lines=>r.dispatchEvent(new CustomEvent('ui:logappend',{detail:{lines}}));append(Array.from({length:100},(_,i)=>'line '+i))`);
 await assert(`Math.abs(v.scrollHeight-v.clientHeight-v.scrollTop)<2&&events.at(-1).following`,'follow');
 await evaluate(`r.querySelector('.ui-log-toolbar button').focus()`);await key('Enter');await evaluate(`v.scrollTop=100;window.savedTop=v.scrollTop;append(['<img src=x onerror=window.hacked=1>'])`);
 await assert(`Math.abs(v.scrollTop-window.savedTop)<2&&events.at(-1).unread===1&&!v.querySelector('img')&&!window.hacked`,'pause/unread/HTML safe');
 await click('.ui-log-toolbar button:nth-child(2)');await assert(`events.at(-1).unread===1&&r.querySelector('.ui-log-toolbar button').getAttribute('aria-pressed')==='true'&&Math.abs(v.scrollHeight-v.clientHeight-v.scrollTop)<2`,'resume bottom');
 await evaluate(`append(Array.from({length:600},(_,i)=>'new '+i))`);await assert(`v.querySelectorAll('li').length===500&&v.querySelector('li').textContent==='new 100'&&events.at(-1).removed>0`,'retention cap');
 for(const width of [390,1280])for(const mode of ['light','dark']){await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});await evaluate(`KavUI.setColorTheme('${mode}')`);await assert(`document.documentElement.scrollWidth<=innerWidth+1&&v.tabIndex===0`,'bounds/keyboard');}
 await evaluate(`KavUI.destroy(r);KavUI.init(r);KavUI.init(r)`);await assert(`r.querySelectorAll('.ui-log-viewport').length===1`,'lifecycle');
}
