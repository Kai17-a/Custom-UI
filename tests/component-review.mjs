// Browser regressions for the component review; no npm dependencies.
import {mkdirSync, writeFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
export async function checkComponentReview({send, navigate, evaluate}) {
  const assert=(ok,message)=>{if(!ok)throw new Error(message);};
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await navigate('components/command.html');
  for(const design of ['default','glass','glassmorphism','flat','soft']) for(const mode of ['light','dark']) {
    await evaluate(`KavUI.setDesignTheme('${design}');KavUI.setColorTheme('${mode}')`);
    for(const dialog of [false,true]) {
      const state=await evaluate(`(()=>{
        const el=document.querySelector('${dialog?'dialog .ui-command-input':'.example .ui-command-input'}');
        if(${dialog})el.closest('dialog').showModal();
        el.scrollIntoView({block:'center',behavior:'instant'});
        const cs=getComputedStyle(el,'::placeholder'),r=el.getBoundingClientRect();
        el.style.setProperty('color','transparent');el.setAttribute('placeholder','');
        return {fg:cs.color,opacity:cs.opacity,x:r.x+r.width/2,y:r.y+r.height/2};
      })()`);
      await evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
      const {data}=await send('Page.captureScreenshot',{format:'png'});
      const ratio=await evaluate(`new Promise(resolve=>{const i=new Image();i.onload=()=>{
        const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const x=c.getContext('2d');x.drawImage(i,0,0);
        const bg=[...x.getImageData(${state.x},${state.y},1,1).data].slice(0,3);
        x.fillStyle=${JSON.stringify(state.fg)};x.fillRect(0,0,1,1);const fg=[...x.getImageData(0,0,1,1).data].slice(0,3);
        const lum=a=>a.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((s,v,j)=>s+v*[.2126,.7152,.0722][j],0);
        const a=lum(bg),b=lum(fg);resolve((Math.max(a,b)+.05)/(Math.min(a,b)+.05));};i.src='data:image/png;base64,${data}';})`);
      assert(state.opacity==='1'&&ratio>=4.5,`Command placeholder ${design}/${mode}/${dialog?'dialog':'inline'}: ${ratio}`);
      await evaluate(`(()=>{const el=document.querySelector('${dialog?'dialog .ui-command-input':'.example .ui-command-input'}');el.style.removeProperty('color');el.placeholder='名前やキーワードを入力';if(${dialog})el.closest('dialog').close();})()`);
    }
  }
  for(const [path,selector] of [['tips','.tip'],['calendar','.ui-calendar-agenda-event'],['animations-processing','.planning-banner, .task-card'],['board','.task-card']]) {
    await navigate('components/'+path+'.html');
    if(path==='calendar')await evaluate(`document.querySelector('.ui-calendar-day:not(.is-outside)')?.click()`);
    const borders=await evaluate(`[...document.querySelectorAll('main ${selector.replaceAll(', ', ', main ')}')].map(el=>{const cs=getComputedStyle(el);return [cs.borderLeftWidth,cs.borderTopWidth]})`);
    assert(borders.length&&borders.every(([left,top])=>left===top),'State decoration must use a full border: '+path);
  }
  await navigate('components/avatar.html');
  assert(await evaluate(`[...document.querySelectorAll('.ui-avatar-sm')].every(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return parseFloat(s.fontSize)>=11&&r.width===24&&r.height===24&&el.scrollWidth<=24&&el.scrollHeight<=24})`),'Small avatar text must fit a 24px circle at >=11px');
  await navigate('components/icons.html');
  assert(await evaluate(`[...document.querySelectorAll('main > h2')].every(el=>{const s=getComputedStyle(el);return parseFloat(s.marginTop)>parseFloat(s.marginBottom)})`),'Icon section headings need more space above than below');
  await navigate('components/toasts.html');
  assert(await evaluate(`[...document.querySelectorAll('.example .btn-close')].every(el=>el.getAttribute('aria-label')==='通知を閉じる')`),'Notification examples need Japanese close labels');
  if(process.env.COMPONENT_SCREENSHOTS) {
    const folder=resolve(process.env.COMPONENT_SCREENSHOTS);mkdirSync(folder,{recursive:true});
    for(const width of [390,1280])for(const mode of ['light','dark']) {
      await send('Emulation.setDeviceMetricsOverride',{width,height:1100,deviceScaleFactor:1,mobile:width===390});
      await send('Emulation.setTouchEmulationEnabled',{enabled:width===390});
      for(const name of ['data-table','tips','typography','navigation','banner','cards','layouts','command','avatar','calendar','animations','animations-processing','board','icons','toasts']) {
        await navigate('components/'+name+'.html');
        await evaluate(`KavUI.setDesignTheme('default');KavUI.setColorTheme('${mode}');document.fonts.ready`);
        await evaluate(`document.querySelector('main').scrollIntoView({block:'start',behavior:'instant'})`);
        const dimensions=await evaluate(`({width:innerWidth,height:document.documentElement.scrollHeight})`);
        const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,...dimensions,scale:1}});
        writeFileSync(join(folder,`${name}-${width}-${mode}.png`),Buffer.from(shot.data,'base64'));
      }
    }
    console.log('Component screenshots:',folder);
  }
  console.log('PASS: command placeholder contrast (5 themes × light/dark × inline/dialog), avatar size, heading spacing, Japanese labels');
}
