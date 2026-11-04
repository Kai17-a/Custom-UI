# @kav-ui/vue

Kav-UIのVue 3.5以降用コンポーネント。`@kav-ui/core` の同じバージョンとVueを使用します。

```vue
<script setup>
import {ref} from 'vue';
import '@kav-ui/core/style.css';
import {KavInput,KavField,KavButton,KavDialog} from '@kav-ui/vue';
const value=ref(''),open=ref(false);
</script>
<template>
  <KavField label="名前" for="name">
    <KavInput id="name" v-model="value" />
  </KavField>
  <KavButton @click="open=true">確認</KavButton>
  <KavDialog v-model="open" title="確認">{{ value }}</KavDialog>
</template>
```

値・開閉は `v-model`、構成はpropsとスロットで指定します。CSSを1回読み込んでください。サイドバーはVueのTeleportでDOMを管理し、選択欄・カレンダー等は不透明なHTML境界で共通JSを利用します。unmount時に監視とイベントを片付けます。SSRでのimportにブラウザAPIは必要ありません。

`KavWidget` のhtmlには開発者が管理する信頼済みHTMLだけを渡します。未専用化の既存部品もこのアダプターで使用できます。

全コンポーネント・対応範囲・Astroとの連携・ローカルtarball導入はソースの `packages/README.md` と `examples/vue` を参照してください。レジストリへの公開はしていません。

KavInput・KavSelectの`label`は読み上げ名を指定します。画面に項目名を表示する場合は、`KavField`の`label`・`for`と入力の`id`を組み合わせてください。

## 説明・エラーと入力の関連付け

`KavField`の`for="email"`を指定すると、説明には`email-hint`、エラーには`email-error`のIDが付きます。任意のIDには`hintId`・`errorId`を使えます。入力側の`aria-describedby`と`aria-invalid`はアプリで明示します。子要素や既存ARIA属性の自動書き換えは行いません。説明・エラーが表示されているときだけ対応するIDを参照し、既存の説明IDも残してください。

以下は`email`と`error`をアプリ側のrefとして用意した例です。

```vue
<KavField label="メール" for="email" hint="業務用アドレスを入力" :error="error">
  <KavInput id="email" v-model="email"
    :aria-describedby="error ? 'email-hint email-error' : 'email-hint'"
    :aria-invalid="error ? 'true' : undefined" />
</KavField>
```

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
