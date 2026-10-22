/* Catalog examples only. Application actions are deliberately outside ui.js. */
document.addEventListener('ui:valid', event => {
  const form = event.target;
  if (!form.matches('[data-demo-form]')) return;
  event.preventDefault();
  const output = form.querySelector('[data-demo-result]');
  if (output) output.textContent = '入力を確認しました（デモ）。サーバーへの送信は行っていません。';
});
document.addEventListener('input', event => {
  const output = event.target.closest('[data-demo-form]')?.querySelector('[data-demo-result]');
  if (output) output.textContent = '';
});
document.addEventListener('click', event => {
  const button = event.target.closest('[data-demo-create], [data-demo-retry]');
  const panel = button?.closest('[data-demo-state]');
  if (!panel) return;
  if (button.hasAttribute('data-demo-create')) {
    panel.querySelector('[data-demo-result]').textContent = '新しいタスク — Backlog';
    button.textContent = '作成済み';
    button.disabled = true;
  } else {
    panel.querySelector('[data-demo-result]').textContent = '再試行が完了しました（デモ）。実際の通信は行っていません。';
    panel.classList.replace('alert-danger','alert-success');
    panel.querySelector('h3').textContent = 'タスクを取得しました';
    panel.querySelector('p').textContent = '接続が回復しました（デモ）。';
    button.textContent = '再取得する（デモ）';
    button.classList.replace('btn-outline-danger','btn-outline-secondary');
  }
});

// A local simulation only: real applications update progress from their request.
document.addEventListener('click', event => {
  const button = event.target.closest('[data-demo-loading-start]');
  const root = button?.closest('[data-demo-loading]');
  if (!root || button.disabled) return;
  const buttons = [...root.querySelectorAll('[data-demo-loading-start]')];
  const panel = root.querySelector('[data-demo-loading-panel]');
  const progress = root.querySelector('progress');
  const percent = root.querySelector('[data-demo-loading-percent]');
  const result = root.querySelector('[data-demo-loading-result]');
  const fail = button.dataset.demoLoadingStart === 'error';
  buttons.forEach(item => KavUI.loading(item, true));
  KavUI.loading(panel, true);
  progress.classList.remove('ui-progress-success', 'ui-progress-danger');
  progress.value = 0;
  percent.textContent = progress.textContent = '0%';
  result.textContent = 'データを保存中…（デモ）';
  const timer = setInterval(() => {
    progress.value += 20;
    percent.textContent = progress.textContent = progress.value + '%';
    if (progress.value < (fail ? 60 : 100)) return;
    clearInterval(timer);
    buttons.forEach(item => KavUI.loading(item, false));
    KavUI.loading(panel, false);
    progress.classList.add(fail ? 'ui-progress-danger' : 'ui-progress-success');
    result.textContent = fail ? '保存に失敗しました（デモ）。「保存を試す」で再試行できます。' : '保存しました（デモ）。';
  }, 300);
});

// Replay only the optional CSS animation. No timers or application API needed.
document.addEventListener('click', event => {
  const trigger = event.target.closest('[data-demo-animation-replay]');
  if (!trigger) return;
  const target = document.querySelector(trigger.dataset.demoAnimationReplay);
  if (!target) return;
  target.classList.remove('ui-animate');
  // Flush the removed animation so repeated clicks reliably start a new run.
  void target.offsetWidth;
  target.classList.add('ui-animate');
});

// Search the statically embedded MDI previews. SVG rendering never needs JS.
(() => {
  const search = document.querySelector('[data-mdi-search]');
  if (!search) return;
  const groups = [...document.querySelectorAll('[data-mdi-group]')];
  const icons = [...document.querySelectorAll('[data-mdi-icon]')];
  search.addEventListener('input', () => {
    const words = search.value.normalize('NFKC').toLowerCase().trim().split(/\s+/).filter(Boolean);
    let count = 0;
    for (const icon of icons) {
      const text = icon.dataset.mdiSearchText.normalize('NFKC').toLowerCase();
      icon.hidden = !words.every(word => text.includes(word));
      if (!icon.hidden) count++;
    }
    for (const group of groups) group.hidden = ![...group.querySelectorAll('[data-mdi-icon]')].some(icon => !icon.hidden);
    document.getElementById('mdi-result').textContent = count + ' / ' + icons.length + ' アイコン';
    document.querySelector('[data-mdi-empty]').hidden = count > 0;
    document.dispatchEvent(new Event('catalog:filterchange'));
  });
})();

// Chart source is illustrative; updates stay local to this catalog example.
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-demo-chart]');if(!button)return;
  const updated=button.dataset.demoChart==='updated';button.dataset.demoChart=updated?'initial':'updated';
  KavUI.chart('#chart-live',{type:'bar',label:'チームの完了件数',unit:'件',labels:['Aチーム','Bチーム','Cチーム'],series:[{name:'完了件数',values:updated?[12,18,9]:[18,25,14]}]});
  document.querySelector('[data-demo-chart-status]').textContent=updated?'初期データ':'更新後のデータ（サンプル）';
});

// Optional background preview. Local files stay in this tab and are never uploaded.
(() => {
  const root=document.querySelector('[data-demo-theme-background]');if(!root)return;
  const body=document.body,file=root.querySelector('input[type="file"]'),range=root.querySelector('[type="range"]');
  const status=root.querySelector('[data-demo-background-status]'),output=root.querySelector('output');
  let current=null,request=0;
  const release=()=>{if(current){URL.revokeObjectURL(current);current=null;}};
  const activate=()=>{if(!['glass','glassmorphism'].includes(body.dataset.uiTheme))KavUI.setDesignTheme('glassmorphism');};
  root.addEventListener('click',event=>{
    const button=event.target.closest('[data-demo-background-action]');if(!button)return;
    request++;body.style.removeProperty('--ui-theme-background-image');release();file.value='';file.dispatchEvent(new Event('change',{bubbles:true}));
    const enabled=button.dataset.demoBackgroundAction==='sample';body.classList.toggle('catalog-theme-background',enabled);
    if(enabled)activate();status.textContent=enabled?'サンプル画像を表示しています。':'画像を解除しました。元の背景を表示しています。';
  });
  range.addEventListener('input',()=>{output.value=range.value+'%';body.style.setProperty('--ui-theme-background-opacity',range.value+'%');});
  root.addEventListener('ui:filechange',async event=>{
    const selected=event.detail.files[0];file.removeAttribute('aria-invalid');
    if(!selected){request++;body.style.removeProperty('--ui-theme-background-image');body.classList.remove('catalog-theme-background');release();status.textContent='画像を解除しました。元の背景を表示しています。';return;}
    const ticket=++request,url=URL.createObjectURL(selected),image=new Image();image.src=url;
    try {
      await image.decode();
      if(ticket!==request){URL.revokeObjectURL(url);return;}
      release();current=url;body.classList.remove('catalog-theme-background');
      body.style.setProperty('--ui-theme-background-image','url("'+url+'")');activate();status.textContent=selected.name+'を表示しています（このページ内のみ）。';
    } catch {
      URL.revokeObjectURL(url);if(ticket===request){file.setAttribute('aria-invalid','true');status.textContent='画像を読み込めませんでした。別の画像を選択してください。';}
    }
  });
  window.addEventListener('pagehide',event=>{if(!event.persisted){request++;release();}});
})();
