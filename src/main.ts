import { createApp } from 'vue'

import App from './App.vue'

import router from './router'

const isIosDevice = typeof navigator !== 'undefined'
  && (/iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))
const safariNavigator = typeof navigator !== 'undefined'
  ? navigator as Navigator & { standalone?: boolean }
  : null
const isStandalone = typeof window !== 'undefined'
  && (safariNavigator?.standalone === true
    || (typeof window.matchMedia === 'function'
      && window.matchMedia('(display-mode: standalone)').matches))
const isIosStandalone = isIosDevice && isStandalone

createApp(App).use(router).mount('#app')

if (isIosStandalone && typeof window !== 'undefined') {
  /* iOS can finish the standalone viewport after Vue has mounted. Reuse the
   * same resize path as a real rotation so the glass component recalculates
   * its bounds without changing any of its visual layers. */
  const refreshStandaloneLayout = () => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        window.dispatchEvent(new Event('resize'))
      })
    })
  }

  refreshStandaloneLayout()
  window.addEventListener('load', refreshStandaloneLayout, { once: true, passive: true })
  window.visualViewport?.addEventListener('resize', refreshStandaloneLayout, {
    once: true,
    passive: true,
  })
}

if (process.env.NODE_ENV === 'production' && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${process.env.BASE_URL}sw.js`).catch(error => {
      console.error('Service worker registration failed:', error)
    })
  })
}
