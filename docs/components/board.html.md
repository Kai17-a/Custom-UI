<!-- Generated from docs/components/board.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](board.html) · [llms.txt](../llms.txt)

# Kanban board

タスクと進捗管理。下の「HTMLを表示」からマークアップをコピーできます。

## Kanban board — drag a card to another column

```html
<p class="dim small" style="margin-top:-.4rem;">Backlog → In progress → Review → Done. Dropping on a column moves the task (a local demo; no server is called).</p>
  <div class="ui-board-wrap"><div class="ui-board" data-ui-board aria-label="タスクボード"><section class="column" data-ui-column="todo"><h3><span class="dot dot-todo" aria-hidden="true"></span><span>Backlog</span> <span class="count" data-ui-count>0</span></h3><div data-ui-cards><article class="task-card" data-ui-card="task-0" draggable="true"><div class="title">Fix the failing tests</div><div class="where">~/workspaces/app</div><label class="small">移動先<select class="form-select form-select-sm" data-ui-move><option value="todo" selected>Backlog</option><option value="in_progress">In progress</option><option value="review">Review</option><option value="done">Done</option></select></label></article><article class="task-card" data-ui-card="task-1" draggable="true"><div class="title">Add the docs</div><div class="where">~/workspaces/app</div><label class="small">移動先<select class="form-select form-select-sm" data-ui-move><option value="todo" selected>Backlog</option><option value="in_progress">In progress</option><option value="review">Review</option><option value="done">Done</option></select></label></article></div><p class="none" data-ui-empty hidden>タスクはありません</p></section><section class="column" data-ui-column="in_progress"><h3><span class="dot dot-in_progress" aria-hidden="true"></span><span>In progress</span> <span class="count" data-ui-count>0</span></h3><div data-ui-cards><article class="task-card is-running" data-ui-card="task-2" draggable="true"><div class="title">Wire the board</div><div class="where">~/workspaces/app</div><label class="small">移動先<select class="form-select form-select-sm" data-ui-move><option value="todo">Backlog</option><option value="in_progress" selected>In progress</option><option value="review">Review</option><option value="done">Done</option></select></label></article></div><p class="none" data-ui-empty hidden>タスクはありません</p></section><section class="column" data-ui-column="review"><h3><span class="dot dot-review" aria-hidden="true"></span><span>Review</span> <span class="count" data-ui-count>0</span></h3><div data-ui-cards><article class="task-card" data-ui-card="task-3" draggable="true"><div class="title">Review the patch</div><div class="where">~/workspaces/app</div><label class="small">移動先<select class="form-select form-select-sm" data-ui-move><option value="todo">Backlog</option><option value="in_progress">In progress</option><option value="review" selected>Review</option><option value="done">Done</option></select></label></article></div><p class="none" data-ui-empty hidden>タスクはありません</p></section><section class="column" data-ui-column="done"><h3><span class="dot dot-done" aria-hidden="true"></span><span>Done</span> <span class="count" data-ui-count>0</span></h3><div data-ui-cards><article class="task-card" data-ui-card="task-4" draggable="true"><div class="title">Ship it</div><div class="where">~/workspaces/app</div><label class="small">移動先<select class="form-select form-select-sm" data-ui-move><option value="todo">Backlog</option><option value="in_progress">In progress</option><option value="review">Review</option><option value="done" selected>Done</option></select></label></article></div><p class="none" data-ui-empty hidden>タスクはありません</p></section></div></div>
```

使用ファイル・取り込み方

共通の ui.css と ui.js を読み込み、サンプルのHTMLを配置します。必要な動作は data-ui-* 属性で指定します。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../../assets/css/ui.css) / [ui.js](../../assets/js/ui.js) / [属性一覧と導入例](../getting-started.html.md)

assetsフォルダごとコピーするとCSS内の相対参照も維持できます。catalog.js、catalog-navigation.js、catalog-demo.js、layout.css はカタログ専用です。data-demo-* はアプリに取り込む際に外し、保存や通信はアプリ側で実装してください。

ui.js はHTML上のカードを移動し、ui:move イベントを発行します。データの保存や通信はアプリ側で実装してください。
