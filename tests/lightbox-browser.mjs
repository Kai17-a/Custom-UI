export async function check({navigate,evaluate,click,key,send}){
 await navigate('components/lightbox.html');const assert=async(x,m)=>{if(!await evaluate(x))throw Error(m)};
 await click('[data-ui-lightbox-item]');
 await evaluate(`window.r=document.querySelector('[data-ui-lightbox]');window.p=r.querySelector('dialog');window.buttons=[...p.querySelectorAll('button')];`);
 for(let i=0;i<50&&!await evaluate(`!!p.querySelector('img')`);i++)await new Promise(r=>setTimeout(r,20));
 await assert(`p.open&&p.querySelector('img').alt.includes('抽象')`,'open/image alt');
 await click('.ui-lightbox-toolbar button:nth-child(3)');await assert(`!buttons[3].disabled&&p.querySelector('img').getBoundingClientRect().width>0`,'zoom');
 await click('.ui-lightbox-toolbar button:nth-child(4)');await assert(`buttons[3].disabled`,'reset zoom');
 await evaluate(`p.querySelector('[role=region]').focus()`);await key('ArrowRight');await assert(`buttons[1].disabled&&p.textContent.includes('2枚目')`,'next keyboard');
 await key('Escape');await assert(`!p.open&&document.activeElement.matches('[data-ui-lightbox-item]')`,'Escape focus');
 await evaluate(`r.querySelector('[data-ui-lightbox-item]').href='javascript:alert(1)'`);await click('[data-ui-lightbox-item]');await assert(`p.textContent.includes('読み込めません')&&!p.querySelector('img')`,'unsafe URL failure');await key('Escape');
 for(const width of [390,1280])for(const mode of ['light','dark']){await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});await evaluate(`KavUI.setColorTheme('${mode}')`);await click('[data-ui-lightbox-item]');await assert(`p.getBoundingClientRect().right<=innerWidth+1`,'bounds');await key('Escape');}
 await evaluate(`KavUI.destroy(r);KavUI.init(r);KavUI.init(r)`);await assert(`r.querySelectorAll('dialog').length===1`,'lifecycle');
}
