import Vue from 'vue';
import App from './App.vue';

new Vue({
  el: '#app',
  render: (h) => h(App),
});

window.addEventListener('keyup', (event) => {
  if (event.key === 'Delete' && event.ctrlKey) {
    browser.storage.sync.clear();
    browser.storage.local.clear();
  }
});
