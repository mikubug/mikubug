<script setup>
/**
 * 外观模式选择：跟随系统 / 浅色 / 深色
 * 三段式小控件，滑块跟着当前模式走；点击处展开圆形揭示动画
 */
import { computed } from 'vue';
import { preference, setTheme } from '../lib/theme';

const OPTIONS = [
  { v: 'system', label: '跟随系统' },
  { v: 'light', label: '浅色' },
  { v: 'dark', label: '深色' },
];

const idx = computed(() => Math.max(0, OPTIONS.findIndex((o) => o.v === preference.value)));

const pick = (o, e) => setTheme(o.v, { x: e.clientX, y: e.clientY });
</script>

<template>
  <div class="theme-seg" role="radiogroup" aria-label="外观模式">
    <!-- 滑块：三个格子等宽，translateX 按格数走 -->
    <span
      class="theme-seg-knob"
      aria-hidden="true"
      :style="{ transform: `translateX(${idx * 100}%)` }"
    ></span>

    <button
      v-for="o in OPTIONS"
      :key="o.v"
      class="theme-seg-btn"
      type="button"
      role="radio"
      :class="{ on: preference === o.v }"
      :aria-checked="preference === o.v ? 'true' : 'false'"
      :title="o.label"
      :aria-label="o.label"
      @click="pick(o, $event)"
    >
      <!-- 跟随系统：一块屏幕 -->
      <svg v-if="o.v === 'system'" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2.6" y="4.2" width="18.8" height="12.6" rx="2.6" stroke="currentColor" stroke-width="1.9" />
        <path d="M8.6 20h6.8" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" />
      </svg>

      <!-- 浅色：太阳 -->
      <svg v-else-if="o.v === 'light'" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="4.4" fill="currentColor" />
        <g stroke="currentColor" stroke-width="1.9" stroke-linecap="round">
          <path d="M12 2.6v2.4M12 19v2.4M2.6 12h2.4M19 12h2.4" />
          <path d="M5.4 5.4 7 7M17 17l1.6 1.6M18.6 5.4 17 7M7 17l-1.6 1.6" />
        </g>
      </svg>

      <!-- 深色：月亮 -->
      <svg v-else viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M20 14.4A8.4 8.4 0 0 1 9.6 4a8.4 8.4 0 1 0 10.4 10.4Z" fill="currentColor" />
      </svg>
    </button>
  </div>
</template>
