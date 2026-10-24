<!-- Generated from docs/components/animations.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](animations.html) · [llms.txt](../llms.txt)

# Animations

動きを用途ごとに分けました。確認したいページを選ぶと、その種類のサンプルだけを表示します。

## 用途から選ぶ

- [01表示・非表示Fade・Zoom・Flip・Rotate。要素が現れる・消えるときの6種類です。サンプルを見る →](animations-entrances.html.md): Fade・Zoom・Flip・Rotate。要素が現れる・消えるときの6種類です。

- [02移動・回転4方向のSlide、Float、Spin。移動する方向や回転の動きを比較できます。サンプルを見る →](animations-movement.html.md): 4方向のSlide、Float、Spin。移動する方向や回転の動きを比較できます。

- [03強調・揺れBounce・Shake・Wobble・Swing・Pulse・Heartbeat。注目を促す6種類です。サンプルを見る →](animations-attention.html.md): Bounce・Shake・Wobble・Swing・Pulse・Heartbeat。注目を促す6種類です。

- [04操作時の動きモーダル・通知・開閉・タブなど、操作に自動で付く動きを確認できます。サンプルを見る →](animations-interactions.html.md): モーダル・通知・開閉・タブなど、操作に自動で付く動きを確認できます。

- [05処理中の表示処理中のバナーと、カードの枠を光が巡るアニメーションです。サンプルを見る →](animations-processing.html.md): 処理中のバナーと、カードの枠を光が巡るアニメーションです。

<a id="animation-presets"></a>

## クラスで使う定番アニメーション

`ui-animate`と効果のクラスを1つ指定します。CSSだけで動き、標準は600ms・1回です。各サンプルの「再生する」で、必要な動きだけを確認できます。

```html
<div class="ui-card ui-animate ui-animate-fade-in">
  <div class="ui-card-body">フェードで表示します</div>
</div>
```

<a id="animation-options"></a>

## 速さ・遅延・繰り返し・一時停止

| クラス | 動作 |
| --- | --- |
| `ui-animate-fast` / `ui-animate-slow` | 300ms / 1200ms |
| `ui-animate-delay-200` / `ui-animate-delay-500` | 開始を200ms / 500ms遅らせる |
| `ui-animate-repeat` | 繰り返す。表示し続ける場合は停止操作も用意してください。 |
| `ui-animate-paused` | 一時停止する。クラスを外すと続きから再開する |

```html
<span class="fx-inline ui-animate ui-animate-bounce ui-animate-slow ui-animate-delay-200">お知らせ</span>
<div class="ui-animate ui-animate-float ui-animate-slow ui-animate-repeat">…</div>
```

フェードアウト・ズームアウトは終了後も透明になります。表示の切り替え、DOMの削除、操作対象から外す処理はアプリ側で行ってください。文字に移動・拡大・回転を付ける場合は`fx-inline`を併用してください。既存のスピナーなどに追加する場合は、外側の要素に指定すると、それぞれの動きを保てます。

速度は`--ui-animation-duration`、遅延は`--ui-animation-delay`でも調整できます。OSの「動きを減らす」が有効な場合、これらの動きは停止し、内容はすぐ表示されます。

使用ファイル・取り込み方

共通の ui.css と ui.js を読み込み、サンプルのHTMLを配置します。必要な動作は data-ui-* 属性で指定します。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../../assets/css/ui.css) / [ui.js](../../assets/js/ui.js) / [属性一覧と導入例](../getting-started.html.md)

assetsフォルダごとコピーするとCSS内の相対参照も維持できます。catalog.js、catalog-navigation.js、catalog-demo.js、layout.css はカタログ専用です。data-demo-* はアプリに取り込む際に外し、保存や通信はアプリ側で実装してください。
