<script setup>
/** 标签胶囊组 */
defineProps({
  tags: { type: Array, default: () => [] },
  chipClass: { type: String, default: 'chip' },
});
</script>

<template>
  <div class="chips">
    <span v-for="t in tags" :key="t" class="mono" :class="chipClass">{{ t }}</span>
  </div>
</template>
