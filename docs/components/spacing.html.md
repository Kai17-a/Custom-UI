<!-- Generated from docs/components/spacing.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](spacing.html) · [llms.txt](../llms.txt)

# Spacing

余白を数値と使用例で比較できます。内側はpadding、要素間はgap、外側はmarginで調整します。

<a id="spacing-classes"></a>

## クラスで指定する

新しい余白クラスには `sp-` を付けます。使用できる数値は `0 / 1 / 2 / 3 / 4 / 6 / 8 / 12` です。例えば `sp-p-6` は24px相当、`sp-gap-3` は12px相当になります。値はrem単位で、ブラウザの文字サイズに追従します。

| クラス | 対象 |
| --- | --- |
| `sp-p-*` | 内側の全方向 |
| `sp-px-*` / `sp-py-*` | 内側の左右 / 上下 |
| `sp-pt-*` / `sp-pr-*`<br>`sp-pb-*` / `sp-pl-*` | 内側の上 / 右 / 下 / 左 |
| `sp-ps-*` / `sp-pe-*` | 内側の開始側 / 終了側。RTLでは左右が入れ替わります。 |
| `sp-m-*` | 外側。pと同じx・y・t・r・b・l・s・eの方向指定が使えます。 |
| `sp-m-auto` | 外側をautoにします。方向指定も使えます。例：sp-mx-auto、sp-ms-auto。 |
| `sp-gap-*` | flex / gridの要素間隔 |
| `sp-gap-x-*` / `sp-gap-y-*` | 列の間隔 / 行の間隔。fx-gridの列幅計算にも連動します。 |

余白の調整にはJavaScriptは不要です。既存の `inset`・`stack`・`cluster` と組み合わせられます。

## 余白スケール

```html
<div class="space-measure"><code>--space-0<br>0px / 0rem</code><div class="space-measure-bar space-measure-0"></div></div>
<div class="space-measure"><code>--space-1<br>4px / 0.25rem</code><div class="space-measure-bar space-measure-1"></div></div>
<div class="space-measure"><code>--space-2<br>8px / 0.5rem</code><div class="space-measure-bar space-measure-2"></div></div>
<div class="space-measure"><code>--space-3<br>12px / 0.75rem</code><div class="space-measure-bar space-measure-3"></div></div>
<div class="space-measure"><code>--space-4<br>16px / 1rem</code><div class="space-measure-bar space-measure-4"></div></div>
<div class="space-measure"><code>--space-6<br>24px / 1.5rem</code><div class="space-measure-bar space-measure-6"></div></div>
<div class="space-measure"><code>--space-8<br>32px / 2rem</code><div class="space-measure-bar space-measure-8"></div></div>
<div class="space-measure"><code>--space-12<br>48px / 3rem</code><div class="space-measure-bar space-measure-12"></div></div>
```

## Padding：コンテナの内側

```html
<div class="spacing-grid"><div class="space-demo sp-p-2"><div class="space-demo-item">padding: 8px<br>コンパクトな補助領域</div></div><div class="space-demo sp-p-4"><div class="space-demo-item">padding: 16px<br>通常のパネル</div></div><div class="space-demo sp-p-6"><div class="space-demo-item">padding: 24px<br>まとまった情報の領域</div></div></div>
```

## Gap：要素どうしの間隔

```html
<div class="stack sp-gap-6"><div><p class="type-caption">横並び・折り返し / gap: 8px</p><div class="cluster sp-gap-2"><span class="space-demo-item">デザイン</span><span class="space-demo-item">開発</span><span class="space-demo-item">レビュー</span></div></div><div><p class="type-caption">縦並び / gap: 16px</p><div class="stack sp-gap-4"><div class="space-demo-item">プロジェクト名</div><div class="space-demo-item">プロジェクトの説明</div><div class="space-demo-item">公開範囲</div></div></div></div>
```

## Margin：独立したブロックの外側

```html
<div class="space-demo sp-p-4"><div class="space-demo-item">前のセクション</div><div class="space-demo-item sp-mt-8">margin-top: 32px<br>次のセクション</div></div>
```

## 全方向と左右を組み合わせる

```html
<div class="space-demo sp-p-6 sp-px-2"><div class="space-demo-item">上下24px・左右8px</div></div>
```

## autoで端に寄せる

```html
<div class="cluster sp-gap-2"><span class="space-demo-item">左側の内容</span><span class="space-demo-item sp-ms-auto">終了側へ寄せる</span></div>
```

<a id="spacing-responsive"></a>

## 画面幅で切り替える

指定なしは全画面、`md:` は768px以上、`lg:` は1024px以上に適用します。すべての新しい余白クラスで使えます。

```html
<div id="spacing-responsive-demo" class="space-demo sp-p-2 md:sp-p-6 lg:sp-p-8"><div class="space-demo-item">内側の余白：通常8px → mdで24px → lgで32px</div></div>
```

## 既存クラスとの使い分け

従来の `gap-3` と `px-3` は16px相当のままです。新しい `sp-gap-3` と `sp-px-3` は12px相当です。既存の `fx-gap-*` も変更していません。新しく組む画面ではsp-の系列に統一してください。

余白クラスはコンポーネントの標準値を上書きできるように `!important` を使用しています。HTMLのクラス記述順では優先順位を変更できません。同じ箇所に `sp-p-2 sp-p-6` のような重複指定は避けてください。全方向 → x/y → 各方向の順に具体的な指定が優先され、md・lgはそれぞれ対象幅で通常指定を上書きします。

特殊な値・負の余白・動的な計算が必要な場合は、引き続きstyleや独自CSSを使えます。同じプロパティの余白クラスは外してください。Tailwindの任意値構文（p-[13px]など）には対応していません。

4〜8pxはラベルや小さな要素間、12〜16pxは同じグループ内、24〜32pxは別のグループ間、48pxは大きな領域の区切りに使います。横並びにはcluster、縦並びにはstackを使い、間隔をsp-gap-*で調整できます。内側はsp-p-*、外側はsp-m-*で指定します。

使用ファイル・取り込み方

共通の ui.css と ui.js を読み込み、サンプルのHTMLを配置します。必要な動作は data-ui-* 属性で指定します。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../assets/ui/css/ui.css) / [ui.js](../assets/ui/js/ui.js) / [属性一覧と導入例](../getting-started.html.md)

assetsフォルダごとコピーするとCSS内の相対参照も維持できます。catalog.js、catalog-navigation.js、catalog-demo.js、layout.css はカタログ専用です。data-demo-* はアプリに取り込む際に外し、保存や通信はアプリ側で実装してください。
