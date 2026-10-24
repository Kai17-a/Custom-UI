<!-- Generated from docs/components/alerts.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](alerts.html) · [llms.txt](../llms.txt)

# Alerts

画面内に残す案内とエラー表示。トーストと共通のセマンティックカラーを使います。

ページ全体の告知には [Banner](banner.html.md) も利用できます。

## 成功・情報・警告・エラー

```html
<div class="alert alert-success"><h3 class="alert-title">変更を保存しました</h3><p>プロジェクトの設定は最新の状態です。</p></div>
<br>
<div class="alert alert-info"><h3 class="alert-title">メンテナンスのお知らせ</h3><p>本日22:00から10分間、ファイルのアップロードを停止します。</p></div>
<br>
<div class="alert alert-warning"><h3 class="alert-title">ストレージの残容量が少なくなっています</h3><p>残りは500MBです。不要なファイルを整理してください。</p></div>
<br>
<div class="alert alert-danger"><h3 class="alert-title">ファイルを保存できませんでした</h3><p>接続が切れました。編集内容をコピーしてから、接続を確認してください。</p></div>
```

## 閉じられるアラート

```html
<div id="dismissible-alert" class="alert alert-info alert-dismissible">
  <div><h3 class="alert-title">通知設定を確認してください</h3><p>メール通知の頻度は<a href="forms.html">基本設定</a>から変更できます。</p></div>
  <button type="button" class="btn-close" data-ui-dismiss="alert" aria-label="通知設定の案内を閉じる"></button>
</div>
<p><button type="button" class="btn btn-sm btn-outline-secondary" data-ui-toggle="show" data-ui-target="#dismissible-alert">アラートを再表示</button></p>
```

## 控えめな案内

```html
<div class="alert alert-neutral"><h3 class="alert-title">読み取り専用モード</h3><p>このプロジェクトの編集権限がありません。変更するには管理者へ連絡してください。</p></div>
```

このページのアラートは静的な表示例です。動的に出す重要なエラーには role="alert"、完了通知には role="status" を付けてください。

使用ファイル・取り込み方

共通の ui.css と ui.js を読み込み、サンプルのHTMLを配置します。必要な動作は data-ui-* 属性で指定します。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../../assets/css/ui.css) / [ui.js](../../assets/js/ui.js) / [属性一覧と導入例](../getting-started.html.md)

assetsフォルダごとコピーするとCSS内の相対参照も維持できます。catalog.js、catalog-navigation.js、catalog-demo.js、layout.css はカタログ専用です。data-demo-* はアプリに取り込む際に外し、保存や通信はアプリ側で実装してください。
