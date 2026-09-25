<script setup>
/** 公告页 —— 读取 public/notice.json5,支持置顶 / 标签 / Markdown 正文 */
import { onMounted, ref } from 'vue';
import { loadNotices } from '../lib/content';
import { relTime } from '../lib/format';
import { SITE } from '../lib/site';

import PageHead from '../components/PageHead.vue';
import Loading from '../components/Loading.vue';
import StateBox from '../components/StateBox.vue';
import TagChips from '../components/TagChips.vue';
import MarkdownBlock from '../components/MarkdownBlock.vue';

const status = ref('loading'); // loading | ready | error
const list = ref([]);

onMounted(async () => {
  try {
    list.value = await loadNotices();
    status.value = 'ready';
  } catch {
    status.value = 'error';
  }
});
</script>

<template>
  <section class="page">
    <div class="wrap">
      <PageHead kicker="01 / NOTICE" title="公告" desc="社团通知与动态。" />

      <div class="notice-list">
        <Loading v-if="status === 'loading'" label="LOADING" />

        <StateBox
          v-else-if="status === 'error'"
          code="// ERROR"
          text="公告加载失败"
        />

        <StateBox v-else-if="!list.length" code="// EMPTY" text="暂无公告" />

        <template v-else>
          <article
            v-for="(n, i) in list"
            :key="i"
            v-reveal="Math.min(i, 6) * 60"
            class="notice"
            :class="{ pinned: n.pinned }"
          >
            <header class="notice-head">
              <div class="notice-title-wrap">
                <span v-if="n.pinned" class="pin mono">PINNED</span>
                <h2 class="notice-title">{{ n.title }}</h2>
              </div>
              <span class="notice-meta mono">{{ n.publisher || SITE.cn }} · {{ relTime(n.date) }}</span>
            </header>

            <TagChips v-if="n.tags && n.tags.length" :tags="n.tags" />

            <MarkdownBlock class="notice-body" :source="n.body" />
          </article>
        </template>
      </div>
    </div>
  </section>
</template>
