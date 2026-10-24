<!-- Generated from docs/components/rating.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](rating.html) · [llms.txt](../../llms.txt)

# Rating

星で評価を入力・表示するコンポーネント。ネイティブのradioを使い、フォーム送信・リセット・キーボード操作に対応します。

<a id="rating-input"></a>

## 評価入力とリセット

標準のradioを使うため、フォーム送信・キーボード・リセットがそのまま動きます。同じ評価の星には同じ`name`を指定し、別の評価には別名を使います。

```html
<form id="rating-form"><fieldset class="ui-rating "><legend>使いやすさ</legend><label class="ui-rating-choice ui-rating-clear"><input class="ui-rating-input" type="radio" name="rating" value="0">未評価</label><label class="ui-rating-choice"><input class="ui-rating-input" type="radio" name="rating" value="1" aria-label="1点"><svg class="ui-rating-star" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"></path></svg></label><label class="ui-rating-choice"><input class="ui-rating-input" type="radio" name="rating" value="2" aria-label="2点"><svg class="ui-rating-star" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"></path></svg></label><label class="ui-rating-choice"><input class="ui-rating-input" type="radio" name="rating" value="3" aria-label="3点" checked><svg class="ui-rating-star" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"></path></svg></label><label class="ui-rating-choice"><input class="ui-rating-input" type="radio" name="rating" value="4" aria-label="4点"><svg class="ui-rating-star" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"></path></svg></label><label class="ui-rating-choice"><input class="ui-rating-input" type="radio" name="rating" value="5" aria-label="5点"><svg class="ui-rating-star" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"></path></svg></label></fieldset><button type="reset" class="btn btn-sm btn-outline-secondary sp-mt-3">初期評価へ戻す</button></form>
```

<a id="rating-size"></a>

## サイズと色

`ui-rating-sm`・`ui-rating-lg`でサイズ、`ui-rating-warning`で警告色の星にできます。

```html
<div class="ui-stack"><fieldset class="ui-rating ui-rating-sm"><legend>使いやすさ</legend><label class="ui-rating-choice"><input class="ui-rating-input" type="radio" name="rating-small" value="1" aria-label="1点"><svg class="ui-rating-star" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"></path></svg></label><label class="ui-rating-choice"><input class="ui-rating-input" type="radio" name="rating-small" value="2" aria-label="2点"><svg class="ui-rating-star" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"></path></svg></label><label class="ui-rating-choice"><input class="ui-rating-input" type="radio" name="rating-small" value="3" aria-label="3点" checked><svg class="ui-rating-star" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"></path></svg></label><label class="ui-rating-choice"><input class="ui-rating-input" type="radio" name="rating-small" value="4" aria-label="4点"><svg class="ui-rating-star" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"></path></svg></label><label class="ui-rating-choice"><input class="ui-rating-input" type="radio" name="rating-small" value="5" aria-label="5点"><svg class="ui-rating-star" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"></path></svg></label></fieldset><fieldset class="ui-rating ui-rating-lg ui-rating-warning"><legend>使いやすさ</legend><label class="ui-rating-choice"><input class="ui-rating-input" type="radio" name="rating-large" value="1" aria-label="1点"><svg class="ui-rating-star" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"></path></svg></label><label class="ui-rating-choice"><input class="ui-rating-input" type="radio" name="rating-large" value="2" aria-label="2点"><svg class="ui-rating-star" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"></path></svg></label><label class="ui-rating-choice"><input class="ui-rating-input" type="radio" name="rating-large" value="3" aria-label="3点" checked><svg class="ui-rating-star" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"></path></svg></label><label class="ui-rating-choice"><input class="ui-rating-input" type="radio" name="rating-large" value="4" aria-label="4点"><svg class="ui-rating-star" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"></path></svg></label><label class="ui-rating-choice"><input class="ui-rating-input" type="radio" name="rating-large" value="5" aria-label="5点"><svg class="ui-rating-star" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"></path></svg></label></fieldset></div>
```

<a id="rating-disabled"></a>

## 操作を無効にする

グループ全体にはfieldsetの`disabled`を使います。個別の星にも標準のdisabledを使えます。

```html
<fieldset class="ui-rating " disabled><legend>使いやすさ</legend><label class="ui-rating-choice"><input class="ui-rating-input" type="radio" name="rating-disabled" value="1" aria-label="1点"><svg class="ui-rating-star" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"></path></svg></label><label class="ui-rating-choice"><input class="ui-rating-input" type="radio" name="rating-disabled" value="2" aria-label="2点"><svg class="ui-rating-star" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"></path></svg></label><label class="ui-rating-choice"><input class="ui-rating-input" type="radio" name="rating-disabled" value="3" aria-label="3点" checked><svg class="ui-rating-star" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"></path></svg></label><label class="ui-rating-choice"><input class="ui-rating-input" type="radio" name="rating-disabled" value="4" aria-label="4点"><svg class="ui-rating-star" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"></path></svg></label><label class="ui-rating-choice"><input class="ui-rating-input" type="radio" name="rating-disabled" value="5" aria-label="5点"><svg class="ui-rating-star" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"></path></svg></label></fieldset>
```

<a id="rating-readonly"></a>

## 表示専用

入力を伴わない評価は`ui-rating-static`で表示し、読み上げ名に値を含めます。

```html
<span class="ui-rating-static" role="img" aria-label="5点満点中4点"><svg class="ui-rating-star is-active" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"></path></svg><svg class="ui-rating-star is-active" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"></path></svg><svg class="ui-rating-star is-active" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"></path></svg><svg class="ui-rating-star is-active" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"></path></svg><svg class="ui-rating-star" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"></path></svg></span><p class="type-caption sp-mt-2">4.0 / 5</p>
```

<a id="rating-formdata"></a>

## 値の取り出しと参考

```
const form = document.getElementById('rating-form');
const rating = new FormData(form).get('rating');
```

JavaScriptは不要です。機能の参考：[daisyUI Rating](https://daisyui.com/components/rating/)。星のSVGは既存のMDIを使い、同梱のライセンスに従います。

使用ファイル・取り込み方

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../../assets/css/ui.css) / [ui.js](../../assets/js/ui.js)。Vue・Astroでは既存の`KavWidget`に同じHTMLを渡して利用できます。[パッケージの使い方](../../packages/README.md)も参照してください。
