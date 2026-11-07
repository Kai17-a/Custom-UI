/* Fixed progress geometry, painting order and inherited accessibility preferences. */
export async function checkFixedProgress({navigate,evaluate,send,click}) {
  await navigate('components/loading.html');
  for (const width of [390,1280]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
    await evaluate(`(() => {
      document.body.insertAdjacentHTML('beforeend','<header id="progress-header" class="ui-header ui-header-sticky" style="position:fixed;inset:0 0 auto;height:40px">Header</header><progress id="fixed-progress" class="ui-progress ui-progress-top" aria-label="同期中"></progress>');
    })()`);
    for (const edge of ['top','bottom']) for (const value of [null,60]) {
      const result=await evaluate(`(() => {
        const p=document.querySelector('#fixed-progress');p.className='ui-progress ui-progress-${edge}';
        ${value===null?"p.removeAttribute('value')":"p.max=100;p.value=60"};
        const r=p.getBoundingClientRect(),s=getComputedStyle(p);
        return {x:r.x,y:r.y,bottom:r.bottom,width:r.width,viewport:document.documentElement.clientWidth,height:r.height,radius:s.borderRadius,hit:document.elementFromPoint(10,${edge==='top'?'2':'innerHeight-2'})===p};
      })()`);
      if(result.x!==0||result.width!==result.viewport||result.height!==4||result.radius!=='0px'||!result.hit||(edge==='top'?result.y!==0:result.bottom!==900))throw new Error('Fixed progress geometry/order '+JSON.stringify({width,edge,value,result}));
      await evaluate(`(() => {
        const p=document.querySelector('#fixed-progress');
        for(const [size,height] of [['sm',4],['lg',14]]) {
          p.classList.add('ui-progress-'+size);
          if(p.getBoundingClientRect().height!==height)throw new Error('Fixed progress size '+size);
          p.classList.remove('ui-progress-'+size);
        }
        const toast=KavUI.toast('Progress ordering',{duration:0});const region=toast.parentElement;
        region.style.cssText='position:fixed;inset:${edge==='top'?'0 0 auto':'auto 0 0'};width:100%;height:40px';
        if(!region.contains(document.elementFromPoint(10,${edge==='top'?'2':'innerHeight-2'})))throw new Error('Toast must paint above progress');
        region.remove();
        const dialog=document.createElement('dialog');dialog.className='ui-dialog';dialog.innerHTML='<button>閉じる</button>';document.body.append(dialog);dialog.showModal();
        if(document.elementFromPoint(10,${edge==='top'?'2':'innerHeight-2'})===p)throw new Error('Modal top layer must paint above progress');
        dialog.close();dialog.remove();
        p.hidden=true;if(p.getClientRects().length)throw new Error('Fixed progress hidden');p.hidden=false;
      })()`);
    }
    await evaluate(`document.querySelector('#fixed-progress').remove();document.querySelector('#progress-header').remove()`);
  }
  await evaluate(`document.body.insertAdjacentHTML('beforeend','<progress id="fixed-progress" class="ui-progress ui-progress-top" aria-label="同期中"></progress>')`);
  for(const design of ['default','glass','glassmorphism','flat','soft']) for(const mode of ['light','dark']) {
    await evaluate(`KavUI.setDesignTheme(${JSON.stringify(design)});KavUI.setColorTheme(${JSON.stringify(mode)})`);
    for(const determinate of [false,true]) {
      const ratio=await evaluate(`(() => {
        const p=document.querySelector('#fixed-progress');${determinate?'p.value=0.6':"p.removeAttribute('value')"};
        const probe=document.createElement('span');document.body.append(probe);
        const ctx=document.createElement('canvas').getContext('2d');
        const lum=token=>{probe.style.color=getComputedStyle(p).getPropertyValue(token);ctx.fillStyle=getComputedStyle(probe).color;ctx.fillRect(0,0,1,1);const c=[...ctx.getImageData(0,0,1,1).data].slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return c[0]*.2126+c[1]*.7152+c[2]*.0722;};
        const a=lum('--ui-progress-color'),b=lum('--ui-progress-track');probe.remove();return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
      })()`);
      if(ratio<3)throw new Error('Progress contrast '+JSON.stringify({design,mode,determinate,ratio}));
    }
  }
  for(const reduced of [false,true]) {
    await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:reduced?'reduce':'no-preference'}]});
    if(!await evaluate(`(() => {const p=document.querySelector('#fixed-progress');p.removeAttribute('value');return (getComputedStyle(p).animationName==='none')===${reduced};})()`))throw new Error('Fixed progress reduced motion');
  }
  await send('Emulation.setEmulatedMedia',{features:[{name:'forced-colors',value:'active'}]});
  if(!await evaluate(`(() => {const p=document.querySelector('#fixed-progress'),s=getComputedStyle(p);return s.forcedColorAdjust==='none'&&s.getPropertyValue('--ui-progress-color').trim()==='Highlight'&&s.getPropertyValue('--ui-progress-track').trim()==='Canvas';})()`))throw new Error('Fixed progress forced colors');
  await send('Emulation.setEmulatedMedia',{features:[]});
  await evaluate(`document.querySelector('#fixed-progress').remove();KavUI.setDesignTheme('default');KavUI.setColorTheme('light')`);
  console.log('Fixed progress: 390/1280, both edges/values, sizes, header/toast order, 5 designs × light/dark contrast, motion and forced colors');
}
