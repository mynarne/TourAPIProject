export function registerServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').then((registration) => {
      console.info('LinkSuwon Service Worker가 등록되었습니다.', registration.scope);
    }).catch(() => {
      console.info('Service Worker를 등록하지 못했습니다.');
    });
  });
}
