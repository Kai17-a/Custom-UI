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

型は `@kav-ui/core` からimportできます。

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
import {KavPage,KavPageHeader,KavButton,KavGrid,KavCard} from '@kav-ui/vue';
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
import {KavPage,KavPageHeader,KavButton,KavGrid,KavCard} from '@kav-ui/astro';
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

## Tabs・Drawer・Textarea

- Vue/Astroの `KavTabs` は `items: {value,label,disabled?}[]` とvalue名のスロットを使用。Vueは `v-model`、Astroは `value` で初期選択（既定は最初の有効項目）。`label` は読み上げ名。Astroの `id` は生成IDの接頭辞で、同じ内容のタブを複数置く場合は異なるidを指定する。
- `KavDrawer` は `title`・`placement='end'`（start/end/top/bottom）、通常・footerスロット。Vueは真偽値の `v-model`、Astroは必須の `id` とDialogと同じ `data-ui-toggle="dialog"` / `data-ui-target` / `data-ui-dismiss="dialog"` で開閉する。
- Vueの `KavTextarea` は `label` をaria-label属性より優先。name/id/rows/placeholder/required/disabled/maxlengthを型付きで指定でき、v-modelとフォームresetの同期を維持する。
