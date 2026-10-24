<!-- Generated from docs/components/sidebar.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](sidebar.html) · [llms.txt](../../llms.txt)

# Sidebar

アプリ用サイドバー。カタログ本体のナビゲーションとは独立して取り込めるサンプルです。

## グループ・現在地・折りたたみ

```html
<p class="dim small">ボタンで表示を切り替えられます。リンクから関連コンポーネントへ移動します。狭い画面では上下に並びます。</p>
<button type="button" class="btn btn-sm btn-outline-secondary" data-ui-toggle="sidebar" data-ui-target="#sample-sidebar" data-ui-label-open="サイドバーを隠す" data-ui-label-closed="サイドバーを表示" aria-expanded="true" aria-controls="sample-sidebar">サイドバーを隠す</button>
<div class="app-shell">
  <aside id="sample-sidebar" class="app-sidebar" aria-label="アプリのサイドバー">
    <h2 class="app-sidebar-title">My workspace</h2>
    <nav class="app-sidebar-group" aria-label="ワークスペース">
      <h3>ワークスペース</h3>
      <a href="sidebar.html" aria-current="page">サイドバー</a>
      <a href="board.html">タスク <span class="type-caption">5件</span></a>
      <a href="table.html">プロジェクト一覧</a>
      <details open><summary>設定</summary><a href="forms.html">基本設定</a><a href="tips.html">ヘルプ</a></details>
    </nav>
    <p class="app-sidebar-footer">個人用ワークスペース<br>Free plan</p>
  </aside>
  <section class="app-content" aria-labelledby="workspace-title">
    <h2 id="workspace-title" class="type-heading">ワークスペース</h2>
    <p class="type-body">よく使う機能をサイドバーにまとめます。現在地は背景色と太字で示します。</p>
    <p class="type-caption">隠したメニューはTab移動の対象からも外れます。</p>
  </section>
</div>
```

<a id="sidebar-icons"></a>

## アイコン・ラベル・件数・子メニュー

アイコンには`sidebar-icon`、文字には`sidebar-label`、右側の件数や補足には`sidebar-meta`を指定します。アイコンは文字色を引き継ぎ、選択中の色にも連動します。

```html
<div class="app-shell">
  <aside class="app-sidebar" aria-label="アイコン付きメニュー">
    <h2 class="app-sidebar-title">My workspace</h2>
    <nav class="app-sidebar-group" aria-label="アイコン付きワークスペース">
      <a href="sidebar.html" aria-current="page"><svg class="sidebar-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z"></path></svg><span class="sidebar-label">概要</span></a>
      <a href="board.html"><svg class="sidebar-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M7,5H21V7H7V5M7,13V11H21V13H7M4,4.5A1.5,1.5 0 0,1 5.5,6A1.5,1.5 0 0,1 4,7.5A1.5,1.5 0 0,1 2.5,6A1.5,1.5 0 0,1 4,4.5M4,10.5A1.5,1.5 0 0,1 5.5,12A1.5,1.5 0 0,1 4,13.5A1.5,1.5 0 0,1 2.5,12A1.5,1.5 0 0,1 4,10.5M7,19V17H21V19H7M4,16.5A1.5,1.5 0 0,1 5.5,18A1.5,1.5 0 0,1 4,19.5A1.5,1.5 0 0,1 2.5,18A1.5,1.5 0 0,1 4,16.5Z"></path></svg><span class="sidebar-label">タスク</span><span class="sidebar-meta" aria-label="未完了5件">5</span></a>
      <a href="table.html"><svg class="sidebar-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z"></path></svg><span class="sidebar-label">共有プロジェクトとチームの資料</span><span class="sidebar-meta">12</span></a>
      <details open><summary><svg class="sidebar-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"></path></svg><span class="sidebar-label">設定</span></summary>
        <a href="forms.html"><svg class="sidebar-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"></path></svg><span class="sidebar-label">基本設定</span></a>
        <a href="tips.html"><svg class="sidebar-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M15.07,11.25L14.17,12.17C13.45,12.89 13,13.5 13,15H11V14.5C11,13.39 11.45,12.39 12.17,11.67L13.41,10.41C13.78,10.05 14,9.55 14,9C14,7.89 13.1,7 12,7A2,2 0 0,0 10,9H8A4,4 0 0,1 12,5A4,4 0 0,1 16,9C16,9.88 15.64,10.67 15.07,11.25M13,19H11V17H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,6.47 17.5,2 12,2Z"></path></svg><span class="sidebar-label">ヘルプ</span></a>
      </details>
    </nav>
    <p class="app-sidebar-footer">個人用ワークスペース</p>
  </aside>
  <section class="app-content" aria-labelledby="sidebar-icons-title"><h2 class="type-heading" id="sidebar-icons-title">アイコン付きサイドバー</h2><p class="type-body">アイコンの幅を揃え、文字は残りの幅を使います。長い名前は折り返し、件数と開閉矢印は右に配置します。</p><p class="type-caption">Tab・Enterでリンクの移動と子メニューの開閉ができます。</p></section>
</div>
```

[MDIアイコンのSVG](mdi-icons.html.md)や、`span.sidebar-icon`で囲ったアイコンも使えます。装飾アイコンには`aria-hidden="true"`を付け、リンク名は文字で指定してください。塗りのSVGには`fill="currentColor"`、線のSVGには`fill="none" stroke="currentColor"`を指定します。JavaScriptの追加設定は不要です。

<a id="sidebar-responsive"></a>

## レスポンシブ：ハンバーガー・アイコン表示

スマートフォンではメニューを左右のドロワーで表示します。タブレットではアイコンだけのレール、PCでは通常表示になります。メニューボタンでレールから文字付きに戻せます。

```html
<div class="app-shell" id="sidebar-responsive-demo" data-ui-sidebar data-ui-sidebar-mobile="drawer" data-ui-sidebar-tablet="rail" data-ui-sidebar-desktop="expanded" data-ui-sidebar-side="start">
  <aside class="app-sidebar" aria-label="メニューのナビゲーション">
    <h3 class="app-sidebar-title">Workspace</h3>
    <nav class="app-sidebar-group" aria-label="メニューのページ">
      <a href="sidebar.html" aria-current="page"><span class="sidebar-icon" icon="mdi-home" aria-hidden="true"></span><span class="sidebar-label">概要</span></a>
      <a href="board.html"><span class="sidebar-icon" icon="mdi-view-dashboard" aria-hidden="true"></span><span class="sidebar-label">タスク</span><span class="sidebar-meta">5</span></a>
      <details><summary><span class="sidebar-icon" icon="mdi-cog" aria-hidden="true"></span><span class="sidebar-label">設定</span></summary>
        <a href="forms.html"><span class="sidebar-icon" icon="mdi-account" aria-hidden="true"></span><span class="sidebar-label">アカウント</span></a>
        <a href="tips.html"><span class="sidebar-icon" icon="mdi-information-outline" aria-hidden="true"></span><span class="sidebar-label">ヘルプ</span></a>
      </details>
    </nav>
    <p class="app-sidebar-footer">Free plan</p>
  </aside>
  <section class="app-content" aria-labelledby="sidebar-responsive-demo-title">
    <button type="button" class="btn btn-outline-secondary" data-ui-toggle="sidebar-responsive" data-ui-target="#sidebar-responsive-demo" aria-label="メニューを切り替える"><span icon="mdi-menu" aria-hidden="true"></span>メニュー</button>
    <h3 id="sidebar-responsive-demo-title" class="sp-mt-4">作業スペース</h3>
    <p>メニューの表示方法は画面幅で切り替わります。アイコンだけの状態でもリンク名を読み上げられます。</p>
  </section>
</div>
```

<a id="sidebar-rail"></a>

## PC・タブレットでアイコンのみ

両方に `rail` を指定すると常にコンパクトな状態から始まります。サイドパネルのアイコンと文字付きボタンの例です。文字付きに展開すればフッターや件数も表示します。アイコンのないリンクは文字を残します。

```html
<div class="app-shell" id="sidebar-rail-demo" data-ui-sidebar data-ui-sidebar-mobile="drawer" data-ui-sidebar-tablet="rail" data-ui-sidebar-desktop="rail" data-ui-sidebar-side="end">
  <aside class="app-sidebar" aria-label="メニューを展開・縮小のナビゲーション">
    <h3 class="app-sidebar-title">Workspace</h3>
    <nav class="app-sidebar-group" aria-label="メニューを展開・縮小のページ">
      <a href="sidebar.html" aria-current="page"><span class="sidebar-icon" icon="mdi-home" aria-hidden="true"></span><span class="sidebar-label">概要</span></a>
      <a href="board.html"><span class="sidebar-icon" icon="mdi-view-dashboard" aria-hidden="true"></span><span class="sidebar-label">タスク</span><span class="sidebar-meta">5</span></a>
      <details><summary><span class="sidebar-icon" icon="mdi-cog" aria-hidden="true"></span><span class="sidebar-label">設定</span></summary>
        <a href="forms.html"><span class="sidebar-icon" icon="mdi-account" aria-hidden="true"></span><span class="sidebar-label">アカウント</span></a>
        <a href="tips.html"><span class="sidebar-icon" icon="mdi-information-outline" aria-hidden="true"></span><span class="sidebar-label">ヘルプ</span></a>
      </details>
    </nav>
    <p class="app-sidebar-footer">Free plan</p>
  </aside>
  <section class="app-content" aria-labelledby="sidebar-rail-demo-title">
    <button type="button" class="btn btn-outline-secondary" data-ui-toggle="sidebar-responsive" data-ui-target="#sidebar-rail-demo" aria-label="メニューを展開・縮小を切り替える"><span icon="mdi-chevron-right" aria-hidden="true"></span>メニューを展開・縮小</button>
    <h3 id="sidebar-rail-demo-title" class="sp-mt-4">作業スペース</h3>
    <p>メニューの表示方法は画面幅で切り替わります。アイコンだけの状態でもリンク名を読み上げられます。</p>
  </section>
</div>
```

<a id="sidebar-collapse"></a>

## 本文内で折り畳むメニュー

スマートフォンで `collapse` を指定すると、本文の前にメニューを展開します。画面全体を覆わずに選択できます。PC・タブレットでもボタンから表示・非表示を切り替えられます。

```html
<div class="app-shell" id="sidebar-collapse-demo" data-ui-sidebar data-ui-sidebar-mobile="collapse" data-ui-sidebar-tablet="hidden" data-ui-sidebar-desktop="expanded" data-ui-sidebar-side="start">
  <aside class="app-sidebar" aria-label="ページ一覧のナビゲーション">
    <h3 class="app-sidebar-title">Workspace</h3>
    <nav class="app-sidebar-group" aria-label="ページ一覧のページ">
      <a href="sidebar.html" aria-current="page"><span class="sidebar-icon" icon="mdi-home" aria-hidden="true"></span><span class="sidebar-label">概要</span></a>
      <a href="board.html"><span class="sidebar-icon" icon="mdi-view-dashboard" aria-hidden="true"></span><span class="sidebar-label">タスク</span><span class="sidebar-meta">5</span></a>
      <details><summary><span class="sidebar-icon" icon="mdi-cog" aria-hidden="true"></span><span class="sidebar-label">設定</span></summary>
        <a href="forms.html"><span class="sidebar-icon" icon="mdi-account" aria-hidden="true"></span><span class="sidebar-label">アカウント</span></a>
        <a href="tips.html"><span class="sidebar-icon" icon="mdi-information-outline" aria-hidden="true"></span><span class="sidebar-label">ヘルプ</span></a>
      </details>
    </nav>
    <p class="app-sidebar-footer">Free plan</p>
  </aside>
  <section class="app-content" aria-labelledby="sidebar-collapse-demo-title">
    <button type="button" class="btn btn-outline-secondary" data-ui-toggle="sidebar-responsive" data-ui-target="#sidebar-collapse-demo" aria-label="ページ一覧を切り替える"><span icon="mdi-chevron-down" aria-hidden="true"></span>ページ一覧</button>
    <h3 id="sidebar-collapse-demo-title" class="sp-mt-4">作業スペース</h3>
    <p>メニューの表示方法は画面幅で切り替わります。アイコンだけの状態でもリンク名を読み上げられます。</p>
  </section>
</div>
```

<a id="sidebar-top"></a>

## 上から開くメニュー

`top` を指定すると画面の上端からシートとして開きます。この例はPC・タブレット・スマートフォンで上から開きます。ドロワーとシートは Escape・背景クリック・閉じるボタンで閉じ、起点のボタンにフォーカスを戻します。

```html
<div class="app-shell" id="sidebar-top-demo" data-ui-sidebar data-ui-sidebar-mobile="top" data-ui-sidebar-tablet="top" data-ui-sidebar-desktop="top" data-ui-sidebar-side="start">
  <aside class="app-sidebar" aria-label="上から開くナビゲーション">
    <h3 class="app-sidebar-title">Workspace</h3>
    <nav class="app-sidebar-group" aria-label="上部メニューのページ">
      <a href="sidebar.html" aria-current="page"><span class="sidebar-icon" icon="mdi-home" aria-hidden="true"></span><span class="sidebar-label">概要</span></a>
      <a href="board.html"><span class="sidebar-icon" icon="mdi-view-dashboard" aria-hidden="true"></span><span class="sidebar-label">タスク</span><span class="sidebar-meta">5</span></a>
      <details><summary><span class="sidebar-icon" icon="mdi-cog" aria-hidden="true"></span><span class="sidebar-label">設定</span></summary>
        <a href="forms.html"><span class="sidebar-icon" icon="mdi-account" aria-hidden="true"></span><span class="sidebar-label">アカウント</span></a>
        <a href="tips.html"><span class="sidebar-icon" icon="mdi-information-outline" aria-hidden="true"></span><span class="sidebar-label">ヘルプ</span></a>
      </details>
    </nav>
    <p class="app-sidebar-footer">Free plan</p>
  </aside>
  <section class="app-content" aria-labelledby="sidebar-top-demo-title">
    <button type="button" class="btn btn-outline-secondary" data-ui-toggle="sidebar-responsive" data-ui-target="#sidebar-top-demo" aria-label="ナビゲーションを切り替える"><span icon="mdi-chevron-down" aria-hidden="true"></span>ナビゲーション</button>
    <h3 id="sidebar-top-demo-title" class="sp-mt-4">作業スペース</h3>
    <p>このボタンで画面の上端からメニューを開きます。本文の位置は変わりません。</p>
  </section>
</div>
```

<a id="sidebar-bottom"></a>

## 下から開くメニュー

`bottom` を指定すると画面の下端からシートとして開きます。この例はPC・タブレット・スマートフォンで下から開きます。ドロワーとシートは Escape・背景クリック・閉じるボタンで閉じ、起点のボタンにフォーカスを戻します。

```html
<div class="app-shell" id="sidebar-bottom-demo" data-ui-sidebar data-ui-sidebar-mobile="bottom" data-ui-sidebar-tablet="bottom" data-ui-sidebar-desktop="bottom" data-ui-sidebar-side="start">
  <aside class="app-sidebar" aria-label="下から開くナビゲーション">
    <h3 class="app-sidebar-title">Workspace</h3>
    <nav class="app-sidebar-group" aria-label="下部メニューのページ">
      <a href="sidebar.html" aria-current="page"><span class="sidebar-icon" icon="mdi-home" aria-hidden="true"></span><span class="sidebar-label">概要</span></a>
      <a href="board.html"><span class="sidebar-icon" icon="mdi-view-dashboard" aria-hidden="true"></span><span class="sidebar-label">タスク</span><span class="sidebar-meta">5</span></a>
      <details><summary><span class="sidebar-icon" icon="mdi-cog" aria-hidden="true"></span><span class="sidebar-label">設定</span></summary>
        <a href="forms.html"><span class="sidebar-icon" icon="mdi-account" aria-hidden="true"></span><span class="sidebar-label">アカウント</span></a>
        <a href="tips.html"><span class="sidebar-icon" icon="mdi-information-outline" aria-hidden="true"></span><span class="sidebar-label">ヘルプ</span></a>
      </details>
    </nav>
    <p class="app-sidebar-footer">Free plan</p>
  </aside>
  <section class="app-content" aria-labelledby="sidebar-bottom-demo-title">
    <button type="button" class="btn btn-outline-secondary" data-ui-toggle="sidebar-responsive" data-ui-target="#sidebar-bottom-demo" aria-label="ナビゲーションを切り替える"><span icon="mdi-dots-horizontal" aria-hidden="true"></span>ナビゲーション</button>
    <h3 id="sidebar-bottom-demo-title" class="sp-mt-4">作業スペース</h3>
    <p>このボタンで画面の下端からメニューを開きます。本文の位置は変わりません。</p>
  </section>
</div>
```

<a id="sidebar-responsive-api"></a>

## レスポンシブの指定方法

| 指定 | 動作 |
| --- | --- |
| `.app-shell[data-ui-sidebar]` | レスポンシブの動作を有効化。直下に `.app-sidebar` を1つ配置 |
| `data-ui-sidebar-mobile` | 768px未満：`drawer`（標準）、`collapse`、`top`、`bottom` |
| `data-ui-sidebar-tablet` | 768〜1023px：`expanded`（標準）、`rail`、`hidden`、`top`、`bottom` |
| `data-ui-sidebar-desktop` | 1024px以上：`expanded`（標準）、`rail`、`hidden`、`top`、`bottom` |
| `data-ui-sidebar-side="end"` | ドロワーを右側から表示。省略時は左側。RTLでは反転 |
| `data-ui-toggle="sidebar-responsive"` | ボタンの `data-ui-target` に app-shell のIDを指定。見た目はハンバーガー・文字・矢印・三点リーダーなど自由に設定 |
| `.sidebar-icon / .sidebar-label / .sidebar-meta` | アイコン・リンク名・件数。レールでは文字を視覚的に隠し、読み上げ用の名前は維持。リンクには title も補完 |
| `.sidebar-expanded-only` | レールで隠したい追加コンテンツに指定 |

`top` / `bottom` は画面の上端 / 下端から開くオーバーレイです。`collapse` は本文の前に展開するインライン表示です。画面区分ごとに別の表示方法を指定できます。

`expanded` は文字付き、`rail` はアイコンのみ、`hidden` は非表示から始めます。どの状態もボタンで展開・縮小できます。

ドロワーは元のサイドバーを一時的に body 直下の dialog へ移します。IDや入力状態は維持し、閉じると元の場所へ戻します。フォーム等の祖先要素に依存する場合は、その要素もサイドバー内に配置してください。通常のリンクを選ぶとドロワーを閉じます。画面区分が変わると、その区分の初期表示へ戻ります。JavaScript無効時は通常のメニューを表示します。

```
KavUI.sidebar('#sidebar-responsive-demo', {open: true});
KavUI.sidebar('#sidebar-responsive-demo', {open: false});
const state = KavUI.sidebar('#sidebar-responsive-demo'); // {mode, open}
// app-shell の ui:sidebarchange で event.detail.mode / open を取得
```

`--ui-sidebar-width`（標準15rem）・`--ui-sidebar-rail-width`（標準4.5rem）で幅を調整できます。従来の `data-ui-toggle="sidebar"` は全体を隠す既存動作のままです。新しいサイドバーには `sidebar-responsive` を使います。

サイドバー内の現在地を滑らかに表示する場合は、スクロール領域に`ui-scroll-smooth`と`data-ui-scroll-active="once"`を付けると、初期表示で現在地を表示し、その後の折り畳み・展開は操作した場所で行えます。[Navigationの使用例](navigation.html.md#nav-smooth-scroll)を参照してください。

使用ファイル・取り込み方

共通の ui.css と ui.js を読み込み、サンプルのHTMLを配置します。必要な動作は data-ui-* 属性で指定します。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../../assets/css/ui.css) / [ui.js](../../assets/js/ui.js) / [属性一覧と導入例](../getting-started.html.md)

assetsフォルダごとコピーするとCSS内の相対参照も維持できます。catalog.js、catalog-navigation.js、catalog-demo.js、layout.css はカタログ専用です。data-demo-* はアプリに取り込む際に外し、保存や通信はアプリ側で実装してください。
