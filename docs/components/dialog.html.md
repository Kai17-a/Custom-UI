<!-- Generated from docs/components/dialog.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](dialog.html) · [llms.txt](../../llms.txt)

# Dialog

確認・入力ダイアログ。下の「HTMLを表示」からマークアップをコピーできます。

## ダイアログ：開閉・入力検証

```html
<button type="button" class="btn btn-sm btn-primary" data-ui-toggle="dialog" data-ui-target="#project-dialog">プロジェクトの確認を開く</button>
<dialog class="ui-dialog" data-ui-dialog id="project-dialog" aria-label="プロジェクトの確認">
  <h2>プロジェクトの確認</h2>
  <p>requiredなどの標準HTML属性と data-ui-validate で入力を検証します。</p>
  <form method="dialog" data-ui-validate novalidate>
    <div class="field" data-ui-field><label>名前（必須）<input class="form-control" name="name" required maxlength="80"></label><small class="ui-invalid-feedback" data-ui-error hidden></small></div>
    <div class="buttons" style="grid-column:1 / -1"><button type="button" class="btn btn-sm btn-outline-secondary" data-ui-dismiss="dialog">キャンセル</button><button type="submit" class="btn btn-sm btn-primary">確認して閉じる</button></div>
  </form>
</dialog>
```

使用ファイル・取り込み方

共通の ui.css と ui.js を読み込み、サンプルのHTMLを配置します。必要な動作は data-ui-* 属性で指定します。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../../assets/css/ui.css) / [ui.js](../../assets/js/ui.js) / [属性一覧と導入例](../getting-started.html.md)

assetsフォルダごとコピーするとCSS内の相対参照も維持できます。catalog.js、catalog-navigation.js、catalog-demo.js、layout.css はカタログ専用です。data-demo-* はアプリに取り込む際に外し、保存や通信はアプリ側で実装してください。

## 同じページに複数配置

```html
<button type="button" class="btn btn-sm btn-primary" data-ui-toggle="dialog" data-ui-target="#second-dialog">別のダイアログを開く</button>
<dialog class="ui-dialog" data-ui-dialog id="second-dialog" aria-label="別のダイアログ">
  <h2>別のダイアログ</h2>
  <p>requiredなどの標準HTML属性と data-ui-validate で入力を検証します。</p>
  <form method="dialog" data-ui-validate novalidate>
    <div class="field" data-ui-field><label>名前（必須）<input class="form-control" name="name" required maxlength="80"></label><small class="ui-invalid-feedback" data-ui-error hidden></small></div>
    <div class="buttons" style="grid-column:1 / -1"><button type="button" class="btn btn-sm btn-outline-secondary" data-ui-dismiss="dialog">キャンセル</button><button type="submit" class="btn btn-sm btn-primary">確認して閉じる</button></div>
  </form>
</dialog>
```
