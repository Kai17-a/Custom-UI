<!-- Generated from docs/components/badges.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](badges.html) · [llms.txt](../../llms.txt)

# Badges

ステータスとラベル。下の「HTMLを表示」からマークアップをコピーできます。

## Badges / chips

```html
<div class="row">
    <span class="badge badge-neutral rounded-pill fw-normal border">chip</span>
    <span class="badge text-bg-danger">danger</span>
    <span class="badge text-bg-success">success</span>
    <span class="badge text-bg-warning">warning</span>
    <span class="badge bg-danger">bg-danger</span>
    <span class="small">small dim text</span>
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
