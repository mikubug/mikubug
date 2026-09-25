<script setup>
/** 成果详情 —— 渲染完整 Markdown（文档随包编译，切换无需请求） */
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { findDoc } from '../lib/content';
import { fmtDate, fmtAuthors } from '../lib/format';

import StateBox from '../components/StateBox.vue';
import TagChips from '../components/TagChips.vue';
import MarkdownBlock from '../components/MarkdownBlock.vue';

const route = useRoute();

const safeDecode = (s) => {
  if (!/%[0-9a-f]{2}/i.test(s)) return s;
  try { return decodeURIComponent(s); } catch { return s; }
};

const fileName = computed(() => String(route.params.file || ''));
const doc = computed(() => findDoc(fileName.value) || findDoc(safeDecode(fileName.value)));

/** 元信息行:作者(多人写「联合编写」) + 日期 */
const metaLine = computed(() => {
  const d = doc.value;
  if (!d) return '';
  return [
    fmtAuthors(d.writer),
    d.date ? `日期：${fmtDate(d.date)}` : '',
  ].filter(Boolean).join('   ');
});
</script>

<template>
  <section class="page">
    <div class="wrap wrap-doc">
      <!-- 找不到文档 -->
      <template v-if="!doc">
        <StateBox code="// 404" :text="`未找到文档:${fileName}`" />
        <div class="back-wrap">
          <RouterLink to="/works" class="back-link mono">← 返回成果列表</RouterLink>
        </div>
      </template>

      <!-- 文档正文 -->
      <template v-else>
        <header class="doc-head">
          <RouterLink to="/works" class="back-link mono">← 成果</RouterLink>
          <p v-reveal="40" class="kicker mono">DOCUMENT</p>
          <h1 v-reveal="90" class="doc-h1">{{ doc.title }}</h1>

          <div v-reveal="140" class="doc-metarow mono">{{ metaLine }}</div>

          <div v-if="doc.tags.length" v-reveal="180">
            <TagChips :tags="doc.tags" />
          </div>

          <div v-if="doc.url" v-reveal="210" class="origin-row">
            <a class="doc-origin mono" :href="doc.url" target="_blank" rel="noopener noreferrer">原始链接 ↗</a>
          </div>

          <hr v-reveal="240" class="rule" />
        </header>

        <MarkdownBlock v-reveal="280" class="doc-content" :source="doc.body" />

        <div class="doc-foot">
          <RouterLink to="/works" class="back-link mono">← 返回成果列表</RouterLink>
        </div>
      </template>
    </div>
  </section>
</template>
