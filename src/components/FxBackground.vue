<script setup>
/**
 * 背景层:星云漂移 + 蓝图网格 + 扫描线 + 地平线光 + 鼠标柔光,纯装饰
 * 鼠标柔光用 rAF 缓动跟随,首次移动直接吸附(避免从左上角飞进来)
 */
import { onBeforeUnmount, onMounted, ref } from 'vue';

const dot = ref(null);
let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
let idle = true;

const tick = () => {
  cx += (tx - cx) * 0.09;
  cy += (ty - cy) * 0.09;
  if (dot.value) dot.value.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
  raf = requestAnimationFrame(tick);
};

const onMove = (e) => {
  tx = e.clientX;
  ty = e.clientY;
  if (idle) {
    idle = false;
    cx = tx;
    cy = ty;
    dot.value?.classList.add('on');
  }
};

const onLeave = () => {
  idle = true;
  dot.value?.classList.remove('on');
};

onMounted(() => {
  // 触屏设备不启用,省电
  if (!window.matchMedia('(hover: hover)').matches) return;
  window.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerleave', onLeave);
  raf = requestAnimationFrame(tick);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
  window.removeEventListener('pointermove', onMove);
  document.removeEventListener('pointerleave', onLeave);
});
</script>

<template>
  <div class="bg-layer" aria-hidden="true">
    <div class="bg-aurora"></div>
    <div class="bg-grid"></div>
    <div ref="dot" class="bg-cursor"></div>
    <div class="bg-scan"></div>
    <div class="bg-horizon"></div>
  </div>
</template>
