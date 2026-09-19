<script setup>
/**
 * 应用壳 —— 开场动画 / 背景层 / 导航 / 路由出口 / 页脚 / 播放器
 */
import { computed, onMounted, onUnmounted, reactive, ref, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import IntroScreen from './components/IntroScreen.vue';
import FxBackground from './components/FxBackground.vue';
import MusicPlayer from './components/MusicPlayer.vue';
import ThemeToggle from './components/ThemeToggle.vue';
import { SITE, NAV } from './lib/site';
import { music } from './lib/player';
import { flushReveal, forceReveal } from './directives/reveal';

const route = useRoute();
const router = useRouter();

const year = new Date().getFullYear();
const ready = ref(false);
const scrolled = ref(false);

/* ---------- 顶部进度条(路由切换反馈) ---------- */
const bar = reactive({ on: false, width: '0%' });
let barTimer = 0;

router.beforeEach(() => {
  bar.on = true;
  bar.width = '18%';
  clearTimeout(barTimer);
  barTimer = setTimeout(() => { bar.width = '72%'; }, 90);
});

router.afterEach(() => {
  bar.width = '100%';
  clearTimeout(barTimer);
  barTimer = setTimeout(() => {
    bar.on = false;
    bar.width = '0%';
  }, 260);
});

/* ---------- 导航高亮:成果详情页也点亮「成果」 ---------- */
const activePath = computed(() => (route.path.startsWith('/works') ? '/works' : route.path));

/* ---------- 路由切换:收起播放器(音乐继续播),补一次进场检查 ---------- */
watch(
  () => route.fullPath,
  () => {
    if (route.path !== '/join') music.hide();
    nextTick(() => requestAnimationFrame(flushReveal));
  }
);

/* ---------- 滚动:导航栏毛玻璃 ---------- */
const onScroll = () => { scrolled.value = window.scrollY > 12; };

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 首屏淡入
  requestAnimationFrame(() => { ready.value = true; });

  // 兜底:2 秒后强制显示仍未触发的进场元素,绝不让内容永不可见
  setTimeout(forceReveal, 2000);
});

onUnmounted(() => window.removeEventListener('scroll', onScroll));
</script>

<template>
  <FxBackground />
  <IntroScreen />

  <div class="shell" :class="{ ready }">
    <div class="progress" :class="{ on: bar.on }" :style="{ width: bar.width }"></div>

    <header class="navbar" :class="{ scrolled }">
      <div class="nav-inner">
        <RouterLink to="/" class="brand">
          <img class="brand-logo" :src="SITE.logo" :alt="SITE.cn + ' Logo'" width="30" height="30" />
          <span class="brand-text">
            <span class="brand-name mono">{{ SITE.en }}</span>
            <span class="brand-sub mono">{{ SITE.cn }}</span>
          </span>
        </RouterLink>

        <div class="nav-right">
          <nav class="nav-links">
            <RouterLink
              v-for="n in NAV"
              :key="n.path"
              :to="n.path"
              class="nav-link mono"
              :class="{ active: activePath === n.path }"
            >
              {{ n.label }}
            </RouterLink>
          </nav>

          <ThemeToggle />
        </div>
      </div>
    </header>

    <main class="main">
      <RouterView v-slot="{ Component }">
        <Transition name="deck" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </Transition>
      </RouterView>
    </main>

    <footer class="footer">
      <span>{{ SITE.en }} © {{ year }}</span>
      <span>
        <a :href="SITE.github" target="_blank" rel="noopener noreferrer">github.com/mikubug</a>
      </span>
      <span>{{ SITE.full }}</span>
    </footer>
  </div>

  <MusicPlayer />
</template>
