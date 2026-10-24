<!-- Generated from docs/components/chart.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](chart.html) · [llms.txt](../../llms.txt)

# Chart

SVGで描く折れ線・面・棒・ドーナツチャート。ライブラリや通信は不要で、既存テーマに追従します。使用例の数値はサンプルデータです。

<a id="chart-line"></a>

## 折れ線：複数系列の比較

系列は色と線種で区別します。全チャートに、正確な値を確認できるデータ表を付けます。

```html
<figure class="ui-chart" data-ui-chart="line">
              <figcaption>折れ線</figcaption>
              <script type="application/json" data-ui-chart-data>
{
  "label": "折れ線",
  "labels": [
    "月",
    "火",
    "水",
    "木",
    "金",
    "土",
    "日"
  ],
  "series": [
    {
      "name": "今週",
      "values": [
        24,
        38,
        32,
        48,
        42,
        58,
        64
      ]
    },
    {
      "name": "前週",
      "values": [
        20,
        26,
        30,
        35,
        31,
        42,
        48
      ]
    }
  ],
  "unit": "件"
}
</script>
              <noscript>チャートの表示にはJavaScriptを有効にしてください。</noscript>
            </figure>
```

<a id="chart-area"></a>

## 面：値の推移

面は0を基準に塗ります。複数系列の積み上げは行わず、それぞれの値を同じ軸で表示します。

```html
<figure class="ui-chart" data-ui-chart="area">
              <figcaption>面</figcaption>
              <script type="application/json" data-ui-chart-data>
{
  "label": "面",
  "labels": [
    "4月",
    "5月",
    "6月",
    "7月",
    "8月",
    "9月"
  ],
  "series": [
    {
      "name": "利用者",
      "values": [
        120,
        160,
        145,
        210,
        240,
        280
      ]
    }
  ],
  "unit": "人"
}
</script>
              <noscript>チャートの表示にはJavaScriptを有効にしてください。</noscript>
            </figure>
```

<a id="chart-bar"></a>

## 棒：項目の比較

複数系列はグループ表示します。負の値にも対応し、縦軸は必ず0を含みます。

```html
<figure class="ui-chart" data-ui-chart="bar">
              <figcaption>棒</figcaption>
              <script type="application/json" data-ui-chart-data>
{
  "label": "棒",
  "labels": [
    "企画",
    "開発",
    "運用",
    "サポート"
  ],
  "series": [
    {
      "name": "計画",
      "values": [
        40,
        80,
        50,
        30
      ]
    },
    {
      "name": "実績",
      "values": [
        35,
        92,
        45,
        26
      ]
    }
  ],
  "unit": "時間"
}
</script>
              <noscript>チャートの表示にはJavaScriptを有効にしてください。</noscript>
            </figure>
```

<a id="chart-donut"></a>

## ドーナツ：構成比

1系列・0以上の値で指定します。中央に合計、凡例に項目名と値を表示します。全て0の場合は空状態になります。

```html
<figure class="ui-chart" data-ui-chart="donut">
              <figcaption>ドーナツ</figcaption>
              <script type="application/json" data-ui-chart-data>
{
  "label": "ドーナツ",
  "labels": [
    "検索",
    "直接アクセス",
    "紹介",
    "その他"
  ],
  "series": [
    {
      "name": "訪問数",
      "values": [
        420,
        280,
        190,
        110
      ]
    }
  ],
  "unit": "件"
}
</script>
              <noscript>チャートの表示にはJavaScriptを有効にしてください。</noscript>
            </figure>
```

<a id="chart-update"></a>

## JavaScriptで更新する

`KavUI.chart(要素またはセレクター, 設定)`で描画・更新できます。成功時はtrue、設定不備はfalseを返し、説明を画面内に表示します。データ更新は`ui:chartupdate`、設定不備は`ui:charterror`で通知します。

```html
<button class="btn btn-outline-primary" type="button" data-demo-chart>データを切り替える</button>
            <figure id="chart-live" class="ui-chart" data-ui-chart="bar">
              <figcaption>チームの完了件数</figcaption>
              <script type="application/json" data-ui-chart-data>
{
  "labels": [
    "Aチーム",
    "Bチーム",
    "Cチーム"
  ],
  "series": [
    {
      "name": "完了件数",
      "values": [
        12,
        18,
        9
      ]
    }
  ]
}
</script>
            </figure>
            <p role="status" data-demo-chart-status>初期データ</p>
```

```
KavUI.chart('#chart-live', {
  type: 'bar',
  label: 'チームの完了件数',
  unit: '件',
  labels: ['Aチーム', 'Bチーム', 'Cチーム'],
  series: [{name: '完了件数', values: [18, 25, 14]}]
});

document.querySelector('#chart-live').addEventListener('ui:chartupdate', event => {
  console.log(event.detail.type, event.detail.series);
});
```

同じ要素に`KavUI.init()`を再実行してもデータは初期値に戻りません。JSONを変更して読み直す場合は`KavUI.chart(element)`を実行します。

<a id="chart-empty"></a>

## 空状態

labelsまたはseriesが空のときは案内を表示します。JSONの構文不備・系列の長さ不一致・数値以外・未対応の種類は、チャート領域内のエラーになります。

```html
<figure class="ui-chart" data-ui-chart="line">
              <figcaption>データ未登録</figcaption>
              <script type="application/json" data-ui-chart-data>
{
  "label": "データ未登録",
  "labels": [],
  "series": [],
  "unit": ""
}
</script>
              <noscript>チャートの表示にはJavaScriptを有効にしてください。</noscript>
            </figure>
```

<a id="chart-options"></a>

## 設定・制約・アクセシビリティ

- `data-ui-chart="line|area|bar|donut"`をルートに付け、直下の`script[type="application/json"][data-ui-chart-data]`にデータを置きます。APIのtypeは属性より優先します。
- `label`はグラフとデータ表の読み上げ名、`unit`は表・凡例・ポイントの単位です。figcaptionは任意の見出しとして残ります。
- `labels`は項目名、`series`は`{name, values}`の配列。最大500項目・12系列、数値の絶対値は1兆以下です。ドーナツは1系列のみです。
- 0を含む共通の縦軸を使い、積み上げ・対数軸・ズーム・日時軸・系列の非表示には対応しません。欠損値は受け付けません。
- 系列色は`--ui-chart-color-1`〜`--ui-chart-color-6`で指定できます。7系列目以降は色を繰り返します。項目が多い場合はデータ表も併用してください。
- コンテナ幅に合わせて描画し直します。データ表はリサイズ時にも開閉状態とフォーカスを保ちます。
- SVGは画像として読み上げ名を持ち、値はキーボードで開ける表で確認できます。JavaScriptが無効な環境用にはnoscriptなどで説明を添えてください。
- データをJSONに埋め込む際は、アプリ側で`<`を`\u003c`などにエスケープしてください。API経由の文字列はテキストとして描画します。

[チャートを使ったダッシュボード →](../templates/dashboard.html.md)

使用ファイル・取り込み方

共通の ui.css と ui.js を読み込み、サンプルのHTMLを配置します。必要な動作は data-ui-* 属性で指定します。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ui.css](../../assets/css/ui.css) / [ui.js](../../assets/js/ui.js) / [属性一覧と導入例](../getting-started.html.md)

assetsフォルダごとコピーするとCSS内の相対参照も維持できます。catalog.js、catalog-navigation.js、catalog-demo.js、layout.css はカタログ専用です。data-demo-* はアプリに取り込む際に外し、保存や通信はアプリ側で実装してください。
