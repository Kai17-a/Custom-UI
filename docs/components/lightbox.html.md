<!-- Generated from docs/components/lightbox.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](lightbox.html) · [llms.txt](../llms.txt)

# Lightbox

画像を拡大し、ズームと前後移動で確認します。

## 画像を拡大する

```html
<div data-ui-lightbox data-ui-lightbox-label="制作物のプレビュー"><a class="btn btn-outline-secondary" href="../assets/images/theme-background.svg" data-ui-lightbox-item data-ui-lightbox-alt="テーマの背景に使う抽象図形" data-ui-lightbox-caption="テーマ背景の見本">背景画像を開く</a><a class="btn btn-outline-secondary" href="../assets/images/theme-background.svg" data-ui-lightbox-item data-ui-lightbox-alt="背景素材の確認用画像" data-ui-lightbox-caption="同じ素材の説明を添えた2枚目の例">2枚目の見本を開く</a></div>
```

## 属性と操作

data-ui-lightboxで画像リンクのグループを囲み、各aにdata-ui-lightbox-itemを付けます。hrefが拡大画像のURLです。data-ui-lightbox-altで代替テキスト、data-ui-lightbox-captionで説明を指定します。省略時はリンク内のimgのaltまたはリンク文字列を使います。

前後ボタンで画像を移動し、拡大で最大4倍、元の倍率で全幅内の表示に戻します。画像領域にフォーカスがある場合は左右キーで移動できます。拡大中は同じキーでスクロールします。Escapeまたは閉じるボタンで終了し、元のリンクへ戻ります。

ui:lightboxchangeのdetail.indexは0から始まる番号、detail.sourceは元のリンクです。読み込み中と失敗を表示します。画像編集・動画・PDFは対象外です。JavaScriptなしや修飾キー付きクリックでは通常のリンクとして画像を開けます。

## 導入と参考

共通のui.cssとui.jsを読み込みます。動的に追加したHTMLはKavUI.init、破棄時はKavUI.destroyを呼びます。Vue・AstroではKavWidgetに同じHTMLを渡せます。

[Astryxの参考Story](https://astryx.atmeta.com/storybook/?path=/story/core-lightbox--gallery-with-zoom) / [パッケージの使い方](../packages/README.md)
