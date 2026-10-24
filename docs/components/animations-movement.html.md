<!-- Generated from docs/components/animations-movement.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](animations-movement.html) · [llms.txt](../../llms.txt)

Animations

/

移動・回転

# Animations · 移動・回転

4方向のSlide、Float、Spin。移動する方向や回転の動きを比較できます。

`ui-animate`と効果のクラスを指定します。標準は600ms・1回。[速度・遅延・繰り返しの指定 →](animations.html.md#animation-options)

## スライド（移動する方向）

```html
<div class="ui-page-grid">
<article class="ui-card"><div class="ui-card-body"><h3 class="ui-card-title">Slide up</h3><p class="ui-card-description">下からスライド</p><div class="animation-demo-stage"><div id="animation-slide-up" class="animation-demo-target ui-animate ui-animate-slide-up" aria-hidden="true">Aa</div></div><code>ui-animate-slide-up</code></div><footer class="ui-card-footer"><button type="button" class="btn btn-sm btn-outline-secondary" data-demo-animation-replay="#animation-slide-up" aria-label="Slide upを再生する">再生する</button></footer></article>
<article class="ui-card"><div class="ui-card-body"><h3 class="ui-card-title">Slide down</h3><p class="ui-card-description">上からスライド</p><div class="animation-demo-stage"><div id="animation-slide-down" class="animation-demo-target ui-animate ui-animate-slide-down" aria-hidden="true">Aa</div></div><code>ui-animate-slide-down</code></div><footer class="ui-card-footer"><button type="button" class="btn btn-sm btn-outline-secondary" data-demo-animation-replay="#animation-slide-down" aria-label="Slide downを再生する">再生する</button></footer></article>
<article class="ui-card"><div class="ui-card-body"><h3 class="ui-card-title">Slide left</h3><p class="ui-card-description">右からスライド</p><div class="animation-demo-stage"><div id="animation-slide-left" class="animation-demo-target ui-animate ui-animate-slide-left" aria-hidden="true">Aa</div></div><code>ui-animate-slide-left</code></div><footer class="ui-card-footer"><button type="button" class="btn btn-sm btn-outline-secondary" data-demo-animation-replay="#animation-slide-left" aria-label="Slide leftを再生する">再生する</button></footer></article>
<article class="ui-card"><div class="ui-card-body"><h3 class="ui-card-title">Slide right</h3><p class="ui-card-description">左からスライド</p><div class="animation-demo-stage"><div id="animation-slide-right" class="animation-demo-target ui-animate ui-animate-slide-right" aria-hidden="true">Aa</div></div><code>ui-animate-slide-right</code></div><footer class="ui-card-footer"><button type="button" class="btn btn-sm btn-outline-secondary" data-demo-animation-replay="#animation-slide-right" aria-label="Slide rightを再生する">再生する</button></footer></article>
</div>
```

## 浮遊・回転

```html
<div class="ui-page-grid">
<article class="ui-card"><div class="ui-card-body"><h3 class="ui-card-title">Float</h3><p class="ui-card-description">浮遊</p><div class="animation-demo-stage"><div id="animation-float" class="animation-demo-target ui-animate ui-animate-float" aria-hidden="true">Aa</div></div><code>ui-animate-float</code></div><footer class="ui-card-footer"><button type="button" class="btn btn-sm btn-outline-secondary" data-demo-animation-replay="#animation-float" aria-label="Floatを再生する">再生する</button></footer></article>
<article class="ui-card"><div class="ui-card-body"><h3 class="ui-card-title">Spin</h3><p class="ui-card-description">一回転</p><div class="animation-demo-stage"><div id="animation-spin" class="animation-demo-target ui-animate ui-animate-spin" aria-hidden="true">Aa</div></div><code>ui-animate-spin</code></div><footer class="ui-card-footer"><button type="button" class="btn btn-sm btn-outline-secondary" data-demo-animation-replay="#animation-spin" aria-label="Spinを再生する">再生する</button></footer></article>
</div>
```

使用ファイル・取り込み方

共通の ui.css と ui.js を読み込み、サンプルのHTMLを配置します。必要な動作は data-ui-* 属性で指定します。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../../assets/css/ui.css) / [ui.js](../../assets/js/ui.js) / [属性一覧と導入例](../getting-started.html.md)

assetsフォルダごとコピーするとCSS内の相対参照も維持できます。catalog.js、catalog-navigation.js、catalog-demo.js、layout.css はカタログ専用です。data-demo-* はアプリに取り込む際に外し、保存や通信はアプリ側で実装してください。
