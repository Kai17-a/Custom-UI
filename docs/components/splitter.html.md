<!-- Generated from docs/components/splitter.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](splitter.html) · [llms.txt](../../llms.txt)

# Splitter

隣り合うパネルの境界をドラッグしてサイズを調整します。横・縦分割、複数パネル、入れ子、折り畳み、任意のサイズ保存に対応。共通のui.css / ui.jsを読み込み、属性で指定します。

<a id="splitter-horizontal"></a>

## 横分割：ドラッグとキーボード

`data-ui-splitter-panel`を直下に並べると、境界のハンドルを自動で生成します。

サイズ・最小・最大はパネル領域全体に対する割合（%）です。ハンドルの幅は含みません。

```html
<div class="ui-splitter ui-splitter-sm" data-ui-splitter id="splitter-basic">
        <section data-ui-splitter-panel data-ui-size="30" data-ui-min="15" data-ui-max="60" aria-labelledby="splitter-projects-title"><div class="ui-splitter-content"><h3 id="splitter-projects-title">プロジェクト</h3><nav class="nav nav-vertical" aria-label="プロジェクト"><a class="nav-link" href="layouts.html">レイアウト</a><a class="nav-link" href="cards.html">カード</a><a class="nav-link" href="forms.html">フォーム</a></nav></div></section>
        <section data-ui-splitter-panel data-ui-size="70" data-ui-min="20" aria-label="プロジェクトの本文"><div class="ui-splitter-content"><h3>デザインカタログ</h3><p>境界線を左右にドラッグして、一覧と本文の幅を調整できます。</p><p class="type-caption">ハンドルにTabで移動し、左右矢印で2%ずつ、Shift＋矢印で10%ずつ変更できます。</p></div></section>
      </div>
      <button class="btn btn-sm btn-outline-secondary sp-mt-3" type="button" data-ui-splitter-reset="#splitter-basic">初期サイズへ戻す</button>
```

仕切りは細い1本線で表示します。線の周囲もドラッグでき、ホバー・ドラッグ中は線の色が変わります。スマートフォンではタッチ操作に対応します。文字が収まらないパネルはスクロールできます。ハンドルをダブルクリックすると、隣接する2パネルの初期比率へ戻ります。

<a id="splitter-vertical"></a>

## 縦分割・3つ以上のパネル

`data-ui-orientation="vertical"`で上下に並べます。縦分割のキー操作は上下矢印です。境界ごとに、隣り合う2領域のサイズだけを変更します。

```html
<div class="ui-splitter" data-ui-splitter data-ui-orientation="vertical" id="splitter-vertical-demo">
        <section data-ui-splitter-panel data-ui-size="35" data-ui-min="15" aria-label="プレビュー"><div class="ui-splitter-content"><h3>プレビュー</h3><p>変更した画面の見え方を表示します。</p></div></section>
        <section data-ui-splitter-panel data-ui-size="35" data-ui-min="15" aria-label="エディター"><div class="ui-splitter-content"><h3>エディター</h3><p>ハンドルを上下へ動かして、作業領域を広げられます。</p></div></section>
        <section data-ui-splitter-panel data-ui-size="30" data-ui-min="15" aria-label="ログ"><div class="ui-splitter-content"><h3>ログ</h3><p class="type-caption">12:30 プレビューを更新しました。</p></div></section>
      </div>
```

<a id="splitter-nested"></a>

## 横と縦を組み合わせる

```html
<div class="ui-splitter ui-splitter-lg ui-splitter-mobile-stack" data-ui-splitter id="splitter-nested-demo">
        <section data-ui-splitter-panel data-ui-size="25" data-ui-min="15" data-ui-max="45" aria-label="ファイル一覧"><div class="ui-splitter-content"><h3>ファイル</h3><ul><li>index.html</li><li>app.css</li><li>app.js</li></ul></div></section>
        <section data-ui-splitter-panel data-ui-size="75" data-ui-min="40" aria-label="編集エリア">
          <div class="ui-splitter" data-ui-splitter data-ui-orientation="vertical">
            <section data-ui-splitter-panel data-ui-size="65" data-ui-min="25" aria-label="画面の編集"><div class="ui-splitter-content"><h3>画面の編集</h3><p>親の左右分割とは独立して、上下のサイズを調整できます。</p><label class="field">プロジェクト名<input class="form-control" value="Design catalog"></label></div></section>
            <section data-ui-splitter-panel data-ui-size="35" data-ui-min="15" aria-label="ターミナル"><div class="ui-splitter-content"><h3>ターミナル</h3><p class="type-caption">Ready. npmや追加ライブラリは不要です。</p></div></section>
          </div>
        </section>
      </div>
```

この例はui-splitter-mobile-stackでスマートフォン（768px未満）では上下分割に切り替えます。キーボードの方向・ARIAも同期します。パネル直下のSplitterは親の高さに収まります。パネルは親ごとに管理するため、入れ子のサイズやハンドルが混ざりません。

<a id="splitter-collapse"></a>

## 折り畳み・展開

パネルにdata-ui-collapsibleを追加します。ハンドルでEnterまたはダブルクリックすると、その手前のパネルを折り畳み、再操作で直前のサイズへ戻します。ドラッグでは最小サイズの半分より小さくすると折り畳みます。ドラッグでの折り畳みは、隣の領域の最大サイズに収まる場合に行います。

```html
<div class="ui-splitter ui-splitter-sm" data-ui-splitter id="splitter-collapse-demo">
        <section data-ui-splitter-panel data-ui-size="30" data-ui-min="20" data-ui-max="50" data-ui-collapsible aria-label="補助パネル"><div class="ui-splitter-content"><h3>補助パネル</h3><p>折り畳むとこの中のリンクや入力欄はフォーカス対象から外れます。</p><a href="sidebar.html">Sidebarを見る</a></div></section>
        <section data-ui-splitter-panel data-ui-size="70" data-ui-min="30" aria-label="メインパネル"><div class="ui-splitter-content"><h3>メインパネル</h3><p>Enterで補助パネルを開閉できます。折り畳んだ後もハンドルは残ります。</p></div></section>
      </div>
      <button class="btn btn-sm btn-outline-secondary sp-mt-3" type="button" data-ui-splitter-reset="#splitter-collapse-demo">両方を初期サイズへ戻す</button>
```

Enterによる開閉では、制約に収まるよう他のパネルへ再配分します。折り畳む領域にフォーカスがある場合はハンドルへ移します。最初から折り畳む場合はdata-ui-size="0"とdata-ui-collapsibleを指定します。

<a id="splitter-persist"></a>

## サイズを保存する（任意）

data-ui-splitter-saveに画面固有のキーを付けると、操作完了時に割合をlocalStorageへ保存します。この例は再読み込みしても同じ配分で開きます。属性を省略すると保存しません。

```html
<div class="ui-splitter ui-splitter-sm" data-ui-splitter data-ui-splitter-save="catalog-workspace" id="splitter-saved-demo">
        <section data-ui-splitter-panel data-ui-size="40" data-ui-min="20" data-ui-max="70" aria-label="保存される一覧"><div class="ui-splitter-content"><h3>一覧</h3><p>横幅を変えてからページを再読み込みしてください。</p></div></section>
        <section data-ui-splitter-panel data-ui-size="60" data-ui-min="20" aria-label="保存される詳細"><div class="ui-splitter-content"><h3>詳細</h3><p>デザインやカラーパレットを変えても割合を保持します。</p></div></section>
      </div>
      <button class="btn btn-sm btn-outline-secondary sp-mt-3" type="button" data-ui-splitter-reset="#splitter-saved-demo">保存値を初期サイズへ戻す</button>
```

保存キーはkav-ui-splitter:指定したキーです。保存されたパネル数・向き・数値が合わない場合は初期値へ戻します。ブラウザで保存が使えなくても、その場でのサイズ変更はできます。

<a id="splitter-disabled"></a>

## サイズ変更を無効にする

```html
<div class="ui-splitter ui-splitter-sm" data-ui-splitter data-ui-splitter-disabled>
        <section data-ui-splitter-panel aria-label="読み取り専用の左領域"><div class="ui-splitter-content"><h3>一覧</h3><p>ハンドルの操作は無効ですが、中身は操作できます。</p></div></section>
        <section data-ui-splitter-panel aria-label="読み取り専用の右領域"><div class="ui-splitter-content"><h3>詳細</h3><a href="layouts.html">レイアウトを見る</a></div></section>
      </div>
```

<a id="splitter-api"></a>

## 指定方法・API・イベント

ui-splitter-smは高さ16rem、通常は24rem、ui-splitter-lgは32remです。アプリ固有のクラスで--ui-splitter-heightを指定して高さを変更できます。内側の余白はui-splitter-contentに付け、パネル自体にはpaddingや最小幅を指定しないでください。

| 指定 | 内容 |
| --- | --- |
| data-ui-splitter | 親の初期化。直下のdata-ui-splitter-panelを2つ以上配置。 |
| data-ui-orientation | horizontal（既定）／vertical。指定の向きを維持。ui-splitter-mobile-stackを追加するとスマートフォンでは縦分割。 |
| data-ui-size | 初期サイズ。省略した領域で残りを分け、合計100へ正規化。 |
| data-ui-min / data-ui-max | 0〜100の割合。既定は10／100。制約に収まるよう初期値も調整。 |
| data-ui-collapsible | パネルの折り畳みを許可。 |
| data-ui-splitter-step | 親に指定。矢印キーの移動幅。既定2。Shiftで5倍。 |
| data-ui-splitter-disabled | 親に指定。ポインター・キーボードによる変更を無効化。 |
| data-ui-splitter-save | 親に保存キーを指定。省略時は保存しない。 |

```
// 現在の割合をコピーで取得
const sizes = KavUI.splitter('#splitter-basic'); // [30, 70]

// 制約内に調整して反映。成功時は反映後の配列、不正な指定はfalse。
KavUI.splitter('#splitter-basic', {sizes: [40, 60]});
KavUI.splitter('#splitter-basic', {reset: true});

// 値が変わるたびに通知
const root = document.querySelector('#splitter-basic');
root.addEventListener('ui:splitterchange', event => {
  console.log(event.detail.sizes);
});
// 操作完了。Escape・ポインターキャンセルは開始時へ戻し、保存しない。
root.addEventListener('ui:splitterend', event => {
  console.log(event.detail.sizes, event.detail.cancelled);
});

// DOMや設定を変更した後の初期化
KavUI.init(root);
```

左右／上下矢印で調整、Shiftで大きく調整、Home／Endで境界まで移動します。RTLでは横分割の左右を反転します。ドラッグ中のEscape、ポインターキャンセル、画面サイズ変更では開始時の割合へ戻します。

パネルにaria-labelまたはaria-labelledbyを指定すると、対応するハンドルの名前にも反映します。ハンドルはrole="separator"、aria-controls、現在値・最小値・最大値を持ちます。

最小サイズの合計が100を超えるなど成立しない設定では初期化しません。サイズ配列は要素数が一致する0〜100の数値を指定します。全て0の配列・負数・文字列・NaNは受け付けません。JSがない場合は等分表示となり、サイズ変更はできません。

機能の参考：[Nuxt UI Splitter](https://ui.nuxt.com/docs/releases/v4.11.0)。キーボードとARIAの参考：[WAI-ARIA Window Splitter Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/)。Nuxt・Vue・外部ライブラリの読み込みは不要です。

使用ファイル・取り込み方

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../../assets/css/ui.css) / [ui.js](../../assets/js/ui.js)。後から追加した要素にはKavUI.init()を呼びます。
