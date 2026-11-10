<!-- Generated from docs/components/log-stream.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](log-stream.html) · [llms.txt](../llms.txt)

# Log stream

追記されるログを表示し、末尾への追従を切り替えます。

## 実行ログを追跡する

```html
<div data-ui-log-stream data-ui-log-limit="500"><pre data-ui-log-source hidden>ジョブを開始しました。
設定を読み込みました。</pre><button type="button" class="btn btn-outline-secondary" data-ui-log-add="処理を続行しています。">見本のログを追加</button></div>
```

## 追記と保持件数

data-ui-log-streamの要素へCustomEvent('ui:logappend', {detail: {text: 'ログ本文'}})を送ります。複数行はdetail.linesに文字列配列を渡します。すべてテキストとして表示し、HTMLは実行しません。初期ログはpre[data-ui-log-source]に記載できます。

追従中は末尾に移動します。上へスクロールするか追従を停止すると現在位置を保持し、新着件数を表示します。末尾へ戻る・追従を再開で新着を確認できます。data-ui-log-limitは既定500件、最大10000件です。超過分は古い順に削除するため、保持範囲外のログは読めなくなります。

ui:logchangeのdetailはcount・unread・following・removedです。data-ui-log-addは固定文字列を追記する見本用ボタンです。通信・実行・保存は利用側で行います。共通CSS/JSだけで使用でき、Vue・AstroではKavWidgetを使えます。参考：[Astryx LogStream](https://astryx.atmeta.com/storybook/?path=/story/lab-logstream--controlled-follow)。
