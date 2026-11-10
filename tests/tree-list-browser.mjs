export async function check({navigate,evaluate,click,key,send}){
 await navigate('components/tree-list.html');
 const assert=async(x,m)=>{if(!await evaluate(x))throw Error(m)};
 await evaluate(`window.tree=document.querySelector('[data-ui-tree]');window.p=tree.querySelector('[data-ui-tree-item]');window.ch=p.querySelector('ul');window.events=[];tree.addEventListener('ui:treeselect',e=>events.push(e.detail.value));p.focus()`);
 await assert(`tree.role==='tree'&&p.role==='treeitem'&&ch.role==='group'&&ch.hidden`,'tree semantics');
 await assert(`getComputedStyle(ch).paddingInlineStart==='24px'&&p.querySelector('[data-ui-tree-toggle]').getAttribute('icon')==='mdi-chevron-right'&&p.querySelector('[data-ui-tree-toggle]').getAttribute('aria-label')==='展開する'&&p.querySelector('svg').getBoundingClientRect().width===16`,'indent and collapsed chevron');
 await key('ArrowRight');await assert(`p.querySelector('[data-ui-tree-toggle]').getAttribute('icon')==='mdi-chevron-down'&&p.querySelector('[data-ui-tree-toggle]').getAttribute('aria-label')==='折り畳む'`,'expanded chevron');await assert(`!ch.hidden&&p.getAttribute('aria-expanded')==='true'`,'expand');
 await key('ArrowRight');await assert(`document.activeElement.dataset.uiTreeItem==='design'`,'child focus');
 await key('Enter');await assert(`events.at(-1)==='design'`,'select');
 await key('ArrowLeft');await key('ArrowLeft');await assert(`ch.hidden&&events.length===1`,'collapse independent');
 await key('ArrowDown');await key('Enter');await assert(`events.length===1`,'disabled not selected');
 await key('End');await key(' ');await assert(`events.at(-1)==='shared'`,'end/space');
 await key('Home');await assert(`document.activeElement===p`,'home');
 for(const width of [390,1280])for(const mode of ['light','dark']){await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});await evaluate(`KavUI.setColorTheme('${mode}')`);await assert(`tree.getBoundingClientRect().right<=innerWidth+1`,'responsive');}
 await evaluate(`KavUI.destroy(tree);KavUI.init(tree);KavUI.init(tree)`);await assert(`p.querySelectorAll(':scope > [data-ui-tree-toggle]').length===1`,'lifecycle');
}
