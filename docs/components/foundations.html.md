<!-- Generated from docs/components/foundations.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](foundations.html) · [llms.txt](../llms.txt)

# Foundations

元のカタログの配色を共通トークンとして使用しています。テーマ切替で両方の配色を確認できます。

詳しいサンプル：[文字・行間](typography.html.md) / [スペース・余白](spacing.html.md)

## カラー

```html
<div class="swatches"><div><div class="swatch-color" style="background:var(--bs-body-bg)"></div><strong>body-bg</strong><div class="token">--bs-body-bg</div></div><div><div class="swatch-color" style="background:var(--bs-body-color)"></div><strong>body-color</strong><div class="token">--bs-body-color</div></div><div><div class="swatch-color" style="background:var(--bs-primary)"></div><strong>primary</strong><div class="token">--bs-primary</div></div><div><div class="swatch-color" style="background:var(--bs-success)"></div><strong>success</strong><div class="token">--bs-success</div></div><div><div class="swatch-color" style="background:var(--bs-danger)"></div><strong>danger</strong><div class="token">--bs-danger</div></div><div><div class="swatch-color" style="background:var(--bs-warning)"></div><strong>warning</strong><div class="token">--bs-warning</div></div><div><div class="swatch-color" style="background:var(--bs-info)"></div><strong>info</strong><div class="token">--bs-info</div></div><div><div class="swatch-color" style="background:var(--bs-border-color)"></div><strong>border-color</strong><div class="token">--bs-border-color</div></div></div>
```

## タイポグラフィ

```html
<h2>プロジェクトの概要</h2><p>アプリの基本となる本文です。システムフォントを使用し、追加のフォント読み込みは不要です。</p><p class="dim small">補足・更新日時・メタデータ</p><code>const project = "Kav-UI";</code>
```

## 余白

```html
<div class="spacing-row"><span>4px / 0.25rem</span><div class="spacing-bar" style="width:4px"></div></div><div class="spacing-row"><span>8px / 0.5rem</span><div class="spacing-bar" style="width:8px"></div></div><div class="spacing-row"><span>12px / 0.75rem</span><div class="spacing-bar" style="width:12px"></div></div><div class="spacing-row"><span>16px / 1rem</span><div class="spacing-bar" style="width:16px"></div></div><div class="spacing-row"><span>24px / 1.5rem</span><div class="spacing-bar" style="width:24px"></div></div><div class="spacing-row"><span>32px / 2rem</span><div class="spacing-bar" style="width:32px"></div></div>
```

使用ファイル・取り込み方

共通の ui.css と ui.js を読み込み、サンプルのHTMLを配置します。必要な動作は data-ui-* 属性で指定します。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../../assets/css/ui.css) / [ui.js](../../assets/js/ui.js) / [属性一覧と導入例](../getting-started.html.md)

assetsフォルダごとコピーするとCSS内の相対参照も維持できます。catalog.js、catalog-navigation.js、catalog-demo.js、layout.css はカタログ専用です。data-demo-* はアプリに取り込む際に外し、保存や通信はアプリ側で実装してください。
