/* ============================================================
   主题状态 —— light / dark
   - 首次访问跟随系统偏好,之后记在 localStorage
   - 切换时若有 View Transitions 支持,做一圈圆形揭示
   - index.html 里有同逻辑的内联脚本,负责首屏防闪烁
   ============================================================ */

import { ref } from 'vue';

const KEY = 'mikubug.theme';

/** 读取初始主题:本地记录优先,没有记录则默认浅色 */
function readTheme() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    /* 隐私模式下 localStorage 可能不可用 */
  }
  return 'light';
}

/** 当前主题(响应式,模板里可直接用) */
export const theme = ref(readTheme());

/** 是否深色 */
export const isDark = () => theme.value === 'dark';

/** 把主题落到 <html> 上 */
export function applyTheme(value, persist = true) {
  theme.value = value;
  const root = document.documentElement;
  root.dataset.theme = value;
  root.style.colorScheme = value;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', value === 'dark' ? '#04060c' : '#f2f7fc');

  if (persist) {
    try { localStorage.setItem(KEY, value); } catch { /* 忽略 */ }
  }
}

/** 切换主题;origin 传 { x, y } 时圆形揭示从该点展开 */
export function toggleTheme(origin) {
  const next = theme.value === 'light' ? 'dark' : 'light';
  const x = origin?.x ?? window.innerWidth - 80;
  const y = origin?.y ?? 40;

  const root = document.documentElement;
  root.style.setProperty('--vt-x', `${Math.round(x)}px`);
  root.style.setProperty('--vt-y', `${Math.round(y)}px`);

  // 支持 View Transitions:圆形揭示;否则退回全局色彩过渡
  if (typeof document.startViewTransition === 'function') {
    document.startViewTransition(() => applyTheme(next));
    return;
  }

  root.classList.add('theme-anim');
  applyTheme(next);
  window.setTimeout(() => root.classList.remove('theme-anim'), 560);
}

/** 系统偏好变化时不再自动跟随 —— 主题只由用户手动决定 */
