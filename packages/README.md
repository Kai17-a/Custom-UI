# Kav-UI：Vue・Astroパッケージ

既存のHTML版は、引き続き `assets/css/ui.css` と `assets/js/ui.js` のコピーだけで利用できます。このワークスペースはフレームワーク向けの追加配布です。HTML版の利用にnpmやビルドは必要ありません。

| パッケージ | 内容 |
| --- | --- |
| `@kai17-a/kav-ui-core` | 共通CSS、128個のMDIのSVGパス、SSR安全な共通関数、明示的に初期化するブラウザAPI |
| `@kai17-a/kav-ui-vue` | Vue 3.5以降用のコンポーネント、v-model、スロット、イベント |
| `@kai17-a/kav-ui-astro` | Astroコンポーネント、静的HTML、ページ遷移対応のブラウザ処理 |

GitHub Packagesのnpmレジストリへ配布する構成です。パッケージは非公開で運用し、リポジトリはPublicのまま維持します。MDIとMaterial Color Utilitiesのライセンス・クレジットはcoreに同梱します。

## GitHub Packagesからインストール

利用するプロジェクトの `.npmrc` に次を記述します。トークン値をファイルへ書かず、環境変数 `NODE_AUTH_TOKEN` に設定してください。GitHubのpersonal access token (classic)には `read:packages` と対象パッケージへの読み取り権限が必要です。

```ini
@kai17-a:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

```bash
# Vue（coreは依存として導入されます）
npm install @kai17-a/kav-ui-vue@0.0.5
# Astro
npm install @kai17-a/kav-ui-astro@0.0.5
```

以下は初回公開後に利用できる例です。現時点ではレジストリ未公開です。利用するリリース版に置き換えてください。

利用側のGitHub Actionsでは、上記 `.npmrc` を管理し、次のように設定します。

```yaml
permissions:
  contents: read
  packages: read
steps:
  - uses: actions/checkout@d23441a48e516b6c34aea4fa41551a30e30af803 # v6.1.0
  - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7
    with:
      node-version: '24'
  - run: npm ci
    env:
      NODE_AUTH_TOKEN: ${{ github.token }}
```

利用側リポジトリにはパッケージ設定の **Manage Actions access** でRead権限を付与します。ローカルや他のCIでは `read:packages` のトークンをCIの秘密変数から `NODE_AUTH_TOKEN` へ渡します。lockfileも利用するレジストリに合わせて更新します。

### 保守者：版上げとレジストリ公開

現在の版はKav-UIの最新Release `v0.0.5` に合わせた `0.0.5` です。今後はリリースタグを作る前に次を実行し、差分をコミットします。

```bash
npm run version:packages -- v0.0.6
npm run build:packages
npm run test:packages
node scripts/library-release.mjs validate v0.0.6
```

`version:packages` はルート、3パッケージ、examples、内部依存、lockfileを一括更新します。既存のRelease作成ワークフローにも版検証を追加し、Releaseタグとルート版・パッケージ版・core依存の不一致は公開前に拒否します。HTML/ZIPの作成・利用方法は変更しません。

`publish-packages.yml` は `v*` Releaseのpublished時、または **Actions → Publish Kav-UI packages → Run workflow** の `tag` に既存の `vVERSION` を指定すると動きます。タグのソースをチェックアウトし、版検証・ビルド・テスト・型検査・examplesビルド・pack・チェックサム検証の後、core → Vue → Astroの順に公開します。公開済みの同じ版はスキップし、認証・通信エラーは失敗させます。途中からの再実行も可能です。プレリリースは `next`、通常版は `latest` dist-tagを使います。

公開認証は `GITHUB_TOKEN` の `contents: read` / `packages: write` のみで、新しいシークレットは不要です。既存のRelease作成ワークフローが `GITHUB_TOKEN` で公開したReleaseは、GitHubのイベント再帰防止によりpublishedトリガーを起動しません。その場合はレビュー後に上記の手動実行を使います。今回の設定が入っていない古いタグ（既存の `v0.0.5` を含む）は対象にできません。既存Releaseやタグを改変せず、変更を含む新しい版のタグを用意してください。

初回公開後は、オーナーの **Packages → 各パッケージ → Package settings** で可視性を **Private** に設定・確認してください（初期値もPrivateです）。3パッケージとも `Kai17-a/Custom-UI` に紐付いていること、利用者とCIのアクセス権も確認します。リポジトリの可視性はPublicのまま変更しません。`private: true` はnpm公開自体を禁止するため外しており、アクセス制御はGitHubのパッケージ設定で管理します。

参考：[GitHub npmレジストリ](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry) / [Actionsによる公開](https://docs.github.com/en/packages/managing-github-packages-using-github-actions-workflows/publishing-and-installing-a-package-with-github-actions)


Data table・Command menu・Carouselは既存の`KavWidget`内で`data-ui-data-table`・`data-ui-command`・`data-ui-carousel`を指定して利用できます。Timeline・Ratingはクラスを指定した標準HTMLで利用できます。専用のVue/Astroコンポーネント名は追加していません。[HTML例と属性一覧](../docs/index.html)を参照してください。

## 開発・配布ファイル作成

リポジトリのルートで実行します。開発・検証環境にはNode 24.13以降とnpmを使用します。

```bash
npm ci
npm run build:packages
npm run test:packages
npm run check:packages
npm run build:examples
npm run test:browser:packages
npm run pack:packages
```

ブラウザテストにはインストール済みChromiumを使用します。必要なら `CHROME_BIN` で実行ファイルを指定できます。配布ファイルは `dist/packages/kai17-a-kav-ui-{core,vue,astro}-0.0.5.tgz` に作成されます。公開処理やGitHub Actionsの起動は含みません。

coreのCSSとランタイムは既存の `assets` から、アイコンのSVGパスは既存JSのMDI一覧から生成します。生成物はGit管理せず、ソース変更後は `build:packages` を実行します。ZIPの配布方法は従来どおりです。

## Vue

既存のVueアプリへ、作成したcoreとvueの両tarballをインストールします。Vue本体は利用側の依存関係です。

```bash
npm install /path/to/kai17-a-kav-ui-core-0.0.5.tgz /path/to/kai17-a-kav-ui-vue-0.0.5.tgz
```

CSSはアプリの入口で1回読み込みます。パッケージJSをSSRでimportしてもwindow/documentにはアクセスしません。

```vue
<script setup>
import {ref} from 'vue';
import '@kai17-a/kav-ui-core/style.css';
import {KavButton,KavField,KavInput,KavSelect,KavDialog} from '@kai17-a/kav-ui-vue';
const name=ref('');
const plan=ref(1);
const open=ref(false);
</script>

<template>
  <KavField label="名前" for="name">
    <KavInput id="name" v-model="name" />
  </KavField>
  <KavField label="プラン" for="plan">
    <KavSelect id="plan" v-model="plan"
      :options="[{value:1,label:'個人'},{value:2,label:'チーム'}]" />
  </KavField>
  <KavButton variant="outline" icon="mdi-check" @click="open=true">確認</KavButton>
  <KavDialog v-model="open" title="入力内容">
    <p>{{ name }}</p>
    <template #footer><KavButton @click="open=false">閉じる</KavButton></template>
  </KavDialog>
</template>
```

- 色は `color`、ボタンのデザインは `variant="solid|outline|ghost"`、大きさは `size="sm|md|lg"` です。
- 入力値・タブ・日付には `v-model`、モーダル・サイドバー・開閉可能な通知には真偽値の `v-model` を使えます。
- `KavCard` は `header`・通常スロット・`footer`、`KavBanner` は通常スロット・`actions` を持ちます。
- `KavTabs` は `items` の各 `value` と同名のスロットを表示します。キーボードの左右・Home・Endで移動できます。
- `KavInput` の日付・時刻・月・週・色、`KavSelect` は既存のカスタム選択UIを使用します。入力・選択欄・テキストエリアはフォームのreset時にもモデルを同期します。`KavSelect` の `form` 属性でフォーム外からも送信できます。
- `KavDialog` は初期SSR時は閉じたHTMLを出力し、ブラウザでマウント後に `v-model` を反映します。`KavDrawer` は `placement="start|end|top|bottom"` で配置を指定します。

`KavTextarea` の `label` は `aria-label` より優先されます。空文字の `label` は無視され、`aria-label` を使います（`KavInput`・`KavSelect` とAstro版も同じ）。`name`・`id`・`rows`・`placeholder`・`required`・`disabled`・`maxlength` も型付きで指定できます。

### Vueのサイドバー

`KavSidebar` の `mobile`・`tablet`・`desktop` はHTML版と同じ表示モードです。`items` または `menu` スロットを指定し、通常スロットに本文を置きます。`footer` スロットも使えます。

```vue
<KavSidebar title="Workspace" mobile="drawer" tablet="rail" desktop="rail"
  :items="[{label:'概要',href:'/',icon:'mdi-home',active:true}]">
  <h1>サービスの本文</h1>
</KavSidebar>
```

メニューはVueのTeleportで移動するため、`menu` スロットにVueの入力部品も配置できます。`toggle` スロットには `{open,toggle}` が渡され、標準のメニューボタンを差し替えられます。画面区分を変更すると、その区分の初期表示へ戻ります。

### 既存のHTML部品も使う

専用コンポーネント以外の部品は `KavWidget` へ既存HTMLを渡せます。Vueが描画する子ノードと、共通JSが変更するノードを分けています。`html`・`as` が変わる前とunmount時に選択画面・監視・外側フォームのイベントを後始末します。

```vue
<KavWidget :html="trustedMarkup" @ready="api => console.log(api)" />
```

`html` は開発者が管理する信頼済みHTMLに限定してください。利用者の入力をそのまま渡す用途には使いません。必要な値はエスケープするか、専用コンポーネントのpropsを使います。Vueで更新する子コンポーネントは、このHTML文字列の中へ配置できません。KavコンポーネントのルートはVueの所有範囲として保護します。通常タグを含むアプリ全体を保護する場合は、マウント先を `<div id="app" data-kav-ui-vue></div>` とします。AstroのVueアイランドもVue側のルートに `data-kav-ui-vue` を付けます。この境界内では通常タグへ自動でSVGを挿入しないため、アイコンは `KavIcon` または `KavButton` の `icon` propsを使います。`KavWidget` 内のHTMLでは従来の `icon="mdi-home"` と属性変更による自動更新を使えます。

## Astro

coreとastroのtarballをインストールします。Astro専用部品にVue本体は不要です。

```bash
npm install /path/to/kai17-a-kav-ui-core-0.0.5.tgz /path/to/kai17-a-kav-ui-astro-0.0.5.tgz
```

```astro
---
import {KavProvider,KavButton,KavCard,KavField,KavSelect,KavDialog} from '@kai17-a/kav-ui-astro';
---
<html lang="ja">
  <body>
    <KavProvider />
    <KavCard title="設定">
      <KavField label="プラン" for="astro-plan">
        <KavSelect id="astro-plan" name="plan" value="personal"
          options={[{value:'personal',label:'個人'},{value:'team',label:'チーム'}]} />
      </KavField>
      <KavButton data-ui-toggle="dialog" data-ui-target="#confirm">確認</KavButton>
    </KavCard>
    <KavDialog id="confirm" title="確認">
      <p>設定を確認してください。</p>
      <KavButton data-ui-dismiss="dialog">閉じる</KavButton>
    </KavDialog>
  </body>
</html>
```

Astroでも `KavTabs`・`KavDrawer` を使えます。Tabsの `items` と値ごとの名前付きスロットはVueと共通で、初期選択は `value` です。最初の有効項目が既定値になります。`label` はタブ一覧の読み上げ名、`id` は生成IDの接頭辞です。同じ内容のタブを複数置く場合は異なる `id` を指定してください。Drawerは必須の `id`、`title`、`placement`（既定 `end`）、通常・`footer` スロットを受け取り、Dialogと同じdata属性で開閉します。[使用例](astro/README.md#tabsdrawer)も参照してください。

`KavProvider` をレイアウトに1回置くとCSSと共通JSを読み込みます。対話的なコンポーネント自身も必要な初期化スクリプトを含むため、Providerの代わりに共通CSSを直接importしても利用できます。

- Astroは静的HTMLを出力し、値の取得・フォーム送信は通常のHTMLと同じです。Vueのv-modelはAstro専用部品にはありません。
- 共通JSのイベントは `ui:datechange`・`ui:hidden` などのCustomEventとしてDOMから取得できます。
- `astro:before-swap` で旧ページを後始末し、`astro:page-load` で新ページを初期化します。スクリプトの重複登録を防ぎます。
- 初回アクセス時に明暗属性を明示したAstroページは、その指定を反映します。属性なしの場合は保存設定・OSの設定を使います。
- クライアント遷移では選択済みの明暗・デザイン・配色とカスタム配色のCSSを引き継ぎます。遷移先にテーマ属性やカスタム配色のseed・chromaを明示している場合は、その指定を優先します。
- JavaScript無効時もフォームのネイティブ入力と通常のサイドバーを表示します。モーダル等の操作はブラウザJSが必要です。
- `KavSidebar` の `menu` スロットにナビゲーション、通常スロットに本文を置きます。ボタンは `data-ui-toggle="sidebar-responsive"` と `data-ui-target="#サイドバーのID"` で指定します。

外側のAstro部品の後始末ではVueが管理するDOMを変更しないため、`transition:persist` で保持するVueアイランド内の選択欄も維持します。

AstroでVue版を使う場合は公式 `@astrojs/vue` を設定し、Vueコンポーネントに `client:load` 等を指定します。例は `examples/astro/src/components/VueDemo.vue` と `astro.config.mjs` を参照してください。Astro 7のワークスペース例では、SSRとprerenderの `vite.environments.*.resolve.noExternal` を設定しています。

## コンポーネントの対応範囲

共通の専用部品は Icon / Button / Card / Container / Badge / Field / Input / Textarea / Select / Checkbox / Radio / Switch / Alert / Banner / Spinner / Progress / Dialog / Accordion / Calendar / Chart / Widget / Sidebar です。

Vue版には Drawer / Tabs、Astro版には Provider も用意しています。Astroのドロワーは `KavDialog` の `placement` で指定できます。未専用化のSplitter・日付詳細・クリップボード等も、共通CSSとWidgetの既存HTMLで利用できます。

`loadRuntime()`・`toast()`・配色の関数はブラウザで呼ぶ非同期APIです。サーバー上で呼ぶとエラーになります。既存のグローバル `KavUI` と混在させる場合は、同じバージョンのCSS/JSを使用してください。

## 検証と公開

```bash
npm run test:packages
npm run check:packages
npm exec --workspace @kai17-a/kav-ui-example-astro -- astro check
npm exec -- astro check --root packages/astro
npm run build:examples
npm run test:browser:packages
```

例の開発サーバーは `npm run dev:vue` / `npm run dev:astro` で起動します。サーバー環境でのimport、Vue SSR、型の不正な指定、配布CSS参照、モバイル・タブレット・PC、入力値、モーダル、破棄・再作成、Astroのページ遷移とVueハイドレーションを検証します。

レジストリ公開、バージョンタグ作成、リリース用Actionsの実行は別の操作です。今回のパッケージ生成コマンドでは行いません。

## GitHub Releasesへのライブラリ公開

専用ワークフローは `.github/workflows/release-libraries.yml`（**Release Kav-UI libraries**）です。`core`・`vue`・`astro` の3つの `.tgz` と `SHA256SUMS` を同じリリースへ配置します。tarballのみの配布には、npmレジストリへの公開やnpmトークンは不要です。

| 配布対象 | ワークフロー | タグ例 |
| --- | --- | --- |
| HTML版ZIP | `release.yml` | `v1.0.0` |
| ライブラリ3種 | `release-libraries.yml` | `libraries-v0.0.5` |

ライブラリ用タグはHTML版の公開を起動しません。ライブラリのリリースはGitHubの「Latest」に指定しないため、HTML版のLatest指定を変更しません。

### 公開手順

1. ワークフロー・スクリプト・パッケージ変更をコミットし、`main` に取り込みます。手動実行の一覧に表示するにはワークフローがデフォルトブランチ上に必要です。
2. Kav-UIと同じ版を使用します。`npm run version:packages -- vVERSION` で一括更新し、lockfileを含めてコミットします。
3. 対象コミットへライブラリ用タグを作成してpushします。現在のパッケージは `0.0.5` です。

```bash
git tag libraries-v0.0.5
git push origin libraries-v0.0.5
```

タグpushで実行されます。既存タグから手動実行する場合は、GitHubの **Actions → Release Kav-UI libraries → Run workflow** で `tag` に `libraries-v0.0.5` を指定します。ブランチ名やHTML版用の `v0.0.5` は指定できません。

Node 24で、タグとバージョンの一致確認、ロックファイルによる依存インストール、共通CSS/JSのビルド、SSR・配布・型の検査、導入例のビルド、公開処理のローカルテストを行います。すべて成功したら3パッケージを生成し、チェックサムを検証してからGitHub Releasesへ添付します。`GITHUB_TOKEN` の `contents: write` を使用し、別の公開トークンは必要ありません。

`libraries-v0.2.0-rc.1` のようなタグはプレリリースにします。公開前のdraftなら再実行でアセットを再配置できます。公開済みの場合は上書きせず失敗するため、新しいバージョンとタグを使用してください。

### ダウンロード後の確認と導入

ライブラリのリリースから3つの `.tgz` と `SHA256SUMS` を同じディレクトリへダウンロードします。

```bash
sha256sum -c SHA256SUMS
# Vueアプリの場合
npm install ./kai17-a-kav-ui-core-0.0.5.tgz ./kai17-a-kav-ui-vue-0.0.5.tgz
# Astroアプリの場合
npm install ./kai17-a-kav-ui-core-0.0.5.tgz ./kai17-a-kav-ui-astro-0.0.5.tgz
```

公開せずに生成・検証する場合は、`npm run pack:packages` の後で次を実行します。`dist/packages` に古いバージョンの `.tgz` が残っている場合は別の場所へ移してから実行してください。

```bash
node scripts/library-release.mjs validate libraries-v0.0.5
node scripts/library-release.mjs checksums libraries-v0.0.5
node scripts/library-release.mjs verify libraries-v0.0.5
```

上記の生成・検証コマンドは、タグ作成・Actions起動・GitHubへの公開を行いません。

参考：[GitHubの手動実行手順](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow) / [GitHub CLIのRelease作成](https://cli.github.com/manual/gh_release_create)

## Layout components

Vue/Astroでページを並べるときは、クラスを手で組み合わせる代わりに次のコンポーネントを使います。両パッケージの名前・props・スロットは共通です。

| Component | Props | Slots |
| --- | --- | --- |
| `KavStack` | `gap`, `align`, `as='div'` | default |
| `KavCluster` | `gap`, `justify`, `align`, `as='div'` | default |
| `KavFlex` | `direction`, `justify`, `align`, `wrap`, `gap`, `as='div'` | default |
| `KavGrid` | `cols`, `gap`, `as='div'` | default |
| `KavGridItem` | `span`, `as='div'` | default |
| `KavPageHeader` | `title`, `description`, `eyebrow`, `level=1` | default (heading内の追加内容), actions |
| `KavToolbar` | `label` (role=group + aria-label) | default, end |
| `KavSection` | `title`, `description`, `level=2` | default, actions |
| `KavPage` | `asideLabel`, `railLabel`, `stickyAside` | default (body), aside, rail |

型は `@kai17-a/kav-ui-core` からimportできます。

- `Space = 0|1|2|3|4|6|8|12`、`Justify = 'start'|'center'|'end'|'between'|'around'|'evenly'`、`Align = 'start'|'center'|'end'|'stretch'|'baseline'`。
- `Direction = 'row'|'column'`、wrapはboolean、`Columns = 1|2|3|4|6|12`、`Span = 1..12`、`HeadingLevel = 1..6`。
- gap / direction / justify / align / wrap / cols / span は `Responsive<T> = T|{base?:T;tablet?:T;mobile?:T}`。baseは全幅、tabletは768–1023px、mobileは768px未満です。`cols='auto'` は単独の値としてのみ指定でき、`ui-page-grid` による自動列数になります。
- 無効な値は実行時に無視します。未指定では既存クラスの既定値を使います。数値gridは未指定で1列、GridItemのspanは未指定で親の列幅に従います。
- `sp-gap-*` は既存のgapを上書きし、gridの幅計算にも反映します。`KavGridItem` のspanは12分割で、数値colsの `KavGrid` 内で使います。
- `KavCluster` は通常 `ui-cluster`。中央以外のbase alignを指定した場合は、CSSの読み込み順による中央揃えの優先を避けるため `fx fx-wrap fx-min-0` と既定gap=3を合成します。CSS自体は変更しません。
- `KavPage` はaside/railスロットがあるときだけ対応するasideとレイアウトクラスを出力します。属性は一番外側の `ui-layout` に渡します。
- `class`・`id`・ARIA・data属性などは外側へ渡せます。レイアウト部品はSSRだけでも利用できます。

```vue
<script setup lang="ts">
import {KavPage,KavPageHeader,KavButton,KavGrid,KavCard} from '@kai17-a/kav-ui-vue';
</script>
<template>
  <KavPage aside-label="ページ内ナビ">
    <template #aside>プロジェクト</template>
    <KavPageHeader title="プロジェクト">
      <template #actions><KavButton>新規作成</KavButton></template>
    </KavPageHeader>
    <KavGrid :cols="{base:3,tablet:2,mobile:1}" :gap="4">
      <KavCard v-for="name in ['設計','開発','確認']" :key="name" :title="name" />
    </KavGrid>
  </KavPage>
</template>
```

```astro
---
import {KavPage,KavPageHeader,KavButton,KavGrid,KavCard} from '@kai17-a/kav-ui-astro';
---
<KavPage asideLabel="ページ内ナビ">
  <nav slot="aside">プロジェクト</nav>
  <KavPageHeader title="プロジェクト">
    <KavButton slot="actions">新規作成</KavButton>
  </KavPageHeader>
  <KavGrid cols={{base:3,tablet:2,mobile:1}} gap={4}>
    {['設計','開発','確認'].map(name=><KavCard title={name} />)}
  </KavGrid>
</KavPage>
```
