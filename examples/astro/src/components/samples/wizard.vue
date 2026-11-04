<script setup lang="ts">
import {ref} from 'vue';
import '@kav-ui/core/style.css';
import {KavButton, KavField, KavInput, KavPage, KavPageHeader, KavStack, KavTabs} from '@kav-ui/vue';
const step = ref("request-input");
const requestTitle = ref("展示会の案内状");
const requestDate = ref("2026-11-20");
function revealInvalid(event: Event) { const target = event.target as HTMLInputElement; step.value = target.id === 'request-date' ? 'request-schedule' : 'request-input'; }
</script>

<template>
<div data-kav-ui-vue>
<KavPage>
<KavPageHeader eyebrow="木の葉制作室" title="制作依頼を作成" description="入力・予定・確認の順に進めます。タブは矢印キーでも移動できます。" />

<form id="request-form" @invalid.capture="revealInvalid" class="ui-stack" @submit.prevent><KavTabs v-model="step" label="依頼の手順" :items="[{'value': 'request-input', 'label': '1. 基本情報'}, {'value': 'request-schedule', 'label': '2. 予定'}, {'value': 'request-confirm', 'label': '3. 確認'}]"><template #request-input><KavStack><h2>基本情報</h2>
<KavField label="依頼名" for="request-title"><KavInput id="request-title" name="request-title" type="text" required maxlength="80" v-model="requestTitle" /></KavField>
</KavStack></template>
<template #request-schedule><KavStack><h2>予定</h2>
<KavField label="希望日" for="request-date"><KavInput id="request-date" name="request-date" type="date" required v-model="requestDate" /></KavField>
</KavStack></template>
<template #request-confirm><KavStack><h2>入力内容の確認</h2>
<dl><dt>依頼名</dt>
<dd><output id="confirm-title" for="request-title">{{ requestTitle }}</output>
</dd>
<dt>希望日</dt>
<dd><output id="confirm-date" for="request-date">{{ requestDate }}</output>
</dd>
</dl>
<p>修正する場合は前のタブへ戻ってください。送信処理はアプリ側で接続します。</p>
<KavButton type="submit" color="primary">この内容で依頼する</KavButton>
</KavStack></template>
</KavTabs>
</form>


</KavPage>

</div>
</template>
