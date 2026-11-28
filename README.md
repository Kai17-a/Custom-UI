# Custom-UI / Kav-UI

npm・ビルド不要のHTML/CSS/JavaScript UIフレームワークです。デザインカタログは[カタログのソース](docs/src/pages/index.astro)、ダウンロードから導入までの手順は[導入ガイド](docs/src/pages/installation.astro)、属性と導入例は[Getting started](docs/src/pages/getting-started.astro)で確認できます。ドキュメントサイトはAstroで静的HTMLを生成し、ブラウザ内でページを切り替えます。


## AIエージェントで使う

[AIエージェント用ガイド](docs/src/pages/ai-agents.astro)から、[Kav-UIスキル](skills/kav-ui/SKILL.md)と、ビルド後の `llms.txt` を参照できます。`skills/kav-ui`をフォルダごとエージェントのスキル配置先へコピーすると、別プロジェクトでも使えます。導入・レイアウト・フォーム・ナビゲーション・通知・データ表示・Vue/Astroの資料を同梱しており、このリポジトリのcloneやドキュメントへの通信は不要です。

スキルは実装方法の資料です。アプリには別途、同じ版のKav-UIのCSS/JSまたはパッケージを導入します。配置先や公開URLは利用先へ合わせます。個人のエージェント設定は自動変更しません。

`npm run build:docs` で生成する `dist/docs/llms.txt` は、導入・用途別コンポーネントへの入口です。そこから各ページの本文とサンプルをまとめた Markdown 版を参照できます。

形式の参考は[Agent Skills](https://agentskills.io/specification)と[llms.txt](https://llmstxt.org/)です。

## リポジトリの構成

```text
assets/              # 配布用UIの正本。アプリはこのCSS・JSを読み込む
  css/components/    # コンポーネントのスタイル
  js/                # ui.jsと任意のtheme-init.js
  icons/mdi/         # 同梱SVGとライセンス
  vendor/            # 配布物に必要な外部コードのクレジット
docs/                # Astroサイトのソース
  src/pages/         # カタログ・導入ガイド・テンプレートの編集元
  src/layouts/       # 共通のページレイアウト
  src/components/    # カタログのヘッダーとサイドバー
  assets/            # カタログ用のCSS・JS・画像
dist/docs/           # S3に配置する静的サイト一式
packages/            # core・Vue・Astroのパッケージと公開API
examples/            # Vue・Astroでの利用例
skills/kav-ui/       # 利用先へコピーできるAIエージェント用スキル
scripts/             # 梱包・リリース・保守・AI資料生成のスクリプト
tests/              # ブラウザ・パッケージ・配布検証
vendor/              # バンドル元となる外部ソースと出典
```

`assets/`にはカタログ専用のファイルを置きません。新しいコンポーネントの共通スタイルは`assets/css/components/`へ、使い方やサンプルは`docs/src/pages/components/`へ追加します。`packages/core/dist/`・`dist/`・導入例のビルド結果は生成物で、編集元にしません。

ドキュメントのビルドには、`package.json`で指定されたバージョンのNode.jsとPython 3.10以降が必要です。リポジトリのルートで次を実行します。

```bash
npm ci
npm run build:docs
npm run preview:docs
```

`npm run build:docs`はHTMLを`dist/docs/`に生成し、レンダリング結果から検索データ、コードサンプル、`llms.txt`、Markdown版を作ります。共通UIとスキル・パッケージ資料はルートの`assets/`・`skills/kav-ui/`・`packages/`から取り込みます。カタログ専用のCSS・JS・画像は`docs/assets/`で編集します。

S3には`dist/docs/`の中身を配置します。入口は`index.html`です。既存の`.html` URLへ直接アクセスできます。サブパスに配置する場合は、たとえば `DOCS_BASE=/catalog npm run build:docs` のように配置先を指定します。

`npm run sync:docs-skill` は、サイトのビルドと配布用スキルの生成サンプル・クラス一覧の更新を行います。

ページ内リンクや領域内の移動は、`ui-scroll-smooth`で滑らかにできます。`data-ui-scroll-active`を付けた領域は現在地を自動表示します。[Navigationの使用例](docs/src/pages/components/navigation.astro)を参照してください。

[Data table](docs/src/pages/components/data-table.astro)では、HTMLの表に検索・文字/数値/日付ソート・ページ送り・表示件数・行選択を追加できます。ルートに`data-ui-data-table`を指定し、共通CSS/JSで利用します。

## 検索・スライド・時系列・評価

既存のCSS・JSを読み込むだけで利用できる部品を追加しました。

- [Command menu](docs/src/pages/components/command.astro)：検索・項目のグループ化・キーボード選択・任意のショートカット。
- [Carousel](docs/src/pages/components/carousel.astro)：前後移動・インジケーター・スワイプ・任意のループ。自動再生はありません。
- [Timeline](docs/src/pages/components/timeline.astro)：日時・進行状況・アイコン・コンパクト表示。CSSのみで利用できます。
- [Rating](docs/src/pages/components/rating.astro)：radioによる星評価・未評価への解除・サイズ・読み取り専用表示。フォーム送信とresetは標準HTMLの動作です。

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

`data-ui-palette-editor`のフォームで基準色と彩度を選べます。HTML例と保存方法は[カラーパレットのページ](docs/src/pages/components/color-palettes.astro)に掲載しています。

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

既存のHTML/ZIP版に加えて、`@kai17-a/kav-ui-core`・`@kai17-a/kav-ui-vue`・`@kai17-a/kav-ui-astro` をGitHub PackagesのPublicパッケージとして配布しています。Vueのprops・スロット・v-model、Astroの静的出力とクライアント遷移に対応しています。

[導入・対応範囲・検証手順](packages/README.md) / [Vueの例](examples/vue) / [AstroとVue連携の例](examples/astro)

```bash
npm ci
npm run build:packages
npm run pack:packages
```

パッケージ開発時のみNode/npmを使用します。HTML版の利用手順とZIP配布は変わりません。GitHub PackagesでのPublic配布とread:packages認証の導入手順は[パッケージガイド](packages/README.md#github-packagesからインストール)を参照してください。

Vue/Astroの配布経路はGitHub Packages（Public・read:packages認証必須）です。[認証・インストール・公開手順](packages/README.md#github-packagesからインストール)を参照してください。ローカルtarballの生成は開発・検証用です。

## AI向けの表示パターン

[AI visuals](docs/src/pages/components/ai-visuals.astro)では、回答と出典・ツール実行履歴・RAG検索結果・意味マップ・コンテキスト使用量・音声アクティビティの6種類を確認できます。共通CSSと標準HTMLで使え、開閉と表示切り替えはJavaScriptなしでも動作します。すべて例示データで、通信・トークン計算・音声認識はアプリ側で接続します。
