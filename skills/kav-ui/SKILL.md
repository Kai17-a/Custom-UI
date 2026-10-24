---
name: kav-ui
description: "Kav-UIを使う画面・コンポーネントの実装や修正、通常HTMLとVue/Astroへの組み込みに使う。既存のclass/data属性、テーマ、初期化と破棄の仕様を確認して実装する。"
---

# Kav-UI

Kav-UIは、通常HTMLではnpmやビルドなしで使うCSS/JavaScriptフレームワーク。既存のデザインと公開APIを使い、依頼された画面や操作を実装する。

## 利用先と資料の確認

- 利用先にあるCSS/JS、パッケージ、レイアウト、読み込み方法を確認する。同じバージョンの資材を使い、既存の構成へ組み込む。
- Kav-UIのソースがあれば、リポジトリルートの`llms.txt`から必要な資料だけを読む。`docs/*.html.md`・`docs/components/*.html.md`は本文とサンプルのMarkdown版。画面で確認する場合やサービス画面テンプレートの構造を再利用する場合は、対応するHTMLも読む。
- このスキルの配置先とKav-UIのソースの場所は別でもよい。下記の`assets/`・`docs/`・`packages/`は、Kav-UIのソースまたは配布物を基準としたパス。
- ソースがない場合は、利用者が指定したドキュメントや[公式リポジトリ](https://github.com/Kai17-a/Custom-UI)を参照する。未公開・利用版にないAPIを推測で補わない。
- コピーできるHTML例と連携時の注意が必要なら、同梱の[組み込みリファレンス](references/integration.md)を読む。スキルを移すときはこの参照資料も含めてフォルダごとコピーする。

## 機能に合うコンポーネントを選ぶ

| 必要な機能 | 読む資料（Kav-UIのソースからの相対パス） |
| --- | --- |
| 導入・ファイル配置 | `docs/installation.html.md` |
| 属性とイベントの全体像 | `docs/getting-started.html.md` |
| ページ構成・余白・Flex | `docs/components/layouts.html.md`、`spacing.html.md`、`flex-grid.html.md` |
| 入力・日付・評価 | `docs/components/forms.html.md`、`datepicker.html.md`、`rating.html.md` |
| 検索・ソート付きの表 | `docs/components/data-table.html.md` |
| サイドバー・ページ内移動 | `docs/components/sidebar.html.md`、`navigation.html.md` |
| ダイアログ・通知・コピー | `docs/components/dialog.html.md`、`toasts.html.md`、`clipboard.html.md` |
| 明暗・質感・配色 | `docs/components/theme-switcher.html.md`、`themes.html.md`、`color-palettes.html.md` |
| Vue/Astro | `packages/README.md`と各パッケージのREADME |

同じ行で省略したファイル名は、先頭のファイルと同じディレクトリにある。その他の部品は`llms.txt`から選ぶ。通常の画面組み立てで全コンポーネントの資料や大きなランタイム全体を一度に読む必要はない。

## HTML版を組み込む

- `assets/css/ui.css`と`defer`付きの`assets/js/ui.js`を読み込む。`ui.css`には相対importがあるため、CSSフォルダ一式の階層を保つ。
- 見た目はclass、操作は必要な`data-ui-*`属性で指定する。通常HTMLの`ui.js`は読み込み後に自動初期化するため、初期HTML用の別の初期化スクリプトは通常不要。
- ボタン、フォーム、tableなどは標準HTMLの構造とアクセシブルな名前を使う。サンプルが要求するルート属性・関連ID・`type="button"`も引き継ぐ。
- MDIは`icon="mdi-content-copy"`など、同梱名を指定する。外部アイコンのimportや通信は不要。利用版の`assets/icons/mdi/`またはアイコン資料で名前を確認する。
- 通知・ダイアログなどの標準アニメーションは共通資材に含まれる。追加の演出を求められたときだけアニメーションの資料から選ぶ。動きを減らす設定を打ち消すCSSを足さない。

## デザインと状態を保つ

- BootstrapやTailwindに似た名前でも、利用できるclassはKav-UIの実装が基準。外部フレームワークのクラスをそのまま補完しない。未確認のclassは関連資料やCSSで確かめる。
- レイアウトは`ui-container`などのレイアウト部品、`fx-*`、`sp-*`、文字は`type-*`と既存トークンから選ぶ。レスポンシブはPCを基本に`tablet:`と`mobile:`を使う。
- 明暗は`html`の`data-bs-theme`、質感は`body`の`data-ui-theme`、配色は`html`の`data-ui-palette`で独立して扱う。切り替えには既存のコントロールかKavUI APIを使う。
- 保存したテーマを初回表示から復元する場合は、任意の`theme-init.js`をCSSより前に同期で読み、`body`へ`data-ui-theme-persist`を付ける。
- 折り畳みメニューで現在地を初回だけ表示する場合は`data-ui-scroll-active="once"`を使い、開閉のたびに現在地へ引き戻さない。

## 動的なHTMLとフレームワーク連携

- 後から追加した複雑な部品は、接続済みの追加先へ`KavUI.init(container)`を呼ぶ。DOM全体を置き換える前やアンマウント時は`KavUI.destroy(container)`で後始末する。アイコン以外のDOM追加がすべて自動検知されるとは扱わない。
- Vue/Astroの利用では既存パッケージのコンポーネントや`KavWidget`を選び、そのライフサイクルへ任せる。パッケージのランタイムへ通常HTML版の自動bootを重ねない。
- Vue/AstroパッケージはローカルtarballとGitHub Releases向けの配布構成。公開npmレジストリから取得できるとは仮定せず、利用版の導入手順を読む。
- 保存・送信・ルーティング・サーバー通信は利用先で接続する。Data tableはローカルDOMの検索・ソート・ページ送りであり、サーバーページングではない。

## サンプルから取り込むとき

カタログの`docs/assets/`、`catalog-*.js`、`layout.css`は見本画面用。アプリへは共通の`assets/`を組み込む。`data-demo-*`を外し、サンプル専用のリンク遷移抑止や模擬結果をアプリへ持ち込まない。部品の`ui:*`イベントで必要な処理を接続する。

Kav-UI本体の変更を依頼された場合は、`assets/css/components/`と`assets/js/ui.js`を編集元とし、`docs/components/`の使い方も合わせる。`packages/core/dist/`などの生成物を直接編集しない。Markdown版は`python3 scripts/generate-ai-docs.py`で更新する。

## 確認

使った部品の操作と、PC・タブレット・スマートフォンの幅を確認する。入力や選択の状態、キーボード、長文の折り返し、変更したテーマも対象にする。動的DOMを使う場合は再初期化と後始末も確認し、実施した検証と未確認の範囲を報告する。
