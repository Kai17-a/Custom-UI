<script setup lang="ts">
import '@kav-ui/core/style.css';
import {KavCard, KavCluster, KavGrid, KavPage, KavPageHeader, KavSection, KavStack} from '@kav-ui/vue';

</script>

<template>
<div data-kav-ui-vue>
<KavPage>
<KavPageHeader eyebrow="木の葉制作室" title="こもれび" description="架空の制作メンバーのプロフィールです。" />
<KavCluster><span class="ui-avatar" aria-hidden="true">こ</span>
<p>展示企画・編集担当。日々の小さな発見を作品にしています。</p>
</KavCluster>
<KavSection title="活動の集計"><KavGrid cols="auto"><KavCard><KavStack><h3 class="ui-card-title">参加プロジェクト</h3>
<p class="ui-card-stat">4件</p>
</KavStack>
</KavCard>
<KavCard><KavStack><h3 class="ui-card-title">完了タスク</h3>
<p class="ui-card-stat">18件</p>
</KavStack>
</KavCard>
</KavGrid>
</KavSection>
<KavSection title="最近の活動"><ol class="ui-timeline" role="list" aria-label="活動履歴"><li class="ui-timeline-item"><span class="ui-timeline-marker" aria-hidden="true"></span>
<div class="ui-timeline-content"><time class="ui-timeline-date" datetime="2026-11-03">11月3日</time>
<h3 class="ui-timeline-title">展示案を更新</h3>
<p>チームの意見を反映しました。</p>
</div>
</li>
<li class="ui-timeline-item"><span class="ui-timeline-marker" aria-hidden="true"></span>
<div class="ui-timeline-content"><time class="ui-timeline-date" datetime="2026-11-02">11月2日</time>
<h3 class="ui-timeline-title">資料を共有</h3>
<p>会場の下見資料をまとめました。</p>
</div>
</li>
</ol>
</KavSection>

</KavPage>

</div>
</template>
