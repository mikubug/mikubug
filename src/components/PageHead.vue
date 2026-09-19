<script setup>
/** 页面标题区:kicker / 大标题 / 描述 / 分隔线,自带错峰进场 */
defineProps({
  kicker: { type: String, required: true },
  title: { type: String, required: true },
  desc: { type: String, default: '' },
});
</script>

<template>
  <p v-reveal class="kicker mono">{{ kicker }}</p>
  <h1 v-reveal="70" class="page-title">{{ title }}</h1>
  <p v-if="desc" v-reveal="130" class="page-desc">{{ desc }}</p>
  <hr v-reveal="180" class="rule" />
</template>
