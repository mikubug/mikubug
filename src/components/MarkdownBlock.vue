<script setup>
/** Markdown 渲染块 —— md.js 已做 HTML 转义,可安全 v-html */
import { computed } from 'vue';
import { renderMarkdown } from '../lib/md';

const props = defineProps({
  source: { type: String, default: '' },
});

const html = computed(() => renderMarkdown(props.source));
</script>

<template>
  <div class="md" v-html="html"></div>
</template>
