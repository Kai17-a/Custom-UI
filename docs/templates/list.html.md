<!-- Generated from docs/templates/list.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](list.html) · [llms.txt](../llms.txt)

木の葉制作室

# プロジェクト一覧

名前や状態（進行中・完了・準備中）を入力して絞り込めます。

名前・状態で絞り込み

表示件数

3件

10件

制作プロジェクト

| 名前 | 状態 | 操作 |
| --- | --- | --- |
| 秋の展示会 | 進行中 | [詳細を見る](detail.html.md) |
| 資料アーカイブ | 完了 | [詳細を見る](detail.html.md) |
| 冬の案内状 | 準備中 | [詳細を見る](detail.html.md) |
| 作品撮影 | 進行中 | [詳細を見る](detail.html.md) |
| 会場レイアウト | 準備中 | [詳細を見る](detail.html.md) |

前へ

次へ

## コピー用HTML（共通ui.css / ui.jsを使用）

```
<div class="ui-page">
  <div class="ui-page-body">
    <header class="ui-page-header">
      <div class="ui-page-heading">
        <p class="ui-page-eyebrow">木の葉制作室</p>
        <h1 class="ui-page-title">プロジェクト一覧</h1>
        <p class="ui-page-description">名前や状態（進行中・完了・準備中）を入力して絞り込めます。</p>
      </div>
    </header>
    <div class="ui-data-table" data-ui-data-table data-ui-page-size="3">
      <div class="ui-data-table-toolbar">
        <label class="ui-data-table-search" for="project-search">名前・状態で絞り込み
          <input class="form-control" id="project-search" name="query" type="search" autocomplete="off" data-ui-table-search placeholder="例：進行中">
        </label>
        <label class="ui-data-table-size fx-self-end" for="project-size">表示件数
          <select class="form-select" id="project-size" data-ui-table-page-size>
            <option value="3">3件</option>
            <option value="10">10件</option>
          </select>
        </label>
      </div>
      <div class="ui-table-scroll" tabindex="0" role="region" aria-label="プロジェクト一覧">
        <table class="table">
          <caption>制作プロジェクト</caption>
          <thead>
            <tr>
              <th scope="col">
                <button class="ui-data-table-sort" type="button" data-ui-table-sort="text">名前</button>
              </th>
              <th scope="col">状態</th>
              <th scope="col">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr data-ui-row-id="project-0">
              <td>秋の展示会</td>
              <td><span class="badge badge-neutral">進行中</span></td>
              <td><a href="detail.html">詳細を見る</a></td>
            </tr>
            <tr data-ui-row-id="project-1">
              <td>資料アーカイブ</td>
              <td><span class="badge text-bg-success">完了</span></td>
              <td><a href="detail.html">詳細を見る</a></td>
            </tr>
            <tr data-ui-row-id="project-2">
              <td>冬の案内状</td>
              <td><span class="badge badge-neutral">準備中</span></td>
              <td><a href="detail.html">詳細を見る</a></td>
            </tr>
            <tr data-ui-row-id="project-3">
              <td>作品撮影</td>
              <td><span class="badge badge-neutral">進行中</span></td>
              <td><a href="detail.html">詳細を見る</a></td>
            </tr>
            <tr data-ui-row-id="project-4">
              <td>会場レイアウト</td>
              <td><span class="badge badge-neutral">準備中</span></td>
              <td><a href="detail.html">詳細を見る</a></td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- 0件時の行はData tableが自動表示します。 -->
      <div class="ui-data-table-footer">
        <p class="ui-data-table-summary" data-ui-table-status role="status"></p>
        <nav class="ui-data-table-pagination" aria-label="プロジェクトのページ送り">
          <button class="btn btn-outline-secondary" type="button" data-ui-table-prev>前へ</button>
          <span data-ui-table-page-status></span>
          <button class="btn btn-outline-secondary" type="button" data-ui-table-next>次へ</button>
        </nav>
      </div>
    </div>
  </div>
</div>
```
