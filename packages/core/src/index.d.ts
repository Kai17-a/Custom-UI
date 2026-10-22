export {mdiPaths} from './icons.js';
export type Color='primary'|'secondary'|'success'|'danger'|'warning'|'info'|'neutral';
export type Variant='solid'|'outline'|'ghost';
export type ColorMode='light'|'dark'|'system';
export type DesignTheme='default'|'glass'|'glassmorphism'|'flat'|'soft';
export interface PersistOptions {persist?:boolean;}
export interface ToastOptions {title?:string;body?:string;meta?:string;variant?:string;duration?:number;copy?:boolean;copyText?:string;copyLabel?:string;}
export interface ChartConfig {type?:'line'|'area'|'bar'|'donut';labels:string[];series:Array<{name:string;values:number[]}>;label?:string;unit?:string;}
export interface SidebarState {mode:string;open:boolean;}
export interface KavUIRuntime {
 init(scope?:Document|Element):void;destroy(scope:Element|string):void;
 loading(target:Element|string,active?:boolean):boolean;
 copy(text:unknown):Promise<void>;
 show(element:Element|string,opener?:HTMLElement):void;hide(element:Element|string,trigger?:HTMLElement):void;
 toast(message:string|ToastOptions,options?:ToastOptions):HTMLElement;
 chart(root:Element|string,config?:ChartConfig):boolean|void;
 sidebar(root:Element|string,options?:{open?:boolean;trigger?:HTMLElement}):SidebarState|false;
 splitter(root:Element|string,options?:{sizes?:number[];reset?:boolean}):number[]|false;
 setColorTheme(mode:ColorMode,options?:PersistOptions):unknown;
 setDesignTheme(theme:DesignTheme,options?:PersistOptions):unknown;
 setPalette(palette:string,options?:PersistOptions):unknown;
 setCustomPalette(seed:string,options?:PersistOptions&{chroma?:number}):unknown;
 getCustomPalette():unknown;
}
export declare const colors:readonly Color[];
export declare const variants:readonly Variant[];
export declare const sizes:readonly string[];
export declare function buttonClass(options?:{color?:string;variant?:string;size?:string}):string;
export declare function escapeHTML(value:unknown):string;
export declare function attributes(values:Record<string,unknown>):string;
export declare function semanticColor(value:unknown):Color;
export declare function loadRuntime():Promise<KavUIRuntime>;
export declare function mount(root:Element,options?:{signal?:AbortSignal}):Promise<()=>void>;
export declare function toast(message:string|ToastOptions,options?:ToastOptions):Promise<HTMLElement>;
export declare function setColorTheme(mode:ColorMode,options?:PersistOptions):Promise<unknown>;
export declare function setDesignTheme(theme:DesignTheme,options?:PersistOptions):Promise<unknown>;
export declare function setPalette(palette:string,options?:PersistOptions):Promise<unknown>;
export declare function setCustomPalette(seed:string,options?:PersistOptions&{chroma?:number}):Promise<unknown>;

export declare function badgeClass(color?:string):string;
