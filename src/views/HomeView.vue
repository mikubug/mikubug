<script setup>
/**
 * 首页 —— 主视觉 + HUD 仪表 + 四个入口
 *
 * 科幻感由几层克制的装饰叠出来:顶部刻度尺、状态灯、雷达扫描盘、遥测读数、
 * 终端打字机、标题故障闪、底部系统日志跑马灯。
 * 颜色一律走主题变量,深浅两套自动适配;prefers-reduced-motion 下全部静止。
 */
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { SITE } from '../lib/site';

const ENTRIES = [
  { path: '/notice', code: '01', en: 'NOTICE', label: '公告', desc: '社团通知与动态' },
  { path: '/works', code: '02', en: 'WORKS', label: '成果', desc: '文档 · 项目 · 记录' },
  { path: '/about', code: '03', en: 'ABOUT', label: '关于', desc: '我们是谁' },
  { path: '/join', code: '04', en: 'JOIN', label: '加入', desc: '成为我们的一员' },
];

/* ---------- 终端打字机:循环「打字 → 停留 → 删除」 ---------- */

const LINES = [
  '> 探索前沿技术 · 汇聚创造力量',
  '> 用代码构建我们想看见的世界',
  '> 文档已同步 · 随时可以访问',
];

const typed = ref('');
let line = 0;
let chars = 0;
let holds = 0;
let timer = 0;

const step = () => {
  const text = LINES[line];
  if (chars < text.length) {
    chars += 1;
    typed.value = text.slice(0, chars);
    timer = setTimeout(step, 58);
  } else if (holds < 26) {
    holds += 1;
    timer = setTimeout(step, 95);
  } else if (chars > 0) {
    chars -= 1;
    typed.value = text.slice(0, chars);
    timer = setTimeout(step, 22);
  } else {
    holds = 0;
    line = (line + 1) % LINES.length;
    timer = setTimeout(step, 240);
  }
};

/* ---------- 主视觉视差:装饰层随指针轻微偏移 ---------- */

const hero = ref(null);
let raf = 0;
let tx = 0, ty = 0, cx = 0, cy = 0;

const tick = () => {
  cx += (tx - cx) * 0.085;
  cy += (ty - cy) * 0.085;
  if (hero.value) {
    hero.value.style.setProperty('--px', `${cx.toFixed(2)}px`);
    hero.value.style.setProperty('--py', `${cy.toFixed(2)}px`);
  }
  raf = requestAnimationFrame(tick);
};

const onMove = (e) => {
  const el = hero.value;
  if (!el) return;
  const r = el.getBoundingClientRect();
  tx = ((e.clientX - r.left) / r.width - 0.5) * 16;
  ty = ((e.clientY - r.top) / r.height - 0.5) * 12;
};

const onLeave = () => { tx = 0; ty = 0; };

onMounted(() => {
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (still) {
    typed.value = LINES[0];
  } else {
    timer = setTimeout(step, 420);
  }

  // 只有带指针的设备才做视差,触屏省电
  if (!still && window.matchMedia('(hover: hover)').matches) {
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(tick);
  }
});

onBeforeUnmount(() => {
  clearTimeout(timer);
  cancelAnimationFrame(raf);
  window.removeEventListener('pointermove', onMove);
  document.removeEventListener('pointerleave', onLeave);
});
</script>

<template>
  <section class="page">
    <div class="wrap">
      <!-- ---- 主视觉 ---- -->
      <div ref="hero" class="hero hero-deck">
        <span class="hero-corner tl" aria-hidden="true"></span>
        <span class="hero-corner tr" aria-hidden="true"></span>
        <span class="hero-corner bl" aria-hidden="true"></span>
        <span class="hero-corner br" aria-hidden="true"></span>

        <!-- HUD 刻度尺(纯装饰) -->
        <div class="hud-ruler" aria-hidden="true"></div>

        <p v-reveal class="kicker mono">MIKUBUG · {{ SITE.full }}</p>
        <h1 v-reveal="120" class="hero-title" :data-text="`${SITE.cn}.`">
          凌云社<span class="dot">.</span>
        </h1>
        <p v-reveal="250" class="hero-sub">{{ SITE.tagline }}</p>

        <!-- 终端打字机 -->
        <p v-reveal="330" class="hero-term mono">
          <span class="hero-term-text">{{ typed }}</span>
          <span class="hero-term-caret" aria-hidden="true"></span>
        </p>

        <p v-reveal="400" class="hero-en mono">{{ SITE.en }}</p>

        <!-- 雷达扫描盘 -->
        <div class="hero-radar" aria-hidden="true">
          <span class="radar-ring"></span>
          <span class="radar-cross"></span>
          <span class="radar-sweep"></span>
          <span class="radar-blip"></span>
          <span class="radar-core"></span>
        </div>
      </div>

      <hr v-reveal="460" class="rule" />

      <!-- ---- 入口卡片 ---- -->
      <div class="entry-grid">
        <RouterLink
          v-for="(e, i) in ENTRIES"
          :key="e.path"
          v-reveal="520 + i * 120"
          :to="e.path"
          class="entry"
        >
          <span class="entry-corner" aria-hidden="true"></span>
          <span class="entry-code mono">{{ e.code }}</span>
          <span class="entry-body">
            <span class="entry-label">{{ e.label }}</span>
            <span class="entry-en mono">{{ e.en }}</span>
            <span class="entry-desc">{{ e.desc }}</span>
          </span>
          <span class="entry-arrow" aria-hidden="true">→</span>
        </RouterLink>
      </div>
    </div>
  </section>
</template>
