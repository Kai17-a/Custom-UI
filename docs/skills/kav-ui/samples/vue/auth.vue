<script setup lang="ts">
import { ref } from "vue";
import "@kav-ui/core/style.css";
import {
  KavButton,
  KavField,
  KavInput,
  KavPage,
  KavPageHeader,
  KavStack,
  KavTabs,
} from "@kav-ui/vue";
const accountTab = ref("signin");
const loginEmail = ref("");
const loginPassword = ref("");
const displayName = ref("");
const signupEmail = ref("");
const signupPassword = ref("");
</script>

<template>
  <KavPage>
    <KavPageHeader
      eyebrow="木の葉制作室"
      title="チームへようこそ"
      description="木の葉制作室の作業スペースにアクセスします。"
    />
    <KavTabs
      v-model="accountTab"
      label="アカウント"
      :items="[
        { value: 'signin', label: 'ログイン' },
        { value: 'signup', label: '新規登録' },
      ]"
    >
      <template #signin>
        <KavStack>
          <h2>ログイン</h2>
          <form class="ui-stack" @submit.prevent>
            <KavField label="メールアドレス" for="login-email">
              <KavInput
                id="login-email"
                name="login-email"
                type="email"
                required
                autocomplete="username"
                v-model="loginEmail"
              />
            </KavField>
            <KavField label="パスワード" for="login-password">
              <KavInput
                id="login-password"
                name="login-password"
                type="password"
                required
                autocomplete="current-password"
                v-model="loginPassword"
              />
            </KavField>
            <KavButton type="submit" color="primary">ログイン</KavButton>
          </form>
        </KavStack>
      </template>
      <template #signup>
        <KavStack>
          <h2>新規登録</h2>
          <form class="ui-stack" @submit.prevent>
            <KavField label="表示名" for="signup-name">
              <KavInput
                id="signup-name"
                name="signup-name"
                type="text"
                required
                autocomplete="nickname"
                v-model="displayName"
              />
            </KavField>
            <KavField label="メールアドレス" for="signup-email">
              <KavInput
                id="signup-email"
                name="signup-email"
                type="email"
                required
                autocomplete="email"
                v-model="signupEmail"
              />
            </KavField>
            <KavField label="パスワード（12文字以上）" for="signup-password">
              <KavInput
                id="signup-password"
                name="signup-password"
                type="password"
                required
                minlength="12"
                autocomplete="new-password"
                v-model="signupPassword"
              />
            </KavField>
            <KavButton type="submit" color="primary">アカウントを作成</KavButton>
          </form>
        </KavStack>
      </template>
    </KavTabs>
  </KavPage>
</template>
