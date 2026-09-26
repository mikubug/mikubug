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
import { theme } from './lib/theme';
import { flushReveal, forceReveal } from './directives/reveal';

const route = useRoute();
const router = useRouter();

const year = new Date().getFullYear();
const ready = ref(false);
const scrolled = ref(false);

/* 顶部进度条(路由切换反馈) */
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

/* 顶栏：桌面通栏横条，窄屏收成右上角一个按钮，点开向下展开 */

const menuOpen = ref(false);

const closeMenu = () => { menuOpen.value = false; };
const toggleMenu = () => { menuOpen.value = !menuOpen.value; };

/** 点岛外任意处收起 */
const onDocPointerDown = (e) => {
  if (!menuOpen.value) return;
  const nav = document.querySelector('.island');
  if (nav && !nav.contains(e.target)) closeMenu();
};

/* 导航高亮:成果详情页也点亮「成果」 */
const activePath = computed(() => (route.path.startsWith('/works') ? '/works' : route.path));

/* Logo 是艺术字，明暗各一份，跟着主题换（手动切和跟随系统都会走到这里） */
const brandLogo = computed(() => (theme.value === 'dark' ? SITE.logoDark : SITE.logo));

/* 路由切换:收起播放器(音乐继续播)、收起菜单、补一次进场检查 */
watch(
  () => route.fullPath,
  () => {
    closeMenu();
    if (route.path !== '/join') music.hide();
    nextTick(() => requestAnimationFrame(flushReveal));
  }
);

/* 滚动:灵动岛进入压缩态 */
const onScroll = () => { scrolled.value = window.scrollY > 12; };

/* Esc 收起菜单 */
const onKey = (e) => { if (e.key === 'Escape') closeMenu(); };

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  document.addEventListener('pointerdown', onDocPointerDown);
  window.addEventListener('keydown', onKey);

  // 首屏淡入
  requestAnimationFrame(() => { ready.value = true; });

  // 兜底:2 秒后强制显示仍未触发的进场元素,绝不让内容永不可见
  setTimeout(forceReveal, 2000);
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
  document.removeEventListener('pointerdown', onDocPointerDown);
  window.removeEventListener('keydown', onKey);
});
</script>

<template>
  <FxBackground />
  <IntroScreen />

  <div class="shell" :class="{ ready }">
    <div class="progress" :class="{ on: bar.on }" :style="{ width: bar.width }"></div>

    <header class="navbar" :class="{ scrolled, open: menuOpen }">
      <div class="island">
        <!-- 岛面第一行：品牌 / 导航 / 工具 -->
        <div class="island-row">
          <!-- 品牌位只有艺术字 logo，社名由 logo 本身承担 -->
          <RouterLink to="/" class="brand" :aria-label="`${SITE.en} ${SITE.cn} 首页`" @click="closeMenu">
            <img class="brand-logo" :src="brandLogo" :alt="`${SITE.en} · ${SITE.cn}`" width="200" height="65" />
          </RouterLink>

          <nav class="nav-links" aria-label="主导航">
            <RouterLink
              v-for="n in NAV"
              :key="n.path"
              :to="n.path"
              class="nav-link"
              :class="{ active: activePath === n.path }"
            >
              {{ n.label }}
            </RouterLink>
          </nav>

          <div class="island-tools">
            <ThemeToggle class="island-switch" />

            <button
              class="island-btn"
              type="button"
              aria-controls="island-menu"
              :aria-expanded="menuOpen ? 'true' : 'false'"
              :aria-label="menuOpen ? '收起导航' : '展开导航'"
              :title="menuOpen ? '收起导航' : '展开导航'"
              @click="toggleMenu"
            >
              <span class="island-burger" aria-hidden="true"><i></i><i></i><i></i></span>
            </button>
          </div>
        </div>

        <!-- 岛面第二行：窄屏下拉（桌面端隐藏） -->
        <div id="island-menu" class="island-menu" :class="{ show: menuOpen }">
          <div class="island-menu-clip">
            <nav class="island-list" aria-label="导航">
              <RouterLink
                v-for="n in NAV"
                :key="n.path"
                :to="n.path"
                class="island-item"
                :class="{ active: activePath === n.path }"
                @click="closeMenu"
              >
                <span class="island-item-label">{{ n.label }}</span>
                <span class="island-item-en">{{ n.en }}</span>
              </RouterLink>
            </nav>

            <div class="island-menu-foot">
              <span class="island-menu-key">明暗风格</span>
              <ThemeToggle />
            </div>
          </div>
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
      <!-- 原来放校名文字的位置，现在换成校徽，点开学校官网 -->
      <a
        class="footer-school"
        :href="SITE.school"
        target="_blank"
        rel="noopener noreferrer"
        title="长沙市周南梅溪湖中学"
      >
        <img :src="SITE.schoolLogo" alt="长沙市周南梅溪湖中学" />
      </a>
    </footer>
  </div>

  <MusicPlayer />
</template>
