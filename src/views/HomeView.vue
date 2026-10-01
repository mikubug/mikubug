<script setup>
/**
 * 首页 —— 像搜索引擎入口那样：中间一栏居中
 * 凌云社（故障字）→ MikuBug Studio → 搜索框（打字机提示）＋尾部的两个图标入口
 * 输入后回车，直接把关键词带进 /works 的搜索；下方是四个入口卡
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { SITE } from '../lib/site';

const router = useRouter();

const ENTRIES = [
  { path: '/notice', code: '01', en: 'NOTICE', label: '公告', desc: '社团通知与动态' },
  { path: '/works', code: '02', en: 'WORKS', label: '成果', desc: '文档 · 项目 · 记录' },
  { path: '/about', code: '03', en: 'ABOUT', label: '关于', desc: '我们是谁' },
  { path: '/join', code: '04', en: 'JOIN', label: '加入', desc: '成为我们的一员' },
];

/* 搜索：输入 → 回车 → /works?q=关键词 */

const q = ref('');
const inputEl = ref(null);
const focused = ref(false);

const onSearch = () => {
  const kw = q.value.trim();
  router.push({ path: '/works', query: kw ? { q: kw } : {} });
};

/* 打字机提示：打字 → 停留 → 整段清空 → 换下一句
   用独立的浮层元素画，输入框的 placeholder 只留无障碍文案；
   用户一旦聚焦或输入就停播，把位置完全让给人 */

const LINES = [

  'Maker Intellengent Key Union',

  '探索前沿技术 汇聚创造力量',

  '从想法出发 把创意变成现实',

  'DeepSeek 不要吃白饭了！！！',

  '让每一个奇思妙想落地',

  '做真正有意思的东西',

  '欢迎来到凌云社',

  'Welcome MikuBug!',

  '100 行代码，但是有 1000 行报错...',

  '看我把你 MikuMiku 掉！',

  '初始之音，响彻未来！',

  '华风夏韵，洛水天依！',

  '乐正司百曲，绫动万年红！',

  '言出一人歌，歌起万人和！',

  '小笼包，叉烧包，还有芝麻奶黄包...',

  '少年意气，凌云而上',

  '共同努力，探索未至之境',

  '学校第一大科技社团！',

  '你的下一个 ACG 社，何必是 ACG 社？',

  '这里，是我们的凌云社',

  '人民万岁！',

  '星星之火，可以燎原',

  '全世界无产者，联合起来！',

  'Наша цель — коммунизм!',

  '科技服务人民',

  '坚持改革开放理念',

  '#include<bits/stdc++.h>',

  '把零件拼成一个世界',

  '实践是检验真理的唯一标准',
  
  '这里是科技社，也是 ACG 社',

  '让兴趣成为创造力',

  '每一次尝试都值得记录',

  '凌云而上，探索无限',

  '这个世界任你塑造。'

];

const typed = ref('');
let line = Math.floor(Math.random() * LINES.length);
let chars = 0;
let phase = 'type';
let holdLeft = 0;
let timer = 0;

let paused = false;    // 聚焦等临时停播，可以恢复
let dismissed = false; // 用户已经输入过内容，再也不自播

/** 提示层是否显示：输入框空着、没聚焦、没被用户接管 */
const showTyped = computed(() => !q.value && !focused.value && !dismissed.value);

const step = () => {
  if (paused || dismissed) return;
  const text = LINES[line];

  if (phase === 'type') {
    chars += 1;
    typed.value = text.slice(0, chars);
    if (chars >= text.length) {
      phase = 'hold';
      holdLeft = 11; // 打完停住约 2.2s
    }
    timer = setTimeout(step, chars === 1 ? 260 : 68); // 首字稍慢
    return;
  }

  if (phase === 'hold') {
    if (holdLeft-- > 0) {
      timer = setTimeout(step, 200);
    } else {
      phase = 'erase';
      timer = setTimeout(step, 120);
    }
    return;
  }

  // 整段清掉再换行；下一句随机挑，不和刚打完的重复
  typed.value = '';
  phase = 'type';
  let n = line;
  while (n === line) n = Math.floor(Math.random() * LINES.length);
  line = n;
  chars = 0;
  timer = setTimeout(step, 380);
};

/** 暂停（聚焦时）：定住当前这句，别在光标旁边跳动 */
const pauseTyping = () => {
  if (dismissed) return;
  paused = true;
  clearTimeout(timer);
  timer = 0;
};

/** 恢复：重新起一轮，从当前这句的开头打 */
const resumeTyping = () => {
  if (dismissed || timer) return;
  paused = false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    typed.value = LINES[line];
    return;
  }
  chars = 0;
  phase = 'type';
  typed.value = '';
  timer = setTimeout(step, 320);
};

/** 用户输入过内容：永久停播 */
const dismissTyping = () => {
  dismissed = true;
  paused = true;
  clearTimeout(timer);
  timer = 0;
  typed.value = '';
};

const onFocus = () => {
  focused.value = true;
  pauseTyping();
};

const onBlur = () => {
  focused.value = false;
  resumeTyping();
};

/** 手输兜底：个别输入不经 v-model（如合成输入）也能同步并停播 */
const onInput = (e) => {
  q.value = e.target.value;
  if (q.value) dismissTyping();
};

/* 标题故障闪：随机间隔抖一下，每次随机换一种形态，节奏不规律才像故障 */

const FX = ['1', '2', '3', '4'];
const inkEl = ref(null);
let flickerTimer = 0;
let offTimer = 0;

const stopFlicker = () => {
  const el = inkEl.value;
  if (!el) return;
  el.classList.remove('is-flicker');
  el.removeAttribute('data-fx');
};

/* 动画放完就摘标记；万一 keyframes 没触发，靠兜底定时器收尾 */
const onFlickerEnd = (e) => {
  if (e.target === inkEl.value) stopFlicker();
};

const scheduleFlicker = () => {
  flickerTimer = setTimeout(() => {
    const el = inkEl.value;
    if (el) {
      el.dataset.fx = FX[Math.floor(Math.random() * FX.length)];
      el.classList.add('is-flicker');
      offTimer = setTimeout(stopFlicker, 900);
    }
    scheduleFlicker();
  }, 1200 + Math.random() * 4200);
};

onMounted(() => {
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (still) {
    typed.value = LINES[line]; // 减少动态：只静态显示一句，不循环
    dismissed = true;
  } else {
    timer = setTimeout(step, 520);
    inkEl.value?.addEventListener('animationend', onFlickerEnd);
    scheduleFlicker();
  }
});

onBeforeUnmount(() => {
  clearTimeout(timer);
  clearTimeout(flickerTimer);
  clearTimeout(offTimer);
  inkEl.value?.removeEventListener('animationend', onFlickerEnd);
});
</script>

<template>
  <section class="page page-home">
    <div class="wrap">
      <div class="home-main">
        <!-- 标题区：凌云社 / MikuBug Studio -->
        <h1 class="home-title">
          <span ref="inkEl" class="home-title-ink" :data-text="`${SITE.cn}.`">{{ SITE.cn }}<span class="dot">.</span></span>
        </h1>
        <p class="home-sub">MikuBug Studio</p>

        <!-- 搜索框：打字机提示 + 尾部两个图标入口 -->
        <form class="searchbar" role="search" @submit.prevent="onSearch">
          <span class="searchbar-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" stroke-width="1.7" />
              <path d="M15.4 15.4 20.5 20.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
            </svg>
          </span>

          <span class="searchbar-field">
            <input
              ref="inputEl"
              v-model="q"
              class="searchbar-input"
              type="search"
              name="q"
              autocomplete="off"
              enterkeyhint="search"
              placeholder="搜索标题、作者、标签…"
              :aria-label="`搜索${SITE.cn}的成果`"
              @focus="onFocus"
              @blur="onBlur"
              @input="onInput"
            />
            <!-- 打字机提示层：pointer-events 关掉，点它等于点输入框 -->
            <span v-show="showTyped" class="searchbar-typed" aria-hidden="true">
              <span class="searchbar-typed-text">{{ typed }}</span>
              <span class="searchbar-caret"></span>
            </span>
          </span>

          <div class="searchbar-actions">
            <RouterLink class="searchbar-btn" to="/join" title="加入我们" aria-label="加入我们">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="9.5" cy="8" r="3.6" stroke="currentColor" stroke-width="1.6" />
                <path d="M3.4 19.4c0-3.4 2.7-5.6 6.1-5.6s6.1 2.2 6.1 5.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                <path d="M18.4 4.6v5.6M15.6 7.4h5.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              </svg>
            </RouterLink>

            <RouterLink class="searchbar-btn" to="/works" title="浏览成果" aria-label="浏览成果">
              <!-- 两张叠起来的纸：外层是"后面那张"的轮廓，内层是"前面那张"带文字的纸。
                   刻意让两组线条互不相交，避免线压线显得糊成一团 -->
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M6 6.4V5.5A1.9 1.9 0 0 1 7.9 3.6h6.3l4.4 4.4v9.6a1.9 1.9 0 0 1-1.9 1.9h-1.8"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <rect x="3.6" y="8.6" width="10.4" height="11.8" rx="1.9" stroke="currentColor" stroke-width="1.6" />
                <path d="M6.7 12.4h4.2M6.7 15.4h4.2M6.7 18.4h2.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              </svg>
            </RouterLink>
          </div>
        </form>

        <!-- 整句一个文本节点：拆成多段分别翻译会拼出病句，
             所以链接放在句末单独一段，让主干是一整句 -->
        <p class="home-hint">
          <span>回车即在成果中搜索</span>
          <RouterLink to="/works">浏览成果 →</RouterLink>
        </p>

        <hr class="rule home-rule" />

        <!-- 四个入口卡 -->
        <div class="entry-grid">
          <RouterLink
            v-for="(e, i) in ENTRIES"
            :key="e.path"
            v-reveal="i * 80"
            :to="e.path"
            class="entry"
          >
            <span class="entry-code" aria-hidden="true">{{ e.code }}</span>
            <span class="entry-body">
              <span class="entry-label">{{ e.label }}</span>
              <span class="entry-en">{{ e.en }}</span>
              <span class="entry-desc">{{ e.desc }}</span>
            </span>
            <span class="entry-arrow" aria-hidden="true">→</span>
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
