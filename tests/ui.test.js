/* Runs in a real browser; no npm packages or test framework required. */
window.uiTestsDone = (async () => {
  const fixture = document.getElementById('fixture');
  const results = document.getElementById('results');
  const failures = [];
  let passed = 0;
  const assert = (value, message) => { if (!value) throw new Error(message); };
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const mount = html => { fixture.innerHTML = html; OrchtopUI.init(fixture); };
  const find = selector => fixture.querySelector(selector);
  const many = selector => [...fixture.querySelectorAll(selector)];
  async function test(name, run) {
    try {
      await run();
      passed++;
      const line = document.createElement('li'); line.textContent = 'PASS: ' + name; results.append(line);
    } catch (error) {
      failures.push(name + ': ' + error.message);
      const line = document.createElement('li'); line.textContent = 'FAIL: ' + name + ': ' + error.message; results.append(line);
    } finally {
      for (const dialog of fixture.querySelectorAll('dialog[open]')) dialog.close();
      document.querySelectorAll('.ui-toasts').forEach(region => region.remove());
      fixture.replaceChildren();
      await wait(0);
    }
  }
  await test('複数の開閉領域・ARIA同期・繰り返し初期化', () => {
    mount('<button data-ui-toggle="collapse" data-ui-target="#one">開閉1</button><button data-ui-toggle="collapse" data-ui-target="#one">開閉1B</button><div id="one" hidden>1</div><button data-ui-toggle="collapse" data-ui-target="#two">開閉2</button><div id="two" hidden>2</div>');
    OrchtopUI.init(fixture); OrchtopUI.init(fixture);
    const buttons = many('button'); buttons[0].click();
    assert(!find('#one').hidden && find('#two').hidden, '他の領域へ影響しない');
    assert(buttons[1].getAttribute('aria-expanded') === 'true', '同じ領域の別ボタンも同期');
    buttons[1].click(); assert(find('#one').hidden, '二重ハンドラーを登録しない');
    assert(getComputedStyle(find('#one')).display === 'none', 'ui.cssだけでhiddenが有効');
  });
  await test('サイドバーのレイアウト・ラベル同期', () => {
    mount('<button data-ui-toggle="sidebar" data-ui-target="#side" data-ui-label-open="閉じる" data-ui-label-closed="開く">切替</button><div class="app-shell"><aside class="app-sidebar" id="side">メニュー</aside><div>本文</div></div>');
    find('button').click();
    assert(find('#side').hidden && find('.app-shell').dataset.sidebarCollapsed === 'true', '幅も閉じる');
    assert(find('button').textContent === '開く', 'ボタンのラベルを更新');
  });
  await test('ID不要のアラート・個別の閉じる操作・フォーカス', () => {
    mount('<div id="notice" class="alert alert-success"><button data-ui-dismiss="alert">閉じる1</button></div><button data-ui-toggle="show" data-ui-target="#notice">再表示</button><div class="alert alert-info"><button data-ui-dismiss="alert">閉じる2</button></div>');
    const close = find('[data-ui-dismiss]'); close.focus(); close.click();
    assert(find('#notice').hidden && !many('.alert')[1].hidden, '他のアラートは維持');
    assert(document.activeElement === find('[data-ui-toggle]'), '再表示ボタンへフォーカス');
    find('[data-ui-toggle]').click(); assert(!find('#notice').hidden, '再表示');
  });
  await test('動的ツールチップ・テキスト処理・Escape・ARIA復元', () => {
    mount('<span id="help">補足</span><button data-ui-tooltip="&lt;img src=x&gt;" aria-describedby="help">1</button><button data-ui-tooltip="別の説明">2</button>');
    const buttons = many('button'); buttons[0].focus();
    const bubble = document.querySelector('[role="tooltip"]');
    assert(bubble && bubble.textContent === '<img src=x>' && !bubble.querySelector('img'), 'HTMLとして実行しない');
    assert(buttons[0].getAttribute('aria-describedby').split(' ').length === 2, '元の補足参照を残す');
    const rect = bubble.getBoundingClientRect(); assert(rect.left >= 0 && rect.right <= innerWidth, '画面からはみ出さない');
    buttons[0].dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
    assert(!document.querySelector('[role="tooltip"]') && buttons[0].getAttribute('aria-describedby') === 'help', 'Escapeで閉じて参照を戻す');
    buttons[1].click(); assert(document.querySelector('[role="tooltip"]').textContent === '別の説明', '2個目を独立して表示');
    document.body.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));
    assert(!document.querySelector('[role="tooltip"]'), '領域外で閉じる');
  });
  await test('親領域を閉じるとツールチップも消える', () => {
    mount('<button data-ui-toggle="collapse" data-ui-target="#tooltip-parent">開閉</button><div id="tooltip-parent"><button data-ui-tooltip="補足">説明</button></div>');
    find('[data-ui-tooltip]').focus();
    assert(document.querySelector('[role="tooltip"]'), '補足を開く');
    OrchtopUI.hide('#tooltip-parent');
    assert(!document.querySelector('[role="tooltip"]'), '閉じた領域の補足を残さない');
  });
  const tabs = () => '<div data-ui-tabs><div class="tabs" role="tablist" aria-label="テスト"><button data-ui-toggle="tab" data-ui-target="a">A</button><button data-ui-toggle="tab" data-ui-target="disabled" disabled>無効</button><button data-ui-toggle="tab" data-ui-target="b">B</button></div><div data-ui-panel="a">A本文</div><div data-ui-panel="disabled">無効本文</div><div data-ui-panel="b">B本文</div></div>';
  await test('タブの複数グループ・キーボード・無効項目のスキップ', () => {
    mount(tabs() + tabs());
    const groups = many('[data-ui-tabs]'); const first = groups[0].querySelector('button');
    first.focus(); first.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}));
    assert(groups[0].querySelector('[data-ui-panel="a"]').hidden, '最初のグループを切替');
    assert(!groups[1].querySelector('[data-ui-panel="a"]').hidden, '別グループには影響しない');
    assert(document.activeElement.textContent === 'B', '無効項目を飛ばす');
    assert(groups[0].querySelector('[data-ui-panel="a"]').id !== groups[1].querySelector('[data-ui-panel="a"]').id, 'IDを一意に自動生成');
    document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Home',bubbles:true,cancelable:true}));
    assert(document.activeElement === first, 'Homeで先頭へ');
  });
  const pagination = () => '<div data-ui-pagination data-ui-page-size="2">' + [1,2,3].map(n=>'<p data-ui-page-item>'+n+'</p>').join('') + '<p data-ui-page-status></p><button data-ui-page="1">1</button><button data-ui-page="2">2</button><button data-ui-page-step="1">次へ</button></div>';
  await test('ページ送りの独立性・実際の項目表示・端のフォーカス', () => {
    mount(pagination() + pagination());
    const groups = many('[data-ui-pagination]'); const next = groups[0].querySelector('[data-ui-page-step]');
    next.focus(); next.click();
    assert(groups[0].querySelector('[data-ui-page-item]').hidden, '実際に先頭項目を隠す');
    assert(!groups[1].querySelector('[data-ui-page-item]').hidden, '他の一覧は維持');
    assert(next.disabled && document.activeElement.dataset.uiPage === '2', '終端では現在ページにフォーカス');
    assert(groups[0].querySelector('[data-ui-page-status]').textContent.includes('3–3'), '最終ページの件数');
  });
  await test('フォームの独立性・入力検証・有効イベントによる送信停止', () => {
    mount('<form data-ui-validate novalidate><div data-ui-field><label>名前<input required name="name"></label><small data-ui-error hidden></small></div></form><form data-ui-validate novalidate><label>別の名前<input required></label></form>');
    const forms = many('form');
    const first = new Event('submit',{bubbles:true,cancelable:true}); forms[0].dispatchEvent(first);
    assert(first.defaultPrevented && document.activeElement === forms[0].querySelector('input'), '不正な送信を止め、最初のエラーにフォーカス');
    assert(forms[0].querySelector('input').getAttribute('aria-invalid') === 'true', 'エラー状態');
    assert(!forms[1].querySelector('input').hasAttribute('aria-invalid'), '他のフォームは検証しない');
    const field = forms[0].querySelector('input'); field.value='My app'; field.dispatchEvent(new Event('input',{bubbles:true}));
    assert(forms[0].querySelector('[data-ui-error]').hidden, '修正したフィールドのエラーを消す');
    let valid = false; forms[0].addEventListener('ui:valid',event=>{valid=true;event.preventDefault();},{once:true});
    const second = new Event('submit',{bubbles:true,cancelable:true}); forms[0].dispatchEvent(second);
    assert(valid && second.defaultPrevented, 'アプリ側で有効送信を受け取って止められる');
    forms[1].dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
    forms[1].dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
    assert(forms[1].querySelectorAll('[data-ui-error]').length === 1, '自動生成のエラーを重複しない');
  });
  await test('native dialogの複数配置・検証・フォーカス復帰', async () => {
    mount('<button data-ui-toggle="dialog" data-ui-target="#modal1">開く1</button><dialog data-ui-dialog class="ui-dialog" id="modal1" aria-label="入力"><form method="dialog" data-ui-validate novalidate><label>名前<input required></label><button type="submit">確認</button><button type="button" data-ui-dismiss="dialog">閉じる</button></form></dialog><button data-ui-toggle="dialog" data-ui-target="#modal2">開く2</button><dialog data-ui-dialog class="ui-dialog" id="modal2" aria-label="別の確認"><button data-ui-dismiss="dialog">閉じる</button></dialog>');
    const opener = find('[data-ui-target="#modal1"]'); opener.focus(); opener.click();
    assert(find('#modal1').open && !find('#modal2').open, '指定したダイアログだけ開く');
    find('form').requestSubmit(); assert(find('#modal1').open, '不正なら開いたまま');
    find('input').value='valid'; find('form').requestSubmit(); await wait(30);
    assert(!find('#modal1').open && document.activeElement === opener, '有効なら閉じ、元のボタンへ');
    find('[data-ui-target="#modal2"]').click(); assert(find('#modal2').open,'別のダイアログも開く');
    find('#modal2 button').click(); await wait(30); assert(!find('#modal2').open, '属性で閉じる');
  });
  const board = () => '<div data-ui-board><section data-ui-column="todo"><span data-ui-count></span><div data-ui-cards><article data-ui-card="sample" class="task-card"><label>移動先<select data-ui-move><option value="todo">Todo</option><option value="done">Done</option></select></label></article></div><p data-ui-empty>空</p></section><section data-ui-column="done"><span data-ui-count></span><div data-ui-cards></div><p data-ui-empty>空</p></section></div>';
  await test('カンバンの独立性・select移動・通知イベント', () => {
    mount(board()+board()); const boards=many('[data-ui-board]'); const select=boards[0].querySelector('select');
    let detail; boards[0].addEventListener('ui:move',event=>{detail=event.detail;});
    select.focus(); select.value='done';select.dispatchEvent(new Event('change',{bubbles:true}));
    assert(select.closest('[data-ui-column]').dataset.uiColumn==='done','正しい列へ移動');
    assert(boards[1].querySelector('select').closest('[data-ui-column]').dataset.uiColumn==='todo','別ボードは維持');
    assert(boards[0].querySelector('[data-ui-count]').textContent==='0','件数更新');
    assert(detail.from==='todo' && detail.to==='done' && detail.card.contains(select),'アプリへ移動を通知');
    assert(document.activeElement===select,'キーボード操作後もフォーカス維持');
  });
  await test('ドラッグ移動・他のボードへのドロップを拒否', () => {
    mount(board()+board()); const boards=many('[data-ui-board]');const card=find('[data-ui-card]');
    const dataTransfer=new DataTransfer();card.dispatchEvent(new DragEvent('dragstart',{bubbles:true,dataTransfer}));
    const external=new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer});boards[1].querySelector('[data-ui-column="done"]').dispatchEvent(external);
    assert(!external.defaultPrevented && card.closest('[data-ui-board]')===boards[0],'別ボードには移動しない');
    boards[0].querySelector('[data-ui-column="done"]').dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer}));
    assert(card.closest('[data-ui-column]').dataset.uiColumn==='done' && !card.classList.contains('dragged'),'同じボード内で移動しドラッグ表示を消す');
  });
  async function withClipboard(clipboard, run) {
    const previous=Object.getOwnPropertyDescriptor(navigator,'clipboard');
    Object.defineProperty(navigator,'clipboard',{configurable:true,value:clipboard});
    try { await run(); } finally {
      if(previous)Object.defineProperty(navigator,'clipboard',previous);else delete navigator.clipboard;
    }
  }
  await test('クリップボードの直接指定・現在の入力値・改行・動的追加', async () => {
    const values=[];
    await withClipboard({writeText:async text=>{values.push(text);}},async()=>{
      mount('<form><div class="ui-clipboard"><button class="ui-copy-icon" data-ui-copy="&lt;b&gt;文字列&lt;/b&gt;">コピー</button><p data-ui-copy-status role="status"></p></div><textarea id="copy-source">初期値</textarea><button type="button" data-ui-copy-target="#copy-source">入力をコピー</button><pre id="copy-code">  code\n next</pre><button type="button" data-ui-copy-target="#copy-code">コードをコピー</button></form>');
      let submits=0,copied;find('form').addEventListener('submit',event=>{submits++;event.preventDefault();});
      find('button').addEventListener('ui:copy',event=>{copied=event.detail.text;});
      const originalGlyph=find('button path').getAttribute('d');
      assert(find('button').textContent==='' && getComputedStyle(find('button')).borderTopWidth==='0px','初期状態は枠のないアイコン');
      find('button').focus();find('button').click();await wait(0);
      assert(find('button').dataset.uiCopyState==='success' && find('button path').getAttribute('d')!==originalGlyph,'成功時にチェックマークへ切り替える');
      OrchtopUI.init(fixture);assert(find('button').dataset.uiCopyState==='success' && find('button svg').getAttribute('aria-hidden')==='true','再初期化してもチェック表示を保ち、装飾を読み上げない');
      assert(values[0]==='<b>文字列</b>' && copied===values[0] && submits===0,'文字列をそのままコピーし、フォームを送信しない');
      assert(find('[data-ui-copy-status]').textContent==='コピーしました。' && document.activeElement===find('button'),'成功を伝え、フォーカスを保つ');
      find('textarea').value='変更後\n2行目';many('button')[1].click();await wait(0);
      many('button')[2].click();await wait(0);
      assert(values[1]==='変更後\n2行目' && values[2]==='  code\n next','現在の値・改行・空白を保持');
      assert(many('button')[1].textContent==='入力をコピー' && !many('button')[1].classList.contains('ui-copy-icon'),'文字付きボタンをアイコンに変換しない');
      assert(getComputedStyle(many('[data-ui-copy-status]')[1]).position!=='absolute','文字付きボタンの成功メッセージを表示');
      fixture.insertAdjacentHTML('beforeend','<button data-ui-copy="">空の文字列</button>');
      many('button')[3].click();await wait(0);
      assert(values[3]==='' && many('[data-ui-copy-status]').length===4,'動的な単独ボタンも動作し、結果を個別に生成');
      await OrchtopUI.copy('API');assert(values[4]==='API','直接APIもPromiseで呼べる');
    });
  });
  await test('コピー拒否・未対応・対象なし・無効ボタン・失敗後の再試行', async () => {
    let reject=true,writes=0;
    await withClipboard({writeText:async()=>{writes++;if(reject)throw new Error('denied');}},async()=>{
      mount('<button data-ui-copy="retry" aria-busy="false">コピー</button><button data-ui-copy-target="[">不正な対象</button><button disabled data-ui-copy="disabled">無効</button>');
      let errors=0;find('button').addEventListener('ui:copyerror',()=>errors++);
      find('button').click();await wait(0);
      assert(errors===1 && find('[data-ui-copy-status]').dataset.uiCopyState==='error' && !find('button').hasAttribute('data-ui-copy-state'),'拒否を成功として扱わずコピーアイコンを保つ');
      assert(!find('button').hasAttribute('aria-disabled') && find('button').getAttribute('aria-busy')==='false','元のARIA状態へ戻す');
      reject=false;find('button').click();await wait(0);
      assert(find('[data-ui-copy-status]').dataset.uiCopyState==='success','同じボタンから再試行できる');
      many('button')[1].click();many('button')[2].click();await wait(0);
      assert(writes===2 && many('[data-ui-copy-status]')[1].dataset.uiCopyState==='error','対象なしは書き込まず、無効ボタンは動かない');
    });
    await withClipboard(undefined,async()=>{
      let failed=false;try {await OrchtopUI.copy('unsupported');}catch {failed=true;}
      assert(failed,'未対応のAPIはrejectする');
    });
  });
  await test('トーストの任意コピー・本文と別の値・属性指定・互換性', async () => {
    const values=[];
    await withClipboard({writeText:async text=>{values.push(text);}},async()=>{
      assert(!OrchtopUI.toast('従来の通知',{duration:0}).querySelector('[data-ui-copy]'),'指定しない通知は従来のまま');
      const body=OrchtopUI.toast({title:'タイトル',body:'本文\n次の行',copy:true,duration:0});
      body.querySelector('[data-ui-copy]').click();await wait(0);
      assert(values[0]==='本文\n次の行' && body.querySelector('[data-ui-copy-status]').textContent==='コピーしました。','本文のみをコピーする');
      const title=OrchtopUI.toast({title:'タイトルのみ',copy:true,duration:0});
      assert(title.querySelector('[data-ui-copy]').dataset.uiCopy==='タイトルのみ','本文がない通知はタイトルをコピーする');
      mount('<button data-ui-toast="説明文" data-ui-toast-copy data-ui-copy-text="ERR-001" data-ui-copy-label="IDをコピー" data-ui-duration="0">通知</button>');
      find('button').click();const note=document.querySelector('.ui-toast:last-child');
      assert(note.querySelector('[data-ui-copy]').textContent==='' && note.querySelector('[data-ui-copy]').getAttribute('aria-label')==='IDをコピー','文字を表示せずアイコンの読み上げ名を指定');
      note.querySelector('[data-ui-copy]').click();await wait(0);assert(values[1]==='ERR-001','本文と別の文字列をコピー');
      const empty=OrchtopUI.toast({body:'本文',copy:true,copyText:'',duration:0});
      assert(empty.querySelector('[data-ui-copy]').dataset.uiCopy==='','空文字列の明示指定も保持');
    });
  });
  await test('トーストのコピーとチェックは全通知色・テーマを引き継ぐ', async () => {
    const theme=document.documentElement.dataset.bsTheme;
    try {
      await withClipboard({writeText:async()=>{}},async()=>{
        for(const selected of ['light','dark']) {
          document.documentElement.dataset.bsTheme=selected;
          for(const variant of ['success','info','warning','danger']) {
            const note=OrchtopUI.toast({body:'通知',variant,copy:true,duration:0});
            const button=note.querySelector('[data-ui-copy]');
            assert(getComputedStyle(button).color===getComputedStyle(note).color,'コピーアイコンの色を通知に合わせる');
            button.click();await wait(0);
            assert(button.dataset.uiCopyState==='success' && getComputedStyle(button).color===getComputedStyle(note).color,'チェックマークも通知色を維持');
            note.remove();
          }
        }
      });
    } finally { document.documentElement.dataset.bsTheme=theme; }
  });
  await test('コピー待機中の重複操作とトースト自動消去を抑止', async () => {
    let complete,writes=0;
    await withClipboard({writeText:()=>{writes++;return new Promise(resolve=>{complete=resolve;});}},async()=>{
      const note=OrchtopUI.toast({body:'コピーを待つ',copy:true,duration:35});
      const button=note.querySelector('[data-ui-copy]');button.click();button.click();
      await wait(100);
      assert(writes===1 && note.isConnected && button.getAttribute('aria-busy')==='true','コピー処理中は消去せず、二重操作もしない');
      complete();await wait(100);
      assert(!note.isConnected,'コピー完了後に自動消去を再開');
    });
  });
  await test('トーストの生成・安全な文言・自動消去・手動消去', async () => {
    const success=OrchtopUI.toast('<strong>text</strong>',{duration:35});
    const error=OrchtopUI.toast('error',{variant:'danger',duration:0});
    assert(success.textContent.includes('<strong>text</strong>') && !success.querySelector('strong'),'テキストとして表示');
    assert(error.getAttribute('role')==='alert','エラーを通知');
    await wait(100);assert(!success.isConnected && error.isConnected,'成功だけ自動消去');
    error.querySelector('button').click();assert(!error.isConnected,'共通属性で手動消去');
  });
  await test('構造化トースト・タイトルと本文と補足・文字列APIとの互換性', () => {
    const structured=OrchtopUI.toast({title:'<b>保存完了</b>',body:'1行目\n2行目',meta:'たった今',variant:'info',duration:0});
    assert(structured.querySelector('.ui-toast-title').textContent==='<b>保存完了</b>' && !structured.querySelector('b'),'タイトルもHTMLとして実行しない');
    assert(structured.querySelector('.ui-toast-body').textContent==='1行目\n2行目','本文の改行を保持');
    assert(structured.querySelector('.ui-toast-meta').textContent==='たった今','補足を表示');
    assert(structured.getAttribute('aria-atomic')==='true','通知全体を読み上げる');
    const legacy=OrchtopUI.toast('以前の本文',{title:'互換タイトル',duration:0});
    assert(legacy.querySelector('.ui-toast-body').textContent==='以前の本文','文字列形式を維持');
    const titleOnly=OrchtopUI.toast({title:'タイトルだけ',duration:0});
    assert(!titleOnly.querySelector('.ui-toast-body'),'不要な本文領域を作らない');
    const explicit=OrchtopUI.toast('fallback',{body:'明示した本文',duration:0});
    assert(explicit.querySelector('.ui-toast-body').textContent==='明示した本文','bodyを優先する');
  });
  await test('属性指定のトースト・固定幅・長い文字列の折り返し', () => {
    mount('<button data-ui-toast data-ui-title="保存しました" data-ui-body="プロジェクトの変更を保存しました。" data-ui-meta="たった今" data-ui-variant="success" data-ui-duration="0">通知</button>');
    find('button').click();
    const short=document.querySelector('.ui-toast');
    assert(short.querySelector('.ui-toast-title').textContent==='保存しました' && short.querySelector('.ui-toast-meta').textContent==='たった今','属性から生成');
    const long=OrchtopUI.toast({title:'長いタイトル'.repeat(12),body:'https://example.test/'+ 'long-unbroken-project-identifier'.repeat(12),meta:'ログの更新',duration:0});
    const expected=Math.min(360,document.documentElement.clientWidth-32);
    const bounds=long.getBoundingClientRect();
    assert(Math.abs(bounds.width-expected)<1 && Math.abs(short.getBoundingClientRect().width-bounds.width)<1,'内容によらず同じ幅 '+JSON.stringify({expected,long:bounds.width,short:short.getBoundingClientRect().width,viewport:document.documentElement.clientWidth}));
    assert(bounds.left>=16 && bounds.right<=innerWidth-16+1,'狭い画面でも収める');
    for (const part of long.querySelectorAll('.ui-toast-title, .ui-toast-body')) assert(part.scrollWidth<=part.clientWidth+1,'長い英字や日本語を折り返す');
    const close=long.querySelector('.btn-close').getBoundingClientRect();
    assert(close.right<=bounds.right && close.left>=bounds.left,'閉じるボタンを収める');
    const root=document.documentElement;root.style.setProperty('--ui-toast-width','420px');
    try { assert(Math.abs(long.getBoundingClientRect().width-Math.min(420,document.documentElement.clientWidth-32))<1,'CSS変数で幅を変更'); }
    finally { root.style.removeProperty('--ui-toast-width'); }
  });
  await test('カレンダーの独立性・月切替・うるう年', () => {
    mount('<div data-ui-calendar data-ui-month="2024-02"></div><div data-ui-calendar data-ui-month="2025-02"></div>');
    const roots=many('[data-ui-calendar]');
    assert(roots[0].querySelector('[data-ui-calendar-date="2024-02-29"]') && !roots[1].querySelector('[data-ui-calendar-date="2025-02-29"]'),'うるう日を正しく描画');
    assert(roots[0].querySelectorAll('tbody tr').length===6,'6週のレイアウト');
    let detail;roots[0].addEventListener('ui:monthchange',event=>{detail=event.detail;});
    roots[0].querySelector('[data-ui-calendar-action="next"]').click();
    assert(roots[0].dataset.uiMonth==='2024-03' && roots[1].dataset.uiMonth==='2025-02','別のカレンダーに影響しない');
    assert(detail.month==='2024-03','表示月変更を通知');
    roots[0].querySelector('[data-ui-calendar-action="prev"]').click();assert(roots[0].dataset.uiMonth==='2024-02','前月へ戻る');
  });
  await test('カレンダーの日付選択・フォーム値・予定の安全な表示', () => {
    mount('<form><div data-ui-calendar data-ui-month="2026-10" data-ui-name="scheduled_date"><ul data-ui-calendar-events><li data-ui-date="2026-10-21" data-ui-variant="success">10:00 レビュー</li><li data-ui-date="2026-10-21">&lt;img src=x&gt;</li></ul></div></form>');
    const root=find('[data-ui-calendar]');let detail;root.addEventListener('ui:datechange',event=>{detail=event.detail;});
    const button=root.querySelector('[data-ui-calendar-date="2026-10-21"]');button.click();
    assert(root.dataset.uiValue==='2026-10-21' && detail.value==='2026-10-21' && detail.previousValue==='','日付を選択して通知');
    assert(new FormData(find('form')).get('scheduled_date')==='2026-10-21','フォームへ値を連携');
    assert(root.querySelector('[aria-pressed="true"]').dataset.uiCalendarDate==='2026-10-21','選択状態を伝える');
    assert(root.querySelectorAll('.ui-calendar-agenda-event').length===2 && !root.querySelector('.ui-calendar-agenda img'),'選択日の予定を安全に表示');
    root.querySelector('[data-ui-calendar-date="2026-10-22"]').click();assert(root.querySelector('.ui-calendar-empty').textContent.includes('ありません'),'予定のない日');
    OrchtopUI.init(root);assert(root.dataset.uiValue==='2026-10-22' && root.querySelectorAll('[data-ui-calendar-view]').length===1,'再初期化で状態を維持し、重複生成しない');
  });
  await test('カレンダーの選択範囲・月曜始まり・無効な範囲', () => {
    mount('<div data-ui-calendar data-ui-month="2026-10" data-ui-week-start="monday" data-ui-min="2026-10-10" data-ui-max="2026-10-25"></div>');
    const root=find('[data-ui-calendar]');
    assert(root.querySelector('th').textContent==='月','月曜から表示');
    assert(root.querySelector('[data-ui-calendar-date="2026-10-09"]').disabled && !root.querySelector('[data-ui-calendar-date="2026-10-10"]').disabled,'最小日付を守る');
    assert(root.querySelector('[data-ui-calendar-date="2026-10-26"]').disabled,'最大日付を守る');
    assert(root.querySelector('[data-ui-calendar-action="prev"]').disabled && root.querySelector('[data-ui-calendar-action="next"]').disabled,'範囲外の月へ移動しない');
    root.dataset.uiMin='2026-11-01';OrchtopUI.init(root);assert(root.querySelector('[role="alert"]'),'矛盾する範囲を明示');
  });
  await test('カレンダーのキーボード・月末の移動・範囲の端', () => {
    mount('<div data-ui-calendar data-ui-value="2024-01-31"></div>');const root=find('[data-ui-calendar]');
    let button=root.querySelector('[tabindex="0"][data-ui-calendar-date]');button.focus();
    button.dispatchEvent(new KeyboardEvent('keydown',{key:'PageDown',bubbles:true,cancelable:true}));
    assert(root.dataset.uiMonth==='2024-02' && document.activeElement.dataset.uiCalendarDate==='2024-02-29','31日から翌月末へ移動');
    assert(root.dataset.uiValue==='2024-01-31','移動だけでは選択値を変えない');
    document.activeElement.click();assert(root.dataset.uiValue==='2024-02-29','移動先を選択');
    document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}));
    assert(root.dataset.uiMonth==='2024-03' && document.activeElement.dataset.uiCalendarDate==='2024-03-01','月をまたぐ移動');
    document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Home',bubbles:true,cancelable:true}));
    assert(document.activeElement.dataset.uiCalendarDate==='2024-02-25','週の先頭へ移動');
    assert(root.querySelectorAll('[data-ui-calendar-date][tabindex="0"]').length===1,'日付のTab移動先は1つ');
    root.dataset.uiMin='2024-02-29';root.dataset.uiMax='2024-02-29';OrchtopUI.init(root);
    const last=root.querySelector('[data-ui-calendar-date="2024-02-29"]');last.focus();last.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}));
    assert(document.activeElement.dataset.uiCalendarDate==='2024-02-29','選択範囲の端で止まる');
  });
  await test('カレンダーの今日へ移動・長い予定・狭い画面', () => {
    mount('<div data-ui-calendar data-ui-month="2024-01"><ul data-ui-calendar-events><li data-ui-date="2024-01-15">'+ 'LongUnbrokenEventTitle'.repeat(16)+'</li></ul></div>');
    const root=find('[data-ui-calendar]');root.querySelector('[data-ui-calendar-date="2024-01-15"]').click();
    assert(root.scrollWidth<=root.clientWidth+1,'長い予定でもはみ出さない');
    root.querySelector('[data-ui-calendar-action="today"]').click();const date=new Date();
    const today=String(date.getFullYear()).padStart(4,'0')+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');
    assert(root.dataset.uiValue===today && root.querySelector('[aria-current="date"]').dataset.uiCalendarDate===today,'ローカルの今日を選択');
    const active=root.querySelector('[aria-pressed="true"]');assert(active.getAttribute('aria-label').includes('今日'),'今日をラベルでも示す');
  });
  const dateField=(name,attrs='')=>'<div class="field" data-ui-field><label for="'+name+'">日付</label><div class="ui-datepicker" data-ui-datepicker><input id="'+name+'" name="'+name+'" type="date" class="form-control" '+attrs+'></div><small data-ui-error hidden></small></div>';
  await test('日付フォームの選択・通常の送信値・複数配置', () => {
    mount('<form>'+dateField('first-date','value="2026-10-21"')+dateField('second-date','value="2026-10-25"')+'</form>');
    const roots=many('[data-ui-datepicker]');let inputs=0,changes=0,submits=0;
    const input=roots[0].querySelector('input');input.addEventListener('input',()=>inputs++);input.addEventListener('change',()=>changes++);find('form').addEventListener('submit',event=>{submits++;event.preventDefault();});
    roots[0].querySelector('[data-ui-datepicker-action="toggle"]').click();
    assert(roots[0].querySelector('.ui-datepicker-popup').matches(':popover-open'),'カレンダーを開く');
    roots[0].querySelector('[data-ui-calendar-date="2026-10-21"]').click();
    assert(!roots[0].querySelector('.ui-datepicker-popup').matches(':popover-open') && changes===0,'同じ日付でも閉じ、不要なchangeは出さない');
    roots[0].querySelector('[data-ui-datepicker-action="toggle"]').click();
    roots[0].querySelector('[data-ui-calendar-date="2026-10-22"]').click();
    assert(input.value==='2026-10-22' && roots[1].querySelector('input').value==='2026-10-25','選択した欄だけ更新');
    assert(new FormData(find('form')).get('first-date')==='2026-10-22' && new FormData(find('form')).getAll('first-date').length===1,'標準入力欄だけで送信');
    assert(inputs===1 && changes===1 && submits===0,'input/changeを発行し、開閉で送信しない');
    assert(!roots[0].querySelector('.ui-datepicker-popup').matches(':popover-open') && document.activeElement===input,'選択後は閉じて入力欄へ戻る');
  });
  await test('日付フォームの直接入力・クリア・必須検証・リセット', async () => {
    mount('<form data-ui-validate novalidate>'+dateField('required-date','value="2026-10-21" required')+'</form>');
    const input=find('input');input.value='2026-11-01';input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));
    find('[data-ui-datepicker-action="toggle"]').click();assert(find('[aria-pressed="true"]').dataset.uiCalendarDate==='2026-11-01','直接入力をカレンダーに反映');
    find('[data-ui-datepicker-action="clear"]').click();assert(input.value==='','クリアで未入力');
    const submit=new Event('submit',{bubbles:true,cancelable:true});find('form').dispatchEvent(submit);
    assert(submit.defaultPrevented && input.getAttribute('aria-invalid')==='true','requiredを検証');
    find('form').reset();await wait(0);assert(input.value==='2026-10-21' && !input.hasAttribute('aria-invalid'),'リセットで初期値と検証表示を復元');
    find('[data-ui-datepicker-action="toggle"]').click();assert(find('[aria-pressed="true"]').dataset.uiCalendarDate==='2026-10-21','再び開くと初期値を表示');
    find('[data-ui-datepicker-action="close"]').click();
  });
  await test('日付フォームのmin/max・ネイティブ制約・読み取り専用・disabled', () => {
    mount('<form>'+dateField('bounded-date','value="2026-10-21" min="2026-10-10" max="2026-10-25"')+dateField('fixed-date','value="2026-10-21" readonly')+dateField('disabled-date','value="2026-10-21" disabled')+'</form>');
    const roots=many('[data-ui-datepicker]');
    roots[0].querySelector('[data-ui-datepicker-action="toggle"]').click();
    assert(roots[0].querySelector('[data-ui-calendar-date="2026-10-09"]').disabled && roots[0].querySelector('[data-ui-calendar-date="2026-10-26"]').disabled,'範囲外は選択不可');
    roots[0].querySelector('[data-ui-datepicker-action="close"]').click();
    const input=roots[0].querySelector('input');input.value='2026-10-01';assert(!input.checkValidity(),'直接入力の範囲外も検証');
    assert(roots[1].querySelector('button').disabled && roots[2].querySelector('button').disabled,'読み取り専用・無効で開けない');
    const values=new FormData(find('form'));assert(values.has('fixed-date') && !values.has('disabled-date'),'標準の送信ルール');
    OrchtopUI.init(fixture);assert(roots[0].querySelectorAll('.ui-datepicker-toggle').length===1,'再初期化で重複しない');
  });
  await test('日付フォームのEscape・Alt+矢印・フォーカス移動・領域外で閉じる', () => {
    mount(dateField('keyboard-date','value="2026-10-21"')+'<button id="next-control">次の項目</button>');
    const input=find('input'),toggle=find('.ui-datepicker-toggle'),popup=find('.ui-datepicker-popup');
    input.focus();input.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',altKey:true,bubbles:true,cancelable:true}));
    assert(popup.matches(':popover-open') && popup.contains(document.activeElement),'Alt+↓で開き日付にフォーカス');
    document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
    assert(!popup.matches(':popover-open') && document.activeElement===input && toggle.getAttribute('aria-expanded')==='false','Escapeで入力へ戻る');
    toggle.click();find('#next-control').focus();assert(!popup.matches(':popover-open') && document.activeElement===find('#next-control'),'他の項目へ移動してもフォーカスを奪わない');
    toggle.click();document.body.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));assert(!popup.matches(':popover-open'),'領域外で閉じる');
  });
  await test('日付フォームはダイアログ内でも開き、Escapeで親を閉じない', () => {
    mount('<dialog class="ui-dialog" data-ui-dialog aria-label="フォーム">'+dateField('dialog-date','value="2026-10-21"')+'</dialog>');
    find('dialog').showModal();find('.ui-datepicker-toggle').click();
    assert(find('.ui-datepicker-popup').matches(':popover-open'),'モーダル上で表示');
    document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
    assert(find('dialog').open && !find('.ui-datepicker-popup').matches(':popover-open'),'日付選択だけ閉じる');
    find('dialog').close();
  });
  await test('日付フォームのポップアップが画面内に収まる', () => {
    mount(dateField('small-date','value="2026-10-21"'));find('.ui-datepicker-toggle').click();
    const popup=find('.ui-datepicker-popup'),box=popup.getBoundingClientRect();
    assert(box.left>=7 && box.right<=innerWidth-7,'横にはみ出さない');
    assert(box.top>=7 && box.bottom<=innerHeight-7,'縦にはみ出さない');
    assert(popup.scrollWidth<=popup.clientWidth+1,'中身の横はみ出しなし');
    find('[data-ui-datepicker-action="close"]').click();
  });
  await test('日付フォームのアイコンボタン・読み上げラベル・再初期化', () => {
    mount('<div class="field"><label for="icon-date">実施日</label><div data-ui-datepicker data-ui-datepicker-button="icon"><input id="icon-date" name="icon_date" type="date" value="2026-10-21"></div></div>');
    const root=find('[data-ui-datepicker]'),button=find('.ui-datepicker-toggle');
    assert(button.classList.contains('ui-datepicker-toggle-icon') && button.textContent==='','文字を出さずアイコンで表示');
    assert(button.getAttribute('aria-label')==='実施日のカレンダーを開く' && button.title===button.getAttribute('aria-label'),'名前とホバー時の説明を維持');
    assert(button.querySelector('svg').getAttribute('aria-hidden')==='true' && button.querySelector('svg').getAttribute('focusable')==='false','装飾アイコンを読み上げやTab移動の対象にしない');
    button.querySelector('path').dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
    assert(root.querySelector('.ui-datepicker-popup').matches(':popover-open'),'SVG内をクリックしても開く');
    root.querySelector('[data-ui-calendar-date="2026-10-22"]').click();
    assert(find('input').value==='2026-10-22' && document.activeElement===find('input'),'日付選択とフォーカス復帰');
    OrchtopUI.init(root);assert(button.querySelectorAll('svg').length===1 && root.querySelectorAll('.ui-datepicker-toggle').length===1,'再初期化で重複しない');
    root.removeAttribute('data-ui-datepicker-button');OrchtopUI.init(root);assert(button.textContent==='カレンダー' && !button.querySelector('svg'),'文字版へ戻せる');
    root.dataset.uiDatepickerButton='icon';find('input').readOnly=true;OrchtopUI.init(root);assert(button.disabled && button.querySelector('svg'),'読み取り専用時もアイコン版を無効化');
  });
  await test('ローディングで二重操作を止め、ラベル・幅・状態を復元', async () => {
    mount('<button id="loading-button" type="button" class="btn btn-primary ui-loading-button"><span class="ui-loading-label">変更を保存する</span><span class="ui-spinner ui-spinner-sm ui-loading-indicator" aria-hidden="true"></span></button>');
    const button=find('button');let clicks=0;button.addEventListener('click',()=>clicks++);
    const width=button.getBoundingClientRect().width;
    assert(OrchtopUI.loading('#loading-button',true),'セレクターを受け付ける');
    OrchtopUI.loading(button,true);OrchtopUI.init(fixture);
    button.click();
    assert(clicks===0 && button.disabled && button.getAttribute('aria-busy')==='true','二重操作を抑止');
    await wait(180);
    assert(getComputedStyle(find('.ui-loading-indicator')).display!=='none' && getComputedStyle(find('.ui-loading-label')).opacity==='0','スピナーに切り替える');
    assert(Math.abs(button.getBoundingClientRect().width-width)<1 && button.textContent==='変更を保存する','幅と読み上げ用の名前を保持');
    OrchtopUI.loading(button,false);button.click();
    assert(clicks===1 && !button.disabled && !button.hasAttribute('aria-busy'),'複数回開始しても元に復元');
    assert(getComputedStyle(find('.ui-loading-indicator')).display==='none','終了後はスピナーを非表示');
    OrchtopUI.loading(button,true);OrchtopUI.loading(button,false);
    assert(!button.disabled,'再試行でも復元');
  });
  await test('ローディングの元の無効状態・パネル・不正な指定', () => {
    mount('<button disabled aria-busy="false">保存</button><div id="busy-panel" class="ui-card ui-loading-border" aria-busy="false">データ</div>');
    const button=find('button'),panel=find('#busy-panel');
    OrchtopUI.loading(button,true);OrchtopUI.loading(button,false);
    assert(button.disabled && button.getAttribute('aria-busy')==='false','元から無効なボタンを勝手に有効化しない');
    OrchtopUI.loading(panel,true);
    assert(panel.getAttribute('aria-busy')==='true' && getComputedStyle(panel,'::after').content!=='none','パネルの枠線を有効化');
    OrchtopUI.loading(panel,false);
    assert(panel.getAttribute('aria-busy')==='false' && getComputedStyle(panel,'::after').content==='none','パネルの状態を復元');
    assert(!OrchtopUI.loading('[') && !OrchtopUI.loading('#missing') && !OrchtopUI.loading(null) && !OrchtopUI.loading(button,false),'不正な指定・余分な終了は安全に無視');
  });
  await test('出現時のフェード・再表示・閉じる操作は即時', () => {
    mount('<button data-ui-tooltip="補足">説明</button><dialog class="ui-dialog" data-ui-dialog><button data-ui-dismiss="dialog">閉じる</button></dialog><div id="fade-panel" hidden>開閉パネル</div><div class="alert alert-info" hidden>通知</div>');
    const entrance=element=>element.getAnimations().find(animation=>animation.animationName==='ui-appear');
    const check=element=>{
      const animation=entrance(element);
      assert(animation,'追加指定なしでフェードが始まる');
      animation.pause();animation.currentTime=80;
      const opacity=Number(getComputedStyle(element).opacity);
      assert(opacity>0 && opacity<1,'実際に半透明で描画される');
      animation.finish();
      assert(getComputedStyle(element).opacity==='1','完了後は不透明になる');
      return animation;
    };
    const dialog=find('dialog');dialog.showModal();check(dialog);dialog.close();
    assert(!dialog.open && getComputedStyle(dialog).display==='none','閉じる操作を遅延させない');
    dialog.showModal();assert(entrance(dialog)?.playState==='running','ネイティブAPIでの再表示もフェード');dialog.close();
    const panel=find('#fade-panel');OrchtopUI.show(panel);const first=check(panel);
    OrchtopUI.show(panel);assert(!entrance(panel) && getComputedStyle(panel).opacity==='1','表示中のshowで点滅させない');
    OrchtopUI.hide(panel);assert(panel.hidden && getComputedStyle(panel).display==='none','パネルも即時に閉じる');
    OrchtopUI.show(panel);assert(entrance(panel)!==first,'開き直すと再びフェード');
    OrchtopUI.show(find('.alert'));check(find('.alert'));
    const note=OrchtopUI.toast('通知',{duration:0});check(note);
    find('[data-ui-tooltip]').focus();check(document.querySelector('.ui-tooltip'));
    document.body.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));
  });
  await test('閉じる動きは操作・ARIA・IDを残さず、再表示で打ち消せる', async () => {
    await wait(200);
    mount('<button data-ui-toggle="show" data-ui-target="#exit-alert">再表示</button><div id="exit-alert" class="alert alert-info"><span id="exit-label">通知</span><button data-ui-dismiss="alert">閉じる</button></div>');
    const panel=find('#exit-alert');panel.getAnimations().forEach(animation=>animation.finish());
    find('[data-ui-dismiss]').focus();OrchtopUI.hide(panel);
    assert(panel.hidden && document.activeElement===find('[data-ui-toggle]'),'状態とフォーカスを即座に更新');
    const ghost=document.querySelector('[data-ui-motion-ghost]');
    assert(ghost && ghost.inert && ghost.getAttribute('aria-hidden')==='true' && !ghost.shadowRoot,'見た目のコピーは非操作・非読み上げで閉じる');
    assert(document.querySelectorAll('#exit-label').length===1 && document.querySelectorAll('[data-ui-dismiss="alert"]').length===1,'アプリにIDや操作対象を重複させない');
    OrchtopUI.show(panel);assert(!ghost.isConnected && !panel.hidden,'開き直したら古い閉じる動きを破棄');
    panel.getAnimations().forEach(animation=>animation.finish());OrchtopUI.hide(panel);
    await wait(200);assert(!document.querySelector('[data-ui-motion-ghost]'),'閉じる描画を完了後に片付ける');
  });
  await test('汎用の表示操作でもスピナー本来の回転を維持する', () => {
    mount('<span class="ui-spinner" hidden aria-label="読み込み中"></span>');
    const spinner=find('.ui-spinner');OrchtopUI.show(spinner);
    assert(!spinner.hidden && getComputedStyle(spinner).animationName==='ui-spinner-turn','出現の演出で回転を置き換えない');
    assert(spinner.getAnimations().some(animation=>animation.animationName==='ui-spinner-turn'),'スピナーが実際に回転し続ける');
  });
  await test('ページ送りは状態を即座に変えてから動く', () => {
    mount('<div data-ui-pagination data-ui-page-size="1"><p data-ui-page-item>1</p><p data-ui-page-item>2</p><button data-ui-page="2">2</button></div>');
    find('[data-ui-page]').click();
    const visible=many('[data-ui-page-item]')[1];
    assert(!visible.hidden && many('[data-ui-page-item]')[0].hidden && visible.getAnimations().length,'ページ状態を待たずに反映し、表示をアニメーション');
  });
  await test('不正・不存在のターゲットで例外を出さない', () => {
    mount('<button data-ui-toggle="dialog" data-ui-target="[">不正</button><button data-ui-toggle="collapse" data-ui-target="#absent">不存在</button>');
    many('button').forEach(button=>button.click());
    assert(!find('dialog'),'余計な部品を生成しない');
  });
  await test('未挿入DOMの初期化・動的追加・再初期化', () => {
    const element=document.createElement('div');element.innerHTML=tabs();
    OrchtopUI.init(element);fixture.append(element);OrchtopUI.init(element);
    element.querySelector('[data-ui-target="b"]').click();assert(!element.querySelector('[data-ui-panel="b"]').hidden,'追加後も操作できる');
    assert(element.querySelector('[role="tab"]'),'ARIAも初期化');
  });
  await test('デザインテーマの選択同期・動的初期化・明暗との独立性', () => {
    const before=document.body.dataset.uiTheme;
    const mode=document.documentElement.dataset.bsTheme;
    try {
      const options='<option value="default">標準</option><option value="glass">ガラス</option><option value="glassmorphism">グラスモーフィズム</option><option value="flat">フラット</option><option value="soft">ソフト</option>';
      mount('<select data-ui-theme-select>'+options+'</select><select data-ui-theme-select>'+options+'</select><button data-ui-toggle="theme">明暗</button>');
      let detail;const listener=event=>{detail=event.detail;};document.body.addEventListener('ui:designchange',listener,{once:true});
      many('select')[0].value='glass';many('select')[0].dispatchEvent(new Event('change',{bubbles:true}));
      assert(document.body.dataset.uiTheme==='glass' && many('select').every(select=>select.value==='glass'),'すべての選択欄に反映');
      assert(detail.theme==='glass' && document.documentElement.dataset.bsTheme===mode,'変更を通知し、明暗は変えない');
      find('button').click();assert(document.body.dataset.uiTheme==='glass','明暗を変えてもデザインを保つ');
      assert(!OrchtopUI.setDesignTheme('unknown') && document.body.dataset.uiTheme==='glass','不正な値は反映しない');
      const select=document.createElement('select');select.setAttribute('data-ui-theme-select','');select.innerHTML=options;fixture.append(select);OrchtopUI.init(select);
      assert(select.value==='glass','追加した選択欄も現在のテーマに同期');
      OrchtopUI.setDesignTheme('soft');assert(many('select').every(item=>item.value==='soft'),'APIからの変更も同期');
    } finally { OrchtopUI.setDesignTheme(before);document.documentElement.dataset.bsTheme=mode; }
  });
  await test('デザインテーマの静的指定・標準への復帰・意味のある色', () => {
    const before=document.body.dataset.uiTheme;
    try {
      OrchtopUI.setDesignTheme('default');
      mount('<article class="ui-card"><div class="ui-card-body">カード</div></article><div class="alert alert-danger">エラー</div>');
      const card=find('.ui-card'),alert=find('.alert');
      const original=getComputedStyle(card).borderRadius;const color=getComputedStyle(alert).color;
      document.body.dataset.uiTheme='glass';
      assert(getComputedStyle(card).borderRadius!==original && getComputedStyle(card).backdropFilter!=='none','body属性の変更だけでガラス表示');
      for(const theme of ['glass','glassmorphism','flat','soft']) {
        OrchtopUI.setDesignTheme(theme);assert(getComputedStyle(alert).color===color,'意味のある通知色を維持');
      }
      OrchtopUI.setDesignTheme('flat');assert(getComputedStyle(card).boxShadow==='none','フラットでは影を抑える');
      OrchtopUI.setDesignTheme('default');assert(getComputedStyle(card).borderRadius===original,'標準へ戻すと元のデザイン');
    } finally { OrchtopUI.setDesignTheme(before); }
  });
  await test('テーマ切替を複数ボタンへ同期', () => {
    mount('<button data-ui-toggle="theme">1</button><button data-ui-toggle="theme">2</button>');
    const before=document.documentElement.dataset.bsTheme;find('button').click();
    assert(document.documentElement.dataset.bsTheme!==before,'テーマを切り替え');
    assert(many('button')[0].textContent===many('button')[1].textContent,'全ボタンのラベルを同期');
  });
  await test('select: 選択・フォーム値・通知・無効項目・Escape', () => {
    mount('<form><label for="pick">プラン</label><select id="pick" class="form-select" name="plan"><option value="free">無料</option><option disabled value="off">無効</option><option value="paid">有料</option></select></form>');
    const select=find('select'),button=find('.ui-select-trigger');let changes=0;select.addEventListener('change',()=>changes++);
    button.click();assert(find('.ui-select-menu').matches(':popover-open'),'独自の選択肢を開く');
    find('[data-index="1"]').click();assert(select.value==='free','無効項目は選択できない');
    button.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));
    button.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));
    assert(select.value==='paid' && changes===1,'無効項目を飛ばして確定・changeは1回');
    assert(new FormData(find('form')).get('plan')==='paid','元のnameで送信する');
    assert(button.textContent==='有料' && document.activeElement===button,'表示・フォーカスを同期');
    button.click();button.dispatchEvent(new KeyboardEvent('keydown',{key:'Home',bubbles:true,cancelable:true}));
    button.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
    assert(select.value==='paid' && button.getAttribute('aria-expanded')==='false','Escapeは値を変えず閉じる');
    OrchtopUI.init(fixture);assert(many('.ui-select-trigger').length===1,'再初期化しても重複しない');
  });
  await test('select: リセット・動的項目・ラベル・必須・disabled', async () => {
    mount('<form><label>種類<select class="form-select" name="kind" required><option value="">選択してください</option><optgroup label="候補"><option value="one">One</option></optgroup></select></label></form>');
    const select=find('select'),button=find('.ui-select-trigger');
    assert(button.getAttribute('aria-label')==='種類','ラベルに選択肢を混ぜない');
    assert(!select.checkValidity() && button.getAttribute('aria-invalid')==='true','必須の検証と表示');
    select.value='one';select.dispatchEvent(new Event('change',{bubbles:true}));
    assert(button.textContent==='One' && !button.hasAttribute('aria-invalid'),'外部changeとエラー解除');
    find('form').reset();await wait(10);assert(button.textContent==='選択してください','フォームリセットを表示に反映');
    const option=new Option('Two','two');select.append(option);select.disabled=true;await wait(0);
    assert(button.disabled,'disabledを動的に反映');
    select.disabled=false;await wait(0);button.click();
    assert(many('[role="option"]').some(item=>item.textContent==='Two'),'追加した選択肢を反映');
    select.focus();assert(document.activeElement===button,'既存のfocusを引き継ぐ');
    button.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true}));
    assert(!find('.ui-select-menu').matches(':popover-open'),'Tabで閉じる');
  });
  await test('テーマ選択ボタン: 同期・明暗独立・無効操作', () => {
    const design=document.body.dataset.uiTheme,mode=document.documentElement.dataset.bsTheme;
    try {
      mount('<button data-ui-design="glass">ガラス</button><button data-ui-design="flat">フラット</button><button data-ui-design="soft" disabled>無効</button><button data-ui-color-mode="light">明</button><button data-ui-color-mode="dark">暗</button><select class="form-select" data-ui-theme-select><option value="glass">ガラス</option><option value="flat">フラット</option></select>');
      find('[data-ui-design="glass"]').click();
      assert(document.body.dataset.uiTheme==='glass' && find('.ui-select-trigger').textContent==='ガラス','ボタンとselectを同期');
      assert(find('[data-ui-design="glass"]').getAttribute('aria-pressed')==='true','選択状態');
      find('[data-ui-color-mode="dark"]').click();assert(document.documentElement.dataset.bsTheme==='dark' && document.body.dataset.uiTheme==='glass','明暗だけ変更');
      find('[data-ui-design="soft"]').click();assert(document.body.dataset.uiTheme==='glass','無効ボタンは変更しない');
      OrchtopUI.setColorTheme('light');assert(find('[data-ui-color-mode="light"]').getAttribute('aria-pressed')==='true','APIから同期');
      assert(!OrchtopUI.setColorTheme('invalid'),'未知の明暗を拒否');
    } finally {OrchtopUI.setDesignTheme(design);OrchtopUI.setColorTheme(mode);}
  });
  await test('余白: 既存値の維持・組み合わせ・トークン・RTL', () => {
    mount('<div class="inset sp-px-2 sp-p-6" id="padding">余白</div><div class="px-3" id="legacy"></div><div class="gap-3" id="legacy-gap"></div><div class="sp-px-3 sp-gap-3" id="modern"></div><div dir="rtl" class="sp-ps-8 sp-pe-2" id="rtl"></div><div class="sp-m-auto sp-mx-4" id="margin"></div>');
    const box=getComputedStyle(find('#padding'));
    assert(box.paddingTop==='24px' && box.paddingLeft==='8px','クラス記述順に依存せず、全方向を左右で上書き');
    assert(getComputedStyle(find('#legacy')).paddingLeft==='16px' && getComputedStyle(find('#legacy-gap')).gap==='16px','既存の番号の意味を維持');
    assert(getComputedStyle(find('#modern')).paddingLeft==='12px' && getComputedStyle(find('#modern')).gap==='12px','新しい系列は統一スケール');
    assert(getComputedStyle(find('#rtl')).paddingRight==='32px' && getComputedStyle(find('#rtl')).paddingLeft==='8px','開始側・終了側はRTLに追従');
    assert(getComputedStyle(find('#margin')).marginLeft==='16px','autoと方向指定も全方向から軸方向の順に上書き');
    find('#padding').style.setProperty('--space-2','10px');assert(getComputedStyle(find('#padding')).paddingLeft==='10px','共有トークンから値を解決する');
  });
  await test('余白: flexグリッドの列幅・入れ子・レスポンシブ', () => {
    mount('<div class="fx-grid fx-grid-2 sp-gap-4 sp-gap-x-2 md:sp-gap-6 lg:sp-gap-x-8" id="space-grid"><div><div class="fx-grid fx-grid-2 fx-gap-1" id="inner-grid"><div>A</div><div>B</div></div></div><div>2</div><div>3</div><div>4</div></div>');
    const grid=find('#space-grid'),children=[...grid.children],style=getComputedStyle(grid);
    const expected=innerWidth>=1024?32:innerWidth>=768?24:8;
    assert(parseFloat(style.columnGap)===expected,'画面幅に応じた列間隔');
    const rects=children.map(item=>item.getBoundingClientRect());
    assert(Math.abs(rects[1].top-rects[0].top)<1 && rects[2].top>rects[0].top,'幅を差し引いて2列を維持');
    assert(Math.abs(rects[1].left-rects[0].right-expected)<1,'実際の列間隔も一致');
    const inner=find('#inner-grid'),items=[...inner.children].map(item=>item.getBoundingClientRect());
    assert(getComputedStyle(inner).columnGap==='4px' && Math.abs(items[0].top-items[1].top)<1,'入れ子の既存fx-gapを独立させる');
  });
  await test('入力選択パネル: 型・フォーム値・確定・キャンセル・二重初期化', () => {
    mount('<form><label>時刻<input type="time" class="form-control" name="time" value="09:00"></label><label>月<input type="month" class="form-control" name="month" value="2026-10"></label><label>週<input type="week" class="form-control" name="week" value="2026-W43"></label><label>日時<input type="datetime-local" class="form-control" name="datetime" value="2026-10-21T09:00"></label><label>色<input type="color" class="form-control" name="color" value="#2f6fc4"></label></form>');
    const root=find('input[name=time]').closest('.ui-input-picker'),button=root.querySelector('.ui-input-picker-trigger');let changed=0;find('input[name=time]').addEventListener('change',()=>changed++);
    button.click();root.querySelector('[data-ui-picker-part=hour]').value='15';root.querySelector('[data-ui-picker-apply]').click();
    assert(find('input[name=time]').value==='15:00' && changed===1,'元の値とchangeを確定時だけ更新');
    button.click();root.querySelector('[data-ui-picker-part=hour]').value='18';root.querySelector('.ui-input-popup').dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
    assert(find('input[name=time]').value==='15:00' && document.activeElement===button,'Escapeは値を保持しフォーカスを戻す');
    const data=new FormData(find('form'));assert(data.get('time')==='15:00' && [...data.keys()].length===5,'補助入力を送信データに混ぜない');
    OrchtopUI.init(fixture);assert(many('.ui-input-picker').length===5,'繰り返し初期化しても増えない');
  });
  await test('入力選択パネル: min/max・step・週数・リセット・disabled', async () => {
    mount('<form><label>月<input type="month" class="form-control" name="month" min="2026-04" max="2026-10" value="2026-06"></label><label>週<input type="week" class="form-control" name="week" value="2026-W53"></label><input aria-label="秒数" type="time" class="form-control" name="time" step="0.1" value="09:00:01.5"></form>');
    const root=find('input[name=month]').closest('.ui-input-picker');root.querySelector('button').click();root.querySelector('[data-ui-picker-part=month]').value='12';root.querySelector('[data-ui-picker-apply]').click();
    assert(find('input[name=month]').value==='2026-06' && !root.querySelector('.ui-picker-error').hidden,'範囲外の値を確定しない');
    root.querySelector('[data-ui-picker-part=month]').value='8';root.querySelector('[data-ui-picker-apply]').click();assert(find('input[name=month]').value==='2026-08','範囲内を確定');
    const week=find('input[name=week]').closest('.ui-input-picker');week.querySelector('button').click();assert(week.querySelector('[data-ui-picker-part=week]').options.length===53,'ISOの53週の年');
    const year=week.querySelector('[data-ui-picker-part=year]');year.value='2027';year.dispatchEvent(new Event('input',{bubbles:true}));assert(week.querySelector('[data-ui-picker-part=week]').options.length===52,'年変更で週数を調整');
    const time=find('input[name=time]').closest('.ui-input-picker');time.querySelector('button').click();time.querySelector('[data-ui-picker-apply]').click();assert(find('input[name=time]').value==='09:00:01.5','小数秒を維持');
    find('form').reset();await wait(10);assert(find('input[name=month]').value==='2026-06' && root.querySelector('button').textContent==='2026-06','リセットと表示同期');
    find('input[name=month]').disabled=true;await wait(0);assert(root.querySelector('button').disabled,'動的disabled');
  });
  await test('入力選択パネル: 色の検証とdatetimeのカレンダー', () => {
    mount('<form data-ui-validate><label>色<input type="color" class="form-control" name="color" value="#2f6fc4"></label><label>日時<input type="datetime-local" class="form-control" name="datetime" value="2026-10-21T09:00"></label></form>');
    const color=find('input[name=color]').closest('.ui-input-picker');color.querySelector('button').click();color.querySelector('[data-ui-picker-part=hex]').value='invalid';color.querySelector('[data-ui-picker-apply]').click();
    assert(find('input[name=color]').value==='#2f6fc4' && !color.querySelector('.ui-picker-error').hidden,'不正な色は確定しない');
    color.querySelector('[data-ui-picker-part=hex]').value='#aabbcc';color.querySelector('[data-ui-picker-apply]').click();assert(find('input[name=color]').value==='#aabbcc','任意のカラーコード');
    const root=find('input[name=datetime]').closest('.ui-input-picker');root.querySelector('button').click();root.querySelector('[data-ui-calendar-date="2026-10-22"]').click();root.querySelector('[data-ui-picker-part=minute]').value='30';root.querySelector('[data-ui-picker-apply]').click();
    assert(find('input[name=datetime]').value==='2026-10-22T09:30','カレンダーと時刻をまとめて確定');
  });
  await test('入力選択パネル: 下書きは標準フォーム検証に混ぜない', () => {
    mount('<form><label>対象月<input type="month" class="form-control" name="month" value="2026-10" required></label></form>');
    const root=find('.ui-input-picker');root.querySelector('button').click();root.querySelector('[data-ui-picker-part=year]').value='0';
    root.querySelector('.ui-input-popup').dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
    assert(find('form').checkValidity() && new FormData(find('form')).get('month')==='2026-10','未確定の不正な下書きでフォーム送信を妨げない');
  });
  await test('Checkbox・Radio: 一部選択・フォーム値・無効・リセット', async () => {
    mount('<form><label class="form-check"><input id="mixed-check" type="checkbox" class="form-check-input" data-ui-indeterminate name="notify" value="yes">通知</label><label><input type="checkbox" class="form-check-input" disabled name="disabled" checked>無効</label><input type="radio" class="form-check-input" name="plan" value="a" checked><input type="radio" class="form-check-input" name="plan" value="b"></form>');
    const mixed=find('#mixed-check');assert(mixed.indeterminate && !mixed.checked,'一部選択で初期化');
    mixed.click();assert(!mixed.indeterminate && mixed.checked && new FormData(find('form')).get('notify')==='yes','クリックで通常選択になり値を送信');
    OrchtopUI.init(fixture);assert(!mixed.indeterminate,'再初期化で操作状態を戻さない');
    const radio=many('input[type=radio]');radio[1].click();assert(!radio[0].checked && radio[1].checked && new FormData(find('form')).get('plan')==='b','同じnameのラジオは排他選択');
    assert(!new FormData(find('form')).has('disabled'),'disabledは送信しない');
    find('form').reset();await wait(10);assert(mixed.indeterminate && !mixed.checked && radio[0].checked,'リセットで初期状態に戻る');
    mixed.click();find('form').addEventListener('reset',event=>event.preventDefault(),{once:true});find('form').reset();await wait(10);assert(mixed.checked && !mixed.indeterminate,'キャンセルしたresetでは状態を変えない');
  });
  await test('表示モード: system選択・同期・イベント・明暗と質感の独立', () => {
    const before=document.documentElement.dataset.uiColorPreference || 'system';
    try {
      mount('<div class="ui-color-switcher"><button data-ui-color-mode="light">明</button><button data-ui-color-mode="dark">暗</button><button data-ui-color-mode="system">OS</button></div><button data-ui-color-mode="system">OS別</button><select class="form-select" data-ui-color-select><option value="light">ライト</option><option value="dark">ダーク</option><option value="system">システム</option></select>');
      OrchtopUI.setColorTheme('light');let changes=0,detail=null;
      const listen=event=>{changes++;detail=event.detail;};document.addEventListener('ui:colorchange',listen);
      try {
        const design=document.body.dataset.uiTheme;find('[data-ui-color-mode=system]').click();
        assert(document.documentElement.dataset.uiColorPreference==='system' && document.documentElement.dataset.bsTheme===(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'),'選択と実際の明暗を別に管理');
        assert(many('[data-ui-color-mode=system]').every(button=>button.getAttribute('aria-pressed')==='true') && find('select').value==='system' && find('.ui-select-trigger').textContent==='システム','全形式を同期');
        assert(detail.mode==='system' && changes===1 && document.body.dataset.uiTheme===design,'変更を通知し、質感は維持');
        OrchtopUI.setColorTheme('system');assert(changes===1,'同じ状態では重複通知しない');
        find('select').value='dark';find('select').dispatchEvent(new Event('change',{bubbles:true}));
        assert(document.documentElement.dataset.uiColorPreference==='dark' && find('[data-ui-color-mode=dark]').getAttribute('aria-pressed')==='true','selectからも同期');
      } finally {document.removeEventListener('ui:colorchange',listen);}
    } finally {OrchtopUI.setColorTheme(before);}
  });
  await test('カレンダーの日付モーダル: 同日・空の予定・安全な表示・フォーム・フォーカス', async () => {
    mount('<form><div id="modal-calendar" data-ui-calendar data-ui-calendar-modal data-ui-month="2026-10" data-ui-value="2026-10-21" data-ui-name="day"><ul data-ui-calendar-events><li data-ui-date="2026-10-21" data-ui-variant="success">10:00 レビュー</li><li data-ui-date="2026-10-21">&lt;img src=x&gt;</li></ul></div></form><div id="plain-calendar" data-ui-calendar data-ui-month="2026-10"></div>');
    const root=find('#modal-calendar');let detail;root.addEventListener('ui:dayopen',event=>{detail=event.detail;});
    assert(!root.querySelector('dialog'),'初期選択では開かず遅延生成');
    root.querySelector('[data-ui-calendar-action=next]').click();assert(!root.querySelector('dialog'),'月移動でも開かない');root.querySelector('[data-ui-calendar-action=prev]').click();
    root.querySelector('[data-ui-calendar-date="2026-10-21"]').click();const dialog=root.querySelector('dialog');
    assert(dialog.open && dialog.dataset.uiCalendarModalValue==='2026-10-21' && dialog.querySelector('h2').textContent.includes('10月21日'),'既に選択済みの日も開く');
    assert(dialog.querySelectorAll('.ui-calendar-agenda-event').length===2 && !dialog.querySelector('img') && dialog.textContent.includes('<img src=x>'),'予定はテキストで安全に表示');
    assert(detail.value==='2026-10-21' && detail.dialog===dialog && detail.events.length===2,'選択日・モーダル・予定を通知');
    assert(root.querySelector('.ui-calendar-agenda').hidden,'下部の予定欄を置き換える');
    dialog.querySelector('[data-ui-dismiss]').click();await wait(20);
    assert(!dialog.open && document.activeElement===root.querySelector('[data-ui-calendar-date="2026-10-21"]'),'再描画した日付ボタンにフォーカスが戻る');
    OrchtopUI.init(root);root.querySelector('[data-ui-calendar-date="2026-10-22"]').click();
    assert(root.querySelectorAll('dialog').length===1 && dialog.open && dialog.querySelector('.ui-calendar-empty') && !dialog.querySelector('.ui-calendar-agenda-list'),'別日で内容を更新し予定なしを表示');
    assert(new FormData(find('form')).get('day')==='2026-10-22','フォーム値も維持');
    dialog.querySelector('[data-ui-dismiss]').click();await wait(0);
    find('#plain-calendar [data-ui-calendar-date="2026-10-21"]').click();assert(!find('#plain-calendar dialog') && !find('#plain-calendar .ui-calendar-agenda').hidden,'オプションなしの既存表示を維持');
  });
  await test('カレンダーの日付モーダル: 既存dialog・無効日・false・不正な参照', async () => {
    mount('<div id="custom-calendar" data-ui-calendar data-ui-calendar-modal="#day-details" data-ui-month="2026-10" data-ui-min="2026-10-20" data-ui-max="2026-10-23"><ul data-ui-calendar-events><li data-ui-date="2026-10-21">会議</li></ul></div><dialog id="day-details" class="ui-dialog" aria-labelledby="day-title"><h2 id="day-title" data-ui-calendar-modal-title></h2><div data-ui-calendar-modal-events></div><p id="day-note">独自の説明</p><button data-ui-dismiss="dialog">閉じる</button></dialog>');
    const root=find('#custom-calendar'),dialog=find('#day-details');
    root.querySelector('[data-ui-calendar-date="2026-10-19"]').click();assert(!dialog.open,'範囲外の日付は開かない');
    root.querySelector('[data-ui-calendar-date="2026-10-21"]').click();assert(dialog.open && dialog.querySelector('.ui-calendar-agenda-event').textContent==='会議' && find('#day-note').textContent==='独自の説明','指定したdialogの対象領域だけ更新');
    dialog.querySelector('button').click();await wait(0);
    root.dataset.uiCalendarModal='false';root.querySelector('[data-ui-calendar-date="2026-10-22"]').click();assert(!dialog.open && !root.querySelector('.ui-calendar-agenda').hidden,'falseで従来表示');
    root.dataset.uiCalendarModal='#missing-dialog';root.querySelector('[data-ui-calendar-date="2026-10-21"]').click();assert(!dialog.open && !root.querySelector('.ui-calendar-agenda').hidden && root.querySelector('[role=status]').textContent.includes('見つかりません'),'参照不備でも予定を確認できる');
  });
  await test('カレンダーの月・日付切り替えは動かさず、状態・フォーカス・通知を維持', () => {
    mount('<div data-ui-calendar data-ui-month="2026-10" data-ui-value="2026-10-21"></div>'+dateField('still-date','value="2026-10-21"'));
    const root=find('[data-ui-calendar]');let months=0,dates=0;
    root.addEventListener('ui:monthchange',()=>months++);root.addEventListener('ui:datechange',()=>dates++);
    root.querySelector('[data-ui-calendar-action=next]').click();
    assert(root.dataset.uiMonth==='2026-11' && months===1,'月とイベントを即時更新');
    assert(!root.getAnimations({subtree:true}).length,'月切り替えで移動・フェードしない');
    root.querySelector('[data-ui-calendar-date="2026-11-10"]').click();
    assert(root.dataset.uiValue==='2026-11-10' && dates===1 && document.activeElement.dataset.uiCalendarDate==='2026-11-10','選択とフォーカスを維持');
    assert(!root.getAnimations({subtree:true}).length,'選択日に拡縮を付けない');
    document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'PageDown',bubbles:true,cancelable:true}));
    assert(root.dataset.uiMonth==='2026-12' && !root.getAnimations({subtree:true}).length,'キーボードの月切り替えも即時');
    find('[data-ui-datepicker-action=toggle]').click();
    const calendar=find('.ui-datepicker-popup [data-ui-calendar]');
    calendar.querySelector('[data-ui-calendar-action=next]').click();
    assert(calendar.dataset.uiMonth==='2026-11' && !calendar.getAnimations({subtree:true}).length,'フォーム用も同じ表示方式');
    calendar.querySelector('[data-ui-calendar-date="2026-11-11"]').click();
    assert(find('#still-date').value==='2026-11-11' && document.activeElement===find('#still-date'),'フォームへの反映とフォーカス復帰を維持');
  });
  document.title = failures.length ? 'FAIL — UI tests' : 'PASS — UI tests';
  return {passed, failures};
})();
