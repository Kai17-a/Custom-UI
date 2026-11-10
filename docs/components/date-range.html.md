<!-- Generated from docs/components/date-range.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](date-range.html) · [llms.txt](../llms.txt)

# Date range

開始日・終了日とプリセットで期間を指定します。

## 期間を指定する

```html
<form><div class="ui-date-range" data-ui-date-range><div class="ui-date-range-fields"><div class="field"><label for="range-start">開始日</label><div data-ui-datepicker><input class="form-control" type="date" id="range-start" name="start" data-ui-range-start value="2026-10-05"></div></div><div class="field"><label for="range-end">終了日</label><div data-ui-datepicker><input class="form-control" type="date" id="range-end" name="end" data-ui-range-end value="2026-10-12"></div></div></div><div class="buttons"><button type="button" class="btn btn-outline-secondary" data-ui-range-preset="month">今月</button><button type="button" class="btn btn-outline-secondary" data-ui-range-preset="example" data-ui-range-from="2026-10-01" data-ui-range-to="2026-10-31">2026年10月</button><button type="button" class="btn btn-outline-secondary" data-ui-range-clear>解除</button><button type="reset" class="btn btn-outline-secondary">リセット</button></div></div></form>
```

## 属性とイベント

data-ui-date-rangeで2つの日付入力を囲み、data-ui-range-start・data-ui-range-endで両端を指定します。既存Date pickerのカレンダー選択と組み合わせられます。min・max・requiredは各inputに指定します。開始日より前の終了日はフォームの検証で拒否します。

プリセットはdata-ui-range-preset="month"で今月、それ以外の値ではdata-ui-range-from・data-ui-range-toのISO日付を使います。data-ui-range-clearは両端を空にします。disabled・readonlyの入力はプリセットで変更しません。範囲外のプリセットは検証エラーとして表示します。

ui:rangechangeのdetailはstart・end・validです。値をコードから設定したときはinputイベントを発火して同期します。フォーム送信とresetは標準HTMLを使います。時刻・タイムゾーン・予約可能日の取得は対象外です。

## 導入と参考

共通のui.cssとui.jsを読み込みます。動的に追加したHTMLはKavUI.init、破棄時はKavUI.destroyを呼びます。Vue・AstroではKavWidgetに同じHTMLを渡せます。

[Astryxの参考Story](https://astryx.atmeta.com/storybook/?path=/story/core-daterangeinput--with-presets) / [パッケージの使い方](../packages/README.md)
