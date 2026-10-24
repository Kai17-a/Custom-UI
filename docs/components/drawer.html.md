<!-- Generated from docs/components/drawer.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](drawer.html) · [llms.txt](../llms.txt)

# Drawer

左右上下のサイドパネル・背景スクロール停止・フォーカス復帰。既存の色・角丸・余白・テーマを引き継ぎます。

<a id="drawer-end-example"></a>

## 右から開く

`dialog.ui-dialog.ui-drawer`に位置のクラスを追加します。start・endは文字方向に応じて左右が入れ替わります。

```html
<button type="button" class="btn btn-outline-secondary" data-ui-toggle="dialog" data-ui-target="#drawer-end">右から開く</button>
<dialog id="drawer-end" class="ui-dialog ui-drawer ui-drawer-end" data-ui-dialog aria-labelledby="drawer-end-title">
  <header class="ui-drawer-header"><h2 id="drawer-end-title">プロジェクトの設定</h2><button type="button" class="btn btn-outline-secondary btn-icon-only" data-ui-dismiss="dialog" aria-label="閉じる"><span icon="mdi-close" aria-hidden="true"></span></button></header>
  <div class="ui-drawer-body"><div class="ui-stack"><p>画面の端から設定パネルを開きます。背景の操作は停止し、このパネル内で操作できます。</p><label for="drawer-end-name">プロジェクト名</label><input class="form-control" id="drawer-end-name" value="Design catalog"><label for="drawer-end-scope">公開範囲</label><select class="form-select" id="drawer-end-scope"><option>自分のみ</option><option>チーム</option></select><p>内容が長い場合は、この領域をスクロールできます。</p></div></div>
  <footer class="ui-drawer-footer"><button type="button" class="btn btn-primary" data-ui-dismiss="dialog">閉じる</button></footer>
</dialog>
```

<a id="drawer-start-example"></a>

## 左から開く

```html
<button type="button" class="btn btn-outline-secondary" data-ui-toggle="dialog" data-ui-target="#drawer-start">左から開く</button>
<dialog id="drawer-start" class="ui-dialog ui-drawer ui-drawer-start" data-ui-dialog aria-labelledby="drawer-start-title">
  <header class="ui-drawer-header"><h2 id="drawer-start-title">プロジェクトの設定</h2><button type="button" class="btn btn-outline-secondary btn-icon-only" data-ui-dismiss="dialog" aria-label="閉じる"><span icon="mdi-close" aria-hidden="true"></span></button></header>
  <div class="ui-drawer-body"><div class="ui-stack"><p>画面の端から設定パネルを開きます。背景の操作は停止し、このパネル内で操作できます。</p><label for="drawer-start-name">プロジェクト名</label><input class="form-control" id="drawer-start-name" value="Design catalog"><label for="drawer-start-scope">公開範囲</label><select class="form-select" id="drawer-start-scope"><option>自分のみ</option><option>チーム</option></select><p>内容が長い場合は、この領域をスクロールできます。</p></div></div>
  <footer class="ui-drawer-footer"><button type="button" class="btn btn-primary" data-ui-dismiss="dialog">閉じる</button></footer>
</dialog>
```

<a id="drawer-bottom-example"></a>

## 下から開く

```html
<button type="button" class="btn btn-outline-secondary" data-ui-toggle="dialog" data-ui-target="#drawer-bottom">下から開く</button>
<dialog id="drawer-bottom" class="ui-dialog ui-drawer ui-drawer-bottom" data-ui-dialog aria-labelledby="drawer-bottom-title">
  <header class="ui-drawer-header"><h2 id="drawer-bottom-title">プロジェクトの設定</h2><button type="button" class="btn btn-outline-secondary btn-icon-only" data-ui-dismiss="dialog" aria-label="閉じる"><span icon="mdi-close" aria-hidden="true"></span></button></header>
  <div class="ui-drawer-body"><div class="ui-stack"><p>画面の端から設定パネルを開きます。背景の操作は停止し、このパネル内で操作できます。</p><label for="drawer-bottom-name">プロジェクト名</label><input class="form-control" id="drawer-bottom-name" value="Design catalog"><label for="drawer-bottom-scope">公開範囲</label><select class="form-select" id="drawer-bottom-scope"><option>自分のみ</option><option>チーム</option></select><p>内容が長い場合は、この領域をスクロールできます。</p></div></div>
  <footer class="ui-drawer-footer"><button type="button" class="btn btn-primary" data-ui-dismiss="dialog">閉じる</button></footer>
</dialog>
```

<a id="drawer-top-example"></a>

## 上から開く

```html
<button type="button" class="btn btn-outline-secondary" data-ui-toggle="dialog" data-ui-target="#drawer-top">上から開く</button>
<dialog id="drawer-top" class="ui-dialog ui-drawer ui-drawer-top" data-ui-dialog aria-labelledby="drawer-top-title">
  <header class="ui-drawer-header"><h2 id="drawer-top-title">プロジェクトの設定</h2><button type="button" class="btn btn-outline-secondary btn-icon-only" data-ui-dismiss="dialog" aria-label="閉じる"><span icon="mdi-close" aria-hidden="true"></span></button></header>
  <div class="ui-drawer-body"><div class="ui-stack"><p>画面の端から設定パネルを開きます。背景の操作は停止し、このパネル内で操作できます。</p><label for="drawer-top-name">プロジェクト名</label><input class="form-control" id="drawer-top-name" value="Design catalog"><label for="drawer-top-scope">公開範囲</label><select class="form-select" id="drawer-top-scope"><option>自分のみ</option><option>チーム</option></select><p>内容が長い場合は、この領域をスクロールできます。</p></div></div>
  <footer class="ui-drawer-footer"><button type="button" class="btn btn-primary" data-ui-dismiss="dialog">閉じる</button></footer>
</dialog>
```

<a id="drawer-accessibility"></a>

## 操作・幅・高さ

既存Dialogと同じdata-ui-toggle="dialog"／data-ui-dismiss="dialog"、KavUI.show／hideを使います。Escape・背景クリックで閉じ、開いたボタンへフォーカスを戻します。開いている間は背景スクロールを止めます。内容にはui-drawer-bodyを使ってください。幅は--ui-drawer-width（標準24rem）、上下の高さは--ui-drawer-height（標準20rem）で調整できます。画面を超えません。

```
#drawer-end { --ui-drawer-width: 28rem; }
#drawer-bottom { --ui-drawer-height: 24rem; }
```

使用ファイル・取り込み方

共通の ui.css と ui.js を読み込み、サンプルのHTMLを配置します。必要な動作は data-ui-* 属性で指定します。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../../assets/css/ui.css) / [ui.js](../../assets/js/ui.js) / [属性一覧と導入例](../getting-started.html.md)

assetsフォルダごとコピーするとCSS内の相対参照も維持できます。catalog.js、catalog-navigation.js、catalog-demo.js、layout.css はカタログ専用です。data-demo-* はアプリに取り込む際に外し、保存や通信はアプリ側で実装してください。
