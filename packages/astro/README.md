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

## Tabs・Drawer

`KavTabs` は `items: {value,label,disabled?}[]` と各 `value` と同名のスロットを受け取ります。`value` は初期選択で、省略時や無効な値の場合は最初の有効な項目を選びます。`label` はタブ一覧の読み上げ名です。`id` を指定するとタブとパネルのIDの接頭辞になります。省略時は項目とlabelから決定的に生成します。同じ内容のタブを複数置くときは、それぞれ異なる `id` を指定してください。

`KavDrawer` は必須の `id`、`title`、`label`、`placement="start|end|top|bottom"`（既定は `end`）を受け取ります。本文は通常スロット、下部の操作は `footer` スロットです。`KavDialog` と同じ `data-ui-toggle="dialog"`・`data-ui-target`・`data-ui-dismiss="dialog"` で開閉し、Escapeでも閉じられます。

```astro
<KavTabs id="project-tabs" label="プロジェクト"
  items={[{value:'overview',label:'概要'},{value:'activity',label:'履歴'}]}>
  <p slot="overview">プロジェクトの概要</p>
  <p slot="activity">操作履歴</p>
</KavTabs>
<KavButton data-ui-toggle="dialog" data-ui-target="#settings-drawer">設定</KavButton>
<KavDrawer id="settings-drawer" title="設定">
  <p>設定の内容</p>
  <KavButton slot="footer" data-ui-dismiss="dialog">閉じる</KavButton>
</KavDrawer>
```

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
