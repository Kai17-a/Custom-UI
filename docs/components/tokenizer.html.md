<!-- Generated from docs/components/tokenizer.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](tokenizer.html) · [llms.txt](../llms.txt)

# Tokenizer

検索しながらタグ形式で複数項目を選択します。

<a id="tokenizer-basic"></a>

## 担当者を複数選ぶ

```html
<form><label for="token-members">担当者（必須）</label><select id="token-members" name="members" multiple required data-ui-tokenizer><option value="aoki" selected>青木</option><option value="mori">森</option><option value="ito">伊藤</option><option value="inactive" disabled>退会済み</option></select><button class="btn btn-outline-secondary" type="reset">リセット</button></form>
```

## 属性とイベント

select multipleにdata-ui-tokenizerを指定します。labelまたはaria-labelで名前を設定してください。required・disabled・optionのdisabledに対応します。data-ui-keywordsで検索語を補えます。選択値は元のselectに保持し、FormData(form).getAll('members')で取り出せます。

操作による変更時はinput・changeとui:tokenchange（detail.values: 文字列配列）が発生します。コードで値を変えたらKavUI.sync(select)を呼んでください。resetで初期選択に戻ります。

検索欄の上下キーで候補を移動し、Enterで追加、Escapeで候補を閉じます。日本語変換中のEnterでは追加しません。非同期検索と自由入力は対象外です。JavaScriptなしでは標準の複数選択を利用できます。

## 導入と参考

共通のui.cssとui.jsを読み込みます。動的に追加したHTMLはKavUI.init、破棄時はKavUI.destroyを呼びます。Vue・AstroではKavWidgetに同じHTMLを渡せます。

[Astryxの参考Story](https://astryx.atmeta.com/storybook/?path=/story/core-tokenizer--default) / [パッケージの使い方](../packages/README.md)
