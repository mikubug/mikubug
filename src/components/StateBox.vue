<script setup>
/** 状态提示:空列表 / 加载失败 / 无匹配 */
defineProps({
  code: { type: String, default: '// EMPTY' },
  text: { type: String, default: '' },
});
</script>

<template>
  <div class="state">
    <span class="state-code">{{ code }}</span>
    <span>{{ text }}</span>
  </div>
</template>
