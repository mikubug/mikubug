/* ============================================================
   路由表 —— history 模式(真路由)
   地址栏是 /works/xxx 这样的真路径,没有 #。
   代价:静态托管需要把未知路径回退到 index.html,
   本项目已内置 public/404.html 兜底(GitHub Pages 等纯静态也能跑)。
   ============================================================ */

import { createRouter, createWebHistory } from 'vue-router';

import HomeView from '../views/HomeView.vue';
import NoticeView from '../views/NoticeView.vue';
import WorksView from '../views/WorksView.vue';
import WorkDetailView from '../views/WorkDetailView.vue';
import AboutView from '../views/AboutView.vue';
import JoinView from '../views/JoinView.vue';
import NotFoundView from '../views/NotFoundView.vue';

/* base 与 Vite 的 base 保持一致:默认站点根,子路径部署时用 VITE_BASE 覆盖 */
const BASE = import.meta.env.BASE_URL || '/';

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/notice', name: 'notice', component: NoticeView },
  { path: '/works', name: 'works', component: WorksView },
  { path: '/works/:file', name: 'work', component: WorkDetailView },
  { path: '/about', name: 'about', component: AboutView },
  { path: '/join', name: 'join', component: JoinView },
  { path: '/:pathMatch(.*)*', name: 'notfound', component: NotFoundView },
];

export default createRouter({
  history: createWebHistory(BASE),
  routes,
  scrollBehavior: (to, from, saved) => saved || { top: 0 },
});
