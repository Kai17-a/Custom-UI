<script setup lang="ts">
import { nextTick, ref } from "vue";
import "@kav-ui/core/style.css";
import {
  KavButton,
  KavCluster,
  KavField,
  KavInput,
  KavPage,
  KavPageHeader,
  KavStack,
  KavTabs,
} from "@kav-ui/vue";
const step = ref("request-input");
const requestTitle = ref("展示会の案内状");
const requestDate = ref("2026-11-20");
const stepOrder = ["request-input", "request-schedule", "request-confirm"];
const stepFields: Record<string, string> = {
  "request-input": "request-title",
  "request-schedule": "request-date",
};
async function goToStep(value: string) {
  // 先の手順へ進むときは、今の手順の必須入力を送信時と同じ方法で確かめます。
  if (stepOrder.indexOf(value) > stepOrder.indexOf(step.value)) {
    const input = document.querySelector<HTMLInputElement>("#" + stepFields[step.value]);
    if (input && !validateField(input)) {
      input.focus();
      return;
    }
  }
  step.value = value;
  await nextTick();
  document.querySelector<HTMLElement>("#" + value + "-heading")?.focus();
}
async function revealInvalid(target: HTMLInputElement) {
  step.value = target.id === "request-date" ? "request-schedule" : "request-input";
  await nextTick();
  target.focus();
}

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
  if (firstInvalid) await revealInvalid(firstInvalid);
}
</script>

<template>
  <KavPage>
    <KavPageHeader
      eyebrow="木の葉制作室"
      title="制作依頼を作成"
      description="入力・予定・確認の順に進めます。タブは矢印キーでも移動できます。"
    />

    <form novalidate
      id="request-form"
      class="ui-stack"
      @submit.prevent="validateForm"
      @input="updateValidation"
      @change="updateValidation"
      @reset="errors = {}"
    >
      <KavTabs
        v-model="step"
        label="依頼の手順"
        :items="[
          { value: 'request-input', label: '1. 基本情報' },
          { value: 'request-schedule', label: '2. 予定' },
          { value: 'request-confirm', label: '3. 確認' },
        ]"
      >
        <template #request-input>
          <KavStack>
            <h2 id="request-input-heading" tabindex="-1">基本情報</h2>
            <KavField label="依頼名" for="request-title" :error="errors['request-title']">
              <KavInput
                :aria-invalid="errors['request-title'] ? 'true' : undefined"
                :aria-describedby="errors['request-title'] ? 'request-title-error' : undefined"
                id="request-title"
                name="request-title"
                autocomplete="off"
                type="text"
                required
                maxlength="80"
                v-model="requestTitle"
              />
            </KavField>
            <KavCluster>
              <KavButton
                type="button"
                color="primary"
                @click="goToStep('request-schedule')"
              >次へ</KavButton>
            </KavCluster>
          </KavStack>
        </template>
        <template #request-schedule>
          <KavStack>
            <h2 id="request-schedule-heading" tabindex="-1">予定</h2>
            <KavField label="希望日" for="request-date" :error="errors['request-date']">
              <KavInput
                :aria-invalid="errors['request-date'] ? 'true' : undefined"
                :aria-describedby="errors['request-date'] ? 'request-date-error' : undefined"
                id="request-date"
                name="request-date"
                autocomplete="off"
                type="date"
                required
                v-model="requestDate"
              />
            </KavField>
            <KavCluster>
              <KavButton
                type="button"
                variant="outline"
                color="secondary"
                @click="goToStep('request-input')"
              >戻る</KavButton>
              <KavButton
                type="button"
                color="primary"
                @click="goToStep('request-confirm')"
              >次へ</KavButton>
            </KavCluster>
          </KavStack>
        </template>
        <template #request-confirm>
          <KavStack>
            <h2 id="request-confirm-heading" tabindex="-1">入力内容の確認</h2>
            <dl>
              <dt>依頼名</dt>
              <dd>
                <output id="confirm-title" for="request-title">{{ requestTitle }}</output>
              </dd>
              <dt>希望日</dt>
              <dd>
                <output id="confirm-date" for="request-date">{{ requestDate }}</output>
              </dd>
            </dl>
            <p>修正する場合は前のタブへ戻ってください。送信処理はアプリ側で接続します。</p>
            <KavCluster>
              <KavButton
                type="button"
                variant="outline"
                color="secondary"
                @click="goToStep('request-schedule')"
              >戻る</KavButton>
              <KavButton type="submit" color="primary">この内容で依頼する</KavButton>
            </KavCluster>
          </KavStack>
        </template>
      </KavTabs>
    </form>
  </KavPage>
</template>
