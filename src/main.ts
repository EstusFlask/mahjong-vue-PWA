import { createApp } from 'vue'

import App from './App.vue'

import router from './router'

createApp(App).use(router).mount('#app')

if (process.env.NODE_ENV === 'production' && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${process.env.BASE_URL}sw.js`).catch(error => {
      console.error('Service worker registration failed:', error)
    })
  })
}
