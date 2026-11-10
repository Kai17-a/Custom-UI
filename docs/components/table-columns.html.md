<!-- Generated from docs/components/table-columns.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](table-columns.html) · [llms.txt](../llms.txt)

# Table column settings

一覧で表示する列を選択し、既定の表示に戻せます。

## 必要な列を表示する

```html
<div data-ui-data-table data-ui-table-columns data-ui-page-size="5"><label>検索<input class="form-control" type="search" data-ui-table-search></label><div class="ui-table-scroll"><table class="table"><caption>プロジェクト一覧</caption><thead><tr><th data-ui-column-key="name" data-ui-column-required><button class="btn btn-ghost-secondary" type="button" data-ui-table-sort="text">名前</button></th><th data-ui-column-key="owner">担当者</th><th data-ui-column-key="status">状態</th></tr></thead><tbody><tr><td>カタログ</td><td>青木</td><td>進行中</td></tr><tr><td>導入ガイド</td><td>森</td><td>完了</td></tr></tbody></table></div><p data-ui-table-status></p></div>
```

## 属性とイベント

tableを囲む要素にdata-ui-table-columnsを指定します。data-ui-data-tableと併用できます。見出しのdata-ui-column-requiredは非表示にできない列、data-ui-column-keyは変更イベント用の識別子、data-ui-column-labelは設定画面の表示名です。初期状態で見出しにhiddenがある列は非表示になります。

最低1列を表示し、「既定の表示に戻す」で初期状態に戻ります。ui:columnchangeのdetail.visibleは表示中の列キーの配列です。キー省略時は0から始まる列番号の文字列です。

単一行の見出しと、セル結合のないデータ行を対象にします。全幅の詳細行・空表示は変更しません。行の追加・並べ替えには追従しますが、列構造を変更する場合はdestroy後に再初期化してください。列幅・列順の変更と設定の永続保存は対象外です。

## 導入と参考

共通のui.cssとui.jsを読み込みます。動的に追加したHTMLはKavUI.init、破棄時はKavUI.destroyを呼びます。Vue・AstroではKavWidgetに同じHTMLを渡せます。

[Astryxの参考Story](https://astryx.atmeta.com/storybook/?path=/story/core-tablecolumnsettings--basic-column-toggle) / [パッケージの使い方](../packages/README.md)
