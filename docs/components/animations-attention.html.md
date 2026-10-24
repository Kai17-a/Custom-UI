<!-- Generated from docs/components/animations-attention.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](animations-attention.html) · [llms.txt](../llms.txt)

Animations

/

強調・揺れ

# Animations · 強調・揺れ

Bounce・Shake・Wobble・Swing・Pulse・Heartbeat。注目を促す6種類です。

`ui-animate`と効果のクラスを指定します。標準は600ms・1回。[速度・遅延・繰り返しの指定 →](animations.html.md#animation-options)

## 注目を促す動き

```html
<div class="ui-page-grid">
<article class="ui-card"><div class="ui-card-body"><h3 class="ui-card-title">Bounce</h3><p class="ui-card-description">バウンド</p><div class="animation-demo-stage"><div id="animation-bounce" class="animation-demo-target ui-animate ui-animate-bounce" aria-hidden="true">Aa</div></div><code>ui-animate-bounce</code></div><footer class="ui-card-footer"><button type="button" class="btn btn-sm btn-outline-secondary" data-demo-animation-replay="#animation-bounce" aria-label="Bounceを再生する">再生する</button></footer></article>
<article class="ui-card"><div class="ui-card-body"><h3 class="ui-card-title">Shake</h3><p class="ui-card-description">横に揺れる</p><div class="animation-demo-stage"><div id="animation-shake" class="animation-demo-target ui-animate ui-animate-shake" aria-hidden="true">Aa</div></div><code>ui-animate-shake</code></div><footer class="ui-card-footer"><button type="button" class="btn btn-sm btn-outline-secondary" data-demo-animation-replay="#animation-shake" aria-label="Shakeを再生する">再生する</button></footer></article>
<article class="ui-card"><div class="ui-card-body"><h3 class="ui-card-title">Wobble</h3><p class="ui-card-description">左右にぐらつく</p><div class="animation-demo-stage"><div id="animation-wobble" class="animation-demo-target ui-animate ui-animate-wobble" aria-hidden="true">Aa</div></div><code>ui-animate-wobble</code></div><footer class="ui-card-footer"><button type="button" class="btn btn-sm btn-outline-secondary" data-demo-animation-replay="#animation-wobble" aria-label="Wobbleを再生する">再生する</button></footer></article>
<article class="ui-card"><div class="ui-card-body"><h3 class="ui-card-title">Swing</h3><p class="ui-card-description">振り子</p><div class="animation-demo-stage"><div id="animation-swing" class="animation-demo-target ui-animate ui-animate-swing" aria-hidden="true">Aa</div></div><code>ui-animate-swing</code></div><footer class="ui-card-footer"><button type="button" class="btn btn-sm btn-outline-secondary" data-demo-animation-replay="#animation-swing" aria-label="Swingを再生する">再生する</button></footer></article>
<article class="ui-card"><div class="ui-card-body"><h3 class="ui-card-title">Pulse</h3><p class="ui-card-description">ゆっくり拡大</p><div class="animation-demo-stage"><div id="animation-pulse" class="animation-demo-target ui-animate ui-animate-pulse" aria-hidden="true">Aa</div></div><code>ui-animate-pulse</code></div><footer class="ui-card-footer"><button type="button" class="btn btn-sm btn-outline-secondary" data-demo-animation-replay="#animation-pulse" aria-label="Pulseを再生する">再生する</button></footer></article>
<article class="ui-card"><div class="ui-card-body"><h3 class="ui-card-title">Heartbeat</h3><p class="ui-card-description">鼓動</p><div class="animation-demo-stage"><div id="animation-heartbeat" class="animation-demo-target ui-animate ui-animate-heartbeat" aria-hidden="true">Aa</div></div><code>ui-animate-heartbeat</code></div><footer class="ui-card-footer"><button type="button" class="btn btn-sm btn-outline-secondary" data-demo-animation-replay="#animation-heartbeat" aria-label="Heartbeatを再生する">再生する</button></footer></article>
</div>
```

使用ファイル・取り込み方

共通の ui.css と ui.js を読み込み、サンプルのHTMLを配置します。必要な動作は data-ui-* 属性で指定します。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../assets/ui/css/ui.css) / [ui.js](../assets/ui/js/ui.js) / [属性一覧と導入例](../getting-started.html.md)

assetsフォルダごとコピーするとCSS内の相対参照も維持できます。catalog.js、catalog-navigation.js、catalog-demo.js、layout.css はカタログ専用です。data-demo-* はアプリに取り込む際に外し、保存や通信はアプリ側で実装してください。
