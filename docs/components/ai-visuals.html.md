<!-- Generated from docs/components/ai-visuals.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](ai-visuals.html) · [llms.txt](../llms.txt)

# AI visuals

AIの回答、参照資料、ツール実行、コンテキスト、音声の状態を見せるUI。標準HTMLと共通CSSだけで使える6種類の表示例です。

すべて表示用の例示データです。AIへの通信・録音・トークンの計算は行いません。

<a id="ai-answer"></a>

## Answer & citations — 回答と出典

回答の要点と、根拠になった資料をまとめます。出典の詳細は必要なときに開けます。

```html
<article class="ui-ai">
<p class="ui-ai-question"><span>質問</span>Kav-UIを既存のHTMLアプリに取り込むには？</p>
<div class="ui-ai-message"><span class="ui-ai-avatar" aria-hidden="true">AI</span><div class="ui-ai-message-body">
<div class="ui-ai-head"><strong>Assistant</strong><span class="ui-ai-status" data-state="complete">回答完了</span></div>
<p>同じ配布版の <code>assets</code> フォルダをアプリへコピーし、<code>ui.css</code> と <code>ui.js</code> を読み込みます。HTML版ではnpmやビルドは不要です。<span class="ui-ai-citation-ref">［資料1］</span></p>
<p>最初に使いたいサンプルのHTMLを取り込み、保存や通信の処理をアプリ側へ接続してください。<span class="ui-ai-citation-ref">［資料2］</span></p>
<details class="ui-ai-disclosure"><summary>出典を確認（2件）</summary><ol class="ui-ai-sources">
<li><cite>資料1 · ダウンロード・導入</cite><p>assetsの配置、CSSとJavaScriptの読み込み手順。</p></li>
<li><cite>資料2 · 使い方・属性一覧</cite><p>HTML属性とアプリ処理を接続する方法。</p></li>
</ol></details>
</div></div></article>
```

<a id="ai-tools"></a>

## Tool execution trace — ツール実行履歴

ツール名・結果・所要時間を一覧にし、引数と結果を開閉できます。内部の思考ではなく、利用者が確認できる実行情報の表示例です。

```html
<div class="ui-ai ui-ai-tools"><ol class="ui-ai-tool-list" aria-label="資料を調べるツールの実行履歴">
<li><details><summary><span class="ui-ai-tool-name"><code>search_docs</code><small>ドキュメント内を検索 · 240 ms</small></span><span class="ui-ai-status" data-state="complete">完了</span></summary><div class="ui-ai-tool-body"><p class="ui-ai-caption">入力</p><pre><code>{"query":"配色の切り替え","limit":3}</code></pre><p>3件の候補を取得しました。</p></div></details></li>
<li><details><summary><span class="ui-ai-tool-name"><code>read_document</code><small>資料の本文を取得 · 860 ms</small></span><span class="ui-ai-status" data-state="complete">完了</span></summary><div class="ui-ai-tool-body"><p class="ui-ai-caption">入力</p><pre><code>{"document":"color-palettes","section":"custom"}</code></pre><p>カスタム配色の設定方法を読み込みました。</p></div></details></li>
<li><details open><summary><span class="ui-ai-tool-name"><code>verify_reference</code><small>参照先を確認 · 42 ms</small></span><span class="ui-ai-status" data-state="error">要確認</span></summary><div class="ui-ai-tool-body"><p>参照した資料の1件を取得できませんでした。資料のURLや閲覧権限を確認してから、もう一度実行してください。</p><p class="ui-ai-caption">ここでは失敗時の表示だけを示しています。</p></div></details></li>
</ol></div>
```

<a id="ai-retrieval"></a>

## Retrieval results — RAGの検索結果

取得候補の関連度と、実際に使う抜粋を確認する表示です。関連度は例示スコアで、回答の正確さや確信度を表すものではありません。

```html
<div class="ui-ai">
<div class="ui-ai-query"><span>検索した質問</span><p>ユーザーが自分で配色を変更できるようにしたい</p></div>
<div class="ui-ai-head"><strong>取得した資料 · 3件</strong><span class="ui-ai-caption">表示用サンプル</span></div>
<details class="ui-ai-result" open><summary><span class="ui-ai-result-name">カスタム配色の設定</span><span class="ui-ai-score">関連度 0.94</span></summary><div class="ui-ai-result-body"><p>基準色と彩度を選び、ライト・ダーク両方の<mark>配色</mark>を設定します。</p><p class="ui-ai-caption">color-palettes / カスタム配色 · 回答に使用</p></div></details>
<details class="ui-ai-result"><summary><span class="ui-ai-result-name">保存したテーマの復元</span><span class="ui-ai-score">関連度 0.87</span></summary><div class="ui-ai-result-body"><p>任意の初期化スクリプトをCSSより前に読み込むと、保存済みの<mark>配色</mark>を初回描画に反映できます。</p><p class="ui-ai-caption">getting-started / テーマの初期化 · 回答に使用</p></div></details>
<details class="ui-ai-result"><summary><span class="ui-ai-result-name">コンポーネントの状態色</span><span class="ui-ai-score">関連度 0.62</span></summary><div class="ui-ai-result-body"><p>成功・警告・エラーなどの意味を、共通の色と文字で示します。</p><p class="ui-ai-caption">foundations / 状態色 · 候補として保持</p></div></details>
</div>
```

<a id="ai-map"></a>

## Semantic map — 資料の意味マップ

質問と資料の意味的な近さを、点の配置と一覧で表します。狭い画面では図だけを横スクロールできます。

```html
<figure class="ui-ai ui-ai-map">
<div class="ui-ai-head"><h3>関連資料の意味マップ</h3><span class="ui-ai-caption">2D投影の表示例</span></div>
<div class="ui-ai-map-canvas" tabindex="0" role="region" aria-label="意味マップ。横スクロール可能">
<svg viewBox="0 0 640 240" role="img" aria-labelledby="ai-map-title" aria-describedby="ai-map-description">
<title id="ai-map-title">質問と資料の意味的な近さの表示例</title><desc id="ai-map-description">二重丸は質問。近くの丸が資料1、資料2、資料3です。右側の四角はフォーム関連、菱形は配布関連の資料です。座標は表示用の例です。</desc>
<path class="ui-ai-map-axis" d="M28 28V208H612"/>
<text x="34" y="20">投影軸2</text><text x="551" y="231">投影軸1</text>
<text class="ui-ai-map-group" x="78" y="45">導入・テーマ</text>
<circle class="ui-ai-map-near" cx="105" cy="100" r="6"/><text x="67" y="80">資料1</text>
<circle class="ui-ai-map-near" cx="150" cy="150" r="6"/><text x="130" y="178">資料2</text>
<circle class="ui-ai-map-near" cx="230" cy="110" r="6"/><text x="217" y="88">資料3</text>
<circle class="ui-ai-map-query" cx="180" cy="112" r="12"/><circle class="ui-ai-map-near" cx="180" cy="112" r="3"/><text class="ui-ai-map-group" x="166" y="96">質問</text>
<text class="ui-ai-map-group" x="343" y="45">フォーム関連</text>
<rect class="ui-ai-map-forms" x="374" y="66" width="12" height="12" rx="1"/><rect class="ui-ai-map-forms" x="414" y="104" width="12" height="12" rx="1"/><rect class="ui-ai-map-forms" x="364" y="140" width="12" height="12" rx="1"/>
<text class="ui-ai-map-group" x="497" y="65">配布関連</text>
<path class="ui-ai-map-release" d="M540 82l8 8-8 8-8-8z M510 122l8 8-8 8-8-8z M560 152l8 8-8 8-8-8z"/>
</svg></div>
<figcaption class="ui-ai-caption">配置・距離は例示データです。丸・四角・菱形で資料のグループを区別し、二重丸は質問を示します。実際の埋め込みや類似度を計算した結果ではありません。</figcaption>
<details class="ui-ai-disclosure" open><summary>質問に近い資料（例）</summary><ol class="ui-ai-map-list"><li>資料1 · 導入ガイド</li><li>資料2 · 使い方・属性一覧</li><li>資料3 · テーマ設定</li></ol></details>
</figure>
```

<a id="ai-context"></a>

## Context budget — コンテキスト使用量

入力の内訳と残り容量を同時に表示します。上限128,000トークンは例示値です。実際のモデルの上限やトークン数はアプリ側で設定・計算します。

```html
<div class="ui-ai">
<div class="ui-ai-head"><h3>コンテキストの配分</h3><span class="ui-ai-status" data-state="complete">余裕あり</span></div>
<p><strong>47,600</strong> / 128,000 tokens を使用 · 残り <strong>80,400</strong></p>
<div class="ui-ai-budget-track" role="meter" aria-label="コンテキスト使用量" aria-valuemin="0" aria-valuemax="128000" aria-valuenow="47600" aria-valuetext="128,000トークン中47,600使用。残り80,400。">
<span class="ui-ai-token-system" style="flex-grow:7600" aria-hidden="true"></span><span class="ui-ai-token-history" style="flex-grow:19200" aria-hidden="true"></span><span class="ui-ai-token-documents" style="flex-grow:20800" aria-hidden="true"></span><span class="ui-ai-token-free" style="flex-grow:80400" aria-hidden="true"></span>
</div>
<dl class="ui-ai-budget-breakdown"><div class="ui-ai-token-system"><dt>システム指示</dt><dd><data value="7600">7,600</data> tokens</dd></div><div class="ui-ai-token-history"><dt>会話履歴</dt><dd><data value="19200">19,200</data> tokens</dd></div><div class="ui-ai-token-documents"><dt>取得した資料</dt><dd><data value="20800">20,800</data> tokens</dd></div><div class="ui-ai-token-free"><dt>残り容量</dt><dd><data value="80400">80,400</data> tokens</dd></div></dl>
</div>
```

<a id="ai-voice"></a>

## Voice activity — 音声アクティビティ

スイッチで待機と解析中の表示を切り替えます。波形と文字が変わるだけの表示例で、マイクを使わず、実際の録音や音声認識は行いません。

```html
<div class="ui-ai ui-ai-voice">
<label class="ui-ai-voice-toggle"><input id="ai-voice-state" type="checkbox" role="switch" aria-controls="ai-voice-display">解析中の表示に切り替える</label>
<div id="ai-voice-display"><div class="ui-ai-wave" aria-hidden="true"><span style="--ui-ai-wave-size:0.2"></span><span style="--ui-ai-wave-size:0.32"></span><span style="--ui-ai-wave-size:0.48"></span><span style="--ui-ai-wave-size:0.3"></span><span style="--ui-ai-wave-size:0.65"></span><span style="--ui-ai-wave-size:0.86"></span><span style="--ui-ai-wave-size:0.56"></span><span style="--ui-ai-wave-size:0.72"></span><span style="--ui-ai-wave-size:1"></span><span style="--ui-ai-wave-size:0.64"></span><span style="--ui-ai-wave-size:0.92"></span><span style="--ui-ai-wave-size:0.48"></span><span style="--ui-ai-wave-size:0.76"></span><span style="--ui-ai-wave-size:0.6"></span><span style="--ui-ai-wave-size:0.96"></span><span style="--ui-ai-wave-size:0.54"></span><span style="--ui-ai-wave-size:0.72"></span><span style="--ui-ai-wave-size:0.4"></span><span style="--ui-ai-wave-size:0.52"></span><span style="--ui-ai-wave-size:0.3"></span><span style="--ui-ai-wave-size:0.18"></span></div>
<output for="ai-voice-state" class="ui-ai-voice-state" aria-live="polite"><span class="ui-ai-voice-idle">待機中</span><span class="ui-ai-voice-active">音声を解析中</span></output>
<p class="ui-ai-voice-caption"><span class="ui-ai-voice-idle">音声の入力を待っています。</span><span class="ui-ai-voice-active">「表示をダークテーマに切り替えて」</span></p>
</div></div>
```

## 取り込み方

共通の `ui.css` とサンプルのHTMLを取り込みます。開閉と状態の切り替えには標準の `details / summary` と `checkbox` を使うため、追加のJavaScriptは不要です。

```html
<link rel="stylesheet" href="assets/css/ui.css">
```

- `ui-ai-message` と `ui-ai-disclosure`：回答と出典。
- `ui-ai-tool-list`：ツールの実行履歴。状態文字もHTMLで指定してください。
- `ui-ai-result`：取得資料と抜粋。関連度の定義はアプリ側で説明します。
- `ui-ai-map-canvas`：意味マップ。SVGの名前・説明・資料一覧を実際のデータに合わせて更新します。
- `ui-ai-budget-track` と `ui-ai-budget-breakdown`：使用量のバーと内訳。内訳・幅・ARIAの値を同じデータから更新してください。
- `ui-ai-voice`：待機/解析の表示例。実アプリでは音声の状態に応じてチェック状態や表示を更新します。

ページ内のIDを複数の例で再利用するときは、`for` や `aria-controls` の参照も合わせて一意にします。データ取得・保存・トークン計算・音声認識はアプリ側で実装してください。

[エージェントの階層・連携・タスクツリーの図はこちら →](agent-workflow.html.md)
