<script setup lang="ts">
import {ref} from 'vue';
import '@kav-ui/core/style.css';
import {KavPage, KavPageHeader, KavStack, KavTabs} from '@kav-ui/vue';
const notificationFilter = ref("all");
</script>

<template>
<div data-kav-ui-vue>
<KavPage>
<KavPageHeader eyebrow="木の葉制作室" title="通知" description="作業に関するお知らせを未読・既読で確認します。" />
<KavTabs v-model="notificationFilter" label="通知の絞り込み" :items="[{'value': 'all', 'label': 'すべて'}, {'value': 'unread', 'label': '未読（2）'}, {'value': 'read', 'label': '既読'}]"><template #all><KavStack><h2>すべての通知</h2>
<ul class="list-group"><li class="list-group-item"><h3>未読：展示案へのコメント</h3>
<p>制作チームから展示案の確認依頼が届きました。</p>
<p class="type-caption"><time datetime="2026-11-04T09:00:00+09:00">11月4日 9:00</time>
</p>
<a href="../detail/">関連プロジェクトを見る</a>
</li>
<li class="list-group-item"><h3>未読：締め切りのお知らせ</h3>
<p>案内状の確認期限は明日です。</p>
<p class="type-caption"><time datetime="2026-11-04T09:00:00+09:00">11月4日 9:00</time>
</p>
<a href="../detail/">関連プロジェクトを見る</a>
</li>
<li class="list-group-item"><h3>既読：資料の共有</h3>
<p>会場の資料が共有されました。</p>
<p class="type-caption"><time datetime="2026-11-04T09:00:00+09:00">11月4日 9:00</time>
</p>
<a href="../detail/">関連プロジェクトを見る</a>
</li>
</ul>
</KavStack></template>
<template #unread><KavStack><h2>未読の通知</h2>
<ul class="list-group"><li class="list-group-item"><h3>未読：展示案へのコメント</h3>
<p>制作チームから展示案の確認依頼が届きました。</p>
<p class="type-caption"><time datetime="2026-11-04T09:00:00+09:00">11月4日 9:00</time>
</p>
<a href="../detail/">関連プロジェクトを見る</a>
</li>
<li class="list-group-item"><h3>未読：締め切りのお知らせ</h3>
<p>案内状の確認期限は明日です。</p>
<p class="type-caption"><time datetime="2026-11-04T09:00:00+09:00">11月4日 9:00</time>
</p>
<a href="../detail/">関連プロジェクトを見る</a>
</li>
</ul>
</KavStack></template>
<template #read><KavStack><h2>既読の通知</h2>
<ul class="list-group"><li class="list-group-item"><h3>既読：資料の共有</h3>
<p>会場の資料が共有されました。</p>
<p class="type-caption"><time datetime="2026-11-04T09:00:00+09:00">11月4日 9:00</time>
</p>
<a href="../detail/">関連プロジェクトを見る</a>
</li>
</ul>
</KavStack></template>
</KavTabs>

</KavPage>

</div>
</template>
