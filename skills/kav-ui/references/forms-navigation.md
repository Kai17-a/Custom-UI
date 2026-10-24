# フォームとナビゲーション

## 入力・選択・日付

```html
<form class="stack sp-gap-4">
  <div class="field">
    <label for="project-name">プロジェクト名</label>
    <input class="form-control" id="project-name" name="name" maxlength="80" required>
    <small>80文字以内で入力してください。</small>
  </div>
  <div class="field">
    <label for="project-scope">公開範囲</label>
    <select class="form-select" id="project-scope" name="scope">
      <option value="private">自分のみ</option><option value="team">チーム</option>
    </select>
  </div>
  <div class="field">
    <label for="project-date">実施日</label>
    <div class="ui-datepicker" data-ui-datepicker>
      <input class="form-control" type="date" id="project-date" name="date">
    </div>
  </div>
  <label class="form-check"><input class="form-check-input" type="checkbox" name="notify" checked>変更を通知</label>
  <fieldset class="choice-list"><legend>プラン</legend>
    <label class="form-check"><input class="form-check-input" type="radio" name="plan" value="personal" checked>個人</label>
    <label class="form-check"><input class="form-check-input" type="radio" name="plan" value="team">チーム</label>
  </fieldset>
  <button class="btn btn-primary" type="submit">保存</button>
</form>
```

`field`はラベル・項目・補足の間を6pxに揃える。`textarea.form-control`、小さな入力の`form-control-sm`、スイッチの`label.switch > input[type=checkbox][role=switch]`も利用できる。

単一の`select.form-select`はJSで共通メニューへ変わる。name・required・disabled・optgroup・送信値は標準HTMLを使う。multiple/sizeは標準UIを維持する。プログラムで値を変えたらchangeを発行するか`KavUI.init(select)`で同期する。

時刻・日時・月・週・色は`input.form-control`の標準typeを使い、対応版のJSが選択UIを付ける。Date pickerのmin/max/requiredも標準属性。日付の送信値は`YYYY-MM-DD`で扱い、表示文字列から日時を再解釈しない。

フォームの独自エラー表示にはformの`data-ui-validate`、項目の`data-ui-field`、出力先の`data-ui-error`を使う。実際の送信処理はアプリで接続する。カタログ用の`data-demo-form`は付けない。

## ファイルのドロップ

```html
<div class="ui-file-drop" data-ui-file-drop data-ui-max-size="5242880" data-ui-max-files="5">
  <input class="form-control" type="file" id="attachments" name="attachments" accept="image/*,.pdf" multiple>
  <label class="ui-file-dropzone" data-ui-file-zone for="attachments">
    <span icon="mdi-upload" aria-hidden="true"></span>
    <strong>ファイルをドロップ、または選択</strong>
    <span class="ui-file-hint">1件5MB、最大5件</span>
  </label>
</div>
```

FileListとFormDataで取得する。選択は置き換えになり、無効な選択は直前の値を維持する。アップロード通信とサーバー側の検証はアプリの責務。

## タブ・折り畳み・メニュー

```html
<div data-ui-tabs>
  <div class="tabs" role="tablist" aria-label="プロジェクト情報">
    <button type="button" data-ui-toggle="tab" data-ui-target="overview" aria-selected="true">概要</button>
    <button type="button" data-ui-toggle="tab" data-ui-target="history">履歴</button>
  </div>
  <div class="tab-panel" data-ui-panel="overview">プロジェクトの概要</div>
  <div class="tab-panel" data-ui-panel="history" hidden>変更履歴</div>
</div>
<div class="accordion"><details><summary>補足</summary><p>詳細な説明です。</p></details></div>
```

タブのtargetはパネルの名前で、`#id`ではない。ダイアログなどのtargetはセレクター。タブの矢印・Home・Endによる選択をJSが扱う。

```html
<button type="button" class="btn btn-outline-secondary" data-ui-toggle="dropdown" data-ui-target="#project-menu">操作</button>
<div id="project-menu" class="ui-dropdown-menu" data-ui-dropdown popover>
  <button class="ui-dropdown-item" type="button" data-ui-value="edit">編集</button>
  <button class="ui-dropdown-item" type="button" data-ui-value="archive">アーカイブ</button>
</div>
```

Dropdownは操作一覧、自由な補足・フォームには`data-ui-toggle="popover"`と`data-ui-popover popover`の領域を使う。アプリの処理はイベントやボタンへ接続し、デモ用の通知だけで処理を代用しない。

## レスポンシブサイドバー

```html
<div class="app-shell" id="workspace" data-ui-sidebar data-ui-sidebar-mobile="drawer" data-ui-sidebar-tablet="rail" data-ui-sidebar-desktop="expanded">
  <aside class="app-sidebar" aria-label="メニュー">
    <h2 class="app-sidebar-title">Workspace</h2>
    <nav class="app-sidebar-group" aria-label="ページ">
      <a href="/projects" aria-current="page"><span class="sidebar-icon" icon="mdi-home" aria-hidden="true"></span><span class="sidebar-label">プロジェクト</span></a>
      <a href="/settings"><span class="sidebar-icon" icon="mdi-cog" aria-hidden="true"></span><span class="sidebar-label">設定</span></a>
    </nav>
  </aside>
  <section class="app-content">
    <button class="btn btn-outline-secondary" type="button" data-ui-toggle="sidebar-responsive" data-ui-target="#workspace">メニュー</button>
    <h1>プロジェクト</h1>
  </section>
</div>
```

リンク先と現在地はアプリのルーターに合わせる。アイコンだけのrailでも`sidebar-label`を残して名前を伝える。独立した領域で現在地を初回だけ表示するには、スクロールする要素へ`data-ui-scroll-active="once"`を付ける。既定の継続追従とは異なり、折り畳み後に現在地へ引き戻さない。

ページ内の滑らかな移動はスクロール領域の`ui-scroll-smooth`を使う。リンクと対象IDを実在させ、stickyヘッダーがある場合は対象へCSSのscroll-margin-topを設定する。
