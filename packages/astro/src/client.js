import {loadRuntime,mount} from '@kav-ui/core';
let installed;
/** Astro client navigation reuses this module; listeners and pending mounts are owned once. */
export function installAstro(){
 if(typeof document==='undefined')return ()=>{};
 if(installed)return installed;
 const controller=new AbortController(),roots=new Map();let disposed=false;
 const clear=()=>{for(const {abort,stop} of roots.values()){abort.abort();stop?.();}roots.clear();};
 const refresh=()=>{
  for(const [root,state] of roots)if(!root.isConnected){state.abort.abort();state.stop?.();roots.delete(root);}
  for(const root of document.querySelectorAll('[data-kav-ui-widget]')){
   if(roots.has(root)||root.closest('[data-kav-ui-vue]'))continue;
   const state={abort:new AbortController(),stop:null};roots.set(root,state);
   mount(root,{signal:state.abort.signal}).then(stop=>{if(disposed||state.abort.signal.aborted)stop();else state.stop=stop;}).catch(error=>{if(!state.abort.signal.aborted)root.dispatchEvent(new CustomEvent('kav:error',{bubbles:true,detail:error}));});
  }
 };
 // Preserve user-selected themes before ClientRouter replaces html/body attributes.
 const beforeSwap=event=>{
  const next=event.newDocument;
  if(next){
   if(next.documentElement.hasAttribute('data-bs-theme')&&!next.documentElement.hasAttribute('data-ui-color-preference'))next.documentElement.dataset.uiColorPreference=next.documentElement.dataset.bsTheme;
   for(const [current,incoming,names] of [[document.documentElement,next.documentElement,['data-bs-theme','data-ui-color-preference','data-ui-palette']],[document.body,next.body,['data-ui-theme']]]){
    for(const name of names)if(current?.hasAttribute(name)&&incoming&&!incoming.hasAttribute(name))incoming.setAttribute(name,current.getAttribute(name));
   }
   const paletteStyle=document.querySelector('style[data-ui-custom-palette-style]');
   if(paletteStyle&&!next.querySelector('style[data-ui-custom-palette-style]'))next.head.append(paletteStyle.cloneNode(true));
  }
  clear();
 };
 const afterSwap=()=>{
  const root=document.documentElement,mode=root.dataset.uiColorPreference||root.dataset.bsTheme,seed=root.getAttribute('data-ui-palette-seed'),chroma=root.getAttribute('data-ui-palette-chroma'),palette=root.dataset.uiPalette;
  loadRuntime().then(api=>{
   if(disposed)return;
   if(['light','dark','system'].includes(mode))api.setColorTheme(mode);
   if(seed!==null&&api.setCustomPalette(seed,{chroma:chroma===null?24:Number(chroma)})&&palette&&palette!=='custom')api.setPalette(palette);
  }).catch(error=>document.dispatchEvent(new CustomEvent('kav:error',{detail:error})));
 };
 const options={signal:controller.signal};
 document.addEventListener('astro:before-swap',beforeSwap,options);document.addEventListener('astro:after-swap',afterSwap,options);document.addEventListener('astro:page-load',refresh,options);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh,{...options,once:true});else refresh();
 afterSwap();
 installed=()=>{if(disposed)return;disposed=true;controller.abort();clear();installed=undefined;};return installed;
}
