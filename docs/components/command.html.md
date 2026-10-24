<!-- Generated from docs/components/command.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](command.html) · [llms.txt](../llms.txt)

# Command menu

検索からページや操作を選ぶメニュー。インライン・ダイアログ・キーボード選択・グループ・空結果に対応します。

<a id="command-inline"></a>

## 検索して操作を選ぶ

`data-ui-command`に検索欄と操作一覧を配置します。ラベルと`data-ui-keywords`を部分一致で検索でき、全角英数字にも対応します。

```html
<div class="ui-command" id="command-inline-demo" data-ui-command aria-label="操作を検索">
  <div class="ui-command-search"><span icon="mdi-magnify" aria-hidden="true"></span><input class="ui-command-input" data-ui-command-input type="search" aria-label="操作を検索" placeholder="名前やキーワードを入力" autocomplete="off"></div>
  <div class="ui-command-list" data-ui-command-list>
    <div class="ui-command-group" data-ui-command-group="ページ">
      <h3 class="ui-command-group-title" aria-hidden="true">ページ</h3>
      <button type="button" class="ui-command-item" data-ui-command-item data-ui-value="projects" data-ui-keywords="プロジェクト project 一覧"><span icon="mdi-folder-outline" aria-hidden="true"></span>プロジェクト一覧</button>
      <button type="button" class="ui-command-item" data-ui-command-item data-ui-value="settings" data-ui-keywords="設定 settings"><span icon="mdi-cog-outline" aria-hidden="true"></span>表示設定</button>
    </div>
    <div class="ui-command-group" data-ui-command-group="操作">
      <h3 class="ui-command-group-title" aria-hidden="true">操作</h3>
      <button type="button" class="ui-command-item" data-ui-command-item data-ui-value="save" data-ui-keywords="保存 save" data-ui-toast="保存しました" data-ui-variant="success"><span icon="mdi-check" aria-hidden="true"></span>変更を保存</button>
      <button type="button" class="ui-command-item" data-ui-command-item data-ui-value="admin" disabled>管理者専用の操作</button>
    </div>
  </div>
  <p class="ui-command-empty" data-ui-command-empty hidden>一致する操作がありません。別の言葉で検索してください。</p>
  <div class="ui-command-footer"><span data-ui-command-status role="status"></span><span>↑↓ 選択・Enter 実行</span></div>
</div>
<p class="type-caption sp-mt-3" data-demo-command-result role="status">操作を選ぶと、ここに結果を表示します。</p>
```

<a id="command-dialog"></a>

## ダイアログとショートカット

通常のダイアログ属性と組み合わせます。`data-ui-command-shortcut="k"`を付けた場合だけ、Ctrl／⌘＋Kで開閉できます。外側の入力欄で編集中はショートカットを奪いません。

```html
<button type="button" class="btn btn-soft-primary" data-ui-toggle="dialog" data-ui-target="#command-dialog-demo">操作を検索 <kbd>Ctrl / ⌘ K</kbd></button>
<dialog class="ui-command ui-dialog" id="command-dialog-demo" data-ui-command data-ui-dialog data-ui-command-shortcut="k" aria-label="操作を検索">
  <div class="ui-command-search"><span icon="mdi-magnify" aria-hidden="true"></span><input class="ui-command-input" data-ui-command-input type="search" aria-label="操作を検索" placeholder="名前やキーワードを入力" autocomplete="off"></div>
  <div class="ui-command-list" data-ui-command-list>
    <div class="ui-command-group" data-ui-command-group="ページ">
      <h3 class="ui-command-group-title" aria-hidden="true">ページ</h3>
      <button type="button" class="ui-command-item" data-ui-command-item data-ui-value="projects" data-ui-keywords="プロジェクト project 一覧"><span icon="mdi-folder-outline" aria-hidden="true"></span>プロジェクト一覧</button>
      <button type="button" class="ui-command-item" data-ui-command-item data-ui-value="settings" data-ui-keywords="設定 settings"><span icon="mdi-cog-outline" aria-hidden="true"></span>表示設定</button>
    </div>
    <div class="ui-command-group" data-ui-command-group="操作">
      <h3 class="ui-command-group-title" aria-hidden="true">操作</h3>
      <button type="button" class="ui-command-item" data-ui-command-item data-ui-value="save" data-ui-keywords="保存 save" data-ui-toast="保存しました" data-ui-variant="success"><span icon="mdi-check" aria-hidden="true"></span>変更を保存</button>
      <button type="button" class="ui-command-item" data-ui-command-item data-ui-value="admin" disabled>管理者専用の操作</button>
    </div>
  </div>
  <p class="ui-command-empty" data-ui-command-empty hidden>一致する操作がありません。別の言葉で検索してください。</p>
  <div class="ui-command-footer"><span data-ui-command-status role="status"></span><span>↑↓ 選択・Enter 実行</span><button type="button" class="btn btn-sm btn-outline-secondary" data-ui-dismiss="dialog">閉じる</button></div>
</dialog>
<p class="type-caption sp-mt-3" data-demo-command-result role="status">操作を選ぶと、ここに結果を表示します。</p>
```

<a id="command-keyboard"></a>

## キーボード・無効項目・空結果

- ↑↓で操作を選び、Enterで実行します。IMEでの変換確定では実行しません。
- 無効な操作は`disabled`または`aria-disabled="true"`で指定します。
- 一致する項目がないときは`data-ui-command-empty`を表示します。
- Escapeでダイアログを閉じて元の操作へ戻ります。インラインでは検索語を消します。

<a id="command-events"></a>

## 選択イベントと動的な更新

操作の実行処理はアプリ側で接続します。選択時には`ui:commandselect`が発火し、`detail.value`と`detail.item`を取得できます。ボタンの通常のclickや、既存のトースト属性も利用できます。

```
const command = document.querySelector('[data-ui-command]');
command.addEventListener('ui:commandselect', event => {
  console.log(event.detail.value);
});

// 操作項目を追加した後
KavUI.init(command);
// DOM全体を作り直す前
KavUI.destroy(command);
```

機能の参考：[shadcn/ui Command](https://ui.shadcn.com/docs/components/base/command)。表示と実装はKav-UI独自で、外部ライブラリは読み込みません。

使用ファイル・取り込み方

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../../assets/css/ui.css) / [ui.js](../../assets/js/ui.js)。Vue・Astroでは既存の`KavWidget`に同じHTMLを渡して利用できます。[パッケージの使い方](../../packages/README.md)も参照してください。
