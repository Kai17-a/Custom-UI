<!-- Generated from docs/components/toasts.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](toasts.html) · [llms.txt](../../llms.txt)

# Toasts & alerts

標準幅は360px。長いタイトル・本文・URLは折り返し、狭い画面では画面幅に収めます。タイトル・本文・補足を属性またはJavaScriptで指定できます。

## 本文だけの通知（従来の書き方）

```html
<div class="row">
    <button class="btn btn-sm btn-success" data-ui-toast="保存しました。" data-ui-variant="success">成功通知を表示</button>
    <button class="btn btn-sm btn-outline-danger" data-ui-toast="接続が切れたため保存できませんでした。" data-ui-variant="danger">エラー通知を表示</button>
  </div>
```

## 画面内に置くアラート

```html
<div class="row" style="flex-direction:column; align-items:stretch; max-width:40rem;">
    <div class="alert alert-success py-2 px-3 shadow-sm notice" role="status"><span class="words">Saved.</span><button class="btn-close" data-ui-dismiss="alert" aria-label="Close"></button></div>
    <div class="alert alert-danger py-2 px-3 shadow-sm notice" role="alert"><span class="words">Something went wrong, so it stays until it is closed.</span><button class="btn-close" data-ui-dismiss="alert" aria-label="Close"></button></div>
  </div>
```

## タイトル＋本文＋補足

通知の内容を次の属性で指定します。必要な項目だけ設定できます。

- `data-ui-title`：タイトル
- `data-ui-body`：本文
- `data-ui-meta`：日時などの補足

```html
<button type="button" class="btn btn-sm btn-outline-secondary" data-ui-toast data-ui-title="保存しました" data-ui-body="プロジェクト「デザインカタログ」の変更を保存しました。" data-ui-variant="success" data-ui-meta="たった今">保存完了の通知</button>
```

## 成功・情報・警告・エラー

`data-ui-variant`に`success`・`info`・`warning`・`danger`を指定して、通知の意味に合う色を選びます。

```html
<div class="fx fx-wrap fx-gap-2"><button type="button" class="btn btn-sm btn-outline-secondary" data-ui-toast data-ui-title="アップロード完了" data-ui-body="3件のファイルをアップロードしました。" data-ui-variant="success">成功</button><button type="button" class="btn btn-sm btn-outline-secondary" data-ui-toast data-ui-title="メンテナンス予定" data-ui-body="本日22:00から10分間、アップロードを停止します。" data-ui-variant="info">情報</button><button type="button" class="btn btn-sm btn-outline-secondary" data-ui-toast data-ui-title="残容量が少なくなっています" data-ui-body="残り500MBです。不要なファイルを整理してください。" data-ui-variant="warning">警告</button><button type="button" class="btn btn-sm btn-outline-secondary" data-ui-toast data-ui-title="保存できませんでした" data-ui-body="接続が切れました。編集内容をコピーし、接続を確認してください。" data-ui-variant="danger">エラー</button></div>
```

## 長文・改行・長いURLの折り返し

```html
<button type="button" class="btn btn-sm btn-outline-secondary" data-ui-toast data-ui-title="長いプロジェクト名を含む通知も、幅を変えずに複数行で表示します" data-ui-body="更新対象が多いため、処理に時間がかかる場合があります。タスク一覧から進捗を確認してください。
詳細：https://example.test/projects/design-catalog-notifications-with-a-very-long-unbroken-identifier-2026-001" data-ui-variant="info" data-ui-meta="処理ログ" data-ui-duration="0">長文の通知を表示</button>
```

## タイトルだけ・本文だけ

```html
<div class="fx fx-wrap fx-gap-2"><button type="button" class="btn btn-sm btn-outline-secondary" data-ui-toast data-ui-title="処理が完了しました" data-ui-body="" data-ui-variant="success">タイトルだけ</button><button type="button" class="btn btn-sm btn-outline-secondary" data-ui-toast="本文だけの通知も引き続き使えます。" data-ui-variant="info">本文だけ</button></div>
```

## 表示時間を指定する

`data-ui-duration`で表示時間をミリ秒単位で指定します。`10000`なら10秒、`0`なら閉じるまで表示します。

```html
<div class="fx fx-wrap fx-gap-2"><button type="button" class="btn btn-sm btn-outline-secondary" data-ui-toast data-ui-title="データを更新しました" data-ui-body="10秒後に自動で閉じます。" data-ui-variant="success" data-ui-duration="10000">10秒で閉じる</button><button type="button" class="btn btn-sm btn-outline-secondary" data-ui-toast data-ui-title="確認が必要です" data-ui-body="閉じるボタンを押すまで表示します。" data-ui-variant="warning" data-ui-duration="0">閉じるまで残す</button></div><p class="dim small">標準は6秒、エラーは自動消去なしです。マウスが重なっている間と、閉じるボタンにフォーカスしている間は消去を止めます。</p>
```

<a id="toast-copy"></a>

## コピーアイコンを付ける（任意）

`data-ui-toast-copy`を追加すると、トーストの本文末尾に、文字と同じサイズのコピーアイコンを表示します。タイトルだけの通知ではタイトル末尾に付き、タイトルをコピーします。長いメッセージでは文末の文字と一緒に折り返し、アイコンだけの行になるのを防ぎます。

```html
<div class="fx fx-wrap fx-gap-2">
  <button type="button" class="btn btn-sm btn-outline-secondary" data-ui-toast data-ui-title="共有URL" data-ui-body="https://example.test/projects/design-catalog" data-ui-toast-copy data-ui-duration="0">本文をコピーできる通知</button>
  <button type="button" class="btn btn-sm btn-outline-secondary" data-ui-toast data-ui-title="処理に失敗しました" data-ui-body="お問い合わせの際は、エラーIDをお伝えください。" data-ui-variant="danger" data-ui-toast-copy data-ui-copy-text="ERR-2026-001" data-ui-copy-label="エラーIDをコピー">別の文字列をコピーできる通知</button>
</div>
```

`data-ui-copy-text`でコピー対象を、`data-ui-copy-label`で読み上げ名・ホバー時の説明を変更できます。

成功時はチェックマークに切り替わり、2秒後に元に戻ります。コピー中・フォーカス中・マウスが重なっている間は自動消去を止めます。

```
KavUI.toast({
  title: '共有URL',
  body: 'https://example.test/projects/design-catalog',
  copy: true,
  duration: 0
});

KavUI.toast({
  title: '処理に失敗しました',
  body: 'エラーIDをお問い合わせ時にお伝えください。',
  variant: 'danger',
  copy: true,
  copyText: 'ERR-2026-001',
  copyLabel: 'エラーIDをコピー'
});
```

[単独で使えるクリップボードコンポーネント →](clipboard.html.md)

## JavaScriptから表示

```
KavUI.toast({
  title: '保存しました',
  body: 'プロジェクトの変更を保存しました。',
  meta: 'たった今',
  variant: 'success',
  duration: 6000
});

// 従来の書き方も利用できます。
KavUI.toast('変更を保存しました。', { title: '保存完了' });
```

## 幅を変更する

全通知の幅はCSS変数で指定できます。スマートフォンでは左右16pxを確保し、高さは本文に合わせて伸びます。通知が画面の高さを超える場合は、通知領域をスクロールできます。

```
:root { --ui-toast-width: 420px; }
```

使用ファイル・取り込み方

共通の ui.css と ui.js を読み込み、サンプルのHTMLを配置します。必要な動作は data-ui-* 属性で指定します。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../../assets/css/ui.css) / [ui.js](../../assets/js/ui.js) / [属性一覧と導入例](../getting-started.html.md)

assetsフォルダごとコピーするとCSS内の相対参照も維持できます。catalog.js、catalog-navigation.js、catalog-demo.js、layout.css はカタログ専用です。data-demo-* はアプリに取り込む際に外し、保存や通信はアプリ側で実装してください。
