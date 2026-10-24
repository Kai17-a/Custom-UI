# @kav-ui/astro

Kav-UIのAstro用コンポーネント。静的HTMLと、必要な共通ブラウザJSを組み合わせます。Astro専用部品にVueは不要です。

```astro
---
import {KavProvider,KavCard,KavSelect} from '@kav-ui/astro';
---
<KavProvider />
<KavCard title="設定">
  <KavSelect label="プラン" name="plan" options={[{value:'personal',label:'個人'}]} />
</KavCard>
```

`KavProvider` をレイアウトで1回利用するとCSSを読み込みます。Providerを使わない場合は `@kav-ui/core/style.css` をimportしてください。対話的な部品は自分の初期化スクリプトを含みます。クライアント遷移では旧ページを後始末し、新ページを再初期化します。

単体importは `@kav-ui/astro/components/KavButton` のように拡張子なしで指定できます。全体のnamed exportも利用できます。

Vue版も使う場合は公式の `@astrojs/vue` を導入し、Vueコンポーネントへ `client:load` 等を指定します。Astro専用部品に `v-model` はなく、通常のHTMLフォームやCustomEventを使います。

対応範囲とAstro 7のSSR/prerender設定はソースの `packages/README.md`・`examples/astro` を参照してください。レジストリへの公開はしていません。
