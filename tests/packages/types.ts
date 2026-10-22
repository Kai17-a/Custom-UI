import {h} from 'vue';
import {KavButton,KavSelect,KavInput,KavSidebar,KavDialog,KavChart} from '@kav-ui/vue';
import {mount,setColorTheme,mdiPaths,loadRuntime} from '@kav-ui/core';
import {KavButton as AstroButton} from '@kav-ui/astro';
import {installAstro} from '@kav-ui/astro/client';
h(KavButton,{color:'danger',variant:'outline',loading:true});
h(KavInput,{modelValue:'hello','onUpdate:modelValue':value=>String(value)});
h(KavSelect,{form:'external',modelValue:1,options:[{label:'個人',value:1}]});
h(KavSidebar,{mobile:'top',tablet:'rail',desktop:'expanded'});
h(KavDialog,{modelValue:true,title:'確認'});
h(KavChart,{config:{type:'bar',labels:['月'],series:[{name:'件数',values:[3]}]}});
// @ts-expect-error unknown button variants must not silently compile
h(KavButton,{variant:'neon'});
// @ts-expect-error sidebar breakpoint modes are constrained
h(KavSidebar,{desktop:'banana'});
void mdiPaths['mdi-home'];void AstroButton;void installAstro;
if(typeof document!=='undefined'){void mount(document.body);void setColorTheme('system');}

async function runtimeAPIs(){const api=await loadRuntime();const button=document.createElement("button");const active:boolean=api.loading(button,true);const result:Promise<void>=api.copy("コピー");void active;await result;}
void runtimeAPIs;
