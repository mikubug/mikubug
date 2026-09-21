import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

/**
 * history 路由要求资源走绝对路径:
 * 深层地址(/works/xxx)下相对路径会解析成 /works/assets/... 而 404。
 * 默认部署在站点根(GitHub Pages 的 mikubug.github.io);子路径部署用 VITE_BASE 覆盖,例如
 *   VITE_BASE=/site/ npm run build
 */
const base = process.env.VITE_BASE || '/';

/**
 * 把 public/404.html 里的 __BASE__ 换成真实 base。
 * 那份 404.html 是纯静态托管的 SPA 回退:服务器找不到路径时返回它,
 * 它把目标路径存进 sessionStorage 再跳回入口,由 index.html 还原。
 */
function spaFallback() {
  let outDir = 'dist';

  return {
    name: 'mikubug-spa-fallback',
    apply: 'build',
    configResolved(cfg) {
      outDir = cfg.build.outDir;
    },
    async closeBundle() {
      const file = resolve(outDir, '404.html');
      const html = await readFile(file, 'utf8');
      await writeFile(file, html.replace(/__BASE__/g, base), 'utf8');
    },
  };
}

export default defineConfig({
  base,
  plugins: [vue(), spaFallback()],

  server: { port: 5173, open: false },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // 站点很小,不拆包,首屏一次到位,路由切换零延迟
    chunkSizeWarningLimit: 1200,
  },
});
