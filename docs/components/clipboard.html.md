<!-- Generated from docs/components/clipboard.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](clipboard.html) · [llms.txt](../llms.txt)

# Clipboard

テキスト・入力欄・コードをクリップボードへコピーします。文字付きボタンとアイコンを用途に合わせて選べます。キーボードでも操作できます。

## 文字列をコピー

data-ui-copyにコピーする文字列を指定します。

```html
<div class="ui-clipboard">
  <div class="ui-clipboard-row">
    <code class="ui-clipboard-value">https://example.test/projects/design-catalog</code>
    <button type="button" class="btn btn-sm btn-outline-secondary" data-ui-copy="https://example.test/projects/design-catalog" aria-label="URLをコピー" title="URLをコピー">URLをコピー</button>
  </div>
  <p class="ui-copy-status" data-ui-copy-status role="status"></p>
</div>
```

## 入力欄の現在の値をコピー

入力を書き換えてからコピーできます。data-ui-copy-targetには対象のCSSセレクターを指定します。

```html
<div class="ui-clipboard">
  <label for="clipboard-input">共有メッセージ</label>
  <div class="ui-clipboard-row">
    <input id="clipboard-input" class="form-control" value="次回の打ち合わせは金曜日の14時です。">
    <button type="button" class="btn btn-sm btn-primary" data-ui-copy-target="#clipboard-input" aria-label="コピー" title="コピー">コピー</button>
  </div>
  <p class="ui-copy-status" data-ui-copy-status role="status"></p>
</div>
```

## 複数行・コードをコピー

input / textareaではvalue、それ以外はtextContentをコピーします。HTMLタグとして解釈せず、改行や空白をそのまま扱います。

```html
<div class="ui-clipboard">
  <pre class="ui-clipboard-code"><code id="clipboard-code">const project = {
  name: 'Design catalog',
  theme: 'light'
};</code></pre>
  <button type="button" class="btn btn-sm btn-outline-secondary" data-ui-copy-target="#clipboard-code" aria-label="コードをコピー" title="コードをコピー">コードをコピー</button>
  <p class="ui-copy-status" data-ui-copy-status role="status"></p>
</div>
```

## アイコンでコピー

```html
<div class="ui-clipboard">
  <div class="ui-clipboard-row">
    <code id="clipboard-id" class="ui-clipboard-value">project-2026-001</code>
    <button type="button" class="ui-copy-icon" data-ui-copy-target="#clipboard-id" aria-label="プロジェクトIDをコピー" title="プロジェクトIDをコピー"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1m3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m0 16H8V7h11v14z"/></svg></button>
  </div>
  <p class="ui-copy-status" data-ui-copy-status role="status"></p>
</div>
```

## ボタンだけでも使う

結果の表示要素を省略すると、ボタンの直後に自動生成します。

```html
<button type="button" class="btn btn-sm btn-outline-secondary" data-ui-copy="Design catalog" aria-label="プロジェクト名をコピー" title="プロジェクト名をコピー">プロジェクト名をコピー</button>
```

文字付きボタンにはbtnなどの通常のクラスを指定します。アイコンを使う場合はui-copy-iconを指定し、成功するとチェックマークに切り替わって2秒後に元に戻ります。読み上げ用の名前はaria-labelで指定します。失敗時はチェックマークに切り替えず、そのまま再試行できます。

## アプリから呼ぶ

```
try {
  await KavUI.copy('コピーしたい文字列');
  // 成功時の処理
} catch (error) {
  // 失敗時の処理
}

// コンポーネントの結果を受け取る場合：
document.addEventListener('ui:copy', event => {
  // event.detail.text にコピーした文字列が入ります。
});
document.addEventListener('ui:copyerror', event => {
  // 失敗時の処理
});
```

APIはPromiseを返し、失敗時はrejectします。ボタン操作から呼び出してください。コピー先はOSのクリップボードで、履歴や保存機能はありません。

ブラウザのClipboard APIを使用します。HTTPS / localhostなどの利用環境とブラウザの許可が必要です。ファイルを直接開いた場合の動作はブラウザに依存します。利用できない場合や許可されない場合は、成功と表示せず手動コピーを案内します。

[トーストにコピーボタンを付ける →](toasts.html.md#toast-copy)

使用ファイル・取り込み方

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

assetsフォルダの構造を維持してコピーしてください。npmは不要です。

[clipboard.css](../../assets/css/components/clipboard.css) / [導入手順](../getting-started.html.md)
