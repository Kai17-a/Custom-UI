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

// Only known values become selectors; objects are read in breakpoint order.
const layoutValues={gap:[0,1,2,3,4,6,8,12],direction:['row','column'],justify:['start','center','end','between','around','evenly'],align:['start','center','end','stretch','baseline'],wrap:[true,false],cols:[1,2,3,4,6,12],span:[1,2,3,4,5,6,7,8,9,10,11,12]};
function layoutValueClass(prop,value){
 if(!layoutValues[prop]?.includes(value))return '';
 return prop==='gap'?'sp-gap-'+value:prop==='direction'?'fx-'+value:prop==='justify'?'fx-justify-'+value:prop==='align'?'fx-items-'+value:prop==='wrap'?'fx-'+(value?'wrap':'nowrap'):prop==='cols'?'fx-grid-'+value:'fx-col-'+value;
}
export function layoutClasses(props={}){
 return Object.keys(layoutValues).flatMap(prop=>{
  const value=props?.[prop];
  return value&&typeof value==='object'&&!Array.isArray(value)?['base','tablet','mobile'].map(key=>{const cls=layoutValueClass(prop,value[key]);return cls?(key==='base'?'':key+':')+cls:'';}):[layoutValueClass(prop,value)];
 }).filter(Boolean).join(' ');
}
export function stackClass({gap,align}={}){return ['ui-stack',layoutClasses({gap,align})].filter(Boolean).join(' ');}
export function clusterClass({gap,justify,align}={}){
 const base=align&&typeof align==='object'?align.base:align;
 // page-layout.css follows flex.css: compose primitives when its center default would win.
 const baseClass=layoutValues.align.includes(base)&&base!=='center'?'fx fx-wrap fx-min-0'+(layoutValues.gap.includes(gap&&typeof gap==='object'?gap.base:gap)?'':' sp-gap-3'):'ui-cluster';
 return [baseClass,layoutClasses({gap,justify,align})].filter(Boolean).join(' ');
}
export function flexClass({gap,direction,justify,align,wrap}={}){return ['fx',layoutClasses({gap,direction,justify,align,wrap})].filter(Boolean).join(' ');}
export function gridClass({cols,gap}={}){return [cols==='auto'?'ui-page-grid':'fx-grid',layoutClasses({cols,gap})].filter(Boolean).join(' ');}
export function gridItemClass({span}={}){return layoutClasses({span});}
export function headingTag(level,fallback=1){return 'h'+([1,2,3,4,5,6].includes(level)?level:fallback);}
