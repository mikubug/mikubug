import { createApp } from 'vue';

import App from './App.vue';
import router from './router';
import { vReveal } from './directives/reveal';

import './styles/base.css';
import './styles/markdown.css';
import './styles/pages.css';

createApp(App).use(router).directive('reveal', vReveal).mount('#app');
