<!-- Generated from docs/components/loading.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](loading.html) · [llms.txt](../llms.txt)

# Loading

処理を待つ間の表示。スピナーアーク、ボタン、ボーダー、進捗バーを用途に合わせて使えます。

## スピナーアーク

円弧を回転させるCSSスピナー。色は親要素の文字色を引き継ぎます。

```html
<div class="fx fx-wrap fx-gap-6 fx-items-center">
  <span class="ui-loading-status" role="status"><span class="ui-spinner ui-spinner-sm" aria-hidden="true"></span><span>読み込み中…</span></span>
  <span class="ui-loading-status ui-loading-primary" role="status"><span class="ui-spinner ui-spinner-lg" aria-hidden="true"></span><span>データを取得中…</span></span>
</div>
```

## サイズ・色

標準の`ui-spinner`は20pxです。サイズを変える場合は、`ui-spinner-xs`（12px）・`ui-spinner-sm`（16px）・`ui-spinner-lg`（32px）・`ui-spinner-xl`（48px）を使います。

```html
<div class="fx fx-wrap fx-gap-6 fx-items-center" role="status" aria-label="読み込み中">
  <span class="ui-spinner ui-spinner-xs" aria-hidden="true"></span>
  <span class="ui-spinner ui-spinner-sm" aria-hidden="true"></span>
  <span class="ui-spinner ui-spinner-lg" aria-hidden="true"></span>
  <span class="ui-spinner ui-spinner-xl" aria-hidden="true"></span>
  <span class="ui-loading-success"><span class="ui-spinner ui-spinner-lg" aria-hidden="true"></span></span>
  <span class="ui-loading-danger"><span class="ui-spinner ui-spinner-lg" aria-hidden="true"></span></span>
</div>
```

<a id="skeleton-shimmer"></a>

## スケルトンシマー

読み込み後の形を示すプレースホルダーです。`skeleton`に`skeleton-shimmer`を追加すると、光が左から右へ流れます。

```html
<div aria-busy="true" aria-label="タスク一覧">
  <div aria-hidden="true">
    <div class="skeleton skeleton-shimmer skeleton-title" style="width:60%"></div>
    <div class="skeleton skeleton-shimmer" style="width:90%"></div>
    <div class="skeleton skeleton-shimmer" style="width:75%"></div>
  </div>
</div>
<p class="dim small" role="status">タスクを読み込み中…</p>
```

skeletonだけなら静止表示です。シマーはJavaScript不要で動作し、動きを減らすOS設定では静止表示になります。

## カード・画像・アバターのシマー

```html
<div class="fx-grid fx-grid-md-2 fx-gap-4">
  <div class="ui-card" aria-busy="true" aria-label="記事カード">
    <div class="ui-card-body" aria-hidden="true">
      <div class="skeleton skeleton-shimmer skeleton-media"></div>
      <div class="skeleton skeleton-shimmer skeleton-title" style="width:70%"></div>
      <div class="skeleton skeleton-shimmer"></div>
      <div class="skeleton skeleton-shimmer" style="width:80%"></div>
    </div>
  </div>
  <div class="ui-card" aria-busy="true" aria-label="プロフィールカード">
    <div class="ui-card-body" aria-hidden="true">
      <div class="fx fx-items-center fx-gap-3">
        <div class="skeleton skeleton-shimmer skeleton-circle"></div>
        <div class="skeleton skeleton-shimmer skeleton-title" style="width:50%"></div>
      </div>
      <div class="skeleton skeleton-shimmer"></div>
      <div class="skeleton skeleton-shimmer" style="width:85%"></div>
      <div class="skeleton skeleton-shimmer" style="width:65%"></div>
    </div>
  </div>
</div>
<p class="dim small" role="status">記事とプロフィールを読み込み中…</p>
```

見出しは`skeleton-title`、円形は`skeleton-circle`、画像枠は`skeleton-media`を併用します。円のサイズは`--skeleton-size`、横幅は`width`で調整できます。

取得完了後はプレースホルダーを実際の内容に置き換え、`aria-hidden`を外し、親の`aria-busy`をfalseにします。読み込み結果を伝える`role="status"`は、その領域の外で更新してください。

## ボタン内のローディング

`ui-loading-button`に`aria-busy="true"`と`disabled`を付けます。処理中の再クリックを防ぎ、元の文字は読み上げ名として残します。

```html
<div class="fx fx-wrap fx-gap-3 fx-items-center">
<button type="button" class="btn btn-primary ui-loading-button" aria-busy="true" disabled>
  <span class="ui-loading-label">保存する</span>
  <span class="ui-spinner ui-spinner-sm ui-loading-indicator" aria-hidden="true"></span>
</button>
<button type="button" class="btn btn-outline-secondary ui-loading-button" aria-busy="true" disabled>
  <span class="ui-loading-label">変更を保存</span>
  <span class="ui-spinner ui-spinner-sm ui-loading-indicator" aria-hidden="true"></span>
</button>
<button type="button" class="btn btn-sm btn-primary ui-loading-button" aria-busy="true" disabled>
  <span class="ui-loading-label">再計算</span>
  <span class="ui-spinner ui-spinner-sm ui-loading-indicator" aria-hidden="true"></span>
</button>
</div>
<p class="dim small" role="status">保存中… ボタンの幅を保ったまま、ラベルをスピナーに切り替えます。</p>
```

## アイコンボタン

```html
<div class="fx fx-wrap fx-gap-3 fx-items-center">
<button type="button" class="btn btn-outline-secondary ui-loading-button ui-loading-icon" aria-label="データを更新" >
  <span class="ui-loading-label"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M17.65 6.35A7.95 7.95 0 0 0 12 4a8 8 0 1 0 7.75 10h-2.08A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h8V3z"/></svg></span>
  <span class="ui-spinner ui-spinner-sm ui-loading-indicator" aria-hidden="true"></span>
</button>
<button type="button" class="btn btn-outline-secondary ui-loading-button ui-loading-icon" aria-label="データを更新中" aria-busy="true" disabled>
  <span class="ui-loading-label"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M17.65 6.35A7.95 7.95 0 0 0 12 4a8 8 0 1 0 7.75 10h-2.08A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h8V3z"/></svg></span>
  <span class="ui-spinner ui-spinner-sm ui-loading-indicator" aria-hidden="true"></span>
</button>
</div>
<p class="dim small">通常時 → 更新中。アイコンだけのボタンにはaria-labelで名前を指定します。</p>
```

## ボーダーのローディング

ui-loading-borderをカードやパネルに追加します。枠線は操作を遮りません。

```html
<div class="fx-grid fx-grid-md-2 fx-gap-4">
  <article class="ui-card ui-loading-border" aria-busy="true">
    <div class="ui-card-body"><h3 class="ui-card-title">レポートを作成中</h3><p class="ui-card-description">枠線に沿ってアークが移動します。</p></div>
  </article>
  <article class="ui-card ui-loading-border" aria-busy="false">
    <div class="ui-card-body"><h3 class="ui-card-title">レポートの作成完了</h3><p class="ui-card-description">aria-busyをfalseにすると枠線が通常の状態に戻ります。</p></div>
  </article>
</div>
```

## 進捗バー（進捗が分かる処理）

標準のprogress要素を使用します。value / maxで進捗を指定し、結果は文字でも伝えます。

```html
<div class="stack">
  <div><div class="ui-progress-heading"><label for="loading-upload">ファイルをアップロード中</label><span>60%</span></div><progress id="loading-upload" class="ui-progress" max="100" value="60">60%</progress></div>
  <div><div class="ui-progress-heading"><label for="loading-complete">アップロード完了</label><span>100%</span></div><progress id="loading-complete" class="ui-progress ui-progress-success" max="100" value="100">100%</progress></div>
  <div><div class="ui-progress-heading"><label for="loading-failed">アップロードに失敗 — 再試行してください</label><span>40%</span></div><progress id="loading-failed" class="ui-progress ui-progress-danger" max="100" value="40">40%</progress></div>
  <div><div class="ui-progress-heading"><label for="loading-small">細いバー</label><span>25%</span></div><progress id="loading-small" class="ui-progress ui-progress-sm" max="100" value="25">25%</progress></div>
  <div><div class="ui-progress-heading"><label for="loading-large">太いバー</label><span>75%</span></div><progress id="loading-large" class="ui-progress ui-progress-lg ui-progress-warning" max="100" value="75">75%</progress></div>
</div>
```

## 進捗バー（進捗が分からない処理）

value属性を省略すると、往復するバーになります。進捗が不明な場合に架空の割合を表示する必要はありません。

```html
<div><label for="loading-indeterminate">接続を確認中…</label><progress id="loading-indeterminate" class="ui-progress" max="100">処理中</progress></div>
```

## 動作を試す

ローカルの模擬処理です。通信は行いません。処理中は両方のボタンを無効化し、完了・失敗後に再び操作できます。

```html
<div class="stack" data-demo-loading>
  <div class="fx fx-wrap fx-gap-3">
    <button type="button" class="btn btn-primary ui-loading-button" data-demo-loading-start="success">
  <span class="ui-loading-label">保存を試す（デモ）</span>
  <span class="ui-spinner ui-spinner-sm ui-loading-indicator" aria-hidden="true"></span>
</button>
    <button type="button" class="btn btn-outline-secondary ui-loading-button" data-demo-loading-start="error">
  <span class="ui-loading-label">失敗・再試行を試す（デモ）</span>
  <span class="ui-spinner ui-spinner-sm ui-loading-indicator" aria-hidden="true"></span>
</button>
  </div>
  <div class="ui-card ui-loading-border" data-demo-loading-panel>
    <div class="ui-card-body"><div class="ui-progress-heading"><label for="loading-demo-progress">データの保存</label><span data-demo-loading-percent>0%</span></div><progress id="loading-demo-progress" class="ui-progress" max="100" value="0">0%</progress></div>
  </div>
  <p role="status" data-demo-loading-result>ボタンを押すと、進捗と結果を確認できます。</p>
</div>
```

## アプリとの連携

見た目は共通のui.cssとHTMLだけで利用できます。共通ui.jsの`KavUI.loading(要素またはセレクター, true / false)`を使うと、aria-busyとボタンのdisabledをまとめて切り替え、終了時に開始前の状態へ戻します。通信や進捗の更新はアプリ側で行います。

```
// ui-loading-buttonのHTMLを配置した後、アプリの処理から呼びます。
async function save(button, values) {
  if (button.disabled) return;
  KavUI.loading(button, true);
  try {
    await saveProject(values); // 自分の保存処理
    KavUI.toast({ title: '保存しました', variant: 'success' });
  } catch {
    KavUI.toast({ title: '保存できませんでした', body: '再試行してください。', variant: 'danger' });
  } finally {
    KavUI.loading(button, false);
  }
}

// 要素の代わりにセレクターも指定できます。
KavUI.loading('#save-button', true);
KavUI.loading('#save-button', false);

// progressは通常のDOM APIで更新できます。
progressElement.value = 60;
// 不明な進捗に切り替える場合：
progressElement.removeAttribute('value');
```

ボーダーのあるパネルにも同じAPIを使えます。APIと直接の属性操作は同じ処理内で混在させず、対応するtrue / falseを1組で呼んでください。

スピナーは装飾としてaria-hiddenにし、読み込み状況を文字で示します。結果を読み上げるrole="status"は、aria-busyを付けた領域の外に置いてください。動きを減らすOS設定では回転・移動を止め、文字や静止した枠線で状態を示します。

使用ファイル・取り込み方

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

npmは不要です。assetsフォルダの構造を維持してコピーしてください。

[loading.css](../assets/ui/css/components/loading.css) / [skeleton.css](../assets/ui/css/components/skeleton.css) / [導入手順](../getting-started.html.md) / [スケルトン・空状態](states.html.md)

catalog-demo.jsとdata-demo-*は見本用です。アプリに取り込む際は外し、実際の処理に置き換えてください。
