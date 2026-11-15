<!-- Generated from docs/astro.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](astro.html) · [llms.txt](llms.txt)

# Astroで使う

Astro 7.4.2以上、8未満のアプリに、Kav-UIのコンポーネントと共通スタイルを組み込む手順です。

<a id="install"></a>

## 1. GitHub Packagesから導入

`@kai17-a/kav-ui-astro`を使います。共通CSS・ブラウザAPIの`@kai17-a/kav-ui-core`は依存として導入されます。coreとフレームワーク用パッケージの版を揃えてください。

利用側プロジェクトの`.npmrc`に次を記述します。トークン値は書かず、環境変数`NODE_AUTH_TOKEN`へ設定します。Publicパッケージでも認証が必要です。personal access token (classic)に`read:packages`を付与してください。

```
@kai17-a:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

```
npm install @kai17-a/kav-ui-astro
```

利用するリリース版を指定してください。公開状況とCIでの認証設定は[パッケージREADME](packages/README.md#github-packagesからインストール)で確認できます。Astro専用部品だけならVueは不要です。

<a id="start"></a>

## 2. Providerと最小の使用例

レイアウトに`KavProvider`を1回置くとCSSと共通JSを読み込みます。次はビルド対象の`examples/astro/src/pages/second.astro`と同じコードです（表示用に改行）。`ClientRouter`でページ遷移を使う例になっています。

```
---
import { ClientRouter } from 'astro:transitions';
import {
  KavProvider,
  KavContainer,
  KavSelect,
  KavButton,
  KavDialog
} from '@kai17-a/kav-ui-astro';
---
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Kav-UI / ページ遷移</title>
    <ClientRouter />
  </head>
  <body>
    <KavProvider />
    <KavContainer>
      <h1>遷移後のページ</h1>
      <p>ページを再読み込みせずに移動した後も、選択欄とモーダルを利用できます。</p>
      <KavSelect
        label="遷移後の選択"
        options={[
          { value: 'one', label: '項目1' },
          { value: 'two', label: '項目2' }
        ]}
      />
      <KavButton
        data-ui-toggle="dialog"
        data-ui-target="#second-dialog"
        data-testid="astro-open"
      >
        開く
      </KavButton>
      <KavDialog id="second-dialog" title="遷移後の確認">
        <p>二重に初期化せず開きます。</p>
        <KavButton data-ui-dismiss="dialog">閉じる</KavButton>
      </KavDialog>
      <a href="/" data-testid="astro-back">最初のページへ戻る</a>
    </KavContainer>
  </body>
</html>
```

対話的な部品も初期化スクリプトを持つため、Providerの代わりに`import '@kai17-a/kav-ui-core/style.css';`でCSSを直接読み込むこともできます。

<a id="components"></a>

## 3. 主要コンポーネントと指定方法

| 部品 | 指定・使い方 |
| --- | --- |
| KavButton / Dialog / Drawer | Buttonの`variant`はsolid/outline/ghost。Dialog/Drawerの必須`id`を`data-ui-target="#ID"`で指定し、`data-ui-toggle="dialog"`で開き、`data-ui-dismiss="dialog"`で閉じる。Drawerは`placement`。 |
| KavInput / Select / Textarea | `name`・`value`・`label`で標準HTMLフォームとして使用。Selectは`options: {value,label}[]`。Vueのv-modelは使わない。 |
| KavCard / Banner | Cardは`header`・通常・`footer`スロット。Bannerは`title`・`closable`と`actions`スロット。 |
| KavTabs | `items: {value,label,disabled?}[]`、`value`で初期選択。value名のスロットを使用。複数配置するときは異なる`id`を指定。 |
| KavSidebar | `menu`スロットにナビゲーション、通常スロットに本文。`data-ui-toggle="sidebar-responsive"`と`data-ui-target="#ID"`で開閉。 |

レイアウトはKavStack / Cluster / Flex / Grid / GridItem / PageHeader / Toolbar / Section / Pageを利用できます。例：Gridの`cols`に`{base:3,tablet:2,mobile:1}`、`gap`に数値を渡せます。対応するprops・スロットの詳細は[レイアウト一覧](packages/README.md#layout-components)を参照してください。

<a id="lifecycle"></a>

## 4. SPA・SSRとページの後始末

パッケージJSをサーバーでimportしてもwindow/documentへアクセスしません。ただし`loadRuntime()`・`toast()`・配色関数はブラウザ用の非同期APIです。SSR中には呼びません。`mount`は`@kai17-a/kav-ui-core`からimportします。

旧ページは`astro:before-swap`で後始末し、新ページは`astro:page-load`で初期化します。パッケージがイベントの重複登録を防ぎ、選択済みテーマも引き継ぎます。遷移先がテーマを明示した場合はその指定を優先します。

自前のHTMLへ動きを付ける場合も、描画後（`astro:page-load`）に`mount(root)`を呼び、Promiseが返す後始末関数を`astro:before-swap`で呼びます。待機中の遷移には`AbortController`のsignalとabortで対応します。イベントは1回だけ登録し、ProviderやWidgetが初期化する領域との二重管理を避けてください。

フォーム送信は通常のHTMLと同じです。共通JSの`ui:datechange`・`ui:hidden`等はDOMのCustomEventとして取得できます。Vueアイランドを使う場合は`@astrojs/vue`と`client:load`等を設定します。`examples/astro/astro.config.mjs`とVueDemo.vueを参照してください。

パッケージを使うページへ通常HTML版の`ui.js`を追加しないでください。

<a id="scope"></a>

## 5. CSSだけの部品とコンポーネントの対応範囲

文字・余白・カード・Timeline・Ratingなど、動きのない部品は共通CSSのクラスだけで使えます。Data table・Command menu・Carouselには専用コンポーネントを仮定せず、`KavWidget`内のHTMLへ、それぞれ`data-ui-data-table`・`data-ui-command`・`data-ui-carousel`を指定します。

```html
<KavWidget html={trustedMarkup} />
```

`trustedMarkup`には開発者が管理する信頼済みHTMLだけを渡し、動的な値はエスケープします。各部品の構造は[Data table](components/data-table.html.md)・[Command menu](components/command.html.md)・[Carousel](components/carousel.html.md)のHTML例を使用してください。

Icon・Button・Card・フォーム・Alert/Banner・Spinner/Progress・Dialog・Accordion・Calendar/Chart・Widget・Sidebar等に専用部品があり、レイアウト部品も共通です。VueにはDrawer/Tabs、AstroにはProviderがあり、現在の型定義ではAstroのDrawer/Tabsも利用できます。Splitter・Clipboard等の未専用化部品はWidgetで既存HTMLを使います。

[READMEの対応範囲](packages/README.md#コンポーネントの対応範囲)と[フレームワーク用リファレンス](skills/kav-ui/references/frameworks.md)を参照してください。公開propsの正確な型は導入したパッケージの型定義で確認できます。

<a id="html"></a>

## 6. HTML版（ZIP）との使い分け

HTML版はassets一式をコピーするだけで、npm・ビルドが不要です。Astroアプリではパッケージ版を選ぶと、既存のビルド環境でコンポーネントと共通CSSを利用できます。見た目のクラス・トークンは共通です。

[HTML版の導入](installation.html.md) · [Vueで使う](vue.html.md)
