<!-- Generated from docs/components/disclosure.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](disclosure.html) · [llms.txt](../../llms.txt)

# Accordion

補足情報を段階的に表示します。ネイティブの details / summary を使用しています。

## アコーディオン

```html
<div class="accordion"><details open><summary>アプリへの取り込み方</summary><p>HTMLをコピーし、共通トークンと対象コンポーネントのCSSを読み込んでください。</p></details><details><summary>npmやサーバーは必要ですか？</summary><p>不要です。HTMLファイルを直接ブラウザで開けます。</p></details><details><summary>ダークモードに対応していますか？</summary><p>html要素の data-bs-theme を dark にすると、共通トークンが切り替わります。</p></details></div>
```

使用ファイル・取り込み方

共通の ui.css と ui.js を読み込み、サンプルのHTMLを配置します。必要な動作は data-ui-* 属性で指定します。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../../assets/css/ui.css) / [ui.js](../../assets/js/ui.js) / [属性一覧と導入例](../getting-started.html.md)

assetsフォルダごとコピーするとCSS内の相対参照も維持できます。catalog.js、catalog-navigation.js、catalog-demo.js、layout.css はカタログ専用です。data-demo-* はアプリに取り込む際に外し、保存や通信はアプリ側で実装してください。
