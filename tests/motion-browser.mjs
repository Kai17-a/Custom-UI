/* Called by run-browser.mjs with its dependency-free CDP harness. */
export async function checkMotion({evaluate, send}) {
  for (const reduced of [false, true]) {
    await send('Emulation.setEmulatedMedia', {features:[{name:'prefers-reduced-motion', value:reduced?'reduce':'no-preference'}]});
    await evaluate(`(()=>{
      const spacer=document.createElement('div');spacer.id='motion-scroll-spacer';spacer.style.height='3000px';document.body.append(spacer);
      const el=document.createElement('dialog');el.id='motion-scroll-modal';el.className='ui-dialog';el.innerHTML='<button>Close</button>';document.body.append(el);
      scrollTo({top:0,behavior:'instant'});el.showModal();
    })()`);
    const wheel=async()=>{await send('Input.dispatchMouseEvent',{type:'mouseWheel',x:5,y:5,deltaX:0,deltaY:120});await evaluate('new Promise(r=>setTimeout(r,180))');};
    await evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
    const lockedY=await evaluate('scrollY');
    await wheel();
    if(await evaluate('scrollY')!==lockedY)throw new Error('Motion: modal background wheel lock');
    await evaluate("document.querySelector('#motion-scroll-modal').close()");
    await wheel();
    if(await evaluate('scrollY')<=lockedY)throw new Error('Motion: page wheel restored after close');
    await evaluate("scrollTo({top:0,behavior:'instant'});document.querySelector('#motion-scroll-modal').show()");
    await wheel();
    if(await evaluate('scrollY')===0)throw new Error('Motion: nonmodal must allow page wheel');
    await evaluate("document.querySelector('#motion-scroll-modal').remove();document.querySelector('#motion-scroll-spacer').remove()");
    const result = await evaluate(`(async()=>{
      const reduced=${reduced};
      const assert=(condition,label)=>{if(!condition)throw new Error('Motion: '+label);};
      const frame=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      const settle=async el=>{await Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{})));};
      const fixture=document.createElement('section');document.body.append(fixture);
      fixture.innerHTML='<button id="motion-return">Open</button>';
      const trigger=fixture.firstElementChild;
      const supported=CSS.supports('transition-behavior','allow-discrete')&&CSS.supports('overlay','auto');
      for(const [classes,popover] of [['ui-dialog',false],['ui-dialog ui-drawer',false],['ui-dialog ui-command',false],['ui-popup',true],['ui-select-menu',true],['ui-input-popup',true],['ui-datepicker-popup',true]]) {
        const el=document.createElement(popover?'div':'dialog');el.className=classes;
        if(popover)el.setAttribute('popover','manual');else el.setAttribute('data-ui-dialog','');
        el.innerHTML='<button>Content</button>';fixture.append(el);
        await frame();trigger.focus();
        const events=[];el.addEventListener('ui:shown',()=>events.push('shown'));el.addEventListener('ui:hidden',()=>events.push('hidden'));
        if(popover)el.showPopover();else KavUI.show(el,trigger);
        await frame();
        assert(reduced ? el.getAnimations().length===0 : !supported || el.getAnimations().length>0,classes+' enter');
        await settle(el);
        if(!popover)assert(getComputedStyle(el).translate==='none',classes+' settled fixed-position descendants keep viewport coordinates');
        if(popover)el.hidePopover();else KavUI.hide(el);
        // Flush styles while the CSS display/overlay exit is still running.
        getComputedStyle(el).opacity;
        assert(popover?!el.matches(':popover-open'):!el.open,classes+' semantic close');
        assert(!document.querySelector('[data-ui-motion-ghost]'),classes+' no overlay copy');
        if(!reduced&&supported)assert(el.getAnimations().some(a=>a instanceof CSSTransition),classes+' CSS exit');
        else assert(getComputedStyle(el).display==='none',classes+' immediate display');
        await settle(el);await frame();
        assert(getComputedStyle(el).display==='none',classes+' final display');
        if(!popover){assert(document.activeElement===trigger,classes+' focus');assert(events.join(',')==='shown,hidden',classes+' event order');}
        // Interrupt an exit, then ensure its completion cannot hide the new open.
        if(popover)el.showPopover();else KavUI.show(el,trigger);
        await frame();await settle(el);
        if(popover)el.hidePopover();else KavUI.hide(el);
        if(popover)el.showPopover();else KavUI.show(el,trigger);
        await frame();await settle(el);
        assert(popover?el.matches(':popover-open'):el.open,classes+' reopen');
        if(!popover)assert(!document.querySelector('[data-ui-motion-ghost]'),classes+' canceled exit');
        if(popover)el.hidePopover();else KavUI.hide(el);
        await settle(el);
        const finalExit=document.querySelector('[data-ui-motion-ghost]');if(finalExit)await settle(finalExit);
        el.remove();
      }
      const large=document.createElement('dialog');large.className='ui-dialog';large.dataset.uiDialog='';
      large.innerHTML='<button>Focus</button>'+'<div>Content</div>'.repeat(2000);fixture.append(large);
      KavUI.show(large,trigger);await frame();await settle(large);
      const start=performance.now();KavUI.hide(large);const elapsed=performance.now()-start;
      assert(elapsed<50,'2000 descendants hide <50ms: '+elapsed);
      assert(!large.open&&document.activeElement===trigger,'large immediate close/focus');
      assert(!document.querySelector('[data-ui-motion-ghost]'),'large no copy');await settle(large);large.remove();
      const scrolling=document.createElement('dialog');scrolling.className='ui-dialog';scrolling.style.cssText='height:240px;width:400px;overflow:auto';
      scrolling.innerHTML='<div style="height:150px;overflow:auto;width:180px"><div style="width:600px;height:600px">Nested</div></div><div style="height:900px">Long</div>';fixture.append(scrolling);
      scrolling.showModal();await frame();await settle(scrolling);
      scrolling.scrollTop=300;scrolling.firstElementChild.scrollTop=80;scrolling.firstElementChild.scrollLeft=60;
      const offsets=()=>[scrolling.scrollTop,scrolling.firstElementChild.scrollTop,scrolling.firstElementChild.scrollLeft];
      const beforeClose=offsets();scrolling.close();getComputedStyle(scrolling).opacity;
      if(!reduced&&supported)assert(JSON.stringify(offsets())===JSON.stringify(beforeClose)&&beforeClose.every(n=>n>0),'native exit retains scroll offsets');
      await settle(scrolling);scrolling.remove();
      const sidebar=document.createElement('div');sidebar.className='app-shell';sidebar.dataset.uiSidebar='';
      for(const device of ['mobile','tablet','desktop'])sidebar.setAttribute('data-ui-sidebar-'+device,'top');
      sidebar.innerHTML='<aside class="app-sidebar"><button>Menu</button></aside>';fixture.append(sidebar);KavUI.init(sidebar);
      KavUI.sidebar(sidebar,{open:true,trigger});await frame();
      const shell=document.querySelector('.ui-sidebar-dialog');await settle(shell);
      KavUI.sidebar(sidebar,{open:false,trigger});getComputedStyle(shell).opacity;
      assert(!shell.open&&sidebar.firstElementChild.hidden,'sidebar restores closed state immediately');
      if(!reduced&&supported)assert(shell.isConnected&&shell.getAnimations().some(a=>a instanceof CSSTransition),'sidebar native shell exit');
      await settle(shell);await frame();assert(!shell.isConnected,'sidebar shell cleanup');KavUI.destroy(sidebar);sidebar.remove();
      const live=[...document.querySelectorAll('.visually-hidden[aria-live]')];
      const polite=live.find(n=>n.getAttribute('aria-live')==='polite'),assertive=live.find(n=>n.getAttribute('aria-live')==='assertive');
      assert(polite&&assertive,'live regions exist before first toast');
      const announcements=[];
      const observer=new MutationObserver(()=>announcements.push(polite.textContent));observer.observe(polite,{childList:true,subtree:true,characterData:true});
      const note=KavUI.toast('Repeat',{duration:0});await new Promise(r=>setTimeout(r,80));
      assert(polite.textContent==='Repeat'&&!note.hasAttribute('role'),'polite separate announcement');
      assert(note.parentElement.getAttribute('role')==='region'&&note.parentElement.getAttribute('aria-label'),'named toast region');
      const again=KavUI.toast('Repeat',{duration:0});assert(polite.textContent==='','repeat clears region');
      await new Promise(r=>setTimeout(r,80));assert(polite.textContent==='Repeat'&&announcements.filter(x=>x==='Repeat').length===2,'repeat announced twice');
      const error=KavUI.toast({title:'Error',body:'Failed',meta:'Now',variant:'danger',duration:0});await new Promise(r=>setTimeout(r,80));
      assert(assertive.textContent==='Error Failed Now','assertive announcement');observer.disconnect();[note,again,error].forEach(n=>n.remove());
      for(const method of ['cancel','submit']) {
        const native=document.createElement('dialog');native.className='ui-dialog';native.dataset.uiDialog='';
        native.innerHTML='<form method="dialog"><button>Done</button></form>';fixture.append(native);
        KavUI.show(native,trigger);await frame();await settle(native);
        if(method==='cancel')native.requestClose();else native.querySelector('button').click();
        getComputedStyle(native).opacity;
        assert(!native.open,'native '+method+' semantic close');
        if(!reduced&&supported)assert(native.getAnimations().some(a=>a instanceof CSSTransition),'native '+method+' CSS exit');
        await settle(native);assert(document.activeElement===trigger,'native '+method+' focus');native.remove();
      }
      const oversized=KavUI.toast('Large',{duration:0});
      oversized.querySelector('.words').insertAdjacentHTML('beforeend','<span>Extra</span>'.repeat(101));
      await frame();await settle(oversized);oversized.querySelector('[data-ui-dismiss]').click();
      assert(!oversized.isConnected&&!document.querySelector('[data-ui-motion-ghost]'),'large toast skips copy');
      const panel=document.createElement('div');panel.dataset.uiPanel='motion';panel.hidden=true;panel.textContent='Panel';fixture.append(panel);
      await frame();KavUI.show(panel);await frame();await settle(panel);KavUI.hide(panel);
      getComputedStyle(panel).display;
      assert(panel.hidden,'panel final hidden');
      const panelExit=document.querySelector('[data-ui-motion-ghost]');
      assert(!panelExit,'normal-flow panel has no exit copy');
      if(panelExit)await settle(panelExit);
      await settle(panel);assert(getComputedStyle(panel).display==='none','panel final display');
      const details=document.createElement('details');details.innerHTML='<summary>Disclosure</summary><a href="#motion-return">Focus</a><p>One</p><p>Two</p>';fixture.append(details);
      if(CSS.supports('interpolate-size','allow-keywords')&&CSS.supports('selector(details::details-content)')) {
        const height=()=>details.getBoundingClientRect().height;
        const settleHeight=async()=>{
          // Chromium does not expose ::details-content transitions via getAnimations().
          const duration=parseFloat(getComputedStyle(details,'::details-content').transitionDuration)*1000;
          await new Promise(resolve=>setTimeout(resolve,duration+40));await frame();
        };
        await frame();const closedHeight=height();details.open=true;
        details.querySelector('a').focus();
        assert(document.activeElement===details.querySelector('a'),'disclosure immediate focus');
        await frame();
        const openingHeight=height();
        const style=getComputedStyle(details,'::details-content');
        assert(reduced?style.transitionDuration==='0s':style.transitionProperty.includes('block-size'),'disclosure timing');
        await settleHeight();const openHeight=height();
        assert(openHeight>closedHeight,'disclosure expanded height');
        if(!reduced)assert(openingHeight>closedHeight&&openingHeight<openHeight,'disclosure height enter');
        details.open=false;await frame();
        const closingHeight=height();
        if(!reduced)assert(closingHeight>closedHeight&&closingHeight<openHeight,'disclosure height exit');
        await settleHeight();assert(!details.open&&Math.abs(height()-closedHeight)<1,'disclosure final closed');
        details.querySelector('a').focus();
        assert(document.activeElement!==details.querySelector('a'),'closed disclosure cannot receive focus');
      }
      for(const type of ['tooltip','toast']) {
        let el;
        if(type==='toast')el=KavUI.toast('Motion',{duration:0});
        else {trigger.blur();trigger.dataset.uiTooltip='Motion';trigger.focus();el=document.querySelector('.ui-tooltip');}
        assert(!!el,type+' created');
        if(!reduced)assert(el.getAnimations().length>0,type+' enter');
        await settle(el);
        if(type==='toast')el.querySelector('[data-ui-dismiss="toast"]').click();else trigger.blur();
        assert(!el.isConnected,type+' semantic removal');
        assert(reduced?!document.querySelector('[data-ui-motion-ghost]'):!!document.querySelector('[data-ui-motion-ghost]'),type+' exit visual');
        await Promise.all([...document.querySelectorAll('[data-ui-motion-ghost]')].flatMap(node=>node.getAnimations()).map(a=>a.finished.catch(()=>{})));
        await frame();assert(!document.querySelector('[data-ui-motion-ghost]'),type+' cleanup');
      }
      // Bottom-anchored toast stacks reflow without painting an exit over survivors.
      const notes=[1,2,3].map(n=>KavUI.toast('Stack '+n,{duration:0}));
      const region=notes[0].parentElement;
      await frame();await Promise.all(notes.map(settle));
      const before=notes[0].getBoundingClientRect(),removedTop=notes[1].getBoundingClientRect().top,overflowBefore=getComputedStyle(region).overflowY;
      notes[1].querySelector('[data-ui-dismiss="toast"]').click();
      const ghost=document.querySelector('[data-ui-motion-ghost]');
      assert(!notes[1].isConnected,'toast immediate removal');
      if(!reduced){
        // The region shrinks from the top, so the copy keeps its viewport position.
        assert(ghost&&ghost.parentElement===region.parentElement&&getComputedStyle(ghost).position==='fixed','toast exit outside the shrinking region');
        assert(Math.abs(ghost.getBoundingClientRect().top-removedTop)<1,'toast exit keeps its position');
        assert(Number(getComputedStyle(ghost).zIndex)<Number(getComputedStyle(region).zIndex),'toast exit below survivors');
        assert(getComputedStyle(region).overflowY==='visible','toast survivors are not clipped while sliding');
        const flip=notes[0].getAnimations().find(a=>a.effect.getKeyframes().some(k=>k.transform&&k.transform!=='none'));
        assert(!!flip,'toast survivor FLIP transform');
        const after=notes[0].getBoundingClientRect();
        assert(Math.abs(before.top-after.top)<3,'toast survivor starts at old position');
      }else assert(!ghost&&notes.every(n=>!n.getAnimations().length),'toast reduced motion');
      await Promise.all([...document.querySelectorAll('[data-ui-motion-ghost]'),...notes].map(settle));await frame();
      assert(getComputedStyle(region).overflowY===overflowBefore,'toast region overflow restored');
      notes.forEach(n=>n.remove());
      // Overflow eviction must count notifications, never the inert ghosts.
      const overflow=Array.from({length:8},()=>KavUI.toast('Evict',{duration:0}));
      assert(region.querySelectorAll(':scope > .ui-toast').length===5,'toast eviction limit');
      await Promise.all([...document.querySelectorAll('[data-ui-motion-ghost]')].map(settle));overflow.forEach(n=>n.remove());
      const timed=KavUI.toast('Timeout',{duration:20});
      await new Promise(resolve=>setTimeout(resolve,50));assert(!timed.isConnected,'toast automatic removal');
      await Promise.all([...document.querySelectorAll('[data-ui-motion-ghost]')].map(settle));
      // Close from actual captured scroll events; opening again restores CSS motion.
      const popup=document.createElement('div');popup.id='motion-popup';popup.className='ui-popup';popup.dataset.uiDropdown='';popup.innerHTML='<button class="ui-dropdown-item">Item</button>';fixture.append(popup);
      const opener=document.createElement('button');opener.dataset.uiToggle='dropdown';opener.dataset.uiTarget='#motion-popup';opener.textContent='Menu';fixture.append(opener);KavUI.init(fixture);
      opener.click();await frame();await settle(popup);
      document.dispatchEvent(new Event('scroll'));
      assert(!popup.matches(':popover-open')&&getComputedStyle(popup).display==='none','scroll popup immediate display');
      opener.click();await frame();
      assert(popup.matches(':popover-open')&&!popup.hasAttribute('data-ui-motion-immediate'),'popup motion restored');
      if(!reduced&&supported)assert(popup.getAnimations().length>0,'popup reopen animates');
      await settle(popup);document.dispatchEvent(new Event('scroll'));
      trigger.dataset.uiTooltip='Scroll';trigger.blur();trigger.focus();await frame();
      const bubble=document.querySelector('.ui-tooltip');assert(!!bubble,'scroll tooltip open');await settle(bubble);
      document.dispatchEvent(new Event('scroll'));
      assert(!bubble.isConnected&&!document.querySelector('[data-ui-motion-ghost]'),'scroll tooltip no exit copy');trigger.blur();
      for(const direction of ['','ui-drawer-start','ui-drawer-top','ui-drawer-bottom'])for(const dir of ['ltr','rtl']) {
        const drawer=document.createElement('dialog');drawer.className='ui-dialog ui-drawer '+direction;drawer.dir=dir;drawer.dataset.uiDialog='';drawer.innerHTML='<button>Drawer</button>';fixture.append(drawer);
        KavUI.show(drawer,trigger);await frame();await settle(drawer);
        const style=getComputedStyle(drawer),expected=style.getPropertyValue('--ui-drawer-x').trim()+' '+style.getPropertyValue('--ui-drawer-y').trim();
        KavUI.hide(drawer);
        getComputedStyle(drawer).opacity;
        if(!reduced&&supported){
          const exit=drawer.getAnimations().find(a=>a instanceof CSSTransition&&a.transitionProperty==='translate');
          assert(!!exit,'drawer CSS exit');
          const end=exit.effect.getKeyframes().at(-1).translate;
          const normalized=document.createElement('div');normalized.style.translate=expected;
          assert(end===normalized.style.translate,'drawer direction '+direction+' '+dir+': '+end+' / '+expected);
        }
        assert(!document.querySelector('[data-ui-motion-ghost]'),'drawer no copy');
        await settle(drawer);drawer.remove();
      }
      KavUI.setDesignTheme('glass');KavUI.setColorTheme('dark');
      assert(document.body.getAnimations().length===0,'theme has no body animation');
      KavUI.setDesignTheme('default');KavUI.setColorTheme('light');
      assert(document.body.getAnimations().length===0,'theme return has no body animation');
      const tabs=document.createElement('div');tabs.dataset.uiTabs='';tabs.innerHTML='<div class="tabs" role="tablist" style="width:180px;display:flex;flex-wrap:wrap"><button style="width:130px" data-ui-toggle="tab" data-ui-target="#motion-tab-a">First</button><button style="width:130px" data-ui-toggle="tab" data-ui-target="#motion-tab-b">Second</button></div><div id="motion-tab-a" data-ui-panel>A</div><div id="motion-tab-b" data-ui-panel hidden>B</div>';fixture.append(tabs);KavUI.init(tabs);await frame();
      const tabButtons=tabs.querySelectorAll('[role="tab"]');
      assert(tabButtons.length===2&&tabButtons[1].getBoundingClientRect().top>tabButtons[0].getBoundingClientRect().top,'tabs wrap fixture');
      tabButtons[1].click();
      const underline=tabButtons[1].getAnimations({subtree:true}).find(a=>a.effect.getKeyframes().some(k=>k.translate));
      if(!reduced){assert(!!underline,'wrapped underline animation');assert(parseFloat(underline.effect.getKeyframes()[0].translate.split(' ')[1])!==0,'wrapped underline y motion');await settle(tabButtons[1]);}
      else assert(!underline,'wrapped underline reduced motion');
      fixture.remove();return {hideMilliseconds:elapsed};
    })()`);
    if(!result)throw new Error('Motion checks did not complete');
    console.log('Motion: 2000 descendants hide '+result.hideMilliseconds.toFixed(2)+'ms (reduced='+reduced+')');

  }
  await send('Emulation.setEmulatedMedia',{features:[]});
  console.log('Motion: native overlays enter/exit, final state/focus/events, interruption, disclosure, removed tooltip/toast and reduced motion');
}
