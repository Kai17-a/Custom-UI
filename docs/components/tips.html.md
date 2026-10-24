<!-- Generated from docs/components/tips.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](tips.html) · [llms.txt](../llms.txt)

# Tips & tooltips

短いヒント、入力の補足、操作に紐づくツールチップ。必要な情報量に応じて使い分けます。

## 常時表示するTip

```html
<aside class="tip" aria-label="ヒント"><strong>Tip：タスクは小さく分ける</strong><p>1つのタスクに1つの目的を設定すると、進捗と完了条件を確認しやすくなります。</p></aside>
```

## 入力欄の補足

```html
<label for="tip-project">プロジェクト名</label><input id="tip-project" class="form-control form-control-sm" aria-describedby="project-tip" placeholder="例：My app"><p class="tip-inline" id="project-tip">Tip：用途がわかる短い名前にすると、一覧から探しやすくなります。</p>
```

## ツールチップ（ホバー・フォーカス・タップ）

```html
<div class="tooltip-stage"><div class="tooltip-anchor"><span>自動保存</span><button type="button" class="btn btn-sm btn-outline-secondary" data-ui-tooltip="入力を止めてから3秒後に保存します。Escapeキーまたは領域の外のタップで閉じられます。" aria-label="自動保存について">?</button></div></div>
```

## 長めの補足（クリック・Enter・Spaceで開閉）

```html
<details class="tip-disclosure"><summary>Tip：公開前に確認すること</summary><p>プロジェクト名、公開範囲、通知先を確認してください。重要な条件はツールチップだけに置かず、画面内にも表示します。</p></details>
```

使用ファイル・取り込み方

共通の ui.css と ui.js を読み込み、サンプルのHTMLを配置します。必要な動作は data-ui-* 属性で指定します。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../assets/ui/css/ui.css) / [ui.js](../assets/ui/js/ui.js) / [属性一覧と導入例](../getting-started.html.md)

assetsフォルダごとコピーするとCSS内の相対参照も維持できます。catalog.js、catalog-navigation.js、catalog-demo.js、layout.css はカタログ専用です。data-demo-* はアプリに取り込む際に外し、保存や通信はアプリ側で実装してください。

## ID不要・複数のツールチップ

```html
<div class="fx fx-wrap fx-gap-3"><button type="button" class="btn btn-sm btn-outline-secondary" data-ui-tooltip="サーバーへの送信前に入力を確認します。">検証の説明</button><button type="button" class="btn btn-sm btn-outline-secondary" data-ui-tooltip="表示を切り替えても入力内容は保持されます。">表示の説明</button></div>
```
