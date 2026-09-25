<script setup>
/** 明暗主题开关（role="switch"），点击处展开圆形揭示动画 */
import { computed } from 'vue';
import { theme, toggleTheme } from '../lib/theme';

/* aria-checked=true 代表"浅色模式"已开启(滑块在右) */
const isLight = computed(() => theme.value === 'light');

const onClick = (e) => toggleTheme({ x: e.clientX, y: e.clientY });
</script>

<template>
  <button
    class="theme-switch"
    type="button"
    role="switch"
    :aria-checked="isLight ? 'true' : 'false'"
    :aria-label="isLight ? '切换到深色模式' : '切换到浅色模式'"
    :title="isLight ? '切换到深色模式' : '切换到浅色模式'"
    @click="onClick"
  >
    <!-- 轨道图标:太阳 / 月亮 -->
    <svg class="theme-track-icon sun" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4.4" fill="currentColor" />
      <g stroke="currentColor" stroke-width="1.9" stroke-linecap="round">
        <path d="M12 2.6v2.4M12 19v2.4M2.6 12h2.4M19 12h2.4" />
        <path d="M5.4 5.4 7 7M17 17l1.6 1.6M18.6 5.4 17 7M7 17l-1.6 1.6" />
      </g>
    </svg>
    <svg class="theme-track-icon moon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 14.4A8.4 8.4 0 0 1 9.6 4a8.4 8.4 0 1 0 10.4 10.4Z"
        fill="currentColor"
      />
    </svg>

    <span class="theme-knob" aria-hidden="true"></span>
  </button>
</template>
