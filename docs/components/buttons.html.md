<!-- Generated from docs/components/buttons.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](buttons.html) · [llms.txt](../llms.txt)

# Buttons

塗りつぶし・アウトライン・淡い背景・枠なしのボタン。アイコンの有無、位置、サイズや形をクラス指定で選べます。

## 塗りつぶし

`btn`に`btn-色名`を組み合わせます。主要な操作や、確定・削除など明確に強調したい操作に使います。

```html
<div class="fx fx-wrap fx-gap-3 fx-items-center">
<button type="button" class="btn btn-primary" >新規作成</button>
<button type="button" class="btn btn-secondary" >キャンセル</button>
<button type="button" class="btn btn-success" >承認</button>
<button type="button" class="btn btn-danger" >削除</button>
<button type="button" class="btn btn-warning" >注意事項</button>
<button type="button" class="btn btn-info" >詳細情報</button>
</div>
```

## アウトライン

`btn`に`btn-outline-色名`を組み合わせます。塗りつぶしより控えめに、操作できる範囲を枠線で示します。

```html
<div class="fx fx-wrap fx-gap-3 fx-items-center">
<button type="button" class="btn btn-outline-primary" >新規作成</button>
<button type="button" class="btn btn-outline-secondary" >キャンセル</button>
<button type="button" class="btn btn-outline-success" >承認</button>
<button type="button" class="btn btn-outline-danger" >削除</button>
<button type="button" class="btn btn-outline-warning" >注意事項</button>
<button type="button" class="btn btn-outline-info" >詳細情報</button>
</div>
```

## 淡い背景（Soft）

`btn`に`btn-soft-色名`を組み合わせます。通常の操作にはこの淡い背景を使うと、カードやフォームになじみます。

```html
<div class="fx fx-wrap fx-gap-3 fx-items-center">
<button type="button" class="btn btn-soft-primary" >新規作成</button>
<button type="button" class="btn btn-soft-secondary" >キャンセル</button>
<button type="button" class="btn btn-soft-success" >承認</button>
<button type="button" class="btn btn-soft-danger" >削除</button>
<button type="button" class="btn btn-soft-warning" >注意事項</button>
<button type="button" class="btn btn-soft-info" >詳細情報</button>
</div>
```

## 枠なし（Ghost）

`btn`に`btn-ghost-色名`を組み合わせます。ツールバーなど、同じ領域に複数の操作を並べる場合に使えます。

```html
<div class="fx fx-wrap fx-gap-3 fx-items-center">
<button type="button" class="btn btn-ghost-primary" >新規作成</button>
<button type="button" class="btn btn-ghost-secondary" >キャンセル</button>
<button type="button" class="btn btn-ghost-success" >承認</button>
<button type="button" class="btn btn-ghost-danger" >削除</button>
<button type="button" class="btn btn-ghost-warning" >注意事項</button>
<button type="button" class="btn btn-ghost-info" >詳細情報</button>
</div>
```

## アイコン＋文字（左・右）

SVGにbtn-iconを付けると、大きさ・間隔・色がボタンに揃います。HTML内の順序で左右を指定できます。

```html
<div class="fx fx-wrap fx-gap-3 fx-items-center">
<button type="button" class="btn btn-primary" ><svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/></svg> 新規作成</button>
<button type="button" class="btn btn-outline-primary" ><svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 9h-4V3H9v6H5l7 7 7-7M5 18v3h14v-3H5z"/></svg> ダウンロード</button>
<button type="button" class="btn btn-soft-success" ><svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg> 変更を保存</button>
<button type="button" class="btn btn-ghost-secondary" ><svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg> 編集</button>
<button type="button" class="btn btn-outline-secondary" >次へ <svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4 10.6 5.4 16.2 11H4v2h12.2l-5.6 5.6L12 20l8-8z"/></svg></button>
</div>
```

## アイコン付きでもデザインを選ぶ

```html
<div class="fx fx-wrap fx-gap-3 fx-items-center">
<button type="button" class="btn btn-primary" ><svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg> 編集</button>
<button type="button" class="btn btn-outline-primary" ><svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg> 編集</button>
<button type="button" class="btn btn-soft-primary" ><svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg> 編集</button>
<button type="button" class="btn btn-ghost-primary" ><svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg> 編集</button>
</div>
```

## アイコンのみ

btn-icon-onlyで正方形にします。aria-labelで操作名を付け、titleでも説明を表示します。

```html
<div class="fx fx-wrap fx-gap-3 fx-items-center">
<button type="button" class="btn btn-primary btn-icon-only" aria-label="追加" title="追加" ><svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/></svg></button>
<button type="button" class="btn btn-outline-secondary btn-icon-only" aria-label="編集" title="編集" ><svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg></button>
<button type="button" class="btn btn-soft-primary btn-icon-only" aria-label="検索" title="検索" ><svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9.5 3a6.5 6.5 0 1 0 4.1 11.54L19.06 20 20.5 18.56l-5.46-5.46A6.5 6.5 0 0 0 9.5 3m0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9z"/></svg></button>
<button type="button" class="btn btn-ghost-danger btn-icon-only" aria-label="削除" title="削除" ><svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12M19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></button>
</div>
```

## サイズと形

本文と共通の書体を使い、通常は14px・太さ500・行間1.4・字間0です。btn-smも14pxを保ち、余白で密度を変えます。btn-lgは16pxです。btn-pillで角丸を変更できます。タッチ環境では小型・アイコンボタンも操作領域を44px以上に広げます。

```html
<div class="fx fx-wrap fx-gap-3 fx-items-center">
<button type="button" class="btn btn-outline-primary btn-sm" ><svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/></svg> 追加</button>
<button type="button" class="btn btn-outline-primary" ><svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/></svg> 追加</button>
<button type="button" class="btn btn-outline-primary btn-lg" ><svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/></svg> 追加</button>
<button type="button" class="btn btn-primary btn-pill" ><svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/></svg> 追加</button>
<button type="button" class="btn btn-soft-primary btn-icon-only btn-sm" aria-label="追加" title="追加" ><svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/></svg></button>
<button type="button" class="btn btn-outline-primary btn-icon-only btn-lg btn-pill" aria-label="追加" title="追加" ><svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/></svg></button>
</div>
```

## 無効状態

操作できないボタンにはdisabledを指定します。

```html
<div class="fx fx-wrap fx-gap-3 fx-items-center">
<button type="button" class="btn btn-primary" disabled><svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg> 保存</button>
<button type="button" class="btn btn-outline-primary" disabled><svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg> 保存</button>
<button type="button" class="btn btn-soft-primary btn-icon-only" aria-label="編集" title="編集" disabled><svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg></button>
<button type="button" class="btn btn-ghost-danger btn-icon-only" aria-label="削除" title="削除" disabled><svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12M19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></button>
</div>
```

## 横幅いっぱいのボタン

```html
<button type="button" class="btn btn-primary btn-block" ><svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg> 変更を保存</button>
```

## 操作を試す

クリックまたはTabでフォーカスしてEnter / Spaceで通知を表示できます。

```html
<div class="fx fx-wrap fx-gap-3 fx-items-center">
<button type="button" class="btn btn-outline-primary" data-ui-toast="アイコン付きボタンを操作しました（デモ）。"><svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg> サンプル通知を表示</button>
</div>
```

## クラス一覧

| クラス | 用途 |
| --- | --- |
| `btn` | ボタンの基本。すべてのデザインに併用します。 |
| `btn-{色}` | 塗りつぶし。primary / secondary / success / danger / warning / info。 |
| `btn-outline-{色}` | 枠線で示すデザイン。同じ6色を指定できます。 |
| `btn-soft-{色}` | 淡い背景。同じ6色を指定できます。 |
| `btn-ghost-{色}` | 枠なし。同じ6色を指定できます。 |
| `btn-icon` | 子のSVGに指定。文字色を引き継ぎます。 |
| `btn-icon-only` | アイコンのみの正方形ボタン。aria-labelも指定します。 |
| `btn-sm / btn-lg` | 小・大サイズ。省略時は標準サイズ。 |
| `btn-pill / btn-block` | 丸い形状／横幅いっぱいに表示。 |

デザイン用クラスは1つ選び、サイズや形状を組み合わせます。外部のアイコンライブラリは不要です。サンプルのSVGは「HTMLを表示」からそのままコピーできます。

[アイコン一覧](icons.html.md) / [ボタンのローディング](loading.html.md) / [コピー操作のボタン](clipboard.html.md)

使用ファイル・取り込み方

共通の ui.css と ui.js を読み込み、サンプルのHTMLを配置します。必要な動作は data-ui-* 属性で指定します。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../assets/ui/css/ui.css) / [ui.js](../assets/ui/js/ui.js) / [属性一覧と導入例](../getting-started.html.md)

assetsフォルダごとコピーするとCSS内の相対参照も維持できます。catalog.js、catalog-navigation.js、catalog-demo.js、layout.css はカタログ専用です。data-demo-* はアプリに取り込む際に外し、保存や通信はアプリ側で実装してください。
