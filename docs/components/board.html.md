<!-- Generated from docs/components/board.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](board.html) · [llms.txt](../llms.txt)

# Kanban board

タスクと進捗管理。下の「HTMLを表示」からマークアップをコピーできます。

glass・glassmorphism テーマでは、実行中以外のタスクカードも `--ui-theme-surface-opacity` に連動し、100% で不透明になります。`--faint` を指定したカードは、その背景を優先します。

## Kanban board — drag a card to another column

```html
<p class="dim small" style="margin-top:-.4rem;">Backlog → In progress → Review → Done. Dropping on a column moves the task (a local demo; no server is called).</p>
  <div class="ui-board-wrap"><div class="ui-board" data-ui-board aria-label="タスクボード"><section class="column" data-ui-column="todo"><h3><span class="dot dot-todo" aria-hidden="true"></span><span>Backlog</span> <span class="count" data-ui-count>0</span></h3><div data-ui-cards><article class="task-card" data-ui-card="task-0" draggable="true"><div class="title">Fix the failing tests</div><div class="where">~/workspaces/app</div><label class="small">移動先<select class="form-select form-select-sm" data-ui-move><option value="todo" selected>Backlog</option><option value="in_progress">In progress</option><option value="review">Review</option><option value="done">Done</option></select></label></article><article class="task-card" data-ui-card="task-1" draggable="true"><div class="title">Add the docs</div><div class="where">~/workspaces/app</div><label class="small">移動先<select class="form-select form-select-sm" data-ui-move><option value="todo" selected>Backlog</option><option value="in_progress">In progress</option><option value="review">Review</option><option value="done">Done</option></select></label></article></div><p class="none" data-ui-empty hidden>タスクはありません</p></section><section class="column" data-ui-column="in_progress"><h3><span class="dot dot-in_progress" aria-hidden="true"></span><span>In progress</span> <span class="count" data-ui-count>0</span></h3><div data-ui-cards><article class="task-card is-running" data-ui-card="task-2" draggable="true"><div class="title">Wire the board</div><div class="where">~/workspaces/app</div><label class="small">移動先<select class="form-select form-select-sm" data-ui-move><option value="todo">Backlog</option><option value="in_progress" selected>In progress</option><option value="review">Review</option><option value="done">Done</option></select></label></article></div><p class="none" data-ui-empty hidden>タスクはありません</p></section><section class="column" data-ui-column="review"><h3><span class="dot dot-review" aria-hidden="true"></span><span>Review</span> <span class="count" data-ui-count>0</span></h3><div data-ui-cards><article class="task-card" data-ui-card="task-3" draggable="true"><div class="title">Review the patch</div><div class="where">~/workspaces/app</div><label class="small">移動先<select class="form-select form-select-sm" data-ui-move><option value="todo">Backlog</option><option value="in_progress">In progress</option><option value="review" selected>Review</option><option value="done">Done</option></select></label></article></div><p class="none" data-ui-empty hidden>タスクはありません</p></section><section class="column" data-ui-column="done"><h3><span class="dot dot-done" aria-hidden="true"></span><span>Done</span> <span class="count" data-ui-count>0</span></h3><div data-ui-cards><article class="task-card" data-ui-card="task-4" draggable="true"><div class="title">Ship it</div><div class="where">~/workspaces/app</div><label class="small">移動先<select class="form-select form-select-sm" data-ui-move><option value="todo">Backlog</option><option value="in_progress">In progress</option><option value="review">Review</option><option value="done" selected>Done</option></select></label></article></div><p class="none" data-ui-empty hidden>タスクはありません</p></section></div></div>
```

<a id="state-colors"></a>

## 状態と色の対応

確認待ちは人の注意が必要な状態なので warning 系で統一します。完了は緑の輪、確認待ちは warning の塗りの丸で区別します。印は装飾なので、状態名も文字で添えてください。

ボード・エージェント図・推奨バッジの状態対応

| 状態 | ボードの印 | エージェント図のノード | 推奨する状態バッジ |
| --- | --- | --- | --- |
| 未着手 | `dot-todo`：secondary-color の輪 | `data-state="pending"`：secondary-color の状態文字と輪、標準の枠 | `text-bg-secondary` |
| 進行中 | `dot-in_progress`：primary の半塗りの丸 | `data-state="running"`：primary の枠、primary-text-emphasis の状態文字と塗りの丸 | `text-bg-primary` |
| 確認待ち | `dot-review`：warning の枠と塗りの丸 | `data-state="review"`：warning の枠、warning-text-emphasis の状態文字 | `text-bg-warning` |
| 完了 | `dot-done`：success の輪（中は空） | `data-state="complete"`：success-text-emphasis の状態文字と塗りの丸、標準の枠 | `text-bg-success` |
| 止まっている | なし | `data-state="blocked"`：danger-text-emphasis の状態文字と輪、標準の枠 | `text-bg-danger` |

色名は既存の `--bs-*` トークンを指します。ボードに停止状態の印はありません。5テーマのライト・ダークで、確認待ちの印の外周は列・カードの背景に対して3:1以上のコントラストを確保します。

使用ファイル・取り込み方

共通の ui.css と ui.js を読み込み、サンプルのHTMLを配置します。必要な動作は data-ui-* 属性で指定します。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../assets/ui/css/ui.css) / [ui.js](../assets/ui/js/ui.js) / [属性一覧と導入例](../getting-started.html.md)

assetsフォルダごとコピーするとCSS内の相対参照も維持できます。catalog.js、catalog-navigation.js、catalog-demo.js、layout.css はカタログ専用です。data-demo-* はアプリに取り込む際に外し、保存や通信はアプリ側で実装してください。

ui.js はHTML上のカードを移動し、ui:move イベントを発行します。データの保存や通信はアプリ側で実装してください。
