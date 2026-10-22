// Safe to import on a server. Load the DOM runtime only after the host mounts.
let pending;
export async function loadRuntime(){
  if(typeof window==='undefined'||typeof document==='undefined')throw new Error('Kav-UI runtime requires a browser. Call it after mounting.');
  if(!pending)pending=import('../dist/runtime.js').then(()=>window.KavUI).catch(error=>{pending=undefined;throw error;});
  const api=await pending;
  if(typeof api?.destroy!=='function')throw new Error('An incompatible KavUI runtime is already loaded. Use matching CSS/JS versions.');
  if(document.readyState==='loading')await new Promise(resolve=>document.addEventListener('DOMContentLoaded',resolve,{once:true}));
  return api;
}
/** Returns an idempotent cleanup; aborted async mounts never enhance a removed host. */
export async function mount(root,{signal}={}){
  if(!root||root.nodeType!==1)throw new TypeError('mount requires an element');
  const api=await loadRuntime();
  if(signal?.aborted||!root.isConnected)return ()=>{};
  api.init(root);let disposed=false;
  const dispose=()=>{if(disposed)return;disposed=true;signal?.removeEventListener('abort',dispose);api.destroy(root);};
  signal?.addEventListener('abort',dispose,{once:true});return dispose;
}
export async function toast(message,options){return (await loadRuntime()).toast(message,options);}
export async function setColorTheme(mode,options){return (await loadRuntime()).setColorTheme(mode,options);}
export async function setDesignTheme(theme,options){return (await loadRuntime()).setDesignTheme(theme,options);}
export async function setPalette(palette,options){return (await loadRuntime()).setPalette(palette,options);}
export async function setCustomPalette(seed,options){return (await loadRuntime()).setCustomPalette(seed,options);}
