const VERSION = 'linksuwon-react-v1';
const SHELL_CACHE = `${VERSION}-shell`;
const TOUR_CACHE = `${VERSION}-tour`;
const SHELL_URLS = ['/', '/index.html', '/offline.html', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_URLS).catch(() => undefined)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(Promise.all([
    caches.keys().then((keys) => Promise.all(keys.filter((key) => ![SHELL_CACHE, TOUR_CACHE].includes(key)).map((key) => caches.delete(key)))),
    self.clients.claim(),
  ]));
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || request.method !== 'GET') return;

  const path = url.pathname;
  if (path.startsWith('/api/v1/auth/') || path.startsWith('/api/v1/records/') || path === '/api/v1/records' || path.startsWith('/api/v1/chatbot/') || path.startsWith('/uploads/') || path.startsWith('/static/uploads/')) {
    event.respondWith(fetch(request));
    return;
  }

  if (path.startsWith('/api/v1/tour/') || path === '/api/v1/traffic') {
    event.respondWith(networkFirst(request, TOUR_CACHE));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/index.html').then((response) => response || caches.match('/offline.html'))));
    return;
  }

  event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
    if (response.ok && url.pathname.startsWith('/assets/')) {
      const copy = response.clone(); void caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
    }
    return response;
  })));
});

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) { const cache = await caches.open(cacheName); await cache.put(request, response.clone()); }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response(JSON.stringify({ success: false, data: null, message: '인터넷 연결이 필요합니다.' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
  }
}
