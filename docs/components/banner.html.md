<!-- Generated from docs/components/banner.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](banner.html) · [llms.txt](../llms.txt)

# Banner

ページ全体の告知・メンテナンス・更新案内。アイコン、リンク、操作ボタン、閉じる操作を組み合わせられます。

<a id="banner-basic"></a>

## 基本のバナー

ページのヘッダー前後などに配置します。幅が狭いと操作欄が次の行に移ります。

```html
<div class="ui-banner ui-banner-info" role="note">
  <div class="ui-banner-inner">
    <span class="ui-banner-icon" icon="mdi-information-outline" aria-hidden="true"></span>
    <p class="ui-banner-content">新しいコンポーネントが利用できます。<a href="../getting-started.html">導入方法を確認</a></p>
    <div class="ui-banner-actions"><a class="ui-banner-action" href="../index.html">カタログを見る</a></div>
  </div>
</div>
```

<a id="banner-colors"></a>

## 意味に応じた色

基本は淡色です。色の指定を省くとニュートラルになります。

```html
<div class="ui-banner ui-banner-primary ui-banner-inset" role="note"><div class="ui-banner-inner"><span class="ui-banner-icon" icon="mdi-information-outline" aria-hidden="true"></span><p class="ui-banner-content">新しいテンプレートを公開しました。</p></div></div>
<div class="ui-banner ui-banner-info ui-banner-inset" role="note"><div class="ui-banner-inner"><span class="ui-banner-icon" icon="mdi-information-outline" aria-hidden="true"></span><p class="ui-banner-content">本日22:00からメンテナンスを行います。</p></div></div>
<div class="ui-banner ui-banner-success ui-banner-inset" role="note"><div class="ui-banner-inner"><span class="ui-banner-icon" icon="mdi-check-circle-outline" aria-hidden="true"></span><p class="ui-banner-content">すべてのデータの同期が完了しました。</p></div></div>
<div class="ui-banner ui-banner-warning ui-banner-inset" role="note"><div class="ui-banner-inner"><span class="ui-banner-icon" icon="mdi-alert-outline" aria-hidden="true"></span><p class="ui-banner-content">ストレージの残容量を確認してください。</p></div></div>
<div class="ui-banner ui-banner-danger ui-banner-inset" role="note"><div class="ui-banner-inner"><span class="ui-banner-icon" icon="mdi-alert-outline" aria-hidden="true"></span><p class="ui-banner-content">接続が切れました。ネットワークを確認してください。</p></div></div>
<div class="ui-banner ui-banner-neutral ui-banner-inset" role="note"><div class="ui-banner-inner"><span class="ui-banner-icon" icon="mdi-information-outline" aria-hidden="true"></span><p class="ui-banner-content">このワークスペースは読み取り専用です。</p></div></div>
```

<a id="banner-variants"></a>

## 塗りつぶし・枠線

```html
<div class="ui-banner ui-banner-primary ui-banner-solid ui-banner-inset" role="note"><div class="ui-banner-inner"><p class="ui-banner-content">最新版の利用を開始できます。</p><div class="ui-banner-actions"><a class="ui-banner-action" href="../getting-started.html">使い方を見る</a></div></div></div>
<div class="ui-banner ui-banner-info ui-banner-outline ui-banner-inset" role="note"><div class="ui-banner-inner"><p class="ui-banner-content">操作の前にドキュメントを確認してください。</p><a href="../templates.html">テンプレート一覧</a></div></div>
```

<a id="banner-title"></a>

## タイトル・本文・複数の操作

```html
<div class="ui-banner ui-banner-warning ui-banner-inset" role="note" aria-labelledby="banner-maintenance-title">
  <div class="ui-banner-inner">
    <span class="ui-banner-icon" icon="mdi-alert-outline" aria-hidden="true"></span>
    <div class="ui-banner-content"><h3 class="ui-banner-title" id="banner-maintenance-title">メンテナンスを予定しています</h3><p class="ui-banner-description">10月25日 22:00〜22:30は保存機能を停止します。作業中の内容は開始前に保存してください。</p></div>
    <div class="ui-banner-actions"><a class="ui-banner-action" href="../templates/changelog.html">詳細を見る</a><a href="../templates/docs.html">ヘルプ</a></div>
  </div>
</div>
```

<a id="banner-dismiss"></a>

## 閉じる・再表示

閉じるボタンに `data-ui-dismiss="banner"` を指定します。閉じた状態の保存はアプリ側で行ってください。

```html
<div class="ui-banner ui-banner-info ui-banner-inset" id="banner-dismissible" role="note">
  <div class="ui-banner-inner">
    <p class="ui-banner-content">バナーを閉じても、下のボタンから再表示できます。</p>
    <button type="button" class="ui-banner-close" data-ui-dismiss="banner" icon="mdi-close" aria-label="再表示できる案内を閉じる"></button>
  </div>
</div>
<p><button type="button" class="btn btn-outline-secondary" data-ui-toggle="show" data-ui-target="#banner-dismissible">バナーを再表示</button></p>
```

<a id="banner-floating"></a>

## 画面下に固定

`ui-banner-floating` は画面の下端に固定します。実際のアプリでは body 直下に置き、本文と重ならない余白を確保してください。親に transform や filter があると固定位置の基準が変わります。

```html
<button type="button" class="btn btn-outline-secondary" data-ui-toggle="show" data-ui-target="#banner-floating-example">画面下のバナーを表示</button>
<div class="ui-banner ui-banner-info ui-banner-floating" id="banner-floating-example" role="status" hidden>
  <div class="ui-banner-inner">
    <span class="ui-banner-icon" icon="mdi-information-outline" aria-hidden="true"></span>
    <p class="ui-banner-content">ドキュメントを更新しました。新しい使い方を確認できます。</p>
    <div class="ui-banner-actions"><a class="ui-banner-action" href="../getting-started.html">確認する</a></div>
    <button type="button" class="ui-banner-close" data-ui-dismiss="banner" icon="mdi-close" aria-label="画面下の案内を閉じる"></button>
  </div>
</div>
```

<a id="banner-usage"></a>

## クラス・属性と使い方

| 指定 | 用途 |
| --- | --- |
| `ui-banner` / `ui-banner-inner` | 外側の帯 / 中身の整列・最大幅 |
| `ui-banner-primary / info / success / warning / danger / neutral` | 色。省略時はニュートラル |
| `ui-banner-solid / ui-banner-outline` | 塗りつぶし / 枠線。省略時は淡色 |
| `ui-banner-inset` | 全周の枠線と角丸 |
| `ui-banner-sticky` | スクロール中、親の範囲内で上端に追従。固定ヘッダーがある場合は `--ui-banner-offset` で位置を調整 |
| `ui-banner-floating` | 画面下に固定 |
| `data-ui-dismiss="banner"` | 最も近いバナーを閉じる。別の場所から閉じる場合は `data-ui-target="#id"` を追加 |
| `data-ui-toggle="show" data-ui-target="#id"` | 対象のバナーを表示 |

表示には ui.css、閉じる・再表示には ui.js を使います。静的な告知は `role="note"`、動的な案内は `role="status"`、直ちに伝える必要のあるエラーのみ `role="alert"` にします。表示・非表示ではフェードが入り、動きを減らす設定にも対応します。

```
KavUI.show('#banner-dismissible');
KavUI.hide('#banner-dismissible');
// 表示・非表示後は ui:shown / ui:hidden イベントが発生します。
```

`--ui-banner-max-width` で内側の最大幅を変更できます。短い画面内の案内は [Alerts](alerts.html.md)、一時的な完了通知は [Toasts](toasts.html.md) も利用できます。

使用ファイル・取り込み方

共通の ui.css と ui.js を読み込み、サンプルのHTMLを配置します。必要な動作は data-ui-* 属性で指定します。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../assets/ui/css/ui.css) / [ui.js](../assets/ui/js/ui.js) / [属性一覧と導入例](../getting-started.html.md)

assetsフォルダごとコピーするとCSS内の相対参照も維持できます。catalog.js、catalog-navigation.js、catalog-demo.js、layout.css はカタログ専用です。data-demo-* はアプリに取り込む際に外し、保存や通信はアプリ側で実装してください。
