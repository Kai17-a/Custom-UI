<script setup lang="ts">
import {ref} from 'vue';
import '@kav-ui/core/style.css';
import {KavBadge, KavButton, KavDialog, KavPage, KavPageHeader, KavStack, KavTabs} from '@kav-ui/vue';
const detailTab = ref("overview");
const shareOpen = ref(false);
</script>

<template>
<div data-kav-ui-vue>
<KavPage>
<KavPageHeader eyebrow="木の葉制作室" title="秋の展示会" description="作品と制作の背景を紹介する、チームの共同プロジェクトです。" />
<div class="ui-page-actions"><KavButton type="button" color="primary" variant="outline" @click="shareOpen = true">共有情報</KavButton>
<KavButton href="../list/" color="secondary" variant="outline">一覧へ戻る</KavButton>
</div>

<KavPage rail-label="プロジェクトの補足"><KavTabs v-model="detailTab" label="プロジェクトの詳細" :items="[{'value': 'overview', 'label': '概要'}, {'value': 'history', 'label': '履歴'}]"><template #overview><KavStack><h2>開催概要</h2>
<p>11月の展示に向けて、作品の選定と会場の準備を進めています。</p>
<h3>次の作業</h3>
<p>展示作品の候補を11月10日までに集めます。</p>
</KavStack></template>
<template #history><KavStack><h2>更新履歴</h2>
<p><time datetime="2026-11-02">11月2日</time>
：展示のテーマを決めました。</p>
</KavStack></template>
</KavTabs>
<template #rail><div><h2 class="ui-aside-title">担当と期限</h2>
<dl><dt>担当</dt>
<dd>制作チーム</dd>
<dt>期限</dt>
<dd><time datetime="2026-11-20">2026年11月20日</time>
</dd>
</dl>
<KavBadge color="success">進行中</KavBadge>
</div>
</template></KavPage>

<KavDialog v-model="shareOpen" label="共有情報"><h2>共有する前に</h2>
<p>この画面はチーム内限定です。共有URLの発行と権限設定はアプリ側で接続してください。</p>
<KavButton type="button" color="primary" @click="shareOpen = false">閉じる</KavButton>
</KavDialog>

</KavPage>

</div>
</template>
