<!-- Generated from docs/components/button-group.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](button-group.html) · [llms.txt](../llms.txt)

# Button group

ボタンの連結・縦並び・radio／checkboxの選択。既存の色・角丸・余白・テーマを引き継ぎます。

<a id="button-group-basic"></a>

## 横並びの操作

ui-button-groupでボタンを連結します。role="group"とaria-labelで、どの操作の集まりか伝えます。

```html
<div class="ui-button-group" role="group" aria-label="プロジェクト操作"><button type="button" class="btn btn-outline-secondary" data-ui-toast="作成のデモです">作成</button><button type="button" class="btn btn-outline-secondary" data-ui-toast="編集のデモです">編集</button><button type="button" class="btn btn-outline-secondary" disabled>削除</button></div>
```

<a id="button-group-radio"></a>

## ラジオで単一選択

見た目だけを連結し、選択状態はHTML標準のradioで管理します。矢印キーで選択でき、フォームの値にも反映されます。

```html
<form><div class="ui-button-group" role="group" aria-label="表示期間"><label class="btn btn-outline-secondary"><input type="radio" name="period" value="day" class="visually-hidden" checked>日</label><label class="btn btn-outline-secondary"><input type="radio" name="period" value="week" class="visually-hidden">週</label><label class="btn btn-outline-secondary"><input type="radio" name="period" value="month" class="visually-hidden">月</label></div></form>
```

<a id="button-group-checkbox"></a>

## チェックボックスで複数選択

複数選択にはcheckboxを使います。文字はlabel内に置き、アイコンのみの場合はinputのaria-labelを指定してください。

```html
<div class="ui-button-group" role="group" aria-label="文字の装飾"><label class="btn btn-outline-secondary"><input type="checkbox" name="bold" class="visually-hidden">太字</label><label class="btn btn-outline-secondary"><input type="checkbox" name="italic" class="visually-hidden">斜体</label><label class="btn btn-outline-secondary"><input type="checkbox" name="underline" class="visually-hidden">下線</label></div>
```

<a id="button-group-vertical"></a>

## 縦並び・既存ボタンとの組み合わせ

ui-button-group-verticalを追加すると縦に連結します。通常のbtn-sm、アウトライン、icon属性も使用できます。状態の操作はnative inputまたはアプリ側で行います。

```html
<div class="ui-button-group ui-button-group-vertical" role="group" aria-label="ファイル操作"><button type="button" class="btn btn-sm btn-outline-secondary" data-ui-toast="保存のデモです"><span icon="mdi-content-save" aria-hidden="true"></span>保存</button><button type="button" class="btn btn-sm btn-outline-secondary" data-ui-toast="コピーのデモです"><span icon="mdi-content-copy" aria-hidden="true"></span>コピー</button></div>
```

使用ファイル・取り込み方

共通の ui.css と ui.js を読み込み、サンプルのHTMLを配置します。必要な動作は data-ui-* 属性で指定します。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../../assets/css/ui.css) / [ui.js](../../assets/js/ui.js) / [属性一覧と導入例](../getting-started.html.md)

assetsフォルダごとコピーするとCSS内の相対参照も維持できます。catalog.js、catalog-navigation.js、catalog-demo.js、layout.css はカタログ専用です。data-demo-* はアプリに取り込む際に外し、保存や通信はアプリ側で実装してください。
