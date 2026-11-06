<!-- Generated from docs/components/agent-workflow.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](agent-workflow.html) · [llms.txt](../llms.txt)

# Agent workflow

AIエージェントの処理手順、役割の階層、並列実行、タスクの内訳を可視化します。すべて架空の実行データです。接続線は丸い曲がり角でつなぎ、「光が巡るリング（タスクカード）」と同じ白い先端・青い尾・柔らかな発光のボーダーチェイスで表示します。

<a id="agent-flow"></a>

## 処理の流れ

左から右へ処理が進みます。スマートフォンでは上から下へ並びます。色に加えて文字で実行状態を示します。「確認待ち」はAIの作業が終わり、人の確認や承認を待つ状態です。

```html
<div class="ui-agent-workflow ui-agent-flowing" data-ui-agent-flow><label class="ui-agent-motion"><input type="checkbox" checked>接続線を動かす</label><ol class="ui-agent-flow" aria-label="調査レポートの処理順"><li><div class="ui-agent-node" data-state="complete"><span class="ui-agent-state">完了</span><strong>要件を整理</strong><small>Planner · 対象と調査項目を確定</small></div></li><li><div class="ui-agent-node" data-state="complete"><span class="ui-agent-state">完了</span><strong>情報を集める</strong><small>Researcher · 3つの資料を照合</small></div></li><li aria-current="step"><div class="ui-agent-node" data-state="running"><span class="ui-agent-state">実行中</span><strong>レポートを書く</strong><small>Writer · 調査結果を構成</small></div></li><li><div class="ui-agent-node" data-state="pending"><span class="ui-agent-state">待機中</span><strong>品質を確認</strong><small>Reviewer · 出典と結論を検証</small></div></li><li><div class="ui-agent-node" data-state="review"><span class="ui-agent-state"><svg xmlns="http://www.w3.org/2000/svg" class="ui-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
  <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"></path>
</svg>確認待ち</span><strong>公開を承認</strong><small>担当者 · AIの作業結果を確認</small></div></li></ol></div>
```

<a id="agent-hierarchy"></a>

## 役割の階層

親ノードの下に担当エージェントと子タスクを配置します。接続は上から下への委任を表します。狭い画面では図の領域を横にスクロールできます。

```html
<div class="ui-agent-workflow ui-agent-flowing" data-ui-agent-flow><label class="ui-agent-motion"><input type="checkbox" checked>接続線を動かす</label><div class="ui-agent-canvas" tabindex="0" role="region" aria-label="エージェントの階層図。横スクロール可能"><ul class="ui-agent-tree"><li><div class="ui-agent-node" data-state="running"><span class="ui-agent-state">実行中</span><strong>Coordinator</strong><small>調査プロジェクトを統括</small></div><ul><li><div class="ui-agent-node" data-state="running"><span class="ui-agent-state">実行中</span><strong>Research agent</strong><small>資料の収集を担当</small></div><ul><li><div class="ui-agent-node" data-state="complete"><span class="ui-agent-state">完了</span><strong>出典を収集</strong><small>公式資料を3件確認</small></div></li></ul></li><li><div class="ui-agent-node" data-state="pending"><span class="ui-agent-state">待機中</span><strong>Writing agent</strong><small>原稿の作成を担当</small></div><ul><li><div class="ui-agent-node" data-state="pending"><span class="ui-agent-state">待機中</span><strong>構成案を作成</strong><small>調査結果の受け取り待ち</small></div></li></ul></li></ul></li></ul></div></div>
```

<a id="agent-orchestration"></a>

## エージェントの連携

Coordinatorが3つの作業を並列に委任し、すべての結果をReviewerへ渡します。実行中と停止中のノードがあるため、レビューは開始していません。

```html
<div class="ui-agent-workflow ui-agent-flowing" data-ui-agent-flow><label class="ui-agent-motion"><input type="checkbox" checked>接続線を動かす</label><div class="ui-agent-canvas" tabindex="0" role="region" aria-label="並列処理と合流の図。上から下に進みます。横スクロール可能"><ul class="ui-agent-tree ui-agent-tree-parallel"><li><div class="ui-agent-node" data-state="running"><span class="ui-agent-state">実行中</span><strong>Coordinator</strong><small>調査・実装・検証を委任</small></div><ul><li><div class="ui-agent-node" data-state="complete"><span class="ui-agent-state">完了</span><strong>Researcher</strong><small>API仕様の調査</small></div></li><li><div class="ui-agent-node" data-state="running"><span class="ui-agent-state">実行中</span><strong>Builder</strong><small>連携処理を実装</small></div></li><li><div class="ui-agent-node" data-state="blocked"><span class="ui-agent-state">停止中</span><strong>Tester</strong><small>テスト用認証情報が必要</small></div></li></ul></li></ul><div class="ui-agent-merge"><div class="ui-agent-node" data-state="pending"><span class="ui-agent-state">待機中</span><strong>Reviewer</strong><small>3つの結果を統合して検証</small></div></div></div></div>
```

<a id="task-tree"></a>

## タスクの内訳

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

共通の `ui.css` を読み込み、各例の「HTMLを表示」からマークアップをコピーします。ボーダーチェイスのアニメーションには共通の `ui.js` も読み込みます。追加ライブラリは不要です。JavaScriptなしでも静止した図を表示します。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

- `ui-agent-flowing` と `data-ui-agent-flow`：接続線のボーダーチェイス。[光が巡るリング](animations-processing.html.md)の色・発光・周期を合わせ、光が線に沿って移動します。`ui-agent-motion` 内のチェックで各図を停止・再開できます。画面外・非表示タブでは停止し、動きを減らす設定では静止します。速度は `--ui-agent-flow-duration`（既定2.4秒）で指定します。
- `ui-agent-flow`：順番のある処理を `ol` で記述。
- `ui-agent-tree`：役割の親子関係を `ul / li` の入れ子で記述。
- `ui-agent-tree-parallel` と `ui-agent-merge`：高さを揃えた3分岐と合流先。直前の3ノード構成と組み合わせます。
- `data-state`：`complete / running / pending / review / blocked`。指定なし・`pending`は待機中、`review`は人の確認待ち、`blocked`は作業の停止を表します。状態の文字は `ui-agent-state` 内にHTMLで指定し、見た目と読み上げの両方で伝えてください。確認待ちは既存の `assets/icons/mdi/eye.svg` をインラインSVG（`ui-icon`、`aria-hidden="true"`）として添えます。JavaScriptなし・強制カラーモードでも文字とアイコンで区別できます。進行中のステップは `aria-current="step"` で示せます。
- 他部品との対応：[状態バッジ](badges.html.md)の確認待ち（`text-bg-warning`）と同じ `--bs-warning` 系トークンを使い、ノードの枠は `--bs-warning`、文字は `--bs-warning-text-emphasis` に揃えます。バッジには専用アイコンがなく、[タイムライン](timeline.html.md)にも確認待ち専用の状態・色・アイコンはありません。タイムラインで表す場合は本文に「確認待ち」と書き、マーカーに同じeyeアイコンを添えられます。
- `ui-agent-tasks`：`details / summary` と `checkbox` によるタスクツリー。アプリ側では標準の `toggle` / `change` イベントで処理を接続します。

図はHTMLに記述した状態を表示します。実際のエージェント実行・自動レイアウト・データ保存はアプリ側で実装してください。グラフを変更するときは、入れ子と説明文を実際の依存関係に合わせて更新します。
