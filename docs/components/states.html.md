<!-- Generated from docs/components/states.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](states.html) · [llms.txt](../llms.txt)

# States

データが揃う前や、操作が完了しなかったときの表示例です。

## 読み込み中

```html
<div role="status" aria-label="タスクを読み込み中"><p class="dim">タスクを読み込み中…</p><div aria-hidden="true"><div class="skeleton skeleton-shimmer" style="width:60%"></div><div class="skeleton skeleton-shimmer" style="width:90%"></div><div class="skeleton skeleton-shimmer" style="width:75%"></div></div></div>
```

[スケルトンシマーのカード・画像・アバターの例 →](loading.html.md#skeleton-shimmer)

## 進捗

```html
<label for="upload-progress">ファイルをアップロード中 — 60%</label><div><progress id="upload-progress" max="100" value="60">60%</progress></div>
```

## 空の状態

```html
<div class="state-panel" data-demo-state><h3>タスクはまだありません</h3><p>最初のタスクを作成して、プロジェクトを始めましょう。</p><button type="button" data-demo-create class="btn btn-sm btn-primary">サンプルタスクを作成</button><p data-demo-result role="status"></p></div>
```

## エラーと再試行

```html
<div class="alert alert-danger" data-demo-state><h3>タスクを取得できませんでした</h3><p>接続がタイムアウトしました。接続を確認してから再試行してください。</p><button type="button" data-demo-retry class="btn btn-sm btn-outline-danger">再試行（デモ）</button><p data-demo-result role="status"></p></div>
```

使用ファイル・取り込み方

共通の ui.css と ui.js を読み込み、サンプルのHTMLを配置します。必要な動作は data-ui-* 属性で指定します。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../assets/ui/css/ui.css) / [ui.js](../assets/ui/js/ui.js) / [属性一覧と導入例](../getting-started.html.md)

assetsフォルダごとコピーするとCSS内の相対参照も維持できます。catalog.js、catalog-navigation.js、catalog-demo.js、layout.css はカタログ専用です。data-demo-* はアプリに取り込む際に外し、保存や通信はアプリ側で実装してください。
