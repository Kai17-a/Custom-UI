<!-- Generated from docs/components/flex.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](flex.html) · [llms.txt](../llms.txt)

# Flexbox

基本プロパティから実用パターンまで。fx- 接頭辞のクラスで組み合わせでき、既存の row や d-flex と名前が重なりません。

[Flexグリッド・12カラム・レスポンシブの例 →](flex-grid.html.md)

<a id="playground"></a>

## Flexbox playground

親要素と子要素のプロパティ

flex-direction

row

row-reverse

column

column-reverse

flex-wrap

nowrap

wrap

wrap-reverse

justify-content

flex-start

center

flex-end

space-between

space-around

space-evenly

align-items

stretch

flex-start

center

flex-end

baseline

align-content

normal

flex-start

center

flex-end

space-between

space-around

space-evenly

stretch

子要素のflex

0 1 84px

1 1 0%

1 1 auto

0 0 84px

2番目のalign-self

auto

flex-start

center

flex-end

stretch

baseline

gap（px）

コンテナ幅（px）

初期値に戻す

640px（表示幅は親要素の幅まで）

1

Item

2

Item

3

Item

4

Item

5

Item

6

Item

現在のCSS

```
.container { display: flex; gap: 12px; }
```

wrap と狭いコンテナ幅で折り返しを比較できます。align-content は複数行に折り返し、交差軸に余剰スペースがある場合に違いが出ます。column では主軸が縦になります。

## display: flex / inline-flex

```html
<p>文章の中に <span class="fx-inline fx-gap-1"><span class="flex-demo-item">A</span><span class="flex-demo-item">B</span></span> を置けます。通常の fx はブロックとして幅を使います。</p>
```

<a id="direction"></a>

## 方向：row / row-reverse / column / column-reverse

```html
<div class="flex-demo-compare"><section><h3>row</h3><div class="fx flex-demo fx-gap-2 fx-row"><div class="flex-demo-item ">1</div><div class="flex-demo-item ">2</div><div class="flex-demo-item ">3</div></div></section><section><h3>row-reverse</h3><div class="fx flex-demo fx-gap-2 fx-row-reverse"><div class="flex-demo-item ">1</div><div class="flex-demo-item ">2</div><div class="flex-demo-item ">3</div></div></section><section><h3>column</h3><div class="fx flex-demo fx-gap-2 fx-column"><div class="flex-demo-item ">1</div><div class="flex-demo-item ">2</div><div class="flex-demo-item ">3</div></div></section><section><h3>column-reverse</h3><div class="fx flex-demo fx-gap-2 fx-column-reverse"><div class="flex-demo-item ">1</div><div class="flex-demo-item ">2</div><div class="flex-demo-item ">3</div></div></section></div><p class="dim small">reverseやorderを変えても、読み上げ・キーボードの順番はHTMLの記述順です。</p>
```

<a id="wrap"></a>

## 折り返し：nowrap / wrap / wrap-reverse

```html
<div class="stack"><div><p class="type-caption">nowrap</p><div class="fx flex-demo fx-gap-2 fx-nowrap"><div class="flex-demo-item fx-shrink-0" style="flex-basis:7rem">1</div><div class="flex-demo-item fx-shrink-0" style="flex-basis:7rem">2</div><div class="flex-demo-item fx-shrink-0" style="flex-basis:7rem">3</div><div class="flex-demo-item fx-shrink-0" style="flex-basis:7rem">4</div><div class="flex-demo-item fx-shrink-0" style="flex-basis:7rem">5</div></div></div><div><p class="type-caption">wrap</p><div class="fx flex-demo fx-gap-2 fx-wrap"><div class="flex-demo-item fx-shrink-0" style="flex-basis:7rem">1</div><div class="flex-demo-item fx-shrink-0" style="flex-basis:7rem">2</div><div class="flex-demo-item fx-shrink-0" style="flex-basis:7rem">3</div><div class="flex-demo-item fx-shrink-0" style="flex-basis:7rem">4</div><div class="flex-demo-item fx-shrink-0" style="flex-basis:7rem">5</div></div></div><div><p class="type-caption">wrap-reverse</p><div class="fx flex-demo fx-gap-2 fx-wrap-reverse"><div class="flex-demo-item fx-shrink-0" style="flex-basis:7rem">1</div><div class="flex-demo-item fx-shrink-0" style="flex-basis:7rem">2</div><div class="flex-demo-item fx-shrink-0" style="flex-basis:7rem">3</div><div class="flex-demo-item fx-shrink-0" style="flex-basis:7rem">4</div><div class="flex-demo-item fx-shrink-0" style="flex-basis:7rem">5</div></div></div></div>
```

<a id="justify"></a>

## 主軸：justify-content

```html
<div class="stack"><div><p class="type-caption">start</p><div class="fx flex-demo fx-gap-1 fx-justify-start"><div class="flex-demo-item ">1</div><div class="flex-demo-item ">2</div><div class="flex-demo-item ">3</div></div></div><div><p class="type-caption">center</p><div class="fx flex-demo fx-gap-1 fx-justify-center"><div class="flex-demo-item ">1</div><div class="flex-demo-item ">2</div><div class="flex-demo-item ">3</div></div></div><div><p class="type-caption">end</p><div class="fx flex-demo fx-gap-1 fx-justify-end"><div class="flex-demo-item ">1</div><div class="flex-demo-item ">2</div><div class="flex-demo-item ">3</div></div></div><div><p class="type-caption">between</p><div class="fx flex-demo fx-gap-1 fx-justify-between"><div class="flex-demo-item ">1</div><div class="flex-demo-item ">2</div><div class="flex-demo-item ">3</div></div></div><div><p class="type-caption">around</p><div class="fx flex-demo fx-gap-1 fx-justify-around"><div class="flex-demo-item ">1</div><div class="flex-demo-item ">2</div><div class="flex-demo-item ">3</div></div></div><div><p class="type-caption">evenly</p><div class="fx flex-demo fx-gap-1 fx-justify-evenly"><div class="flex-demo-item ">1</div><div class="flex-demo-item ">2</div><div class="flex-demo-item ">3</div></div></div></div>
```

<a id="align"></a>

## 交差軸：align-items

```html
<div class="flex-demo-compare"><section><h3>start</h3><div class="fx flex-demo fx-gap-2 flex-demo-tall fx-items-start"><div class="flex-demo-item " style="font-size:12px">Small</div><div class="flex-demo-item " style="font-size:24px">Large</div><div class="flex-demo-item ">2行<br>Label</div></div></section><section><h3>center</h3><div class="fx flex-demo fx-gap-2 flex-demo-tall fx-items-center"><div class="flex-demo-item " style="font-size:12px">Small</div><div class="flex-demo-item " style="font-size:24px">Large</div><div class="flex-demo-item ">2行<br>Label</div></div></section><section><h3>end</h3><div class="fx flex-demo fx-gap-2 flex-demo-tall fx-items-end"><div class="flex-demo-item " style="font-size:12px">Small</div><div class="flex-demo-item " style="font-size:24px">Large</div><div class="flex-demo-item ">2行<br>Label</div></div></section><section><h3>stretch</h3><div class="fx flex-demo fx-gap-2 flex-demo-tall fx-items-stretch"><div class="flex-demo-item " style="font-size:12px">Small</div><div class="flex-demo-item " style="font-size:24px">Large</div><div class="flex-demo-item ">2行<br>Label</div></div></section><section><h3>baseline</h3><div class="fx flex-demo fx-gap-2 flex-demo-tall fx-items-baseline"><div class="flex-demo-item " style="font-size:12px">Small</div><div class="flex-demo-item " style="font-size:24px">Large</div><div class="flex-demo-item ">2行<br>Label</div></div></section></div>
```

## 子要素だけの整列：align-self

```html
<div class="fx flex-demo fx-gap-2 fx-items-start flex-demo-tall"><div class="flex-demo-item ">start</div><div class="flex-demo-item fx-self-center">center</div><div class="flex-demo-item fx-self-end">end</div><div class="flex-demo-item fx-self-stretch">stretch</div></div>
```

<a id="content"></a>

## 複数行の配置：align-content

```html
<div class="flex-demo-compare"><section><h3>start</h3><div class="fx flex-demo fx-wrap fx-gap-2 flex-demo-lines fx-content-start"><div class="flex-demo-item ">1</div><div class="flex-demo-item ">2</div><div class="flex-demo-item ">3</div><div class="flex-demo-item ">4</div><div class="flex-demo-item ">5</div><div class="flex-demo-item ">6</div></div></section><section><h3>center</h3><div class="fx flex-demo fx-wrap fx-gap-2 flex-demo-lines fx-content-center"><div class="flex-demo-item ">1</div><div class="flex-demo-item ">2</div><div class="flex-demo-item ">3</div><div class="flex-demo-item ">4</div><div class="flex-demo-item ">5</div><div class="flex-demo-item ">6</div></div></section><section><h3>end</h3><div class="fx flex-demo fx-wrap fx-gap-2 flex-demo-lines fx-content-end"><div class="flex-demo-item ">1</div><div class="flex-demo-item ">2</div><div class="flex-demo-item ">3</div><div class="flex-demo-item ">4</div><div class="flex-demo-item ">5</div><div class="flex-demo-item ">6</div></div></section><section><h3>between</h3><div class="fx flex-demo fx-wrap fx-gap-2 flex-demo-lines fx-content-between"><div class="flex-demo-item ">1</div><div class="flex-demo-item ">2</div><div class="flex-demo-item ">3</div><div class="flex-demo-item ">4</div><div class="flex-demo-item ">5</div><div class="flex-demo-item ">6</div></div></section><section><h3>around</h3><div class="fx flex-demo fx-wrap fx-gap-2 flex-demo-lines fx-content-around"><div class="flex-demo-item ">1</div><div class="flex-demo-item ">2</div><div class="flex-demo-item ">3</div><div class="flex-demo-item ">4</div><div class="flex-demo-item ">5</div><div class="flex-demo-item ">6</div></div></section><section><h3>evenly</h3><div class="fx flex-demo fx-wrap fx-gap-2 flex-demo-lines fx-content-evenly"><div class="flex-demo-item ">1</div><div class="flex-demo-item ">2</div><div class="flex-demo-item ">3</div><div class="flex-demo-item ">4</div><div class="flex-demo-item ">5</div><div class="flex-demo-item ">6</div></div></section><section><h3>stretch</h3><div class="fx flex-demo fx-wrap fx-gap-2 flex-demo-lines fx-content-stretch"><div class="flex-demo-item ">1</div><div class="flex-demo-item ">2</div><div class="flex-demo-item ">3</div><div class="flex-demo-item ">4</div><div class="flex-demo-item ">5</div><div class="flex-demo-item ">6</div></div></section></div>
```

## gap / row-gap / column-gap

```html
<div class="fx flex-demo fx-wrap sp-gap-y-6 sp-gap-x-2"><div class="flex-demo-item fx-basis" style="--fx-basis:7rem">1</div><div class="flex-demo-item fx-basis" style="--fx-basis:7rem">2</div><div class="flex-demo-item fx-basis" style="--fx-basis:7rem">3</div><div class="flex-demo-item fx-basis" style="--fx-basis:7rem">4</div><div class="flex-demo-item fx-basis" style="--fx-basis:7rem">5</div><div class="flex-demo-item fx-basis" style="--fx-basis:7rem">6</div></div>
```

<a id="sizing"></a>

## 均等幅：flex: 1 1 0%

```html
<div class="fx flex-demo fx-gap-2"><div class="flex-demo-item fx-flex-1 fx-min-0">短い</div><div class="flex-demo-item fx-flex-1 fx-min-0">文字数が長くても同じ幅</div><div class="flex-demo-item fx-flex-1 fx-min-0">3番目</div></div>
```

## 内容の幅を基準に伸ばす：flex: 1 1 auto

```html
<div class="fx flex-demo fx-gap-2"><div class="flex-demo-item fx-flex-auto">短い</div><div class="flex-demo-item fx-flex-auto">内容が長い分だけ基準幅も広くなる</div><div class="flex-demo-item fx-flex-auto">3番目</div></div>
```

## 余剰スペースの配分：grow 1 : 2

```html
<div class="fx flex-demo fx-gap-2"><div class="flex-demo-item fx-basis-0 fx-grow fx-min-0">grow: 1</div><div class="flex-demo-item fx-basis-0 fx-grow-2 fx-min-0">grow: 2</div></div><p class="dim small">flex-grow は余ったスペースの配分比です。padding・最小幅・内容幅があると、最終幅そのものが1:2になるとは限りません。</p>
```

## 縮める / 固定する：flex-shrink

```html
<div class="fx flex-demo fx-gap-2"><div class="flex-demo-item fx-shrink-0" style="width:96px">固定 96px</div><div class="flex-demo-item fx-shrink fx-min-0" style="flex-basis:32rem">長い内容は残りの幅に収める</div></div>
```

## basis：初期サイズ・全幅の改行

```html
<div class="fx flex-demo fx-wrap fx-gap-2"><div class="flex-demo-item fx-basis" style="--fx-basis:10rem">basis: 10rem</div><div class="flex-demo-item fx-flex-1 fx-min-0">残りを使用</div><div class="flex-demo-item fx-basis-full">basis: 100% / 行を分ける</div></div>
```

## order：見た目の並び替え

```html
<div class="fx flex-demo fx-gap-2"><div class="flex-demo-item fx-order-last">HTML 1 / 最後</div><div class="flex-demo-item ">HTML 2 / 中央</div><div class="flex-demo-item fx-order-first">HTML 3 / 最初</div></div>
```

## 自動マージン：右寄せと中央配置

```html
<div class="fx flex-demo fx-gap-2 fx-items-center"><div class="flex-demo-item ">プロジェクト</div><div class="flex-demo-item fx-ms-auto">右端へ</div></div><br><div class="fx flex-demo flex-demo-tall"><div class="flex-demo-item fx-m-auto">上下左右中央</div></div>
```

## レスポンシブ：モバイルは縦、768pxから横

```html
<div class="fx flex-demo fx-column fx-md-row fx-gap-4"><div class="flex-demo-item fx-flex-1 fx-min-0">検索領域</div><div class="flex-demo-item fx-flex-none">絞り込み</div></div>
```

<a id="patterns"></a>

## 実用例：折り返すツールバー

```html
<div class="fx fx-wrap fx-items-center fx-gap-2"><strong>タスク一覧</strong><span class="type-caption">24件</span><a class="btn btn-sm btn-outline-secondary fx-ms-auto" href="forms.html">絞り込み</a><a class="btn btn-sm btn-primary" href="board.html">ボードを見る</a></div>
```

## 実用例：アイコン＋長い文字列＋操作

```html
<div class="fx fx-items-center fx-gap-3"><span class="flex-demo-avatar fx-shrink-0" aria-hidden="true">KT</span><div class="fx-flex-1 fx-min-0"><strong class="type-wrap">プロジェクト管理者</strong><p class="flex-demo-clip type-small" title="project-administrator@example-long-domain.test">project-administrator@example-long-domain.test</p></div><a class="btn btn-sm btn-outline-secondary fx-shrink-0" href="forms.html">編集</a></div><p class="type-caption">長い文字列には min-width: 0 を組み合わせます。</p>
```

## 実用例：フッターを下端に置く

```html
<div class="fx flex-demo fx-column fx-gap-3 flex-demo-column"><div class="flex-demo-item ">ヘッダー</div><div class="flex-demo-item ">短い本文</div><div class="flex-demo-item fx-mt-auto">フッター</div></div>
```

## 実用例：横スクロールする一覧

```html
<div class="fx-scroll" tabindex="0" role="region" aria-label="横スクロールするタグ一覧"><div class="flex-demo-item ">すべてのプロジェクト</div><div class="flex-demo-item ">デザインシステム</div><div class="flex-demo-item ">フロントエンド</div><div class="flex-demo-item ">バックエンド</div><div class="flex-demo-item ">ドキュメント</div><div class="flex-demo-item ">レビュー待ち</div><div class="flex-demo-item ">アーカイブ</div></div><p class="type-caption">領域にフォーカスして矢印キーでもスクロールできます。</p>
```

<a id="reference"></a>

## 取り込み用クラス一覧

{...} はカンマで区切った候補のいずれか1つです。fx-gap-1 は4px、2は8px、4は16pxです。競合する同じ種類のクラスは1つだけ指定してください。

Flexboxユーティリティ

| 用途 | クラス | 対応するCSS |
| --- | --- | --- |
| 表示・方向 | `fx / fx-inline / fx-row / fx-column / fx-row-reverse / fx-column-reverse` | display / flex-direction |
| 折り返し | `fx-wrap / fx-nowrap / fx-wrap-reverse` | flex-wrap |
| 主軸の整列 | `fx-justify-{start,end,center,between,around,evenly}` | justify-content |
| 交差軸の整列 | `fx-items-{start,end,center,stretch,baseline}` | align-items |
| 複数行の整列 | `fx-content-{start,end,center,between,around,evenly,stretch}` | align-content |
| 子の整列 | `fx-self-{auto,start,end,center,stretch,baseline}` | align-self |
| 伸縮の組み合わせ | `fx-flex-1 / fx-flex-auto / fx-flex-initial / fx-flex-none` | flex shorthand |
| 伸びる比率 | `fx-grow-0 / fx-grow / fx-grow-2` | flex-grow: 0 / 1 / 2 |
| 縮む・固定 | `fx-shrink / fx-shrink-0` | flex-shrink: 1 / 0 |
| 初期サイズ | `fx-basis-0 / fx-basis-auto / fx-basis-full / fx-basis` | flex-basis / --fx-basis |
| はみ出し対策 | `fx-min-0` | min-width: 0 / min-height: 0 |
| 表示順序 | `fx-order-first / fx-order-0 / fx-order-1 / fx-order-2 / fx-order-last` | order |
| 自動マージン | `fx-ms-auto / fx-me-auto / fx-mt-auto / fx-mb-auto / fx-m-auto` | margin |
| 間隔 | `fx-gap-{0,1,2,3,4,6,8,12} / fx-gap / fx-row-gap / fx-column-gap` | gap / --fx-gap / --fx-row-gap / --fx-column-gap |
| レスポンシブ | `fx-responsive / fx-md-row / fx-md-column / fx-md-wrap / fx-md-nowrap / fx-lg-row / fx-lg-column` | md: 768px / lg: 1024px |
| 自動配置・スクロール | `fx-auto-grid / fx-scroll` | --fx-min / --fx-gap |

使用ファイル・取り込み方

共通の ui.css と ui.js を読み込み、サンプルのHTMLを配置します。必要な動作は data-ui-* 属性で指定します。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../../assets/css/ui.css) / [ui.js](../../assets/js/ui.js) / [属性一覧と導入例](../getting-started.html.md)

assetsフォルダごとコピーするとCSS内の相対参照も維持できます。catalog.js、catalog-navigation.js、catalog-demo.js、layout.css はカタログ専用です。data-demo-* はアプリに取り込む際に外し、保存や通信はアプリ側で実装してください。
