<script setup>
/** 关于页 —— 内容取自 public/about.json 的 about 字段,未配置则显示占位 */
import { onMounted, ref } from 'vue';
import { loadAbout } from '../lib/content';
import { SITE } from '../lib/site';

import PageHead from '../components/PageHead.vue';
import MarkdownBlock from '../components/MarkdownBlock.vue';

const data = ref(null);
const loaded = ref(false);

onMounted(async () => {
  data.value = await loadAbout();
  loaded.value = true;
});

const info = [
  { k: 'NAME', v: SITE.cn, sub: SITE.en },
  { k: 'GITHUB', v: 'mikubug', sub: SITE.github, href: SITE.github },
  { k: 'TAGLINE', v: SITE.tagline, sub: '' },
];
</script>

<template>
  <section class="page">
    <div class="wrap">
      <PageHead kicker="03 / ABOUT" title="关于" desc="关于凌云社。" />

      <div class="prose-placeholder">
        <MarkdownBlock v-if="loaded && data && data.about" v-reveal :source="data.about" />

        <div v-else-if="loaded" v-reveal class="ph-card">
          <span class="ph-code mono">// PLACEHOLDER</span>
          <p class="ph-text">此处为「关于」内容占位。详细信息待补充。</p>
          <p class="ph-hint mono">写入 about.json 的 about 字段即可替换本段内容。</p>
        </div>
      </div>

      <hr v-reveal="110" class="rule" />

      <div class="info-grid">
        <component
          :is="r.href ? 'a' : 'div'"
          v-for="(r, i) in info"
          :key="r.k"
          v-reveal="120 + i * 70"
          class="info-cell"
          :href="r.href"
          :target="r.href ? '_blank' : undefined"
          :rel="r.href ? 'noopener noreferrer' : undefined"
        >
          <span class="info-key mono">{{ r.k }}</span>
          <span class="info-val">{{ r.v }}</span>
          <span v-if="r.sub" class="info-sub mono">{{ r.sub }}</span>
        </component>
      </div>
    </div>
  </section>
</template>
