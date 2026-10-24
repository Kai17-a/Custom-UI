<!-- Generated from docs/components/cards.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](cards.html) · [llms.txt](../llms.txt)

# Cards

情報をひとまとまりにするカード。基本・リンク・選択・メディア・統計・同じ高さの並びを用意しています。

## 基本のカードと控えめな背景

```html
<div class="fx-grid fx-grid-md-2"><article class="ui-card "><div class="ui-card-body"><h3 class="ui-card-title">プロジェクトの概要</h3><p class="ui-card-description">説明とメタデータをまとめる、基本のカードです。</p></div></article><article class="ui-card ui-card-subtle"><div class="ui-card-body"><h3 class="ui-card-title">チームメモ</h3><p class="ui-card-description">背景に少し差を付けて、補足情報をまとめます。</p></div></article></div>
```

## ヘッダー・本文・フッター

```html
<article class="ui-card"><header class="ui-card-header"><span class="badge text-bg-success">進行中</span></header><div class="ui-card-body"><h3 class="ui-card-title">デザインカタログ</h3><p class="ui-card-description">共通のUIパーツを整理し、アプリに取り込みます。</p><p class="ui-card-meta">最終更新：10月21日 · 担当：自分</p></div><footer class="ui-card-footer"><a class="btn btn-sm btn-primary" href="forms.html">設定を編集</a><a class="btn btn-sm btn-outline-secondary" href="table.html">一覧を見る</a></footer></article>
```

## リンクカード

```html
<a class="ui-card ui-card-link" href="flex.html"><div class="ui-card-body"><h3 class="ui-card-title">Flexboxを使う →</h3><p class="ui-card-description">カード全体がリンクです。TabとEnterでも移動できます。</p></div></a>
```

## 選択できるカード

```html
<fieldset class="fx fx-wrap fx-gap-4"><legend>表示密度を選択</legend><label class="ui-card fx-basis fx-grow"><span class="ui-card-body"><input type="radio" class="form-check-input" name="card-density" value="comfortable" checked> 標準<br><span class="ui-card-description">読みやすさを優先した余白</span></span></label><label class="ui-card fx-basis fx-grow"><span class="ui-card-body"><input type="radio" class="form-check-input" name="card-density" value="compact"> コンパクト<br><span class="ui-card-description">一画面の情報量を増やす</span></span></label></fieldset>
```

## メディア付き・横型カード

```html
<article class="ui-card ui-card-horizontal"><svg class="ui-card-media" viewBox="0 0 240 160" role="img" aria-label="カタログのレイアウト見本"><rect width="240" height="160" fill="var(--bs-secondary-bg)"/><rect x="24" y="24" width="48" height="112" rx="4" fill="var(--bs-primary-border-subtle)"/><rect x="84" y="24" width="132" height="24" rx="4" fill="var(--bs-primary)"/><rect x="84" y="60" width="60" height="76" rx="4" fill="var(--bs-border-color)"/><rect x="156" y="60" width="60" height="76" rx="4" fill="var(--bs-border-color)"/></svg><div class="ui-card-body"><h3 class="ui-card-title">アプリの画面設計</h3><p class="ui-card-description">サムネイルと説明を横に並べます。480px以下では縦並びになります。</p><p class="ui-card-meta">画像はSVGの見本です。img要素にも置き換えられます。</p></div></article>
```

## 統計カード

```html
<div class="fx-grid fx-grid-md-3"><article class="ui-card"><div class="ui-card-body"><h3 class="ui-card-title">すべてのタスク</h3><p class="ui-card-stat">24<span class="type-caption"> 件</span></p><p class="ui-card-description">今月作成したタスク</p></div></article><article class="ui-card"><div class="ui-card-body"><h3 class="ui-card-title">完了</h3><p class="ui-card-stat">18<span class="type-caption"> 件</span></p><p class="ui-card-description">完了率 75%</p></div></article><article class="ui-card"><div class="ui-card-body"><h3 class="ui-card-title">レビュー待ち</h3><p class="ui-card-stat">3<span class="type-caption"> 件</span></p><p class="ui-card-description">担当者の確認待ち</p></div></article></div>
```

## 高さを揃え、フッターを下端に置く

```html
<div class="fx-grid fx-grid-md-3 fx-items-stretch"><article class="ui-card "><div class="ui-card-body"><h3 class="ui-card-title">小さなタスク</h3><p class="ui-card-description">説明が短いカードです。</p></div><footer class="ui-card-footer"><a href="board.html">タスクを見る</a></footer></article><article class="ui-card "><div class="ui-card-body"><h3 class="ui-card-title">共有コンポーネントを整理する</h3><p class="ui-card-description">目的、使い方、関連するUIをまとめた長めの説明です。本文の長さが違っても、同じ行のカードの高さとフッター位置が揃います。</p></div><footer class="ui-card-footer"><a href="foundations.html">基準を見る</a></footer></article><article class="ui-card "><div class="ui-card-body"><h3 class="ui-card-title">レビュー</h3><p class="ui-card-description">担当者の確認を待っています。</p></div><footer class="ui-card-footer"><a href="table.html">一覧を見る</a></footer></article></div>
```

使用ファイル・取り込み方

共通の ui.css と ui.js を読み込み、サンプルのHTMLを配置します。必要な動作は data-ui-* 属性で指定します。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../assets/ui/css/ui.css) / [ui.js](../assets/ui/js/ui.js) / [属性一覧と導入例](../getting-started.html.md)

assetsフォルダごとコピーするとCSS内の相対参照も維持できます。catalog.js、catalog-navigation.js、catalog-demo.js、layout.css はカタログ専用です。data-demo-* はアプリに取り込む際に外し、保存や通信はアプリ側で実装してください。
