<!-- Generated from docs/index.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](index.html) · [llms.txt](../llms.txt)

# Design catalog

自作アプリのための、静かでコンパクトなUIパーツ集。
ライト／ダーク両方で確認し、必要なパーツをアプリに取り込めます。

コンポーネントを探す

44 コンポーネント

- [Foundations](components/foundations.html.md): 色・文字・余白の基準

- [Buttons](components/buttons.html.md): ボタンとアクション

- [Forms](components/forms.html.md): 入力・選択・バリデーション

- [Badges](components/badges.html.md): ステータスとラベル

- [Animations](components/animations.html.md): 定番アニメーション・フェード・スライド・バウンス・処理中の表示

- [Toasts & alerts](components/toasts.html.md): 通知・成功・エラー

- [Dialog](components/dialog.html.md): 確認・入力ダイアログ

- [Table](components/table.html.md): 一覧表示

- [Kanban board](components/board.html.md): タスクと進捗管理

- [Navigation](components/navigation.html.md): タブ・パンくず・ページ送り

- [Accordion](components/disclosure.html.md): 詳細情報の開閉

- [States](components/states.html.md): 読み込み・空・エラー

- [Icons](components/mdi-icons.html.md): MDI・定番128種類・SVG・検索・コピー・サイズ・色

- [Sidebar](components/sidebar.html.md): サイドバー・メニュー・折りたたみ

- [Alerts](components/alerts.html.md): アラート・成功・情報・警告・エラー

- [Tips & tooltips](components/tips.html.md): ヒント・チップ・ツールチップ・補足

- [Typography](components/typography.html.md): 文字・色・サイズ・太さ・行間・装飾・折り返し

- [Spacing](components/spacing.html.md): スペース・余白・padding・margin・gap

- [Cards](components/cards.html.md): カード・リンク・選択・統計・メディア

- [Flexbox](components/flex.html.md): フレックス・方向・折り返し・整列・伸縮・order

- [Flex grid](components/flex-grid.html.md): flex グリッド・12カラム・レスポンシブ・入れ子

- [Calendar](components/calendar.html.md): カレンダー・月切替・日付選択・予定

- [Date picker](components/datepicker.html.md): 日付フォーム・日付入力・選択・必須・範囲指定

- [Loading](components/loading.html.md): ローディング・スピナーアーク・ボタン・枠線・進捗バー

- [Clipboard](components/clipboard.html.md): クリップボード・コピー・テキスト・コード

- [UI themes](components/themes.html.md): デザインテーマ・ガラス・グラスモーフィズム・フラット・ソフト

- [Theme switcher](components/theme-switcher.html.md): テーマ切り替え・デザイン選択・ライト／ダーク

- [Layouts](components/layouts.html.md): ページ構成・コンテナ・ヘッダー・フッター・カラム・管理画面

- [Dropdown](components/dropdown.html.md): 操作メニュー・上下配置・キーボード・選択イベント

- [Popover](components/popover.html.md): 操作を含む補足パネル・フォーム・画面端補正

- [Drawer](components/drawer.html.md): 左右上下のサイドパネル・背景スクロール停止・フォーカス復帰

- [Input group](components/input-group.html.md): 入力欄と接頭辞・接尾辞・ボタン・selectの連結

- [Button group](components/button-group.html.md): ボタンの連結・縦並び・radio／checkboxの選択

- [List group](components/list-group.html.md): 一覧・操作・現在地・件数・チェック付きリスト

- [Avatar](components/avatar.html.md): イニシャル・画像・サイズ・ステータス・グループ

- [Chart](components/chart.html.md): 折れ線・面・棒・ドーナツ・データ表・動的更新

- [Color palettes](components/color-palettes.html.md): Material 3・低彩度の6配色・背景・文字・独立した切り替え

- [Splitter](components/splitter.html.md): 領域の幅・高さの調整、入れ子、折り畳み、任意保存

- [Banner](components/banner.html.md): 全体告知・アイコン・操作・閉じる・固定表示

- [Command menu](components/command.html.md): 操作を検索・キーボード選択・ダイアログ

- [Carousel](components/carousel.html.md): スライド・前後操作・スワイプ

- [Timeline](components/timeline.html.md): 時系列・作業履歴・進行状況

- [Rating](components/rating.html.md): 星評価・フォーム送信・リセット

- [Data table](components/data-table.html.md): データテーブル・検索・ソート・ページ送り・行選択

## サービス画面のテンプレート

[ドキュメント・ダッシュボード・changelog・エラー画面のテンプレート →](templates.html.md)

## 使い方

[ダウンロード・導入ガイドを開く](installation.html.md)

1. assetsフォルダをアプリにコピーします。
2. ui.css と ui.js を読み込みます。
3. 各ページの「HTMLを表示」からサンプルをコピーします。
4. 見た目はclass、動作はdata-ui-*属性で指定します。

[導入手順・属性一覧 →](getting-started.html.md) / [共通2ファイルだけで動くサンプル →](starter.html.md)

npm・ビルド・サーバーは不要です。保存・送信・通信などアプリ固有の処理は共通UIに含めません。
