/** Shared, server-safe conventions. Runtime CSS comes from assets/css, never a second theme. */
export const colors=Object.freeze(['primary','secondary','success','danger','warning','info','neutral']);
export const variants=Object.freeze(['solid','outline','ghost']);
export const sizes=Object.freeze(['sm','md','lg']);
const choose=(value,values,fallback)=>values.includes(value)?value:fallback;
export function buttonClass({color='primary',variant='solid',size='md'}={}) {
  color=choose(color,colors,'primary');if(color==='neutral')color='secondary';
  variant=choose(variant,variants,'solid');size=choose(size,sizes,'md');
  return ['btn',`btn-${variant==='outline'?'outline-':variant==='ghost'?'ghost-':''}${color}`,size==='md'?'':`btn-${size}`].filter(Boolean).join(' ');
}
export function escapeHTML(value) {return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export function attributes(values){return Object.entries(values).filter(([k,v])=>/^[a-zA-Z_:][\w:.-]*$/.test(k)&&!/^on/i.test(k)&&typeof v!=='function'&&v!==false&&v!==undefined&&v!==null).map(([k,v])=>` ${k}="${escapeHTML(v===true?'':v)}"`).join('');}
export function semanticColor(value){return colors.includes(value)?value:'neutral';}

export function badgeClass(color='primary'){return ['danger','success','warning'].includes(color)?'badge text-bg-'+color:'badge badge-neutral';}
