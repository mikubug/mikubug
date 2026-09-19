<script setup>
/** 首页 —— 主视觉 + 四个入口 + 实时统计 */
import { SITE } from '../lib/site';

const ENTRIES = [
  { path: '/notice', code: '01', en: 'NOTICE', label: '公告', desc: '社团通知与动态' },
  { path: '/works', code: '02', en: 'WORKS', label: '成果', desc: '文档 · 项目 · 记录' },
  { path: '/about', code: '03', en: 'ABOUT', label: '关于', desc: '我们是谁' },
  { path: '/join', code: '04', en: 'JOIN', label: '加入', desc: '成为我们的一员' },
];

/* 公告条数需要请求,失败时用 0 兜底,不阻塞首屏 */

</script>

<template>
  <section class="page">
    <div class="wrap">
      <!-- ---- 主视觉 ---- -->
      <div class="hero hero-deck">
        <span class="hero-corner tl" aria-hidden="true"></span>
        <span class="hero-corner tr" aria-hidden="true"></span>
        <span class="hero-corner bl" aria-hidden="true"></span>
        <span class="hero-corner br" aria-hidden="true"></span>

        <p v-reveal class="kicker mono">MIKUBUG · {{ SITE.full }}</p>
        <h1 v-reveal="120" class="hero-title">凌云社<span class="dot">.</span></h1>
        <p v-reveal="250" class="hero-sub">{{ SITE.tagline }}</p>
        <p v-reveal="360" class="hero-en mono">{{ SITE.en }}</p>
        <div class="hero-orbit" aria-hidden="true"><span></span><i></i></div>
      </div>

      <hr v-reveal="420" class="rule" />

      <!-- ---- 入口卡片 ---- -->
      <div class="entry-grid">
        <RouterLink
          v-for="(e, i) in ENTRIES"
          :key="e.path"
          v-reveal="480 + i * 120"
          :to="e.path"
          class="entry"
        >
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
