<script setup lang="ts">
import {ref} from 'vue';
import '@kav-ui/core/style.css';
import {KavButton, KavCluster, KavField, KavPage, KavPageHeader, KavTextarea} from '@kav-ui/vue';
const draft = ref("");
const messages = ref<string[]>([]);
function sendMessage() { const text = draft.value.trim(); if (!text) return; messages.value.push(text); draft.value = ''; }
</script>

<template>
<div data-kav-ui-vue>
<KavPage>
<KavPageHeader eyebrow="木の葉制作室" title="制作アシスタント" description="回答は例示です。モデルへの接続と送信処理はアプリ側で接続します。" />
<section class="ui-ai ui-stack" aria-label="会話履歴" aria-live="polite"><article class="ui-ai-message"><h2>あなた</h2>
<p>展示会の案内状に必要な情報を整理して。</p>
</article>
<article class="ui-ai-message"><h2>アシスタント</h2>
<p>開催日時、会場、展示のテーマ、問い合わせ先を揃えましょう。</p>
<ul><li>開催日：11月20日</li>
<li>テーマ：日々の発見</li>
<li>会場：チームで確認してください</li>
</ul>
<details class="ui-ai-disclosure"><summary>回答の根拠と確認事項</summary>
<p>この会話に記載された内容だけを参照しています。開催場所は未確認です。</p>
</details>
</article>
<article v-for="(message, index) in messages" :key="index" class="ui-ai-message"><h2>あなた</h2><p>{{ message }}</p></article></section>
<form class="ui-stack" @submit.prevent="sendMessage"><KavField label="メッセージ" for="chat-message"><KavTextarea id="chat-message" name="message" rows="3" required placeholder="次に整理したいことを入力" v-model="draft" /></KavField>
<p class="type-caption">個人情報や秘密情報は入力しないでください。</p>
<KavCluster><KavButton type="submit" color="primary">送信</KavButton>
</KavCluster>
</form>

</KavPage>

</div>
</template>
