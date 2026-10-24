<!-- Generated from docs/components/dropdown.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](dropdown.html) · [llms.txt](../../llms.txt)

# Dropdown

操作メニュー・上下配置・キーボード・選択イベント。既存の色・角丸・余白・テーマを引き継ぎます。

<a id="dropdown-basic"></a>

## 操作メニュー

ボタンの`data-ui-toggle="dropdown"`と`data-ui-target`を指定します。メニューには`data-ui-dropdown popover`を付けます。項目を選ぶと閉じます。

```html
<button type="button" class="btn btn-outline-secondary" data-ui-toggle="dropdown" data-ui-target="#dropdown-basic-menu">操作メニュー</button>
<div id="dropdown-basic-menu" class="ui-dropdown-menu" data-ui-dropdown popover>
  <div class="ui-dropdown-heading">プロジェクトの操作</div>
  <button type="button" class="ui-dropdown-item" data-ui-value="edit" data-ui-toast="編集を選びました"><span icon="mdi-pencil" aria-hidden="true"></span>編集</button>
  <button type="button" class="ui-dropdown-item" disabled>共有（権限なし）</button>
  <a class="ui-dropdown-item" href="clipboard.html"><span icon="mdi-content-copy" aria-hidden="true"></span>コピーの使い方</a>
  <hr class="ui-dropdown-divider" role="separator">
  <button type="button" class="ui-dropdown-item ui-dropdown-item-danger" data-ui-value="archive" data-ui-toast="アーカイブを選びました"><span icon="mdi-folder" aria-hidden="true"></span>アーカイブ</button>
</div>
```

<a id="dropdown-position"></a>

## 上向き・右揃え

`data-ui-placement`でbottom-start・bottom-end・top-start・top-endを指定できます。画面端では位置を補正し、必要なら上下を入れ替えます。

```html
<div class="ui-cluster"><button type="button" class="btn btn-outline-secondary" data-ui-toggle="dropdown" data-ui-target="#dropdown-up" data-ui-placement="top-start">上に開く</button><button type="button" class="btn btn-outline-secondary" data-ui-toggle="dropdown" data-ui-target="#dropdown-end" data-ui-placement="bottom-end">末尾に揃える</button></div>
<div id="dropdown-up" class="ui-dropdown-menu" data-ui-dropdown popover>
  <div class="ui-dropdown-heading">プロジェクトの操作</div>
  <button type="button" class="ui-dropdown-item" data-ui-value="edit" data-ui-toast="編集を選びました"><span icon="mdi-pencil" aria-hidden="true"></span>編集</button>
  <button type="button" class="ui-dropdown-item" disabled>共有（権限なし）</button>
  <a class="ui-dropdown-item" href="clipboard.html"><span icon="mdi-content-copy" aria-hidden="true"></span>コピーの使い方</a>
  <hr class="ui-dropdown-divider" role="separator">
  <button type="button" class="ui-dropdown-item ui-dropdown-item-danger" data-ui-value="archive" data-ui-toast="アーカイブを選びました"><span icon="mdi-folder" aria-hidden="true"></span>アーカイブ</button>
</div>
<div id="dropdown-end" class="ui-dropdown-menu" data-ui-dropdown popover>
  <div class="ui-dropdown-heading">プロジェクトの操作</div>
  <button type="button" class="ui-dropdown-item" data-ui-value="edit" data-ui-toast="編集を選びました"><span icon="mdi-pencil" aria-hidden="true"></span>編集</button>
  <button type="button" class="ui-dropdown-item" disabled>共有（権限なし）</button>
  <a class="ui-dropdown-item" href="clipboard.html"><span icon="mdi-content-copy" aria-hidden="true"></span>コピーの使い方</a>
  <hr class="ui-dropdown-divider" role="separator">
  <button type="button" class="ui-dropdown-item ui-dropdown-item-danger" data-ui-value="archive" data-ui-toast="アーカイブを選びました"><span icon="mdi-folder" aria-hidden="true"></span>アーカイブ</button>
</div>
```

<a id="dropdown-keyboard"></a>

## キーボードと無効状態

Enter・Space・↓で開き、↑で最後の項目から開きます。メニュー内の↑↓、Home・Endで移動し、Escapeで閉じて元のボタンへ戻ります。Tabはメニューを閉じて次の操作へ移動します。ボタンのdisabled、項目のdisabled／aria-disabledに対応します。フォームなど自由な内容にはPopoverを使用してください。

```html
<button type="button" class="btn btn-outline-secondary" data-ui-toggle="dropdown" data-ui-target="#dropdown-basic-menu" disabled>操作できません</button>
```

<a id="dropdown-api"></a>

## イベント・動的配置

`ui:menuselect`で選択した項目と値を取得します。値は`data-ui-value`、省略時は項目の文字列です。追加したHTMLはKavUI.initで初期化します。

```
const menu = document.getElementById('dropdown-basic-menu');
menu.addEventListener('ui:menuselect', event => {
  console.log(event.detail.value, event.detail.item);
});
// 必要な場合はAPIでも操作できます。
KavUI.show(menu, document.querySelector('[data-ui-target="#dropdown-basic-menu"]'));
KavUI.hide(menu);
```

使用ファイル・取り込み方

共通の ui.css と ui.js を読み込み、サンプルのHTMLを配置します。必要な動作は data-ui-* 属性で指定します。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../../assets/css/ui.css) / [ui.js](../../assets/js/ui.js) / [属性一覧と導入例](../getting-started.html.md)

assetsフォルダごとコピーするとCSS内の相対参照も維持できます。catalog.js、catalog-navigation.js、catalog-demo.js、layout.css はカタログ専用です。data-demo-* はアプリに取り込む際に外し、保存や通信はアプリ側で実装してください。
