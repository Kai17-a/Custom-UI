# Custom-UI / Kav-UI

npm・ビルド不要のHTML/CSS/JavaScript UIフレームワークです。デザインカタログは`index.html`、導入例は`getting-started.html`で確認できます。

## ZIPからアプリへ取り込む

GitHub Releasesから`kav-ui-vX.Y.Z.zip`をダウンロードし、展開した`kav-ui/assets`フォルダをアプリへコピーします。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>

<button class="btn btn-primary" data-ui-toast="保存しました">通知を表示</button>
```

`ui.css`は内部で複数のCSSを読み込むため、`assets/css`のフォルダ構成を保ってください。ZIPには次のファイルが入ります。

```text
kav-ui/
  assets/
    css/ui.css          # 参照先のCSSも同じ構成で同梱
    css/components/...
    js/ui.js
    js/theme-init.js     # 任意：CSSより前に保存済みテーマを復元
    vendor/material-color-utilities/ # HCTのライセンスとクレジット
    icons/mdi/LICENSE
    icons/mdi/Apache-2.0.txt
    icons/mdi/README.md
  README.md
  VERSION
```

カタログ・テンプレート専用のCSS/JS、開発用スクリプト、テストはZIPに含めません。MDIのSVGパスとMaterial Color UtilitiesのHCT処理は`ui.js`に埋め込んでいます。再配布するときは同梱のライセンスとクレジットも保持してください。

同じReleaseの`kav-ui-vX.Y.Z.zip.sha256`でZIPを検証できます。両方を同じフォルダへ保存して実行します。

```bash
sha256sum --check kav-ui-vX.Y.Z.zip.sha256
```

## ユーザーが自分の配色を指定する

`data-ui-palette-editor`のフォームで基準色と彩度を選べます。HTML例と保存方法は`components/color-palettes.html#palette-custom`に掲載しています。

```javascript
KavUI.setCustomPalette('#7d6b91', {chroma: 24, persist: true});
```

彩度は0〜32の整数に制限し、Material HCTでライト・ダークの色を生成します。保存を先に復元する場合は、CSSより前に`<script src="assets/js/theme-init.js"></script>`を置き、bodyに`data-ui-theme-persist`を指定してください。このheadスクリプトは任意で、配色フォームとAPIはui.css / ui.jsだけでも動きます。

## GitHub Actionsによる配布

ここからの公開・検証手順は、ソースリポジトリをcloneした開発者向けです。

`.github/workflows/release.yml`は、`v1.0.0`のようなバージョンタグのプッシュで動きます。通常のブランチへのpushでは実行しません。

公開する際は、ワークフロー・配布スクリプト・テストを含むコミットにタグを付けてpushします。

```bash
git tag -a v1.0.0 -m "Kav-UI v1.0.0"
git push origin v1.0.0
```

処理の流れは、配布テスト → ZIPとSHA-256の作成 → Draft Releaseへの添付 → Release公開です。既存タグのコードをチェックアウトするため、既定ブランチの最新コードが混入することはありません。npmや追加のSecrets登録は不要で、Actionsの`GITHUB_TOKEN`に`contents: write`を付与します。

- `v1.0.0-rc.1`などのタグはプレリリースとして公開します。
- Actionsの「Release Kav-UI」→「Run workflow」でも、既存タグを指定して実行できます。この操作はReleaseの公開まで行います。
- 途中で失敗した場合は、同じタグのDraft Releaseから再開できます。Draft内の同名ZIP・SHA-256を再アップロードして公開します。
- 公開済みの同一タグは上書きせず停止します。変更を配布するときは新しいバージョンタグを使ってください。
- タグの自動作成は行いません。手動実行にも、配布スクリプトを含む既存タグが必要です。

リリース手順は[GitHub CLIのRelease仕様](https://cli.github.com/manual/gh_release_create)に合わせ、アセットを添付してから公開する構成です。

## ローカルで配布内容を検証する

Python標準ライブラリだけで実行できます。以下はGitHubへの通信・公開を行いません。

```bash
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests -p 'test_release_*.py'
python3 scripts/build-release.py --version v1.0.0 --output dist
```

`dist/`はGitの管理対象外です。ブラウザでのUIテストは`tests/ui.html`、インストール済みChromiumを使う検証は`node tests/run-browser.mjs`です。

## Vue・Astro向けパッケージ

既存のHTML/ZIP版に加えて、`@kav-ui/core`・`@kav-ui/vue`・`@kav-ui/astro` をローカルtarballとして生成できます。Vueのprops・スロット・v-model、Astroの静的出力とクライアント遷移に対応しています。

[導入・対応範囲・検証手順](packages/README.md) / [Vueの例](examples/vue) / [AstroとVue連携の例](examples/astro)

```bash
npm ci
npm run build:packages
npm run pack:packages
```

パッケージ開発時のみNode/npmを使用します。HTML版の利用手順とZIP配布は変わりません。npmレジストリには未公開です。
