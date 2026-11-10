<!-- Generated from docs/components/overflow-list.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](overflow-list.html) · [llms.txt](../llms.txt)

# Overflow list

幅に収まらない操作やタグをその他へまとめます。

## 幅に合わせて操作をまとめる

```html
<div class="ui-overflow-list" data-ui-overflow><div class="ui-overflow-items" data-ui-overflow-items><button class="btn btn-outline-secondary" type="button" data-ui-toast="保存しました">保存</button><button class="btn btn-outline-secondary" type="button" data-ui-toast="複製しました">複製</button><button class="btn btn-outline-secondary" type="button" data-ui-toast="共有設定を開きます">共有設定</button><button class="btn btn-outline-secondary" type="button" data-ui-toast="履歴を開きます">変更履歴</button><button class="btn btn-outline-secondary" type="button" data-ui-toast="ダウンロードを開始します">ダウンロード</button></div></div>
```

## 属性と動作

data-ui-overflowの内側にdata-ui-overflow-itemsを置き、直下の各要素を1項目として扱います。幅に収まらない末尾の項目を「その他」に移します。data-ui-overflow-labelで表示名を変更できます。既存DOMを移すため、各項目のイベントと入力値は保持します。

幅変更、文字変更、項目の追加・削除に追従します。フォーカス中の項目が移った場合はメニューを開いてフォーカスを保ちます。Escapeで閉じ、その他のボタンに戻ります。ui:overflowchangeのdetailはvisibleとoverflowの件数です。

アプリから項目を追加する場合はdata-ui-overflow-itemsへ追加してください。順序変更や大きな構造変更はdestroy後に再初期化します。メニューを操作する間も項目が表示されるよう、親領域で切り抜かない構成を使ってください。永続的な並べ替えは対象外です。

## 導入と参考

共通のui.cssとui.jsを読み込みます。動的に追加したHTMLはKavUI.init、破棄時はKavUI.destroyを呼びます。Vue・AstroではKavWidgetに同じHTMLを渡せます。

[Astryxの参考Story](https://astryx.atmeta.com/storybook/?path=/story/core-overflowlist--with-dropdown-overflow) / [パッケージの使い方](../packages/README.md)
