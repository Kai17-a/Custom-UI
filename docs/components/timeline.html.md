<!-- Generated from docs/components/timeline.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](timeline.html) · [llms.txt](../llms.txt)

# Timeline

履歴や作業の進行状況を、日付・状態・説明とともに縦に並べます。監査ログや申請の状況表示に使えます。

<a id="timeline-basic"></a>

## 日付と説明を並べる

順序付きリストの各項目にマーカーと本文を配置します。日付には`time`と`datetime`を使います。基本の表示にはJavaScriptは不要です。

```html
<ol class="ui-timeline" role="list" aria-label="対応履歴">
<li class="ui-timeline-item is-complete"><span class="ui-timeline-marker" aria-hidden="true"></span><div class="ui-timeline-content"><time class="ui-timeline-date" datetime="2026-10-21">2026-10-21</time><h3 class="ui-timeline-title">依頼を受け付けました</h3><p>入力内容を確認し、対応を開始しました。</p></div></li>
<li class="ui-timeline-item"><span class="ui-timeline-marker" aria-hidden="true"></span><div class="ui-timeline-content"><time class="ui-timeline-date" datetime="2026-10-22">2026-10-22</time><h3 class="ui-timeline-title">準備を進めています</h3><p>必要な資料と設定を確認しています。</p></div></li>
<li class="ui-timeline-item"><span class="ui-timeline-marker" aria-hidden="true"></span><div class="ui-timeline-content"><time class="ui-timeline-date" datetime="2026-10-23">2026-10-23</time><h3 class="ui-timeline-title">公開を予定しています</h3><p>準備が整い次第、チームへ通知します。</p></div></li>
</ol>
```

<a id="timeline-status"></a>

## 完了と現在のステップ

完了項目は`is-complete`、現在の項目は`aria-current="step"`で示します。状態の更新はアプリ側で行います。

```html
<ol class="ui-timeline" role="list" aria-label="対応履歴">
<li class="ui-timeline-item is-complete"><span class="ui-timeline-marker" aria-hidden="true"></span><div class="ui-timeline-content"><time class="ui-timeline-date" datetime="2026-10-21">2026-10-21</time><h3 class="ui-timeline-title">依頼を受け付けました</h3><p>入力内容を確認し、対応を開始しました。</p></div></li>
<li class="ui-timeline-item" aria-current="step"><span class="ui-timeline-marker" aria-hidden="true"></span><div class="ui-timeline-content"><time class="ui-timeline-date" datetime="2026-10-22">2026-10-22</time><h3 class="ui-timeline-title">準備を進めています</h3><p>必要な資料と設定を確認しています。</p></div></li>
<li class="ui-timeline-item"><span class="ui-timeline-marker" aria-hidden="true"></span><div class="ui-timeline-content"><time class="ui-timeline-date" datetime="2026-10-23">2026-10-23</time><h3 class="ui-timeline-title">公開を予定しています</h3><p>準備が整い次第、チームへ通知します。</p></div></li>
</ol>
```

<a id="timeline-icons"></a>

## アイコン付き

マーカー内には既存のMDIアイコンやSVGを入れられます。装飾として使う場合は`aria-hidden="true"`を指定します。

```html
<ol class="ui-timeline" role="list" aria-label="対応履歴">
<li class="ui-timeline-item is-complete"><span class="ui-timeline-marker" aria-hidden="true"><span icon="mdi-check" aria-hidden="true"></span></span><div class="ui-timeline-content"><time class="ui-timeline-date" datetime="2026-10-21">2026-10-21</time><h3 class="ui-timeline-title">依頼を受け付けました</h3><p>入力内容を確認し、対応を開始しました。</p></div></li>
<li class="ui-timeline-item" aria-current="step"><span class="ui-timeline-marker" aria-hidden="true"><span icon="mdi-progress-clock" aria-hidden="true"></span></span><div class="ui-timeline-content"><time class="ui-timeline-date" datetime="2026-10-22">2026-10-22</time><h3 class="ui-timeline-title">準備を進めています</h3><p>必要な資料と設定を確認しています。</p></div></li>
<li class="ui-timeline-item"><span class="ui-timeline-marker" aria-hidden="true"><span icon="mdi-folder-outline" aria-hidden="true"></span></span><div class="ui-timeline-content"><time class="ui-timeline-date" datetime="2026-10-23">2026-10-23</time><h3 class="ui-timeline-title">公開を予定しています</h3><p>準備が整い次第、チームへ通知します。</p></div></li>
</ol>
```

<a id="timeline-compact"></a>

## コンパクトな履歴

`ui-timeline-compact`でマーカーと項目間隔を抑え、監査ログや更新履歴をコンパクトに表示します。

```html
<ol class="ui-timeline ui-timeline-compact" role="list" aria-label="対応履歴">
<li class="ui-timeline-item is-complete"><span class="ui-timeline-marker" aria-hidden="true"></span><div class="ui-timeline-content"><time class="ui-timeline-date" datetime="2026-10-21">2026-10-21</time><h3 class="ui-timeline-title">依頼を受け付けました</h3><p>入力内容を確認し、対応を開始しました。</p></div></li>
<li class="ui-timeline-item"><span class="ui-timeline-marker" aria-hidden="true"></span><div class="ui-timeline-content"><time class="ui-timeline-date" datetime="2026-10-22">2026-10-22</time><h3 class="ui-timeline-title">準備を進めています</h3><p>必要な資料と設定を確認しています。</p></div></li>
<li class="ui-timeline-item"><span class="ui-timeline-marker" aria-hidden="true"></span><div class="ui-timeline-content"><time class="ui-timeline-date" datetime="2026-10-23">2026-10-23</time><h3 class="ui-timeline-title">公開を予定しています</h3><p>準備が整い次第、チームへ通知します。</p></div></li>
</ol>
```

<a id="timeline-reference"></a>

## 参考と取り込み方

機能の参考：[daisyUI Timeline](https://daisyui.com/components/timeline/)。Kav-UIの色・罫線・余白で構成し、外部CSSやJavaScriptを読み込まず利用できます。

使用ファイル・取り込み方

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../assets/ui/css/ui.css) / [ui.js](../assets/ui/js/ui.js)。Vue・Astroでは既存の`KavWidget`に同じHTMLを渡して利用できます。[パッケージの使い方](../packages/README.md)も参照してください。
