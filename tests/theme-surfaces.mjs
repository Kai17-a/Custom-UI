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
        KavUI.setSurfaceOpacity(-1);check(color(card)===before[0],'lower clamp '+tag);expected.remove();
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
  for(const mode of ['light','dark'])for(const opacity of [52,100]) {
    await evaluate(`KavUI.setDesignTheme('glassmorphism');KavUI.setColorTheme('${mode}');KavUI.setSurfaceOpacity(${opacity});document.querySelector('[data-demo-background-action="sample"]').click();document.querySelector('#theme-panel-header').scrollIntoView({block:'center',behavior:'instant'});`);
    await evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
    const sample=await evaluate(`(()=>{const panel=document.querySelector('#theme-panel-header'),nodes=[...panel.querySelectorAll('h2,p')],points=nodes.map(el=>{const r=el.getBoundingClientRect();return {x:Math.ceil(r.x+4),y:Math.ceil(r.y+r.height/2),fg:getComputedStyle(el).color};});const style=document.createElement('style');style.id='surface-hide';style.textContent='#theme-panel-header * {-webkit-text-fill-color:transparent!important;text-shadow:none!important}';document.head.append(style);return points;})()`);
    const {data}=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    const ratios=await evaluate(`new Promise(resolve=>{const img=new Image();img.onload=()=>{const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);const lum=a=>a.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);const values=${JSON.stringify(sample)}.map(p=>{const bg=lum([...ctx.getImageData(p.x,p.y,1,1).data]);ctx.fillStyle=p.fg;ctx.fillRect(0,0,1,1);const fg=lum([...ctx.getImageData(0,0,1,1).data]);return (Math.max(bg,fg)+.05)/(Math.min(bg,fg)+.05);});document.querySelector('#surface-hide').remove();resolve(values);};img.src='data:image/png;base64,${data}';})`);
    if(ratios.some(v=>v<4.5))throw new Error('Panel rendered AA '+mode+'/'+opacity+': '+ratios);
  }
  await send('Emulation.setEmulatedMedia',{features:[{name:'forced-colors',value:'active'}]});
  await check(`getComputedStyle(document.querySelector('#theme-panel-header')).backdropFilter==='none'`,'Forced colors opaque panel');
  await send('Emulation.setEmulatedMedia',{features:[]});
  await navigate('components/themes.html');
  console.log('Theme surfaces: default colors, opacity/clamps, readonly and AA, shared surfaces and panel ink');
}
