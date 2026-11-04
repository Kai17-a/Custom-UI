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
      if(!reduced)assert(panelExit?.getAnimations().length>0,'panel exit');
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
      fixture.remove();return true;
    })()`);
    if(!result)throw new Error('Motion checks did not complete');
  }
  await send('Emulation.setEmulatedMedia',{features:[]});
  console.log('Motion: native overlays enter/exit, final state/focus/events, interruption, disclosure, removed tooltip/toast and reduced motion');
}
