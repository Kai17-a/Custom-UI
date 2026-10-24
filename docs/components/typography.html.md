<!-- Generated from docs/components/typography.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](typography.html) · [llms.txt](../../llms.txt)

# Typography

ui.cssを読み込むだけで、クラスのないHTMLにも共通の文字デザインを適用します。文字色・大きさ・太さ・行間などを変えたい場合はクラスを組み合わせます。JavaScriptは不要です。

<a id="type-defaults"></a>

## クラスなしのHTMLも共通デザイン

ui.cssを読み込むだけで、本文・h1〜h6・リンク・リスト・引用・コードなどに共通の書体・色・大きさ・太さ・余白を適用します。文字の基本表示にJavaScriptやclassは不要です。以下の見本の中身にはクラスを指定していません。

```html
<h1>ページの見出し</h1>
<h2>セクションの見出し</h2>
<h3>項目の見出し</h3>
<h4>小さな見出し</h4>
<h5>補足の見出し</h5>
<h6>詳細の見出し</h6>
<p>通常の本文です。<strong>重要な情報</strong>と<em>強調する表現</em>、<mark>確認する箇所</mark>を記載できます。</p>
<p><a href="forms.html">フォームの見本を見る</a> · <small>最終更新：10月22日</small></p>
<ul><li>目的を確認する</li><li>担当者を決める<ul><li>作業日を共有する</li></ul></li></ul>
<ol><li>変更を保存する</li><li>結果を確認する</li></ol>
<dl><dt>プロジェクト</dt><dd>共通UIのデザインカタログ</dd></dl>
<blockquote><p>判断の理由も残しておくと、次の担当者へ作業を引き継げます。</p></blockquote>
<p><code>project_001</code>を開き、<kbd>Ctrl</kbd> + <kbd>S</kbd>で保存します。</p>
<pre><code>const project = 'design-catalog';
console.log(project);</code></pre>
<hr>
<p><del>以前の案</del>から<ins>新しい案</ins>へ更新しました。<abbr title="User Interface">UI</abbr>の基本スタイルです。</p>
```

ベースは低いCSS優先度の`:where()`で定義しています。既存のコンポーネントクラスや`type-size-*`・`type-color-*`などで調整できます。タグの意味やブラウザの標準操作は維持します。

<a id="type-roles"></a>

## 役割から選ぶ

従来のクラスも使用できます。見た目の大きさと見出しの階層は別です。文書構造に応じてh1〜h6を選び、クラスで見た目を指定してください。

```html
<div class="type-sample"><code class="type-caption type-wrap">type-title</code><p class="m-0 type-title">プロジェクトの概要</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-heading</code><p class="m-0 type-heading">進行中のタスク</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-body</code><p class="m-0 type-body">今日のタスクは5件です。</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-small</code><p class="m-0 type-small">保存後すぐに反映されます。</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-caption</code><p class="m-0 type-caption">最終更新：10月21日 10:30</p></div>
```

端末別の文字サイズは`type-size-2xl tablet:type-size-xl mobile:type-size-lg`のように指定できます。[PC・タブレット・スマートフォンの使い分け →](layouts.html.md#responsive-devices)

<a id="type-sizes"></a>

## 文字サイズ

`type-size-*`は文字サイズだけを変更します。remはブラウザの文字サイズに追従します。pxは標準16pxでの目安です。

```html
<div class="type-sample"><code class="type-caption type-wrap">type-size-xs · 12px</code><p class="m-0 type-size-xs">文字の大きさ Aa</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-size-sm · 13px</code><p class="m-0 type-size-sm">文字の大きさ Aa</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-size-base · 14px</code><p class="m-0 type-size-base">文字の大きさ Aa</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-size-lg · 16px</code><p class="m-0 type-size-lg">文字の大きさ Aa</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-size-xl · 18px</code><p class="m-0 type-size-xl">文字の大きさ Aa</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-size-2xl · 24px</code><p class="m-0 type-size-2xl">文字の大きさ Aa</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-size-3xl · 30px</code><p class="m-0 type-size-3xl">文字の大きさ Aa</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-size-4xl · 36px</code><p class="m-0 type-size-4xl">文字の大きさ Aa</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-size-5xl · 48px</code><p class="m-0 type-size-5xl">文字の大きさ Aa</p></div>
```

<a id="type-colors"></a>

## 文字色

ライト／ダークで切り替わる既存のテーマ色を使います。success・danger・warning・infoは本文向けの強調色です。状態は色だけに頼らず、文章やアイコンでも伝えてください。

```html
<div class="type-sample"><code class="type-caption type-wrap">type-color-body</code><p class="m-0 type-color-body">通常の本文</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-color-muted</code><p class="m-0 type-color-muted">補足・更新日時</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-color-primary</code><p class="m-0 type-color-primary">主要な情報</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-color-success</code><p class="m-0 type-color-success">保存しました</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-color-danger</code><p class="m-0 type-color-danger">入力内容を確認してください</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-color-warning</code><p class="m-0 type-color-warning">未保存の変更があります</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-color-info</code><p class="m-0 type-color-info">詳細をご確認ください</p></div>
<p class="type-color-primary">親の色を<span class="type-color-inherit type-weight-bold">inheritで引き継ぎます</span>。</p>
```

<a id="type-weights"></a>

## 文字の太さ

`type-weight-*`は100〜900を指定します。実際の見た目は使用フォントが持つウェイトによって異なり、隣り合う太さが同じ表示になる場合があります。

```html
<div class="type-sample"><code class="type-caption type-wrap">type-weight-thin · 100</code><p class="m-0 type-weight-thin">文字の太さ Weight</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-weight-extralight · 200</code><p class="m-0 type-weight-extralight">文字の太さ Weight</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-weight-light · 300</code><p class="m-0 type-weight-light">文字の太さ Weight</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-weight-normal · 400</code><p class="m-0 type-weight-normal">文字の太さ Weight</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-weight-medium · 500</code><p class="m-0 type-weight-medium">文字の太さ Weight</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-weight-semibold · 600</code><p class="m-0 type-weight-semibold">文字の太さ Weight</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-weight-bold · 700</code><p class="m-0 type-weight-bold">文字の太さ Weight</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-weight-extrabold · 800</code><p class="m-0 type-weight-extrabold">文字の太さ Weight</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-weight-black · 900</code><p class="m-0 type-weight-black">文字の太さ Weight</p></div>
```

<a id="type-leading"></a>

## 行間

`type-leading-*`で行の高さを変更します。noneは短い見出し向けです。日本語の長文にはnormal〜looseを選んでください。

```html
<div class="type-sample"><code class="type-caption type-wrap">type-leading-none · 1</code><p class="m-0 type-leading-none">タスクごとに目的と完了条件を記載します。<br>判断の理由も残し、次の担当者へ引き継ぎます。</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-leading-tight · 1.3</code><p class="m-0 type-leading-tight">タスクごとに目的と完了条件を記載します。<br>判断の理由も残し、次の担当者へ引き継ぎます。</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-leading-snug · 1.4</code><p class="m-0 type-leading-snug">タスクごとに目的と完了条件を記載します。<br>判断の理由も残し、次の担当者へ引き継ぎます。</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-leading-normal · 1.6</code><p class="m-0 type-leading-normal">タスクごとに目的と完了条件を記載します。<br>判断の理由も残し、次の担当者へ引き継ぎます。</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-leading-relaxed · 1.8</code><p class="m-0 type-leading-relaxed">タスクごとに目的と完了条件を記載します。<br>判断の理由も残し、次の担当者へ引き継ぎます。</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-leading-loose · 2</code><p class="m-0 type-leading-loose">タスクごとに目的と完了条件を記載します。<br>判断の理由も残し、次の担当者へ引き継ぎます。</p></div>
```

<a id="type-tracking"></a>

## 文字間隔

`type-tracking-*`は文字間隔だけを変更します。長文はnormalを基準に、短い見出しで調整してください。

```html
<div class="type-sample"><code class="type-caption type-wrap">type-tracking-tight</code><p class="m-0 type-tracking-tight">Design catalog / デザインカタログ</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-tracking-normal</code><p class="m-0 type-tracking-normal">Design catalog / デザインカタログ</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-tracking-wide</code><p class="m-0 type-tracking-wide">Design catalog / デザインカタログ</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-tracking-wider</code><p class="m-0 type-tracking-wider">Design catalog / デザインカタログ</p></div>
```

<a id="type-alignment"></a>

## 配置

start・endは文字の方向に合わせます。justifyは最終行以外を両端揃えにします。

```html
<div class="type-sample"><code class="type-caption type-wrap">type-align-start</code><p class="m-0 type-align-start">プロジェクトの説明と進行状況を確認します。チームのメンバーへ最新の情報を共有します。</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-align-center</code><p class="m-0 type-align-center">プロジェクトの説明と進行状況を確認します。チームのメンバーへ最新の情報を共有します。</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-align-end</code><p class="m-0 type-align-end">プロジェクトの説明と進行状況を確認します。チームのメンバーへ最新の情報を共有します。</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-align-justify</code><p class="m-0 type-align-justify">プロジェクトの説明と進行状況を確認します。チームのメンバーへ最新の情報を共有します。</p></div>
```

<a id="type-styles"></a>

## 装飾・英字の変換

意味のある強調にはstrong・em、削除にはdelなどのHTMLを併用してください。装飾クラスは見た目だけを変更します。

```html
<div class="type-sample"><code class="type-caption type-wrap">type-italic</code><p class="m-0 type-italic">Italic / 斜体</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-upright</code><p class="m-0 type-upright">Upright / 標準</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-underline</code><p class="m-0 type-underline">下線のある文字</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-strike</code><p class="m-0 type-strike">取り消し線のある文字</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-no-decoration</code><p class="m-0 type-no-decoration">装飾なし</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-uppercase</code><p class="m-0 type-uppercase">Design catalog</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-lowercase</code><p class="m-0 type-lowercase">Design CATALOG</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-capitalize</code><p class="m-0 type-capitalize">design catalog</p></div>
<div class="type-sample"><code class="type-caption type-wrap">type-normal-case</code><p class="m-0 type-normal-case">Design catalog</p></div>
```

<a id="type-fonts"></a>

## フォント・数値

`type-font-mono`はフォントだけを変更します。従来の`type-mono`は小さな文字と折り返しも含みます。数値の桁幅は`type-numeric`で揃えます。

```html
<p class="type-font-sans">標準フォント：Design catalog</p>
<p class="type-font-mono">project_001 / src/ui.js</p>
<p class="type-numeric type-font-mono">12,345 件 · 00:12:48 · 98.6%</p>
```

<a id="type-wrapping"></a>

## 折り返し・省略

`type-wrap`は長い文字列を必要に応じて折り返します。break-allは単語の途中でも改行します。nowrapは横にはみ出すため、短いラベルなどに限定してください。

```html
<p class="type-wrap">very-long-project-name-without-spaces-for-responsive-layout-review_2026_001</p>
<p class="type-break-all">abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123456789</p>
<p class="type-whitespace-normal">type-whitespace-normal：通常の折り返し</p>
<p class="type-nowrap">type-nowrap：短いラベル</p>
<p class="type-pre-wrap">type-pre-wrap：改行を保持
  字下げも保持します。</p>
<p class="type-truncate">プロジェクトの公開前チェックリストと運用手順の更新について、担当者と作業日を確認します。</p>
<p class="type-small">↑ type-truncate：1行省略。全文は下にも記載しています。</p>
<p class="type-clamp-2">プロジェクトの公開前チェックリストと運用手順の更新について、担当者と作業日を確認します。プロジェクトの公開前チェックリストと運用手順の更新について、担当者と作業日を確認します。プロジェクトの公開前チェックリストと運用手順の更新について、担当者と作業日を確認します。プロジェクトの公開前チェックリストと運用手順の更新について、担当者と作業日を確認します。プロジェクトの公開前チェックリストと運用手順の更新について、担当者と作業日を確認します。プロジェクトの公開前チェックリストと運用手順の更新について、担当者と作業日を確認します。プロジェクトの公開前チェックリストと運用手順の更新について、担当者と作業日を確認します。プロジェクトの公開前チェックリストと運用手順の更新について、担当者と作業日を確認します。</p>
<p class="type-small">↑ type-clamp-2：2行省略。type-clamp-3なら3行です。</p>
<details><summary>全文を読む</summary><p class="type-wrap">プロジェクトの公開前チェックリストと運用手順の更新について、担当者と作業日を確認します。プロジェクトの公開前チェックリストと運用手順の更新について、担当者と作業日を確認します。プロジェクトの公開前チェックリストと運用手順の更新について、担当者と作業日を確認します。プロジェクトの公開前チェックリストと運用手順の更新について、担当者と作業日を確認します。プロジェクトの公開前チェックリストと運用手順の更新について、担当者と作業日を確認します。プロジェクトの公開前チェックリストと運用手順の更新について、担当者と作業日を確認します。プロジェクトの公開前チェックリストと運用手順の更新について、担当者と作業日を確認します。プロジェクトの公開前チェックリストと運用手順の更新について、担当者と作業日を確認します。</p></details>
<p class="type-break-normal">type-break-normalで通常の単語区切りに戻します。</p>
```

<a id="type-prose"></a>

## 長文・リスト

`type-prose`は幅65ch・行間1.8の長文向け設定です。リストの見た目を変えてもul・olによる意味は維持されます。

```html
<article class="type-prose"><h3 class="type-heading">チームで作業を進める</h3><p>タスクごとに目的と完了条件を記載します。担当者が変わっても作業を引き継げるよう、判断の理由も残しておきます。</p><p>本文の幅を抑え、段落の間に余白を設けます。</p><ul class="type-list-disc"><li>目的を確認する</li><li>担当者を決める</li></ul><ol class="type-list-decimal"><li>変更を保存する</li><li>結果を確認する</li></ol><ul class="type-list-none" role="list"><li>type-list-none：マーカーなし</li><li>リスト構造は維持します</li></ul></article>
```

<a id="type-combine"></a>

## 組み合わせ

役割クラスを基本に、変更したいプロパティのクラスを組み合わせます。クラス属性内の順番は優先順位に影響しません。同じプロパティを変更するクラスは1つだけ選んでください。

```html
<h3 class="type-heading type-size-2xl type-weight-bold type-color-primary">プロジェクトの概要</h3>
<p class="type-body type-size-lg type-leading-relaxed">本文の大きさと行間を調整できます。</p>
<p class="type-caption type-color-danger type-weight-semibold"><span icon="mdi-alert" aria-hidden="true"></span> 入力内容を確認してください。</p>
```

使用ファイル・取り込み方

文字のスタイルは共通のui.cssだけで使えます。アイコン属性も使う場合はui.jsを読み込みます。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../../assets/css/ui.css) / [ui.js](../../assets/js/ui.js) / [属性一覧と導入例](../getting-started.html.md)

assetsフォルダごとコピーするとCSS内の相対参照も維持できます。catalog.js、catalog-navigation.js、catalog-demo.js、layout.css はカタログ専用です。data-demo-* はアプリに取り込む際に外し、保存や通信はアプリ側で実装してください。
