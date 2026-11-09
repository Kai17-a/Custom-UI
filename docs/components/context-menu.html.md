<!-- Generated from docs/components/context-menu.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](context-menu.html) · [llms.txt](../llms.txt)

# Context menu

右クリック・キーボード・操作ボタンから項目のメニューを開きます。

## ファイルの操作を開く

```html
<div data-ui-context-menu><div class="card sp-p-3" data-ui-context-item="brief" tabindex="0" aria-label="制作依頼.txt"><p>制作依頼.txt</p><button class="btn btn-outline-secondary" type="button" data-ui-context-open>操作を開く</button></div><div class="ui-context-menu" data-ui-context-panel hidden aria-label="ファイルの操作"><button class="btn btn-ghost" type="button" data-ui-context-action="rename">名前を変更</button><button class="btn btn-ghost" type="button" data-ui-context-action="duplicate">複製</button><button class="btn btn-ghost" type="button" data-ui-context-action="delete" disabled>削除（権限なし）</button></div></div>
```

## 属性とイベント

data-ui-context-menuの内側に、対象のdata-ui-context-itemとメニューのdata-ui-context-panelを置きます。対象にはtabindex="0"と読み上げ名を付け、タッチ向けにdata-ui-context-openのボタンも置いてください。メニュー内のbuttonまたはaにdata-ui-context-actionを指定します。

右クリック、Shift+F10、ContextMenuキー、操作ボタンから開きます。上下・Home・Endで移動、Enterで実行、Escapeで閉じます。画面端では表示位置を補正します。無効項目は実行しません。

ui:contextopenのdetail.targetは操作対象、ui:contextactionのdetailはvalue・target・itemです。ファイル変更や削除は利用側でこのイベントを受けて実装してください。項目構造を変更する場合はdestroy・再初期化を行います。多段サブメニューは対象外です。

## 導入と参考

共通のui.cssとui.jsを読み込みます。動的に追加したHTMLはKavUI.init、破棄時はKavUI.destroyを呼びます。Vue・AstroではKavWidgetに同じHTMLを渡せます。

[Astryxの参考Story](https://astryx.atmeta.com/storybook/?path=/story/core-contextmenu--default) / [パッケージの使い方](../packages/README.md)
