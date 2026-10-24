<!-- Generated from docs/components/avatar.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](avatar.html) · [llms.txt](../llms.txt)

# Avatar

イニシャル・画像・サイズ・ステータス・グループ。既存の色・角丸・余白・テーマを引き継ぎます。

<a id="avatar-basic"></a>

## イニシャル・アイコン

役割を持つアバターにはrole="img"とaria-labelを付けます。隣に同じ名前を表示する場合はアバターをaria-hidden="true"にして重複を避けられます。

```html
<div class="ui-cluster"><span class="ui-avatar" role="img" aria-label="Kaito">KT</span><span class="ui-avatar" role="img" aria-label="ユーザー"><span icon="mdi-account" aria-hidden="true"></span></span><span class="ui-avatar ui-avatar-square" role="img" aria-label="プロジェクト">UI</span></div>
```

<a id="avatar-sizes"></a>

## サイズ

smは24px、標準は40px、lgは56px、xlは72pxです。任意のサイズは--ui-avatar-sizeで指定します。

```html
<div class="ui-cluster"><span class="ui-avatar ui-avatar-sm" role="img" aria-label="Kaito">KT</span><span class="ui-avatar" role="img" aria-label="Kaito">KT</span><span class="ui-avatar ui-avatar-lg" role="img" aria-label="Kaito">KT</span><span class="ui-avatar ui-avatar-xl" role="img" aria-label="Kaito">KT</span></div>
```

<a id="avatar-status"></a>

## ステータス

状態は色だけで伝えず、aria-labelや隣の文字でも表現してください。

```html
<div class="ui-cluster"><span class="ui-avatar" role="img" aria-label="Kaito、オンライン">KT<span class="ui-avatar-status" aria-hidden="true"></span></span><span class="ui-avatar" role="img" aria-label="Member、オフライン">MB<span class="ui-avatar-status ui-avatar-status-offline" aria-hidden="true"></span></span></div>
```

<a id="avatar-group"></a>

## グループ

アバターをui-avatar-groupに並べると重ねて表示します。リンクとしても使え、キーボードフォーカスが見えるようにしています。

```html
<div class="ui-avatar-group" role="group" aria-label="プロジェクトのメンバー"><a class="ui-avatar" href="forms.html" aria-label="Kaitoのプロフィール">KT</a><a class="ui-avatar" href="forms.html" aria-label="Memberのプロフィール">MB</a><span class="ui-avatar" role="img" aria-label="ほか3人">+3</span></div>
```

<a id="avatar-image"></a>

## 画像を使う

imgを内側に配置すると円形・角丸に合わせて切り抜きます。画像には適切なaltを指定します。読み込み失敗時はブラウザのalt表示となるため、必要ならアプリ側でイニシャルへ切り替えてください。

```html
<span class="ui-avatar ui-avatar-lg">
  <img src="assets/profile.jpg" alt="Kaito" width="56" height="56">
</span>
```

使用ファイル・取り込み方

共通の ui.css と ui.js を読み込み、サンプルのHTMLを配置します。必要な動作は data-ui-* 属性で指定します。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../assets/ui/css/ui.css) / [ui.js](../assets/ui/js/ui.js) / [属性一覧と導入例](../getting-started.html.md)

assetsフォルダごとコピーするとCSS内の相対参照も維持できます。catalog.js、catalog-navigation.js、catalog-demo.js、layout.css はカタログ専用です。data-demo-* はアプリに取り込む際に外し、保存や通信はアプリ側で実装してください。
