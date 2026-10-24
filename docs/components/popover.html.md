<!-- Generated from docs/components/popover.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](popover.html) · [llms.txt](../llms.txt)

# Popover

操作を含む補足パネル・フォーム・画面端補正。既存の色・角丸・余白・テーマを引き継ぎます。

<a id="popover-basic"></a>

## 説明と操作をまとめる

Tooltipと異なり、リンクやボタンなどの操作を配置できます。画面外クリックとEscapeで閉じます。モーダルではないため、背後の画面も操作できます。

```html
<button type="button" class="btn btn-outline-secondary" data-ui-toggle="popover" data-ui-target="#popover-project">プロジェクトの情報</button>
<div id="popover-project" data-ui-popover popover aria-labelledby="popover-project-title">
  <h3 class="ui-popup-title" id="popover-project-title">デザインカタログ</h3>
  <p>共通UIの設定と使い方を確認できます。</p>
  <a href="../getting-started.html">導入手順を見る</a>
  <div class="ui-popup-actions"><button type="button" class="btn btn-outline-secondary" data-ui-dismiss="popover">閉じる</button></div>
</div>
```

<a id="popover-form"></a>

## フォームを配置する

通常のフォームやカスタムselectを内側に配置できます。内容の送信・保存はアプリ側で実装します。下のフォームは入力確認のみのデモです。

```html
<button type="button" class="btn btn-outline-secondary" data-ui-toggle="popover" data-ui-target="#popover-form-panel" data-ui-placement="bottom-end">表示設定</button>
<div id="popover-form-panel" data-ui-popover popover aria-labelledby="popover-form-title">
  <h3 class="ui-popup-title" id="popover-form-title">表示設定</h3>
  <form class="ui-stack" data-ui-validate data-demo-form>
    <label for="popover-project-name">プロジェクト名</label><input class="form-control" id="popover-project-name" name="name" value="Design catalog" required autofocus>
    <label for="popover-view">表示方法</label><select class="form-select" id="popover-view" name="view"><option>一覧</option><option>カード</option></select>
    <div class="ui-popup-actions"><button type="submit" class="btn btn-primary">入力を確認</button><button type="button" class="btn btn-outline-secondary" data-ui-dismiss="popover">閉じる</button></div><p data-demo-result role="status"></p>
  </form>
</div>
```

<a id="popover-position"></a>

## 位置と幅

Dropdownと同じ4方向のdata-ui-placementを使えます。幅はCSS変数`--ui-popover-width`（標準20rem）で調整できます。表示幅を超える内容はパネル内で折り返し・スクロールします。

```
/* 必要に応じてアプリのCSSで指定 */
#popover-project { --ui-popover-width: 24rem; }
```

<a id="popover-usage"></a>

## 使い分け・初期化

単なる短い補足はTooltip、選択肢はDropdown、自由な内容はPopover、背景操作も止める場合はDialog・Drawerを使います。Popover API対応ブラウザで動作します。共通ui.jsを読み込むだけで初期化し、動的追加時はKavUI.init(element)を呼びます。

```
KavUI.show('#popover-project', document.querySelector('[data-ui-target="#popover-project"]'));
KavUI.hide('#popover-project');
```

使用ファイル・取り込み方

共通の ui.css と ui.js を読み込み、サンプルのHTMLを配置します。必要な動作は data-ui-* 属性で指定します。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../assets/ui/css/ui.css) / [ui.js](../assets/ui/js/ui.js) / [属性一覧と導入例](../getting-started.html.md)

assetsフォルダごとコピーするとCSS内の相対参照も維持できます。catalog.js、catalog-navigation.js、catalog-demo.js、layout.css はカタログ専用です。data-demo-* はアプリに取り込む際に外し、保存や通信はアプリ側で実装してください。
