<!-- Generated from docs/components/carousel.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](carousel.html) · [llms.txt](../../llms.txt)

# Carousel

カードや機能紹介をスライドで表示。ボタン・インジケーター・キーボード・スワイプで、利用者が必要なタイミングで切り替えます。

<a id="carousel-basic"></a>

## 前後の切り替えとインジケーター

`ui-carousel-slide`を横に並べます。前後ボタン、任意のスライドへの移動、現在位置の表示を属性で指定できます。自動再生はしません。

```html
<div class="ui-carousel" data-ui-carousel id="carousel-basic-demo" aria-label="機能紹介" data-ui-carousel-index="0">
  <div class="ui-carousel-viewport" data-ui-carousel-viewport><section class="ui-carousel-slide sp-p-6"><p class="eyebrow">FEATURE 1</p><h3>プロジェクト管理</h3><p>タスクや資料をまとめ、必要な情報をすぐに見つけます。</p><button type="button" class="btn btn-sm btn-soft-primary" data-ui-toast="プロジェクト管理を選びました">この機能を試す</button></section>
<section class="ui-carousel-slide sp-p-6"><p class="eyebrow">FEATURE 2</p><h3>進捗の可視化</h3><p>チームの作業状況をチャートと一覧で確認できます。</p><button type="button" class="btn btn-sm btn-soft-primary" data-ui-toast="進捗の可視化を選びました">この機能を試す</button></section>
<section class="ui-carousel-slide sp-p-6"><p class="eyebrow">FEATURE 3</p><h3>チームで共有</h3><p>変更履歴を残しながら、プロジェクトの情報を共有します。</p><button type="button" class="btn btn-sm btn-soft-primary" data-ui-toast="チームで共有を選びました">この機能を試す</button></section></div>
  <div class="ui-carousel-controls"><button type="button" class="btn btn-sm btn-outline-secondary" data-ui-carousel-prev>前へ</button><div class="ui-carousel-indicators"><button type="button" data-ui-carousel-to="0" aria-label="1枚目へ"></button><button type="button" data-ui-carousel-to="1" aria-label="2枚目へ"></button><button type="button" data-ui-carousel-to="2" aria-label="3枚目へ"></button></div><span class="ui-carousel-status" data-ui-carousel-status>1 / 3</span><button type="button" class="btn btn-sm btn-outline-secondary" data-ui-carousel-next>次へ</button></div>
</div>
```

<a id="carousel-loop"></a>

## ループと初期位置

`data-ui-carousel-loop`で端から反対側へ移動できます。`data-ui-carousel-index`は0始まりの初期位置です。この例は2枚目から開きます。

```html
<div class="ui-carousel" data-ui-carousel id="carousel-loop-demo" aria-label="機能紹介" data-ui-carousel-loop data-ui-carousel-index="1">
  <div class="ui-carousel-viewport" data-ui-carousel-viewport><section class="ui-carousel-slide sp-p-6"><p class="eyebrow">FEATURE 1</p><h3>プロジェクト管理</h3><p>タスクや資料をまとめ、必要な情報をすぐに見つけます。</p><button type="button" class="btn btn-sm btn-soft-primary" data-ui-toast="プロジェクト管理を選びました">この機能を試す</button></section>
<section class="ui-carousel-slide sp-p-6"><p class="eyebrow">FEATURE 2</p><h3>進捗の可視化</h3><p>チームの作業状況をチャートと一覧で確認できます。</p><button type="button" class="btn btn-sm btn-soft-primary" data-ui-toast="進捗の可視化を選びました">この機能を試す</button></section>
<section class="ui-carousel-slide sp-p-6"><p class="eyebrow">FEATURE 3</p><h3>チームで共有</h3><p>変更履歴を残しながら、プロジェクトの情報を共有します。</p><button type="button" class="btn btn-sm btn-soft-primary" data-ui-toast="チームで共有を選びました">この機能を試す</button></section></div>
  <div class="ui-carousel-controls"><button type="button" class="btn btn-sm btn-outline-secondary" data-ui-carousel-prev>前へ</button><div class="ui-carousel-indicators"><button type="button" data-ui-carousel-to="0" aria-label="1枚目へ"></button><button type="button" data-ui-carousel-to="1" aria-label="2枚目へ"></button><button type="button" data-ui-carousel-to="2" aria-label="3枚目へ"></button></div><span class="ui-carousel-status" data-ui-carousel-status>1 / 3</span><button type="button" class="btn btn-sm btn-outline-secondary" data-ui-carousel-next>次へ</button></div>
</div>
```

<a id="carousel-keyboard"></a>

## キーボード・タッチ・動きを減らす設定

- スライド領域にTabで移動し、←→で前後、Home／Endで最初／最後へ移動します。RTLでは左右の方向を合わせます。
- スマートフォンはネイティブの横スクロールでスワイプできます。
- 表示していないスライドの操作はフォーカス対象から外します。
- OSで動きを減らしている場合は、ボタンの移動もアニメーションせず切り替えます。

<a id="carousel-content"></a>

## 画像・イベント・破棄

スライドには画像、説明、フォームやカードなどを配置できます。選択が変わると`ui:carouselchange`が発火し、0始まりの`detail.index`と`detail.total`を取得できます。

```html
<section class="ui-carousel-slide">
  <img src="feature.jpg" alt="プロジェクトの作業一覧">
</section>

<!-- スライドを追加した後はKavUI.init(root)で更新。
     作り直す前はKavUI.destroy(root)で後始末します。 -->
```

```
const carousel = document.querySelector('[data-ui-carousel]');
carousel.addEventListener('ui:carouselchange', event => {
  console.log(event.detail.index, event.detail.total);
});

// スライドを追加した後
KavUI.init(carousel);
// DOM全体を作り直す前
KavUI.destroy(carousel);
```

JavaScriptがない場合も横スクロールで内容を確認できます。機能の参考：[Bootstrap Carousel](https://getbootstrap.com/docs/5.3/components/carousel/)、操作とARIAの参考：[WAI-ARIA Carousel Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/)。

使用ファイル・取り込み方

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../../assets/css/ui.css) / [ui.js](../../assets/js/ui.js)。Vue・Astroでは既存の`KavWidget`に同じHTMLを渡して利用できます。[パッケージの使い方](../../packages/README.md)も参照してください。
