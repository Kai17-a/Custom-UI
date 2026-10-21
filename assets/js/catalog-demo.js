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
  buttons.forEach(item => OrchtopUI.loading(item, true));
  OrchtopUI.loading(panel, true);
  progress.classList.remove('ui-progress-success', 'ui-progress-danger');
  progress.value = 0;
  percent.textContent = progress.textContent = '0%';
  result.textContent = 'データを保存中…（デモ）';
  const timer = setInterval(() => {
    progress.value += 20;
    percent.textContent = progress.textContent = progress.value + '%';
    if (progress.value < (fail ? 60 : 100)) return;
    clearInterval(timer);
    buttons.forEach(item => OrchtopUI.loading(item, false));
    OrchtopUI.loading(panel, false);
    progress.classList.add(fail ? 'ui-progress-danger' : 'ui-progress-success');
    result.textContent = fail ? '保存に失敗しました（デモ）。「保存を試す」で再試行できます。' : '保存しました（デモ）。';
  }, 300);
});
