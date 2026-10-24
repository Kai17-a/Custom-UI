<!-- Generated from docs/components/input-group.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](input-group.html) · [llms.txt](../../llms.txt)

# Input group

入力欄と接頭辞・接尾辞・ボタン・selectの連結。既存の色・角丸・余白・テーマを引き継ぎます。

<a id="input-group-prefix"></a>

## 接頭辞・接尾辞

ラベルはグループの外に配置します。接頭辞・接尾辞を読み上げに含める場合はaria-describedbyで関連付けてください。

```html
<div class="ui-stack">
  <label for="group-account">ユーザー名</label><div class="ui-input-group"><span class="ui-input-addon" id="group-account-prefix">@</span><input class="form-control" id="group-account" name="account" aria-describedby="group-account-prefix" placeholder="kaito"></div>
  <label for="group-price">金額</label><div class="ui-input-group"><span class="ui-input-addon" id="group-price-prefix">¥</span><input type="number" class="form-control" id="group-price" name="price" min="0" value="1000" aria-describedby="group-price-prefix group-price-suffix"><span class="ui-input-addon" id="group-price-suffix">円</span></div>
</div>
```

<a id="input-group-button"></a>

## ボタン・アイコンとの組み合わせ

既存のbtnやicon属性と組み合わせます。検索などの実際の処理はアプリ側で実装します。

```html
<label for="group-search">プロジェクトを検索</label>
<div class="ui-input-group"><span class="ui-input-addon" aria-hidden="true"><span icon="mdi-magnify"></span></span><input type="search" class="form-control" id="group-search" placeholder="プロジェクト名"><button type="button" class="btn btn-primary" data-ui-toast="検索ボタンが押されました">検索</button></div>
```

<a id="input-group-select"></a>

## selectとの組み合わせ

カスタムselectも共通の見た目で連結できます。

```html
<label for="group-format">書き出す形式</label><div class="ui-input-group"><span class="ui-input-addon" id="group-format-prefix">形式</span><select class="form-select" id="group-format" name="format" aria-describedby="group-format-prefix"><option>JSON</option><option>CSV</option><option>TXT</option></select><button type="button" class="btn btn-outline-secondary" data-ui-toast="書き出しのデモです">書き出す</button></div>
```

<a id="input-group-size"></a>

## 小さなサイズ・スマートフォンで縦並び

小さな入力にはui-input-group-sm、スマートフォンで縦に切り替える場合はui-input-group-stackを付けます。

```html
<div class="ui-stack"><label for="group-small">コード</label><div class="ui-input-group ui-input-group-sm"><span class="ui-input-addon">ID</span><input class="form-control" id="group-small" value="project-001"></div>
<label for="group-stacked">公開URL</label><div class="ui-input-group ui-input-group-stack"><span class="ui-input-addon" id="group-url-prefix">https://</span><input class="form-control" id="group-stacked" aria-describedby="group-url-prefix" value="example.test"><button type="button" class="btn btn-outline-secondary" data-ui-toast="URLを確認しました">確認</button></div></div>
```

使用ファイル・取り込み方

共通の ui.css と ui.js を読み込み、サンプルのHTMLを配置します。必要な動作は data-ui-* 属性で指定します。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../../assets/css/ui.css) / [ui.js](../../assets/js/ui.js) / [属性一覧と導入例](../getting-started.html.md)

assetsフォルダごとコピーするとCSS内の相対参照も維持できます。catalog.js、catalog-navigation.js、catalog-demo.js、layout.css はカタログ専用です。data-demo-* はアプリに取り込む際に外し、保存や通信はアプリ側で実装してください。
