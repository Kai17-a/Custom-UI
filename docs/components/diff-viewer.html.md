<!-- Generated from docs/components/diff-viewer.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](diff-viewer.html) · [llms.txt](../llms.txt)

# DiffViewer

文章やコードの追加・削除を左右で比較します。

## 文章の変更を比較する

```html
<div data-ui-diff-viewer><label>変更前<textarea class="form-control" data-ui-diff-before>制作依頼
締切：月曜日
確認をお願いします。</textarea></label><label>変更後<textarea class="form-control" data-ui-diff-after>制作依頼
締切：水曜日
資料を添付します。
確認をお願いします。</textarea></label></div>
```

## 使い方

data-ui-diff-viewer内にtextarea[data-ui-diff-before]とtextarea[data-ui-diff-after]を置きます。入力で再比較します。コードからvalueを設定した後はルートにui:diffrefreshイベントを送ります。ui:diffupdateのdetailはadded・removed・simplifiedです。

行単位で比較し、変更前と変更後を左右に表示します。追加・削除は文字と色で区別します。入力はHTMLとして実行しません。行数の積が100万を超える場合は共通先頭以降を削除・追加として扱う簡易比較に切り替えます。最小差分や文字単位の強調、Git連携は対象外です。

共通ui.cssとui.jsだけで利用できます。Vue・AstroではKavWidgetで同じHTMLを使用できます。参考：[Astryx DiffViewer](https://astryx.atmeta.com/storybook/?path=/story/lab-diffviewer--split)。
