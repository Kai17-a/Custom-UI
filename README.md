# Custom-UI / Kav-UI

npm・ビルド不要のHTML/CSS/JavaScript UIフレームワークです。デザインカタログは`docs/index.html`、ダウンロードから導入までの手順は[導入ガイド](docs/installation.html)、属性と導入例は[Getting started](docs/getting-started.html)で確認できます。ルートの`index.html`からもカタログを開けます。


## AIエージェントで使う

[AIエージェント用ガイド](docs/ai-agents.html)から、[Kav-UIスキル](skills/kav-ui/SKILL.md)と[llms.txt](llms.txt)を参照できます。スキルは`skills/kav-ui`を参照資料ごと利用先へコピーして使います。個人のエージェント設定は自動変更しません。

`llms.txt`は導入・用途別コンポーネントへの入口です。リンク先の`docs/**/*.html.md`にはHTML本文とサンプルだけをまとめています。編集元のHTMLを更新したら、次で再生成します。

```bash
python3 scripts/generate-ai-docs.py
python3 scripts/generate-ai-docs.py --check
```

形式の参考は[Agent Skills](https://agentskills.io/specification)と[llms.txt](https://llmstxt.org/)です。

## リポジトリの構成

```text
assets/              # 配布用UIの正本。アプリはこのCSS・JSを読み込む
  css/components/    # コンポーネントのスタイル
  js/                # ui.jsと任意のtheme-init.js
  icons/mdi/         # 同梱SVGとライセンス
  vendor/            # 配布物に必要な外部コードのクレジット
docs/               # カタログ・導入ガイド・HTMLテンプレート
  assets/            # カタログとテンプレート専用のCSS・JS・画像
  components/        # コンポーネントの説明と操作サンプル
  templates/         # サービス画面のHTMLテンプレート
packages/            # core・Vue・Astroのパッケージと公開API
examples/            # Vue・Astroでの利用例
skills/kav-ui/       # 利用先へコピーできるAIエージェント用スキル
llms.txt             # AI向けの資料一覧
scripts/             # 梱包・リリース・保守・AI資料生成のスクリプト
tests/              # ブラウザ・パッケージ・配布検証
vendor/              # バンドル元となる外部ソースと出典
index.html           # docs/index.htmlへの入口
```

`assets/`にはカタログ専用のファイルを置きません。新しいコンポーネントの共通スタイルは`assets/css/components/`へ、使い方やサンプルは`docs/components/`へ追加します。`packages/core/dist/`・`dist/`・導入例のビルド結果は生成物で、編集元にしません。

`docs/index.html`はブラウザで直接開けます。HTTPで確認する場合はリポジトリのルートで次を実行し、`http://localhost:8000/docs/`を開きます。`docs/`は配布用の`../assets/`を参照するため、HTTPサーバーの公開ルートもリポジトリのルートにします。

```bash
python3 -m http.server 8000
```

構成と相対参照の検証は`python3 -m unittest discover -s tests -p 'test_documentation_structure.py'`で実行できます。構成だけを変更するときは、移動前に`node tests/run-visual-comparison.mjs capture /tmp/kav-ui-baseline`、変更後に`node tests/run-visual-comparison.mjs compare /tmp/kav-ui-baseline`を実行すると、同じ162パターンの表示を比較できます。輪郭のごく小さな描画差は別項目で記録し、位置ずれや広範囲の色変化は失敗として検出します。ブラウザの実行ファイルは必要に応じて`CHROME_BIN`で指定します。

ページ内リンクや領域内の移動は、`ui-scroll-smooth`で滑らかにできます。`data-ui-scroll-active`を付けた領域は現在地を自動表示します。[Navigationの使用例](docs/components/navigation.html#nav-smooth-scroll)を参照してください。

[Data table](docs/components/data-table.html)では、HTMLの表に検索・文字/数値/日付ソート・ページ送り・表示件数・行選択を追加できます。ルートに`data-ui-data-table`を指定し、共通CSS/JSで利用します。

## 検索・スライド・時系列・評価

既存のCSS・JSを読み込むだけで利用できる部品を追加しました。

- [Command menu](docs/components/command.html)：検索・項目のグループ化・キーボード選択・任意のショートカット。
- [Carousel](docs/components/carousel.html)：前後移動・インジケーター・スワイプ・任意のループ。自動再生はありません。
- [Timeline](docs/components/timeline.html)：日時・進行状況・アイコン・コンパクト表示。CSSのみで利用できます。
- [Rating](docs/components/rating.html)：radioによる星評価・未評価への解除・サイズ・読み取り専用表示。フォーム送信とresetは標準HTMLの動作です。

各ページにHTML例と属性・イベントの説明、機能を参考にしたOSSの公式ページへのリンクがあります。Vue・Astroでは汎用の`KavWidget`で同じHTMLを利用できます。

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

`data-ui-palette-editor`のフォームで基準色と彩度を選べます。HTML例と保存方法は`docs/components/color-palettes.html#palette-custom`に掲載しています。

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

ライブラリ用のGitHub Releases公開は、HTML版とは別の `release-libraries.yml` を使います。`libraries-v0.1.0` のような専用タグから3つの `.tgz` とSHA-256を配置します。[公開・ダウンロード手順](packages/README.md#github-releasesへのライブラリ公開)を参照してください。
