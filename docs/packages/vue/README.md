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
