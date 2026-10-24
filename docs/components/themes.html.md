<!-- Generated from docs/components/themes.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](themes.html) · [llms.txt](../llms.txt)

# UI themes

[色合いを変えたい場合はカラーパレット →](color-palettes.html.md)

UI全体の質感を選ぶテーマです。ライト／ダークとは別に、背景・面・角丸・影をまとめて切り替えます。

## ページ全体で比較する

[テーマ切り替えコンポーネント（ボタン・選択式） →](theme-switcher.html.md)

```html
<label class="fx fx-wrap fx-items-center fx-gap-3">デザインテーマ
  <select class="form-select form-select-sm" data-ui-theme-select style="width:auto"><option value="default">標準</option><option value="glass">ガラス</option><option value="glassmorphism">グラスモーフィズム</option><option value="flat">フラット</option><option value="soft">ソフト</option></select>
</label>
```

ヘッダーの選択欄と連動します。カタログでは選択をブラウザに保存します。右上のライト／ダーク切り替えと組み合わせて、5種類×2通りの表示を確認できます。

<a id="theme-background"></a>

## ガラスの背景に画像を設定する（任意）

glass・glassmorphismでは、背景画像をテーマの色と重ねて薄く表示できます。画像は画面に固定され、長いページをスクロールしても途切れません。画像を指定しなければ従来のグラデーション背景になります。ライト・ダークやカラーパレットにも追従します。

### カタログで見え方を試す

```html
<div class="ui-stack">
      <div class="ui-cluster">
        <button class="btn btn-primary" type="button" data-demo-background-action="sample">サンプル画像を表示</button>
        <button class="btn btn-outline-secondary" type="button" data-demo-background-action="clear">画像を解除</button>
      </div>
      <div class="ui-file-drop" data-ui-file-drop>
        <input class="form-control" id="theme-background-file" type="file" accept="image/*" aria-describedby="theme-background-file-help theme-background-status">
        <label class="ui-file-dropzone" data-ui-file-zone for="theme-background-file"><span icon="mdi-image" aria-hidden="true"></span><strong>手元の画像をドロップ</strong><span>またはクリックして選択</span><span class="ui-file-hint" id="theme-background-file-help">このページ内だけでプレビューします。アップロード・保存はしません。</span></label>
      </div>
      <label class="field" for="theme-background-opacity">画像の濃さ：<output for="theme-background-opacity">18%</output><input class="form-range" id="theme-background-opacity" type="range" min="0" max="100" step="1" value="18"></label>
      <p class="type-caption" id="theme-background-status" role="status" data-demo-background-status>画像は未設定です。サンプルまたは手元の画像を選んでください。</p>
    </div>
```

ガラス以外のテーマで画像を選ぶと、プレビューではグラスモーフィズムへ切り替えます。画像を設定したまま標準・フラット・ソフトに変えると画像は表示されず、ガラスへ戻すと再表示されます。再読み込み時は画像なしに戻ります。

### アプリではCSSクラスで指定する

```
/* アプリのCSSへ追加。URLは使用する画像の場所に変更してください。 */
.app-glass-background {
  --ui-theme-background-image: url("/images/background.jpg");
  --ui-theme-background-opacity: 18%;
  --ui-theme-background-position: center;
  --ui-theme-background-size: cover;
}
```

```html
<body class="app-glass-background" data-ui-theme="glassmorphism">
  ...
</body>

<!-- ガラスでも同じクラスを使用できます。 -->
<body class="app-glass-background" data-ui-theme="glass">
  ...
</body>
```

この指定はui.cssだけで動きます。opacityは0%で見えなくなり、100%で元の濃さになります（既存の装飾グラデーションは重なります）。既定値は18%。positionはcenter、sizeはcoverが既定値です。例のURLはWebサーバーのルートからのパスです。

### 画像を使わない・一時的に外す

```
/* クラスを付けない場合は画像なし。付けたまま外す場合も指定できます。 */
.app-glass-background.is-background-off {
  --ui-theme-background-image: none;
}
```

画像が読み込めない場合も、テーマの背景色とグラデーションが残ります。高コントラスト表示では画像を表示しません。サンプルのプレビュー操作はcatalog-demo.js専用で、アプリの配布に取り込む必要はありません。

## カード・フォーム・サイドバー

```html
<div class="app-shell">
  <aside class="app-sidebar" aria-label="テーマ見本のメニュー">
    <h3 class="app-sidebar-title">Workspace</h3>
    <nav class="app-sidebar-group" aria-label="テーマ見本の移動先"><a href="#theme-project" aria-current="page">プロジェクト</a><a href="#theme-overlays">通知とモーダル</a></nav>
    <p class="app-sidebar-footer">Design catalog</p>
  </aside>
  <div class="app-content stack">
    <article class="ui-card" id="theme-project"><div class="ui-card-header"><h3 class="ui-card-title">デザインカタログ</h3></div><div class="ui-card-body"><p class="ui-card-description">コンポーネントの構造を変えずに、面・角丸・影がテーマに合わせて変化します。</p><p class="ui-card-meta">更新：今日 · 12コンポーネントを確認</p></div><footer class="ui-card-footer"><button type="button" class="btn btn-primary" data-ui-toggle="dialog" data-ui-target="#theme-dialog">詳細を確認</button><button type="button" class="btn btn-outline-secondary" data-ui-tooltip="テーマを変えても操作方法は同じです。">ヒント</button></footer></article>
    <form class="stack" data-ui-validate data-demo-form>
      <div class="field" data-ui-field><label for="theme-name">プロジェクト名</label><input id="theme-name" name="project" class="form-control" value="Design catalog" required><small data-ui-error hidden></small></div>
      <div class="field"><label for="theme-visibility">公開範囲</label><select id="theme-visibility" class="form-select" name="visibility"><option>自分のみ</option><option>チーム</option></select></div>
      <div class="fx fx-wrap fx-gap-2"><button type="submit" class="btn btn-primary">入力を確認</button><button type="reset" class="btn btn-soft-secondary">リセット</button></div><p role="status" data-demo-result></p>
    </form>
  </div>
</div>
```

<a id="theme-overlays"></a>

## 通知・モーダル・日付選択

```html
<div class="stack">
  <div class="alert alert-success" role="status">設定を保存しました。成功・警告・エラーの意味を表す色は維持します。</div>
  <div class="fx fx-wrap fx-gap-2"><button type="button" class="btn btn-outline-primary" data-ui-toast data-ui-title="保存しました" data-ui-body="テーマを変えても、通知の意味を色と文字で伝えます。" data-ui-toast-copy data-ui-duration="0">コピー付きトースト</button><button type="button" class="btn btn-outline-danger" data-ui-toast="接続を確認して再試行してください。" data-ui-variant="danger">エラーのトースト</button><button type="button" class="btn btn-outline-secondary" data-ui-toggle="dialog" data-ui-target="#theme-dialog">モーダルを開く</button></div>
  <div class="field"><label for="theme-date">実施日</label><div class="ui-datepicker" data-ui-datepicker data-ui-datepicker-button="icon"><input id="theme-date" class="form-control" type="date" value="2026-10-21"></div></div>
</div>
<dialog id="theme-dialog" class="ui-dialog" data-ui-dialog aria-labelledby="theme-dialog-title"><h2 id="theme-dialog-title">プロジェクトの確認</h2><p>モーダルにも選んだデザインテーマが適用されます。</p><div class="field"><label for="theme-dialog-input">プロジェクト名</label><input class="form-control" id="theme-dialog-input" value="Design catalog"></div><div class="buttons"><button type="button" class="btn btn-outline-secondary" data-ui-tooltip="テーマを変えてもヒントの位置と操作を維持します。">ヒント</button><button type="button" class="btn btn-primary" data-ui-dismiss="dialog">閉じる</button></div></dialog>
```

## テーマの違い

| 値 | デザイン |
| --- | --- |
| `default` | 標準。従来の色・角丸・影。 |
| `glass` | ガラス。背景の色の重なり、半透明の面、背景のぼかし。ぼかし非対応のブラウザでは不透明の面を使用。 |
| `glassmorphism` | グラスモーフィズム。透明感のある面、24pxの背景ぼかし、光沢のある縁、色が重なる背景。 |
| `flat` | フラット。小さな角丸と罫線。影を抑えた表示。 |
| `soft` | ソフト。淡い背景、大きめの角丸と柔らかな影。 |

## グラスモーフィズムを使う

デザイン選択欄の「グラスモーフィズム」でページ全体に適用できます。半透明の面と背景の色の重なり、ぼかし、内側の光沢で質感を示します。入力欄とモーダルは透明度を抑えて読みやすさを保ちます。

```html
<body data-ui-theme="glassmorphism">
```

```
KavUI.setDesignTheme('glassmorphism');
```

ライト／ダーク両対応です。ぼかし非対応のブラウザでは、不透明な背景に切り替わります。

## アプリへの取り込み

共通のui.cssにテーマも含まれます。bodyの属性だけで適用でき、静的なテーマ指定にはJavaScriptは不要です。

```html
<html lang="ja" data-bs-theme="light">
  <head>
    <link rel="stylesheet" href="assets/css/ui.css">
    <script defer src="assets/js/ui.js"></script>
  </head>
  <body data-ui-theme="glass">
    <!-- いつものコンポーネントを配置 -->
  </body>
</html>
```

明暗はhtmlのdata-bs-theme、デザインはbodyのdata-ui-themeで別々に指定します。指定を省略するかdefaultにすると標準に戻ります。

### 選択欄を置く

```html
<label>デザインテーマ
  <select data-ui-theme-select>
    <option value="default">標準</option>
    <option value="glass">ガラス</option>
    <option value="glassmorphism">グラスモーフィズム</option>
    <option value="flat">フラット</option>
    <option value="soft">ソフト</option>
  </select>
</label>
```

選択欄の動作にはui.jsが必要です。複数の選択欄も自動で同期します。

### JavaScriptと選択の保存

```
KavUI.setDesignTheme('glass');
KavUI.setDesignTheme('default'); // 標準へ戻す

// 保存も行う場合（省略時は保存しません）：
KavUI.setDesignTheme('soft', { persist: true });

document.addEventListener('ui:designchange', event => {
  const theme = event.detail.theme;
});
```

次回表示時も選択を復元したい場合は、bodyに`data-ui-theme-persist`を追加します。その場合、選択欄からの変更も保存します。bodyに明示したdata-ui-themeがあれば、保存値より優先されます。保存が利用できなくても、現在のページでの切り替えは動作します。

```html
<body data-ui-theme-persist>
```

独自の背景色・影をstyle属性や独自CSSで指定した部品には、その指定が優先される場合があります。

使用ファイル・取り込み方

[themes.css](../assets/ui/css/themes.css)はui.cssから自動で読み込まれます。assetsフォルダの構造を維持してコピーしてください。npm不要です。

[導入手順](../getting-started.html.md) / [共通ファイルだけのアプリ見本](../starter.html.md)
