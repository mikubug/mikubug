import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  /**
   * 相对基础路径:
   *  - 可部署到任意子目录(如 GitHub Pages 的 /mikubug-site/)
   *  - 也可直接用 `npm run preview` 在本地打开
   * 所有资源引用都走 import.meta.env.BASE_URL,不要写死 '/'。
   */
  base: './',

  plugins: [vue()],

  server: { port: 5173, open: false },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // 站点很小,不拆包,首屏一次到位,路由切换零延迟
    chunkSizeWarningLimit: 1200,
  },
});
