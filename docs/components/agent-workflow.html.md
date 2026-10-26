<!-- Generated from docs/components/agent-workflow.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](agent-workflow.html) · [llms.txt](../llms.txt)

# Agent workflow

AIエージェントの処理手順、役割の階層、並列実行、タスクの内訳を可視化します。すべて架空の実行データです。

<a id="agent-flow"></a>

## AI Agent Workflow Visualization

左から右へ処理が進みます。スマートフォンでは上から下へ並びます。色に加えて文字で実行状態を示します。

```html
<div class="ui-agent-workflow"><ol class="ui-agent-flow" aria-label="調査レポートの処理順"><li><div class="ui-agent-node" data-state="complete"><span class="ui-agent-state">完了</span><strong>要件を整理</strong><small>Planner · 対象と調査項目を確定</small></div></li><li><div class="ui-agent-node" data-state="complete"><span class="ui-agent-state">完了</span><strong>情報を集める</strong><small>Researcher · 3つの資料を照合</small></div></li><li aria-current="step"><div class="ui-agent-node" data-state="running"><span class="ui-agent-state">実行中</span><strong>レポートを書く</strong><small>Writer · 調査結果を構成</small></div></li><li><div class="ui-agent-node" data-state="pending"><span class="ui-agent-state">待機中</span><strong>品質を確認</strong><small>Reviewer · 出典と結論を検証</small></div></li></ol></div>
```

<a id="agent-hierarchy"></a>

## Hierarchical Node Graph UI

親ノードの下に担当エージェントと子タスクを配置します。接続は上から下への委任を表します。狭い画面では図の領域を横にスクロールできます。

```html
<div class="ui-agent-workflow"><div class="ui-agent-canvas" tabindex="0" role="region" aria-label="エージェントの階層図。横スクロール可能"><ul class="ui-agent-tree"><li><div class="ui-agent-node" data-state="running"><span class="ui-agent-state">実行中</span><strong>Coordinator</strong><small>調査プロジェクトを統括</small></div><ul><li><div class="ui-agent-node" data-state="running"><span class="ui-agent-state">実行中</span><strong>Research agent</strong><small>資料の収集を担当</small></div><ul><li><div class="ui-agent-node" data-state="complete"><span class="ui-agent-state">完了</span><strong>出典を収集</strong><small>公式資料を3件確認</small></div></li></ul></li><li><div class="ui-agent-node" data-state="pending"><span class="ui-agent-state">待機中</span><strong>Writing agent</strong><small>原稿の作成を担当</small></div><ul><li><div class="ui-agent-node" data-state="pending"><span class="ui-agent-state">待機中</span><strong>構成案を作成</strong><small>調査結果の受け取り待ち</small></div></li></ul></li></ul></li></ul></div></div>
```

<a id="agent-orchestration"></a>

## Agent Orchestration Graph

Coordinatorが3つの作業を並列に委任し、すべての結果をReviewerへ渡します。確認待ちのノードがあるため、レビューは開始していません。

```html
<div class="ui-agent-workflow"><div class="ui-agent-canvas" tabindex="0" role="region" aria-label="並列処理と合流の図。上から下に進みます。横スクロール可能"><ul class="ui-agent-tree ui-agent-tree-parallel"><li><div class="ui-agent-node" data-state="running"><span class="ui-agent-state">実行中</span><strong>Coordinator</strong><small>調査・実装・検証を委任</small></div><ul><li><div class="ui-agent-node" data-state="complete"><span class="ui-agent-state">完了</span><strong>Researcher</strong><small>API仕様の調査</small></div></li><li><div class="ui-agent-node" data-state="running"><span class="ui-agent-state">実行中</span><strong>Builder</strong><small>連携処理を実装</small></div></li><li><div class="ui-agent-node" data-state="blocked"><span class="ui-agent-state">確認待ち</span><strong>Tester</strong><small>テスト用認証情報が必要</small></div></li></ul></li></ul><div class="ui-agent-merge"><div class="ui-agent-node" data-state="pending"><span class="ui-agent-state">待機中</span><strong>Reviewer</strong><small>3つの結果を統合して検証</small></div></div></div></div>
```

<a id="task-tree"></a>

## Interactive Task Tree

見出しで子タスクを開閉し、チェックで完了を切り替えます。Tabで移動し、EnterまたはSpaceで開閉、Spaceでチェックできます。

```html
<form class="ui-agent-workflow">
<div class="ui-agent-tasks">
<details open><summary>リリースの準備 — Coordinator</summary><ul>
<li><details open><summary>調査 — Researcher</summary><ul>
<li><label class="ui-agent-task"><input type="checkbox" name="task" value="requirements" checked><span>要件を確認<small>利用条件と対象環境を整理</small></span></label></li>
<li><label class="ui-agent-task"><input type="checkbox" name="task" value="sources"><span>出典を検証<small>参照した公式資料と更新日を確認</small></span></label></li>
</ul></details></li>
<li><details><summary>実装 — Builder</summary><ul>
<li><label class="ui-agent-task"><input type="checkbox" name="task" value="implementation"><span>連携処理を実装</span></label></li>
<li><label class="ui-agent-task"><input type="checkbox" name="task" value="tests"><span>テストを実行</span></label></li>
</ul></details></li>
<li><label class="ui-agent-task"><input type="checkbox" disabled><span>本番リリース<small>レビュー承認後に操作できます（このサンプルでは無効）</small></span></label></li>
</ul></details>
</div><p class="dim small">変更はこのページ内だけに反映されます。開閉状態とチェック状態は独立しています。</p>
<button type="reset" class="btn btn-sm btn-outline-secondary">チェックを初期状態に戻す</button>
</form>
```

## 取り込み方

共通の `ui.css` を読み込み、各例の「HTMLを表示」からマークアップをコピーします。追加のJavaScriptや依存ライブラリは不要です。

```html
<link rel="stylesheet" href="assets/css/ui.css">
```

- `ui-agent-flow`：順番のある処理を `ol` で記述。
- `ui-agent-tree`：役割の親子関係を `ul / li` の入れ子で記述。
- `ui-agent-tree-parallel` と `ui-agent-merge`：高さを揃えた3分岐と合流先。直前の3ノード構成と組み合わせます。
- `data-state`：`complete / running / pending / blocked`。状態の文字もHTMLで指定してください。進行中のステップは `aria-current="step"` で示せます。
- `ui-agent-tasks`：`details / summary` と `checkbox` によるタスクツリー。アプリ側では標準の `toggle` / `change` イベントで処理を接続します。

図はHTMLに記述した状態を表示します。実際のエージェント実行・自動レイアウト・データ保存はアプリ側で実装してください。グラフを変更するときは、入れ子と説明文を実際の依存関係に合わせて更新します。
