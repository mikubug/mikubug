<script setup>
/**
 * 加入页 —— 进入即自动播放背景音乐,右上角滑出播放器
 * 内容取自 public/about.json 的 join 字段,未配置则显示占位
 */
import { computed, onMounted, ref } from 'vue';
import { loadAbout } from '../lib/content';
import { music } from '../lib/player';
import { SITE } from '../lib/site';

import PageHead from '../components/PageHead.vue';
import MarkdownBlock from '../components/MarkdownBlock.vue';

const data = ref(null);
const loaded = ref(false);

const CHANNELS = ['EMAIL', 'QQ', 'WECHAT', 'GITHUB'];
const slide = ref(0);
const slides = [
  { kicker: '01 / WHY', title: '为什么加入凌云社？', desc: '把好奇心变成真实项目，在协作中建立自己的技术坐标。' },
  { kicker: '02 / WHAT', title: '你会参与什么？', desc: '从硬件、软件到创意实验，选择一个方向，和伙伴一起完成作品。' },
  { kicker: '03 / HOW', title: '我们如何协作？', desc: '开放讨论、短周期迭代、清晰记录，让每个人都能贡献自己的部分。' },
  { kicker: '04 / JOIN', title: '准备好了吗？', desc: '向下了解联系方式，发来你的想法，下一次活动见。' },
];
const currentSlide = computed(() => slides[slide.value]);
const prevSlide = () => { if (slide.value > 0) slide.value -= 1; };
const nextSlide = () => { if (slide.value < slides.length - 1) slide.value += 1; };

onMounted(async () => {
  // 立即开始播放,不等数据加载
  music.showAndPlay();
  data.value = await loadAbout();
  loaded.value = true;
});
</script>

<template>
  <section class="page">
    <div class="wrap">
      <div class="join-deck-head">
        <PageHead :kicker="currentSlide.kicker" :title="currentSlide.title" :desc="currentSlide.desc" />
        <div class="join-dots" aria-label="加入流程分页">
          <button v-for="(_, i) in slides" :key="i" :class="{ on: slide === i }" :aria-label="`第 ${i + 1} 页`" @click="slide = i"></button>
        </div>
      </div>

      <Transition name="deck" mode="out-in">
        <div :key="slide" class="join-slide">
          <MarkdownBlock v-if="slide === 3 && loaded && data && data.join" v-reveal :source="data.join" />

          <div v-else-if="slide === 3 && loaded" v-reveal class="ph-card">
            <span class="ph-code mono">// PLACEHOLDER</span>
            <p class="ph-text">详细招募信息、报名方式与联系方式待补充。</p>
            <div class="ph-links"><a class="ph-link mono" :href="SITE.github" target="_blank" rel="noopener noreferrer">GITHUB ↗</a></div>
          </div>
          <div v-else class="join-prompt"><span class="join-prompt-index mono">0{{ slide + 1 }}</span><span>向右下角继续浏览</span></div>
        </div>
      </Transition>

      <div class="join-controls">
        <button class="deck-arrow" :disabled="slide === 0" @click="prevSlide">←</button>
        <div class="deck-progress"><span :style="{ width: `${((slide + 1) / slides.length) * 100}%` }"></span></div>
        <span class="deck-count mono">{{ String(slide + 1).padStart(2, '0') }} / {{ String(slides.length).padStart(2, '0') }}</span>
        <button class="deck-arrow" :disabled="slide === slides.length - 1" @click="nextSlide">→</button>
      </div>

      <hr v-reveal="120" class="rule" />

      <div class="channel-grid">
        <div
          v-for="(k, i) in CHANNELS"
          :key="k"
          v-reveal="140 + i * 65"
          class="channel"
          :class="{ linkable: k === 'GITHUB' }"
        >
          <span class="channel-key mono">{{ k }}</span>
          <a
            v-if="k === 'GITHUB'"
            class="channel-val mono"
            :href="SITE.github"
            target="_blank"
            rel="noopener noreferrer"
          >mikubug ↗</a>
          <span v-else class="channel-val mono">—</span>
        </div>
      </div>
    </div>
  </section>
</template>
