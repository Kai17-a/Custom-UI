# Kav-UI：Vue・Astroパッケージ

既存のHTML版は、引き続き `assets/css/ui.css` と `assets/js/ui.js` のコピーだけで利用できます。このワークスペースはフレームワーク向けの追加配布です。HTML版の利用にnpmやビルドは必要ありません。

| パッケージ | 内容 |
| --- | --- |
| `@kav-ui/core` | 共通CSS、128個のMDIのSVGパス、SSR安全な共通関数、明示的に初期化するブラウザAPI |
| `@kav-ui/vue` | Vue 3.5以降用のコンポーネント、v-model、スロット、イベント |
| `@kav-ui/astro` | Astroコンポーネント、静的HTML、ページ遷移対応のブラウザ処理 |

現在はローカルのtarballとして配布できます。npmレジストリには公開していません。パッケージは `private: true` とし、レジストリ公開の前に名前の利用権とプロジェクト自体のライセンスを決める必要があります。MDIとMaterial Color Utilitiesのライセンス・クレジットはcoreに同梱します。

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

ブラウザテストにはインストール済みChromiumを使用します。必要なら `CHROME_BIN` で実行ファイルを指定できます。配布ファイルは `dist/packages/kav-ui-{core,vue,astro}-0.1.0.tgz` に作成されます。公開処理やGitHub Actionsの起動は含みません。

coreのCSSとランタイムは既存の `assets` から、アイコンのSVGパスは既存JSのMDI一覧から生成します。生成物はGit管理せず、ソース変更後は `build:packages` を実行します。ZIPの配布方法は従来どおりです。

## Vue

既存のVueアプリへ、作成したcoreとvueの両tarballをインストールします。Vue本体は利用側の依存関係です。

```bash
npm install /path/to/kav-ui-core-0.1.0.tgz /path/to/kav-ui-vue-0.1.0.tgz
```

CSSはアプリの入口で1回読み込みます。パッケージJSをSSRでimportしてもwindow/documentにはアクセスしません。

```vue
<script setup>
import {ref} from 'vue';
import '@kav-ui/core/style.css';
import {KavButton,KavInput,KavSelect,KavDialog} from '@kav-ui/vue';
const name=ref('');
const plan=ref(1);
const open=ref(false);
</script>

<template>
  <KavInput v-model="name" label="名前" />
  <KavSelect v-model="plan" label="プラン"
    :options="[{value:1,label:'個人'},{value:2,label:'チーム'}]" />
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
npm install /path/to/kav-ui-core-0.1.0.tgz /path/to/kav-ui-astro-0.1.0.tgz
```

```astro
---
import {KavProvider,KavButton,KavCard,KavSelect,KavDialog} from '@kav-ui/astro';
---
<html lang="ja">
  <body>
    <KavProvider />
    <KavCard title="設定">
      <KavSelect name="plan" label="プラン" value="personal"
        options={[{value:'personal',label:'個人'},{value:'team',label:'チーム'}]} />
      <KavButton data-ui-toggle="dialog" data-ui-target="#confirm">確認</KavButton>
    </KavCard>
    <KavDialog id="confirm" title="確認">
      <p>設定を確認してください。</p>
      <KavButton data-ui-dismiss="dialog">閉じる</KavButton>
    </KavDialog>
  </body>
</html>
```

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

Vue版には Drawer / Tabs、Astro版には Provider も用意しています。Astroのドロワーは `KavDialog` の `placement` で指定できます。未専用化のFlex grid・Splitter・日付詳細・クリップボード等も、共通CSSとWidgetの既存HTMLで利用できます。

`loadRuntime()`・`toast()`・配色の関数はブラウザで呼ぶ非同期APIです。サーバー上で呼ぶとエラーになります。既存のグローバル `KavUI` と混在させる場合は、同じバージョンのCSS/JSを使用してください。

## 検証と公開

```bash
npm run test:packages
npm run check:packages
npm exec --workspace @kav-ui/example-astro -- astro check
npm exec -- astro check --root packages/astro
npm run build:examples
npm run test:browser:packages
```

例の開発サーバーは `npm run dev:vue` / `npm run dev:astro` で起動します。サーバー環境でのimport、Vue SSR、型の不正な指定、配布CSS参照、モバイル・タブレット・PC、入力値、モーダル、破棄・再作成、Astroのページ遷移とVueハイドレーションを検証します。

レジストリ公開、バージョンタグ作成、リリース用Actionsの実行は別の操作です。今回のパッケージ生成コマンドでは行いません。
