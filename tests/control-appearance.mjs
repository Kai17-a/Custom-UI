// Shared by the existing real-browser runner: assert rendered results, not CSS text.
export async function checkControlAppearance({navigate, evaluate, send, key}) {
  await navigate('tests/control-appearance.html');
  const failures = [];
  const check = (valid, message) => { if (!valid) failures.push(message); };
  try {
    const contrast = await evaluate(`(() => {
      const bad=[],canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
      const rgba=color=>{ctx.clearRect(0,0,1,1);ctx.fillStyle=color;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data];};
      const blend=(a,b)=>a.slice(0,3).map((v,i)=>v*a[3]/255+b[i]*(1-a[3]/255));
      const lum=rgb=>rgb.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
      const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
      KavUI.setCustomPalette('#7d6b91',{chroma:24});
      const input=document.querySelector('#appearance-input');
      for(const palette of ['default','slate','sage','teal','mauve','sand','clay','custom'])for(const mode of ['light','dark'])for(const design of ['default','flat','soft']) {
        KavUI.setPalette(palette);KavUI.setColorTheme(mode);KavUI.setDesignTheme(design);
        const css=getComputedStyle(input),body=rgba(getComputedStyle(document.body).backgroundColor);
        const bg=blend(rgba(css.backgroundColor),body),border=blend(rgba(css.borderTopColor),bg);
        const placeholder=getComputedStyle(input,'::placeholder'),ink=rgba(placeholder.color);ink[3]*=Number(placeholder.opacity);
        const outlineRatio=ratio(border,bg),textRatio=ratio(blend(ink,bg),bg);
        if(outlineRatio<3 || textRatio<4.5)bad.push({palette,mode,design,outlineRatio,textRatio});
      }
      KavUI.setPalette('default');KavUI.setColorTheme('light');KavUI.setDesignTheme('default');
      return bad;
    })()`);
    check(!contrast.length,'境界3:1／placeholder4.5:1: '+JSON.stringify(contrast));
    for (const forced of [false,true]) {
      await send('Emulation.setEmulatedMedia',{features:forced?[{name:'forced-colors',value:'active'}]:[]});
      await evaluate(`document.querySelector('#appearance-start').focus()`);
      for (const selector of ['#appearance-button','#appearance-input']) {
        await key('Tab');
        const focus=await evaluate(`(()=>{const el=document.querySelector('${selector}'),s=getComputedStyle(el);return {focused:el===document.activeElement,visible:el.matches(':focus-visible'),outline:s.outlineStyle,width:parseFloat(s.outlineWidth)};})()`);
        check(focus.focused && focus.visible && focus.outline!=='none' && focus.width>=2,'Tabフォーカス '+selector+' forced='+forced+': '+JSON.stringify(focus));
      }
    }
    await send('Emulation.setEmulatedMedia',{features:[]});
    await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
    for (const width of [320,390]) {
      await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});
      const touch=await evaluate(`(()=>{
        const bad=[],fonts=[],selectors=['.btn','.btn-close','.form-check','.form-control:not(.ui-picker-native)','.ui-select-trigger','.ui-calendar-day'];
        for(const selector of selectors)for(const el of document.querySelectorAll(selector)) {
          const r=el.getBoundingClientRect();if(!r.width||!r.height)continue;
          if(el.matches('input.form-control,textarea.form-control,.ui-select-trigger,.ui-input-picker-trigger') && parseFloat(getComputedStyle(el).fontSize)<16)fonts.push(el.className);
          // A seven-column month must fit 320px; day buttons need 44px height, not forced width.
          if(r.height<43.9 || (!el.matches('.ui-calendar-day,.form-control,.ui-select-trigger,.form-check') && r.width<43.9))bad.push({selector,width:r.width,height:r.height});
        }
        return {coarse:matchMedia('(pointer:coarse)').matches,bad,fonts,overflow:document.documentElement.scrollWidth>innerWidth+1};
      })()`);
      check(touch.coarse && !touch.bad.length && !touch.fonts.length && !touch.overflow,'タッチ領域 @'+width+': '+JSON.stringify(touch));
      await evaluate(`document.querySelector('.ui-datepicker-toggle').click()`);
      const picker=await evaluate(`(()=>{const popup=document.querySelector('.ui-datepicker-popup'),r=popup.getBoundingClientRect();return {open:popup.matches(':popover-open'),fit:r.left>=0&&r.right<=innerWidth,days:[...popup.querySelectorAll('.ui-calendar-day')].every(el=>el.getBoundingClientRect().height>=44)};})()`);
      check(picker.open && picker.fit && picker.days,'日付ポップアップ @'+width+': '+JSON.stringify(picker));
      await key('Escape');
    }
    await send('Emulation.setTouchEmulationEnabled',{enabled:false});
    await send('Emulation.setDeviceMetricsOverride',{width:1280,height:800,deviceScaleFactor:1,mobile:false});
    check(await evaluate(`document.querySelector('#appearance-button').getBoundingClientRect().height<44`),'デスクトップの小型表示を維持');
  } finally {
    await send('Emulation.setTouchEmulationEnabled',{enabled:false});
    await send('Emulation.setEmulatedMedia',{features:[]});
    await send('Emulation.setDeviceMetricsOverride',{width:1280,height:800,deviceScaleFactor:1,mobile:false});
  }
  if(failures.length)throw new Error('Control appearance:\n'+failures.join('\n'));
  console.log('Control appearance: 8 palettes × light/dark × 3 surfaces; native Tab/forced-colors; coarse pointer @320/390, date popup and desktop density');
}
