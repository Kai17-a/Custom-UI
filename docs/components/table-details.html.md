<!-- Generated from docs/components/table-details.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](table-details.html) · [llms.txt](../llms.txt)

# Table row expansion

一覧の行を開いて詳細を確認します。

## 一覧で詳細を確認する

```html
<div data-ui-data-table data-ui-table-expandable data-ui-page-size="1"><label>検索<input class="form-control" type="search" data-ui-table-search></label><div class="ui-table-scroll"><table class="table"><caption>プロジェクト</caption><thead><tr><th>操作</th><th><button class="ui-data-table-sort" type="button" data-ui-table-sort="text">名前</button></th></tr></thead><tbody><tr><td data-ui-table-ignore><button class="btn btn-sm btn-outline-secondary" type="button" data-ui-row-expand aria-label="カタログの詳細">詳細</button><template data-ui-row-detail><h3>カタログの進行状況</h3><p>入力部品の追加を進めています。</p></template></td><td>カタログ</td></tr><tr><td data-ui-table-ignore><button class="btn btn-sm btn-outline-secondary" type="button" data-ui-row-expand aria-label="導入ガイドの詳細">詳細</button><template data-ui-row-detail><h3>導入ガイド</h3><p>公開準備が完了しています。</p></template></td><td>導入ガイド</td></tr><tr><td>詳細なし</td><td>アーカイブ</td></tr></tbody></table></div><div class="fx fx-wrap fx-gap-2"><button class="btn btn-outline-secondary" type="button" data-ui-table-prev>前へ</button><button class="btn btn-outline-secondary" type="button" data-ui-table-next>次へ</button></div><p data-ui-table-status></p></div>
```

## 属性とイベント

Data tableのルートにdata-ui-table-expandableを付け、展開する行のセル内にbutton[data-ui-row-expand]とtemplate[data-ui-row-detail]を置きます。templateの内容を詳細行として複製します。各ボタンには対象の分かるaria-labelを付けてください。aria-expanded="true"で初期展開にできます。

詳細は親行に追従し、検索・ソート・ページ送りで離れません。詳細行は件数・検索・行選択の対象から除きます。詳細のない行にはボタンを置く必要がありません。ui:rowexpandのdetailはrowとexpandedです。

行を追加・削除した後は既存Data tableと同様にKavUI.init(root)で更新してください。templateの内容は信頼できるHTMLを使い、IDは一覧内で重複しないようにしてください。サーバー取得やツリーテーブルは対象外です。

## 導入と参考

共通のui.cssとui.jsを読み込みます。動的に追加したHTMLはKavUI.init、破棄時はKavUI.destroyを呼びます。Vue・AstroではKavWidgetに同じHTMLを渡せます。

[Astryxの参考Story](https://astryx.atmeta.com/storybook/?path=/story/core-tablerowexpansion--detail-panel) / [パッケージの使い方](../packages/README.md)
