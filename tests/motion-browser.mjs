/* Called by run-browser.mjs with its dependency-free CDP harness. */
export async function checkMotion({evaluate, send}) {
  for (const reduced of [false, true]) {
    await send('Emulation.setEmulatedMedia', {features:[{name:'prefers-reduced-motion', value:reduced?'reduce':'no-preference'}]});
    const result = await evaluate(`(async()=>{
      const reduced=${reduced};
      const assert=(condition,label)=>{if(!condition)throw new Error('Motion: '+label);};
      const frame=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      const settle=async el=>{await Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{})));};
      const fixture=document.createElement('section');document.body.append(fixture);
      fixture.innerHTML='<button id="motion-return">Open</button>';
      const trigger=fixture.firstElementChild;
      const supported=CSS.supports('transition-behavior','allow-discrete');
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
        if(popover)el.hidePopover();else KavUI.hide(el);
        // Flush styles while the CSS display/overlay exit is still running.
        getComputedStyle(el).opacity;
        assert(popover?!el.matches(':popover-open'):!el.open,classes+' semantic close');
        const exitSurface=popover?el:document.querySelector('[data-ui-motion-ghost]');
        if(!reduced&&(!popover||supported))assert(exitSurface?.getAnimations().length>0,classes+' exit');
        if(!popover&&exitSurface)assert(exitSurface.inert&&exitSurface.getAttribute('aria-hidden')==='true'&&!exitSurface.shadowRoot,classes+' inert exit');
        if(!popover){assert(getComputedStyle(el).display==='none',classes+' immediate display');if(exitSurface)await settle(exitSurface);}
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
      const before=notes[0].getBoundingClientRect();
      notes[1].querySelector('[data-ui-dismiss="toast"]').click();
      const ghost=region.querySelector('[data-ui-motion-ghost]');
      assert(!notes[1].isConnected,'toast immediate removal');
      if(!reduced){
        assert(ghost&&ghost.parentElement===region&&getComputedStyle(ghost).position==='absolute','toast local exit');
        assert(Number(getComputedStyle(ghost).zIndex)<0,'toast exit below survivors');
        const flip=notes[0].getAnimations().find(a=>a.effect.getKeyframes().some(k=>k.transform&&k.transform!=='none'));
        assert(!!flip,'toast survivor FLIP transform');
        const after=notes[0].getBoundingClientRect();
        assert(Math.abs(before.top-after.top)<3,'toast survivor starts at old position');
      }else assert(!ghost&&notes.every(n=>!n.getAnimations().length),'toast reduced motion');
      await Promise.all([...region.querySelectorAll('[data-ui-motion-ghost]'),...notes].map(settle));
      notes.forEach(n=>n.remove());
      // Overflow eviction must count notifications, never the inert ghosts.
      const overflow=Array.from({length:8},()=>KavUI.toast('Evict',{duration:0}));
      assert(region.querySelectorAll(':scope > .ui-toast').length===5,'toast eviction limit');
      await Promise.all([...region.querySelectorAll('[data-ui-motion-ghost]')].map(settle));overflow.forEach(n=>n.remove());
      const timed=KavUI.toast('Timeout',{duration:20});
      await new Promise(resolve=>setTimeout(resolve,50));assert(!timed.isConnected,'toast automatic removal');
      await Promise.all([...region.querySelectorAll('[data-ui-motion-ghost]')].map(settle));
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
        const exit=document.querySelector('[data-ui-motion-ghost]');
        if(!reduced){assert(!!exit,'drawer exit');const end=exit.getAnimations()[0].effect.getKeyframes().at(-1).translate;const normalized=document.createElement('div');normalized.style.translate=expected;assert(end===normalized.style.translate,'drawer direction '+direction+' '+dir+': '+end+' / '+expected);await settle(exit);}
        else assert(!exit,'drawer reduced motion');drawer.remove();
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
      fixture.remove();return true;
    })()`);
    if(!result)throw new Error('Motion checks did not complete');
    // Inspect the closed shadow through CDP without exposing it to application JS.
    if(!reduced) {
      const expected=await evaluate(`(async()=>{
        const dialog=document.createElement('dialog');dialog.id='motion-scroll-dialog';dialog.className='ui-dialog';dialog.dataset.uiDialog='';
        dialog.style.cssText='height:240px;width:400px;min-width:0;overflow:auto';
        dialog.innerHTML='<div style="height:150px;overflow:auto;width:180px"><div style="width:600px;height:600px">Nested scroll</div></div><div style="height:900px">Long content</div>';
        document.body.append(dialog);KavUI.show(dialog);await new Promise(r=>setTimeout(r,250));
        dialog.scrollTop=300;dialog.firstElementChild.scrollTop=80;dialog.firstElementChild.scrollLeft=60;
        const expected=[dialog.scrollLeft,dialog.scrollTop,dialog.firstElementChild.scrollLeft,dialog.firstElementChild.scrollTop];
        KavUI.hide(dialog);const host=document.querySelector('[data-ui-motion-ghost]');host.getAnimations().forEach(a=>a.pause());return expected;
      })()`);
      const {root}=await send('DOM.getDocument',{depth:-1,pierce:true});
      const find=node=>{
        if(node.attributes?.includes('data-ui-motion-ghost'))return node;
        for(const child of [...(node.children||[]),...(node.shadowRoots||[])]){const found=find(child);if(found)return found;}
      };
      const host=find(root),surface=host?.shadowRoots?.[0]?.children?.find(node=>node.nodeType===1);
      if(!surface)throw new Error('Motion: closed shadow scroll surface missing');
      const {object}=await send('DOM.resolveNode',{nodeId:surface.nodeId});
      const {result:scroll}=await send('Runtime.callFunctionOn',{objectId:object.objectId,functionDeclaration:'function(){return [this.scrollLeft,this.scrollTop,this.firstElementChild.scrollLeft,this.firstElementChild.scrollTop]}',returnByValue:true});
      if(JSON.stringify(scroll.value)!==JSON.stringify(expected)||expected[1]===0||expected[2]===0||expected[3]===0)throw new Error('Motion: dialog clone scroll '+JSON.stringify(scroll.value)+' expected '+JSON.stringify(expected));
      await evaluate(`(async()=>{const host=document.querySelector('[data-ui-motion-ghost]');host.getAnimations().forEach(a=>a.finish());await Promise.resolve();document.querySelector('#motion-scroll-dialog').remove();})()`);
    }

  }
  await send('Emulation.setEmulatedMedia',{features:[]});
  console.log('Motion: native overlays enter/exit, final state/focus/events, interruption, disclosure, removed tooltip/toast and reduced motion');
}
