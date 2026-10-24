<!-- Generated from docs/components/calendar.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](calendar.html) · [llms.txt](../llms.txt)

# Calendar

月の切り替え・日付選択・予定表示に対応したカレンダー。ui.cssとui.jsだけで利用できます。

[フォーム用の日付入力・Date pickerはこちら →](datepicker.html.md)

## 今月のカレンダー（最小構成）

```html
<div class="ui-calendar" data-ui-calendar aria-label="日付を選択"></div>
```

## 予定付きの月表示

```html
<div class="ui-calendar" data-ui-calendar data-ui-month="2026-10" data-ui-value="2026-10-21" aria-label="プロジェクトの予定">
  <ul data-ui-calendar-events>
    <li data-ui-date="2026-10-08" data-ui-variant="success">10:00 リリース準備</li>
    <li data-ui-date="2026-10-14" data-ui-variant="warning">15:00 仕様の確認</li>
    <li data-ui-date="2026-10-21" data-ui-variant="info">10:00 デザインレビュー</li>
    <li data-ui-date="2026-10-21" data-ui-variant="success">14:00 コンポーネントの動作確認と、長いプロジェクト名を含む打ち合わせ</li>
    <li data-ui-date="2026-10-28" data-ui-variant="danger">17:00 提出期限</li>
  </ul>
</div>
```

<a id="calendar-modal"></a>

## 選択した日の予定をモーダルで開く

`data-ui-calendar-modal` を追加すると、日付のクリック・Enter・Spaceで、その日の予定をモーダル表示します。下部の予定欄はモーダルに切り替わり、予定のない日には「予定はありません」と表示します。初期表示時や月・フォーカスの移動だけでは開きません。

```html
<div id="calendar-day-modal-demo" class="ui-calendar" data-ui-calendar data-ui-calendar-modal data-ui-month="2026-10" data-ui-value="2026-10-21" aria-label="日付から予定を開く">
  <ul data-ui-calendar-events>
    <li data-ui-date="2026-10-21" data-ui-variant="info">10:00 デザインレビュー</li>
    <li data-ui-date="2026-10-21" data-ui-variant="success">14:00 コンポーネントの動作確認。長い予定名もモーダル内で折り返して確認できます。</li>
    <li data-ui-date="2026-10-23" data-ui-variant="warning">16:00 次週の予定を確認</li>
  </ul>
</div>
```

閉じるボタン・Escapeで閉じると、選択した日付にフォーカスが戻ります。属性を省略するか `data-ui-calendar-modal="false"` にすると従来の下部表示になります。

## 用意したモーダルを使う

値にモーダルのセレクターを指定できます。日付タイトルと予定欄には次の属性を付け、補足やボタンは自由に配置してください。

```html
<div id="calendar-custom-modal-demo" class="ui-calendar ui-calendar-compact" data-ui-calendar data-ui-calendar-modal="#calendar-custom-dialog" data-ui-month="2026-10" aria-label="カスタムモーダルの予定">
  <ul data-ui-calendar-events><li data-ui-date="2026-10-21" data-ui-variant="info">13:00 チームミーティング</li></ul>
</div>
<dialog id="calendar-custom-dialog" class="ui-dialog" data-ui-dialog aria-labelledby="calendar-custom-title">
  <h2 id="calendar-custom-title" data-ui-calendar-modal-title>選択日の予定</h2>
  <div data-ui-calendar-modal-events></div>
  <p class="small dim">予定の追加・編集など、アプリ固有の操作もここへ配置できます。</p>
  <div class="buttons"><button type="button" class="btn btn-outline-secondary" data-ui-dismiss="dialog">閉じる</button></div>
</dialog>
```

## コンパクト版・月曜始まり・選択範囲・フォームの値

```html
<div class="ui-calendar ui-calendar-compact" data-ui-calendar
  data-ui-week-start="monday" data-ui-value="2026-10-21"
  data-ui-min="2026-10-10" data-ui-max="2026-11-15"
  data-ui-name="scheduled_date" aria-label="実施日の選択">
</div>
```

予定がある日は件数を表示し、選択した日の予定を下部に表示します。狭い画面では予定名を省略し、下部で全文を確認できます。曜日の色分けは土日を示すもので、祝日判定は行いません。

## 属性一覧

| 属性 | 使い方 |
| --- | --- |
| `data-ui-calendar` | 月表示のカレンダーを初期化します。class="ui-calendar-compact"で小型表示。 |
| `data-ui-month="2026-10"` | 初期表示する月。省略時は選択日、または今月を表示します。 |
| `data-ui-value="2026-10-21"` | 選択した日付。選択するたびにこの属性も更新されます。 |
| `data-ui-week-start="monday"` | 月曜始まりにします。標準は日曜始まりです。 |
| `data-ui-min / data-ui-max` | 選択できる最小・最大の日付。YYYY-MM-DDで指定します。 |
| `data-ui-name="scheduled_date"` | 選択値を持つhidden inputを自動生成し、フォームへ組み込めます。 |
| `data-ui-calendar-events` | 予定を宣言するリスト。中のliにdata-ui-dateと予定名を記載します。 |
| `data-ui-calendar-modal` | 日付選択でその日の予定をモーダル表示。値なし・trueで自動生成、セレクターで既存dialogを指定、falseで無効。 |
| `data-ui-calendar-modal-title / data-ui-calendar-modal-events` | カスタムモーダルの日付タイトルと予定表示の領域。 |
| `data-ui-variant` | 予定の色。info / success / warning / danger。色を省略するとinfoです。 |

## アプリとの連携

```
document.addEventListener('ui:datechange', event => {
  const { value, previousValue } = event.detail;
  // value は '2026-10-21' 形式です。
  // 選択後の処理や保存はアプリ側で実装します。
});

document.addEventListener('ui:monthchange', event => {
  const { month } = event.detail; // '2026-11'
  // 必要なら表示月の予定を取得します。
});

// 日付の詳細モーダルを開いたとき。
document.addEventListener('ui:dayopen', event => {
  const { value, dialog, events } = event.detail;
  // valueは日付、eventsは{text, variant}の配列です。
  // dialog.dataset.uiCalendarModalValueにも日付を設定します。
});

// 予定や属性を変更したときは再描画できます。
KavUI.init(calendarElement);
```

日付を選ぶとui:datechange、表示月が変わるとui:monthchangeが発生します。data-ui-nameを指定してform内に置くと、選択値をFormDataで取得できます。日付はローカルの日付として扱います。

## キーボード操作

- Tab：月切替ボタン・日付へ移動
- 左右矢印：前日・翌日、上下矢印：前週・翌週
- Home / End：その週の先頭・末尾へ移動
- PageUp / PageDown：前月・翌月、Shiftと併用すると前年・翌年
- Enter / Space：フォーカスした日付を選択

使用ファイル・取り込み方

共通の2ファイルを読み込んで、サンプルのHTMLを配置します。assetsフォルダの構造は維持してください。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[カレンダーのCSS](../assets/ui/css/components/calendar.css) / [導入手順](../getting-started.html.md)
