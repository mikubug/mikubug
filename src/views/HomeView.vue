<script setup>
/** 首页 —— 主视觉（品牌光洗 + 细网格 + 双层轨道 + 终端打字机）+ 入口卡 */
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { SITE } from '../lib/site';

const ENTRIES = [
  { path: '/notice', code: '01', en: 'NOTICE', label: '公告', desc: '社团通知与动态' },
  { path: '/works', code: '02', en: 'WORKS', label: '成果', desc: '文档 · 项目 · 记录' },
  { path: '/about', code: '03', en: 'ABOUT', label: '关于', desc: '我们是谁' },
  { path: '/join', code: '04', en: 'JOIN', label: '加入', desc: '成为我们的一员' },
];

/* 终端打字机：打字 → 停留 → 整段清空 → 换行 */

/** 每行用短句，太长会折行 */

const LINES = [

  '探索前沿技术 · 汇聚创造力量',

  '从想法出发 · 把创意变成现实',

  'DeepSeek 不要吃白饭了！！！',

  '让每一个奇思妙想落地',

  '做真正有意思的东西',

  '欢迎来到凌云社',

  'Welcome MikuBug!',

  '能跑就行？这不重要',

  '100 行代码，但是有 1000 行报错...',

  '3D 打印，把想象变成实体',

  '看我把你 MikuMiku 掉！',

  '初始之音，畅想未来！',

  '小笼包，叉烧包，还有芝麻奶黄包...',

  '好饿好饿好饿，我真的好饿',

  '少年意气，凌云而上',

  '周南梅溪湖现在唯一 ACG 社！',

  '周南梅溪湖中学凌云社！',

  '周南梅溪湖第一大科技社团！',

  '这里，是我们的凌云社',

  '人民万岁！',

  '星星之火，可以燎原',

  '全世界无产者，联合起来！',

  'Наша цель — коммунизм!',

  '科技服务人民',

  '坚持改革开放理念',

  '#include<bits/stdc++.h>',

  '把零件拼成一个世界',

  '实践是检验真理的唯一标准',
  
  '这里是科技社，也是 ACG 社',

  '喜欢的东西，就自己做出来',

  '让兴趣成为创造力',

  '年轻就是好，可以折腾',

  '今天的想法，明天的作品',

  '每一次尝试都值得记录',

  '失败也是一种成果',

  '凌云而上，探索无限',

  '从梅溪湖出发',

  '向着未来出发',

  '这里，是我们的凌云社',

];
const typed = ref('');

/** 随机挑一句，且不和刚打完的重复 */
const pickLine = (avoid) => {
  let n = avoid;
  while (n === avoid) n = Math.floor(Math.random() * LINES.length);
  return n;
};

let line = Math.floor(Math.random() * LINES.length); // 每次进站开口也不一样
let chars = 0;      // 已显示字符数
let phase = 'type'; // type 打字 / hold 停留 / erase 清空
let holdLeft = 0;   // 停留剩余帧
let timer = 0;

/** 按当前相位推进一格 */
const step = () => {
  const text = LINES[line];

  if (phase === 'type') {
    chars += 1;
    typed.value = text.slice(0, chars);
    if (chars >= text.length) {
      // 打完停住约 2.2s，让人读完再清空
      phase = 'hold';
      holdLeft = 11;
    }
    timer = setTimeout(step, chars === 1 ? 260 : 68); // 首字稍慢
    return;
  }

  if (phase === 'hold') {
    if (holdLeft-- > 0) {
      timer = setTimeout(step, 200);
    } else {
      phase = 'erase';
      timer = setTimeout(step, 120);
    }
    return;
  }

  // 整段清掉再换行，逐字回删太慢；下一句随机挑
  typed.value = '';
  phase = 'type';
  line = pickLine(line);
  chars = 0;
  timer = setTimeout(step, 380);
};

/* 指针视差：装饰层随指针轻微偏移 */

const hero = ref(null);
let raf = 0;
let tx = 0, ty = 0, cx = 0, cy = 0;

/** 缓动到目标点就停工，别一直空转（每帧写 CSS 变量会和标题渐变抢主线程） */
const tick = () => {
  cx += (tx - cx) * 0.09;
  cy += (ty - cy) * 0.09;

  if (Math.abs(tx - cx) < 0.08 && Math.abs(ty - cy) < 0.08) {
    cx = tx;
    cy = ty;
    raf = 0;
  } else {
    raf = requestAnimationFrame(tick);
  }

  if (hero.value) {
    hero.value.style.setProperty('--px', `${cx.toFixed(2)}px`);
    hero.value.style.setProperty('--py', `${cy.toFixed(2)}px`);
  }
};

/** 起步；已经在跑就不重复起 */
const start = () => { if (!raf) raf = requestAnimationFrame(tick); };

const onMove = (e) => {
  const el = hero.value;
  if (!el) return;
  const r = el.getBoundingClientRect();
  tx = ((e.clientX - r.left) / r.width - 0.5) * 16;
  ty = ((e.clientY - r.top) / r.height - 0.5) * 12;
  start();
};

const onLeave = () => { tx = 0; ty = 0; start(); };

/* 标题故障闪：随机间隔抖一下，每次随机换一种形态，节奏不规律才像故障 */

const FX = ['1', '2', '3', '4'];
const inkEl = ref(null);
let flickerTimer = 0;
let offTimer = 0;

const stopFlicker = () => {
  const el = inkEl.value;
  if (!el) return;
  el.classList.remove('is-flicker');
  el.removeAttribute('data-fx');
};

/* 动画放完就摘标记；万一 keyframes 没触发，靠兜底定时器收尾 */
const onFlickerEnd = (e) => {
  if (e.target === inkEl.value) stopFlicker();
};

const scheduleFlicker = () => {
  flickerTimer = setTimeout(() => {
    const el = inkEl.value;
    if (el) {
      el.dataset.fx = FX[Math.floor(Math.random() * FX.length)];
      el.classList.add('is-flicker');
      offTimer = setTimeout(stopFlicker, 900);
    }
    scheduleFlicker();
  }, 1200 + Math.random() * 4200);
};

onMounted(() => {
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (still) {
    typed.value = LINES[line];
  } else {
    timer = setTimeout(step, 620);
    scheduleFlicker();
  }

  inkEl.value?.addEventListener('animationend', onFlickerEnd);

  // 只有带指针的设备才做视差，触屏省电
  if (!still && window.matchMedia('(hover: hover)').matches) {
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(tick);
  }
});

onBeforeUnmount(() => {
  clearTimeout(timer);
  clearTimeout(flickerTimer);
  clearTimeout(offTimer);
  cancelAnimationFrame(raf);
  inkEl.value?.removeEventListener('animationend', onFlickerEnd);
  window.removeEventListener('pointermove', onMove);
  document.removeEventListener('pointerleave', onLeave);
});
</script>

<template>
  <section class="page">
    <div class="wrap">
      <!-- ---- 主视觉 ---- -->
      <div ref="hero" class="hero">
        <div class="hero-grid" aria-hidden="true"></div>

        <!-- 双层轨道：一层实线、一层虚线自转，中心一枚品牌光核 -->
        <div class="hero-orbit" aria-hidden="true">
          <span class="orbit-ring"></span>
          <span class="orbit-ring inner"></span>
          <span class="orbit-ring dashed"></span>
          <span class="orbit-core"></span>
          <span class="orbit-node n1"></span>
          <span class="orbit-node n2"></span>
          <span class="orbit-node n3"></span>
        </div>

        <div class="hero-content">
          <p class="kicker">MikuBug</p>
          <h1 class="hero-title"><span ref="inkEl" class="hero-title-ink" :data-text="`${SITE.cn}.`">凌云社<span class="dot">.</span></span></h1>
          <p class="hero-sub">{{ SITE.tagline }}</p>

          <!-- 终端打字机：> 由 CSS 画，光标跟在文案后面 -->
          <p class="hero-term">
            <span class="hero-term-text">{{ typed }}</span>
            <span class="hero-term-caret" aria-hidden="true"></span>
          </p>

          <div class="hero-actions">
            <RouterLink class="btn btn-primary btn-lg" to="/join">加入我们</RouterLink>
            <RouterLink class="btn btn-lg" to="/works">浏览成果</RouterLink>
          </div>
        </div>
      </div>

      <hr v-reveal class="rule" />

      <!-- ---- 入口卡片 ---- -->
      <div class="entry-grid">
        <RouterLink
          v-for="(e, i) in ENTRIES"
          :key="e.path"
          v-reveal="i * 90"
          :to="e.path"
          class="entry"
        >
          <span class="entry-code" aria-hidden="true">{{ e.code }}</span>
          <span class="entry-body">
            <span class="entry-label">{{ e.label }}</span>
            <span class="entry-en">{{ e.en }}</span>
            <span class="entry-desc">{{ e.desc }}</span>
          </span>
          <span class="entry-arrow" aria-hidden="true">→</span>
        </RouterLink>
      </div>
    </div>
  </section>
</template>
