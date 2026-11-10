<!-- Generated from docs/components/power-search.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](power-search.html) · [llms.txt](../llms.txt)

# Power search

検索語と複数条件を組み合わせて一覧を絞り込みます。

## 担当者と状態で絞り込む

```html
<div class="ui-power-search" data-ui-power-search data-ui-power-target="#power-table"><div class="ui-power-search-fields"><label>検索語<input class="form-control" type="search" data-ui-power-query></label><label>担当者<select class="form-select" data-ui-power-filter="owner"><option value="">指定なし</option><option value="aoki">青木</option><option value="mori">森</option></select></label><label>状態<select class="form-select" data-ui-power-filter="status"><option value="">指定なし</option><option value="open">進行中</option><option value="done">完了</option></select></label><button class="btn btn-outline-secondary" type="button" data-ui-power-clear>全解除</button></div></div><div id="power-table" data-ui-data-table data-ui-page-size="5"><div class="ui-table-scroll"><table class="table"><caption>プロジェクト</caption><thead><tr><th>名前</th><th>担当者</th><th>状態</th></tr></thead><tbody><tr data-ui-filter-owner="aoki" data-ui-filter-status="open"><td>デザインカタログ</td><td>青木</td><td>進行中</td></tr><tr data-ui-filter-owner="mori" data-ui-filter-status="open"><td>予約管理</td><td>森</td><td>進行中</td></tr><tr data-ui-filter-owner="aoki" data-ui-filter-status="done"><td>導入ガイド</td><td>青木</td><td>完了</td></tr></tbody></table></div><p data-ui-table-status></p></div>
```

## 条件と連携

data-ui-power-queryで全文検索、data-ui-power-filter="項目名"で条件入力を指定します。selectにはvalueが空の「指定なし」を用意してください。適用中の条件は個別に解除できます。無効・読み取り専用の条件は解除しません。

ui:powerchangeのdetailはquery（文字列）とfilters（field・operator・valueの配列）です。data-ui-power-targetでData tableのルートを指定すると、行のdata-ui-filter-項目名を使ってAND条件で絞り込みます。1つの表には1つのPower searchを接続してください。選択・ソート・ページ送りは既存Data tableが担当します。

既定のoperatorはeq（正規化した文字列の一致）。data-ui-power-operator="gte"・"lte"では文字列の下限・上限比較を行います。同じ項目名のdate入力を2つ用意すると、YYYY-MM-DD形式の期間を扱えます。数値比較ではありません。表の行に対象属性がなければ条件に一致しません。

コードから表を絞り込む場合は、Data tableのルートにui:tablefilterというCustomEventを送り、同じdetailを渡します。検索を解除するときはqueryを空、filtersを空配列にします。サーバー通信や条件の永続保存は利用側で実装します。

## 導入と参考

共通のui.cssとui.jsを読み込みます。動的に追加したHTMLはKavUI.init、破棄時はKavUI.destroyを呼びます。Vue・AstroではKavWidgetに同じHTMLを渡せます。

[Astryxの参考Story](https://astryx.atmeta.com/storybook/?path=/story/core-powersearch--with-preset-filters) / [パッケージの使い方](../packages/README.md)
