# レイアウトとスタイル

CSSを読み込むとクラスなしの見出し・本文・標準入力にも基本デザインが適用される。部品の構造とユーティリティは以下から選ぶ。

## ページ・カード・Flex

```html
<main class="ui-container sp-py-6">
  <h1 class="type-title">プロジェクト</h1>
  <p class="type-body type-color-muted">チームの進行状況を確認します。</p>
  <div class="fx-grid fx-grid-3 tablet:fx-grid-2 mobile:fx-grid-1 fx-gap-4">
    <article class="ui-card"><div class="ui-card-body"><h2 class="ui-card-title">概要</h2><p>現在の状態</p></div></article>
    <article class="ui-card"><div class="ui-card-body">履歴</div></article>
    <article class="ui-card"><div class="ui-card-body">設定</div></article>
  </div>
</main>
```

| 機能 | クラス・構造 |
| --- | --- |
| ページ全体 | bodyの`ui-app`、mainの`ui-app-main`、幅の制限に`ui-container` |
| カード | `ui-card`内に必要に応じて`ui-card-header`、`ui-card-body`、`ui-card-footer` |
| Flex | `fx`、`fx-row` / `fx-column`、`fx-wrap` / `fx-nowrap` |
| 主軸・交差軸 | `fx-justify-start` / `center` / `end` / `between`、`fx-items-start` / `center` / `end` / `stretch` |
| 均等グリッド | `fx-grid fx-grid-2` / `fx-grid-3` / `fx-grid-4` |
| 12カラム | `fx-grid`内の子へ`fx-col-4`・`fx-col-8`など |
| 表示・幅 | `ui-hidden`、`ui-block`、`ui-flex`、`ui-w-full`、`ui-w-auto` |
| 横長の表 | `ui-table-scroll`で囲み、`tabindex="0" role="region" aria-label="…"`を指定 |

`tablet:`は768〜1023px、`mobile:`は767px以下でのみ上書きし、PCは通常のクラスを使う。例：`mobile:fx-column`、`tablet:fx-grid-2`、`mobile:ui-w-full`。端末別指定と「その幅以上」の旧md/lg指定を同じプロパティへ混在させない。

## 余白と文字

余白の数値は`0 / 1 / 2 / 3 / 4 / 6 / 8 / 12`。基本の1単位は4px相当のrem値。

- 内側：`sp-p-4`、`sp-px-4`、`sp-py-6`。外側：`sp-m-0`、`sp-mt-4`、`sp-mx-auto`。
- 間隔：`sp-gap-3`、`sp-gap-x-4`、`sp-gap-y-2`。均等グリッドには`fx-gap-4`も使える。
- 役割：`type-title`、`type-heading`、`type-body`、`type-caption`、`type-mono`、`type-prose`。
- 大きさ：`type-size-xs` / `sm` / `base` / `lg` / `xl` / `2xl` / `3xl` / `4xl` / `5xl`。
- 太さ：`type-weight-normal` / `medium` / `semibold` / `bold`。
- 色：`type-color-muted`、`type-color-primary`、`type-color-success`、`type-color-danger`、`type-color-warning`、`type-color-info`。
- 長文：`type-wrap`、1行省略は`type-truncate`。アプリ側で省略領域の幅も確認する。

`mobile:sp-p-3`、`tablet:type-size-xl`のように切り替えられる。余白を調整するときは、まず既存クラスで表現し、任意の値が必要な場合にトークンやアプリのCSSを使う。

## ボタン・アイコン

```html
<button class="btn btn-primary" type="button" icon="mdi-check">保存</button>
<button class="btn btn-outline-danger" type="button">削除を確認</button>
<button class="btn btn-soft-primary btn-sm" type="button">詳細</button>
<button class="btn btn-ghost-secondary btn-icon-only" type="button" aria-label="設定">
  <span icon="mdi-cog" aria-hidden="true"></span>
</button>
```

色はprimary / secondary / success / danger / warning / info。塗りは`btn-{色}`、枠は`btn-outline-{色}`、淡い背景は`btn-soft-{色}`、背景なしは`btn-ghost-{色}`。HTML版の小サイズは`btn-sm`。Vue/AstroのpropsとHTMLのclassは同じ表記とは限らない。

`icon="mdi-home"`などの同梱アイコンはJSがSVGへ展開する。例のほか、`mdi-menu`・`mdi-close`・`mdi-content-copy`・`mdi-magnify`・`mdi-view-dashboard`を使える。装飾は`aria-hidden`、アイコンだけのボタンには名前を付ける。同梱名にないMDIを外部から自動取得する設計ではない。

## 明暗・質感・配色

| 設定 | 宣言またはAPI |
| --- | --- |
| 明暗 | htmlの`data-bs-theme="light"` / `dark`、追従は`KavUI.setColorTheme('system', {persist:true})` |
| 質感 | bodyの`data-ui-theme="default"` / `glass` / `glassmorphism` / `flat` / `soft` |
| パレット | htmlの`data-ui-palette="default"` / `slate` / `sage` / `teal` / `mauve` / `sand` / `clay` |
| 実行中の変更 | `KavUI.setDesignTheme('glass', {persist:true})`、`KavUI.setPalette('sage', {persist:true})` |
| カスタム色 | `KavUI.setCustomPalette('#7d6b91', {chroma:24, persist:true})`。chromaは0〜32 |

明暗用ボタンは`data-ui-color-mode="light|dark|system"`のいずれか1値、質感用は`data-ui-design="glass"`、配色用は`data-ui-palette-value="sage"`を指定する。縦線で並べた値は選択肢であり、そのまま属性に書かない。

保存済み設定を初回から復元する場合は、`theme-init.js`をCSSより前へ同期で読み込み、bodyに`data-ui-theme-persist`を付ける。追加のCSSは`--bs-body-bg`・`--bs-body-color`・`--bs-border-color`・`--bs-primary`などに合わせ、テーマ固有の色をハードコードしない。
