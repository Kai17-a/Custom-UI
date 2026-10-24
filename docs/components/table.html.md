<!-- Generated from docs/components/table.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](table.html) · [llms.txt](../llms.txt)

# Table

静的な一覧表示です。下の「HTMLを表示」からマークアップをコピーできます。検索・ソート・ページ送り・行選択が必要な場合は、[Data table](data-table.html.md)を使用してください。

## Table

```html
<div class="ui-table-scroll" tabindex="0" role="region" aria-label="タスク一覧（横スクロール可能）">
  <table class="table table-sm table-hover" style="max-width:40rem;">
    <thead><tr><th>id</th><th>status</th><th>title</th></tr></thead>
    <tbody>
      <tr><td>1008a</td><td><span class="badge text-bg-success">done</span></td><td>Fix the tests</td></tr>
      <tr><td>1008b</td><td><span class="badge text-bg-warning">review</span></td><td>Add the docs</td></tr>
    </tbody>
  </table>
</div>
```

横に長い表は`ui-table-scroll`で囲みます。タッチ操作、または領域へTabで移動して矢印キーで横スクロールできます。

使用ファイル・取り込み方

共通の ui.css と ui.js を読み込み、サンプルのHTMLを配置します。必要な動作は data-ui-* 属性で指定します。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../assets/ui/css/ui.css) / [ui.js](../assets/ui/js/ui.js) / [属性一覧と導入例](../getting-started.html.md)

assetsフォルダごとコピーするとCSS内の相対参照も維持できます。catalog.js、catalog-navigation.js、catalog-demo.js、layout.css はカタログ専用です。data-demo-* はアプリに取り込む際に外し、保存や通信はアプリ側で実装してください。
