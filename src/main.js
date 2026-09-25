import { createApp } from 'vue';

import App from './App.vue';
import router from './router';
import { vReveal } from './directives/reveal';
import { followSystemTheme } from './lib/theme';

import './styles/tokens.css';   // 设计令牌，必须最先加载
import './styles/base.css';
import './styles/markdown.css';
import './styles/pages.css';

followSystemTheme(); // 未手动切换主题时跟随系统明暗

createApp(App).use(router).directive('reveal', vReveal).mount('#app');
