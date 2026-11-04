<script setup lang="ts">
import "@kav-ui/core/style.css";
import { KavButton, KavPage, KavPageHeader, KavWidget } from "@kav-ui/vue";
// 開発者が管理する固定HTML。利用者の入力を連結しない。
const fileDropMarkup = `
  <div
    class="ui-file-drop"
    data-ui-file-drop
    data-ui-max-size="5242880"
    data-ui-max-files="5"
  >
    <input
      class="form-control"
      type="file"
      id="attachments"
      name="attachments"
      accept="image/*,.pdf"
      multiple
    />
    <label class="ui-file-dropzone" data-ui-file-zone for="attachments">
      <strong>ファイルをドロップ、または選択</strong>
      <span class="ui-file-hint">画像・PDF / 1件5MB、最大5件</span>
    </label>
  </div>
`;
</script>

<template>
  <KavPage>
    <KavPageHeader
      eyebrow="木の葉制作室"
      title="共有ファイル"
      description="資料を選択して内容を確認できます。選択したファイルはまだアップロードされません。"
    />
    <form class="ui-stack" enctype="multipart/form-data" @submit.prevent>
      <KavWidget :html="fileDropMarkup" />
      <p>通信とサーバー側の検証はアプリ側で接続します。</p>
      <KavButton type="submit" color="primary">選択したファイルを送信</KavButton>
    </form>

    <KavPage rail-label="選択したファイルのプレビュー">
      <h2>ファイル一覧</h2>
      <ul class="list-group">
        <li class="list-group-item">
          <a href="#file-preview">会場メモ.txt</a>
          <p class="type-caption">2KB · 11月3日更新</p>
        </li>
        <li class="list-group-item">
          <p>案内状.pdf</p>
          <p class="type-caption">420KB · プレビュー未生成</p>
        </li>
      </ul>
      <template #rail>
        <div id="file-preview">
          <h2 class="ui-aside-title">会場メモ.txt</h2>
          <p>入口付近に案内を配置。作品の間隔は現地で確認します。</p>
          <p class="type-caption">テキストプレビューの例</p>
        </div>
      </template>
    </KavPage>
  </KavPage>
</template>
