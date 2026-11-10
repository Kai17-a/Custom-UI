export async function check({navigate,evaluate,click,key,send}){
 await navigate('components/table-details.html');const assert=async(x,m)=>{if(!await evaluate(x))throw Error(m)};
 await evaluate(`window.r=document.querySelector('[data-ui-table-expandable]');window.b=r.querySelector('[data-ui-row-expand]');window.parent=b.closest('tr');window.detail=document.getElementById(b.getAttribute('aria-controls'));window.events=[];r.addEventListener('ui:rowexpand',e=>events.push(e.detail));b.focus()`);await key('Enter');
 await assert(`!detail.hidden&&b.getAttribute('aria-expanded')==='true'&&events.at(-1).expanded&&r.querySelector('[data-ui-table-status]').textContent.includes('3')`,'expand semantics/count');
 await click('[data-ui-table-next]');await assert(`parent.hidden&&detail.hidden`,'pagination hides with parent');
 await click('[data-ui-table-prev]');await assert(`!parent.hidden&&!detail.hidden&&parent.nextElementSibling===detail`,'restores expansion');
 await click('[data-ui-table-sort]');await assert(`parent.nextElementSibling===detail`,'sort preserves pairing');
 await click('[data-ui-table-search]');await send('Input.insertText',{text:'公開準備'});await assert(`[...r.querySelectorAll('tbody tr:not([data-ui-table-detail]):not([data-ui-table-empty])')].every(x=>x.hidden)`,'detail text excluded from search');
 await evaluate(`r.querySelector('input').value='カタログ';r.querySelector('input').dispatchEvent(new Event('input',{bubbles:true}))`);await assert(`!detail.hidden&&parent.nextElementSibling===detail`,'filter parent/detail');
 for(const width of [390,1280])for(const mode of ['light','dark']){await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});await evaluate(`KavUI.setColorTheme('${mode}')`);await assert(`document.documentElement.scrollWidth<=innerWidth+1`,'bounds');}
 await evaluate(`KavUI.destroy(r)`);await assert(`!r.querySelector('[data-ui-table-detail]')&&!b.hasAttribute('aria-controls')`,'destroy');await evaluate(`KavUI.init(r);KavUI.init(r)`);await assert(`r.querySelectorAll('[data-ui-table-detail]').length===2`,'reinit once');
}
