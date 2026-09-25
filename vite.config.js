import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

/* history 路由要求资源走绝对路径，深层地址下相对路径会 404。
   默认部署在站点根；子路径部署用 VITE_BASE 覆盖，例如 VITE_BASE=/site/ npm run build */
const base = process.env.VITE_BASE || '/';

/* 把 public/404.html 里的 __BASE__ 换成真实 base（构建后处理） */
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
