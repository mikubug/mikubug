/* theme.js — 主题 light / dark
   没手动切换过就跟随系统 prefers-color-scheme（系统变了也跟着变）；
   手动切过一次就记进 localStorage（mikubug.theme），之后不再跟随。
   index.html 有同逻辑的内联脚本，负责首屏防闪色。 */

import { ref } from 'vue';

const KEY = 'mikubug.theme';

/** 手动选择过的主题；从没选过返回 null（= 跟随系统） */
function manualTheme() {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'light' || v === 'dark') return v;
  } catch {
    /* 隐私模式可能禁用 localStorage */
  }
  return null;
}

/** 系统当前是否深色 */
const systemDark = () =>
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false;

/** 当前主题（响应式）；初始值：手动记录优先，否则跟随系统 */
export const theme = ref(manualTheme() || (systemDark() ? 'dark' : 'light'));

/** 是否深色 */
export const isDark = () => theme.value === 'dark';

/** 把主题落到 <html>；persist=false 表示这次改动不算"手动选择" */
export function applyTheme(value, persist = true) {
  theme.value = value;
  const root = document.documentElement;
  root.dataset.theme = value;
  root.style.colorScheme = value;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', value === 'dark' ? '#1a1a1a' : '#f3f6f9');

  if (persist) {
    try { localStorage.setItem(KEY, value); } catch { /* 忽略 */ }
  }
}

/** 切换主题；origin 传 { x, y } 时圆形揭示从该点展开 */
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

/** 还没手动切过时，系统明暗变化就跟着变 */
export function followSystemTheme() {
  if (typeof window === 'undefined' || !window.matchMedia) return;
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', () => {
    if (manualTheme()) return; // 手动选过就不再跟随
    applyTheme(mq.matches ? 'dark' : 'light', false);
  });
}
