<!-- Generated from docs/components/list-group.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](list-group.html) · [llms.txt](../llms.txt)

# List group

一覧・操作・現在地・件数・チェック付きリスト。既存の色・角丸・余白・テーマを引き継ぎます。

<a id="list-group-basic"></a>

## 内容・件数・アイコン

li.ui-list-itemに内容を並べます。リストの意味はulとrole="list"で維持します。

```html
<ul class="ui-list-group" role="list"><li class="ui-list-item"><span icon="mdi-folder" aria-hidden="true"></span><span class="ui-list-body">プロジェクト</span><span class="badge badge-neutral">12</span></li><li class="ui-list-item"><span icon="mdi-account-group" aria-hidden="true"></span><span class="ui-list-body">メンバー</span><span class="badge badge-neutral">8</span></li><li class="ui-list-item"><span icon="mdi-bell" aria-hidden="true"></span><span class="ui-list-body">通知</span><span class="badge badge-neutral">3</span></li></ul>
```

<a id="list-group-actions"></a>

## リンク・操作・現在地

リンクにはa、操作にはbuttonを使います。現在地はaria-current、無効状態はbuttonのdisabledで指定します。

```html
<nav class="ui-list-group" aria-label="関連するコンポーネント"><a class="ui-list-item" href="list-group.html" aria-current="page">List group</a><a class="ui-list-item" href="avatar.html">Avatar</a><button type="button" class="ui-list-item" disabled>権限が必要な操作</button></nav>
```

<a id="list-group-details"></a>

## 見出し・説明・補足

長い文やファイル名も折り返します。補足が長い場合はui-list-metaを本文に移すか、アプリのレイアウトを調整してください。

```html
<div class="ui-list-group"><a class="ui-list-item" href="cards.html"><span class="ui-list-body"><span class="ui-list-title">デザインカタログの更新</span><span class="ui-list-description">新しいコンポーネントと使用例を確認できます。</span></span><span class="ui-list-meta">今日</span></a><a class="ui-list-item" href="forms.html"><span class="ui-list-body"><span class="ui-list-title">入力内容の確認</span><span class="ui-list-description">フォーム・ファイル入力・日付設定の見本です。</span></span></a></div>
```

<a id="list-group-flush"></a>

## 外枠なし・チェック付き

ui-list-group-flushで外枠を外します。checkboxの値とラベルはHTML標準のまま利用できます。

```html
<div class="ui-list-group ui-list-group-flush" role="group" aria-label="通知の設定"><label class="ui-list-item"><input type="checkbox" class="form-check-input" name="news" checked><span class="ui-list-body">更新情報</span></label><label class="ui-list-item"><input type="checkbox" class="form-check-input" name="reports"><span class="ui-list-body">週次レポート</span></label></div>
```

使用ファイル・取り込み方

共通の ui.css と ui.js を読み込み、サンプルのHTMLを配置します。必要な動作は data-ui-* 属性で指定します。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../assets/ui/css/ui.css) / [ui.js](../assets/ui/js/ui.js) / [属性一覧と導入例](../getting-started.html.md)

assetsフォルダごとコピーするとCSS内の相対参照も維持できます。catalog.js、catalog-navigation.js、catalog-demo.js、layout.css はカタログ専用です。data-demo-* はアプリに取り込む際に外し、保存や通信はアプリ側で実装してください。
