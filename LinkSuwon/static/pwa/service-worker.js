const CACHE_NAME = 'linksuwon-cache-v1.0.2';
const urlsToCache = [
  '/offline',
  '/static/css/base.css',
  '/static/js/storage.js',
  '/static/js/sync.js',
  '/static/js/spot.js',
  '/static/js/saved.js',
  '/static/js/record.js',
  '/static/js/profile.js',
  '/static/js/chatbot.js',
  '/static/js/detail.js',
  '/static/images/default.png',
  
  // 오프라인 지형도 안내 대체 이미지 자산 캐싱
  'https://images.unsplash.com/photo-1627068593444-245781a74d28?q=80&w=600',
  'https://images.unsplash.com/photo-1627068593444-245781a74d28?q=80&w=1200',

  // CDN 외부 라이브러리 및 폰트 캐싱
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://fastly.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200'
];

// 서비스 워커 설치 및 캐시 저장
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('초기 에셋 캐싱 완료');
                return cache.addAll(urlsToCache);
            })
    );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', event => {
    // 1. API 호출 및 지도 API 등은 네트워크로 즉시 통과
    if (event.request.url.includes('/ask_chatbot') || 
        event.request.url.includes('/api/') || 
        event.request.url.includes('openapi.map.naver.com')) {
        event.respondWith(fetch(event.request));
        return;
    }

    // 2. HTML 페이지 요청은 무조건 네트워크 우선 (Network First)
    if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match('/offline');
            })
        );
        return;
    }

    // 3. 기타 정적 리소스는 캐시 우선 (Cache First)
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});

// 오래된 캐시 정리
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheWhitelist.indexOf(cacheName) === -1) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
        ])
    );
});