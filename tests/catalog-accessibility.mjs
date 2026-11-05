// Browser-level regressions for translucent surfaces and catalog navigation.
// Capture text-free pixels: ancestor background colors cannot model blur/gradients.
import {writeFileSync} from 'node:fs';
import {join} from 'node:path';
export async function checkCatalogAccessibility({navigate,evaluate,send,pages,artifacts}) {
  const failures=[], contrasts=[];
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  const settle=()=>evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
  for(const width of [390,1440]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    for(const design of ['glassmorphism','glass'])for(const color of ['light','dark']) {
      if(design==='glass'&&color==='light')continue;
      for(const page of ['index.html','components/forms.html','templates/settings.html','templates/pricing.html','templates/auth.html','templates/list.html']) {
        await navigate(page);
        await evaluate(`KavUI.setDesignTheme('${design}');KavUI.setColorTheme('${color}')`);
        const selectors=design==='glass'?['.ui-page-eyebrow']:['.ui-page-eyebrow','.ui-page-description','.lede','.tabs > button','.catalog-toc-link','.overview-link','.catalog-search-label','.ui-header-nav a'];
        for(const selector of selectors) {
          const count=await evaluate(`document.querySelectorAll('${selector}').length`);
          for(let i=0;i<count;i++) {
            const sample=await evaluate(`(()=>{
              const el=document.querySelectorAll('${selector}')[${i}];if(!el.getClientRects().length)return null;
              el.scrollIntoView({block:'center',behavior:'instant'});return true;
            })()`);
            if(!sample)continue;
            await settle();
            const text=await evaluate(`(()=>{
              const el=document.querySelectorAll('${selector}')[${i}],cs=getComputedStyle(el),cv=document.createElement('canvas'),ctx=cv.getContext('2d');
              cv.width=cv.height=1;ctx.fillStyle=cs.color;ctx.fillRect(0,0,1,1);const fg=[...ctx.getImageData(0,0,1,1).data];
              let opacity=1;for(let a=el;a;a=a.parentElement)opacity*=+getComputedStyle(a).opacity;
              const rects=[];const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
              while(walker.nextNode()){if(!walker.currentNode.textContent.trim())continue;const r=document.createRange();r.selectNodeContents(walker.currentNode);for(const b of r.getClientRects())if(b.width&&b.height)rects.push([b.x,b.y,b.width,b.height]);}
              const style=document.createElement('style');style.id='contrast-hide';
              style.textContent='*,*::before,*::after{-webkit-text-fill-color:transparent!important;text-shadow:none!important;caret-color:transparent!important;animation:none!important;transition:none!important}';document.head.append(style);
              const points=[];for(const [x,y,w,h] of rects)for(let py=Math.max(0,Math.ceil(y));py<Math.min(innerHeight,y+h);py+=2)for(let px=Math.max(0,Math.ceil(x));px<Math.min(innerWidth,x+w);px+=2){const hit=document.elementFromPoint(px,py);if(hit&&el.contains(hit))points.push([px,py]);}return {fg,opacity,points};
            })()`);
            await settle();
            const {data}=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
            const ratio=await evaluate(`new Promise((resolve,reject)=>{
              const img=new Image();img.onerror=reject;img.onload=()=>{
                const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);
                const lum=rgb=>rgb.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
                const t=${JSON.stringify(text)},alpha=t.fg[3]/255*t.opacity;let worst=Infinity;
                for(const [px,py] of t.points){
                  const bg=[...ctx.getImageData(px,py,1,1).data].slice(0,3),fg=bg.map((v,i)=>t.fg[i]*alpha+v*(1-alpha)),a=lum(bg),b=lum(fg);
                  worst=Math.min(worst,(Math.max(a,b)+.05)/(Math.min(a,b)+.05));
                }
                document.querySelector('#contrast-hide').remove();resolve(worst);
              };img.src='data:image/png;base64,${data}';
            })`);
            contrasts.push({width,design,color,page,selector,index:i,ratio});
            if(ratio===null||ratio<4.5)failures.push(`Contrast ${design}/${color} ${page} @${width} ${selector}[${i}]: ${ratio}`);
          }
        }
      }
    }
    console.log('Sampled translucent contrast @'+width);
    for(const page of pages) {
      await navigate(page);
      await evaluate("KavUI.setDesignTheme('default');KavUI.setColorTheme('light');document.querySelectorAll('.catalog-sidebar details').forEach(el=>el.open=true)");
      const small=await evaluate(`(()=>{
        const root=document.body,walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),bad=[];
        while(walker.nextNode()){const n=walker.currentNode,el=n.parentElement;if(!n.textContent.trim()||!el.closest('.catalog-header,.catalog-sidebar,.catalog-toc-rail,.catalog-card,.catalog-breadcrumb,.eyebrow,.sidebar-note,.card-link,.tile,.ramp,.states,.legend,.vs'))continue;
          if(el.closest('.example,.source,pre,script,style,svg'))continue;
          const size=parseFloat(getComputedStyle(el).fontSize);if(el.getClientRects().length&&size<12)bad.push(el.className+':'+size);
        }return [...new Set(bad)];
      })()`);
      if(small.length)failures.push(`Small chrome ${page} @${width}: ${small}`);
    }
  }
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:1000,deviceScaleFactor:1,mobile:false});
  await navigate('components/forms.html');
  if(!await evaluate(`(()=>{const el=document.querySelector('.catalog-toc-heading'),cs=getComputedStyle(el);return cs.display==='list-item'&&cs.listStyleType!=='none'&&getComputedStyle(el,'::marker').content!=='none';})()`))failures.push('Mobile TOC marker missing');
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await navigate('components/forms.html');
  if(!await evaluate(`(()=>{const a=document.querySelector('.catalog-sidebar-header > .overview-link');a.removeAttribute('aria-current');const normal=+getComputedStyle(a).fontWeight;a.setAttribute('aria-current','page');return normal<600&&+getComputedStyle(a).fontWeight===600;})()`))failures.push('Overview current-page weight');
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:1000,deviceScaleFactor:1,mobile:false});
  const targets=[['templates/list.html','.ui-data-table-sort,td a[href],.ui-header-nav a,.ui-footer-inner a'],['templates/dashboard.html','details.ui-chart-data > summary']];
  const fine=[];
  const dimensions=selector=>evaluate(`JSON.stringify([...document.querySelectorAll('${selector}')].filter(el=>el.getClientRects().length).map(el=>{const r=el.getBoundingClientRect();return [r.width,r.height]}))`);
  for(const [page,selector] of targets){await navigate(page);fine.push(await dimensions(selector));}
  await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
  await send('Emulation.setEmitTouchEventsForMouse',{enabled:true,configuration:'mobile'});
  if(!await evaluate("matchMedia('(pointer:coarse)').matches"))throw new Error('Coarse pointer emulation unavailable');
  for(const [page,selector] of targets) {
    await navigate(page);
    const result=await evaluate(`(()=>{const els=[...document.querySelectorAll('${selector}')].filter(el=>el.getClientRects().length),probe=document.createElement('div');probe.style.width='var(--ui-touch-target)';document.body.append(probe);const target=probe.getBoundingClientRect().width;probe.remove();return {count:els.length,bad:els.filter(el=>{const r=el.getBoundingClientRect();return r.width<target||r.height<target}).map(el=>({tag:el.outerHTML.slice(0,120),w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height,target}))};})()`);
    if(!result.count||result.bad.length)failures.push(`Touch ${page}: ${JSON.stringify(result)}`);
  }
  await send('Emulation.setEmitTouchEventsForMouse',{enabled:false});
  await send('Emulation.setTouchEmulationEnabled',{enabled:false});
  for(let i=0;i<targets.length;i++){const [page,selector]=targets[i];await navigate(page);if(await dimensions(selector)!==fine[i])failures.push('Fine pointer dimensions changed: '+page);}
  // Review artifacts use actual catalog pages, with mouse appearance restored.
  for(const width of [390,1440])for(const page of ['index.html','components/forms.html','templates/settings.html'])for(const [design,color] of [['glassmorphism','light'],['glassmorphism','dark'],['default','light']]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    await navigate(page);await evaluate(`KavUI.setDesignTheme('${design}');KavUI.setColorTheme('${color}');scrollTo(0,0)`);await settle();
    const {data}=await send('Page.captureScreenshot',{format:'png'});
    writeFileSync(join(artifacts,`a11y-${page.replaceAll('/','-')}-${width}-${design}-${color}.png`),Buffer.from(data,'base64'));
  }
  writeFileSync(join(artifacts,'contrast.json'),JSON.stringify(contrasts,null,2));
  console.log('Accessibility artifacts:',artifacts);
  console.log('Contrast minima:',JSON.stringify(Object.fromEntries(Object.entries(Object.groupBy(contrasts,r=>r.design+'/'+r.color+'/'+r.selector)).map(([key,rows])=>[key,Math.min(...rows.map(r=>r.ratio))]))));
  await send('Emulation.setEmulatedMedia',{features:[]});
  await evaluate("localStorage.removeItem('kav-ui-design-theme');localStorage.removeItem('kav-ui-theme')");
  if(failures.length)throw new Error(failures.join('\n'));
  console.log('PASS: sampled contrast, catalog type, coarse targets and mobile TOC');
}
