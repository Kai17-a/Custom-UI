// Cross-component state semantics and rendered (including translucent surfaces) contrast.
export async function checkReviewState({navigate,evaluate,send}) {
  await navigate('components/board.html');
  await evaluate(`(()=>{
    const column=document.querySelector('[data-ui-column=review]');
    const card=column.querySelector('.task-card');
    card.prepend(column.querySelector('.dot-review').cloneNode(true));
    const node=document.createElement('div');node.className='ui-agent-workflow';
    node.innerHTML='<div class="ui-agent-node" data-state="review"><span class="ui-agent-state">確認待ち</span></div>';
    column.append(node);
  })()`);
  for(const theme of ['default','glass','glassmorphism','flat','soft'])for(const mode of ['light','dark']) {
    await evaluate(`KavUI.setDesignTheme('${theme}');KavUI.setColorTheme('${mode}');document.body.style.removeProperty('--ui-theme-surface-opacity');document.querySelector('[data-ui-column=review]').scrollIntoView({block:'center',behavior:'instant'})`);
    await evaluate('document.fonts.ready.then(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))))');
    // Measure the settled theme, after card background transitions finish.
    await evaluate('Promise.all(document.getAnimations().filter(a=>a instanceof CSSTransition).map(a=>a.finished))');
    const sample=await evaluate(`(()=>{
      const css=el=>getComputedStyle(el),dots=[...document.querySelectorAll('.dot-review')];
      const probe=document.createElement('span');document.querySelector('[data-ui-column=review]').append(probe);
      const token=name=>{probe.style.color='var('+name+')';return css(probe).color;};
      const warning=token('--bs-warning'),emphasis=token('--bs-warning-text-emphasis'),success=token('--bs-success');
      const node=document.querySelector('.ui-agent-node[data-state=review]'),done=css(document.querySelector('.dot-done'));
      const valid=dots.every(dot=>[warning,emphasis].includes(css(dot).borderTopColor)&&css(dot).backgroundColor===warning&&css(dot).backgroundImage==='none'&&parseFloat(css(dot).borderTopWidth)>0&&css(dot).borderTopStyle==='solid')
        && css(node).borderTopColor===warning && css(node.querySelector('.ui-agent-state')).color===emphasis
        && done.borderTopColor===success && done.backgroundColor==='rgba(0, 0, 0, 0)' && done.backgroundImage==='none'
        && dots.every(dot=>css(dot).borderTopColor!==done.borderTopColor&&css(dot).backgroundColor!==done.backgroundColor);
      probe.remove();
      const points=dots.map(dot=>{const r=dot.getBoundingClientRect(),border=css(dot).borderTopColor;dot.style.visibility='hidden';return {x:Math.floor(r.x+r.width/2),y:Math.floor(r.y+r.height/2),border};});
      return {valid,points};
    })()`);
    if(sample.points.some(p=>p.x<0||p.y<0))throw new Error('Review samples must be visible');
    if(!sample.valid)throw new Error('Review/done warning semantics: '+theme+'/'+mode);
    const {data}=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    const ratios=await evaluate(`new Promise(resolve=>{const img=new Image();img.onload=()=>{
      const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);
      const lum=a=>a.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
      const ratios=${JSON.stringify(sample.points)}.map(p=>{const bg=lum([...ctx.getImageData(p.x,p.y,1,1).data]);ctx.fillStyle=p.border;ctx.fillRect(0,0,1,1);const fg=lum([...ctx.getImageData(0,0,1,1).data]);return (Math.max(bg,fg)+.05)/(Math.min(bg,fg)+.05);});
      document.querySelectorAll('.dot-review').forEach(dot=>dot.style.removeProperty('visibility'));resolve(ratios);
    };img.src='data:image/png;base64,${data}';})`);
    if(ratios.some(v=>v<3))throw new Error('Review outline contrast '+theme+'/'+mode+': '+ratios);
    console.log('Review contrast (column/card) '+theme+'/'+mode+': '+ratios.map(v=>v.toFixed(3)).join(' / '));
  }
  const followsToken=await evaluate(`(()=>{
    const column=document.querySelector('[data-ui-column=review]');
    column.style.setProperty('--bs-warning','rgb(123, 87, 31)');
    const matches=[...column.querySelectorAll('.dot-review,.ui-agent-node[data-state=review]')].every(el=>getComputedStyle(el).borderTopColor==='rgb(123, 87, 31)');
    column.style.removeProperty('--bs-warning');return matches;
  })()`);
  if(!followsToken)throw new Error('Review borders must follow the warning token');
  await evaluate("KavUI.setDesignTheme('default');KavUI.setColorTheme('light')");
}
