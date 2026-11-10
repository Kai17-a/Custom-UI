export async function check({navigate,evaluate,click,key,send}){
 await navigate('components/richtext.html');const assert=async(x,m)=>{if(!await evaluate(x))throw Error(m)};
 await evaluate(`window.r=document.querySelector('[data-ui-richtext]');window.s=r.querySelector('textarea');window.e=r.querySelector('.ui-richtext-editor');window.set=html=>r.dispatchEvent(new CustomEvent('ui:richtextset',{detail:{html}}));s.required=true;set('<p><br></p>')`);
 await assert(`!s.checkValidity()&&document.activeElement===e`,'required rejects empty markup');

 await evaluate(`set('<p>初期</p>');e.focus();var range=document.createRange();range.selectNodeContents(e);range.collapse(false);var selection=getSelection();selection.removeAllRanges();selection.addRange(range)`);
 await send('Input.insertText',{text:'日本語'});await assert(`s.value.includes('日本語')&&new FormData(s.form).get('description')===s.value`,'Japanese input/form');
 await click('.ui-richtext-toolbar button:nth-child(9)');await assert(`!s.value.includes('日本語')`,'undo');await click('.ui-richtext-toolbar button:nth-child(10)');await assert(`s.value.includes('日本語')`,'redo');
 await evaluate(`e.focus();var range=document.createRange();range.selectNodeContents(e);var selection=getSelection();selection.removeAllRanges();selection.addRange(range)`);await new Promise(r=>setTimeout(r,30));await click('.ui-richtext-toolbar button:nth-child(3)');await assert(`!!e.querySelector('b,strong')`,'bold selection');
 await evaluate(`set('<p onclick="alert(1)" style="color:red">安全<img src=x onerror="window.hacked=1"><script>window.hacked=1<\/script><svg><a href="javascript:alert(1)">x</a></svg><iframe srcdoc="bad"></iframe><a href="jav&#x0a;ascript:alert(1)">危険</a><a href="https://example.test/x" target="_blank" onclick="bad()">安全リンク</a></p>')`);
 await assert(`!window.hacked&&!e.querySelector('img,script,svg,iframe,[onclick],[style],[target]')&&[...e.querySelectorAll('a[href]')].every(a=>a.href.startsWith('https://example.test/'))&&s.value===e.innerHTML`,'load sanitization');
 await evaluate(`e.focus();const data=new DataTransfer();data.setData('text/html','<p>貼付<img src=x onerror="window.hacked=1"><a href="data:text/html,bad">不正</a></p>');e.dispatchEvent(new ClipboardEvent('paste',{clipboardData:data,bubbles:true,cancelable:true}))`);
 await assert(`e.textContent.includes('貼付')&&!window.hacked&&!e.querySelector('img,a[href^="data:"]')`,'paste sanitized');
 await evaluate(`set('<p>初期</p>');e.dispatchEvent(new CompositionEvent('compositionstart'));e.textContent='変換中';e.dispatchEvent(new InputEvent('input',{isComposing:true,bubbles:true}))`);await assert(`!s.value.includes('変換中')`,'composition deferred');await evaluate(`e.dispatchEvent(new CompositionEvent('compositionend'))`);await assert(`s.value.includes('変換中')`,'composition committed');
 await evaluate(`s.readOnly=true`);await new Promise(r=>setTimeout(r,20));await assert(`e.contentEditable==='false'&&[...r.querySelectorAll('button,input')].every(x=>x.disabled)`,'readonly');
 await evaluate(`s.readOnly=false;s.form.reset()`);await new Promise(r=>setTimeout(r,30));await assert(`e.textContent.includes('制作依頼')`,'reset');
 await evaluate(`document.body.focus();e.blur()`);await click('label[for="rich-description"]');await assert(`document.activeElement===e`,'label focus');
 for(const width of [390,1280])for(const mode of ['light','dark']){await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});await evaluate(`KavUI.setColorTheme('${mode}')`);await assert(`document.documentElement.scrollWidth<=innerWidth+1`,'bounds');}
 await evaluate(`KavUI.destroy(r);KavUI.init(r);KavUI.init(r)`);await assert(`r.querySelectorAll('.ui-richtext-editor').length===1`,'lifecycle');
}
