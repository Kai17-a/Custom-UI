export async function checkThemeSurfaces({navigate,evaluate,send}) {
  await navigate('components/themes.html');
  const result=await evaluate(`(()=>{
    const bad=[],check=(ok,label)=>{if(!ok)bad.push(label);};
    const host=document.createElement('div');host.innerHTML='<div class="ui-card"></div><div class="ui-toolbar"></div><aside class="app-sidebar"></aside><section class="ui-surface"></section><header class="ui-page-header ui-page-header-panel"><h2>Panel</h2><p class="type-caption">Description</p></header><input class="form-control"><input class="form-control" readonly value="Readonly"><input class="form-control" disabled><div class="ui-input-popup"></div>';
    document.body.append(host);
    const [card,toolbar,sidebar,surface,header,editable,readonly,disabled,overlay]=host.children;
    const css=el=>getComputedStyle(el),color=el=>css(el).backgroundColor;
    const ctx=document.createElement('canvas').getContext('2d');
    const rgb=value=>{ctx.clearRect(0,0,1,1);ctx.fillStyle=value;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data];};
    const lum=rgb=>rgb.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
    const ratio=(a,b)=>{a=lum(a);b=lum(b);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);};
    for(const mode of ['light','dark'])for(const theme of ['default','glass','glassmorphism','flat','soft']) {
      KavUI.setColorTheme(mode);KavUI.setDesignTheme(theme);document.body.style.removeProperty('--ui-theme-surface-opacity');
      const tag=theme+'/'+mode;
      if(theme==='glass'||theme==='glassmorphism') {
        const expected=document.createElement('div');host.append(expected);
        for(const [el,percent] of [[card,theme==='glass'?78:52],[editable,theme==='glass'?86:72],[overlay,theme==='glass'?94:90]]) {
          expected.style.backgroundColor='color-mix(in srgb, var(--bs-body-bg) '+percent+'%, transparent)';check(color(el)===color(expected),'default '+tag+' '+percent);
        }
        const before=[card,toolbar,sidebar].map(color);KavUI.setSurfaceOpacity(100);
        check([card,toolbar,sidebar].every((el,i)=>color(el)!==before[i]),'surface changes '+tag);
        const floor=theme==='glass'?55:35;
        expected.style.backgroundColor='color-mix(in srgb, var(--bs-body-bg) '+floor+'%, transparent)';
        for(const value of [-1,floor]) {
          document.body.style.setProperty('--ui-theme-surface-opacity',value+'%');
          check(color(card)===color(expected),'CSS lower clamp '+tag+'/'+value);
        }
        KavUI.setSurfaceOpacity(-1);
        check(document.body.style.getPropertyValue('--ui-theme-surface-opacity')==='35%','API common floor '+tag);
        check(color(card)===color(expected),'API theme floor '+tag);
        if(theme==='glassmorphism') {
          KavUI.setSurfaceOpacity(40);expected.style.backgroundColor='color-mix(in srgb, var(--bs-body-bg) 40%, transparent)';
          check(color(card)===color(expected),'below default '+tag);
        }
        expected.remove();
      }
      check(css(readonly).borderTopStyle==='dashed'&&css(editable).borderTopStyle!=='dashed'&&css(disabled).borderTopStyle!=='dashed','readonly cue '+tag);
      check(color(readonly)!==color(editable),'readonly background '+tag);
      check(ratio(rgb(css(readonly).color),rgb(color(readonly)))>=4.5,'readonly AA '+tag);
      readonly.focus();check(css(readonly).borderTopStyle==='dashed'&&css(readonly).outlineColor===css(readonly).color,'readonly focus '+tag);
      check(color(surface)===color(card)&&css(surface).borderTopWidth==='1px','generic surface '+tag);

    }
    host.remove();document.body.style.removeProperty('--ui-theme-surface-opacity');KavUI.setDesignTheme('default');KavUI.setColorTheme('light');return bad;
  })()`);
  if(result.length)throw new Error('Theme surfaces: '+result.join(', '));
  // Save only when requested; restore only on opted-in pages, before paint as well as at boot.
  const check=async(expression,label)=>{if(!await evaluate(expression))throw new Error(label);};
  await check(`(()=>{localStorage.removeItem('kav-ui-surface-opacity');KavUI.setSurfaceOpacity(85);return localStorage.getItem('kav-ui-surface-opacity')===null && [NaN,Infinity,'90',null].every(v=>KavUI.setSurfaceOpacity(v)===false);})()`,'Transient opacity / invalid API values');
  await evaluate("localStorage.setItem('kav-ui-surface-opacity','-1')");
  const floorPrepaint=await send('Page.addScriptToEvaluateOnNewDocument',{source:`document.addEventListener('readystatechange',()=>{if(document.readyState==='interactive')window.opacityBeforeRuntime=document.body.style.getPropertyValue('--ui-theme-surface-opacity');});`});
  await navigate('components/themes.html');
  await check(`window.opacityBeforeRuntime==='35%' && document.body.style.getPropertyValue('--ui-theme-surface-opacity')==='35%'`,'Prepaint and runtime share API floor');
  await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:floorPrepaint.identifier});
  // Exercise runtime restoration independently of the optional head script.
  await send('Network.enable');
  await send('Network.setBlockedURLs',{urls:['*theme-init.js']});
  await navigate('components/themes.html');
  await check(`document.body.style.getPropertyValue('--ui-theme-surface-opacity')==='35%'`,'Runtime-only saved floor');
  await send('Network.setBlockedURLs',{urls:[]});
  await send('Network.disable');
  await evaluate('KavUI.setSurfaceOpacity(40,{persist:true})');
  await navigate('components/themes.html');
  await check(`document.body.style.getPropertyValue('--ui-theme-surface-opacity')==='40%'`,'Below-default saved opacity reload');
  await evaluate('KavUI.setSurfaceOpacity(85,{persist:true})');
  await navigate('components/themes.html');
  await check(`document.body.style.getPropertyValue('--ui-theme-surface-opacity')==='85%'`,'Saved opacity reload');
  const prepaint=await send('Page.addScriptToEvaluateOnNewDocument',{source:`document.addEventListener('DOMContentLoaded',()=>{window.opacityBeforeRuntime=document.body.style.getPropertyValue('--ui-theme-surface-opacity');}, {once:true});`});
  await navigate('components/themes.html');
  await check(`window.opacityBeforeRuntime==='85%'`,'Pre-paint opacity restoration');
  await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:prepaint.identifier});
  const explicit=await send('Page.addScriptToEvaluateOnNewDocument',{source:`const o=new MutationObserver(()=>{if(document.body){document.body.style.setProperty('--ui-theme-surface-opacity','92%');o.disconnect();}});o.observe(document,{childList:true,subtree:true});`});
  await navigate('components/themes.html');
  await check(`document.body.style.getPropertyValue('--ui-theme-surface-opacity')==='92%'`,'Explicit opacity wins');
  await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:explicit.identifier});
  const optout=await send('Page.addScriptToEvaluateOnNewDocument',{source:`const o=new MutationObserver(()=>{if(document.body){document.body.removeAttribute('data-ui-theme-persist');o.disconnect();}});o.observe(document,{childList:true,subtree:true});`});
  await navigate('components/themes.html');
  await check(`!document.body.style.getPropertyValue('--ui-theme-surface-opacity')`,'Opacity persistence opt-out');
  await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:optout.identifier});
  await evaluate(`localStorage.removeItem('kav-ui-surface-opacity')`);
  await navigate('components/themes.html');
  const measurements=[];
  await evaluate(`(()=>{const style=document.createElement('style');style.id='isolate-surfaces';style.textContent='body > :not(#contrast-surfaces){visibility:hidden!important}';document.head.append(style);})()`);
  // Isolate shared surfaces from opaque catalog ancestors. Body's real photo tint,
  // decorative gradients and each surface's backdrop filter remain in use.
  await send('Emulation.setDeviceMetricsOverride',{width:1000,height:800,deviceScaleFactor:1,mobile:false});
  for(const theme of ['glass','glassmorphism'])for(const mode of ['light','dark'])for(const background of ['bright','dark','saturated']) {
    const opacity=theme==='glass'?55:35;
    await evaluate(`(()=>{KavUI.setDesignTheme('${theme}');KavUI.setColorTheme('${mode}');KavUI.setSurfaceOpacity(${opacity});
      document.body.style.setProperty('--ui-theme-background-image',${JSON.stringify({bright:'linear-gradient(#fff,#f8f8f8)',dark:'linear-gradient(#000,#080808)',saturated:'linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f)'}[background])});
      document.body.style.removeProperty('--ui-theme-background-opacity');
      const host=document.createElement('div');host.id='contrast-surfaces';host.style.cssText='position:fixed;inset:60px 20px;z-index:99999;display:grid;gap:20px;grid-template-columns:1fr 1fr;pointer-events:none';
      host.innerHTML=['ui-surface','ui-card','ui-toolbar','app-sidebar','ui-page-header ui-page-header-panel'].map(c=>'<section class="'+c+'" style="position:static;padding:24px"><p style="color:var(--bs-body-color)">本文 Body text</p><p style="color:var(--bs-secondary-color)">補足 Secondary text</p></section>').join('');
      document.body.append(host);})()`);
    await evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
    const sample=await evaluate(`(()=>{
      const points=[...document.querySelectorAll('#contrast-surfaces p')].flatMap(el=>{
        const r=el.getBoundingClientRect();return [.1,.5,.9].map(x=>({x:Math.ceil(r.x+r.width*x),y:Math.ceil(r.y+r.height/2),fg:getComputedStyle(el).color}));
      });
      const style=document.createElement('style');style.id='surface-hide';style.textContent='#contrast-surfaces * {-webkit-text-fill-color:transparent!important;text-shadow:none!important}';document.head.append(style);return points;
    })()`);
    const {data}=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    const ratios=await evaluate(`new Promise(resolve=>{const img=new Image();img.onload=()=>{const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);const lum=a=>a.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);const values=${JSON.stringify(sample)}.map(p=>{const pixel=[...ctx.getImageData(p.x,p.y,1,1).data];const bg=lum(pixel);ctx.clearRect(0,0,1,1);ctx.fillStyle='rgb('+pixel.slice(0,3).join(',')+')';ctx.fillRect(0,0,1,1);ctx.fillStyle=p.fg;ctx.fillRect(0,0,1,1);const fg=lum([...ctx.getImageData(0,0,1,1).data]);return (Math.max(bg,fg)+.05)/(Math.min(bg,fg)+.05);});document.querySelector('#surface-hide').remove();resolve(values);};img.src='data:image/png;base64,${data}';})`);
    measurements.push({theme,mode,background,min:Math.min(...ratios)});
    await evaluate("document.querySelector('#contrast-surfaces').remove()");
    if(ratios.some(v=>v<4.5))throw new Error('Surface rendered AA '+theme+'/'+mode+'/'+background+'/'+opacity+': '+ratios);
  }
  console.log('Surface floor rendered contrast:',JSON.stringify(measurements));
  await evaluate("document.body.style.removeProperty('--ui-theme-background-image');document.querySelector('#isolate-surfaces').remove()");
  await send('Emulation.setEmulatedMedia',{features:[{name:'forced-colors',value:'active'}]});
  await check(`getComputedStyle(document.querySelector('#theme-panel-header')).backdropFilter==='none'`,'Forced colors opaque panel');
  await send('Emulation.setEmulatedMedia',{features:[]});
  await navigate('components/themes.html');
  console.log('Theme surfaces: default colors, opacity/clamps, readonly and AA, shared surfaces and panel ink');
}
