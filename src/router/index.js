/* ============================================================
   路由表 —— hash 模式
   纯静态部署无需服务器 rewrite,任何静态托管都能直接用。
   ============================================================ */

import { createRouter, createWebHashHistory } from 'vue-router';

import HomeView from '../views/HomeView.vue';
import NoticeView from '../views/NoticeView.vue';
import WorksView from '../views/WorksView.vue';
import WorkDetailView from '../views/WorkDetailView.vue';
import AboutView from '../views/AboutView.vue';
import JoinView from '../views/JoinView.vue';
import NotFoundView from '../views/NotFoundView.vue';

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
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});
