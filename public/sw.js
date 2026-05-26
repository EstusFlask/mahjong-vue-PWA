const CACHE_NAME = 'mahjong-vue-pwa-v1'

const APP_SHELL = [
  './',
  './manifest.webmanifest',
  './favicon.ico',
  './img/icons/pwa-192x192.png',
  './img/icons/pwa-512x512.png',
  './img/icons/apple-touch-icon.png'
]

const fromScope = path => new URL(path, self.registration.scope).toString()

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL.map(fromScope)))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  const { request } = event

  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, fromScope('./')))
    return
  }

  event.respondWith(cacheFirst(request))
})

async function networkFirst(request, fallbackUrl) {
  const cache = await caches.open(CACHE_NAME)

  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    return (await caches.match(request)) || caches.match(fallbackUrl)
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached

  const response = await fetch(request)
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME)
    cache.put(request, response.clone())
  }
  return response
}
