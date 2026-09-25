<script setup>
/** 加载指示器 —— 三个脉冲圆点，label 可选（补一行等宽小字） */
defineProps({
  label: { type: String, default: '' },
});
</script>

<template>
  <div class="loading-wrap" role="status" aria-label="加载中">
    <div class="loading">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
    <p v-if="label" class="loading-label mono">{{ label }}</p>
  </div>
</template>

<style scoped>
.loading-wrap {
  display: grid;
  justify-items: center;
  gap: var(--spacingL);
  padding: 56px 0;
}

.loading {
  display: flex;
  justify-content: center;
  gap: var(--spacingS);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: var(--borderRadiusCircular);
  background: var(--colorBrand60);
  animation: dot-pulse 1.2s var(--curveEasyEase) infinite;
}

.dot:nth-child(2) { animation-delay: 0.15s; }
.dot:nth-child(3) { animation-delay: 0.3s; }

.loading-label {
  font-family: var(--fontFamilyMonospace);
  font-size: var(--fontSize200);
  letter-spacing: 0.22em;
  color: var(--colorNeutralForeground4);
  text-indent: 0.22em;
}

@keyframes dot-pulse {
  0%, 80%, 100% { opacity: 0.25; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}
</style>
