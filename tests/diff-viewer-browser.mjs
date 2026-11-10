export async function check({navigate,evaluate,click,key,send}){
 await navigate('components/diff-viewer.html');const assert=async(x,m)=>{if(!await evaluate(x))throw Error(m)};
 await evaluate(`window.r=document.querySelector('[data-ui-diff-viewer]');window.a=r.querySelector('textarea');window.b=r.querySelectorAll('textarea')[1];window.events=[];r.addEventListener('ui:diffupdate',e=>events.push(e.detail));window.set=(x,y)=>{a.value=x;b.value=y;r.dispatchEvent(new Event('ui:diffrefresh'))};set('共通\\n削除','共通\\n追加')`);
 await assert(`events.at(-1).added===1&&events.at(-1).removed===1&&r.querySelector('[data-diff-kind=equal]')&&r.textContent.includes('追加 +')&&r.textContent.includes('削除 −')`,'line diff/noncolor markers');
 await evaluate(`set('同じ','同じ')`);await assert(`r.textContent.includes('差分はありません')`,'equal');
 await evaluate(`set('','')`);await assert(`!r.querySelector('tbody').children.length&&events.at(-1).added===0`,'empty');
 await evaluate(`set('','<img src=x onerror=window.hacked=1>日本語')`);await assert(`!r.querySelector('img')&&!window.hacked&&r.querySelector('code').textContent.startsWith('<img')`,'HTML not executed');
 await evaluate(`set(Array(1002).fill('旧').join('\\n'),Array(1002).fill('新').join('\\n'))`);await assert(`events.at(-1).simplified&&events.at(-1).added===1002&&events.at(-1).removed===1002`,'bounded large input');
 await evaluate(`set('長い行'.repeat(500),'更新'.repeat(500))`);
 for(const width of [390,1280])for(const mode of ['light','dark']){await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});await evaluate(`KavUI.setColorTheme('${mode}')`);await assert(`document.documentElement.scrollWidth<=innerWidth+1&&r.querySelector('.ui-diff-output').tabIndex===0`,'bounds/keyboard');}
 await evaluate(`KavUI.destroy(r);KavUI.init(r);KavUI.init(r)`);await assert(`r.querySelectorAll('.ui-diff-output').length===1`,'lifecycle');
}
