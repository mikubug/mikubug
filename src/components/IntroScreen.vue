<script setup>
/**
 * 开场动画 —— 沿用 clubweb 原方案:
 *   双层 SVG 标题从两侧滑入汇聚(后层彩色阴影 + 前层主文字)
 *   两侧细线从 0 生长
 *   两颗四角星缓慢浮动
 *   2.5s 后淡出,3.05s 从 DOM 移除
 * 全屏覆盖但不阻挡交互(pointer-events: none)。
 */
import { onBeforeUnmount, onMounted, ref } from 'vue';

const visible = ref(false);
const leaving = ref(false);

const FADE_OUT_AT = 2500; // 开始淡出
const HIDE_AT = 3050;     // 从 DOM 移除

let fadeTimer = 0;
let hideTimer = 0;

onMounted(() => {
  // 尊重系统「减少动态效果」设置,直接跳过开场
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  visible.value = true;
  fadeTimer = window.setTimeout(() => { leaving.value = true; }, FADE_OUT_AT);
  hideTimer = window.setTimeout(() => { visible.value = false; }, HIDE_AT);
});

onBeforeUnmount(() => {
  clearTimeout(fadeTimer);
  clearTimeout(hideTimer);
});
</script>

<template>
  <div v-if="visible" class="intro" :class="{ leaving }" aria-hidden="true">
    <div class="banner">
      <span class="banner-line" aria-hidden="true"></span>

      <svg class="splash" viewBox="0 0 320 120" width="380" height="120" aria-hidden="true">
        <!-- 后层:彩色阴影,从右滑入 -->
        <g class="layer-back">
          <text class="title-font layer-back-text" x="160" y="80" dx="2.5" dy="2.5">MIKUBUG</text>
        </g>
        <!-- 前层:主文字,从左滑入 -->
        <g class="layer-front">
          <text class="title-font layer-front-text" x="160" y="80">MIKUBUG</text>
        </g>

        <!-- 两颗缓慢上下浮动的四角星 -->
        <path class="star-fx" d="M265,13 L267.8,21.1 L276,24 L267.8,26.9 L265,35 L262.2,26.9 L254,24 L262.2,21.1 Z" />
        <path class="star-fx star-bottom" d="M45,84 L47.1,90.2 L53.5,92.2 L47.1,94.2 L45,100 L42.9,94.2 L36.5,92.2 L42.9,90.2 Z" />
      </svg>

      <span class="banner-line" aria-hidden="true"></span>
    </div>
  </div>
</template>

<style scoped>
/* 容器:覆盖全屏,不阻挡交互 */
.intro {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  background:
    radial-gradient(700px 420px at 50% 50%, rgba(var(--accent-rgb), 0.09), transparent 70%),
    var(--bg);
  animation: intro-in 0.35s ease;
  transition: opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.intro.leaving { opacity: 0; }

@keyframes intro-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.banner {
  display: flex;
  align-items: center;
  gap: 30px;
}

/* 两侧细线:从 0 生长出来 */
.layer-back-text { fill: var(--accent-2); }

.layer-front-text { fill: var(--text); }

.banner-line {
  display: block;
  width: 1px;
  height: 0;
  background: var(--accent);
  animation: line-grow 0.8s cubic-bezier(0.645, 0.045, 0.355, 1) 0.3s forwards;
}

@keyframes line-grow {
  from { height: 0; opacity: 0; }
  to { height: 96px; opacity: 0.8; }
}

/* SVG 标题:先隐,再淡入 + 从 0.95 缩放到位 */
.splash {
  opacity: 0;
  transform: scale(0.95);
  max-width: 78vw;
  height: auto;
  animation: splash-in 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0.1s forwards;
}

@keyframes splash-in {
  to { opacity: 1; transform: scale(1); }
}

.title-font {
  font-family: 'Inter', 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif;
  font-size: 56px;
  font-weight: 800;
  letter-spacing: -0.03em;
  text-anchor: middle;
}

/* 双层文字:后层从右滑入,前层从左滑入 */
.layer-back {
  animation: char-split-left 1.2s cubic-bezier(0.23, 1, 0.32, 1) 0.35s both;
}

.layer-front {
  animation: char-split-right 1.2s cubic-bezier(0.23, 1, 0.32, 1) 0.35s both;
}

@keyframes char-split-left {
  from { opacity: 0; transform: translate(30px); }
  to { opacity: 1; transform: translate(0); }
}

@keyframes char-split-right {
  from { opacity: 0; transform: translate(-30px); }
  to { opacity: 1; transform: translate(0); }
}

/* 四角星:缓慢上下浮动 + 轻微旋转 */
.star-fx {
  fill: var(--accent);
  transform-box: fill-box;
  transform-origin: center;
  animation: floatAnimation 4s ease-in-out infinite;
}

.star-bottom { animation-delay: 1.2s; }

@keyframes floatAnimation {
  0% { opacity: 0.9; transform: translateY(0) rotate(0); }
  50% { opacity: 1; transform: translateY(-8px) rotate(10deg); }
  100% { opacity: 0.9; transform: translateY(0) rotate(0); }
}

@media (max-width: 560px) {
  .banner { gap: 16px; }
  .splash { width: 260px; }
  .banner-line { animation-name: line-grow-sm; }
}

@keyframes line-grow-sm {
  from { height: 0; opacity: 0; }
  to { height: 64px; opacity: 0.8; }
}
</style>
