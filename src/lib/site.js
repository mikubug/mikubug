/* 站点全局配置 —— 改这里即可换名字 / 链接 / 资源 */

export const SITE = {
  en: 'MIKUBUG',
  cn: '凌云社',
  full: '周南梅溪湖中学凌云社',
  tagline: '探索前沿技术 · 汇聚创造力量',
  github: 'https://github.com/mikubug',
  logo: import.meta.env.BASE_URL + 'assets/logo.png',
};

/** 主导航（首页不在导航里，由左上角 Logo 承载） */
export const NAV = [
  { path: '/notice', label: '公告', en: 'NOTICE' },
  { path: '/works', label: '成果', en: 'WORKS' },
  { path: '/about', label: '关于', en: 'ABOUT' },
  { path: '/join', label: '加入', en: 'JOIN' },
];
