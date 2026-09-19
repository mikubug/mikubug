<script setup>
/**
 * 成果页 —— 列出 ./repo/ 下的全部 Markdown 文档
 * 文档列表在构建期由 import.meta.glob 扫描得到,无需任何清单文件。
 */
import { computed, ref } from 'vue';
import { DOCS, ALL_TAGS } from '../lib/content';
import { fmtDate } from '../lib/format';

import PageHead from '../components/PageHead.vue';
import StateBox from '../components/StateBox.vue';
import TagChips from '../components/TagChips.vue';
import MarkdownBlock from '../components/MarkdownBlock.vue';

const keyword = ref('');
const activeTag = ref('');

/* 编号固定用文档在全量列表中的位置,筛选后不乱跳 */
const indexed = DOCS.map((d, i) => ({ ...d, no: String(i + 1).padStart(2, '0') }));

const shown = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  return indexed.filter((d) => {
    if (activeTag.value && !d.tags.includes(activeTag.value)) return false;
    if (!kw) return true;
    return `${d.title} ${d.writer} ${d.tags.join(' ')} ${d.excerpt}`.toLowerCase().includes(kw);
  });
});

const toggleTag = (t) => {
  activeTag.value = activeTag.value === t ? '' : t;
};
</script>

<template>
  <section class="page">
    <div class="wrap">
      <PageHead kicker="02 / WORKS" title="成果" desc="以文档形式沉淀的项目与记录。" />

      <!-- 工具条:搜索 + 标签筛选 -->
      <div v-reveal class="toolbar">
        <input
          v-model="keyword"
          class="search"
          type="search"
          placeholder="搜索标题、作者、标签…"
          aria-label="搜索成果"
        />

        <div v-if="ALL_TAGS.length" class="filters">
          <button
            class="filter mono"
            :class="{ on: activeTag === '' }"
            type="button"
            @click="toggleTag('')"
          >
            ALL
          </button>
          <button
            v-for="t in ALL_TAGS"
            :key="t"
            class="filter mono"
            :class="{ on: activeTag === t }"
            type="button"
            @click="toggleTag(t)"
          >
            {{ t }}
          </button>
        </div>
      </div>

      <!-- 文档列表 -->
      <div class="doc-grid">
        <StateBox v-if="!DOCS.length" code="// EMPTY" text="暂无成果文档 — 在 ./repo/ 放入 .md 文件即可" />
        <StateBox v-else-if="!shown.length" code="// NO MATCH" text="没有符合条件的文档" />

        <template v-else>
          <RouterLink
            v-for="(d, i) in shown"
            :key="d.file"
            v-reveal="Math.min(i, 8) * 55"
            :to="{ name: 'work', params: { file: d.file } }"
            class="doc"
          >
            <div class="doc-top">
              <span class="doc-no mono">{{ d.no }}</span>
              <span v-if="d.url" class="doc-ext mono">LINK ↗</span>
            </div>

            <h3 class="doc-title">{{ d.title }}</h3>

            <div class="doc-meta mono">
              {{ [d.writer ? '@' + d.writer : '', d.date ? fmtDate(d.date) : ''].filter(Boolean).join(' · ') || '—' }}
            </div>

            <!-- 前 100 字符的 Markdown 渲染摘要 -->
            <MarkdownBlock class="doc-excerpt" :source="d.excerpt" />

            <TagChips v-if="d.tags.length" :tags="d.tags" chip-class="chip chip-sm" />
          </RouterLink>
        </template>
      </div>
    </div>
  </section>
</template>
