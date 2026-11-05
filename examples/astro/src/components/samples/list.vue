<script setup lang="ts">
import "@kav-ui/core/style.css";
import { KavPage, KavPageHeader, KavWidget } from "@kav-ui/vue";
// 開発者が管理する固定HTML。利用者の入力を連結しない。
const tableMarkup = `
  <div class="ui-data-table" data-ui-data-table data-ui-page-size="3">
    <div class="ui-data-table-toolbar">
      <label class="ui-data-table-search" for="project-search">名前・状態で絞り込み
        <input
          class="form-control"
          id="project-search"
          name="query"
          type="search"
          data-ui-table-search
          placeholder="例：進行中"
        />
      </label>
      <label class="ui-data-table-size fx-self-end" for="project-size">表示件数
        <select class="form-select" id="project-size" data-ui-table-page-size>
          <option value="3">3件</option>
          <option value="10">10件</option>
        </select>
      </label>
    </div>
    <div
      class="ui-table-scroll"
      tabindex="0"
      role="region"
      aria-label="プロジェクト一覧"
    >
      <table class="table">
        <caption>制作プロジェクト</caption>
        <thead>
          <tr>
            <th scope="col">
              <button
                class="ui-data-table-sort"
                type="button"
                data-ui-table-sort="text"
              >名前</button>
            </th>
            <th scope="col">状態</th>
            <th scope="col">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr data-ui-row-id="project-0">
            <td>秋の展示会</td>
            <td><span class="badge badge-neutral">進行中</span></td>
            <td>
              <a href="../detail/">詳細を見る</a>
            </td>
          </tr>
          <tr data-ui-row-id="project-1">
            <td>資料アーカイブ</td>
            <td><span class="badge text-bg-success">完了</span></td>
            <td>
              <a href="../detail/">詳細を見る</a>
            </td>
          </tr>
          <tr data-ui-row-id="project-2">
            <td>冬の案内状</td>
            <td><span class="badge badge-neutral">準備中</span></td>
            <td>
              <a href="../detail/">詳細を見る</a>
            </td>
          </tr>
          <tr data-ui-row-id="project-3">
            <td>作品撮影</td>
            <td><span class="badge badge-neutral">進行中</span></td>
            <td>
              <a href="../detail/">詳細を見る</a>
            </td>
          </tr>
          <tr data-ui-row-id="project-4">
            <td>会場レイアウト</td>
            <td><span class="badge badge-neutral">準備中</span></td>
            <td>
              <a href="../detail/">詳細を見る</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="ui-data-table-footer">
      <p class="ui-data-table-summary" data-ui-table-status role="status"></p>
      <nav class="ui-data-table-pagination" aria-label="プロジェクトのページ送り">
        <button class="btn btn-outline-secondary" type="button" data-ui-table-prev>前へ</button>
        <span data-ui-table-page-status></span>
        <button class="btn btn-outline-secondary" type="button" data-ui-table-next>次へ</button>
      </nav>
    </div>
  </div>
`;
</script>

<template>
  <KavPage>
    <KavPageHeader
      eyebrow="木の葉制作室"
      title="プロジェクト一覧"
      description="名前や状態（進行中・完了・準備中）を入力して絞り込めます。"
    />
    <KavWidget :html="tableMarkup" />
  </KavPage>
</template>
