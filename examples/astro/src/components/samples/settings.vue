<script setup lang="ts">
import { nextTick, ref } from "vue";
import "@kav-ui/core/style.css";
import {
  KavButton,
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

// Vue owns the validation state; native constraints remain the source of truth.
const errors = ref<Record<string, string>>({});
function validateField(input: HTMLInputElement) {
  const validity = input.validity;
  errors.value[input.id] = validity.valid ? ""
    : validity.valueMissing ? "このフィールドを入力してください。"
    : validity.typeMismatch ? "メールアドレスを正しい形式で入力してください。"
    : validity.tooLong ? `${input.maxLength}文字以内で入力してください。`
    : "有効な値を入力してください。";
  return validity.valid;
}
function updateValidation(event: Event) {
  const input = event.target;
  if (input instanceof HTMLInputElement && errors.value[input.id]) validateField(input);
}
async function validateForm(event: Event) {
  const form = event.currentTarget as HTMLFormElement;
  let firstInvalid: HTMLInputElement | undefined;
  for (const input of form.querySelectorAll<HTMLInputElement>("input[required]")) {
    if (!validateField(input) && !firstInvalid) firstInvalid = input;
  }
  await nextTick();
  firstInvalid?.focus();
}
</script>

<template>
  <KavPage>
    <KavPageHeader
      eyebrow="木の葉制作室"
      title="ワークスペース設定"
      description="チームの基本情報と通知の受け取り方を変更します。"
    />
    <form
      novalidate
      class="ui-stack"
      @submit.prevent="validateForm"
      @input="updateValidation"
      @change="updateValidation"
      @reset="errors = {}"
    >
      <KavSection class="ui-stack" title="基本情報">
        <KavField label="ワークスペース名" for="workspace-name" :error="errors['workspace-name']">
          <KavInput
            :aria-invalid="errors['workspace-name'] ? 'true' : undefined"
            :aria-describedby="errors['workspace-name'] ? 'workspace-name-error' : undefined"
            id="workspace-name"
            name="workspace-name"
            type="text"
            required
            maxlength="80"
            v-model="workspaceName"
          />
        </KavField>
        <KavField label="連絡先メール" for="contact-email" :error="errors['contact-email']">
          <KavInput
            :aria-invalid="errors['contact-email'] ? 'true' : undefined"
            :aria-describedby="errors['contact-email'] ? 'contact-email-error' : undefined"
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
