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

import {KavStack,KavCluster,KavFlex,KavGrid,KavGridItem,KavPageHeader,KavToolbar,KavSection,KavPage} from '@kav-ui/vue';
import type {Space,Responsive,FlexProps,GridProps,GridItemProps} from '@kav-ui/core';
import {KavGrid as AstroGrid,KavStack as AstroStack} from '@kav-ui/astro';
h(KavStack,{gap:{base:4,tablet:3,mobile:0},align:'stretch',as:'section'});
h(KavCluster,{gap:2,justify:'between',align:'baseline'});
h(KavFlex,{direction:{base:'row',mobile:'column'},wrap:{base:false,tablet:true},align:{mobile:'stretch'}});
h(KavGrid,{cols:{base:3,tablet:2,mobile:1},gap:4});h(KavGrid,{cols:'auto'});
h(KavGridItem,{span:{base:6,mobile:12}});
h(KavPageHeader,{title:'Title',level:6});h(KavSection,{level:2});h(KavToolbar,{label:'Tools'});h(KavPage,{stickyAside:true,asideLabel:'Menu',railLabel:'Details'});
const space:Responsive<Space>={base:12,mobile:0};void space;void AstroGrid;void AstroStack;
// @ts-expect-error gap is a closed spacing scale
h(KavStack,{gap:5});
// @ts-expect-error grid columns are constrained
h(KavGrid,{cols:5});
// @ts-expect-error span is at most twelve
h(KavGridItem,{span:13});
// @ts-expect-error use between rather than CSS syntax
h(KavFlex,{justify:'space-between'});
// @ts-expect-error responsive values are also constrained
const invalidFlex:FlexProps={gap:{tablet:5}};
// @ts-expect-error auto columns cannot be responsive
const invalidGrid:GridProps={cols:{mobile:'auto'}};
// @ts-expect-error responsive spans cannot exceed twelve
const invalidItem:GridItemProps={span:{base:13}};
// @ts-expect-error heading levels are constrained
h(KavPageHeader,{level:7});
void invalidFlex;void invalidGrid;void invalidItem;

import {KavTextarea} from '@kav-ui/vue';
import {KavTabs as AstroTabs,KavDrawer as AstroDrawer} from '@kav-ui/astro';
h(KavTextarea,{modelValue:'本文',name:'message',id:'message',rows:4,placeholder:'入力',required:true,disabled:false,maxlength:200,label:'メッセージ','onUpdate:modelValue':value=>value.toUpperCase()});
// @ts-expect-error textarea label must be a string
h(KavTextarea,{label:42});
// @ts-expect-error textarea rows must be numeric
h(KavTextarea,{rows:'four'});
// @ts-expect-error textarea maxlength must be numeric
h(KavTextarea,{maxlength:'long'});
// @ts-expect-error textarea required must be boolean
h(KavTextarea,{required:'yes'});
// @ts-expect-error textarea disabled must be boolean
h(KavTextarea,{disabled:'yes'});
// @ts-expect-error textarea name must be a string
h(KavTextarea,{name:1});
// @ts-expect-error textarea id must be a string
h(KavTextarea,{id:1});
// @ts-expect-error textarea placeholder must be a string
h(KavTextarea,{placeholder:1});
void AstroTabs;void AstroDrawer;
