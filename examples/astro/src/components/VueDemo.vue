<script setup>
import {ref} from 'vue';
import {KavInput,KavSelect,KavButton,KavDialog} from '@kav-ui/vue';
const value=ref('AstroのVueアイランド'),open=ref(false),plan=ref(1);
</script>
<template><section data-kav-ui-vue data-testid="astro-vue"><h2>Vue版をAstroで利用</h2><KavInput v-model="value" aria-label="アイランドの入力"/><output>{{ value }}</output><KavSelect v-model="plan" label="Vueアイランドのプラン" :options="[{value:1,label:'個人'},{value:2,label:'チーム'}]"/><KavButton @click="open=true">確認する</KavButton><KavDialog v-model="open" title="Vueアイランド"><p>{{ value }}</p><KavButton @click="open=false">閉じる</KavButton></KavDialog></section></template>
