<!-- Generated from docs/getting-started.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](getting-started.html) · [llms.txt](llms.txt)

# Getting started

Kav-UIはclassで見た目を、data-ui-*属性で動作を指定する共通UIです。専用の初期化コードは通常不要です。JavaScriptから操作する場合は`KavUI`を使用します。

[CSS・JavaScriptのダウンロードと導入手順](installation.html.md)

## 1. assetsフォルダをコピーする

ui.css は同じフォルダ内のCSSを相対参照します。assetsフォルダの構造を保ってコピーしてください。npm・ビルド・CDN・サーバーは不要です。

## 2. 共通2ファイルを読み込む

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

scriptにはdeferを付けます。ライト／ダーク切替は `data-ui-toggle="theme"` のボタンで利用できます。

[実際に2ファイルだけで動くstarter.htmlを開く →](starter.html.md)

<a id="recommended-conventions"></a>

## まず覚えるルールとアプリ処理の接続

新しい画面では、配置は`fx-*`、余白は`sp-*`、文字は`type-*`、ページ構成は`ui-*`を入口にしてください。互換性のため既存のstack・cluster・gap-*も使えますが、同じ数値が同じ大きさとは限りません。例えばsp-gap-3とfx-gap-3は12px相当、互換gap-3は16px相当です。

`mobile:`は768px未満だけ、`tablet:`は768〜1023pxだけ、`md:`は768px以上です。同じプロパティではこれらを混在させません。全幅の入力ラッパーは`field ui-w-full`で指定できます。

入力検証後の保存は`ui:valid`で接続します。[アプリ処理の接続例](#application-events)、[フォーム](components/forms.html.md)、[処理中・失敗・再試行](components/loading.html.md)を組み合わせます。項目間チェックは標準のsetCustomValidity、条件付き入力はrequired・disabledで指定でき、専用ルールエンジンは不要です。

モバイルの上部リンクには[Navbar](components/navigation.html.md#nav-navbar)、管理画面のページ一覧には[Sidebar](components/sidebar.html.md#sidebar-responsive)が使えます。必要な方だけ選んでください。

<a id="data-table-guide"></a>

## 検索・ソート付きのデータテーブル

[Data table](components/data-table.html.md)は、HTMLの行に検索・文字/数値/日付ソート・ページ送り・行選択を追加する部品です。親に`data-ui-data-table`、列名のbuttonに`data-ui-table-sort`を指定します。

<a id="color-palettes"></a>

## カラーパレット

ユーザーが基準色と彩度を選べる[カスタム配色フォーム](components/color-palettes.html.md#palette-custom)も利用できます。formにdata-ui-palette-editor、色入力にdata-ui-palette-seed、彩度入力にdata-ui-palette-chromaを指定します。APIはKavUI.setCustomPalette()です。初回描画前の復元には、CSSより前に任意のassets/js/theme-init.jsを読み込みます。

[Material 3に基づく6種類の低彩度パレット](components/color-palettes.html.md)を追加しています。htmlにdata-ui-palette="sage"を付けると、CSSだけで全体に反映します。切り替え部品はdata-ui-palette-select、ボタンはdata-ui-palette-value="sage"、APIはKavUI.setPalette()です。質感のdata-ui-theme、明暗のdata-bs-themeとは独立します。

<a id="splitter"></a>

## 領域のサイズ変更

[Splitter](components/splitter.html.md)は、横・縦のパネルをドラッグやキーボードで調整する部品です。親にdata-ui-splitter、直下のパネルにdata-ui-splitter-panelを指定します。最小／最大サイズ・折り畳み・入れ子・任意保存に対応し、APIはKavUI.splitter()です。

<a id="glass-background"></a>

## ガラスの背景画像

glass・glassmorphismには任意の背景画像を指定できます。CSSクラスで--ui-theme-background-imageと--ui-theme-background-opacityを設定するだけで、画像を薄く重ねます。指定しなければ従来の背景を維持します。[設定方法とプレビュー →](components/themes.html.md#theme-background)

<a id="service-templates"></a>

## サービス画面・チャート

[サービステンプレート](templates.html.md)は、ドキュメント・ダッシュボード・changelog・エラー画面の独立したHTMLです。画面固有のtemplates.css / templates.jsと共通のui.css / ui.jsで動きます。

[Chart](components/chart.html.md)は共通UIに含まれ、data-ui-chart属性とJSONで折れ線・面・棒・ドーナツを描画できます。データ表も自動で付きます。更新はKavUI.chart(element, config)を使います。

<a id="smooth-scroll"></a>

## スムーズスクロール

ページ全体またはスクロール領域に`ui-scroll-smooth`を付けます。`data-ui-scroll-active`を付けた領域は、`aria-current`の項目が見える位置まで移動します。[使用例・固定ヘッダーの余白・動きを減らす設定](components/navigation.html.md#nav-smooth-scroll)を参照してください。

<a id="search-history-components"></a>

## 検索・スライド・履歴・評価

[Command menu](components/command.html.md)で操作を検索し、[Carousel](components/carousel.html.md)で内容をスライド表示できます。[Timeline](components/timeline.html.md)は履歴、[Rating](components/rating.html.md)は星による評価入力です。共通のui.css / ui.jsで使え、TimelineとRatingの基本表示にはJavaScriptも不要です。

<a id="more-components"></a>

## メニュー・パネル・連結コンポーネント

追加の汎用コンポーネントも共通のui.cssとui.jsだけで使えます。Dropdown・PopoverはPopover API、Drawerはdialogを使用します。Input group・Button group・List group・Avatarの見た目にはJavaScriptは不要です。

- [Dropdown](components/dropdown.html.md)：操作メニュー・上下配置・キーボード・選択イベント
- [Popover](components/popover.html.md)：操作を含む補足パネル・フォーム・画面端補正
- [Drawer](components/drawer.html.md)：左右上下のサイドパネル・背景スクロール停止・フォーカス復帰
- [Input group](components/input-group.html.md)：入力欄と接頭辞・接尾辞・ボタン・selectの連結
- [Button group](components/button-group.html.md)：ボタンの連結・縦並び・radio／checkboxの選択
- [List group](components/list-group.html.md)：一覧・操作・現在地・件数・チェック付きリスト
- [Avatar](components/avatar.html.md)：イニシャル・画像・サイズ・ステータス・グループ

追加対象の参考：[BootstrapのDropdown](https://getbootstrap.com/docs/5.3/components/dropdowns/)・[Offcanvas](https://getbootstrap.com/docs/5.3/components/offcanvas/)・[Input group](https://getbootstrap.com/docs/5.3/forms/input-group/)、[BulmaのDropdown](https://bulma.io/documentation/components/dropdown/)、[daisyUIのAvatar](https://daisyui.com/components/avatar/)。コードと見た目はKav-UIの構成に合わせて実装しています。

<a id="responsive-devices"></a>

## PC・タブレット・スマートフォン

PC（1024px以上）の指定を基本に、タブレット（768px以上1024px未満）は`tablet:`、スマートフォン（768px未満）は`mobile:`を付けて調整できます。共通のui.cssだけで使え、npmやビルドは不要です。

```html
<div class="fx-grid fx-grid-3 tablet:fx-grid-2 mobile:fx-grid-1 fx-gap-4">
  <div class="ui-card">…</div>
  <div class="ui-card">…</div>
  <div class="ui-card">…</div>
</div>
```

余白は`sp-p-6 tablet:sp-p-4 mobile:sp-p-3`、文字は`type-size-2xl tablet:type-size-xl mobile:type-size-lg`のように指定します。[使い方・表示切り替え・横スクロール →](components/layouts.html.md#responsive-devices)

<a id="file-drop"></a>

## ファイルのドラッグ＆ドロップ

ファイルinputを`data-ui-file-drop`で囲み、対応するlabelに`data-ui-file-zone`を指定します。クリック選択・ドロップ・一覧・個別削除に対応し、通常のFileListやFormDataとして扱えます。

[HTML・複数選択・形式／サイズ制限・イベントの例 →](components/forms.html.md#file-drop)

<a id="typography-utilities"></a>

## 文字色・サイズ・太さ

ui.cssを読み込むと、クラスなしのh1〜h6・p・リンク・リスト・引用・コードにも共通の基本スタイルが適用されます。classは標準から変更したい箇所に指定します。[クラスなしのHTMLの見本 →](components/typography.html.md#type-defaults)

ui.cssだけで、役割クラスと文字のユーティリティを組み合わせられます。同じプロパティの指定は1つだけ選んでください。

```html
<h2 class="type-heading type-size-2xl type-weight-bold type-color-primary">見出し</h2>
<p class="type-body type-leading-relaxed">本文</p>
<p class="type-color-danger type-weight-semibold">入力内容を確認してください。</p>
```

[色・サイズ・太さ・行間・装飾・省略の一覧 →](components/typography.html.md)

<a id="icon-attributes"></a>

## 名前でMDIアイコンを表示する

共通のui.cssとui.jsだけで、同梱128種類のSVGを名前で表示できます。追加・属性変更も自動反映します。

```html
<button class="btn btn-primary" type="button">
  <span icon="mdi-content-save" class="btn-icon"></span>保存
</button>
```

[サイズ・アクセシビリティ・使い方 →](components/mdi-icons.html.md#mdi-attributes)

## 閉じられるアラート

```html
<div class="alert alert-success">
  保存しました。
  <button type="button" class="btn-close" data-ui-dismiss="alert" aria-label="閉じる"></button>
</div>
```

## ツールチップ

```html
<button type="button" class="btn btn-primary" data-ui-tooltip="変更を保存します">保存</button>
```

## 開閉する領域

```html
<button type="button" class="btn btn-outline-secondary" data-ui-toggle="collapse" data-ui-target="#help-panel">詳細</button>
<div id="help-panel" hidden>詳細情報です。</div>
```

## ダイアログ

```html
<button type="button" class="btn btn-primary" data-ui-toggle="dialog" data-ui-target="#my-dialog">開く</button>
<dialog id="my-dialog" class="ui-dialog" data-ui-dialog aria-label="確認">
  <p>変更内容を確認してください。</p>
  <button type="button" class="btn btn-outline-secondary" data-ui-dismiss="dialog">閉じる</button>
</dialog>
```

## 属性で通知

```html
<button type="button" class="btn btn-success" data-ui-toast="保存しました。" data-ui-variant="success">通知を表示</button>
```

## タイトルと本文のある通知

```html
<button type="button" class="btn btn-sm btn-outline-secondary" data-ui-toast data-ui-title="保存しました" data-ui-body="プロジェクトの変更を保存しました。" data-ui-variant="success" data-ui-meta="たった今">通知を表示</button>
```

[全バリエーションと幅の設定を見る →](components/toasts.html.md)

## ID不要のタブ

```html
<div data-ui-tabs>
  <div class="tabs" role="tablist" aria-label="表示切替">
    <button type="button" data-ui-toggle="tab" data-ui-target="overview">概要</button>
    <button type="button" data-ui-toggle="tab" data-ui-target="settings">設定</button>
  </div>
  <div class="tab-panel" data-ui-panel="overview">概要の内容</div>
  <div class="tab-panel" data-ui-panel="settings" hidden>設定の内容</div>
</div>
```

## 入力の検証

```html
<form data-ui-validate novalidate action="/projects" method="post">
  <div class="field" data-ui-field>
    <label>プロジェクト名<input class="form-control" name="project" required maxlength="80"></label>
    <small data-ui-error hidden></small>
  </div>
  <button class="btn btn-primary" type="submit">保存</button>
</form>
```

## カレンダー

```html
<div class="ui-calendar" data-ui-calendar data-ui-name="scheduled_date"></div>
```

[予定表示・日付範囲などの設定 →](components/calendar.html.md)

## 日付フォーム

```html
<label for="due-date">締切日</label>
<div class="ui-datepicker" data-ui-datepicker>
  <input id="due-date" class="form-control" type="date" name="due_date" required>
</div>
```

アイコンボタンを使う場合は、ラッパーに `data-ui-datepicker-button="icon"` を追加します。

[日付フォームの使い方 →](components/datepicker.html.md)

## ローディング

スピナーは`ui-spinner`、進捗バーは`<progress class="ui-progress">`で使えます。ボタンは`ui-loading-button`を付け、`KavUI.loading(button, true)`で開始、`KavUI.loading(button, false)`で終了します。

スケルトンシマーは`class="skeleton skeleton-shimmer"`で表示できます。JavaScriptは不要です。

[HTMLの組み方・サイズ・ボーダー・進捗・スケルトンシマーのサンプル →](components/loading.html.md)

開閉・タブ・ページ送り・カード移動・カレンダー・入力操作・進捗更新などには、短いアニメーションが自動で付きます。追加指定は不要です。動きを減らすOS設定ではアニメーションを無効にします。[動作サンプル →](components/animations.html.md)

## ライト・ダーク・システムの切り替え

`data-ui-color-mode="light" / "dark" / "system"` を付けたボタンで切り替えます。選択ボックスには `data-ui-color-select` を指定します。システムを選ぶとOSの明暗設定に追従します。選択を保存する場合はbodyにdata-ui-theme-persistを付けてください。

```
KavUI.setColorTheme('system', { persist: true });
```

[配置済みのボタン式・アイコン式・選択式のサンプル →](components/theme-switcher.html.md#color-mode-buttons)

## カレンダーの日付詳細モーダル

データ表示用のカレンダーに `data-ui-calendar-modal` を追加すると、選んだ日の予定をモーダルで開きます。既存のdialogを使う場合は `data-ui-calendar-modal="#対象ID"` を指定してください。

[自動生成・カスタムモーダルのサンプル →](components/calendar.html.md#calendar-modal)

## フォームの選択パネル

時刻・日時・月・週・色は、`input.form-control` に `type="time" / "datetime-local" / "month" / "week" / "color"` を指定すると共通の選択パネルを使えます。ui.cssとui.jsの読み込みが必要です。元のinputのname・値・required・min・max・stepを利用し、適用ボタンで確定します。スライダーはform-range、ラジオはform-check-inputを指定してください。

[入力タイプごとのサンプル →](components/forms.html.md#input-types) / [Checkbox・Radioのカスタム表示 →](components/forms.html.md#checkbox-radio)

## 余白をクラスで指定する

`sp-p-6` で内側24px相当、`sp-mt-8` で上側の外余白32px相当、`sp-gap-4` で要素間16px相当を指定できます。`md:sp-p-6` は768px以上、`lg:sp-p-8` は1024px以上で有効です。ui.cssだけで動作し、npmは不要です。従来のgap-3・px-3などは変更していません。

[余白クラスの一覧・使用例 →](components/spacing.html.md#spacing-classes)

<a id="theme-first-paint"></a>

## テーマを最初の描画から適用する

保存済みの明暗・質感・配色を初回表示から復元する場合は、同梱のtheme-init.jsをCSSより前に読み込みます。deferは付けません。storageキーや復元処理をアプリへコピーする必要はありません。

```html
<script src="assets/js/theme-init.js"></script>
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

bodyに`data-ui-theme-persist`を付けます。[配置順と設定の説明](installation.html.md#installation-theme)を参照してください。

## UI全体のデザインテーマ

```html
<body data-ui-theme="glass">
```

default / glass / glassmorphism / flat / softを選べます。明暗は従来どおりhtmlのdata-bs-themeで指定します。切り替え用のselectにはdata-ui-theme-selectを追加してください。

[全体のプレビュー・切り替え・保存方法 →](components/themes.html.md) / [テーマ切り替えコンポーネント →](components/theme-switcher.html.md)

単一選択の `select.form-select` は、選択肢もテーマに合わせて自動表示します。[selectの使い方 →](components/forms.html.md#select-box)

## ボタンとアイコン

`btn btn-primary`で塗りつぶし、`btn btn-outline-primary`でアウトライン、`btn btn-soft-primary`で淡い背景、`btn btn-ghost-primary`で枠なしにできます。子のSVGには`btn-icon`、アイコンのみのボタンには`btn-icon-only`とaria-labelを指定します。

[色・サイズ・アイコンの組み合わせを見る →](components/buttons.html.md)

## クリップボード

```html
<button type="button" class="btn btn-outline-secondary" data-ui-copy="コピーする文字列">コピー</button>
```

文字付きボタンとui-copy-iconクラスによるアイコンを選べます。アイコンは成功時に2秒間チェックマークになります。入力欄やコード欄の内容はdata-ui-copy-target="#対象ID"で指定できます。トーストにはdata-ui-toast-copy、JavaScriptではcopy: trueを追加します。

[クリップボードの例・API →](components/clipboard.html.md) / [コピー付きトースト →](components/toasts.html.md#toast-copy)

## ページのレイアウト

`ui-app`、`ui-container`、`ui-header`、`ui-page`、`ui-footer`でページを構成できます。2・3カラム、補助領域、ツールバー、管理画面の組み合わせも用意しています。

[レイアウトの使用例・クラス一覧 →](components/layouts.html.md)

## 属性一覧

| 属性 | 動作 |
| --- | --- |
| `data-ui-dismiss="alert"` | いちばん近い .alert を閉じます。固有IDは不要です。 |
| `data-ui-toggle="show" / "hide" / "collapse"` | data-ui-targetの領域を表示・非表示・切り替えます。 |
| `data-ui-toggle="sidebar"` | サイドバーを開閉し、aria-expandedと .app-shell のレイアウトを同期します。 |
| `data-ui-label-open / data-ui-label-closed` | 開閉ボタンの表示文字を切り替えます。省略すると文字は変更しません。 |
| `data-ui-toggle="dialog" / data-ui-dismiss="dialog"` | ネイティブdialogの開閉。開くボタンにはdata-ui-targetを指定します。 |
| `data-ui-backdrop="static"` | dialogの外側クリックで閉じる動作を止めます。Escapeは利用できます。 |
| `data-ui-tooltip="説明文"` | ホバー・フォーカス・クリックで説明を表示。Escape・領域外クリックで閉じます。 |
| `data-ui-toast="文言"` | 押すとトーストを表示します。data-ui-variantはsuccess / danger / info / warning。 |
| `data-ui-title / data-ui-body / data-ui-meta` | トーストのタイトル・本文・補足を指定します。本文は従来のdata-ui-toastにも指定できます。標準幅360pxで長文を折り返します。 |
| `data-ui-duration="6000"` | トーストの表示時間（ms）。0は自動消去なし。エラーの標準は0、その他は6000ms。操作中は消去を止めます。 |
| `data-ui-tabs / data-ui-panel="名前"` | タブの状態をグループ内に限定します。同じ名前を別グループでも使用できます。 |
| `data-ui-validate / data-ui-field / data-ui-error` | 標準HTML制約で検証します。data-ui-messageでエラー文言を指定できます。 |
| `data-ui-pagination / data-ui-page-size="8"` | data-ui-page-itemを分割表示します。data-ui-pageとdata-ui-page-stepで移動、data-ui-page-statusで件数表示。 |
| `data-ui-board / data-ui-column="状態"` | HTMLのカンバン。data-ui-cardをドラッグ、またはdata-ui-moveのselectで移動します。 |
| `data-ui-target="#任意のID"` | 別の要素を参照します。IDは利用側で自由に決め、ページ内で重複させないでください。 |
| `data-ui-focus="#任意のID"` | 閉じる際のフォーカス移動先を明示できます。通常は関連ボタンまたは近くの操作へ戻ります。 |

<a id="application-events"></a>

## アプリの処理と組み合わせる

共通UIは表示や操作だけを担当します。フォームは入力が有効なら通常のsubmitを続けます。保存・送信先・通信・ページ遷移はアプリ側で指定してください。カンバンの移動はページ内のDOMのみを更新します。

`ui:valid`（キャンセル可能）、`ui:tabchange`、`ui:pagechange`、`ui:move`、`ui:shown`、`ui:hidden`のイベントでアプリの処理を接続できます。

```
document.addEventListener('ui:valid', event => {
  // 通常のフォーム送信を止め、自分の保存処理を呼びます。
  event.preventDefault();
  const values = new FormData(event.target);
  // saveProject(values);
});

document.addEventListener('ui:move', event => {
  const { card, from, to } = event.detail;
  // persistMove(card.dataset.uiCard, from, to);
});

KavUI.toast({
  title: '保存しました',
  body: 'プロジェクトの変更を保存しました。',
  meta: 'たった今',
  variant: 'success'
});
// 従来の文字列形式も利用できます。
KavUI.toast('保存しました。', { variant: 'success' });
KavUI.show('#my-dialog');
KavUI.hide('#help-panel');

// 動的に追加したHTMLのARIA・初期表示を整える場合：
KavUI.init(container);
```

initは繰り返し実行できます。操作のイベントは委譲しているため、後から追加したボタンも動作します。

## カタログ固有のファイル

catalog.css / layout.css / catalog.js / catalog-navigation.js / catalog-demo.js と Flexbox playground は見本画面専用です。アプリでは ui.css / ui.js を使ってください。HTMLのdata-demo-*は送信を止めたり結果を模擬表示するための属性です。アプリに取り込む際は外してください。カタログではdata-example内のリンクによるページ移動と通常のフォーム送信を止めています。メニューやタブの切り替え、入力検証、ダイアログの確定は試せます。コピー用HTMLのhrefやactionはそのままなので、アプリでは通常どおり動作します。

## 動作テスト

[ブラウザテストを開く](https://github.com/Kai17-a/Custom-UI/blob/main/tests/ui.html)と、自動で共通UIの動作を検証します。Chromiumがインストールされている環境では `node tests/run-browser.mjs` でも実行できます。npmのインストールは不要です。

<a id="banner-guide"></a>

## 全体告知のバナー

`ui-banner` と `ui-banner-inner` でページ全体の案内を配置できます。色・操作・閉じる・固定表示の例は [Banner](components/banner.html.md) を参照してください。
