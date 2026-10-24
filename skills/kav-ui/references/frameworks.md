# Vue/Astroへの組み込み

## 導入済みパッケージを使う

利用先のpackage.jsonとロックファイルで導入版を確認する。coreとVue/Astroの版を揃え、既存のパッケージマネージャーを使う。公開npmレジストリへの配置は仮定しない。

未導入で利用者がtarballを用意している場合は、例えばVueなら次の組み合わせをアプリへ追加する。ファイルパスと版は実物へ合わせる。Kav-UI本体のワークスペースやビルドスクリプトは不要。

```bash
npm install /path/to/kav-ui-core-0.1.0.tgz /path/to/kav-ui-vue-0.1.0.tgz
```

Astroならvueの代わりにastroのtarballを使う。取得先が必要な場合だけ[GitHub Releases](https://github.com/Kai17-a/Custom-UI/releases)の配布状況を確認する。既存アプリへ新たなVue/Astro自体を導入するかは依頼範囲に従う。

## Vue

Vue 3.5以降。CSSはアプリの入口で1回読み込む。

```vue
<script setup>
import {ref} from 'vue';
import '@kav-ui/core/style.css';
import {KavInput, KavButton, KavDialog} from '@kav-ui/vue';
const name = ref('');
const open = ref(false);
</script>
<template>
  <KavInput v-model="name" label="名前" />
  <KavButton color="primary" variant="outline" icon="mdi-check" @click="open=true">確認</KavButton>
  <KavDialog v-model="open" title="入力内容">
    <p>{{ name }}</p>
    <template #footer><KavButton @click="open=false">閉じる</KavButton></template>
  </KavDialog>
</template>
```

- ボタンのvariantはsolid / outline / ghost、sizeはsm / md / lg。HTML版のクラスをそのままpropsの値へ置き換えない。
- `KavSelect`はv-modelで値を管理し、選択肢には`:options="[{value:'personal',label:'個人'}]"`を使う。入力や選択はフォームreset時にもモデルを同期する。
- `KavSidebar`はmobile / tablet / desktop、items / menuスロット、本文の通常スロット、footerを持つ。メニューDOMの移動はVueに任せる。
- 素のHTMLを使う未専用化の部品は`KavWidget :html="trustedMarkup"`へ渡す。Widgetが初期化と破棄を担当する。htmlは開発者が管理する信頼済み文字列に限り、動的な値をエスケープする。Vueの子コンポーネントを文字列に埋め込まない。
- アプリ全体のVue所有範囲にはマウント先へ`data-kav-ui-vue`を付けられる。この範囲のアイコンは`KavIcon`か部品のicon propsを使い、SVGの自動挿入とVueの描画を競合させない。Widget内部のHTMLではicon属性を使える。

## Astro

```astro
---
import {KavProvider, KavCard, KavSelect, KavButton, KavDialog} from '@kav-ui/astro';
---
<html lang="ja">
  <body>
    <KavProvider />
    <KavCard title="設定">
      <KavSelect label="プラン" name="plan" value="personal"
        options={[{value:'personal',label:'個人'}]} />
      <KavButton data-ui-toggle="dialog" data-ui-target="#confirm">確認</KavButton>
    </KavCard>
    <KavDialog id="confirm" title="確認">
      <p>設定内容を確認してください。</p>
      <KavButton data-ui-dismiss="dialog">閉じる</KavButton>
    </KavDialog>
  </body>
</html>
```

Providerはレイアウトに1回置き、CSSと共通JSを読み込む。対話的な部品も必要な初期化を持つ。Astro専用部品にはVueのv-modelを使わず、通常のフォーム送信・DOMのCustomEventを使う。

クライアント遷移の旧ページ破棄・新ページ初期化はパッケージが扱う。Vueアイランドを組み合わせる場合だけ、利用先で設定済みの`@astrojs/vue`と`client:load`などを使う。Astro専用部品だけならVueは不要。

## 専用部品とHTML境界

両方にIcon / Button / Card / Container / Badge / Field / Input / Textarea / Select / Checkbox / Radio / Switch / Alert / Banner / Spinner / Progress / Dialog / Accordion / Calendar / Chart / Widget / Sidebarを用意している。VueにはDrawer / Tabs、AstroにはProviderもある。

Data table・Splitter・Clipboardなどに同名の専用Kavコンポーネントがあると仮定しない。これらは同梱HTML例をWidgetに渡す。公開propsやイベントの詳細は、導入されたパッケージの型で確認する。

CSSとパッケージを読み込んだ環境へ、通常HTML版のui.jsを追加しない。coreのloadRuntime・toast・配色関数はブラウザで呼ぶ非同期API。SSRのトップレベルやサーバーの処理中には呼ばない。
