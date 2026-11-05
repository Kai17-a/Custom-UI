<!-- Generated from docs/components/animations-interactions.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](animations-interactions.html) · [llms.txt](../llms.txt)

Animations

/

操作時の動き

# Animations · 操作時の動き

モーダル・通知・開閉・タブなど、操作に自動で付く動きを確認できます。

## 開く・閉じる・通知

表示時のフェードと閉じる動きを確認できます。通常の流れにあるパネルは閉じるとすぐに隠れます。閉じる操作・フォーカス・イベントは即座に反映します。

```html
<div class="fx fx-wrap fx-gap-3">
  <button type="button" class="btn btn-primary" data-ui-toggle="dialog" data-ui-target="#motion-dialog">モーダルを開く</button>
  <button type="button" class="btn btn-outline-primary" data-ui-toast="追加した通知はフェードで現れ、閉じるときも短くフェードします。" data-ui-duration="0">トーストを表示</button>
  <button type="button" class="btn btn-outline-secondary" data-ui-toggle="collapse" data-ui-target="#motion-panel">詳細を開閉</button>
</div>
<div id="motion-panel" class="inset" hidden>詳細を表示しました。続けて開閉しても、最新の操作が反映されます。</div>
<dialog id="motion-dialog" class="ui-dialog" data-ui-dialog aria-labelledby="motion-dialog-title"><h2 id="motion-dialog-title">アニメーションを確認</h2><p>閉じるボタン・Escapeで閉じます。</p><div class="buttons"><button type="button" class="btn btn-primary" data-ui-dismiss="dialog">閉じる</button></div></dialog>
```

## 切り替え・コピー・選択

```html
<div class="stack">
  <div class="fx fx-wrap fx-gap-4 fx-items-center"><label class="switch"><input type="checkbox" role="switch" checked>通知を有効にする</label><div class="ui-clipboard"><button type="button" class="ui-copy-icon" data-ui-copy="Design catalog" aria-label="プロジェクト名をコピー"></button><span class="ui-copy-status" data-ui-copy-status role="status"></span></div></div>
  <div data-ui-tabs><div class="tabs" role="tablist" aria-label="アニメーションの見本"><button type="button" data-ui-toggle="tab" data-ui-target="motion-overview">概要</button><button type="button" data-ui-toggle="tab" data-ui-target="motion-details">詳細</button></div><div class="tab-panel" data-ui-panel="motion-overview">タブを切り替えると、内容と選択状態が滑らかに変化します。</div><div class="tab-panel" data-ui-panel="motion-details" hidden>キー操作でも同じ動きになります。フォーカス移動は待たせません。</div></div>
  <div class="accordion"><details><summary>アコーディオンを開閉する</summary><p>内容の表示と非表示にも短いアニメーションが付きます。</p></details></div>
</div>
```

## 動きの共通トークン

時間とイージングは `tokens.css` にまとめています。`:root` または部品の親要素で上書きすると、CSS と JavaScript の動きに反映されます。

| トークン | 初期値・用途 |
| --- | --- |
| `--motion-duration-fast` | 120ms：退場、押下、ホバー |
| `--motion-duration-base` | 180ms：入場、選択、折り畳み |
| `--motion-duration-slow` | 240ms：カードの移動 |
| `--motion-ease-out` | cubic-bezier(.16,1,.3,1)：入場・選択 |
| `--motion-ease-in` | cubic-bezier(.4,0,1,1)：退場 |
| `--motion-ease-in-out` / `--motion-ease-linear` | cubic-bezier(.4,0,.2,1) / linear：処理中の繰り返し |
| `--motion-duration-spin` / `--motion-duration-loading` | 800ms / 1600ms：スピナー・進捗 |
| `--motion-duration-shimmer` / `--motion-duration-pulse` | 1800ms / 2400ms：スケルトン・処理中の表示 |

```
:root {
  --motion-duration-base: 200ms;
  --motion-duration-fast: 120ms;
}
```

Dialog・Drawer・Command・Dropdown・Popover・Select・Date picker は、display と overlay の離散トランジションに対応したブラウザで CSS による開閉を行います。未対応では即座に閉じます。Tooltip・Toast は操作できないコピーで退場し、Toast のコピーは通知領域の外で残った通知の下に表示します。子孫が100個を超える場合はコピーを省略します。通常の流れのパネルは即座に隠れ、スクロールによって閉じるポップアップと Tooltip は退場の動きを省略します。閉じる操作・フォーカス・イベントは即座に反映します。Drawer は入ってきた方向へ戻り、テーマ切り替えではページ全体をフェードしません。

折り畳みは `interpolate-size:allow-keywords` と `::details-content` で高さを補間します。未対応のブラウザは即座に切り替わります。OS の「動きを減らす」設定では補間も退場用表示もなくなり、待ち時間は発生しません。任意指定のアニメーションプリセットは従来どおりです。

## 自動アニメーションの対象

| 操作 | 動きとサンプル |
| --- | --- |
| 開く・閉じる | [モーダル](dialog.html.md)・[トースト](toasts.html.md)・[アラート](alerts.html.md)・[ヒント](tips.html.md)・[日付ポップアップ](datepicker.html.md)のフェード。 |
| 開閉・切り替え | [サイドバー](sidebar.html.md)の表示、[アコーディオン](disclosure.html.md)、[タブ・ページ送り](navigation.html.md)の切り替え。 |
| カード移動 | [カンバンのカード移動](board.html.md)。 |
| 入力・操作結果 | [ボタンを押したとき](buttons.html.md)、[スイッチ・チェック・入力エラー](forms.html.md)、[コピー成功のチェック](clipboard.html.md)。 |
| 処理・デザイン変更 | [進捗バー・ローディング](loading.html.md)の更新、[明暗・デザインテーマ](themes.html.md)の切り替え。 |

カレンダーの月切り替えと日付選択は、アニメーションなしで反映します。その他の動きは短く統一しています。アプリでは共通のui.css / ui.jsを使うだけで適用され、アニメーション用の属性は不要です。OSの「動きを減らす」設定では移動・フェードを止め、状態をすぐに切り替えます。

使用ファイル・取り込み方

共通の ui.css と ui.js を読み込み、サンプルのHTMLを配置します。必要な動作は data-ui-* 属性で指定します。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../assets/ui/css/ui.css) / [ui.js](../assets/ui/js/ui.js) / [属性一覧と導入例](../getting-started.html.md)

assetsフォルダごとコピーするとCSS内の相対参照も維持できます。catalog.js、catalog-navigation.js、catalog-demo.js、layout.css はカタログ専用です。data-demo-* はアプリに取り込む際に外し、保存や通信はアプリ側で実装してください。
