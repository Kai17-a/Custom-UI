<!-- Generated from docs/components/color-palettes.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](color-palettes.html) · [llms.txt](../llms.txt)

# Color palettes

質感・明暗とは独立した、低彩度のカラーパレットです。Material Design 3のHCTと色の役割分けに基づき、ボタン・選択状態・背景・文字・境界線を揃えます。

<a id="palette-choose"></a>

## パレットを選ぶ

追加した6種類はすべてHCT Chroma 24の落ち着いたアクセントです。スレート（青灰）、セージ（緑灰）、ティール（青緑）、モーブ（灰紫）、サンド（砂色）、クレイ（土色）を用意しました。「標準」は従来の配色に戻します。

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

<a id="palette-custom"></a>

## 自分の色からパレットを作る

基準色と彩度を選び「配色を適用」を押すと、背景・本文・ボタン・選択状態をまとめて生成します。基準色はそのまま塗らず、色相をHCTで取り出してMaterialのトーンへ割り当てます。彩度は0〜32に制限し、原色を選んでも落ち着いた配色にします。

```html
<form class="ui-palette-editor" data-ui-palette-editor>
              <div class="ui-palette-editor-fields">
                <div>
                  <label class="form-label" for="custom-palette-seed">基準色（HEXも入力可）</label>
                  <input id="custom-palette-seed" class="form-control" type="color" value="#7d6b91" data-ui-palette-seed required>
                </div>
                <div>
                  <label class="form-label" for="custom-palette-chroma">彩度（HCT Chroma）：<output for="custom-palette-chroma" data-ui-palette-chroma-output>24</output></label>
                  <input id="custom-palette-chroma" class="form-range" type="range" min="0" max="32" step="1" value="24" data-ui-palette-chroma>
                  <p class="type-caption">0は無彩色、24は既存パレットと同程度です。</p>
                </div>
              </div>
              <div class="ui-cluster">
                <button class="btn btn-primary" type="submit">配色を適用</button>
                <button class="btn btn-outline-secondary" type="reset">入力を戻す</button>
                <button class="btn btn-ghost-secondary" type="button" data-ui-palette-value="default">標準に戻す</button>
              </div>
              <p class="ui-palette-editor-status" role="status" data-ui-palette-status></p>
            </form>
```

このフォームも共通コンポーネントです。HTMLをコピーするだけで動きます。適用後は上部の配色欄に「カスタム」が追加され、既存パレットと行き来できます。白・黒・グレーの基準色、または彩度0では無彩色のパレットを作ります。成功・警告・エラー・情報の意味色は固定です。

<a id="palette-custom-api"></a>

## カスタム配色のAPI・保存

```
KavUI.setCustomPalette('#7d6b91', {chroma: 24});
KavUI.setCustomPalette('#52796f', {chroma: 20, persist: true});

// 設定を読み出す。返り値はコピーなので、変更しても現在の配色は変わりません。
const settings = KavUI.getCustomPalette(); // {seed: '#52796f', chroma: 20}

KavUI.setPalette('sage');   // 定義したカスタム配色は保持されます。
KavUI.setPalette('custom'); // 最後に作ったカスタム配色へ戻します。
```

基準色は#RRGGBB、chromaは0〜32の整数です。chromaの既定値は24です。不正な値はfalseを返し、配色・保存値を変更しません。カスタムが未定義のときはgetCustomPalette()がnull、setPalette('custom')がfalseになります。変更時はui:palettechangeでdetail.palette='custom'、detail.seed、detail.chromaを通知します。

フォームからの適用はbodyにdata-ui-theme-persistがある場合だけ保存します。APIはpersist:trueで保存します。設定と初回描画用キャッシュはkav-ui-custom-paletteへ保存され、ライト・ダーク両方の色を持ちます。再読み込み時は基準色から再計算します。質感・明暗の設定は変更しません。

### HTMLで初期色を指定する

```html
<html data-ui-palette="custom"
      data-ui-palette-seed="#52796f"
      data-ui-palette-chroma="20">
```

初期色の生成にはui.jsが必要です。明示した基準色は保存済み設定より優先します。固定された既存6パレットは従来どおりCSSだけで使えます。

### 遷移時の配色を先に復元する

```html
<!-- CSSより前。defer / asyncを付けずに読み込みます。 -->
<script src="assets/js/theme-init.js"></script>
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>

<body data-ui-theme-persist>...</body>
```

theme-init.jsは任意です。保存した配色をCSSの描画前に復元し、カラーパレット・質感・明暗を引き継ぎます。カタログ・starter・テンプレートでは読み込み済みで、配布ZIPにも含めています。色生成処理はui.jsに同梱しているため、外部通信・npm・ブラウザでのimportは不要です。

<a id="palette-select"></a>

## selectで配置する

ボタンと選択欄は自動で同期します。デザインテーマと表示モードを変えても、選択した配色を保ちます。

```html
<label class="fx fx-wrap fx-items-center fx-gap-2">
              <span>カラーパレット</span>
              <select class="form-select w-auto" data-ui-palette-select>
                <option value="default">標準</option>
                <option value="slate">スレート</option>
                <option value="sage">セージ</option>
                <option value="teal">ティール</option>
                <option value="mauve">モーブ</option>
                <option value="sand">サンド</option>
                <option value="clay">クレイ</option>
              </select>
            </label>
```

<a id="palette-preview"></a>

## 共通UIへの反映

```html
<div class="ui-stack">
              <div class="ui-cluster">
                <button type="button" class="btn btn-primary" data-ui-toast="保存しました">変更を保存</button>
                <button type="button" class="btn btn-outline-primary">アウトライン</button>
                <button type="button" class="btn btn-soft-primary">控えめな操作</button>
              </div>
              <div class="ui-card">
                <div class="ui-card-body">
                  <h3 class="ui-card-title">プロジェクト設定</h3>
                  <p class="ui-card-description">背景と文字のトーンも、選択中のカラーパレットに連動します。</p>
                  <label class="form-label" for="palette-name">プロジェクト名</label>
                  <input class="form-control" id="palette-name" value="Design catalog">
                  <label class="form-check">
                    <input class="form-check-input" type="checkbox" checked>
                    <span>更新を通知する</span>
                  </label>
                </div>
              </div>
              <div class="ui-cluster">
                <button type="button" class="btn btn-success">成功</button>
                <button type="button" class="btn btn-warning">警告</button>
                <button type="button" class="btn btn-danger">エラー</button>
                <button type="button" class="btn btn-info">情報</button>
              </div>
            </div>
```

成功・警告・エラー・情報は独立した意味色です。パレットを変えても意味色の色相は変えません。

<a id="palette-roles"></a>

## Materialの色の役割

```html
<div class="ui-color-roles">
              <div class="ui-color-role ui-color-role-primary">
                Primary / On primary
                <br>
                主要な塗りと文字
              </div>
              <div class="ui-color-role ui-color-role-container">
                Primary container
                <br>
                選択状態・控えめな面
              </div>
              <div class="ui-color-role ui-color-role-secondary">
                Secondary container
                <br>
                補助的な面
              </div>
              <div class="ui-color-role ui-color-role-tertiary">
                Tertiary container
                <br>
                補足するアクセント
              </div>
              <div class="ui-color-role">
                Surface / On surface
                <br>
                本文と背景
              </div>
            </div>
```

ライトモードのSurfaceはHCTトーン96、Surface container lowestは98とし、大きな面の白さを少し抑えています。色値は[公式Material Color Utilities](https://github.com/material-foundation/material-color-utilities)のHCTから生成した静的CSSです。主色のChromaは24、補助色12、第3色16、ニュートラル4に抑えています。[Material Design 3のcolor roles](https://m3.material.io/styles/color/roles)に合わせ、Primaryはライト40／ダーク80、On primaryは100／20、Containerは90／30、On containerは30／90のトーンを使います。

生成時に文字・背景のロール対を検証しています。境界線はOutlineとOutline variant、背景はSurface containerの段階で分けています。成功・警告・情報はKav-UIの意味色拡張です。

<a id="palette-static"></a>

## HTMLとCSSだけで固定する

htmlのdata-ui-paletteで全体に適用します。既存のclassはそのまま利用できます。

```html
<html lang="ja" data-bs-theme="light" data-ui-palette="sage">
  <head>
    <link rel="stylesheet" href="assets/css/ui.css">
  </head>
  <body data-ui-theme="glass">...</body>
</html>
```

配色はdefault / slate / sage / teal / mauve / sand / clay、質感はbodyのdata-ui-theme、明暗はhtmlのdata-bs-themeが担当します。固定配色ではJavaScriptも保存も不要です。htmlに明示した有効な配色は、保存値より優先します。

<a id="palette-api"></a>

## 保存・JavaScript・イベント

```
KavUI.setPalette('sage');
KavUI.setPalette('mauve', { persist: true });
KavUI.setDesignTheme('glass');
KavUI.setColorTheme('system');

document.body.addEventListener('ui:palettechange', event => {
  console.log(event.detail.palette);
});
```

setPalette()は有効な値でtrue、不明な値では変更せずfalseを返します。APIはpersist省略時に保存しません。選択欄・ボタンからの操作はbodyにdata-ui-theme-persistがある場合だけ、kav-ui-paletteへ保存します。明暗のkav-ui-theme、質感のkav-ui-design-themeとは独立しています。保存を利用できない場合も、ページ内の切り替えは動きます。

初回描画の前に保存値を復元するtheme-init.jsは、カタログ・starter・サービステンプレートで読み込んでいます。アプリへの取り込み時にも引き継いでください。

[明暗・質感の切り替え →](theme-switcher.html.md) / [ダッシュボードで配色を試す →](../templates/dashboard.html.md)

使用ファイル・取り込み方

共通の ui.css と ui.js を読み込み、サンプルのHTMLを配置します。必要な動作は data-ui-* 属性で指定します。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../assets/ui/css/ui.css) / [ui.js](../assets/ui/js/ui.js) / [属性一覧と導入例](../getting-started.html.md)

assetsフォルダごとコピーするとCSS内の相対参照も維持できます。catalog.js、catalog-navigation.js、catalog-demo.js、layout.css はカタログ専用です。data-demo-* はアプリに取り込む際に外し、保存や通信はアプリ側で実装してください。
