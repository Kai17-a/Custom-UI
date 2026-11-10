<!-- Generated from docs/components/tree-list.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](tree-list.html) · [llms.txt](../llms.txt)

# Tree list

階層を開閉し、キーボードで項目を選択します。

## フォルダを選ぶ

```html
<ul class="ui-tree-list" data-ui-tree aria-label="フォルダ"><li data-ui-tree-item="projects"><span data-ui-tree-label>プロジェクト</span><ul><li data-ui-tree-item="design"><span data-ui-tree-label>デザイン</span></li><li data-ui-tree-item="dev"><span data-ui-tree-label>開発</span></li></ul></li><li data-ui-tree-item="archive" aria-disabled="true"><span data-ui-tree-label>アーカイブ（選択不可）</span></li><li data-ui-tree-item="shared"><span data-ui-tree-label>共有</span></li></ul>
```

## 属性と操作

ulまたはolにdata-ui-tree、liに一意の値を持つdata-ui-tree-itemを付けます。項目名はdata-ui-tree-labelの要素に書き、子階層は直下のulまたはolで表します。ルートにはaria-labelを指定してください。項目のaria-expanded="true"で初期展開、aria-selected="true"で初期選択、aria-disabled="true"で選択不可にできます。

上下キーは表示項目の移動、左右キーは展開・折り畳みと親子間の移動、Home・Endは先頭・末尾、Enter・Spaceは選択です。開閉ボタンは選択を変更しません。選択するとui:treeselectが発生し、detail.valueとdetail.itemを取得できます。

項目構造を変更するときはKavUI.destroyしてから編集し、KavUI.initで再初期化してください。複数選択、ドラッグ移動、遅延取得は対象外です。JavaScriptなしでは階層一覧を表示します。

## 導入と参考

共通のui.cssとui.jsを読み込みます。動的に追加したHTMLはKavUI.init、破棄時はKavUI.destroyを呼びます。Vue・AstroではKavWidgetに同じHTMLを渡せます。

[Astryxの参考Story](https://astryx.atmeta.com/storybook/?path=/story/core-treelist--basic) / [パッケージの使い方](../packages/README.md)
