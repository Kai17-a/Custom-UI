<!-- Generated from docs/components/tour.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](tour.html) · [llms.txt](../llms.txt)

# Tour

対象要素を順に案内し、操作の流れを説明します。

## 画面の使い方を案内する

```html
<button class="btn btn-primary" type="button" data-ui-tour-start="#workspace-tour">使い方を見る</button><div class="field sp-mt-4"><label for="tour-search">プロジェクト検索</label><input class="form-control" id="tour-search" type="search" placeholder="名前で検索"></div><button id="tour-create" class="btn btn-outline-secondary" type="button" data-ui-toast="新しいプロジェクトを作成します">プロジェクトを作成</button><ol id="workspace-tour" data-ui-tour hidden><li data-ui-tour-target="#tour-search" data-ui-tour-title="名前で探す">検索欄からプロジェクト名を入力できます。</li><li data-ui-tour-target="#tour-create" data-ui-tour-title="新しく作る">新しいプロジェクトはこのボタンから作成します。</li></ol>
```

## 属性と操作

data-ui-tourを持つ非表示の一覧に、data-ui-tour-targetで案内先のCSSセレクターを指定します。data-ui-tour-titleが見出し、要素内のテキストが説明です。開始ボタンのdata-ui-tour-startには一覧のセレクターを指定します。

前後移動、完了、終了、Escapeを使えます。対象が画面外ならスクロールし、存在しない・非表示の対象は飛ばします。すべての対象がない場合も終了します。終了時は開始ボタンにフォーカスを戻します。非モーダルの案内なので、Tabで実際の画面も操作できます。

ui:tourstepのdetailはindexとtarget、ui:tourendはreasonとindexです。reasonはcompleted・dismissed・missing-target・replaced・destroyedです。自動開始、既読保存、利用分析、背景の操作禁止は行いません。

## 導入と参考

共通のui.cssとui.jsを読み込みます。動的に追加したHTMLはKavUI.init、破棄時はKavUI.destroyを呼びます。Vue・AstroではKavWidgetに同じHTMLを渡せます。

[Astryxの参考Story](https://astryx.atmeta.com/storybook/?path=/story/lab-tour--showcase) / [パッケージの使い方](../packages/README.md)
