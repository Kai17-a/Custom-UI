<!-- Generated from docs/components/transfer-list.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](transfer-list.html) · [llms.txt](../llms.txt)

# Transfer list

候補と選択済みの一覧間で項目を移動します。

## 対象メンバーを選ぶ

```html
<form><label for="transfer-members">メンバー</label><select id="transfer-members" name="members" multiple required data-ui-transfer><option value="aoki" selected>青木</option><option value="mori">森</option><option value="ito">伊藤</option><option value="admin" selected disabled>管理者（解除不可）</option></select><button class="btn btn-outline-secondary sp-mt-3" type="reset">リセット</button></form>
```

## 属性と操作

select multipleにdata-ui-transferを指定します。候補と選択済みをそれぞれ検索し、標準の複数選択リストで対象を選んでから移動ボタンを押します。Ctrl/CommandやShiftによる複数選択はOS標準の操作です。disabledの項目は移動できません。

元のselectが値を保持するため、FormData(form).getAll('members')で取得できます。変更時はinput・changeとui:transferchange（detail.values）が発生します。コードで選択値を変更したらKavUI.sync(select)で同期します。required・disabled・resetに対応します。選択済み項目は検索で隠れても解除されません。

labelまたはaria-labelを指定してください。optionのdata-ui-keywordsで検索語を補えます。JavaScriptなしでは標準の複数選択を使用できます。サーバー保存や実際の権限付与は利用側で実装してください。

## 導入と参考

共通のui.cssとui.jsを読み込みます。動的に追加したHTMLはKavUI.init、破棄時はKavUI.destroyを呼びます。Vue・AstroではKavWidgetに同じHTMLを渡せます。

[Astryxの参考Story](https://astryx.atmeta.com/storybook/?path=/story/lab-transferlist--searchable) / [パッケージの使い方](../packages/README.md)
