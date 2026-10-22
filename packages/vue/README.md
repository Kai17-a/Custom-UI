# @kav-ui/vue

Kav-UIのVue 3.5以降用コンポーネント。`@kav-ui/core` の同じバージョンとVueを使用します。

```vue
<script setup>
import {ref} from 'vue';
import '@kav-ui/core/style.css';
import {KavInput,KavButton,KavDialog} from '@kav-ui/vue';
const value=ref(''),open=ref(false);
</script>
<template>
  <KavInput v-model="value" label="名前" />
  <KavButton @click="open=true">確認</KavButton>
  <KavDialog v-model="open" title="確認">{{ value }}</KavDialog>
</template>
```

値・開閉は `v-model`、構成はpropsとスロットで指定します。CSSを1回読み込んでください。サイドバーはVueのTeleportでDOMを管理し、選択欄・カレンダー等は不透明なHTML境界で共通JSを利用します。unmount時に監視とイベントを片付けます。SSRでのimportにブラウザAPIは必要ありません。

`KavWidget` のhtmlには開発者が管理する信頼済みHTMLだけを渡します。未専用化の既存部品もこのアダプターで使用できます。

全コンポーネント・対応範囲・Astroとの連携・ローカルtarball導入はソースの `packages/README.md` と `examples/vue` を参照してください。レジストリへの公開はしていません。
