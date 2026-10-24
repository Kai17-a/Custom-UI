<!-- Generated from docs/components/theme-switcher.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](theme-switcher.html) · [llms.txt](../../llms.txt)

# Theme switcher

[ガラス・グラスモーフィズムに任意の背景画像を設定する →](themes.html.md#theme-background)

タグと属性だけで使えるテーマ切り替えです。ライト・ダーク・システムを選べます。デザインの質感とカラーパレットは独立して切り替えられます。

<a id="palette-switcher"></a>

## カラーパレットを選ぶ

Material 3に基づく低彩度の6配色を、質感・明暗とは独立して選べます。

```html
<div class="ui-palette-switcher" role="group" aria-label="カラーパレット">
<button class="btn btn-sm btn-outline-secondary" type="button" data-ui-palette-value="default"><span class="ui-palette-swatch" data-ui-palette-swatch="default" aria-hidden="true"></span>標準</button>
<button class="btn btn-sm btn-outline-secondary" type="button" data-ui-palette-value="slate"><span class="ui-palette-swatch" data-ui-palette-swatch="slate" aria-hidden="true"></span>スレート</button>
<button class="btn btn-sm btn-outline-secondary" type="button" data-ui-palette-value="sage"><span class="ui-palette-swatch" data-ui-palette-swatch="sage" aria-hidden="true"></span>セージ</button>
<button class="btn btn-sm btn-outline-secondary" type="button" data-ui-palette-value="teal"><span class="ui-palette-swatch" data-ui-palette-swatch="teal" aria-hidden="true"></span>ティール</button>
<button class="btn btn-sm btn-outline-secondary" type="button" data-ui-palette-value="mauve"><span class="ui-palette-swatch" data-ui-palette-swatch="mauve" aria-hidden="true"></span>モーブ</button>
<button class="btn btn-sm btn-outline-secondary" type="button" data-ui-palette-value="sand"><span class="ui-palette-swatch" data-ui-palette-swatch="sand" aria-hidden="true"></span>サンド</button>
<button class="btn btn-sm btn-outline-secondary" type="button" data-ui-palette-value="clay"><span class="ui-palette-swatch" data-ui-palette-swatch="clay" aria-hidden="true"></span>クレイ</button>
</div>
```

[配色の比較・自分の色で作る・設定と保存方法 →](color-palettes.html.md)

<a id="color-mode-toggle-icon"></a>

## ライト・ダークを1つのアイコンで切り替え

カタログ上部と同じ切り替えです。ライト時は月、ダーク時は太陽を表示します。読み上げラベルとツールチップは次の切り替え先を案内します。

```html
<button type="button" class="btn btn-sm btn-outline-secondary btn-icon-only" data-ui-toggle="theme" data-ui-theme-icon icon="mdi-weather-night" aria-label="ダークに切替" title="ダークに切替"></button>
```

<a id="color-mode-buttons"></a>

## ライト・ダーク・システム

そのまま配置できる3択の切り替えです。「システム」はOSの明暗設定に追従します。OSの設定が変わっても、選択中のボタンは「システム」のままです。

```html
<div class="ui-color-switcher" role="group" aria-label="表示モード">
  <button type="button" class="btn btn-sm btn-ghost-secondary" data-ui-color-mode="light"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>ライト</button>
  <button type="button" class="btn btn-sm btn-ghost-secondary" data-ui-color-mode="dark"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M20 14A8 8 0 0 1 10 4a8.5 8.5 0 1 0 10 10Z"/></svg>ダーク</button>
  <button type="button" class="btn btn-sm btn-ghost-secondary" data-ui-color-mode="system"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/></svg>システム</button>
</div>
```

<a id="color-mode-icons"></a>

## アイコンだけで配置する

```html
<div class="ui-color-switcher" role="group" aria-label="表示モード">
  <button type="button" class="btn btn-sm btn-ghost-secondary btn-icon-only" data-ui-color-mode="light" aria-label="ライト"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg></button>
  <button type="button" class="btn btn-sm btn-ghost-secondary btn-icon-only" data-ui-color-mode="dark" aria-label="ダーク"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M20 14A8 8 0 0 1 10 4a8.5 8.5 0 1 0 10 10Z"/></svg></button>
  <button type="button" class="btn btn-sm btn-ghost-secondary btn-icon-only" data-ui-color-mode="system" aria-label="システム"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/></svg></button>
</div>
```

<a id="color-mode-select"></a>

## 選択ボックスで配置する

```html
<label class="fx fx-wrap fx-items-center fx-gap-2"><span class="fx-shrink-0">表示モード</span>
  <select class="form-select form-select-sm w-auto" data-ui-color-select>
    <option value="light">ライト</option>
    <option value="dark">ダーク</option>
    <option value="system">システム</option>
  </select>
</label>
```

ボタン式・アイコン式・選択ボックスは自動で同期します。HTMLのclassとdata属性だけで利用でき、アプリ側の切り替え処理は不要です。

## デザインをボタンで選ぶ

ボタンの `data-ui-design` にテーマ名を指定します。選択状態と他の切り替え欄は自動で同期します。

```html
<div class="ui-theme-switcher">
  <div class="ui-theme-options" role="group" aria-label="デザインテーマ">
    <button type="button" class="btn btn-sm btn-ghost-secondary" data-ui-design="default"><span class="ui-theme-swatch" aria-hidden="true"></span>標準</button>
    <button type="button" class="btn btn-sm btn-ghost-secondary" data-ui-design="glass"><span class="ui-theme-swatch" data-swatch="glass" aria-hidden="true"></span>ガラス</button>
    <button type="button" class="btn btn-sm btn-ghost-secondary" data-ui-design="glassmorphism"><span class="ui-theme-swatch" data-swatch="glassmorphism" aria-hidden="true"></span>グラスモーフィズム</button>
    <button type="button" class="btn btn-sm btn-ghost-secondary" data-ui-design="flat"><span class="ui-theme-swatch" data-swatch="flat" aria-hidden="true"></span>フラット</button>
    <button type="button" class="btn btn-sm btn-ghost-secondary" data-ui-design="soft"><span class="ui-theme-swatch" data-swatch="soft" aria-hidden="true"></span>ソフト</button>
  </div>
</div>
```

## コンパクトな選択式

```html
<div class="ui-theme-switcher">
  <label class="fx fx-wrap fx-items-center fx-gap-2"><span class="fx-shrink-0">デザイン</span>
    <select class="form-select form-select-sm w-auto" data-ui-theme-select>
      <option value="default">標準</option><option value="glass">ガラス</option><option value="glassmorphism">グラスモーフィズム</option><option value="flat">フラット</option><option value="soft">ソフト</option>
    </select>
  </label>
  <button type="button" class="btn btn-sm btn-outline-secondary" data-ui-toggle="theme">明暗を切り替え</button>
</div>
```

## 保存・JavaScriptからの切り替え

選択を保存する場合は `<body data-ui-theme-persist>` を指定します。このページでは有効です。デザインボタンと明暗ボタンの選択は `aria-pressed` で伝えます。

```
KavUI.setDesignTheme('glass', { persist: true });
KavUI.setColorTheme('system', { persist: true });
// 固定表示にする場合は 'light' または 'dark' を指定します。
```

APIはpersist省略時には保存しません。表示モードはlight / dark / systemの3値を保存し、保存がない場合はsystemになります。現在の選択はhtmlのdata-ui-color-preference、実際の明暗はdata-bs-themeに反映します。変更時はui:colorchangeイベントでdetail.modeとdetail.themeを通知します。既存の `data-ui-toggle="theme"` ボタンは従来どおり明暗の2択を切り替え、固定表示として保存します。

[各テーマの見た目と設定 →](themes.html.md) / [selectの操作・設定 →](forms.html.md#select-box)

## 使用ファイル・取り込み方

`assets/css/ui.css` と `assets/js/ui.js` を読み込み、上記のHTMLを配置してください。npmや追加のJavaScriptは不要です。
