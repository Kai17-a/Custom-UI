<!-- Generated from docs/components/forms.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](forms.html) · [llms.txt](../llms.txt)

# Forms

入力・選択・バリデーション。下の「HTMLを表示」からマークアップをコピーできます。

[フォーム用の日付入力・Date pickerはこちら →](datepicker.html.md)

## Form controls

```html
<div class="row sp-gap-4 fx-items-start">
    <input type="search" class="form-control form-control-sm" aria-label="タスクを検索" placeholder="search ( / )" style="max-width:18rem;">
    <select class="form-select form-select-sm w-auto" aria-label="tool">
      <option>Claude</option><option>Codex</option><option>Cline</option>
    </select>
    <label class="form-check"><input type="checkbox" class="form-check-input" checked><span class="form-check-label">follow</span></label>
    <label class="form-check"><input type="checkbox" class="form-check-input"><span class="form-check-label">failed only</span></label>
  </div>
  <div class="row">
    <textarea class="form-control" rows="2" aria-label="メッセージ" placeholder="メッセージを入力（表示サンプル）" style="max-width:32rem;"></textarea>
  </div>
```

<a id="select-box"></a>

## テーマに合わせたselect

`select.form-select` の単一選択を、現在のテーマに合わせた選択メニューで表示します。

- 矢印キーで移動し、Enterで確定します。
- Escapeでキャンセルします。
- 文字を入力すると、一致する項目を探せます。

```html
<form class="stack">
  <div class="field"><label for="select-project">プロジェクト</label><select id="select-project" class="form-select" name="project" required><option value="">選択してください</option><optgroup label="進行中"><option value="catalog">デザインカタログ</option><option value="app">自作アプリ</option></optgroup><optgroup label="アーカイブ"><option value="old" disabled>旧プロジェクト（選択不可）</option></optgroup></select></div>
  <div class="field"><label for="select-disabled">変更不可</label><select id="select-disabled" class="form-select" disabled><option>現在は選択できません</option></select></div>
  <button type="reset" class="btn btn-sm btn-outline-secondary">選択をリセット</button>
</form>
```

既存の `name`・`required`・`disabled`・`optgroup` とフォーム送信を利用できます。

値をJavaScriptで変えた場合は `change` イベントを発行するか `KavUI.init(select)` で表示を同期してください。

複数選択・リスト表示（multiple / size）はHTML標準の表示を維持します。JavaScriptやPopover APIが利用できない場合も標準selectを使えます。

## 入力状態とバリデーション

`field`では、ラベルと入力欄の間隔を6pxに揃え、補足文との間隔も同じ6pxにします。ラベル内に入力欄を置く場合も、別要素にする場合も同じです。

```html
<form data-ui-validate data-demo-form novalidate>
<div class="field" data-ui-field><label>プロジェクト名（必須）<input name="project" class="form-control form-control-sm" required maxlength="80" pattern=".*\S.*" data-ui-message="プロジェクト名を1〜80文字で入力してください。" placeholder="例：My app"></label><small>80文字以内で入力してください。</small><small class="ui-invalid-feedback" data-ui-error hidden></small></div>
<div class="field"><label>プロジェクトID（読み取り専用）<input class="form-control form-control-sm" value="project_001" readonly></label></div>
<div class="field"><label>プラン<input class="form-control form-control-sm" value="Free" disabled></label><small>このデモではプランを変更できません。</small></div>
<fieldset class="choice-list"><legend>公開範囲</legend><label class="form-check"><input type="radio" class="form-check-input" name="visibility" value="private" checked> 非公開</label><label class="form-check"><input type="radio" class="form-check-input" name="visibility" value="public"> 公開</label></fieldset>
<p><label class="switch"><input type="checkbox" role="switch" checked> メール通知</label></p>
<button type="submit" class="btn btn-sm btn-primary">検証する（デモ）</button><p data-demo-result role="status"></p></form>
```

## 日付を設定する

```html
<div class="field" data-ui-field>
  <label for="form-datepicker">実施日</label>
  <div class="ui-datepicker" data-ui-datepicker >
    <input class="form-control form-control-sm" type="date" id="form-datepicker" name="form-datepicker" >
  </div>
  <small class="ui-invalid-feedback" data-ui-error hidden></small>
</div>
```

<a id="checkbox-radio"></a>

## Checkbox・Radio

`form-check-input` を指定すると、チェックマーク・選択点・枠線・フォーカスを共通デザインにできます。ラベルもクリックでき、Spaceや矢印キー、required、フォーム送信は標準のinputと同じように使えます。

```html
<form class="stack sp-gap-4" id="checks-demo">
  <fieldset class="choice-list"><legend>Checkbox：複数選択</legend>
    <label class="form-check"><input class="form-check-input" id="check-notice" type="checkbox" name="notice" value="email" checked><span class="form-check-label">メール通知</span></label>
    <label class="form-check"><input class="form-check-input" id="check-report" type="checkbox" name="notice" value="report"><span class="form-check-label">週次レポート</span></label>
    <label class="form-check"><input class="form-check-input" id="check-mixed" type="checkbox" data-ui-indeterminate><span class="form-check-label">一部選択</span></label>
    <label class="form-check"><input class="form-check-input" type="checkbox" disabled><span class="form-check-label">無効</span></label>
    <label class="form-check"><input class="form-check-input" type="checkbox" checked disabled><span class="form-check-label">選択済み・無効</span></label>
  </fieldset>
  <fieldset class="choice-list"><legend>Radio：1つ選択</legend>
    <label class="form-check"><input class="form-check-input" id="radio-personal" type="radio" name="checks-plan" value="personal" checked><span class="form-check-label">個人用</span></label>
    <label class="form-check"><input class="form-check-input" id="radio-team" type="radio" name="checks-plan" value="team"><span class="form-check-label">チーム用</span></label>
    <label class="form-check"><input class="form-check-input" type="radio" name="checks-plan" value="disabled" disabled><span class="form-check-label">無効</span></label>
  </fieldset>
  <button class="btn btn-sm btn-outline-secondary" type="reset">初期状態に戻す</button>
</form>
```

一部選択の初期表示は `data-ui-indeterminate` で指定します。この初期化にはui.jsが必要です。実行中の変更は `input.indeterminate = true` で行えます。一部選択の見た目とcheckedの値は独立しており、送信の有無はcheckedで決まります。

## Checkbox・Radioのサイズと色

```html
<div class="stack sp-gap-3">
  <div class="cluster sp-gap-4">
    <label class="form-check"><input class="form-check-input form-check-input-sm" type="checkbox" checked><span class="form-check-label">小</span></label>
    <label class="form-check"><input class="form-check-input" type="checkbox" checked><span class="form-check-label">標準</span></label>
    <label class="form-check"><input class="form-check-input form-check-input-lg" type="checkbox" checked><span class="form-check-label">大</span></label>
  </div>
  <div class="cluster sp-gap-4">
    <label class="form-check form-check-success"><input class="form-check-input" type="checkbox" checked><span class="form-check-label">成功色</span></label>
    <label class="form-check form-check-danger"><input class="form-check-input" type="checkbox" checked><span class="form-check-label">注意色</span></label>
    <label class="form-check form-check-success"><input class="form-check-input form-check-input-lg" type="radio" name="radio-color" value="success" checked><span class="form-check-label">成功色・大</span></label>
    <label class="form-check form-check-danger"><input class="form-check-input form-check-input-lg" type="radio" name="radio-color" value="danger"><span class="form-check-label">注意色・大</span></label>
  </div>
</div>
```

基本の見た目はui.cssだけで動作します。ライト・ダークと各デザインテーマに対応し、キーボードでのフォーカスを枠で示します。

<a id="file-drop"></a>

## ファイルのドラッグ＆ドロップ

通常のファイル入力を`data-ui-file-drop`で囲みます。枠へのドロップ、クリック、Tabで移動してEnterまたはSpaceで選択できます。選択したファイルは一覧から個別に削除できます。

```html
<form class="stack sp-gap-4" data-ui-validate data-demo-form>
  <div class="ui-file-drop" data-ui-file-drop data-ui-max-size="5242880" data-ui-max-files="5">
    <input type="file" class="form-control" id="drop-documents" name="documents" accept=".pdf,.txt,image/*" multiple aria-describedby="drop-documents-help">
    <label class="ui-file-dropzone" data-ui-file-zone for="drop-documents">
      <span icon="mdi-upload" aria-hidden="true"></span>
      <strong>ファイルをドラッグ＆ドロップ</strong>
      <span>またはクリックして選択</span>
      <span class="ui-file-hint" id="drop-documents-help">PDF・TXT・画像 / 1件5MBまで / 最大5件</span>
    </label>
  </div>
  <div class="buttons fx fx-wrap sp-gap-2"><button class="btn btn-primary" type="submit">入力を確認</button><button class="btn btn-outline-secondary" type="reset">選択をリセット</button></div>
  <p data-demo-result role="status"></p>
</form>
```

新しい選択は一覧を置き換えます。形式・サイズ・件数に合わない選択はまとめて受け付けず、直前の選択を維持して理由を表示します。フォルダーの選択には対応していません。

<a id="file-drop-single"></a>

## ファイル1件・必須・無効状態

```html
<form class="stack sp-gap-4" data-ui-validate data-demo-form>
  <div class="field" data-ui-field>
    <div class="ui-file-drop" data-ui-file-drop>
      <input type="file" class="form-control" id="drop-single" name="attachment" accept=".pdf" required>
      <label class="ui-file-dropzone" data-ui-file-zone for="drop-single"><span icon="mdi-file-document" aria-hidden="true"></span><strong>PDFを1件選択（必須）</strong><span class="ui-file-hint">ドロップまたはクリックで選択</span></label>
    </div>
    <small class="ui-invalid-feedback" data-ui-error hidden></small>
  </div>
  <button class="btn btn-primary" type="submit">入力を確認</button><p data-demo-result role="status"></p>
</form>
<div class="ui-file-drop" data-ui-file-drop>
  <input type="file" class="form-control" id="drop-disabled" name="disabled-attachment" disabled>
  <label class="ui-file-dropzone" data-ui-file-zone for="drop-disabled"><span icon="mdi-lock" aria-hidden="true"></span><strong>ファイルを選択できません</strong><span class="ui-file-hint">disabledによる無効状態</span></label>
</div>
```

<a id="file-drop-options"></a>

## ファイル入力の指定・イベント

`ui.css`と`ui.js`を読み込みます。`data-ui-file-zone`はinputに対応するlabelに付け、forとidを一致させます。inputはラッパーの直下に配置してください。JavaScriptが使えない場合は通常のファイル入力が表示されます。

- `multiple`：複数選択。省略すると1件のみ。
- `accept`：拡張子、MIMEタイプ、`image/*`など。クリック選択とドロップの両方に適用。
- `data-ui-max-size`：ファイル1件の最大バイト数。省略すると制限なし。
- `data-ui-max-files`：1回に選択できる最大件数。省略するとmultipleの指定に従う。
- `required`・`disabled`・`name`：通常のinputと同じ意味。

ファイルの種類は拡張子またはブラウザが提供するMIMEタイプで判定します。MIMEタイプが空のファイルも選択したい場合は、acceptに拡張子を指定してください。実際の送信とサーバーでの検証はアプリ側で実装します。

```
const form = document.querySelector('form');
const input = document.getElementById('drop-documents');
const files = input.files; // 通常のFileList
const data = new FormData(form); // nameでファイルを取得可能

input.addEventListener('change', () => {
  console.log([...input.files].map(file => file.name));
});

const drop = document.querySelector('[data-ui-file-drop]');
drop.addEventListener('ui:filechange', event => {
  console.log(event.detail.files); // Fileの配列
});
drop.addEventListener('ui:filereject', event => {
  console.log(event.detail.message);
});
```

ドロップ・個別削除ではinputの`input`と`change`も発火します。フォームのリセットで一覧とエラーも戻ります。動的に配置した場合は`KavUI.init(element)`で初期化してください。

<a id="input-types"></a>

## input type 全種類

各 `input type` を共通UIのクラス・コンポーネントでそろえた見本です。`required`・`min`・`max`・`pattern`・`placeholder` などのHTML標準属性がそのまま機能します。

```html
<form class="stack" data-ui-validate data-demo-form novalidate><div class="field" data-ui-field><label>テキスト (text)<input type="text" class="form-control form-control-sm" name="text" placeholder="任意のテキスト"></label><small class="ui-invalid-feedback" data-ui-error hidden></small></div><div class="field" data-ui-field><label>パスワード (password)<input type="password" class="form-control form-control-sm" name="password" placeholder="••••••••"></label><small class="ui-invalid-feedback" data-ui-error hidden></small></div><div class="field" data-ui-field><label>メールアドレス (email)<input type="email" class="form-control form-control-sm" name="email" placeholder="user@example.com" required></label><small class="ui-invalid-feedback" data-ui-error hidden></small></div><div class="field" data-ui-field><label>電話番号 (tel)<input type="tel" class="form-control form-control-sm" name="tel" placeholder="090-1234-5678"></label><small class="ui-invalid-feedback" data-ui-error hidden></small></div><div class="field" data-ui-field><label>URL (url)<input type="url" class="form-control form-control-sm" name="url" placeholder="https://example.com"></label><small class="ui-invalid-feedback" data-ui-error hidden></small></div><div class="field" data-ui-field><label>検索 (search)<input type="search" class="form-control form-control-sm" name="search" placeholder="検索キーワード"></label><small class="ui-invalid-feedback" data-ui-error hidden></small></div><div class="field" data-ui-field><label>数値 (number)<input type="number" class="form-control form-control-sm" name="number" min="1" max="100" value="10"></label><small class="ui-invalid-feedback" data-ui-error hidden></small></div><div class="field" data-ui-field><label for="all-types-date">日付 (date)</label><div class="ui-datepicker" data-ui-datepicker><input type="date" class="form-control form-control-sm" id="all-types-date" name="date"></div><small class="ui-invalid-feedback" data-ui-error hidden></small></div><div class="field" data-ui-field><label>時刻 (time)<input type="time" class="form-control form-control-sm" name="time"></label><small class="ui-invalid-feedback" data-ui-error hidden></small></div><div class="field" data-ui-field><label>日時 (datetime-local)<input type="datetime-local" class="form-control form-control-sm" name="datetime-local"></label><small class="ui-invalid-feedback" data-ui-error hidden></small></div><div class="field" data-ui-field><label>月 (month)<input type="month" class="form-control form-control-sm" name="month"></label><small class="ui-invalid-feedback" data-ui-error hidden></small></div><div class="field" data-ui-field><label>週 (week)<input type="week" class="form-control form-control-sm" name="week"></label><small class="ui-invalid-feedback" data-ui-error hidden></small></div><div class="field" data-ui-field><label>色 (color)<input type="color" class="form-control" name="color" value="#007bff"></label><small class="ui-invalid-feedback" data-ui-error hidden></small></div><div class="field" data-ui-field><label>スライダー (range)<input type="range" class="form-range" name="range" min="0" max="100" value="50"></label><small class="ui-invalid-feedback" data-ui-error hidden></small></div><div class="field" data-ui-field><label>ファイル (file)<input type="file" class="form-control form-control-sm" name="file"></label><small class="ui-invalid-feedback" data-ui-error hidden></small></div><div class="field" data-ui-field><label class="form-check"><input type="checkbox" class="form-check-input" name="checkbox" checked><span class="form-check-label">同意します</span></label><small class="ui-invalid-feedback" data-ui-error hidden></small></div><fieldset class="choice-list" data-ui-field><legend>ラジオボタン (radio)</legend><label class="form-check"><input type="radio" class="form-check-input" name="radio" value="a" checked> A</label><label class="form-check"><input type="radio" class="form-check-input" name="radio" value="b"> B</label><small class="ui-invalid-feedback" data-ui-error hidden></small></fieldset><div class="buttons fx fx-wrap sp-gap-2"><button type="submit" class="btn btn-sm btn-primary">送信 (submit)</button><button type="reset" class="btn btn-sm btn-outline-secondary">リセット (reset)</button><button type="button" class="btn btn-sm btn-outline-secondary" data-ui-toast="汎用ボタンが押されました" data-ui-variant="info">汎用 (button)</button></div><input type="hidden" name="hidden" value="hidden-value"><p class="dim small">type="hidden" は送信時に値（hidden-value）がフォームデータに含まれます。</p><p data-demo-result role="status"></p></form>
```

日付は既存のDate picker、時刻・日時・月・週・色は共通の選択パネルを使います。`input.form-control` にそれぞれのtypeを指定し、ui.jsを読み込むと自動で適用されます。選択して「適用」で確定し、キャンセル・Escapeでは元の値を維持します。色は候補と任意の6桁カラーコードで指定できます。`min`・`max`・`step` に合わない値はパネル内でエラーを表示します。

スライダーは `form-range`、チェックボックスとラジオは `form-check-input` を使います。ファイル選択ボタンの見た目は共通UI、ファイルを開く画面はOSのものを利用します。ドラッグ＆ドロップは[専用のファイル入力](#file-drop)で利用できます。Popover APIが利用できない場合は標準inputを維持します。

`data-ui-validate` を付けたフォームでは送信時にバリデーション結果を表示します。`data-demo-*` はカタログ専用で、実際の保存や通信はアプリ側で実装してください。

使用ファイル・取り込み方

共通の ui.css と ui.js を読み込み、サンプルのHTMLを配置します。必要な動作は data-ui-* 属性で指定します。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../../assets/css/ui.css) / [ui.js](../../assets/js/ui.js) / [属性一覧と導入例](../getting-started.html.md)

assetsフォルダごとコピーするとCSS内の相対参照も維持できます。catalog.js、catalog-navigation.js、catalog-demo.js、layout.css はカタログ専用です。data-demo-* はアプリに取り込む際に外し、保存や通信はアプリ側で実装してください。
