/* v-reveal — 滚动进场指令
   用法： v-reveal / v-reveal="120"（120ms 延迟，用于错峰）
   三道兜底，保证内容不会永久不可见：不支持 IntersectionObserver 立即显示、
   路由切换后补查首屏元素、2 秒后强制全部显示。 */

const hasIO = typeof IntersectionObserver !== 'undefined';

let io = null;

if (hasIO) {
  io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }
  );
}

export const vReveal = {
  mounted(el, binding) {
    el.classList.add('reveal');

    const delay = Number(binding.value) || 0;
    if (delay) el.style.transitionDelay = `${delay}ms`;

    if (!io) {
      el.classList.add('in');
      return;
    }
    io.observe(el);
  },

  unmounted(el) {
    if (io) io.unobserve(el);
  },
};

/** 首屏兜底:已在视口内的元素立即显示 */
export function flushReveal() {
  document.querySelectorAll('.reveal:not(.in)').forEach((n) => {
    const r = n.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.94 && r.bottom > 0) n.classList.add('in');
  });
}

/** 超时兜底:强制显示全部 */
export function forceReveal() {
  document.querySelectorAll('.reveal:not(.in)').forEach((n) => n.classList.add('in'));
}
