<script setup lang="ts">
import { ref } from "vue";
import "@kav-ui/core/style.css";
import {
  KavButton,
  KavCard,
  KavCheckbox,
  KavPage,
  KavPageHeader,
  KavSection,
  KavStack,
} from "@kav-ui/vue";
const workspaceReady = ref(true);
const rolesReady = ref(false);
const projectReady = ref(false);
</script>

<template>
  <KavPage>
    <KavPageHeader
      eyebrow="木の葉制作室"
      title="制作を始めましょう"
      description="最初のプロジェクトを作るまでの準備を案内します。チェックの保存はアプリ側で接続します。"
    />
    <KavSection class="ui-stack" title="準備チェックリスト">
      <p>チェックを付けながら、チームの準備を進めてください。</p>
      <KavCheckbox
        name="setup-0"
        label="ワークスペース名を決める"
        v-model="workspaceReady"
      />
      <KavCheckbox
        name="setup-1"
        label="メンバーと役割を相談する"
        v-model="rolesReady"
      />
      <KavCheckbox
        name="setup-2"
        label="最初のプロジェクトを作る"
        v-model="projectReady"
      />
    </KavSection>
    <KavCard>
      <KavStack>
        <h2 class="ui-card-title">プロジェクトはまだありません</h2>
        <p>目的と期限を決めて、制作を始めましょう。</p>
        <KavButton href="../wizard/" color="primary">最初のプロジェクトを作成</KavButton>
      </KavStack>
    </KavCard>
    <KavCard>
      <KavStack>
        <h2 class="ui-card-title">通知はまだありません</h2>
        <p>プロジェクトの更新や確認依頼が届くと、ここに表示されます。</p>
        <a href="../settings/">通知設定を確認する</a>
      </KavStack>
    </KavCard>
  </KavPage>
</template>
