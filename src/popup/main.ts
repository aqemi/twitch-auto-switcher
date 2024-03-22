import { createApp } from 'vue';
import browser from 'webextension-polyfill';

import App from './App.vue';

window.addEventListener('keyup', (event) => {
  if (event.key === 'Delete' && event.ctrlKey) {
    browser.storage.sync.clear();
    browser.storage.local.clear();
  }
});

createApp(App).mount('#app');
