<!-- Generated from docs/templates.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](templates.html) · [llms.txt](llms.txt)

# Service templates

Kav-UIを組み合わせたサービス画面。HTMLを直接開いて確認でき、PC・タブレット・スマートフォンと全デザインテーマに対応します。

<a id="template-pages"></a>

## 画面を開く

- [ドキュメントサイドナビ・本文・右目次。セクション検索、FAQ、関連ページへの導線。テンプレートを開く →](templates/docs.html.md): サイドナビ・本文・右目次。セクション検索、FAQ、関連ページへの導線。

- [ダッシュボード指標・売上推移・流入元・注文一覧。集計期間の切り替えとCSV出力。テンプレートを開く →](templates/dashboard.html.md): 指標・売上推移・流入元・注文一覧。集計期間の切り替えとCSV出力。

- [Changelog日付・バージョン・更新内容。種類とキーワードによる絞り込み。テンプレートを開く →](templates/changelog.html.md): 日付・バージョン・更新内容。種類とキーワードによる絞り込み。

<a id="template-errors"></a>

## エラー画面

原因に合った案内と復帰先を持つ独立したHTMLです。既存のテーマ・カラーパレット・ライト／ダークと、PC・タブレット・スマートフォンに対応します。

- [404 · ページが見つからないURLの確認、ホームとドキュメントへの導線。画面を開く →](templates/error-404.html.md): URLの確認、ホームとドキュメントへの導線。

- [403 · アクセス権限がないアカウント・権限の確認と、管理者への依頼を案内。画面を開く →](templates/error-403.html.md): アカウント・権限の確認と、管理者への依頼を案内。

- [500 · 予期しないエラー再読み込みとホームへの復帰、解決しない場合の案内。画面を開く →](templates/error-500.html.md): 再読み込みとホームへの復帰、解決しない場合の案内。

- [503 · 一時的に利用できないメンテナンス・混雑時の案内と手動での再読み込み。画面を開く →](templates/error-503.html.md): メンテナンス・混雑時の案内と手動での再読み込み。

コピー後は、サービス名・文面・ホームやヘルプへのリンクを自分のアプリへ変更してください。500・503の再読み込みにはtemplates.jsを使用します。JavaScriptが無効な場合もホームへのリンクは利用できます。

このHTMLは表示用テンプレートです。HTTPステータスの返却や、エラー発生時にこの画面を表示する処理は、サーバーやアプリ側で設定してください。配布用のCSS/JS ZIPには画面テンプレートを含めていないため、このリポジトリからHTMLとtemplates.css / templates.jsを取得します。

<a id="template-use"></a>

## アプリへ取り込む

1. 使うtemplates内のHTMLと、assetsフォルダをコピーします。
2. タイトル・サービス名・ナビゲーション・本文やサンプルデータを変更します。
3. templates.js内の検索・期間切り替え・CSV出力を必要に応じて自分の処理に置き換えます。

```html
<link rel="stylesheet" href="../assets/css/ui.css">
<link rel="stylesheet" href="../assets/css/templates.css">
<script defer src="../assets/js/ui.js"></script>
<script defer src="../assets/js/templates.js"></script>
```

[templates.css](assets/css/templates.css)は画面構成、[templates.js](assets/js/templates.js)はテンプレート固有の操作です。共通UIはui.css / ui.jsが提供します。カタログ専用ファイルは読み込みません。

head内のtheme-init.jsも引き継ぐと、遷移時の白いフラッシュを抑えられます。サンプルの初期化スクリプトはデザインテーマとライト・ダーク設定を共通UIと同じキーで復元します。

<a id="template-interactions"></a>

## 動く部分

- ドキュメント：本文検索、モバイル用メニュー、FAQの開閉。
- ダッシュボード：7日・30日の指標とチャート更新、表示中の売上CSVのダウンロード。
- Changelog：新機能・改善・修正の種類指定と、検索語を組み合わせた絞り込み。
- 共通：デザインテーマとライト・ダークの切り替え、画面間のリンク。

数値・注文・更新内容はすべてサンプルです。認証、保存、APIへの接続、実際のユーザー情報は含みません。

<a id="template-chart"></a>

## チャートを使う

ダッシュボードのチャートも共通コンポーネントです。外部の描画ライブラリを追加せず、JSONとdata属性、またはKavUI.chart()で描画できます。

[Chartの使用例・設定一覧 →](components/chart.html.md)
