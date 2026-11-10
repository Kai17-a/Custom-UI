<!-- Generated from docs/components/richtext.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](richtext.html) · [llms.txt](../llms.txt)

# Rich text editor

見出し・強調・リンク・リストを使って文章を編集します。

## 説明文を編集する

```html
<form><div data-ui-richtext><label for="rich-description">説明文</label><textarea id="rich-description" class="form-control" name="description" data-ui-richtext-source>&lt;p&gt;制作依頼の&lt;strong&gt;説明文&lt;/strong&gt;を入力してください。&lt;/p&gt;</textarea></div><button type="reset" class="btn btn-outline-secondary sp-mt-3">リセット</button></form>
```

## 属性とデータ

data-ui-richtext内のtextarea[data-ui-richtext-source]を編集画面へ拡張します。textareaのvalueにはHTMLを渡します。変更後も元のtextareaに値を保持するため、フォーム送信やFormDataで取得できます。ui:richtextchangeのdetail.htmlで変更を受け取れます。コードから再設定するときはルートへui:richtextsetイベントを送り、detail.htmlを渡します。

見出し・太字・斜体・リスト・リンク・装飾解除・元に戻す・やり直すを提供します。日本語変換中はツールバー操作を確定せず、変換終了後に値を同期します。readonly・disabled・resetにも対応します。

読み込み・貼り付け・送信値は許可した要素だけに制限します。許可要素はp・div・br・h2・h3・strong・b・em・i・ul・ol・li・aです。属性はリンクのhref以外を除去し、リンクはhttp・https・mailtoに制限します。画像・スタイル・スクリプトは取り込みません。保存先でも入力の検証を行ってください。

外部依存・追加容量・追加ライセンスはありません。ブラウザ標準のcontenteditableとexecCommandを使うため、装飾と履歴の動作はブラウザに依存します。共同編集・画像アップロードは対象外です。共通CSS/JSと通常HTMLで利用し、Vue・AstroではKavWidgetを使えます。参考：[Astryx RichTextEditor](https://astryx.atmeta.com/storybook/?path=/story/richtext-richtexteditor--with-toolbar)。
