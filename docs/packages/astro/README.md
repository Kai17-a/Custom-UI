# @kav-ui/astro

Kav-UIのAstro用コンポーネント。静的HTMLと、必要な共通ブラウザJSを組み合わせます。Astro専用部品にVueは不要です。

```astro
---
import {KavProvider,KavCard,KavField,KavSelect} from '@kav-ui/astro';
---
<KavProvider />
<KavCard title="設定">
  <KavField label="プラン" for="plan">
    <KavSelect id="plan" name="plan" options={[{value:'personal',label:'個人'}]} />
  </KavField>
</KavCard>
```

`KavProvider` をレイアウトで1回利用するとCSSを読み込みます。Providerを使わない場合は `@kav-ui/core/style.css` をimportしてください。対話的な部品は自分の初期化スクリプトを含みます。クライアント遷移では旧ページを後始末し、新ページを再初期化します。

単体importは `@kav-ui/astro/components/KavButton` のように拡張子なしで指定できます。全体のnamed exportも利用できます。

Vue版も使う場合は公式の `@astrojs/vue` を導入し、Vueコンポーネントへ `client:load` 等を指定します。Astro専用部品に `v-model` はなく、通常のHTMLフォームやCustomEventを使います。

対応範囲とAstro 7のSSR/prerender設定はソースの `packages/README.md`・`examples/astro` を参照してください。レジストリへの公開はしていません。

KavInput・KavSelectの`label`は読み上げ名を指定します。画面に項目名を表示する場合は、`KavField`の`label`・`for`と入力の`id`を組み合わせてください。

## 説明・エラーと入力の関連付け

`KavField`の`for="email"`を指定すると、説明には`email-hint`、エラーには`email-error`のIDが付きます。任意のIDには`hintId`・`errorId`を使えます。入力側の`aria-describedby`と`aria-invalid`はアプリで明示します。子要素や既存ARIA属性の自動書き換えは行いません。説明・エラーが表示されているときだけ対応するIDを参照し、既存の説明IDも残してください。

以下は`error`をページ側で用意した例です。

```astro
<KavField label="メール" for="email" hint="業務用アドレスを入力" error={error}>
  <KavInput id="email" name="email"
    aria-describedby={error ? 'email-hint email-error' : 'email-hint'}
    aria-invalid={error ? 'true' : undefined} />
</KavField>
```
