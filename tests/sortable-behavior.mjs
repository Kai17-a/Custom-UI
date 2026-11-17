export async function check({navigate,evaluate}) {
  await navigate('tests/sortable.html');
  const result=await evaluate(`(()=>{
    const assert=(v,m)=>{if(!v)throw Error(m);};
    const host=document.getElementById('fixture');
    host.innerHTML='<ul data-ui-sortable><li id="a">A</li><li id="b">B</li><li id="c">C</li></ul>';
    const root=host.firstElementChild,a=root.children[0];KavUI.init(host);KavUI.init(host);
    const key=k=>a.dispatchEvent(new KeyboardEvent('keydown',{key:k,bubbles:true,cancelable:true}));
    const order=()=>[...root.children].map(x=>x.id).join('');const changes=[];
    root.addEventListener('ui:sortable-change',e=>changes.push(e.detail));
    assert(a.tabIndex===0,'focusable');a.focus();key(' ');key('ArrowDown');
    assert(order()==='bac'&&document.activeElement===a,'keyboard move and focus');key('Enter');
    assert(changes.length===1&&changes[0].item===a&&changes[0].from===0&&changes[0].to===1&&changes[0].order[1]===a,'event detail');
    key('Enter');key('ArrowDown');key('Escape');assert(order()==='bac'&&changes.length===1,'cancel restores without event');
    key(' ');key('ArrowUp');key('ArrowUp');key(' ');assert(order()==='abc'&&changes.length===2,'boundary');
    const pointer=(type,y,pointerId=7)=>a.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,button:0,isPrimary:true,pointerType:'touch',pointerId,clientX:10,clientY:y}));
    const r=root.lastElementChild.getBoundingClientRect();pointer('pointerdown',1);pointer('pointermove',r.bottom-1);
    assert(root.querySelector('[data-ui-sortable-drop]'),'drop indicator');pointer('pointerup',r.bottom-1);
    assert(order()==='bca'&&changes.at(-1).from===0&&changes.at(-1).to===2,'pointer reorder');
    pointer('pointerdown',1);pointer('pointermove',0);pointer('pointercancel',0);assert(order()==='bca','pointer cancel');
    key(' ');key('ArrowUp');KavUI.destroy(host);assert(order()==='bca'&&!a.hasAttribute('tabindex'),'destroy restores state');
    const count=changes.length;key(' ');key('ArrowUp');pointer('pointerdown',1);pointer('pointermove',0);pointer('pointerup',0);
    assert(order()==='bca'&&changes.length===count&&!document.querySelector('[data-ui-sortable-status]'),'destroy removes listeners/live region');
    KavUI.init(host);key(' ');key('ArrowUp');key(' ');assert(changes.length===count+1,'reinit');KavUI.destroy(host);
    host.innerHTML='<div data-ui-sortable><div><button data-ui-sortable-handle>移動</button><input value="keep"></div><div>second</div></div>';
    KavUI.init(host);const handle=host.querySelector('button'),input=host.querySelector('input');
    input.dispatchEvent(new KeyboardEvent('keydown',{key:' ',bubbles:true,cancelable:true}));assert(!host.querySelector('[data-ui-sortable-active]'),'input ignored');
    handle.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));assert(host.querySelector('[data-ui-sortable-active]'),'handle pickup');KavUI.destroy(host);
    return 'keyboard, pointer/touch, event, cancel, boundaries, handles, destroy/reinit: PASS';
  })()`);
  console.log(result);
}
