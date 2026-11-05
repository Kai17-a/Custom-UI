// Shared rendered-layout assertions for the HTML, Vue and Astro samples.
export const authLayout = `(()=>{
  const card=document.querySelector('main .ui-card');if(!card)return false;
  const r=card.getBoundingClientRect();
  return Math.abs(r.left+r.width/2-innerWidth/2)<3 && r.width<=640
    && !document.querySelector('.ui-header-nav a')
    && [...document.querySelectorAll('main form')].length===2
    && [...document.querySelectorAll('main form')].every(form=>form.hasAttribute('data-ui-validate')&&form.querySelector('.ui-cluster button[type=submit]'));
})()`;
export const pricingHierarchy = `(()=>{
  const selected=document.querySelectorAll('main .ui-card-selected');
  return selected.length===1 && !!selected[0].querySelector('.badge')
    && !!selected[0].querySelector('a.btn-primary')
    && ![...document.querySelectorAll('main .ui-card li')].some(el=>el.textContent.includes('メールサポート'))
    && document.querySelector('main').textContent.split('メールサポート').length===2;
})()`;
export const headerControls = `(()=>{
  const header=document.querySelector('body > .ui-header');
  const selects=[...header.querySelectorAll('select')];
  const labels=selects.map(el=>el.closest('label')?.textContent.trim().split(/\\s/)[0]);
  const toggle=header.querySelector('[data-ui-toggle=theme]');
  if(labels.join(',')!=='デザイン,配色'||!toggle||!(selects[1].compareDocumentPosition(toggle)&Node.DOCUMENT_POSITION_FOLLOWING))return false;
  const center=el=>{const r=el.getBoundingClientRect();return r.top+r.height/2;};
  const controls=selects.map(el=>el.parentElement.querySelector('.ui-select-trigger')||el);
  const nav=header.querySelector('.ui-header-nav a');
  return Math.abs(center(controls[0])-center(controls[1]))<3
    && (innerWidth<768 || !nav || controls.every(el=>Math.abs(center(el)-center(nav))<3));
})()`;
