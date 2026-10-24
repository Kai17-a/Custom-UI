<!-- Generated from docs/components/animations-processing.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](animations-processing.html) · [llms.txt](../../llms.txt)

Animations

/

処理中の表示

# Animations · 処理中の表示

処理中のバナーと、カードの枠を光が巡るアニメーションです。

## パルスと光の流れ（バナー）

```html
<div class="planning-wrap">
    <div class="planning-banner" role="status">
      <div class="planning-banner-head"><span>Planning with Claude</span><span class="planning-banner-time dim small">3 min</span></div>
      <div class="planning-banner-goal">Decide the tool of the chat from the question.</div>
    </div>
  </div>
```

## 光が巡るリング（タスクカード）

```html
<div class="demo-grid">
    <div class="task-card is-running"><div class="title">Fix the failing tests</div><div class="where">~/workspaces/agenttop</div></div>
    <div class="task-card is-good"><div class="title">Add the docs</div><div class="where">done</div></div>
  </div>
```

使用ファイル・取り込み方

共通の ui.css と ui.js を読み込み、サンプルのHTMLを配置します。必要な動作は data-ui-* 属性で指定します。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../../assets/css/ui.css) / [ui.js](../../assets/js/ui.js) / [属性一覧と導入例](../getting-started.html.md)

assetsフォルダごとコピーするとCSS内の相対参照も維持できます。catalog.js、catalog-navigation.js、catalog-demo.js、layout.css はカタログ専用です。data-demo-* はアプリに取り込む際に外し、保存や通信はアプリ側で実装してください。
