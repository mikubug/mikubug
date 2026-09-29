/* theme.js — 外观模式：跟随系统 / 浅色 / 深色
   preference 是「用户选的模式」（存 localStorage），theme 是「最终落到 <html> 的明暗」。
   默认 system：跟随 prefers-color-scheme，系统在亮⇄暗之间切换时实时跟着变。
   index.html 有同逻辑的内联脚本，负责首屏防闪色。 */

import { ref } from 'vue';

const KEY = 'mikubug.theme';
const MODES = ['system', 'light', 'dark'];

/** 读用户选择；没存过或存的值不认识 = 跟随系统 */
function stored() {
  try {
    const v = localStorage.getItem(KEY);
    if (MODES.includes(v)) return v;
  } catch {
    /* 隐私模式可能禁用 localStorage */
  }
  return 'system';
}

/** 系统配色媒体查询（不支持时按浅色处理） */
const mq =
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;

/** 系统当前是否深色 */
const systemDark = () => (mq ? mq.matches : false);

/** 按模式算最终明暗 */
const resolve = (mode) => (mode === 'system' ? (systemDark() ? 'dark' : 'light') : mode);

/** 用户选的模式：system / light / dark */
export const preference = ref(stored());

/** 当前主题（响应式）：初始值跟着 preference 走 */
export const theme = ref(resolve(preference.value));

/** 是否深色 */
export const isDark = () => theme.value === 'dark';

/** 是否处于「跟随系统」 */
export const isSystemMode = () => preference.value === 'system';

/** 把明暗落到 <html> 与 theme-color */
function paint(value) {
  const root = document.documentElement;
  root.dataset.theme = value;
  root.style.colorScheme = value;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', value === 'dark' ? '#1a1a1a' : '#f3f6f9');
}

/**
 * 应用某个模式。persist=false 表示这次不是用户点的（比如系统配色变了），不写盘。
 */
export function applyTheme(mode, persist = true) {
  preference.value = MODES.includes(mode) ? mode : 'system';
  theme.value = resolve(preference.value);
  paint(theme.value);

  if (persist) {
    try { localStorage.setItem(KEY, preference.value); } catch { /* 忽略 */ }
  }
}

/** 选模式；origin 传 { x, y } 时圆形揭示从该点展开 */
export function setTheme(mode, origin) {
  if (mode === preference.value) return;

  const x = origin?.x ?? window.innerWidth - 80;
  const y = origin?.y ?? 40;
  const root = document.documentElement;
  root.style.setProperty('--vt-x', `${Math.round(x)}px`);
  root.style.setProperty('--vt-y', `${Math.round(y)}px`);

  // 支持 View Transitions:圆形揭示;否则退回全局色彩过渡
  if (typeof document.startViewTransition === 'function') {
    document.startViewTransition(() => applyTheme(mode));
    return;
  }

  root.classList.add('theme-anim');
  applyTheme(mode);
  window.setTimeout(() => root.classList.remove('theme-anim'), 560);
}

/** 老的两态切换（浅 ⇄ 深，会脱离跟随系统） */
export function toggleTheme(origin) {
  setTheme(theme.value === 'light' ? 'dark' : 'light', origin);
}

/** 跟随系统：system 模式下系统配色一变就跟着变 */
export function followSystemTheme() {
  if (!mq) return;
  mq.addEventListener('change', () => {
    if (preference.value !== 'system') return; // 手动选过就不再跟随
    applyTheme('system', false);
  });
}
