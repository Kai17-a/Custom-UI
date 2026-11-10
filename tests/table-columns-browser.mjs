export async function check({navigate,evaluate,click,key,send}){
 await navigate('components/table-columns.html');const assert=async(x,m)=>{if(!await evaluate(x))throw Error(m)};
 await evaluate(`window.r=document.querySelector('[data-ui-table-columns]');window.t=r.querySelector('table');window.cs=[...r.querySelectorAll('.ui-table-columns input')];window.events=[];r.addEventListener('ui:columnchange',e=>events.push(e.detail));`);
 await click('.ui-table-columns summary');await evaluate(`cs[1].focus()`);await key(' ');
 await assert(`cs[0].disabled&&!cs[1].checked&&[...t.rows].filter(row=>row.cells.length===3).every(row=>row.cells[1].hidden)&&events.at(-1).visible.join(',')==='name,status'`,'keyboard column toggle/required/events');
 await click('[data-ui-table-sort]');await assert(`[...t.rows].filter(row=>row.cells.length===3).every(row=>row.cells[1].hidden)`,'sort keeps columns');
 await evaluate(`window.added=t.tBodies[0].insertRow();added.innerHTML='<td>追加</td><td>森</td><td>進行中</td>'`);await new Promise(r=>setTimeout(r,40));await assert(`added.cells[1].hidden`,'new rows inherit');
 await click('[data-ui-table-search]');await send('Input.insertText',{text:'森'});await assert(`[...t.tBodies[0].rows].filter(row=>!row.hidden&&!row.hasAttribute('data-ui-table-empty')).length===2`,'hidden column still searchable');
 await click('.ui-table-columns button');await assert(`cs.every(c=>c.checked)&&[...t.rows].filter(row=>row.cells.length===3).every(row=>!row.cells[1].hidden)`,'reset');
 for(const width of [390,1280])for(const mode of ['light','dark']){await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});await evaluate(`KavUI.setColorTheme('${mode}')`);await assert(`document.documentElement.scrollWidth<=innerWidth+1`,'bounds');}
 await evaluate(`KavUI.destroy(r);KavUI.init(r);KavUI.init(r)`);await assert(`r.querySelectorAll('.ui-table-columns').length===1`,'lifecycle');
}
