// Service Worker — کش کامل برنامه برای کارکرد ۱۰۰٪ آفلاین
// نسخه را در هر بار انتشار جدید فایل index.html افزایش دهید تا کش قدیمی جایگزین شود
const CACHE_VERSION = 'quality-pwa-v3';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-180.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// استراتژی: اول کش (Cache First) با فال‌بک به شبکه، و ذخیرهٔ خودکار پاسخ‌های جدید در کش.
// این یعنی بعد از اولین بار باز شدن برنامه، حتی بدون اینترنت هم کامل کار می‌کند.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
