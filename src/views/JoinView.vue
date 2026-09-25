<script setup>
/**
 * 加入页 —— 进入即自动播放背景音乐，右上角滑出播放器
 * 文案与联系渠道来自 public/join.json5，改文案不用动代码
 */
import { computed, onMounted, ref } from 'vue';
import { loadJoin } from '../lib/content';
import { music } from '../lib/player';

import PageHead from '../components/PageHead.vue';
import MarkdownBlock from '../components/MarkdownBlock.vue';

/* join.json5 读不到时的兜底，保证页面永远有内容 */
const FALLBACK_SLIDES = [
  { kicker: '01 / WHY', title: '为什么加入凌云社？', desc: '把好奇心变成真实项目，在协作中建立自己的技术坐标。' },
  { kicker: '02 / WHAT', title: '你会参与什么？', desc: '从硬件、软件到创意实验，选择一个方向，和伙伴一起完成作品。' },
  { kicker: '03 / HOW', title: '我们如何协作？', desc: '开放讨论、短周期迭代、清晰记录，让每个人都能贡献自己的部分。' },
  { kicker: '04 / JOIN', title: '准备好了吗？', desc: '向下了解联系方式，发来你的想法，下一次活动见。' },
];

/* 只有 http(s) 才按外链打开，mailto 之类走浏览器默认行为 */
const isExternal = (href) => /^https?:/i.test(href);

const FALLBACK_CHANNELS = [
  { key: 'EMAIL', value: 'liyifan202201@outlook.com', href: 'mailto:liyifan202201@outlook.com' },
  { key: 'QQ', value: '375536697' },
  { key: 'WECHAT', value: 'wxid_w6ig15tttmx122' },
  { key: 'GITHUB', value: 'mikubug', href: 'https://github.com/mikubug' },
];

const data = ref(null);
const slide = ref(0);

const slides = computed(() =>
  Array.isArray(data.value?.slides) && data.value.slides.length ? data.value.slides : FALLBACK_SLIDES
);
const channels = computed(() =>
  Array.isArray(data.value?.channels) && data.value.channels.length ? data.value.channels : FALLBACK_CHANNELS
);
const currentSlide = computed(() => slides.value[slide.value] || {});
const isLast = computed(() => slide.value === slides.value.length - 1);

const prevSlide = () => { if (slide.value > 0) slide.value -= 1; };
const nextSlide = () => { if (!isLast.value) slide.value += 1; };

onMounted(async () => {
  music.showAndPlay();          // 立即开始播放，不等数据加载
  data.value = await loadJoin();
});
</script>

<template>
  <section class="page">
    <div class="wrap">
      <div class="join-deck-head">
        <PageHead :kicker="currentSlide.kicker || ''" :title="currentSlide.title || ''" :desc="currentSlide.desc || ''" />
        <div class="join-dots" aria-label="加入流程分页">
          <button v-for="(_, i) in slides" :key="i" :class="{ on: slide === i }" :aria-label="`第 ${i + 1} 页`" @click="slide = i"></button>
        </div>
      </div>

      <Transition name="deck" mode="out-in">
        <div :key="slide" class="join-slide">
          <!-- 最后一页若在 join.json5 里写了 Markdown 正文就渲染它 -->
          <MarkdownBlock v-if="isLast && data && data.join" v-reveal :source="data.join" />

          <!-- 否则展示该页的 detail 文案 -->
          <div v-else-if="currentSlide.detail" v-reveal class="ph-card">
            <p class="ph-text">{{ currentSlide.detail }}</p>
          </div>

          <div v-else class="join-prompt">
            <span class="join-prompt-index mono">0{{ slide + 1 }}</span>
            <span>使用下方箭头翻页</span>
          </div>
        </div>
      </Transition>

      <div class="join-controls">
        <button class="deck-arrow" :disabled="slide === 0" @click="prevSlide">←</button>
        <div class="deck-progress"><span :style="{ width: `${((slide + 1) / slides.length) * 100}%` }"></span></div>
        <span class="deck-count mono">{{ String(slide + 1).padStart(2, '0') }} / {{ String(slides.length).padStart(2, '0') }}</span>
        <button class="deck-arrow" :disabled="isLast" @click="nextSlide">→</button>
      </div>

      <hr v-reveal="120" class="rule" />

      <div class="channel-grid">
        <div
          v-for="(c, i) in channels"
          :key="c.key"
          v-reveal="140 + i * 65"
          class="channel"
          :class="{ linkable: c.href }"
        >
          <span class="channel-key mono">{{ c.key }}</span>
          <a
            v-if="c.href"
            class="channel-val mono"
            :href="c.href"
            :target="isExternal(c.href) ? '_blank' : undefined"
            :rel="isExternal(c.href) ? 'noopener noreferrer' : undefined"
          >{{ c.value }}<template v-if="isExternal(c.href)"> ↗</template></a>
          <span v-else class="channel-val mono">{{ c.value || '—' }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
