<!-- Generated from docs/components/flex-grid.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](flex-grid.html) · [llms.txt](../llms.txt)

# Flex grid

Flexboxで作る均等グリッド、12カラム、入れ子、固定幅と可変幅。gapを含めて幅を計算します。横・縦・複数行の配置もクラス指定で選べます。

Flexboxのプロパティ一覧

カードのサンプル

## レスポンシブ：1列 → 2列 → 3列

```html
<div class="fx-grid fx-grid-md-2 fx-grid-lg-3"><article class="ui-card "><div class="ui-card-body"><h3 class="ui-card-title">プロジェクト 1</h3><p class="ui-card-description">768px以上で2列、1024px以上で3列になります。</p></div></article><article class="ui-card "><div class="ui-card-body"><h3 class="ui-card-title">プロジェクト 2</h3><p class="ui-card-description">768px以上で2列、1024px以上で3列になります。</p></div></article><article class="ui-card "><div class="ui-card-body"><h3 class="ui-card-title">プロジェクト 3</h3><p class="ui-card-description">768px以上で2列、1024px以上で3列になります。</p></div></article><article class="ui-card "><div class="ui-card-body"><h3 class="ui-card-title">プロジェクト 4</h3><p class="ui-card-description">768px以上で2列、1024px以上で3列になります。</p></div></article><article class="ui-card "><div class="ui-card-body"><h3 class="ui-card-title">プロジェクト 5</h3><p class="ui-card-description">768px以上で2列、1024px以上で3列になります。</p></div></article><article class="ui-card "><div class="ui-card-body"><h3 class="ui-card-title">プロジェクト 6</h3><p class="ui-card-description">768px以上で2列、1024px以上で3列になります。</p></div></article></div>
```

## 均等な2列（gapを差し引く）

```html
<div class="fx-grid fx-grid-2 fx-gap-2"><div class="flex-demo-item ">1</div><div class="flex-demo-item ">2</div><div class="flex-demo-item ">3</div></div>
```

## 均等な3列（gapを差し引く）

```html
<div class="fx-grid fx-grid-3 fx-gap-2"><div class="flex-demo-item ">1</div><div class="flex-demo-item ">2</div><div class="flex-demo-item ">3</div><div class="flex-demo-item ">4</div></div>
```

## 均等な4列（gapを差し引く）

```html
<div class="fx-grid fx-grid-4 fx-gap-2"><div class="flex-demo-item ">1</div><div class="flex-demo-item ">2</div><div class="flex-demo-item ">3</div><div class="flex-demo-item ">4</div><div class="flex-demo-item ">5</div></div>
```

## 均等な6列（gapを差し引く）

```html
<div class="fx-grid fx-grid-6 fx-gap-2"><div class="flex-demo-item ">1</div><div class="flex-demo-item ">2</div><div class="flex-demo-item ">3</div><div class="flex-demo-item ">4</div><div class="flex-demo-item ">5</div><div class="flex-demo-item ">6</div><div class="flex-demo-item ">7</div></div>
```

## 12カラム：8 + 4 / 6 + 6 / 3 + 9

```html
<div class="fx-grid fx-gap-3"><div class="flex-demo-item fx-col-12 fx-col-md-8">8 / 12</div><div class="flex-demo-item fx-col-12 fx-col-md-4">4 / 12</div><div class="flex-demo-item fx-col-12 fx-col-md-6">6 / 12</div><div class="flex-demo-item fx-col-12 fx-col-md-6">6 / 12</div><div class="flex-demo-item fx-col-12 fx-col-md-3">3 / 12</div><div class="flex-demo-item fx-col-12 fx-col-md-9">9 / 12</div></div><p class="type-caption">モバイルは全幅。768pxから列幅を分けます。gapも含めて各行が親の幅に収まります。</p>
```

## 入れ子：カラムの内側に別のグリッド

```html
<div class="fx-grid"><div class="fx-col-12 fx-col-md-8"><div class="fx-grid fx-grid-2 fx-gap-2"><div class="flex-demo-item ">内側 1</div><div class="flex-demo-item ">内側 2</div></div></div><div class="fx-col-12 fx-col-md-4"><article class="ui-card "><div class="ui-card-body"><h3 class="ui-card-title">右側の内容</h3><p class="ui-card-description">入れ子はカラム用のラッパーを挟み、内側のgapを独立させます。</p></div></article></div></div>
```

## 自動折り返し：最小幅を基準に伸ばす

```html
<div class="fx-auto-grid sp-gap-4" style="--fx-min:14rem"><article class="ui-card "><div class="ui-card-body"><h3 class="ui-card-title">カード 1</h3><p class="ui-card-description">flex: 1 1 14rem。最後の行は余った幅を使って広がります。</p></div></article><article class="ui-card "><div class="ui-card-body"><h3 class="ui-card-title">カード 2</h3><p class="ui-card-description">flex: 1 1 14rem。最後の行は余った幅を使って広がります。</p></div></article><article class="ui-card "><div class="ui-card-body"><h3 class="ui-card-title">カード 3</h3><p class="ui-card-description">flex: 1 1 14rem。最後の行は余った幅を使って広がります。</p></div></article><article class="ui-card "><div class="ui-card-body"><h3 class="ui-card-title">カード 4</h3><p class="ui-card-description">flex: 1 1 14rem。最後の行は余った幅を使って広がります。</p></div></article><article class="ui-card "><div class="ui-card-body"><h3 class="ui-card-title">カード 5</h3><p class="ui-card-description">flex: 1 1 14rem。最後の行は余った幅を使って広がります。</p></div></article></div>
```

## 均等グリッドと自動折り返しの違い

```html
<div class="stack"><div><p class="type-caption">均等グリッド：最終行の項目も同じ列幅</p><div class="fx-grid fx-grid-3 fx-gap-2"><div class="flex-demo-item ">1</div><div class="flex-demo-item ">2</div><div class="flex-demo-item ">3</div><div class="flex-demo-item ">4</div><div class="flex-demo-item ">5</div></div></div><div><p class="type-caption">自動折り返し：最終行は伸びて行を埋める</p><div class="fx-auto-grid sp-gap-2" style="--fx-min:8rem"><div class="flex-demo-item ">1</div><div class="flex-demo-item ">2</div><div class="flex-demo-item ">3</div><div class="flex-demo-item ">4</div><div class="flex-demo-item ">5</div></div></div></div>
```

## 列と行で間隔を変える

```html
<div class="fx-grid fx-grid-2 sp-gap-x-2 sp-gap-y-8"><div class="flex-demo-item ">1</div><div class="flex-demo-item ">2</div><div class="flex-demo-item ">3</div><div class="flex-demo-item ">4</div><div class="flex-demo-item ">5</div><div class="flex-demo-item ">6</div></div>
```

## 中央寄せと空きカラム

```html
<div class="fx-grid fx-justify-center"><div class="flex-demo-item fx-col-12 fx-col-md-6">中央に6カラム</div></div><br><div class="fx-grid"><div class="flex-demo-item fx-col-12 fx-col-md-4">左に4カラム</div><div class="flex-demo-item fx-col-12 fx-col-md-4 fx-ms-auto">右端に4カラム</div></div>
```

## 横方向の配置：justify-content

標準の横並びでは、親のfx-gridにfx-justify-*を追加して横方向に配置します。4列分の幅に3項目を置き、余ったスペースの配分を比較しています。

### 左寄せ `fx-justify-start`

```html
<div class="fx-grid fx-grid-4 fx-gap-2 fx-justify-start">
<div class="flex-demo-item">A</div>
<div class="flex-demo-item">B</div>
<div class="flex-demo-item">C</div>
</div>
```

### 中央寄せ `fx-justify-center`

```html
<div class="fx-grid fx-grid-4 fx-gap-2 fx-justify-center">
<div class="flex-demo-item">A</div>
<div class="flex-demo-item">B</div>
<div class="flex-demo-item">C</div>
</div>
```

### 右寄せ `fx-justify-end`

```html
<div class="fx-grid fx-grid-4 fx-gap-2 fx-justify-end">
<div class="flex-demo-item">A</div>
<div class="flex-demo-item">B</div>
<div class="flex-demo-item">C</div>
</div>
```

### 両端に配置 `fx-justify-between`

```html
<div class="fx-grid fx-grid-4 fx-gap-2 fx-justify-between">
<div class="flex-demo-item">A</div>
<div class="flex-demo-item">B</div>
<div class="flex-demo-item">C</div>
</div>
```

### 項目の左右に余白 `fx-justify-around`

```html
<div class="fx-grid fx-grid-4 fx-gap-2 fx-justify-around">
<div class="flex-demo-item">A</div>
<div class="flex-demo-item">B</div>
<div class="flex-demo-item">C</div>
</div>
```

### すべて等間隔 `fx-justify-evenly`

```html
<div class="fx-grid fx-grid-4 fx-gap-2 fx-justify-evenly">
<div class="flex-demo-item">A</div>
<div class="flex-demo-item">B</div>
<div class="flex-demo-item">C</div>
</div>
```

## 最終行も中央に寄せる

justify-contentは折り返した各行に適用されます。列幅は変えず、最後の行の空きスペースを左右に配分します。

```html
<div class="fx-grid fx-grid-3 fx-gap-2 fx-justify-center">
<div class="flex-demo-item">1</div>
<div class="flex-demo-item">2</div>
<div class="flex-demo-item">3</div>
<div class="flex-demo-item">4</div>
<div class="flex-demo-item">5</div>
</div>
```

列で横幅をすべて埋めている行や、fx-auto-gridで子要素が余白いっぱいに伸びる行では、justify-contentによる配置の違いは見えません。

## 縦方向の揃え方：align-items

親にfx-items-*を指定して、行の中の子要素を揃えます。下の例では行の高さを8rem確保しています。

### 上揃え `fx-items-start`

```html
<div class="fx-grid fx-grid-3 fx-gap-2 fx-items-start" style="height:8rem">
<div class="flex-demo-item">A</div>
<div class="flex-demo-item"><span style="font-size:1.25rem">B</span><br>2行目</div>
<div class="flex-demo-item">C<br>2行目<br>3行目</div>
</div>
```

### 中央揃え `fx-items-center`

```html
<div class="fx-grid fx-grid-3 fx-gap-2 fx-items-center" style="height:8rem">
<div class="flex-demo-item">A</div>
<div class="flex-demo-item"><span style="font-size:1.25rem">B</span><br>2行目</div>
<div class="flex-demo-item">C<br>2行目<br>3行目</div>
</div>
```

### 下揃え `fx-items-end`

```html
<div class="fx-grid fx-grid-3 fx-gap-2 fx-items-end" style="height:8rem">
<div class="flex-demo-item">A</div>
<div class="flex-demo-item"><span style="font-size:1.25rem">B</span><br>2行目</div>
<div class="flex-demo-item">C<br>2行目<br>3行目</div>
</div>
```

### 文字の基準線 `fx-items-baseline`

```html
<div class="fx-grid fx-grid-3 fx-gap-2 fx-items-baseline" style="height:8rem">
<div class="flex-demo-item">A</div>
<div class="flex-demo-item"><span style="font-size:1.25rem">B</span><br>2行目</div>
<div class="flex-demo-item">C<br>2行目<br>3行目</div>
</div>
```

### 高さを伸ばす `fx-items-stretch`

```html
<div class="fx-grid fx-grid-3 fx-gap-2 fx-items-stretch" style="height:8rem">
<div class="flex-demo-item">A</div>
<div class="flex-demo-item"><span style="font-size:1.25rem">B</span><br>2行目</div>
<div class="flex-demo-item">C<br>2行目<br>3行目</div>
</div>
```

## 項目ごとに揃える：align-self

子要素のfx-self-*で、その項目だけ親のalign-itemsを上書きできます。

```html
<div class="fx-grid fx-grid-3 fx-gap-2 fx-items-start" style="height:9rem">
  <div class="flex-demo-item fx-self-end">A：下</div>
  <div class="flex-demo-item fx-self-center">B：中央</div>
  <div class="flex-demo-item fx-self-stretch">C：伸ばす</div>
</div>
```

## 複数行の配分：align-content

親にfx-content-*を指定すると、複数行全体を縦方向に配置できます。2行分の項目に対して14remの高さを確保しています。行が複数あり、高さに余りがあるときに効果が出ます。

### 上にまとめる `fx-content-start`

```html
<div class="fx-grid fx-grid-3 fx-gap-2 fx-content-start" style="height:14rem">
<div class="flex-demo-item">A</div>
<div class="flex-demo-item">B</div>
<div class="flex-demo-item">C</div>
<div class="flex-demo-item">D</div>
<div class="flex-demo-item">E</div>
<div class="flex-demo-item">F</div>
</div>
```

### 中央にまとめる `fx-content-center`

```html
<div class="fx-grid fx-grid-3 fx-gap-2 fx-content-center" style="height:14rem">
<div class="flex-demo-item">A</div>
<div class="flex-demo-item">B</div>
<div class="flex-demo-item">C</div>
<div class="flex-demo-item">D</div>
<div class="flex-demo-item">E</div>
<div class="flex-demo-item">F</div>
</div>
```

### 下にまとめる `fx-content-end`

```html
<div class="fx-grid fx-grid-3 fx-gap-2 fx-content-end" style="height:14rem">
<div class="flex-demo-item">A</div>
<div class="flex-demo-item">B</div>
<div class="flex-demo-item">C</div>
<div class="flex-demo-item">D</div>
<div class="flex-demo-item">E</div>
<div class="flex-demo-item">F</div>
</div>
```

### 上下の両端に配置 `fx-content-between`

```html
<div class="fx-grid fx-grid-3 fx-gap-2 fx-content-between" style="height:14rem">
<div class="flex-demo-item">A</div>
<div class="flex-demo-item">B</div>
<div class="flex-demo-item">C</div>
<div class="flex-demo-item">D</div>
<div class="flex-demo-item">E</div>
<div class="flex-demo-item">F</div>
</div>
```

### 各行の上下に余白 `fx-content-around`

```html
<div class="fx-grid fx-grid-3 fx-gap-2 fx-content-around" style="height:14rem">
<div class="flex-demo-item">A</div>
<div class="flex-demo-item">B</div>
<div class="flex-demo-item">C</div>
<div class="flex-demo-item">D</div>
<div class="flex-demo-item">E</div>
<div class="flex-demo-item">F</div>
</div>
```

### 行間と外側を等間隔 `fx-content-evenly`

```html
<div class="fx-grid fx-grid-3 fx-gap-2 fx-content-evenly" style="height:14rem">
<div class="flex-demo-item">A</div>
<div class="flex-demo-item">B</div>
<div class="flex-demo-item">C</div>
<div class="flex-demo-item">D</div>
<div class="flex-demo-item">E</div>
<div class="flex-demo-item">F</div>
</div>
```

### 行を伸ばす `fx-content-stretch`

```html
<div class="fx-grid fx-grid-3 fx-gap-2 fx-content-stretch" style="height:14rem">
<div class="flex-demo-item">A</div>
<div class="flex-demo-item">B</div>
<div class="flex-demo-item">C</div>
<div class="flex-demo-item">D</div>
<div class="flex-demo-item">E</div>
<div class="flex-demo-item">F</div>
</div>
```

<a id="responsive-alignment"></a>

## 画面幅で配置を切り替える

通常は中央寄せ、768px以上では両端に配分し、1024px以上では右寄せにします。fx-md-* / fx-lg-*はjustify・items・content・selfに対応します。

```html
<div class="fx-grid fx-grid-4 fx-gap-2 fx-justify-center fx-md-justify-between fx-lg-justify-end">
<div class="flex-demo-item">A</div>
<div class="flex-demo-item">B</div>
<div class="flex-demo-item">C</div>
</div>
```

## 固定幅＋可変幅：サイド領域と本文

```html
<div class="fx-responsive"><aside class="flex-demo-item fx-shrink-0 fx-basis" style="--fx-basis:10rem"><strong>メニュー</strong><p>768px以上で横並び</p></aside><section class="flex-demo-item fx-flex-1 fx-min-0"><h3 class="type-heading">残りの幅を使用する本文</h3><p class="type-wrap">長いファイル名やURLが入っても、min-width: 0 と折り返しで親の幅に収めます。</p></section></div>
```

## クラスと使い分け

FlexグリッドのAPI

| クラス・変数 | 用途 |
| --- | --- |
| `fx-grid` | 折り返す行。標準は全幅です。 |
| `fx-grid-{1,2,3,4,6,12}` | 全画面幅で指定の均等列数にします。 |
| `fx-grid-md-{1,2,3,4,6,12}`<br>`fx-grid-lg-{1,2,3,4,6,12}` | 768px / 1024px以上の均等列数です。 |
| `fx-col-{1…12}`<br>`fx-col-md-{1…12}`<br>`fx-col-lg-{1…12}` | 子要素に指定する12分割の幅。均等列より優先します。 |
| `--fx-gap / --fx-column-gap / --fx-row-gap` | 全体・横・縦の間隔。横のgapを列幅の計算にも使います。 |
| `fx-justify-{start,center,end,between,around,evenly}` | 親に指定。横方向の余白を配分します。 |
| `fx-items-{start,center,end,baseline,stretch}` | 親に指定。行の中の項目を縦方向に揃えます。 |
| `fx-self-{auto,start,center,end,baseline,stretch}` | 子に指定。項目単位でalign-itemsを上書きします。 |
| `fx-content-{start,center,end,between,around,evenly,stretch}` | 親に指定。複数行を縦方向に配分します。 |
| `fx-md-justify-center`など<br>`fx-lg-items-end`など | 768px / 1024px以上で配置を変更。justify / items / content / selfの全指定に対応します。 |
| `fx-auto-grid / --fx-min` | 最小幅を基準に折り返し、残りの幅を埋めます。 |

各行の幅を揃えたい場合は均等グリッドを使います。縦横の罫線や行をまたぐ配置が必要な場合はCSS Gridが適しています。このページはFlexboxによる配置に絞っています。

使用ファイル・取り込み方

共通の ui.css と ui.js を読み込み、サンプルのHTMLを配置します。必要な動作は data-ui-* 属性で指定します。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../../assets/css/ui.css) / [ui.js](../../assets/js/ui.js) / [属性一覧と導入例](../getting-started.html.md)

assetsフォルダごとコピーするとCSS内の相対参照も維持できます。catalog.js、catalog-navigation.js、catalog-demo.js、layout.css はカタログ専用です。data-demo-* はアプリに取り込む際に外し、保存や通信はアプリ側で実装してください。
