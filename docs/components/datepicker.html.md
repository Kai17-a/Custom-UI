<!-- Generated from docs/components/datepicker.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](datepicker.html) · [llms.txt](../llms.txt)

# Date picker

フォームに日付を設定する入力部品。直接入力と、カレンダーを開いて選択する操作に対応しています。

## 日付を設定する（基本）

```html
<div class="field" data-ui-field>
  <label for="datepicker-basic">実施日</label>
  <div class="ui-datepicker" data-ui-datepicker >
    <input class="form-control form-control-sm" type="date" id="datepicker-basic" name="datepicker-basic" >
  </div>
  <small class="ui-invalid-feedback" data-ui-error hidden></small>
</div>
```

## アイコンボタンで開く

```html
<div class="field" data-ui-field>
  <label for="datepicker-icon">実施日</label>
  <div class="ui-datepicker" data-ui-datepicker data-ui-datepicker-button="icon">
    <input class="form-control form-control-sm" type="date" id="datepicker-icon" name="icon_date" value="2026-10-21">
  </div>
  <small class="ui-invalid-feedback" data-ui-error hidden></small>
</div>
```

## 必須項目・フォームで入力を検証

```html
<form data-ui-validate data-demo-form novalidate><div class="field" data-ui-field>
  <label for="datepicker-required">締切日（必須）</label>
  <div class="ui-datepicker" data-ui-datepicker >
    <input class="form-control form-control-sm" type="date" id="datepicker-required" name="datepicker-required" required data-ui-message="締切日を入力してください。">
  </div>
  <small class="ui-invalid-feedback" data-ui-error hidden></small>
</div><button type="submit" class="btn btn-sm btn-primary">入力を検証</button> <button type="reset" class="btn btn-sm btn-outline-secondary">リセット</button><p data-demo-result role="status"></p></form>
```

## 初期値・選択範囲・月曜始まり

```html
<div class="field" data-ui-field>
  <label for="datepicker-range">予約日</label>
  <div class="ui-datepicker" data-ui-datepicker data-ui-week-start="monday">
    <input class="form-control form-control-sm" type="date" id="datepicker-range" name="datepicker-range" value="2026-10-21" min="2026-10-10" max="2026-11-15">
  </div>
  <small class="ui-invalid-feedback" data-ui-error hidden></small>
</div><p class="dim small">2026年10月10日〜11月15日を選択できます。</p>
```

## 読み取り専用・無効

```html
<div class="field" data-ui-field>
  <label for="datepicker-readonly">確定済みの日付（読み取り専用）</label>
  <div class="ui-datepicker" data-ui-datepicker >
    <input class="form-control form-control-sm" type="date" id="datepicker-readonly" name="datepicker-readonly" value="2026-10-21" readonly>
  </div>
  <small class="ui-invalid-feedback" data-ui-error hidden></small>
</div><div class="field" data-ui-field>
  <label for="datepicker-disabled">受付終了（日付変更不可）</label>
  <div class="ui-datepicker" data-ui-datepicker >
    <input class="form-control form-control-sm" type="date" id="datepicker-disabled" name="datepicker-disabled" value="2026-10-21" disabled>
  </div>
  <small class="ui-invalid-feedback" data-ui-error hidden></small>
</div><p class="dim small">読み取り専用の値は送信対象です。disabledの値は送信対象になりません。</p>
```

## ブラウザ標準の日付入力だけを使う

```html
<div class="field"><label for="native-date">開始日</label><input class="form-control form-control-sm" type="date" id="native-date" name="start_date"></div>
```

入力欄はブラウザ標準の日付入力です。表示形式はブラウザや言語設定に従い、送信する値はYYYY-MM-DDになります。共通カレンダーは右側のボタンまたはAlt＋↓で開けます。

## 設定一覧

| 属性 | 使い方 |
| --- | --- |
| `data-ui-datepicker` | input type="date"を囲む要素に指定します。開くボタンとカレンダーを自動生成します。 |
| `data-ui-datepicker-button="icon"` | ラッパーに指定すると、開くボタンをカレンダーアイコンにします。読み上げ用ラベルは自動設定されます。省略時は文字ボタンです。 |
| `inputのname` | FormDataや通常のフォーム送信に使う項目名。 |
| `inputのvalue` | 初期値。YYYY-MM-DD形式です。 |
| `inputのrequired` | 未入力の送信を止めます。data-ui-validateとも組み合わせられます。 |
| `inputのmin / max` | 選択可能な日付の範囲。YYYY-MM-DD形式です。 |
| `inputのreadonly / disabled` | 日付変更を止め、カレンダーボタンも無効にします。 |
| `data-ui-week-start="monday"` | ラッパーに指定すると、カレンダーを月曜始まりにします。 |

## アプリとの連携

```
// 日付は通常のinput / changeイベントで取得できます。
document.querySelector('[name="due_date"]').addEventListener('change', event => {
  const date = event.target.value; // '2026-10-21' または ''
});

// フォーム送信時も通常の入力欄と同じです。
const values = new FormData(formElement);
const dueDate = values.get('due_date');
```

カレンダーを開いてもフォームは送信されません。日付を選ぶと入力欄のinput / changeイベントが発生し、カレンダーが閉じます。クリアで未入力に戻せます。

Escapeで閉じ、Tabで別の項目へ移動できます。矢印・PageUp / PageDownで日付を移動し、EnterまたはSpaceで選択できます。

使用ファイル・取り込み方

共通の2ファイルを読み込みます。assetsフォルダの構造は維持してください。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[導入手順](../getting-started.html.md) / [予定表示用のカレンダー](calendar.html.md)
