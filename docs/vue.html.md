<!-- Generated from docs/vue.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](vue.html) · [llms.txt](llms.txt)

# Vueで使う

Vue 3.5以降のアプリに、Kav-UIのコンポーネントと共通スタイルを組み込む手順です。

<a id="install"></a>

## 1. GitHub Packagesから導入

`@kai17-a/kav-ui-vue`を使います。共通CSS・ブラウザAPIの`@kai17-a/kav-ui-core`は依存として導入されます。coreとフレームワーク用パッケージの版を揃えてください。

利用側プロジェクトの`.npmrc`に次を記述します。トークン値は書かず、環境変数`NODE_AUTH_TOKEN`へ設定します。personal access token (classic)の`read:packages`と、対象パッケージの読み取り権限が必要です。

```
@kai17-a:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

```
npm install @kai17-a/kav-ui-vue
```

利用するリリース版を指定してください。公開状況とCIでの認証・アクセス権の設定は[パッケージREADME](packages/README.md#github-packagesからインストール)で確認できます。Vue本体は利用側の依存関係です。

<a id="start"></a>

## 2. CSSと最小の使用例

アプリの入口で共通CSSを1回読み込みます。次はVueワークスペースの`examples/vue/src/main.js`と同じ読み込みです。

```
import '@kai17-a/kav-ui-core/style.css';
```

次のSFCはビルド対象の`examples/astro/src/components/VueDemo.vue`と同じコードです（表示用に改行）。通常のVueアプリでも使用できます。

```html
<script setup>
import {ref} from 'vue';
import {KavInput,KavSelect,KavField,KavButton,KavDialog} from '@kai17-a/kav-ui-vue';
const value=ref('AstroのVueアイランド'),open=ref(false),plan=ref(1);
</script>
<template>
<section data-kav-ui-vue data-testid="astro-vue">
<h2>Vue版をAstroで利用</h2>
<KavField label="アイランドの入力" for="island-value">
<KavInput id="island-value" v-model="value" aria-label="アイランドの入力"/>
</KavField>
<output>{{ value }}</output>
<KavField label="Vueアイランドのプラン" for="island-plan">
<KavSelect id="island-plan" v-model="plan" label="Vueアイランドのプラン" :options="[{value:1,label:'個人'},{value:2,label:'チーム'}]"/>
</KavField>
<KavButton @click="open=true">確認する</KavButton>
<KavDialog v-model="open" title="Vueアイランド">
<p>{{ value }}</p>
<KavButton @click="open=false">閉じる</KavButton>
</KavDialog>
</section>
</template>
```

<a id="components"></a>

## 3. 主要コンポーネントと指定方法

| 部品 | 指定・使い方 |
| --- | --- |
| KavButton | `color`、`variant="solid\|outline\|ghost"`、`size="sm\|md\|lg"`、`icon`。操作は`@click`。 |
| KavField / Input / Select / Textarea | Fieldは`label`と`for`。入力は`v-model`、Selectは`options: {value,label}[]`。フォームreset時もモデルを同期。 |
| KavDialog / Drawer | 真偽値の`v-model`、`title`、通常・`footer`スロット。Drawerの`placement`はstart/end/top/bottom。 |
| KavCard / Banner | Cardは`header`・通常・`footer`。Bannerは通常・`actions`。 |
| KavTabs | `items: {value,label,disabled?}[]`、`v-model`、valueと同名のスロット。左右・Home・Endキーで移動。 |
| KavSidebar | `mobile`・`tablet`・`desktop`、`items`または`menu`スロット、通常スロットの本文、`footer`。`toggle`スロットは`{open,toggle}`を受け取る。 |

レイアウトはKavStack / Cluster / Flex / Grid / GridItem / PageHeader / Toolbar / Section / Pageを利用できます。例：Gridの`cols`に`{base:3,tablet:2,mobile:1}`、`gap`に数値を渡せます。対応するprops・スロットの詳細は[レイアウト一覧](packages/README.md#layout-components)を参照してください。

<a id="lifecycle"></a>

## 4. SPA・SSRとページの後始末

パッケージJSをサーバーでimportしてもwindow/documentへアクセスしません。ただし`loadRuntime()`・`toast()`・配色関数はブラウザ用の非同期APIです。SSR中には呼びません。`mount`は`@kai17-a/kav-ui-core`からimportします。

自前のHTMLを初期化する場合は`onMounted`で描画後の要素へ`mount(root)`を呼び、Promiseが返す後始末関数を`onUnmounted`で呼びます。待機中にアンマウントされる場合は`AbortController`のsignalを渡し、破棄時にabortしてください。KavコンポーネントとWidgetは自身で初期化・破棄するため、同じ領域へ重ねてmountしません。

Vueの描画とDOM操作を競合させないため、アプリ全体のマウント先には`data-kav-ui-vue`を付けられます。その範囲のアイコンはKavIconまたはicon propsを使います。Dialogは初期SSRでは閉じたHTMLを出力し、マウント後にモデルを反映します。

パッケージを使うページへ通常HTML版の`ui.js`を追加しないでください。

<a id="scope"></a>

## 5. CSSだけの部品とコンポーネントの対応範囲

文字・余白・カード・Timeline・Ratingなど、動きのない部品は共通CSSのクラスだけで使えます。Data table・Command menu・Carouselには専用コンポーネントを仮定せず、`KavWidget`内のHTMLへ、それぞれ`data-ui-data-table`・`data-ui-command`・`data-ui-carousel`を指定します。

```html
<KavWidget :html="trustedMarkup" />
```

`trustedMarkup`には開発者が管理する信頼済みHTMLだけを渡し、動的な値はエスケープします。各部品の構造は[Data table](components/data-table.html.md)・[Command menu](components/command.html.md)・[Carousel](components/carousel.html.md)のHTML例を使用してください。Vueの子コンポーネントはHTML文字列に埋め込めません。

Icon・Button・Card・フォーム・Alert/Banner・Spinner/Progress・Dialog・Accordion・Calendar/Chart・Widget・Sidebar等に専用部品があり、レイアウト部品も共通です。VueにはDrawer/Tabs、AstroにはProviderがあり、現在の型定義ではAstroのDrawer/Tabsも利用できます。Splitter・Clipboard等の未専用化部品はWidgetで既存HTMLを使います。

[READMEの対応範囲](packages/README.md#コンポーネントの対応範囲)と[フレームワーク用リファレンス](skills/kav-ui/references/frameworks.md)を参照してください。公開propsの正確な型は導入したパッケージの型定義で確認できます。

<a id="html"></a>

## 6. HTML版（ZIP）との使い分け

HTML版はassets一式をコピーするだけで、npm・ビルドが不要です。Vueアプリではパッケージ版を選ぶと、既存のビルド環境でコンポーネントと共通CSSを利用できます。見た目のクラス・トークンは共通です。

[HTML版の導入](installation.html.md) · [Astroで使う](astro.html.md)
