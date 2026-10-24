<!-- Generated from docs/components/animations-entrances.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](animations-entrances.html) · [llms.txt](../../llms.txt)

Animations

/

表示・非表示

# Animations · 表示・非表示

Fade・Zoom・Flip・Rotate。要素が現れる・消えるときの6種類です。

`ui-animate`と効果のクラスを指定します。標準は600ms・1回。[速度・遅延・繰り返しの指定 →](animations.html.md#animation-options)

## 表示・非表示

```html
<div class="ui-page-grid">
<article class="ui-card"><div class="ui-card-body"><h3 class="ui-card-title">Fade in</h3><p class="ui-card-description">フェードイン</p><div class="animation-demo-stage"><div id="animation-fade-in" class="animation-demo-target ui-animate ui-animate-fade-in" aria-hidden="true">Aa</div></div><code>ui-animate-fade-in</code></div><footer class="ui-card-footer"><button type="button" class="btn btn-sm btn-outline-secondary" data-demo-animation-replay="#animation-fade-in" aria-label="Fade inを再生する">再生する</button></footer></article>
<article class="ui-card"><div class="ui-card-body"><h3 class="ui-card-title">Fade out</h3><p class="ui-card-description">フェードアウト</p><div class="animation-demo-stage"><div id="animation-fade-out" class="animation-demo-target ui-animate ui-animate-fade-out" aria-hidden="true">Aa</div></div><code>ui-animate-fade-out</code></div><footer class="ui-card-footer"><button type="button" class="btn btn-sm btn-outline-secondary" data-demo-animation-replay="#animation-fade-out" aria-label="Fade outを再生する">再生する</button></footer></article>
<article class="ui-card"><div class="ui-card-body"><h3 class="ui-card-title">Zoom in</h3><p class="ui-card-description">ズームイン</p><div class="animation-demo-stage"><div id="animation-zoom-in" class="animation-demo-target ui-animate ui-animate-zoom-in" aria-hidden="true">Aa</div></div><code>ui-animate-zoom-in</code></div><footer class="ui-card-footer"><button type="button" class="btn btn-sm btn-outline-secondary" data-demo-animation-replay="#animation-zoom-in" aria-label="Zoom inを再生する">再生する</button></footer></article>
<article class="ui-card"><div class="ui-card-body"><h3 class="ui-card-title">Zoom out</h3><p class="ui-card-description">ズームアウト</p><div class="animation-demo-stage"><div id="animation-zoom-out" class="animation-demo-target ui-animate ui-animate-zoom-out" aria-hidden="true">Aa</div></div><code>ui-animate-zoom-out</code></div><footer class="ui-card-footer"><button type="button" class="btn btn-sm btn-outline-secondary" data-demo-animation-replay="#animation-zoom-out" aria-label="Zoom outを再生する">再生する</button></footer></article>
<article class="ui-card"><div class="ui-card-body"><h3 class="ui-card-title">Flip in</h3><p class="ui-card-description">立体的な反転</p><div class="animation-demo-stage"><div id="animation-flip-in" class="animation-demo-target ui-animate ui-animate-flip-in" aria-hidden="true">Aa</div></div><code>ui-animate-flip-in</code></div><footer class="ui-card-footer"><button type="button" class="btn btn-sm btn-outline-secondary" data-demo-animation-replay="#animation-flip-in" aria-label="Flip inを再生する">再生する</button></footer></article>
<article class="ui-card"><div class="ui-card-body"><h3 class="ui-card-title">Rotate in</h3><p class="ui-card-description">回転して表示</p><div class="animation-demo-stage"><div id="animation-rotate-in" class="animation-demo-target ui-animate ui-animate-rotate-in" aria-hidden="true">Aa</div></div><code>ui-animate-rotate-in</code></div><footer class="ui-card-footer"><button type="button" class="btn btn-sm btn-outline-secondary" data-demo-animation-replay="#animation-rotate-in" aria-label="Rotate inを再生する">再生する</button></footer></article>
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
