<!-- Generated from docs/components/navigation.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](navigation.html) · [llms.txt](../../llms.txt)

# Navigation

ページ間の移動、表示内容の切り替え、階層・進捗・現在地を伝える部品です。リンクは通常のhrefで遷移し、タブ・ナビバーの開閉・項目のページ分割はdata-ui-*属性で動きます。

<a id="nav-navbar"></a>

## レスポンシブなナビバー

data-ui-navbarを付けると、PC（1024px以上）では展開し、タブレット・スマートフォンではメニューボタンで開閉します。Escapeとリンク選択で閉じます。閉じた項目はTab移動の対象から外れます。

```html
<nav class="navbar" data-ui-navbar aria-label="ワークスペースのメインメニュー">
        <a class="navbar-brand" href="../index.html"><span class="nav-icon" icon="mdi-folder-outline" aria-hidden="true"></span>Workspace</a>
        <button class="btn btn-outline-secondary btn-icon-only navbar-toggler" type="button" data-ui-navbar-toggle aria-label="メニュー" icon="mdi-menu"></button>
        <div class="navbar-collapse" data-ui-navbar-panel>
          <ul class="nav nav-pills">
            <li><a class="nav-link" href="#nav-navbar" aria-current="page">概要</a></li>
            <li><a class="nav-link" href="forms.html">フォーム</a></li>
            <li><button class="nav-link" type="button" data-ui-toggle="dropdown" data-ui-target="#navbar-resources">リソース<span class="nav-icon" icon="mdi-chevron-down" aria-hidden="true"></span></button></li>
          </ul>
          <div class="navbar-actions"><a class="btn btn-sm btn-outline-secondary" href="../getting-started.html">導入ガイド</a></div>
          <div id="navbar-resources" class="ui-dropdown-menu" data-ui-dropdown popover aria-label="リソース">
            <a class="ui-dropdown-item" href="icons.html">アイコン</a>
            <a class="ui-dropdown-item" href="color-palettes.html">配色</a>
            <a class="ui-dropdown-item" href="../templates.html">テンプレート</a>
          </div>
        </div>
      </nav>
```

タブレットでも展開したい場合はnavbarに`navbar-expand-tablet`を追加します（768px以上で展開）。同一ページに複数設置できます。JavaScriptが無効でもリンクは表示されます。

```html
<nav class="navbar navbar-expand-tablet" data-ui-navbar aria-label="タブレットから展開するメニュー">
        <a class="navbar-brand" href="../index.html">Kav-UI</a>
        <button class="btn btn-outline-secondary btn-icon-only navbar-toggler" type="button" data-ui-navbar-toggle aria-label="メニュー" icon="mdi-menu"></button>
        <div class="navbar-collapse" data-ui-navbar-panel>
          <ul class="nav"><li><a class="nav-link" href="../getting-started.html">ガイド</a></li><li><a class="nav-link" href="../templates.html">テンプレート</a></li></ul>
        </div>
      </nav>
```

<a id="nav-links"></a>

## リンク：ピル・下線・均等配置

現在のページにはaria-current="page"を付けます。nav-pillsは塗りつぶし、nav-underlineは下線です。通常のリンクなので、アプリでは選択状態を更新してください。カタログ内ではページ移動を止め、クリックやEnterで同じメニュー内の選択表示だけを切り替えます。

```html
<nav aria-label="関連コンポーネント"><ul class="nav nav-pills">
        <li><a class="nav-link" href="navigation.html" aria-current="page"><span class="nav-icon" icon="mdi-home-outline" aria-hidden="true"></span>Navigation</a></li>
        <li><a class="nav-link" href="buttons.html">Buttons</a></li>
        <li><a class="nav-link" href="forms.html">Forms</a></li>
        <li><span class="nav-link" aria-disabled="true">準備中</span></li>
      </ul></nav>
```

```html
<nav aria-label="下線のメニュー"><ul class="nav nav-underline nav-justified">
        <li><a class="nav-link" href="navigation.html" aria-current="page">概要</a></li>
        <li><a class="nav-link" href="calendar.html">スケジュール</a></li>
        <li><a class="nav-link" href="chart.html">レポート</a></li>
      </ul></nav>
```

nav-justifiedは等幅、nav-fillは項目の内容幅を保って余白を分けます。nav-smで小さく、nav-nowrapで折り返さず横スクロールできます。

```html
<nav aria-label="横スクロールできるメニュー"><ul class="nav nav-pills nav-sm nav-nowrap" tabindex="0">
        <li><a class="nav-link" href="navigation.html" aria-current="page">すべてのコンポーネント</a></li><li><a class="nav-link" href="layouts.html">レイアウト</a></li><li><a class="nav-link" href="forms.html">入力・操作</a></li><li><a class="nav-link" href="loading.html">ローディングと状態</a></li><li><a class="nav-link" href="animations.html">アニメーション</a></li>
      </ul></nav>
```

<a id="nav-vertical"></a>

## 縦並び：アイコン・説明・件数

nav-verticalで縦並びにします。nav-label内にnav-description、末尾にnav-metaを置けます。大きなサイドバーや階層メニューは[Sidebar](sidebar.html.md)を使用してください。

```html
<nav aria-label="設定カテゴリ"><ul class="nav nav-vertical">
        <li><a class="nav-link" href="forms.html"><span class="nav-icon" icon="mdi-account-outline" aria-hidden="true"></span><span class="nav-label">プロフィール<span class="nav-description">名前や公開情報を変更します</span></span></a></li>
        <li><a class="nav-link" href="navigation.html" aria-current="page"><span class="nav-icon" icon="mdi-bell-outline" aria-hidden="true"></span><span class="nav-label">通知<span class="nav-description">受信方法と通知履歴を管理します</span></span><span class="nav-meta badge badge-neutral" aria-label="未読3件">3</span></a></li>
        <li><a class="nav-link" href="theme-switcher.html"><span class="nav-icon" icon="mdi-cog-outline" aria-hidden="true"></span><span class="nav-label">表示設定<span class="nav-description">デザインとカラーパレット</span></span></a></li>
      </ul></nav>
```

<a id="nav-breadcrumb"></a>

## パンくず：階層とアイコン

```html
<nav aria-label="パンくず"><ol class="breadcrumb"><li><a href="../index.html">カタログ</a></li><li aria-current="page">Navigation</li></ol></nav>
```

```html
<nav aria-label="アイコン付きパンくず"><ol class="breadcrumb breadcrumb-chevron">
        <li><a href="../index.html"><span class="nav-icon" icon="mdi-home-outline" aria-hidden="true"></span>ホーム</a></li>
        <li><a href="../templates.html">テンプレート</a></li><li aria-current="page">ナビゲーションの設定</li>
      </ol></nav>
```

breadcrumb-chevronで区切りを山括弧へ変更します。長い階層は折り返します。現在地はリンクにせず、aria-current="page"を付けます。

<a id="nav-tabs"></a>

## タブ：内容の切り替え

左右矢印・Home・Endで移動して選択します。無効なタブは飛ばします。各グループで同じdata-ui-target名を再利用できます。

```html
<div data-ui-tabs>
        <div class="tabs" role="tablist" aria-label="プロジェクト">
          <button type="button" data-ui-toggle="tab" data-ui-target="overview" aria-selected="true">概要</button><button type="button" data-ui-toggle="tab" data-ui-target="activity">アクティビティ</button><button type="button" data-ui-toggle="tab" data-ui-target="settings">設定</button>
        </div>
        <div class="tab-panel" data-ui-panel="overview">プロジェクトの概要です。</div><div class="tab-panel" data-ui-panel="activity" hidden>10:30 — ドキュメントを更新しました。</div><div class="tab-panel" data-ui-panel="settings" hidden>通知や公開範囲を設定できます。</div>
      </div>
```

### 独立した2つ目のタブ

```html
<div data-ui-tabs>
        <div class="tabs tabs-pills tabs-equal" role="tablist" aria-label="チーム">
          <button type="button" data-ui-toggle="tab" data-ui-target="overview" aria-selected="true"><span class="nav-icon" icon="mdi-account-outline" aria-hidden="true"></span>概要</button><button type="button" data-ui-toggle="tab" data-ui-target="activity">履歴</button><button type="button" data-ui-toggle="tab" data-ui-target="settings" disabled>設定（権限なし）</button>
        </div>
        <div class="tab-panel" data-ui-panel="overview">チームの概要です。</div><div class="tab-panel" data-ui-panel="activity" hidden>チームの操作履歴です。</div><div class="tab-panel" data-ui-panel="settings" hidden>管理者向け設定です。</div>
      </div>
```

tabs-pillsはピル、tabs-equalは等幅です。項目が多い場合はtabs-scrollを追加すると横スクロールになり、矢印キーで移動したタブも表示範囲へ入ります。

<a id="nav-tabs-vertical"></a>

## 縦タブ・手動選択

tablistにaria-orientation="vertical"を付けると上下矢印で移動します。data-ui-tab-activation="manual"では矢印はフォーカスのみを移し、Enter・Space・クリックで表示を切り替えます。RTLでは横タブの左右方向も反転します。

```html
<div class="ui-tabs-vertical" data-ui-tabs data-ui-tab-activation="manual">
        <div class="tabs" role="tablist" aria-label="アカウント設定" aria-orientation="vertical">
          <button type="button" data-ui-toggle="tab" data-ui-target="profile" aria-selected="true"><span class="nav-icon" icon="mdi-account-outline" aria-hidden="true"></span>プロフィール</button><button type="button" data-ui-toggle="tab" data-ui-target="notifications"><span class="nav-icon" icon="mdi-bell-outline" aria-hidden="true"></span>通知</button><button type="button" data-ui-toggle="tab" data-ui-target="appearance"><span class="nav-icon" icon="mdi-cog-outline" aria-hidden="true"></span>表示設定</button>
        </div>
        <div class="tab-panel" data-ui-panel="profile"><h3>プロフィール</h3><p>名前や自己紹介を編集できます。</p><a href="forms.html">フォームを見る</a></div><div class="tab-panel" data-ui-panel="notifications" hidden><h3>通知</h3><p>メールやアプリ内通知を設定できます。</p><a href="toasts.html">通知を見る</a></div><div class="tab-panel" data-ui-panel="appearance" hidden><h3>表示設定</h3><p>明暗・質感・配色を選べます。</p><a href="theme-switcher.html">テーマ切り替えを見る</a></div>
      </div>
```

スマートフォンではタブ一覧の下に本文を配置します。キーボードの操作方向は縦のままです。

<a id="nav-pagination"></a>

## ページ送り：項目を分割表示

```html
<div data-ui-pagination data-ui-page-size="4">
        <ul><li data-ui-page-item>タスク 1</li><li data-ui-page-item>タスク 2</li><li data-ui-page-item>タスク 3</li><li data-ui-page-item>タスク 4</li><li data-ui-page-item>タスク 5</li><li data-ui-page-item>タスク 6</li><li data-ui-page-item>タスク 7</li><li data-ui-page-item>タスク 8</li><li data-ui-page-item>タスク 9</li><li data-ui-page-item>タスク 10</li><li data-ui-page-item>タスク 11</li><li data-ui-page-item>タスク 12</li></ul>
        <p data-ui-page-status role="status">全12件</p>
        <nav class="pagination pagination-rounded" aria-label="タスク一覧のページ送り">
          <button type="button" class="btn btn-sm btn-outline-secondary btn-icon-only" data-ui-page-step="-1" icon="mdi-arrow-left" aria-label="前のページ"></button><button type="button" class="btn btn-sm btn-outline-secondary" data-ui-page="1">1</button><button type="button" class="btn btn-sm btn-outline-secondary" data-ui-page="2">2</button><button type="button" class="btn btn-sm btn-outline-secondary" data-ui-page="3">3</button><button type="button" class="btn btn-sm btn-outline-secondary btn-icon-only" data-ui-page-step="1" icon="mdi-arrow-right" aria-label="次のページ"></button>
        </nav>
      </div>
```

### ページURLへ遷移するリンク型

```html
<nav class="pagination pagination-sm" aria-label="関連ページ">
        <span class="pagination-link" aria-disabled="true">前へ</span><a class="pagination-link" href="navigation.html" aria-current="page" aria-label="ページ1">1</a><a class="pagination-link" href="buttons.html" aria-label="ページ2">2</a><span class="pagination-ellipsis" aria-hidden="true">…</span><a class="pagination-link" href="forms.html" aria-label="ページ3">3</a><a class="pagination-link" href="buttons.html" aria-label="次のページ">次へ</a>
      </nav>
```

リンク型はCSSだけで使えます。実際のアプリではhrefを各ページのURLに変更してください。pagination-roundedで丸みを強め、pagination-smで小さくします。省略記号の生成やサーバーからの取得はアプリ側で実装します。

<a id="nav-steps"></a>

## ステップナビゲーション

完了した手順・現在の手順・次の手順を表示します。is-completeで完了、aria-current="step"で現在地を指定します。これはリンク型の部品で、フォームの検証や手順の更新はアプリ側で行います。

```html
<nav aria-label="プロジェクト作成の手順"><ol class="ui-steps">
        <li class="is-complete"><a class="ui-step-link" href="forms.html"><span class="ui-step-marker" icon="mdi-check" role="img" aria-label="完了"></span><span><span class="ui-step-title">基本情報</span><span class="ui-step-description">名前と説明</span></span></a></li>
        <li><a class="ui-step-link" href="#nav-steps" aria-current="step"><span class="ui-step-marker" aria-hidden="true">2</span><span><span class="ui-step-title">表示設定</span><span class="ui-step-description">配色とレイアウト</span></span></a></li>
        <li><span class="ui-step-link" aria-disabled="true"><span class="ui-step-marker" aria-hidden="true">3</span><span><span class="ui-step-title">確認</span><span class="ui-step-description">設定後に進めます</span></span></span></li>
      </ol></nav>
```

スマートフォンでは縦に並びます。常に縦並びにする場合はui-steps-verticalを追加してください。

<a id="nav-smooth-scroll"></a>

## スムーズスクロールと現在地の表示

ページ内リンクを滑らかに移動するには、`html`に`ui-scroll-smooth`を追加します。スクロールする領域に付ければ、その領域だけに適用できます。標準リンクのURL・履歴・キーボードの動作はそのままです。カタログの右目次で試せます。

```html
<html class="ui-scroll-smooth">
  <!-- 固定ヘッダーがある場合は、アプリ側のCSSで
       --ui-scroll-offset: 80px; などを指定します。 -->
  <a href="#overview">概要へ</a>
  <section id="overview" class="ui-scroll-target" tabindex="-1">...</section>
</html>
```

`data-ui-scroll-active`を付けると、`aria-current`を持つ項目が見える位置まで領域内を移動します。初期表示・現在地の変更・領域のサイズ変更に対応し、本文の位置やフォーカスを動かしません。下のボタンは現在地だけを変更するサンプルです。

```html
<p><button type="button" class="btn btn-sm btn-outline-secondary" data-demo-scroll-current="first">最初を選ぶ</button> <button type="button" class="btn btn-sm btn-outline-secondary" data-demo-scroll-current="last">最後を選ぶ</button></p>
      <div class="ui-scroll-region ui-scroll-smooth" data-ui-scroll-active id="scroll-active-demo">
        <nav class="nav nav-vertical" aria-label="現在地のスクロール例">
        <button type="button" class="nav-link" aria-current="page">セクション 01</button>
        <button type="button" class="nav-link">セクション 02</button>
        <button type="button" class="nav-link">セクション 03</button>
        <button type="button" class="nav-link">セクション 04</button>
        <button type="button" class="nav-link">セクション 05</button>
        <button type="button" class="nav-link">セクション 06</button>
        <button type="button" class="nav-link">セクション 07</button>
        <button type="button" class="nav-link">セクション 08</button>
        <button type="button" class="nav-link">セクション 09</button>
        <button type="button" class="nav-link">セクション 10</button>
        <button type="button" class="nav-link">セクション 11</button>
        <button type="button" class="nav-link">セクション 12</button>
        <button type="button" class="nav-link">セクション 13</button>
        <button type="button" class="nav-link">セクション 14</button>
        <button type="button" class="nav-link">セクション 15</button>
        <button type="button" class="nav-link">セクション 16</button>
        </nav>
      </div>
```

`data-ui-scroll-active="once"`を指定すると、現在地への移動を初期化時の1回だけにできます。折り畳みメニューでは、展開や手動スクロールの後に現在地へ引き戻されるのを防げます。カタログの左メニューはこの設定です。

`ui-scroll-region`は高さの上限が16remのスクロール領域です。`--ui-scroll-height`で高さを変更できます。独自のスクロール領域にも、そのまま`ui-scroll-smooth`と`data-ui-scroll-active`を指定できます。

```
// 現在地の変更はアプリ側で行います。
const region = document.querySelector('[data-ui-scroll-active]');
region.querySelector('[aria-current]')?.removeAttribute('aria-current');
region.querySelectorAll('.nav-link')[5].setAttribute('aria-current', 'page');

// DOM全体を作り直す前に破棄します。
KavUI.destroy(region);
```

OSの「動きを減らす」設定ではアニメーションせず移動します。滑らかなページ内リンクはCSSだけで動き、現在地の追跡には共通のui.jsを使います。別HTMLへのリンクは通常のページ遷移です。カタログでは左サイドバーの現在地表示と、右目次の本文への移動・現在地表示に適用しています。

<a id="nav-usage"></a>

## 指定方法とイベント

nav・breadcrumb・ui-steps・リンク型paginationはCSSだけで使えます。data-ui-navbar・data-ui-tabs・data-ui-paginationはui.jsも読み込みます。リンクナビゲーションとタブの役割を分け、ページへの移動にrole="tab"を付けないでください。

```
// ナビバーの開閉（ページ内に複数置いても個別に通知）
document.querySelector('[data-ui-navbar]').addEventListener('ui:navtoggle', event => {
  console.log(event.detail.expanded, event.detail.collapsible);
});

// タブの選択
document.querySelector('[data-ui-tabs]').addEventListener('ui:tabchange', event => {
  console.log(event.detail.tab, event.detail.panel);
});

// 表示ページの変更
document.querySelector('[data-ui-pagination]').addEventListener('ui:pagechange', event => {
  console.log(event.detail.page, event.detail.pageSize, event.detail.total);
});

// 後から追加した部品の初期化
KavUI.init(document.querySelector('#my-navigation'));
```

navtoggleのexpandedは展開状態、collapsibleはメニューボタンで折り畳める画面幅かを示します。画面幅の変更ではイベントを発火しません。

無効なリンクはhrefのないspanで表示するか、aria-disabled="true"とtabindex="-1"を指定します。共通JSはnav-link・ui-step-link・pagination-linkのaria-disabled付きリンクの遷移を防ぎます。無効なボタンにはdisabledを付けてください。

使用ファイル・取り込み方

共通のui.cssとui.jsを読み込み、サンプルのHTMLを配置します。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../../assets/css/ui.css) / [ui.js](../../assets/js/ui.js) / [属性一覧と導入例](../getting-started.html.md)

assetsフォルダごとコピーするとCSS内の相対参照も維持できます。catalog.js、catalog-navigation.js、catalog-demo.js、layout.cssはカタログ専用です。
