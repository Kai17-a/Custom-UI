<!-- Generated from docs/components/badges.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](badges.html) · [llms.txt](../llms.txt)

# Badges

ステータスとラベル。下の「HTMLを表示」からマークアップをコピーできます。

## 状態とタグ

状態の色は意味で決め、画面をまたいで同じ色を使います。進行中・処理中・準備中は `badge-neutral`、確認待ち・レビューは `text-bg-warning`、完了は `text-bg-success`、エラーは `text-bg-danger` です。分類やタグには、枠付きのピル型を使います。

```html
<div class="ui-cluster">
    <span class="badge badge-neutral">進行中</span>
    <span class="badge text-bg-warning">確認待ち</span>
    <span class="badge text-bg-success">完了</span>
    <span class="badge text-bg-danger">エラー</span>
    <span class="badge badge-neutral rounded-pill fw-normal border">デザイン</span>
    <span class="small">更新：10月22日</span>
  </div>
```

使用ファイル・取り込み方

共通の ui.css と ui.js を読み込み、サンプルのHTMLを配置します。必要な動作は data-ui-* 属性で指定します。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../assets/ui/css/ui.css) / [ui.js](../assets/ui/js/ui.js) / [属性一覧と導入例](../getting-started.html.md)

assetsフォルダごとコピーするとCSS内の相対参照も維持できます。catalog.js、catalog-navigation.js、catalog-demo.js、layout.css はカタログ専用です。data-demo-* はアプリに取り込む際に外し、保存や通信はアプリ側で実装してください。
