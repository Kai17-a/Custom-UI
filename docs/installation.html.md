<!-- Generated from docs/installation.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](installation.html) · [llms.txt](llms.txt)

# ダウンロード・導入

CSS・JavaScriptをダウンロードし、アプリのHTMLから読み込むまでの手順です。HTML版はnpmやビルドなしで利用できます。

1. ZIPをダウンロードして展開します。
2. `assets`フォルダをアプリへコピーします。
3. HTMLで`ui.css`と`ui.js`を読み込みます。

<a id="installation-download"></a>

## 1. CSS・JavaScriptをダウンロード

### ソースZIPから入手する

GitHubのソースZIPには、CSS・JavaScriptを含む`assets`フォルダが入っています。次のリンクでmainブランチのZIPをダウンロードできます。

[ソースZIPをダウンロード](https://github.com/Kai17-a/Custom-UI/archive/refs/heads/main.zip) [GitHubを開く](https://github.com/Kai17-a/Custom-UI)

1. ZIPを展開します。
2. 展開した`Custom-UI-main`フォルダを開きます。
3. 中の`assets`フォルダを、次の手順でアプリへコピーします。

ソースZIPはmainブランチの内容です。作業中の未マージの変更は含まれません。GitHub画面から入手する場合は「Code」→「Download ZIP」を選びます。

### Release ZIPが公開されている場合

[GitHub Releases](https://github.com/Kai17-a/Custom-UI/releases)の対象バージョンを開き、「Assets」から`kav-ui-vX.Y.Z.zip`をダウンロードします。展開した`kav-ui/assets`フォルダを使います。`vX.Y.Z`はバージョンの表記例です。

Releaseがまだない場合や、必要なZIPが見つからない場合は、上のソースZIPから導入できます。`libraries-v...`のリリースにある`.tgz`はVue・Astro向けのパッケージです。HTML版は`kav-ui-vX.Y.Z.zip`を選びます。

<a id="installation-files"></a>

## 2. assetsフォルダを配置

アプリの公開ディレクトリへ`assets`フォルダをコピーします。HTMLと同じ階層に置く場合は、次の構成になります。

```
my-app/
  index.html
  assets/
    css/
      ui.css
      tokens.css
      components/...
      ...
    js/
      ui.js
      theme-init.js
    icons/mdi/...
    vendor/material-color-utilities/...
```

`ui.css`は同じフォルダや`components`内のCSSを読み込みます。**cssフォルダは中身と階層を保ったままコピーしてください。**HTMLで指定するCSSは`ui.css`の1つで構いません。

| ファイル | 役割 |
| --- | --- |
| `assets/css/`一式 | 文字・色・余白・全コンポーネントのスタイル |
| `assets/js/ui.js` | モーダル・通知・選択パネルなどの操作。MDIのSVGと配色の処理も同梱 |
| `assets/js/theme-init.js` | 任意。保存したテーマをCSSの読み込み前に復元 |
| `assets/icons/mdi/`・`assets/vendor/` | アイコンや外部コードのライセンス・クレジット。再配布時も保持 |

サーバーを使うアプリでは、ブラウザからアクセスできる公開フォルダへ配置します。既存の`assets`と分けたい場合は、`vendor/kav-ui/assets`などへ置き、読み込み先のパスを合わせてください。

<a id="installation-load"></a>

## 3. HTMLから読み込む

次のHTMLを`index.html`として保存してください。`ui.css`で見た目を読み込み、`defer`付きの`ui.js`でHTMLの準備後に操作を初期化します。通常は自分で`KavUI.init()`を呼ぶ必要はありません。

HTMLをコピー

```html
<!doctype html>
<html lang="ja" data-bs-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Kav-UIを使う</title>
  <link rel="stylesheet" href="assets/css/ui.css">
  <script defer src="assets/js/ui.js"></script>
</head>
<body>
  <main class="ui-container sp-py-6">
    <h1 class="type-title">Kav-UIを使う</h1>
    <p>classとdata属性で使えるUIフレームワークです。</p>
    <button type="button" class="btn btn-primary"
      data-ui-toast="CSSとJavaScriptを読み込めました。">
      通知を表示
    </button>
  </main>
</body>
</html>
```

classで見た目を、`data-ui-*`属性で操作を指定します。CSSのみで使える文字・余白・カードなどは、JavaScriptを読み込まなくても表示できます。[属性一覧とコンポーネントの使い方](getting-started.html.md)も参照してください。

<a id="installation-check"></a>

## 4. 表示と動作を確認

1. 作成した`index.html`をブラウザで開きます。
2. 余白や文字・ボタンのデザインが反映されていることを確認します。
3. 「通知を表示」を押して、トーストが表示されれば読み込み完了です。

[コンポーネントを探す](index.html.md)

各コンポーネントページの「HTMLを表示」から必要なHTMLをコピーできます。アプリでは`data-demo-*`属性を外し、保存・送信・ページ遷移などの処理を接続してください。

<a id="installation-theme"></a>

## 保存済みテーマを初回表示から適用する

テーマを保存して使う場合は、`theme-init.js`をCSSより前に読み込み、`body`に`data-ui-theme-persist`を付けます。このスクリプトは同期で動くため、`defer`を付けずに配置します。

```html
<head>
  <!-- metaなどの設定 -->
  <script src="assets/js/theme-init.js"></script>
  <link rel="stylesheet" href="assets/css/ui.css">
  <script defer src="assets/js/ui.js"></script>
</head>
<body data-ui-theme-persist>
  <!-- アプリの内容 -->
</body>
```

[ライト・ダーク・システムの切り替え](components/theme-switcher.html.md)、[ガラスなどのデザインテーマ](components/themes.html.md)、[配色の選択](components/color-palettes.html.md)を組み合わせられます。

<a id="installation-troubleshooting"></a>

## 表示・操作が反映されない場合

特定の開くボタンだけ反応しない場合は、data-ui-targetが指すIDの存在と重複を確認してください。開発者ツールで`document.querySelector(ボタンのdata-ui-targetの値)`が対象要素を返すか確認できます。フレームワークは存在しない対象を開きません。

標準のHTMLの見た目になる

`ui.css`のパスと、参照されるCSS一式が揃っているか確認してください。ブラウザの開発者ツールのNetworkで404になっているCSSを確認できます。

ボタンを押しても通知やモーダルが開かない

`ui.js`の読み込み先と`defer`を確認し、各ページの`data-ui-*`属性もコピーしてください。スクリプトの読み込みはページ内で1回にします。

別フォルダのHTMLだけ表示が崩れる

相対パスはHTMLの場所が基準です。例えば`pages/settings.html`から上の構成のCSSを読む場合は`../assets/css/ui.css`を指定します。

サンプルとアプリの動作が違う

カタログ用の`catalog.js`・`catalog-demo.js`・`layout.css`は読み込まず、共通の`ui.css`と`ui.js`を使ってください。サンプルの`data-demo-*`は見本画面専用です。

<a id="installation-update"></a>

## バージョンを更新する

新しいZIPを展開し、使用中のCSS・JSを同じバージョンのファイル一式へ入れ替えます。アプリ独自の変更は別のCSSにまとめておくと、更新時に保ちやすくなります。

Releaseに`kav-ui-vX.Y.Z.zip.sha256`がある場合は、ZIPと同じフォルダへ保存して照合できます。

```
sha256sum --check kav-ui-vX.Y.Z.zip.sha256
```

Vue・Astro向けのパッケージで使う場合は、[パッケージの導入手順](packages/README.md)を参照してください。
