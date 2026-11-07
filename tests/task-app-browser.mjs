// Shared by the behavior and catalog layout runners.
export async function checkTaskApp({navigate, evaluate, assert, send}) {
  await navigate('templates/task-app.html');
  assert(await evaluate(`!!document.querySelector('[data-ui-panel="overview"]')`), 'Task app overview exists');
  // Closed dialogs must not take layout space; a display utility on <dialog> overrides the UA display:none.
  for (const screen of ['overview', 'board', 'activity', 'settings']) {
    await evaluate(`document.querySelector('[data-ui-target="${screen}"]').click()`);
    assert(await evaluate(`[...document.querySelectorAll('dialog:not([open])')].every(d=>getComputedStyle(d).display==='none') && document.documentElement.scrollHeight<=Math.max(innerHeight,Math.ceil(document.querySelector('footer').getBoundingClientRect().bottom+scrollY))+1`), 'Task app has no scroll beyond the footer: '+screen);
  }
  for (const screen of ['board', 'activity', 'settings', 'overview']) {
    await evaluate(`document.querySelector('[data-ui-target="${screen}"]').click()`);
    assert(await evaluate(`!document.querySelector('[data-ui-panel="${screen}"]').hidden && document.querySelectorAll('[data-ui-panel]:not([hidden])').length===1`), 'Task app screen '+screen);
  }
  await evaluate(`document.querySelector('[data-ui-target="overview"]').focus();document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}))`);
  assert(await evaluate(`!document.querySelector('[data-ui-panel="board"]').hidden`), 'Keyboard arrow switches app screen');
  await evaluate(`document.querySelector('[data-ui-target="board"]').click();document.querySelector('[data-ui-target="#task-detail"]').focus();document.activeElement.click()`);
  assert(await evaluate(`document.querySelector('#task-detail').open`), 'Task detail opens');
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  assert(await evaluate(`!document.querySelector('#task-detail').open && document.activeElement.matches('[data-ui-target="#task-detail"]')`), 'Task detail closes and restores focus');
  await evaluate(`document.querySelector('[data-ui-panel="board"] details').open=true`);
  assert(await evaluate(`document.querySelector('[data-ui-panel="board"] details .task-card').getBoundingClientRect().height>0`), 'Collapsed task can be revealed');
  await evaluate(`document.querySelector('[data-ui-target="#task-new"]').click()`);
  assert(await evaluate(`document.querySelector('#task-new').open`), 'New task opens');
  await evaluate(`document.querySelector('#task-new [data-ui-dismiss]').click()`);
  assert(await evaluate(`!document.querySelector('#task-new').open`), 'New task closes');
  await evaluate(`document.querySelector('[data-ui-target="settings"]').click();KavUI.setDesignTheme('glassmorphism');const range=document.querySelector('#task-opacity');range.value='85';range.dispatchEvent(new Event('input',{bubbles:true}));`);
  assert(await evaluate(`document.body.style.getPropertyValue('--ui-theme-surface-opacity')==='85%' && document.querySelector('#task-theme-value').textContent.includes('85%')`), 'Opacity API and copyable value sync');
  await evaluate(`document.querySelector('#task-opacity').value='35';document.querySelector('#task-opacity').dispatchEvent(new Event('input',{bubbles:true}));KavUI.setDesignTheme('glass');`);
  assert(await evaluate(`document.querySelector('#task-opacity').min==='55' && document.querySelector('#task-opacity').value==='55' && document.querySelector('#task-opacity-value').value==='55%' && document.querySelector('#task-theme-value').textContent.includes('55%') && document.body.style.getPropertyValue('--ui-theme-surface-opacity')==='35%'`), 'Task glass shows effective floor, retains preference');
  await evaluate(`KavUI.setDesignTheme('glassmorphism')`);
  assert(await evaluate(`document.querySelector('#task-opacity').min==='35' && document.querySelector('#task-opacity').value==='35' && document.querySelector('#task-theme-value').textContent.includes('35%')`), 'Task glassmorphism restores preference');
  await evaluate(`const transfer=new DataTransfer();transfer.items.add(new File(['<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="green"/></svg>'],'sample.svg',{type:'image/svg+xml'}));const input=document.querySelector('#task-background');input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));`);
  assert(await evaluate(`document.body.style.getPropertyValue('--ui-theme-background-image').includes('blob:')`), 'Background preview uses local object URL');
  await evaluate(`document.querySelector('[data-ui-target="overview"]').click()`);
  assert(await evaluate(`document.body.style.getPropertyValue('--ui-theme-background-image').includes('blob:')`), 'Background carries across screens');
  await evaluate(`document.querySelector('[data-ui-target="settings"]').click();document.querySelector('#task-background-clear').click()`);
  assert(await evaluate(`!document.body.style.getPropertyValue('--ui-theme-background-image')`), 'Background clear releases preview');
  await navigate('templates/task-app.html');
  assert(await evaluate(`!document.body.style.getPropertyValue('--ui-theme-background-image') && !document.querySelector('body').hasAttribute('data-ui-theme-persist')`), 'App settings stay ephemeral');

}
