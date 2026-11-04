<script setup lang="ts">
import "@kav-ui/core/style.css";
import {
  KavButton,
  KavCard,
  KavGrid,
  KavPage,
  KavPageHeader,
  KavStack,
} from "@kav-ui/vue";
</script>

<template>
  <KavPage>
    <KavPageHeader
      eyebrow="木の葉制作室"
      title="チームに合うプラン"
      description="月額料金は税込の架空の例です。契約と決済はアプリ側で接続します。"
    />
    <KavGrid cols="auto">
      <KavCard>
        <KavStack>
          <h2 class="ui-card-title">個人</h2>
          <p class="ui-card-stat">
            ¥0
            <small>/ 月</small>
          </p>
          <ul>
            <li>メンバー1名</li>
            <li>容量1GB</li>
            <li>メールサポート</li>
          </ul>
          <KavButton href="../auth/" color="primary" variant="outline">個人で登録へ進む</KavButton>
        </KavStack>
      </KavCard>
      <KavCard>
        <KavStack>
          <h2 class="ui-card-title">制作チーム</h2>
          <p class="ui-card-stat">
            ¥1,800
            <small>/ 月</small>
          </p>
          <ul>
            <li>メンバー10名</li>
            <li>容量50GB</li>
            <li>メールサポート</li>
          </ul>
          <KavButton href="../auth/" color="primary" variant="outline">制作チームで登録へ進む</KavButton>
        </KavStack>
      </KavCard>
      <KavCard>
        <KavStack>
          <h2 class="ui-card-title">制作室</h2>
          <p class="ui-card-stat">
            ¥4,800
            <small>/ 月</small>
          </p>
          <ul>
            <li>メンバー30名</li>
            <li>容量200GB</li>
            <li>メールサポート</li>
          </ul>
          <KavButton href="../auth/" color="primary" variant="outline">制作室で登録へ進む</KavButton>
        </KavStack>
      </KavCard>
    </KavGrid>
  </KavPage>
</template>
