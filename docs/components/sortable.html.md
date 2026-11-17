<!-- Generated from docs/components/sortable.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](sortable.html) · [llms.txt](../llms.txt)

# Sortable list

ドラッグ、タッチ、キーボードでリストを並べ替えます。保存や通信はアプリ側で実装してください。

Space または Enter で持ち上げ・確定、上下左右の矢印で移動、Escape で取り消します。ハンドルなしでは項目全体、ハンドル付きではハンドルからドラッグできます。タッチでページをスクロールする場合は、ハンドル付きリストの本文またはリスト外を使ってください。

<a id="basic"></a>

## 基本のリスト

```html
<ul data-ui-sortable aria-label="作業の順序">
  <li data-id="plan">要件を整理する</li>
  <li data-id="implement">実装する</li>
  <li data-id="review">レビューする</li>
</ul>
```

### Vue

```vue
<script setup>
import { KavWidget } from "@kai17-a/kav-ui-vue";
const html = `
  <ul data-ui-sortable aria-label="作業の順序">
    <li data-id="plan">要件を整理する</li>
    <li data-id="implement">実装する</li>
    <li data-id="review">レビューする</li>
  </ul>
`;
</script>

<template>
  <KavWidget :html="html" />
</template>
```

### Astro

```astro
---
import { KavWidget } from "@kai17-a/kav-ui-astro";
const html = `
  <ul data-ui-sortable aria-label="作業の順序">
    <li data-id="plan">要件を整理する</li>
    <li data-id="implement">実装する</li>
    <li data-id="review">レビューする</li>
  </ul>
`;
---

<KavWidget html={html} />
```

<a id="handles"></a>

## ハンドル付きリスト

```html
<ol data-ui-sortable aria-label="公開までの順序">
  <li data-id="draft"><button type="button" class="btn btn-sm btn-outline-secondary" data-ui-sortable-handle aria-label="下書きを移動">移動</button> 下書きを作る</li>
  <li data-id="check"><button type="button" class="btn btn-sm btn-outline-secondary" data-ui-sortable-handle aria-label="確認を移動">移動</button> 内容を確認する</li>
  <li data-id="publish"><button type="button" class="btn btn-sm btn-outline-secondary" data-ui-sortable-handle aria-label="公開を移動">移動</button> 公開する</li>
</ol>
```

### Vue

```vue
<script setup>
import { KavWidget } from "@kai17-a/kav-ui-vue";
const html = `
  <ol data-ui-sortable aria-label="公開までの順序">
    <li data-id="draft"><button type="button" class="btn btn-sm btn-outline-secondary" data-ui-sortable-handle aria-label="下書きを移動">移動</button> 下書きを作る</li>
    <li data-id="check"><button type="button" class="btn btn-sm btn-outline-secondary" data-ui-sortable-handle aria-label="確認を移動">移動</button> 内容を確認する</li>
    <li data-id="publish"><button type="button" class="btn btn-sm btn-outline-secondary" data-ui-sortable-handle aria-label="公開を移動">移動</button> 公開する</li>
  </ol>
`;
</script>

<template>
  <KavWidget :html="html" />
</template>
```

### Astro

```astro
---
import { KavWidget } from "@kai17-a/kav-ui-astro";
const html = `
  <ol data-ui-sortable aria-label="公開までの順序">
    <li data-id="draft"><button type="button" class="btn btn-sm btn-outline-secondary" data-ui-sortable-handle aria-label="下書きを移動">移動</button> 下書きを作る</li>
    <li data-id="check"><button type="button" class="btn btn-sm btn-outline-secondary" data-ui-sortable-handle aria-label="確認を移動">移動</button> 内容を確認する</li>
    <li data-id="publish"><button type="button" class="btn btn-sm btn-outline-secondary" data-ui-sortable-handle aria-label="公開を移動">移動</button> 公開する</li>
  </ol>
`;
---

<KavWidget html={html} />
```

<a id="api"></a>

## API

属性・イベント

| API | 動作 |
| --- | --- |
| `data-ui-sortable` | ul / ol / div の直下の要素を並べ替えます。縦方向のリストに使用します。 |
| `data-ui-sortable-handle` | 項目内の任意のハンドル。button type="button" と項目を識別できる名前を推奨します。省略時は項目自体がフォーカス可能になります。 |
| `ui:sortable-change` | 順序が変わって確定したときに発行。detail は {item, from, to, order}。from / to は0始まり、item はDOM要素、order は並べ替え後のDOM要素の配列です。キャンセル・変更なしでは発行しません。 |
| `init(scope) / destroy(scope)` | 既存の KavUI API で初期化と解除。パッケージの mount(root, {signal}) にも対応します。 |

項目の永続IDは data-id などでアプリ側が管理してください。日本語のライブ通知と操作説明を自動付与します。動きを減らす設定を尊重します。

使用ファイル・取り込み方

共通の [ui.css](../assets/ui/css/ui.css) と [ui.js](../assets/ui/js/ui.js) を読み込み、サンプルのHTMLを配置します。
