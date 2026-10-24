# Kav-UI 組み込みリファレンス

この資料はスキルのフォルダ内で完結する基本例。詳細を調べる際のパスは、インストールしたスキルの場所ではなくKav-UIのソースを基準とする。ソースにある`llms.txt`、または利用者が指定したドキュメントから必要なページへ進む。

## 通常HTMLの最小構成

`assets/css/`一式と`assets/js/ui.js`を同じバージョンで配置する。以下のHTMLと`assets`を同じ階層に置く。

```html
<!doctype html>
<html lang="ja" data-bs-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Kav-UI</title>
  <link rel="stylesheet" href="assets/css/ui.css">
  <script defer src="assets/js/ui.js"></script>
</head>
<body>
  <main class="ui-container sp-py-6">
    <h1 class="type-title">プロジェクト</h1>
    <p class="type-body">保存した内容を確認できます。</p>
    <button type="button" class="btn btn-primary"
      data-ui-toast="保存しました。" icon="mdi-check">保存</button>
  </main>
</body>
</html>
```

`ui.css`だけを取り出すとimport先が欠ける。HTMLからは入口のCSSを1つ指定し、フォルダ構成は保つ。MDIとMaterial Color Utilitiesの同梱ライセンス・クレジットも保持する。

## ダイアログの開閉

```html
<button type="button" class="btn btn-outline-primary"
  data-ui-toggle="dialog" data-ui-target="#confirm-dialog">確認する</button>
<dialog id="confirm-dialog" class="ui-dialog" data-ui-dialog aria-label="保存の確認">
  <p>この内容で保存しますか？</p>
  <button type="button" class="btn btn-primary" data-ui-dismiss="dialog">閉じる</button>
</dialog>
```

開閉、フォーカスの復帰、標準の出現・退出モーションは共通UIが扱う。IDはページ内で重複させない。実際の保存処理はアプリ側で接続する。

## 小さなデータテーブル

```html
<div class="ui-data-table" data-ui-data-table data-ui-page-size="0">
  <div class="ui-table-scroll" tabindex="0" role="region" aria-label="在庫一覧">
    <table class="table">
      <caption>在庫一覧</caption>
      <thead><tr>
        <th scope="col"><button type="button" class="ui-data-table-sort"
          data-ui-table-sort="text">商品</button></th>
        <th scope="col"><button type="button" class="ui-data-table-sort"
          data-ui-table-sort="number">在庫</button></th>
      </tr></thead>
      <tbody>
        <tr><td>ノート</td><td data-ui-sort-value="10">10個</td></tr>
        <tr><td>ペン</td><td data-ui-sort-value="2">2個</td></tr>
      </tbody>
    </table>
  </div>
</div>
```

列名を押すと昇順・降順・元の順序へ切り替わる。`data-ui-sort-value`で表示と比較値を分ける。検索・表示件数・選択・イベントの全例はソースの`docs/components/data-table.html.md`にある。

## テーマとレスポンシブ

| 対象 | 指定先 | 例 |
| --- | --- | --- |
| 明暗 | html | `data-bs-theme="light"`、`dark` |
| 明暗の設定・追従 | コントロール/API | `KavUI.setColorTheme('system', {persist: true})` |
| 質感 | body | `data-ui-theme="glass"`、`glassmorphism`、`flat`、`soft`、`default` |
| 配色 | html | `data-ui-palette="sage"`、`slate`、`teal`、`mauve`、`sand`、`clay`、`default` |

明暗のsystemは設定値で、実際の`data-bs-theme`は解決後のlight/darkになる。保存済み設定を初回から復元する場合だけ、CSSより前へ同期の`theme-init.js`を追加し、bodyへ`data-ui-theme-persist`を指定する。

```html
<div class="fx-grid fx-grid-3 tablet:fx-grid-2 mobile:fx-grid-1 fx-gap-4">
  <section class="ui-card"><div class="ui-card-body">概要</div></section>
  <section class="ui-card"><div class="ui-card-body">履歴</div></section>
  <section class="ui-card"><div class="ui-card-body">設定</div></section>
</div>
```

PCは1024px以上、tabletは768px以上1024px未満、mobileは768px未満。対応するユーティリティはソースの`docs/components/flex-grid.html.md`・`spacing.html.md`を確認する。

## 動的な内容

```javascript
// アプリがDOMを追加した後
KavUI.init(container);
// コンテナの内容全体を作り直す前、または削除する前
KavUI.destroy(container);
```

通常HTML版は初期HTMLを自動初期化する。後から追加したすべての部品をMutationObserverで自動初期化する設計ではない。Data tableの行追加・削除後も、そのルートへinitを呼ぶ。折り畳みメニューの現在地表示を初回だけにするには、スクロール領域へ`data-ui-scroll-active="once"`を指定する。

## Vue/Astroを使う場合

既存のアプリにフレームワークがあるときは、利用版の`packages/README.md`を先に読む。

- Vueは`@kav-ui/core/style.css`と`@kav-ui/vue`の部品を利用する。通常HTMLを保持する境界には`KavWidget`を使うと初期化と破棄を任せられる。`html`へ渡す文字列は信頼できるマークアップに限り、利用者の値は適切にエスケープする。
- Astroは既存の`KavProvider`とコンポーネントを使う。`KavProvider`はCSSを読み込む。対話的な部品は必要な初期化を持ち、クライアント遷移にも対応する。
- パッケージはローカルtarballとGitHub Releases用の構成。公開npmレジストリから取得できるとは扱わない。アプリが既に導入済みならその依存を使い、通常HTML版の`ui.js`を重ねて読み込まない。

## ソースを変更する場合だけ

編集元は`assets/css/`・`assets/js/ui.js`、カタログは`docs/`。生成されたパッケージやMarkdownを直接修正しない。HTML資料を更新したら`python3 scripts/generate-ai-docs.py`で再生成し、`--check`で同期を確認する。
