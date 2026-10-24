<!-- Generated from docs/components/mdi-icons.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](mdi-icons.html) · [llms.txt](../../llms.txt)

# MDI icons

**Material Design Icons（MDI）を使用しています。** MDI 7.4.47のSVGを同梱しています（Apache License 2.0）。[出典・同梱ファイルを確認する](#mdi-source)

よく使うMaterial Design Iconsを128種類収録しています。SVGの中身をコピーしてHTMLに貼り付けるだけで使えます。import・アイコンフォント・CDN・スプライトは不要です。

[サイズ・色・組み合わせの見本 →](icons.html.md) / [サイドバーでの使い方 →](sidebar.html.md#sidebar-icons)

<a id="mdi-attributes"></a>

## 属性でアイコンを指定する

共通の`ui.css`と`ui.js`を読み込むと、`icon="mdi-home"`のように名前だけで表示できます。同梱128種類に対応し、外部通信・追加ファイルの読み込みは不要です。SVGを直接貼り付ける場合はJavaScriptも不要です。

```html
<div class="ui-cluster">
  <span icon="mdi-home" class="ui-icon-md" style="color:var(--bs-primary)" role="img" aria-label="ホーム"></span>
  <span icon="mdi-heart" class="ui-icon-lg" style="color:var(--bs-danger)" aria-hidden="true"></span>
  <button type="button" class="btn btn-primary"><span icon="mdi-content-save" class="btn-icon"></span>保存</button>
  <button type="button" class="btn btn-outline-secondary" aria-label="設定"><span icon="mdi-cog" class="btn-icon"></span></button>
</div>
```

標準サイズは周囲の文字と同じ1emです。`ui-icon-sm / md / lg / xl`で16 / 24 / 32 / 48pxを指定できます。任意のサイズは`--ui-icon-size`で調整できます。色は文字色を引き継ぎます。サイドバーには`class="sidebar-icon"`を併用できます。

属性はspan・i・button・aなど、子要素を配置できるHTML要素に指定してください。子要素の先頭に装飾用SVGを挿入し、既存の文字やイベントは維持します。アイコンだけのボタンにはボタンの`aria-label`を指定します。単体のアイコンに意味を持たせる場合は、上のホームの例のように要素へ`role="img" aria-label="説明"`を指定してください。

追加した要素と`icon`属性の変更は自動で反映します。`KavUI.init(element)`でも初期化できます。存在しない名前や属性の削除では生成SVGを取り除き、既存の文字・代替表示を維持します。

```
const icon = document.querySelector("[icon]");
icon.setAttribute("icon", "mdi-star");
```

アイコンを探す

128 / 128 アイコン

<a id="mdi-navigation"></a>

## ナビゲーション

- [`mdi-home`](../../assets/icons/mdi/home.svg): ホーム

- [`mdi-view-dashboard`](../../assets/icons/mdi/view-dashboard.svg): ダッシュボード

- [`mdi-menu`](../../assets/icons/mdi/menu.svg): メニュー

- [`mdi-magnify`](../../assets/icons/mdi/magnify.svg): 検索

- [`mdi-cog`](../../assets/icons/mdi/cog.svg): 設定

- [`mdi-arrow-left`](../../assets/icons/mdi/arrow-left.svg): 戻る 左矢印

- [`mdi-arrow-right`](../../assets/icons/mdi/arrow-right.svg): 進む 右矢印

- [`mdi-dots-vertical`](../../assets/icons/mdi/dots-vertical.svg): その他 縦三点

<a id="mdi-status"></a>

## 状態・通知

- [`mdi-check`](../../assets/icons/mdi/check.svg): チェック 完了

- [`mdi-check-circle`](../../assets/icons/mdi/check-circle.svg): 成功 確認

- [`mdi-close`](../../assets/icons/mdi/close.svg): 閉じる

- [`mdi-close-circle`](../../assets/icons/mdi/close-circle.svg): エラー 中止

- [`mdi-alert`](../../assets/icons/mdi/alert.svg): 警告

- [`mdi-information`](../../assets/icons/mdi/information.svg): 情報

- [`mdi-help-circle`](../../assets/icons/mdi/help-circle.svg): ヘルプ

- [`mdi-progress-clock`](../../assets/icons/mdi/progress-clock.svg): 処理中 待機

<a id="mdi-edit"></a>

## 編集・操作

- [`mdi-plus`](../../assets/icons/mdi/plus.svg): 追加

- [`mdi-minus`](../../assets/icons/mdi/minus.svg): 削減 マイナス

- [`mdi-pencil`](../../assets/icons/mdi/pencil.svg): 編集

- [`mdi-delete`](../../assets/icons/mdi/delete.svg): 削除 ゴミ箱

- [`mdi-content-copy`](../../assets/icons/mdi/content-copy.svg): コピー

- [`mdi-content-paste`](../../assets/icons/mdi/content-paste.svg): 貼り付け

- [`mdi-content-save`](../../assets/icons/mdi/content-save.svg): 保存

- [`mdi-refresh`](../../assets/icons/mdi/refresh.svg): 更新 再読み込み

<a id="mdi-files"></a>

## ファイル

- [`mdi-folder`](../../assets/icons/mdi/folder.svg): フォルダー

- [`mdi-folder-open`](../../assets/icons/mdi/folder-open.svg): 開いたフォルダー

- [`mdi-file-document`](../../assets/icons/mdi/file-document.svg): ドキュメント 書類

- [`mdi-file-image`](../../assets/icons/mdi/file-image.svg): 画像ファイル

- [`mdi-upload`](../../assets/icons/mdi/upload.svg): アップロード

- [`mdi-download`](../../assets/icons/mdi/download.svg): ダウンロード

- [`mdi-link`](../../assets/icons/mdi/link.svg): リンク

- [`mdi-attachment`](../../assets/icons/mdi/attachment.svg): 添付 クリップ

<a id="mdi-accounts"></a>

## アカウント・認証

- [`mdi-account`](../../assets/icons/mdi/account.svg): ユーザー アカウント

- [`mdi-account-circle`](../../assets/icons/mdi/account-circle.svg): プロフィール

- [`mdi-account-group`](../../assets/icons/mdi/account-group.svg): チーム グループ

- [`mdi-account-plus`](../../assets/icons/mdi/account-plus.svg): ユーザー追加 招待

- [`mdi-login`](../../assets/icons/mdi/login.svg): ログイン

- [`mdi-logout`](../../assets/icons/mdi/logout.svg): ログアウト

- [`mdi-lock`](../../assets/icons/mdi/lock.svg): ロック 鍵

- [`mdi-lock-open`](../../assets/icons/mdi/lock-open.svg): ロック解除

<a id="mdi-messages"></a>

## コミュニケーション

- [`mdi-bell`](../../assets/icons/mdi/bell.svg): 通知 ベル

- [`mdi-bell-outline`](../../assets/icons/mdi/bell-outline.svg): 通知 アウトライン

- [`mdi-email`](../../assets/icons/mdi/email.svg): メール

- [`mdi-email-outline`](../../assets/icons/mdi/email-outline.svg): メール アウトライン

- [`mdi-message-text`](../../assets/icons/mdi/message-text.svg): メッセージ チャット

- [`mdi-message-text-outline`](../../assets/icons/mdi/message-text-outline.svg): メッセージ アウトライン

- [`mdi-send`](../../assets/icons/mdi/send.svg): 送信

- [`mdi-share-variant`](../../assets/icons/mdi/share-variant.svg): 共有

<a id="mdi-data"></a>

## データ・レイアウト

- [`mdi-calendar`](../../assets/icons/mdi/calendar.svg): カレンダー

- [`mdi-calendar-month`](../../assets/icons/mdi/calendar-month.svg): 月 カレンダー

- [`mdi-clock-outline`](../../assets/icons/mdi/clock-outline.svg): 時刻 時計

- [`mdi-chart-bar`](../../assets/icons/mdi/chart-bar.svg): 棒グラフ

- [`mdi-chart-line`](../../assets/icons/mdi/chart-line.svg): 折れ線グラフ

- [`mdi-table`](../../assets/icons/mdi/table.svg): テーブル 表

- [`mdi-view-grid`](../../assets/icons/mdi/view-grid.svg): グリッド

- [`mdi-format-list-bulleted`](../../assets/icons/mdi/format-list-bulleted.svg): リスト 箇条書き

<a id="mdi-appearance"></a>

## 表示・お気に入り

- [`mdi-heart`](../../assets/icons/mdi/heart.svg): お気に入り ハート

- [`mdi-star`](../../assets/icons/mdi/star.svg): 評価 スター

- [`mdi-bookmark`](../../assets/icons/mdi/bookmark.svg): ブックマーク

- [`mdi-eye`](../../assets/icons/mdi/eye.svg): 表示 目

- [`mdi-eye-off`](../../assets/icons/mdi/eye-off.svg): 非表示

- [`mdi-weather-sunny`](../../assets/icons/mdi/weather-sunny.svg): ライト 太陽

- [`mdi-weather-night`](../../assets/icons/mdi/weather-night.svg): ダーク 月

- [`mdi-theme-light-dark`](../../assets/icons/mdi/theme-light-dark.svg): テーマ 明暗

<a id="mdi-arrows"></a>

## 矢印・展開

- [`mdi-chevron-left`](../../assets/icons/mdi/chevron-left.svg): 左へ

- [`mdi-chevron-right`](../../assets/icons/mdi/chevron-right.svg): 右へ

- [`mdi-chevron-up`](../../assets/icons/mdi/chevron-up.svg): 上へ

- [`mdi-chevron-down`](../../assets/icons/mdi/chevron-down.svg): 下へ

- [`mdi-chevron-double-left`](../../assets/icons/mdi/chevron-double-left.svg): 先頭へ

- [`mdi-chevron-double-right`](../../assets/icons/mdi/chevron-double-right.svg): 末尾へ

- [`mdi-chevron-double-up`](../../assets/icons/mdi/chevron-double-up.svg): 上へ 二重

- [`mdi-chevron-double-down`](../../assets/icons/mdi/chevron-double-down.svg): 下へ 二重

- [`mdi-arrow-up`](../../assets/icons/mdi/arrow-up.svg): 上矢印

- [`mdi-arrow-down`](../../assets/icons/mdi/arrow-down.svg): 下矢印

- [`mdi-arrow-expand-all`](../../assets/icons/mdi/arrow-expand-all.svg): 拡大 展開

- [`mdi-arrow-collapse-all`](../../assets/icons/mdi/arrow-collapse-all.svg): 縮小 折りたたみ

- [`mdi-open-in-new`](../../assets/icons/mdi/open-in-new.svg): 別ウィンドウ 外部リンク

- [`mdi-fullscreen`](../../assets/icons/mdi/fullscreen.svg): 全画面

- [`mdi-fullscreen-exit`](../../assets/icons/mdi/fullscreen-exit.svg): 全画面解除

- [`mdi-menu-down`](../../assets/icons/mdi/menu-down.svg): 下向きメニュー

<a id="mdi-forms"></a>

## 入力・並び替え

- [`mdi-checkbox-marked`](../../assets/icons/mdi/checkbox-marked.svg): チェックボックス 選択済み

- [`mdi-checkbox-blank-outline`](../../assets/icons/mdi/checkbox-blank-outline.svg): チェックボックス 未選択

- [`mdi-checkbox-marked-circle-outline`](../../assets/icons/mdi/checkbox-marked-circle-outline.svg): 丸いチェックボックス

- [`mdi-radiobox-marked`](../../assets/icons/mdi/radiobox-marked.svg): ラジオ 選択済み

- [`mdi-radiobox-blank`](../../assets/icons/mdi/radiobox-blank.svg): ラジオ 未選択

- [`mdi-toggle-switch`](../../assets/icons/mdi/toggle-switch.svg): スイッチ オン

- [`mdi-toggle-switch-off`](../../assets/icons/mdi/toggle-switch-off.svg): スイッチ オフ

- [`mdi-filter`](../../assets/icons/mdi/filter.svg): 絞り込み フィルター

- [`mdi-filter-outline`](../../assets/icons/mdi/filter-outline.svg): 絞り込み アウトライン

- [`mdi-sort`](../../assets/icons/mdi/sort.svg): ソート 並び替え

- [`mdi-sort-ascending`](../../assets/icons/mdi/sort-ascending.svg): 昇順

- [`mdi-sort-descending`](../../assets/icons/mdi/sort-descending.svg): 降順

- [`mdi-drag`](../../assets/icons/mdi/drag.svg): ドラッグ 移動

- [`mdi-drag-vertical`](../../assets/icons/mdi/drag-vertical.svg): 縦ドラッグ

- [`mdi-format-list-checks`](../../assets/icons/mdi/format-list-checks.svg): チェックリスト

- [`mdi-dots-horizontal`](../../assets/icons/mdi/dots-horizontal.svg): その他 横三点

<a id="mdi-media"></a>

## メディア・機器

- [`mdi-play`](../../assets/icons/mdi/play.svg): 再生

- [`mdi-pause`](../../assets/icons/mdi/pause.svg): 一時停止

- [`mdi-stop`](../../assets/icons/mdi/stop.svg): 停止

- [`mdi-skip-next`](../../assets/icons/mdi/skip-next.svg): 次の曲

- [`mdi-skip-previous`](../../assets/icons/mdi/skip-previous.svg): 前の曲

- [`mdi-volume-high`](../../assets/icons/mdi/volume-high.svg): 音量 音声

- [`mdi-volume-mute`](../../assets/icons/mdi/volume-mute.svg): ミュート 消音

- [`mdi-microphone`](../../assets/icons/mdi/microphone.svg): マイク

- [`mdi-microphone-off`](../../assets/icons/mdi/microphone-off.svg): マイク無効

- [`mdi-camera`](../../assets/icons/mdi/camera.svg): カメラ 撮影

- [`mdi-image`](../../assets/icons/mdi/image.svg): 画像 写真

- [`mdi-video`](../../assets/icons/mdi/video.svg): 動画 ビデオ

- [`mdi-monitor`](../../assets/icons/mdi/monitor.svg): モニター デスクトップ

- [`mdi-cellphone`](../../assets/icons/mdi/cellphone.svg): スマートフォン

- [`mdi-printer`](../../assets/icons/mdi/printer.svg): 印刷 プリンター

- [`mdi-qrcode`](../../assets/icons/mdi/qrcode.svg): QRコード

<a id="mdi-outlines"></a>

## よく使うアウトライン

- [`mdi-home-outline`](../../assets/icons/mdi/home-outline.svg): ホーム アウトライン

- [`mdi-cog-outline`](../../assets/icons/mdi/cog-outline.svg): 設定 アウトライン

- [`mdi-account-outline`](../../assets/icons/mdi/account-outline.svg): ユーザー アウトライン

- [`mdi-account-circle-outline`](../../assets/icons/mdi/account-circle-outline.svg): プロフィール アウトライン

- [`mdi-account-group-outline`](../../assets/icons/mdi/account-group-outline.svg): グループ アウトライン

- [`mdi-folder-outline`](../../assets/icons/mdi/folder-outline.svg): フォルダー アウトライン

- [`mdi-folder-open-outline`](../../assets/icons/mdi/folder-open-outline.svg): 開いたフォルダー アウトライン

- [`mdi-file-document-outline`](../../assets/icons/mdi/file-document-outline.svg): 書類 アウトライン

- [`mdi-pencil-outline`](../../assets/icons/mdi/pencil-outline.svg): 編集 アウトライン

- [`mdi-delete-outline`](../../assets/icons/mdi/delete-outline.svg): 削除 アウトライン

- [`mdi-content-save-outline`](../../assets/icons/mdi/content-save-outline.svg): 保存 アウトライン

- [`mdi-check-circle-outline`](../../assets/icons/mdi/check-circle-outline.svg): 成功 アウトライン

- [`mdi-alert-outline`](../../assets/icons/mdi/alert-outline.svg): 警告 アウトライン

- [`mdi-information-outline`](../../assets/icons/mdi/information-outline.svg): 情報 アウトライン

- [`mdi-heart-outline`](../../assets/icons/mdi/heart-outline.svg): お気に入り アウトライン

- [`mdi-star-outline`](../../assets/icons/mdi/star-outline.svg): スター アウトライン

<a id="mdi-usage"></a>

## サイドバーやボタンで使う

`sidebar-icon`は18px、`btn-icon`はボタンに合うサイズになります。`fill="currentColor"`によって文字色を引き継ぎます。SVGのpathを含めてコピーしてください。

```html
<aside class="app-sidebar" aria-label="MDIを使ったメニュー"><nav class="app-sidebar-group" aria-label="MDIの使用例"><a href="mdi-icons.html" aria-current="page"><svg xmlns="http://www.w3.org/2000/svg" class="sidebar-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
  <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z"></path>
</svg><span class="sidebar-label">アイコン一覧</span></a></nav></aside>
<a class="btn btn-outline-primary" href="sidebar.html"><svg xmlns="http://www.w3.org/2000/svg" class="btn-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
  <path d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"></path>
</svg>サイドバーを見る</a>
```

コピーするSVGは装飾用として`aria-hidden="true"`を付けています。アイコンのみのボタンではボタンに`aria-label`を指定してください。SVG自体に意味を持たせる場合は`aria-hidden`を外し、`role="img" aria-label="説明"`を指定できます。

<a id="mdi-source"></a>

## 出典・同梱ファイル

Material Design Icons 7.4.47。公式のpathデータを使い、SVGの外側にサイズ・文字色の継承・装飾用の属性を付けています。

[公式SVGリポジトリ](https://github.com/Templarian/MaterialDesign-SVG/tree/v7.4.47) / [同梱SVGの説明](../../assets/icons/mdi/README.md) / [ライセンス](../../assets/icons/mdi/LICENSE) / [Apache 2.0](../../assets/icons/mdi/Apache-2.0.txt)

使用ファイル・取り込み方

共通の ui.css と ui.js を読み込み、サンプルのHTMLを配置します。必要な動作は data-ui-* 属性で指定します。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../../assets/css/ui.css) / [ui.js](../../assets/js/ui.js) / [属性一覧と導入例](../getting-started.html.md)

assetsフォルダごとコピーするとCSS内の相対参照も維持できます。catalog.js、catalog-navigation.js、catalog-demo.js、layout.css はカタログ専用です。data-demo-* はアプリに取り込む際に外し、保存や通信はアプリ側で実装してください。
