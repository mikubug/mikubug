<script setup>
/**
 * 加载指示器 —— 沿用 clubweb 原方案:三个脉冲圆点。
 * label 可选,用于补一行等宽小字说明。
 */
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
  gap: 14px;
  padding: 58px 0;
}

.loading {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  animation: dot-pulse 1.2s infinite ease-in-out;
}

.dot:nth-child(2) { animation-delay: 0.15s; }
.dot:nth-child(3) { animation-delay: 0.3s; }

.loading-label {
  font-size: 11px;
  letter-spacing: 0.3em;
  color: var(--text-faint);
  text-indent: 0.3em;
}

@keyframes dot-pulse {
  0%, 80%, 100% { opacity: 0.25; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}
</style>
