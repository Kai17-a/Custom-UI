# Kav-UI 組み込みリファレンス

利用先のアプリへ配布済みのCSS/JSを組み込む。Kav-UIのソース、カタログ、開発用コマンドは不要。このスキルは実装方法を案内する資料で、ランタイム資材自体は含まない。

## 配布資材と配置先

- 導入済みなら既存の読み込み方を使う。ファイル名だけでなくCSSの入口とimport先、JS、版を確認する。
- 未導入なら利用者が用意した配布ZIPを使う。必要なら[GitHub Releases](https://github.com/Kai17-a/Custom-UI/releases)で利用可能な版を確認する。公開されていない版のURLやCDN・npm公開を仮定しない。配布物がなければ必要な資材を明示する。
- HTML版はZIP内の`assets/css/`一式と`assets/js/ui.js`を、アプリの静的公開ディレクトリへ配置する。例えば`public/vendor/kav-ui/`に配置した場合、公開URLは一般に`/vendor/kav-ui/css/ui.css`などになるが、アプリの公開設定とサブパスを確認する。
- スキルはエージェントの設定先へ置き、CSS/JSとは別に管理する。アプリへスキルや元リポジトリのフォルダをコピーする必要はない。

以下の相対URLは単体HTMLの配置例。静的サイト、Vue/Astro、サブパス配信では実際の公開URLへ変更する。

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

## 動的な内容

```javascript
// アプリがDOMを追加した後
KavUI.init(container);
// コンテナの内容全体を作り直す前、または削除する前
KavUI.destroy(container);
```

通常HTML版は初期HTMLを自動初期化する。後から追加したすべての部品をMutationObserverで自動初期化する設計ではない。Data tableの行追加・削除後も、そのルートへinitを呼ぶ。折り畳みメニューの現在地表示を初回だけにするには、スクロール領域へ`data-ui-scroll-active="once"`を指定する。

## Vue/Astroを使う場合

既存のアプリにフレームワークがあるときは、同梱の[Vue/Astroへの組み込み](frameworks.md)を読む。

- Vueは`@kav-ui/core/style.css`と`@kav-ui/vue`の部品を利用する。通常HTMLを保持する境界には`KavWidget`を使うと初期化と破棄を任せられる。`html`へ渡す文字列は信頼できるマークアップに限り、利用者の値は適切にエスケープする。
- Astroは既存の`KavProvider`とコンポーネントを使う。`KavProvider`はCSSを読み込む。対話的な部品は必要な初期化を持ち、クライアント遷移にも対応する。
- パッケージはローカルtarballとGitHub Releases用の構成。公開npmレジストリから取得できるとは扱わない。アプリが既に導入済みならその依存を使い、通常HTML版の`ui.js`を重ねて読み込まない。

## 対応する版と調査の範囲

同梱例の確認元はKav-UIのコミット`0b80d49`。同じパッケージバージョンでも開発途中の配布物と差があり得るため、利用先の資材・型が優先される。確認元の識別はネットワーク取得の指示ではない。

未確認の機能を使う場合だけ、利用者が指定した資料や導入済みの型・CSS/JSを追加で確認する。Kav-UI本体の編集、ビルド、リリースはこのスキルの通常の画面実装には不要。
