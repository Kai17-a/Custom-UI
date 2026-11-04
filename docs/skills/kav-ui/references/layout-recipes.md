# 横並びのレイアウト例

画面の部品を横に並べるときの書き方。まず目的に合う例をそのまま使い、足りない部分だけを`fx-*`・`sp-*`で調整する。各例の「NG」は、エージェントが書きがちな崩れる書き方。書き終えたら[検査スクリプト](#書いたあとに検査する)を実行する。

## 先に知っておくこと

- **Bootstrap・Tailwindではない。** Kav-UIには互換用に`d-flex`・`gap-3`・`ms-auto`・`row`などが少しだけあるが、`justify-content-between`・`align-items-center`・`col-md-6`・`mb-3`・`items-center`などはない。ないクラスは何も起きないまま無視される。
- **`fx`が`display:flex`を持つ。** `fx-row`・`fx-justify-*`・`fx-items-*`・`fx-wrap`・`fx-gap-*`・`sp-gap-*`は並べ方の指定だけなので、同じ要素に`fx`（または`fx-grid`・`ui-cluster`などの並べる部品）が必要。
- **`fx-col-*`は`fx-grid`の直下だけで効く。** 間にdivを挟むと列幅が付かない。
- **伸びる要素には`fx-min-0`。** `fx-flex-1`の中に省略表示・表・コードがあると、最小幅が中身の幅になり行からはみ出す。
- **余白の単位を混ぜない。** `gap-3`は1rem、`fx-gap-3`・`sp-gap-3`は0.75rem。新しく書くときは`sp-*`・`fx-gap-*`だけを使う。
- **幅の切り替えは`tablet:`（768〜1023px）と`mobile:`（767px以下）。** Tailwindの`md:`・`lg:`と混ぜない。

## 用途から選ぶ

| 並べたいもの | 使うもの |
| --- | --- |
| ページの見出しと操作ボタン | `ui-page-header`・`ui-page-heading`・`ui-page-actions` |
| セクション・カードの見出し行 | `ui-section-header`、またはカード内で`fx fx-justify-between` |
| 検索・絞り込み・件数の帯 | `ui-toolbar`・`ui-toolbar-group`・`ui-toolbar-end` |
| ボタン・バッジ・リンクの横並び | `ui-cluster`（折り返す） |
| 縦に積む | `ui-stack` |
| ラベルと入力欄 | `fx fx-items-center`＋`mobile:fx-column` |
| 同じ幅のカード | `fx-grid fx-grid-3`、または列数自動の`ui-page-grid` |
| 8:4などの比率 | `fx-grid`＋子の`fx-col-8`・`fx-col-4` |
| 伸びる本文と固定幅の要素 | 本文に`fx-flex-1 fx-min-0`、固定側に`fx-shrink-0` |
| 本文とサイドの2カラム | `ui-page ui-page-with-rail` |

## ページの見出しと操作ボタン

見出しが長くても、ボタンは折り返して下に回る。

```html
<header class="ui-page-header">
  <div class="ui-page-heading">
    <h1 class="ui-page-title">プロジェクト</h1>
    <p class="ui-page-description">チームの進行状況を確認します。</p>
  </div>
  <div class="ui-page-actions">
    <button class="btn btn-outline-secondary" type="button">書き出し</button>
    <button class="btn btn-primary" type="button" icon="mdi-plus">新規作成</button>
  </div>
</header>
```

NG：Bootstrapのクラスは定義されていないため、見出しとボタンが縦に並ぶ。

```html
<!-- NG: foreign-class -->
<div class="d-flex justify-content-between align-items-center mb-3">
  <h1>プロジェクト</h1>
  <button class="btn btn-primary" type="button">新規作成</button>
</div>
```

## カードの見出し行

タイトルが長いときは省略し、右側のバッジは縮めない。

```html
<article class="ui-card">
  <div class="ui-card-header fx fx-justify-between fx-items-center sp-gap-3">
    <h2 class="ui-card-title sp-m-0 fx-flex-1 fx-min-0 type-truncate">デザインシステムの移行計画と進め方</h2>
    <span class="badge text-bg-success fx-shrink-0">進行中</span>
  </div>
  <div class="ui-card-body"><p class="ui-card-description">今月中に主要画面を移行します。</p></div>
</article>
```

NG：`fx`がないため`fx-row`・`fx-justify-between`が効かず、縦に並ぶ。

```html
<!-- NG: missing-flex-container -->
<div class="ui-card-header fx-row fx-justify-between fx-items-center">
  <h2 class="ui-card-title">デザインシステムの移行計画</h2>
  <span class="badge text-bg-success">進行中</span>
</div>
```

セクションの見出しとリンクなら、専用の`ui-section-header`を使う。

```html
<section class="ui-section">
  <header class="ui-section-header">
    <div>
      <h2 class="ui-section-title">通知設定</h2>
      <p class="ui-section-description">メールとアプリ内の通知を選びます。</p>
    </div>
    <a href="#notification-settings">編集する</a>
  </header>
</section>
```

## ツールバー

右端に寄せるグループには`ui-toolbar-end`を付ける。狭い幅では折り返す。

```html
<div class="ui-toolbar" role="group" aria-label="一覧の操作">
  <div class="ui-toolbar-group">
    <label for="project-search">検索</label>
    <input class="form-control form-control-sm" id="project-search" type="search" placeholder="プロジェクト名">
  </div>
  <div class="ui-toolbar-group ui-toolbar-end">
    <span class="type-caption">24件</span>
    <button class="btn btn-sm btn-outline-secondary" type="button">並べ替え</button>
  </div>
</div>
```

NG：`ml-auto`はTailwind・Bootstrap 4のクラスで、Kav-UIにはない。右寄せは`ui-toolbar-end`か`fx-ms-auto`。

```html
<!-- NG: foreign-class -->
<div class="ui-toolbar">
  <input class="form-control form-control-sm" type="search" aria-label="検索">
  <div class="ml-auto"><button class="btn btn-sm btn-outline-secondary" type="button">並べ替え</button></div>
</div>
```

## ボタン・バッジ・リンクの横並び

`ui-cluster`は中央揃え・折り返し・0.75remの間隔を持つ。間隔を変える場合だけ`sp-gap-*`を足す。

```html
<div class="ui-cluster">
  <button class="btn btn-primary" type="button">保存</button>
  <button class="btn btn-outline-secondary" type="button">キャンセル</button>
  <span class="badge badge-neutral">下書き</span>
</div>
```

NG：`sp-gap-2`は間隔だけで、並べる指定がない。

```html
<!-- NG: missing-flex-container -->
<div class="sp-gap-2">
  <button class="btn btn-primary" type="button">保存</button>
  <button class="btn btn-outline-secondary" type="button">キャンセル</button>
</div>
```

縦に積むときは`ui-stack`（1remの間隔）を使い、`<br>`や個別の`margin`で間を空けない。

```html
<div class="ui-stack">
  <p class="type-body">本文の段落</p>
  <div class="ui-cluster"><a href="#help">ヘルプ</a><a href="#contact">お問い合わせ</a></div>
</div>
```

## ラベルと入力欄

PC・タブレットでは横、スマートフォンでは縦に並べる。ラベルは縮めず、入力側を伸ばす。

```html
<div class="fx fx-items-center sp-gap-3 mobile:fx-column mobile:fx-items-stretch">
  <label class="fx-shrink-0" for="member-email">メールアドレス</label>
  <input class="form-control fx-flex-1 fx-min-0" id="member-email" type="email" name="email">
  <button class="btn btn-primary fx-shrink-0" type="button">招待</button>
</div>
```

縦に並ぶ通常のフォームは[フォーム](forms-navigation.md)の`field`を使う。

NG：Bootstrapのグリッドは使えない。Kav-UIの`row`は単純な折り返し行で、`col-*`は定義されていない。

```html
<!-- NG: bootstrap-grid -->
<div class="row">
  <label class="col-md-3" for="member-email-ng">メールアドレス</label>
  <div class="col-md-9"><input class="form-control" id="member-email-ng" type="email"></div>
</div>
```

## 同じ幅のカード

列数は`fx-grid-N`、間隔は`fx-gap-*`で指定する。幅の境目で列数を減らす。

```html
<div class="fx-grid fx-grid-3 tablet:fx-grid-2 mobile:fx-grid-1 fx-gap-4">
  <article class="ui-card"><div class="ui-card-body"><h3 class="ui-card-title">進行中</h3><p class="ui-card-stat">12</p></div></article>
  <article class="ui-card"><div class="ui-card-body"><h3 class="ui-card-title">完了</h3><p class="ui-card-stat">8</p></div></article>
  <article class="ui-card"><div class="ui-card-body"><h3 class="ui-card-title">保留</h3><p class="ui-card-stat">3</p></div></article>
</div>
```

列数を幅に任せる場合は`ui-page-grid`（1列あたり最小16rem）を使う。

```html
<div class="ui-page-grid">
  <article class="ui-card"><div class="ui-card-body">メンバー</div></article>
  <article class="ui-card"><div class="ui-card-body">アクティビティ</div></article>
</div>
```

NG：`fx-grid-3`だけでは並べる指定がない。`fx-grid`も付ける。

```html
<!-- NG: missing-flex-container -->
<div class="fx-grid-3 fx-gap-4">
  <article class="ui-card"><div class="ui-card-body">進行中</div></article>
  <article class="ui-card"><div class="ui-card-body">完了</div></article>
</div>
```

## 8:4などの比率

列は12分割。合計が12を超えると次の行へ回る。スマートフォンでは全幅にする。

```html
<div class="fx-grid fx-gap-4">
  <section class="fx-col-8 tablet:fx-col-7 mobile:fx-col-12 ui-card"><div class="ui-card-body">本文</div></section>
  <aside class="fx-col-4 tablet:fx-col-5 mobile:fx-col-12 ui-card"><div class="ui-card-body">補足</div></aside>
</div>
```

NG：`fx-col-*`と`fx-grid`の間にdivを挟むと、列幅が付かない。

```html
<!-- NG: column-outside-grid -->
<div class="fx-grid fx-gap-4">
  <div class="content">
    <section class="fx-col-8">本文</section>
    <aside class="fx-col-4">補足</aside>
  </div>
</div>
```

## 伸びる本文と固定幅の要素

一覧の行など、左にアイコン、中央に名前、右に操作を置く形。名前を省略するには、伸びる側に`fx-min-0`が必要。

```html
<div class="fx fx-items-center sp-gap-3">
  <span class="ui-avatar ui-avatar-sm" aria-hidden="true">KS</span>
  <div class="fx-flex-1 fx-min-0">
    <p class="sp-m-0 type-truncate">kav-ui-design-system-migration-plan-for-all-product-teams-2026.pdf</p>
    <p class="sp-m-0 type-caption type-color-muted">更新：今日</p>
  </div>
  <button class="btn btn-sm btn-ghost-secondary btn-icon-only fx-shrink-0" type="button" aria-label="メニュー">
    <span icon="mdi-dots-vertical" aria-hidden="true"></span>
  </button>
</div>
```

NG：`fx-min-0`がないため長いファイル名が省略されず、ボタンが押しつぶされるか行の外へはみ出す。

```html
<!-- NG: flex-item-overflow -->
<div class="fx fx-items-center sp-gap-3">
  <div class="fx-flex-1">
    <p class="type-truncate">kav-ui-design-system-migration-plan-for-all-product-teams-2026.pdf</p>
  </div>
  <button class="btn btn-sm btn-outline-secondary" type="button">開く</button>
</div>
```

## 本文とサイドの2カラム

`ui-layout`の幅が48rem以上になると、本文と右側の補足が横に並ぶ。狭い幅では縦に並ぶ。

```html
<div class="ui-container ui-layout">
  <div class="ui-page ui-page-with-rail">
    <div class="ui-page-body"><p class="type-body">本文</p></div>
    <aside class="ui-page-rail" aria-label="補足"><h2 class="ui-aside-title">詳細</h2><p class="type-caption">担当：デザインチーム</p></aside>
  </div>
</div>
```

左側のメニューは`ui-page-with-aside`と`ui-page-aside`。開閉できるアプリのサイドバーは[フォームとナビゲーション](forms-navigation.md)を参照する。

## 書いたあとに検査する

このスキルの`scripts/check_markup.py`は、HTML・Vue・Astroのマークアップから上記のNGを見つける。Python 3の標準ライブラリだけで動き、ネットワークは使わない。

```sh
python3 <スキルの場所>/scripts/check_markup.py src/
python3 <スキルの場所>/scripts/check_markup.py public/index.html --css public/assets/css/ui.css
python3 <スキルの場所>/scripts/check_markup.py src/ --app-css src/styles/app.css
```

- Kav-UIのクラス一覧は、`--css`で渡したui.css、`node_modules/@kav-ui/core`、検査するフォルダ内のui.css、スキル同梱の一覧の順に探す。アプリに入っている版に合わせるため、通常HTMLでは`--css`を渡す。
- アプリ独自のクラスはエラーにしない。ただし`text-`・`w-`などBootstrap・Tailwindに似た名前は、定義を渡さないと`foreign-class`になる。独自CSSは`--app-css`で渡すと、クラスの有無と`display:flex`の判定に使われる。`<style>`内の定義は自動で使う。
- 出力は`ファイル:行:列: error|warning [規則] 内容`。errorがあると終了コード1になる。`--strict`でwarningも失敗にできる。
- Vueの`:class`やAstroの`class:list`は、文字列で書かれたクラスだけを確認する。変数から作るクラスは確認できない。

| 規則 | 内容 |
| --- | --- |
| `foreign-class` | Bootstrap・Tailwind風のクラス。代わりのKav-UIクラスを表示する |
| `unknown-class` | `ui-`・`fx-`・`sp-`・`type-`などで始まるが、Kav-UIにないクラス |
| `missing-flex-container` | `fx`などの並べる指定がない要素に、並べ方・間隔だけを指定している |
| `column-outside-grid` | `fx-col-*`の親が`fx-grid`ではない |
| `item-outside-flex` | `fx-flex-1`などの親が並べる要素ではない |
| `bootstrap-grid` | `row`の子に`col-*`がある |
| `flex-item-overflow` | 伸びる要素に`fx-min-0`がなく、省略表示・表・コードを含む |
| `mixed-breakpoints` | `tablet:`・`mobile:`と`md:`・`lg:`を同じ要素に混ぜている |
| `legacy-utility` | 余白の単位が違う互換用クラス。`sp-*`・`fx-*`への置き換え先を表示する |

検査は書き方の誤りを見つけるもので、表示の確認の代わりにはならない。最後に、PC・タブレット・スマートフォンの幅で表示を確認する。
