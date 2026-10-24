<!-- Generated from docs/components/data-table.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](data-table.html) · [llms.txt](../llms.txt)

# Data table

検索・並べ替え・ページ送り・行選択を組み合わせたデータテーブルです。HTMLに書いたデータをブラウザ内で操作し、既存の配色とデザインテーマに対応します。

<a id="data-table-project-example"></a>

## 検索・ソート・ページ送り・行選択

列名を押すと昇順・降順・元の順序へ切り替わります。検索語や表示件数を変えると最初のページに戻ります。予算の表示には円記号と区切り文字を付け、比較には数値を指定しています。

```html
<div class="ui-data-table" id="data-table-projects" data-ui-data-table data-ui-page-size="5">
  <div class="ui-data-table-toolbar" data-ui-table-controls>
    <label class="ui-data-table-search">プロジェクトを検索<input class="form-control" type="search" data-ui-table-search placeholder="名前・状態・担当者" autocomplete="off"></label>
    <label class="ui-data-table-size">表示件数<select class="form-select form-select-sm" data-ui-table-page-size><option value="5">5件</option><option value="10">10件</option><option value="0">すべて</option></select></label>
  </div>
  <div class="ui-table-scroll" tabindex="0" role="region" aria-label="プロジェクト一覧（横スクロール可能）">
    <table class="table table-hover">
      <caption>プロジェクト一覧</caption>
      <thead><tr>
        <th scope="col" class="ui-data-table-check"><input class="form-check-input" type="checkbox" data-ui-table-select-all aria-label="表示中の行をすべて選択"></th>
        <th scope="col"><button class="ui-data-table-sort" type="button" data-ui-table-sort="text">プロジェクト</button></th>
        <th scope="col"><button class="ui-data-table-sort" type="button" data-ui-table-sort="text">状態</button></th>
        <th scope="col"><button class="ui-data-table-sort" type="button" data-ui-table-sort="text">担当者</button></th>
        <th scope="col"><button class="ui-data-table-sort" type="button" data-ui-table-sort="date">更新日</button></th>
        <th scope="col" class="ui-data-table-number"><button class="ui-data-table-sort" type="button" data-ui-table-sort="number">予算</button></th>
      </tr></thead>
      <tbody>
        <tr data-ui-row-id="project-01" data-ui-table-keywords="design catalog ドキュメント">
          <td class="ui-data-table-check" data-ui-table-ignore><input class="form-check-input" type="checkbox" data-ui-row-select aria-label="デザインカタログを選択"></td>
          <td>デザインカタログ</td><td><span class="badge badge-neutral">進行中</span></td><td>蒼井</td>
          <td data-ui-sort-value="2026-10-24"><time datetime="2026-10-24">2026/10/24</time></td>
          <td class="ui-data-table-number" data-ui-sort-value="120000">¥120,000</td>
        </tr>
        <tr data-ui-row-id="project-02" data-ui-table-keywords="">
          <td class="ui-data-table-check" data-ui-table-ignore><input class="form-check-input" type="checkbox" data-ui-row-select aria-label="予約管理を選択"></td>
          <td>予約管理</td><td><span class="badge text-bg-warning">レビュー</span></td><td>森</td>
          <td data-ui-sort-value="2026-10-20"><time datetime="2026-10-20">2026/10/20</time></td>
          <td class="ui-data-table-number" data-ui-sort-value="85000">¥85,000</td>
        </tr>
        <tr data-ui-row-id="project-03" data-ui-table-keywords="">
          <td class="ui-data-table-check" data-ui-table-ignore><input class="form-check-input" type="checkbox" data-ui-row-select aria-label="ヘルプセンターを選択"></td>
          <td>ヘルプセンター</td><td><span class="badge text-bg-success">完了</span></td><td>佐藤</td>
          <td data-ui-sort-value="2026-10-22"><time datetime="2026-10-22">2026/10/22</time></td>
          <td class="ui-data-table-number" data-ui-sort-value="18000">¥18,000</td>
        </tr>
        <tr data-ui-row-id="project-04" data-ui-table-keywords="">
          <td class="ui-data-table-check" data-ui-table-ignore><input class="form-check-input" type="checkbox" data-ui-row-select aria-label="顧客ポータルを選択"></td>
          <td>顧客ポータル</td><td><span class="badge badge-neutral">進行中</span></td><td>伊藤</td>
          <td data-ui-sort-value="2026-10-18"><time datetime="2026-10-18">2026/10/18</time></td>
          <td class="ui-data-table-number" data-ui-sort-value="120000">¥120,000</td>
        </tr>
        <tr data-ui-row-id="project-05" data-ui-table-keywords="">
          <td class="ui-data-table-check" data-ui-table-ignore><input class="form-check-input" type="checkbox" data-ui-row-select aria-label="ファイル共有を選択"></td>
          <td>ファイル共有</td><td><span class="badge badge-neutral">計画中</span></td><td>森</td>
          <td data-ui-sort-value="2026-10-21"><time datetime="2026-10-21">2026/10/21</time></td>
          <td class="ui-data-table-number" data-ui-sort-value="">未設定</td>
        </tr>
        <tr data-ui-row-id="project-06" data-ui-table-keywords="">
          <td class="ui-data-table-check" data-ui-table-ignore><input class="form-check-input" type="checkbox" data-ui-row-select aria-label="分析ダッシュボードを選択"></td>
          <td>分析ダッシュボード</td><td><span class="badge text-bg-success">完了</span></td><td>蒼井</td>
          <td data-ui-sort-value="2026-10-19"><time datetime="2026-10-19">2026/10/19</time></td>
          <td class="ui-data-table-number" data-ui-sort-value="45000">¥45,000</td>
        </tr>
        <tr data-ui-row-id="project-07" data-ui-table-keywords="">
          <td class="ui-data-table-check" data-ui-table-ignore><input class="form-check-input" type="checkbox" data-ui-row-select aria-label="モバイル設定を選択"></td>
          <td>モバイル設定</td><td><span class="badge badge-neutral">計画中</span></td><td>佐藤</td>
          <td data-ui-sort-value="2026-10-23"><time datetime="2026-10-23">2026/10/23</time></td>
          <td class="ui-data-table-number" data-ui-sort-value="36000">¥36,000</td>
        </tr>
        <tr data-ui-row-id="project-08" data-ui-table-keywords="">
          <td class="ui-data-table-check" data-ui-table-ignore><input class="form-check-input" type="checkbox" data-ui-row-select aria-label="通知センターを選択"></td>
          <td>通知センター</td><td><span class="badge badge-neutral">進行中</span></td><td>伊藤</td>
          <td data-ui-sort-value="2026-10-15"><time datetime="2026-10-15">2026/10/15</time></td>
          <td class="ui-data-table-number" data-ui-sort-value="72000">¥72,000</td>
        </tr>
        <tr data-ui-row-id="project-09" data-ui-table-keywords="">
          <td class="ui-data-table-check" data-ui-table-ignore><input class="form-check-input" type="checkbox" data-ui-row-select aria-label="請求管理を選択"></td>
          <td>請求管理</td><td><span class="badge text-bg-warning">レビュー</span></td><td>森</td>
          <td data-ui-sort-value="2026-10-17"><time datetime="2026-10-17">2026/10/17</time></td>
          <td class="ui-data-table-number" data-ui-sort-value="96000">¥96,000</td>
        </tr>
        <tr data-ui-row-id="project-10" data-ui-table-keywords="">
          <td class="ui-data-table-check" data-ui-table-ignore><input class="form-check-input" type="checkbox" data-ui-row-select aria-label="検索機能を選択"></td>
          <td>検索機能</td><td><span class="badge badge-neutral">進行中</span></td><td>蒼井</td>
          <td data-ui-sort-value="2026-10-16"><time datetime="2026-10-16">2026/10/16</time></td>
          <td class="ui-data-table-number" data-ui-sort-value="54000">¥54,000</td>
        </tr>
        <tr data-ui-row-id="project-11" data-ui-table-keywords="">
          <td class="ui-data-table-check" data-ui-table-ignore><input class="form-check-input" type="checkbox" data-ui-row-select aria-label="チーム管理を選択"></td>
          <td>チーム管理</td><td><span class="badge text-bg-success">完了</span></td><td>伊藤</td>
          <td data-ui-sort-value="2026-10-14"><time datetime="2026-10-14">2026/10/14</time></td>
          <td class="ui-data-table-number" data-ui-sort-value="24000">¥24,000</td>
        </tr>
        <tr data-ui-row-id="project-12" data-ui-table-keywords="">
          <td class="ui-data-table-check" data-ui-table-ignore><input class="form-check-input" type="checkbox" data-ui-row-select aria-label="権限設定を選択" disabled></td>
          <td>権限設定</td><td><span class="badge badge-neutral">計画中</span></td><td>佐藤</td>
          <td data-ui-sort-value="2026-10-13"><time datetime="2026-10-13">2026/10/13</time></td>
          <td class="ui-data-table-number" data-ui-sort-value="30000">¥30,000</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="ui-data-table-footer" data-ui-table-controls>
    <div class="ui-data-table-summary"><p data-ui-table-status role="status"></p><p data-ui-table-selection role="status"></p></div>
    <nav class="ui-data-table-pagination" aria-label="プロジェクトのページ送り"><button class="btn btn-sm btn-outline-secondary" type="button" data-ui-table-prev>前へ</button><span data-ui-table-page-status></span><button class="btn btn-sm btn-outline-secondary" type="button" data-ui-table-next>次へ</button></nav>
  </div>
</div>
```

<a id="data-table-selection"></a>

## 選択状態とキーボード操作

ヘッダーのcheckboxは、現在表示している選択可能な行だけを選択・解除します。検索やページ切り替えの後も選択を保持し、一部だけ選択されているときは中間状態を表示します。「権限設定」の行はdisabledの例です。

Tabで検索欄・列名・checkbox・ページボタンへ移動できます。列名はEnter／Space、checkboxはSpaceで操作します。横に長い表は領域へTabで移動し、矢印キーでもスクロールできます。

<a id="data-table-minimal"></a>

## 並べ替えだけを使う

検索欄・表示件数・選択・ページ送りは必要なものだけを置けます。すべての行を表示する場合は`data-ui-page-size="0"`を指定します。ページ内に複数の表を置いても操作は独立します。

```html
<div class="ui-data-table" id="data-table-stock" data-ui-data-table data-ui-page-size="0">
  <div class="ui-table-scroll" tabindex="0" role="region" aria-label="在庫一覧（横スクロール可能）">
    <table class="table"><caption>在庫一覧</caption><thead><tr><th scope="col"><button class="ui-data-table-sort" type="button" data-ui-table-sort="text">商品</button></th><th scope="col" class="ui-data-table-number"><button class="ui-data-table-sort" type="button" data-ui-table-sort="number">在庫数</button></th></tr></thead><tbody>
      <tr><td>ノート</td><td class="ui-data-table-number">10</td></tr><tr><td>ペン</td><td class="ui-data-table-number">2</td></tr><tr><td>カード</td><td class="ui-data-table-number">0</td></tr>
    </tbody></table>
  </div>
</div>
```

<a id="data-table-empty-demo"></a>

## データがない場合

元のデータが0件の場合と、検索結果が0件の場合に空の表示を出します。初期HTMLで`hidden`を指定した行は件数・検索の対象に含めません。

```html
<div class="ui-data-table" id="data-table-empty-demo-root" data-ui-data-table data-ui-table-empty="表示できるデータがありません。"><div class="ui-table-scroll" tabindex="0" role="region" aria-label="空のデータ一覧"><table class="table"><caption>未登録のプロジェクト</caption><thead><tr><th scope="col">名前</th><th scope="col">状態</th></tr></thead><tbody></tbody></table></div><div class="ui-data-table-footer" data-ui-table-controls><p class="type-caption" data-ui-table-status role="status"></p></div></div>
```

<a id="data-table-attributes"></a>

## 属性と設定

| 属性 | 指定方法 |
| --- | --- |
| `data-ui-data-table` | ルートのラッパーへ指定します。最初のtableの最初のtbodyを対象にします。 |
| `data-ui-page-size="5"` | 1ページの件数。省略時は10件、0は全件表示です。 |
| `data-ui-table-search` | 検索欄に指定します。複数の語を空白で区切ると、すべてを含む行を表示します。全角英数字・大文字小文字を揃えて検索します。 |
| `data-ui-table-page-size` | 表示件数のselectに指定します。選択値がルートの件数指定より優先されます。 |
| `data-ui-table-sort="text / number / date"` | th内のbuttonへ指定。昇順→降順→元の順序の順に切り替えます。数値の欠損・無効な値は両方向で末尾に並びます。 |
| `data-ui-sort-value` | tdの表示と比較する値を分けます。数値は120000など、日付は2026-10-24などを指定します。 |
| `data-ui-table-keywords / data-ui-table-ignore` | 行に検索語を追加するか、セルを検索対象から外します。 |
| `data-ui-row-select / data-ui-table-select-all` | 行のcheckboxと、現在ページの一括選択用checkboxへ指定します。disabledの行は選択対象から外れます。 |
| `data-ui-row-id` | 選択イベントへ渡す行の識別子。重複しない値を指定します。省略時はtrのid、どちらもなければ初回登録時の番号を使います。 |
| `data-ui-table-prev / next / first / last` | 前・次・最初・最後のページへ移動するbuttonです。各属性にはdata-ui-table-を付けます。 |
| `data-ui-table-page="2"` | 指定ページへ移動するbuttonに付けます。 |
| `data-ui-table-status / page-status / selection` | 表示件数、ページ番号、選択件数の出力先。各属性にはdata-ui-table-を付けます。 |
| `data-ui-table-empty="説明文"` | ルートへ指定すると、データがない場合の文言を変更できます。 |

ソート用の列は、各行で同じ列順になるように配置してください。データ部分のcolspan／rowspanを使った複雑な表の並べ替えには対応しません。JavaScriptがない場合も、通常の表として行の内容を確認できます。

<a id="data-table-events"></a>

## アプリの処理と組み合わせる

`ui:tablechange`で検索・ソート・ページの状態を取得し、`ui:tableselect`で選択した行のIDと要素を取得できます。sortは未指定時にnull、指定時は0始まりのcolumn・type・directionを返します。pageSizeの0は全件表示です。

```
const table = document.getElementById('data-table-projects');
table.addEventListener('ui:tablechange', event => {
  const { search, page, pageSize, total, filtered, sort } = event.detail;
  console.log({ search, page, pageSize, total, filtered, sort });
});
table.addEventListener('ui:tableselect', event => {
  console.log(event.detail.selected); // ['project-01', ...]
  console.log(event.detail.rows);     // 選択したtr要素
});
```

データの取得・保存・サーバー側の絞り込みはアプリ側で実装します。このコンポーネントはDOM上の行を操作する方式で、仮想スクロールやサーバーページングは含みません。

<a id="data-table-lifecycle"></a>

## 行の更新と後始末

```
const table = document.getElementById('data-table-projects');
// tbodyへ行を追加・削除した後、またはセルの内容を更新した後
KavUI.init(table);
// 表全体のHTMLを作り直す前、またはアンマウント時
KavUI.destroy(table);
```

再初期化では現在の検索・ソート・選択を保ちながら表示を更新します。元の順序は最初に登録したときの並びで、後から追加した行はその後ろに登録されます。破棄すると元の行順・hidden・ARIAを戻します。ユーザーが変更した行のcheckboxの値は保持します。フォームのresetは検索欄・表示件数・選択を初期値に戻し、ソートとページをリセットします。

Vue・Astroでは、既存の`KavWidget`で同じHTMLを利用できます。[パッケージの導入方法](../../packages/README.md)も参照してください。

使用ファイル・取り込み方

共通のui.cssとui.jsを読み込み、必要なサンプルのHTMLを配置します。

```html
<link rel="stylesheet" href="assets/css/ui.css">
<script defer src="assets/js/ui.js"></script>
```

[ダウンロード・導入](../installation.html.md) / [静的なTable](table.html.md) / [ui.css](../../assets/css/ui.css) / [ui.js](../../assets/js/ui.js)
