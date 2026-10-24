<!-- Generated from docs/components/layouts.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](layouts.html) · [llms.txt](../llms.txt)

# Layouts

[ドラッグで幅・高さを変えるSplitter →](splitter.html.md)

ページの骨組みを、タグとクラスの組み合わせで作ります。既存の色・余白・角丸を引き継ぎ、すべてのデザインテーマとライト／ダークに対応します。npmは不要です。

<a id="responsive-devices"></a>

## PCを基本に、タブレット・スマートフォンへ対応

PCは1024px以上、タブレットは768px以上1024px未満、スマートフォンは768px未満です。端末名ではなくブラウザの表示幅で切り替えます。PCの見た目を通常のクラスで指定し、タブレットは`tablet:`、スマートフォンは`mobile:`で変更します。共通のui.cssだけで使えます。

```html
<div class="fx-grid fx-grid-3 tablet:fx-grid-2 mobile:fx-grid-1 fx-gap-4 tablet:sp-gap-3 mobile:sp-gap-2" id="device-grid-demo">
  <article class="ui-card"><div class="ui-card-body"><h3 class="ui-card-title">プロジェクト</h3><p class="type-color-muted">PCは3列、タブレットは2列、スマートフォンは1列です。</p></div></article>
  <article class="ui-card"><div class="ui-card-body"><h3 class="ui-card-title">メンバー</h3><p class="type-color-muted">ブラウザの幅を変えて並び方を確認できます。</p></div></article>
  <article class="ui-card"><div class="ui-card-body"><h3 class="ui-card-title">アクティビティ</h3><p class="type-color-muted">色・角丸・影は既存テーマを引き継ぎます。</p></div></article>
</div>
```

`tablet:`はタブレット幅だけ、`mobile:`はスマートフォン幅だけに適用します。指定のない幅では通常クラスが適用されます。従来の`md:`・`lg:`や`fx-*-md-*`は「その幅以上」の指定として引き続き使えます。同じプロパティでは端末別指定とmd/lg指定を混在させないでください。

<a id="responsive-utilities"></a>

## 端末ごとに方向・余白・文字を調整

```html
<div class="ui-card sp-p-6 tablet:sp-p-4 mobile:sp-p-3" id="device-utilities-demo">
  <h3 class="type-size-2xl tablet:type-size-xl mobile:type-size-lg type-weight-bold">端末に合わせた見出し</h3>
  <div class="fx fx-row tablet:fx-row mobile:fx-column fx-justify-between mobile:fx-items-stretch fx-gap-4">
    <p class="m-0">スマートフォンでは操作を縦に並べます。</p>
    <a class="btn btn-primary ui-w-auto mobile:ui-w-full" href="forms.html">フォームを見る</a>
  </div>
</div>
```

Flexboxの方向・折り返し・整列・伸縮・列数・列幅、`sp-*`の余白、`type-*`の文字指定にプレフィックスを付けられます。例：`mobile:fx-column`、`tablet:fx-col-6`、`mobile:sp-gap-2`、`tablet:type-size-xl`。基本クラスの一覧は[Flexbox](flex.html.md)・[Flex grid](flex-grid.html.md)・[Spacing](spacing.html.md)・[Typography](typography.html.md)を参照してください。

<a id="responsive-visibility"></a>

## 表示の切り替え・全幅・横スクロール

```html
<p class="tablet:ui-hidden mobile:ui-hidden">PCで表示しています。</p>
<p class="ui-hidden tablet:ui-block">タブレットで表示しています。</p>
<p class="ui-hidden mobile:ui-block">スマートフォンで表示しています。</p>
```

`ui-hidden`・`ui-block`・`ui-inline`・`ui-flex`・`ui-inline-flex`・`ui-grid`で表示方法、`ui-w-full`・`ui-w-auto`で幅、`ui-overflow-x-auto`で横スクロールを指定できます。これらもtablet:・mobile:に対応します。HTMLの`hidden`属性は表示クラスでは解除されません。

横長の表は`ui-table-scroll`で囲み、領域内をスクロールできるようにします。[Tableのサンプル →](table.html.md)。カンバンは既存の`ui-board-wrap`で列構造を保ったまま横スクロールします。

```html
<div class="ui-table-scroll" tabindex="0" role="region" aria-label="プロジェクト一覧（横スクロール可能）">
  <table class="table">…</table>
</div>
```

画像・動画・canvasはクラスなしでも親幅に収まり、縦横比を維持します。SVGも親幅を超えません。アプリのui-pageは利用できる領域幅でカラムを切り替えます。カタログの目次は本文幅を確保できる1280px以上で右側、それ未満では本文上部に表示します。目次の一覧はどちらも常時表示です。

<a id="layout-shell"></a>

## アプリ全体：ヘッダー・メイン・フッター

実際のアプリではbodyに`ui-app`、本文のmainに`ui-app-main`を指定すると、短いページでもフッターが画面下に配置されます。以下はカタログ内の縮小例です。

```html
<div class="ui-stack">
  <header class="ui-header">
    <div class="ui-container ui-header-inner">
      <a class="ui-brand" href="../index.html">My workspace</a>
      <nav class="ui-header-nav" aria-label="アプリのメインメニュー">
        <a href="layouts.html" aria-current="page">概要</a><a href="board.html">タスク</a>
      </nav>
      <div class="ui-header-actions"><a class="btn btn-sm btn-outline-secondary" href="forms.html">設定</a></div>
    </div>
  </header>
  <div class="ui-app-main ui-container">
    <h2 class="ui-page-title">ワークスペース</h2><p class="ui-page-description">チームの作業をひとつの場所にまとめます。</p>
  </div>
  <footer class="ui-footer"><div class="ui-container ui-footer-inner"><p>© My workspace</p><nav class="ui-cluster" aria-label="フッター"><a href="tips.html">ヘルプ</a><a href="forms.html">お問い合わせ</a></nav></div></footer>
</div>
```

<a id="layout-container"></a>

## コンテンツ幅

`ui-container`は中央寄せ・左右16px・最大80rem。`ui-container-sm`で48rem、`ui-container-lg`で96rem、`ui-container-fluid`で全幅になります。画面より広がりません。

```html
<div class="ui-container ui-container-sm"><div class="ui-section"><h2 class="ui-section-title">読みやすい幅の設定画面</h2><p class="ui-section-description">長文やフォームには小さなコンテナ、一覧や管理画面には標準・全幅を選べます。</p></div></div>
```

<a id="layout-page-header"></a>

## ページ見出し・アクション・ツールバー

```html
<div class="ui-stack">
  <header class="ui-page-header">
    <div class="ui-page-heading"><p class="ui-page-eyebrow">ワークスペース / プロジェクト</p><h2 class="ui-page-title">プロジェクト一覧</h2><p class="ui-page-description">進行中のプロジェクトと担当者を確認できます。</p></div>
    <div class="ui-page-actions"><a class="btn btn-sm btn-outline-secondary" href="table.html">一覧を見る</a><a class="btn btn-sm btn-primary" href="forms.html">新規作成</a></div>
  </header>
  <div class="ui-toolbar" role="group" aria-label="プロジェクトの操作">
    <div class="ui-toolbar-group"><label for="layout-search">検索</label><input class="form-control form-control-sm" id="layout-search" type="search" placeholder="プロジェクト名"></div>
    <div class="ui-toolbar-group ui-toolbar-end"><span class="type-caption">3件</span><a class="btn btn-sm btn-outline-secondary" href="table.html">一覧表示</a></div>
  </div>
  <p class="type-caption">検索処理はアプリ側で接続します。狭い領域ではツールバーとアクションが折り返されます。</p>
</div>
```

<a id="layout-columns"></a>

## 2・3カラム：ナビゲーション・本文・補足

親に`ui-layout`を付けると、その領域の幅で切り替わります。48rem未満は縦並び、48rem以上で左ナビと本文、64rem以上で右の補足も横並びになります。左だけは`ui-page-with-aside`、右だけは`ui-page-with-rail`を指定します。

```html
<div class="ui-layout" id="layout-columns-demo">
  <div class="ui-page ui-page-with-aside ui-page-with-rail">
    <aside class="ui-page-aside" aria-label="プロジェクトメニュー"><h2 class="ui-aside-title">プロジェクト</h2><nav class="ui-aside-nav" aria-label="プロジェクト内"><a href="layouts.html" aria-current="page">概要</a><a href="board.html">タスク</a><a href="calendar.html">予定</a></nav></aside>
    <div class="ui-page-body">
      <header class="ui-page-header"><div class="ui-page-heading"><h2 class="ui-page-title">カタログの整備</h2><p class="ui-page-description">共通UIの使い方と進捗をまとめます。</p></div></header>
      <section class="ui-section"><h3 class="ui-section-title">作業内容</h3><p>コンポーネントの確認、使用例の作成、アプリへの取り込みを進めます。</p><p class="type-caption">長い識別子も折り返します：project_design_catalog_shared_components_2026_implementation_review</p></section>
    </div>
    <aside class="ui-page-rail" aria-label="プロジェクトの補足"><h2 class="ui-aside-title">詳細</h2><div class="ui-stack"><span class="type-caption">担当：デザインチーム</span><span class="type-caption">更新：2026年10月21日</span><a href="../getting-started.html">導入手順を見る</a></div></aside>
  </div>
</div>
```

<a id="layout-sections"></a>

## セクション・縦積み・折り返し・区切り

```html
<div class="ui-stack">
  <section class="ui-section"><header class="ui-section-header"><div><h2 class="ui-section-title">基本設定</h2><p class="ui-section-description">公開する情報を設定します。</p></div><a href="forms.html">編集する</a></header><div class="ui-cluster"><span class="badge text-bg-success">公開中</span><span class="type-caption">最終更新：今日</span></div></section>
  <section class="ui-section"><header class="ui-section-header"><h2 class="ui-section-title">通知設定</h2></header><p class="ui-section-description">セクションの間は余白と細い罫線で区切ります。</p></section>
  <div class="ui-divider">関連情報</div>
  <div class="ui-cluster"><a href="spacing.html">余白を調整</a><a href="flex.html">整列を調整</a><a href="cards.html">カードを使う</a></div>
</div>
```

<a id="layout-grid"></a>

## カード一覧用の自動グリッド

`ui-page-grid`は最小16remを基準に列数を自動調整します。列数を細かく指定する場合は既存の[Flex grid](flex-grid.html.md)を組み合わせてください。

```html
<div class="ui-page-grid">
  <article class="ui-card"><div class="ui-card-body"><h2 class="ui-card-title">デザインカタログ</h2><p class="ui-card-description">共通コンポーネントの追加と整理。</p></div><div class="ui-card-footer"><a href="../index.html">カタログを見る</a></div></article>
  <article class="ui-card"><div class="ui-card-body"><h2 class="ui-card-title">タスク管理</h2><p class="ui-card-description">担当と進捗をひと目で確認。</p></div><div class="ui-card-footer"><a href="board.html">ボードを見る</a></div></article>
  <article class="ui-card"><div class="ui-card-body"><h2 class="ui-card-title">チームの予定</h2><p class="ui-card-description">日程と作業の見通しを共有。</p></div><div class="ui-card-footer"><a href="calendar.html">予定を見る</a></div></article>
</div>
```

<a id="layout-dashboard"></a>

## 管理画面の組み合わせ：開閉できるサイドバー

既存の`app-shell`とサイドバーの開閉を再利用します。600px以下では上下に並びます。

```html
<div class="ui-stack">
  <div class="ui-toolbar"><strong>My workspace</strong><div class="ui-toolbar-end"><button type="button" class="btn btn-sm btn-outline-secondary" data-ui-toggle="sidebar" data-ui-target="#layout-dashboard-sidebar" data-ui-label-open="メニューを閉じる" data-ui-label-closed="メニューを開く">メニューを閉じる</button></div></div>
  <div class="app-shell">
    <aside class="app-sidebar" id="layout-dashboard-sidebar" aria-label="管理画面のメニュー"><h2 class="app-sidebar-title">管理メニュー</h2><nav class="app-sidebar-group" aria-label="管理画面"><a href="layouts.html" aria-current="page">概要</a><a href="table.html">プロジェクト</a><a href="forms.html">設定</a></nav><p class="app-sidebar-footer">個人用ワークスペース</p></aside>
    <section class="app-content ui-stack" aria-labelledby="layout-dashboard-title">
      <header class="ui-page-header"><div class="ui-page-heading"><h2 class="ui-page-title" id="layout-dashboard-title">概要</h2><p class="ui-page-description">今日の作業状況</p></div></header>
      <div class="ui-page-grid"><article class="ui-card"><div class="ui-card-body"><h3 class="ui-card-title">進行中</h3><p class="ui-card-stat">12</p><p class="ui-card-description">プロジェクト</p></div></article><article class="ui-card"><div class="ui-card-body"><h3 class="ui-card-title">完了</h3><p class="ui-card-stat">8</p><p class="ui-card-description">今週のタスク</p></div></article></div>
      <section class="ui-section"><h3 class="ui-section-title">次の作業</h3><p class="ui-section-description">コンポーネントの使い方を確認して、アプリに取り込みましょう。</p><a href="../getting-started.html">導入手順へ →</a></section>
    </section>
  </div>
</div>
```

## クラスの組み合わせ方

1カラムの基本形です。mainはページに1つだけ配置してください。カタログの例を本文内に埋め込む場合は、mainの代わりにdivやsectionを使います。

```html
<body class="ui-app">
  <header class="ui-header ui-header-sticky">…</header>
  <main class="ui-app-main">
    <div class="ui-container ui-layout">
      <div class="ui-page">
        <div class="ui-page-body">…</div>
      </div>
    </div>
  </main>
  <footer class="ui-footer">…</footer>
</body>
```

`ui-page-aside-sticky`をasideに追加すると、横並びのときだけ追従します。上に固定ヘッダーがある場合は`--ui-layout-offset`に実際のヘッダー高を指定してください。追従領域が長い場合は領域内をスクロールできます。固定が不要ならこれらのクラスは省略します。

余白は`sp-*`、整列は`fx-*`の既存ユーティリティを併用できます。カラムの切り替えにはCSS Container Queriesを使います。未対応ブラウザでは縦並びで表示されます。

使用ファイル・取り込み方

共通の ui.css と ui.js を読み込み、サンプルのHTMLを配置します。必要な動作は data-ui-* 属性で指定します。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../../assets/css/ui.css) / [ui.js](../../assets/js/ui.js) / [属性一覧と導入例](../getting-started.html.md)

assetsフォルダごとコピーするとCSS内の相対参照も維持できます。catalog.js、catalog-navigation.js、catalog-demo.js、layout.css はカタログ専用です。data-demo-* はアプリに取り込む際に外し、保存や通信はアプリ側で実装してください。
