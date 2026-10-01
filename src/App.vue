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

/* 顶栏：宽屏摊开导航项，窄屏收起灵动岛只留 Logo + 菜单按钮；所有导航都能从菜单按钮的下拉面板进入 */

const menuOpen = ref(false);

const closeMenu = () => { menuOpen.value = false; };
const toggleMenu = () => { menuOpen.value = !menuOpen.value; };

/* 背景轨道：全站常驻在右下角，随指针轻微视差
   用视口相对位移写到根元素上，和主视觉那套系数是同一套语义 */

let parRaf = 0;
let pTx = 0, pTy = 0, pCx = 0, pCy = 0;

const parTick = () => {
  pCx += (pTx - pCx) * 0.09;
  pCy += (pTy - pCy) * 0.09;

  if (Math.abs(pTx - pCx) < 0.08 && Math.abs(pTy - pCy) < 0.08) {
    pCx = pTx;
    pCy = pTy;
    parRaf = 0;
  } else {
    parRaf = requestAnimationFrame(parTick);
  }

  const root = document.documentElement;
  root.style.setProperty('--px', `${pCx.toFixed(2)}px`);
  root.style.setProperty('--py', `${pCy.toFixed(2)}px`);
};

const parStart = () => { if (!parRaf) parRaf = requestAnimationFrame(parTick); };

const onParMove = (e) => {
  pTx = (e.clientX / window.innerWidth - 0.5) * 16;
  pTy = (e.clientY / window.innerHeight - 0.5) * 12;
  parStart();
};

const onParLeave = () => { pTx = 0; pTy = 0; parStart(); };

/** 点岛外任意处收起 */
const onDocPointerDown = (e) => {
  if (!menuOpen.value) return;
  const nav = document.querySelector('.island');
  if (nav && !nav.contains(e.target)) closeMenu();
};

/* 导航高亮:成果详情页也点亮「成果」 */
const activePath = computed(() => (route.path.startsWith('/works') ? '/works' : route.path));

/* 选中指示条：一颗会滑动的短条，跟着当前项走（比每项各自长一根更顺眼） */
const navEl = ref(null);
const ind = reactive({ left: 0, width: 18, on: false });

const syncInd = () => {
  const box = navEl.value;
  const el = box && box.querySelector('.nav-link.active');
  if (!box || !el || !el.offsetWidth) {
    ind.on = false;
    return;
  }
  // 指示条固定 18px 宽，居中挂在当前项下方
  ind.width = 18;
  ind.left = el.offsetLeft + (el.offsetWidth - 18) / 2;
  ind.on = true;
};

let indRaf = 0;
const queueSyncInd = () => {
  cancelAnimationFrame(indRaf);
  indRaf = requestAnimationFrame(syncInd);
};

/* Logo 是艺术字，明暗各一份，跟着主题换（手动切和跟随系统都会走到这里） */
const brandLogo = computed(() => (theme.value === 'dark' ? SITE.logoDark : SITE.logo));

/* 路由切换:收起播放器(音乐继续播)、收起菜单、补一次进场检查 */
watch(
  () => route.fullPath,
  () => {
    closeMenu();
    if (route.path !== '/join') music.hide();
    nextTick(() => {
      requestAnimationFrame(flushReveal);
      queueSyncInd();
    });
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
  window.addEventListener('resize', queueSyncInd);

  // 只有带指针的设备才做视差，触屏省电
  if (window.matchMedia('(hover: hover)').matches) {
    window.addEventListener('pointermove', onParMove, { passive: true });
    document.addEventListener('pointerleave', onParLeave);
  }

  // 首屏淡入
  requestAnimationFrame(() => { ready.value = true; });

  // 指示条等字体/布局稳定后再定位，然后解锁滑入动画
  nextTick(syncInd);
  document.fonts?.ready.then(queueSyncInd);

  // 兜底:2 秒后强制显示仍未触发的进场元素,绝不让内容永不可见
  setTimeout(forceReveal, 2000);
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
  document.removeEventListener('pointerdown', onDocPointerDown);
  window.removeEventListener('keydown', onKey);
  window.removeEventListener('resize', queueSyncInd);
  window.removeEventListener('pointermove', onParMove);
  document.removeEventListener('pointerleave', onParLeave);
  cancelAnimationFrame(indRaf);
  cancelAnimationFrame(parRaf);
});
</script>

<template>
  <FxBackground />
  <IntroScreen />

  <!-- 右下角动态背景：品牌轨道环，全站常驻（不再只在首页）
       外层吃指针视差，内层做自然浮动，两层各管一件事 -->
  <div class="site-orbit" aria-hidden="true">
    <div class="site-orbit-inner">
      <span class="orbit-ring"></span>
      <span class="orbit-ring inner"></span>
      <span class="orbit-ring dashed"></span>
      <span class="orbit-core"></span>
      <span class="orbit-node n1"></span>
      <span class="orbit-node n2"></span>
      <span class="orbit-node n3"></span>
    </div>
  </div>

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

          <nav ref="navEl" class="nav-links" aria-label="主导航">
            <!-- 当前项指示条：位置由 JS 算，切换路由时滑过去 -->
            <span
              class="nav-ind"
              aria-hidden="true"
              :style="{ left: `${ind.left}px`, width: `${ind.width}px`, opacity: ind.on ? 1 : 0 }"
            ></span>
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

        <!-- 顶栏第二行：由菜单按钮展开的下拉面板（默认收起，窄屏才启用） -->
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
              <span class="island-menu-key">外观模式</span>
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
    </footer>
  </div>

  <MusicPlayer />
</template>
