<script setup lang="ts">
import { ref } from "vue";
import "@kav-ui/core/style.css";
import {
  KavButton,
  KavWidget,
  KavCheckbox,
  KavCluster,
  KavField,
  KavInput,
  KavPage,
  KavPageHeader,
  KavSection,
  KavSwitch,
} from "@kav-ui/vue";
const workspaceName = ref("木の葉制作室");
const contactEmail = ref("team@example.com");
const weeklyReport = ref(true);
const mentions = ref(true);
</script>

<template>
  <KavPage>
    <KavPageHeader
      eyebrow="木の葉制作室"
      title="ワークスペース設定"
      description="チームの基本情報と通知の受け取り方を変更します。"
    />
    <!-- 共有ランタイムのフォーム検証を読み込みます。 -->
    <KavWidget html="" class="visually-hidden" />
    <form data-ui-validate novalidate class="ui-stack" @submit.prevent>
      <KavSection class="ui-stack" title="基本情報">
        <KavField label="ワークスペース名" for="workspace-name">
          <KavInput
            id="workspace-name"
            name="workspace-name"
            type="text"
            required
            maxlength="80"
            v-model="workspaceName"
          />
        </KavField>
        <KavField label="連絡先メール" for="contact-email">
          <KavInput
            id="contact-email"
            name="contact-email"
            type="email"
            required
            autocomplete="email"
            v-model="contactEmail"
          />
        </KavField>
      </KavSection>

      <KavSection class="ui-stack" title="通知">
        <KavCheckbox
          class="form-check-input-lg sp-me-2"
          name="weekly-report"
          label="週次レポートをメールで受け取る"
          v-model="weeklyReport"
        />
        <KavSwitch
          class="sp-m-0"
          role="switch"
          name="mentions"
          label="メンションを通知する"
          v-model="mentions"
        />
      </KavSection>

      <KavCluster>
        <KavButton type="submit" color="primary">変更を保存</KavButton>
        <KavButton type="reset" color="secondary" variant="outline">変更を取り消す</KavButton>
      </KavCluster>
    </form>
  </KavPage>
</template>
