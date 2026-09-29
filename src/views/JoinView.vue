<script setup>
/**
 * 加入页 —— 进入即自动播放背景音乐，右上角滑出播放器
 * 文案与联系渠道来自 public/join.json5，改文案不用动代码
 * 正文按 Markdown 渲染：页级 markdown / md / body 字段优先，
 * 最后一页可用全局 join 字段，都没有则回落 detail
 * 手机端：左右滑动翻页 + 加大触控目标
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { loadJoin } from '../lib/content';
import { music } from '../lib/player';

import PageHead from '../components/PageHead.vue';
import MarkdownBlock from '../components/MarkdownBlock.vue';

/* join.json5 读不到时的兜底，保证页面永远有内容 */
const FALLBACK_SLIDES = [
];

const FALLBACK_CHANNELS = [
];

/* 只有 http(s) 才按外链打开，mailto 之类走浏览器默认行为 */
const isExternal = (href) => /^https?:/i.test(href);

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

/** 当前页正文（Markdown 源文本），空则显示翻页提示 */
const body = computed(() => {
  const s = currentSlide.value;
  const own = s.markdown || s.md || s.body || '';
  if (own) return own;
  if (isLast.value && data.value?.join) return data.value.join;
  return s.detail || '';
});

const prevSlide = () => { if (slide.value > 0) slide.value -= 1; };
const nextSlide = () => { if (!isLast.value) slide.value += 1; };

/* 手机端滑动翻页：横向位移够大、且明显压过纵向，才认成翻页（否则放行页面滚动） */
const SWIPE_MIN = 44;
let sx = 0, sy = 0, tracking = false;

const onTouchStart = (e) => {
  const t = e.changedTouches[0];
  sx = t.clientX;
  sy = t.clientY;
  tracking = true;
};

const onTouchEnd = (e) => {
  if (!tracking) return;
  tracking = false;
  const t = e.changedTouches[0];
  const dx = t.clientX - sx;
  const dy = t.clientY - sy;
  if (Math.abs(dx) < SWIPE_MIN || Math.abs(dx) < Math.abs(dy) * 1.4) return;
  if (dx < 0) nextSlide();
  else prevSlide();
};

/* 桌面端方向键翻页（在输入框里打字时不抢键） */
const onKey = (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const t = e.target;
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
  if (e.key === 'ArrowLeft') prevSlide();
  else if (e.key === 'ArrowRight') nextSlide();
};

onMounted(async () => {
  music.showAndPlay();          // 立即开始播放，不等数据加载
  data.value = await loadJoin();
  window.addEventListener('keydown', onKey);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey);
});
</script>

<template>
  <section class="page">
    <div class="wrap">
      <PageHead :kicker="currentSlide.kicker || ''" :title="currentSlide.title || ''" :desc="currentSlide.desc || ''" />

      <Transition name="deck" mode="out-in">
        <div
          :key="slide"
          class="join-slide"
          @touchstart.passive="onTouchStart"
          @touchend.passive="onTouchEnd"
        >
          <!-- 正文一律走 Markdown 渲染：列表 / 链接 / 强调 / 表格都直接写在 join.json5 里 -->
          <div v-if="body" v-reveal class="join-card">
            <MarkdownBlock :source="body" />
          </div>

          <div v-else class="join-prompt">
            <span class="join-prompt-index mono">0{{ slide + 1 }}</span>
            <span>使用下方箭头翻页</span>
          </div>
        </div>
      </Transition>

      <!-- 翻页控件：箭头 / 分页点 / 页码，都在同一行；窄屏自动重排 -->
      <div class="join-controls">
        <button class="deck-arrow" :disabled="slide === 0" aria-label="上一页" @click="prevSlide">←</button>
        <div class="join-dots" role="tablist" aria-label="加入流程分页">
          <button
            v-for="(_, i) in slides"
            :key="i"
            role="tab"
            :class="{ on: slide === i }"
            :aria-selected="slide === i"
            :aria-label="`第 ${i + 1} 页`"
            @click="slide = i"
          ></button>
        </div>
        <span class="deck-count mono">{{ String(slide + 1).padStart(2, '0') }} / {{ String(slides.length).padStart(2, '0') }}</span>
        <button class="deck-arrow" :disabled="isLast" aria-label="下一页" @click="nextSlide">→</button>
        <span class="deck-hint mono" aria-hidden="true">左右滑动可翻页</span>
      </div>

      <hr v-reveal="120" class="rule" />

      <div class="channel-grid">
        <!-- 整张卡都是链接：手机上点哪儿都能触发，不用瞄准那行小字 -->
        <component
          :is="c.href ? 'a' : 'div'"
          v-for="(c, i) in channels"
          :key="c.key"
          v-reveal="140 + i * 65"
          class="channel"
          :class="{ linkable: c.href }"
          :href="c.href"
          :target="isExternal(c.href) ? '_blank' : undefined"
          :rel="isExternal(c.href) ? 'noopener noreferrer' : undefined"
        >
          <span class="channel-key mono">{{ c.key }}</span>
          <span class="channel-val mono">{{ c.value || '—' }}<template v-if="isExternal(c.href)"> ↗</template></span>
        </component>
      </div>
    </div>
  </section>
</template>
