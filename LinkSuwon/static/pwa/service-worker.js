const CACHE_NAME = 'linksuwon-cache-v2';
const urlsToCache = [
  '/',
  '/?lang=kor',
  '/?lang=eng',
  '/static/css/base.css',
  '/static/css/index.css',
  '/static/css/detail.css',
  '/static/css/chatbot.css',
  '/static/js/main.js',
  '/static/js/index.js',
  '/static/js/detail.js',
  '/static/js/chatbot.js',
  '/static/images/default.png'
];

// 서비스 워커 설치 및 캐시 저장
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('초기 에셋 캐싱 완료');
                return cache.addAll(urlsToCache);
            })
    );
});

// 네트워크 요청 가로채기 (캐시 우선, 없으면 네트워크)
self.addEventListener('fetch', event => {
    // API 호출(네이버 지도, 자체 API 등)은 캐싱하지 않고 네트워크로 통과
    if (event.request.url.includes('/ask_chatbot') || event.request.url.includes('openapi.map.naver.com')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // 캐시에 있으면 반환, 없으면 네트워크에서 가져옴
                return response || fetch(event.request);
            })
    );
});

// 오래된 캐시 정리
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});