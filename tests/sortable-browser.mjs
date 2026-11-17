import {readFileSync} from 'node:fs';
export async function check({navigate,evaluate,key,send}) {
  await navigate('components/sortable.html');
  const assert=async(expression,message)=>{if(!await evaluate(expression))throw Error(message);};
  await evaluate(`window.list=document.querySelector('[data-ui-sortable]');window.item=list.children[0];window.changes=[];list.addEventListener('ui:sortable-change',e=>changes.push(e.detail));item.focus()`);
  await key(' ');await key('ArrowDown');await key('Enter');
  await assert(`list.children[1]===item&&document.activeElement===item&&changes.length===1`,'native keyboard');
  await new Promise(r=>setTimeout(r,30));
  await assert(`document.querySelector('[data-ui-sortable-status]').textContent.includes('確定')`,'Japanese live message');
  await key('Enter');await key('ArrowUp');await key('Escape');
  await assert(`list.children[1]===item&&changes.length===1`,'native cancel');
  await evaluate(`window.handle=document.querySelector('[data-ui-sortable-handle]');window.handled=handle.closest('li');window.handles=handled.parentElement;handle.focus()`);
  await key('Enter');await key('ArrowDown');await key(' ');
  await assert(`handles.children[1]===handled&&document.activeElement===handle`,'native handle keyboard');
  await evaluate(`Promise.all([...list.getAnimations({subtree:true}),...handles.getAnimations({subtree:true})].map(a=>a.finished.catch(()=>{})))`);
  const points=await evaluate(`(()=>{list.scrollIntoView({block:'center',behavior:'instant'});const a=list.firstElementChild.getBoundingClientRect(),b=list.lastElementChild.getBoundingClientRect();return {x:a.x+a.width/2,y:a.y+a.height/2,to:b.bottom-2};})()`);
  await send('Input.dispatchMouseEvent',{type:'mousePressed',x:points.x,y:points.y,button:'left',clickCount:1});
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:points.x,y:points.to,buttons:1});
  await assert(`!!list.querySelector('[data-ui-sortable-drop]')`,'mouse indicator');
  await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:points.x,y:points.to,button:'left',clickCount:1});
  await assert(`changes.length===2&&changes.at(-1).to===2`,'native mouse reorder');
  await evaluate(`Promise.all([...list.getAnimations({subtree:true}),...handles.getAnimations({subtree:true})].map(a=>a.finished.catch(()=>{})))`);
  const touch=await evaluate(`(()=>{handles.scrollIntoView({block:'center',behavior:'instant'});const a=handles.firstElementChild.querySelector('button').getBoundingClientRect(),b=handles.lastElementChild.getBoundingClientRect();return {x:a.x+a.width/2,y:a.y+a.height/2,to:b.bottom-2};})()`);
  await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:touch.x,y:touch.y}]});
  await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:touch.x,y:touch.to}]});
  await assert(`!!handles.querySelector('[data-ui-sortable-drop]')`,'touch indicator');
  await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await assert(`handles.lastElementChild.dataset.id==='check'`,'native touch reorder');
  for(const width of [320,820,1440]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
    for(const mode of ['light','dark'])for(const design of ['default','glass','glassmorphism','flat','soft']) {
      await evaluate(`document.documentElement.dataset.bsTheme='${mode}';document.body.dataset.uiTheme='${design}'`);
      await assert(`document.documentElement.scrollWidth<=innerWidth+1&&[...document.querySelectorAll('[data-ui-sortable]')].every(el=>el.scrollWidth<=el.clientWidth+1)`,'responsive/theme overflow');
    }
  }
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await evaluate(`item.focus()`);await key(' ');await key('ArrowUp');await key('Enter');
  await assert(`item.getAnimations().length===0`,'reduced motion');
  await assert(`document.querySelectorAll('[data-source-language="vue"]').length>0 || [...document.querySelectorAll('[role=tab]')].some(el=>el.textContent==='Vue')`,'Vue sample tab');
  // data URLs let this file:// harness import the actual modules without a server.
  const moduleURL=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
  const runtime=moduleURL(readFileSync(new URL('../assets/js/ui.js',import.meta.url),'utf8'));
  const client=moduleURL(readFileSync(new URL('../packages/core/src/client.js',import.meta.url),'utf8').replace('../dist/runtime.js',runtime));
  await evaluate(`(async()=>{const {mount}=await import(${JSON.stringify(client)});const signal=new AbortController();window.cleanup=await mount(list,{signal:signal.signal});signal.abort();})()`);
  await assert(`!item.hasAttribute('tabindex')&&!list.querySelector('[data-ui-sortable-active]')`,'mount abort cleanup');
  console.log('Sortable page: native keyboard/mouse/touch, live messages, handles, 3 widths × 10 theme/modes, reduced motion, tabs, mount abort: PASS');
}
