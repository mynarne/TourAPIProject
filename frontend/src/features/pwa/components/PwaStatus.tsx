import { useEffect, useState } from 'react';

export function PwaStatus() {
  const [online, setOnline] = useState(() => navigator.onLine);
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  useEffect(() => {
    const onOnline = () => setOnline(true); const onOffline = () => setOnline(false); const onPrompt = (event: Event) => { event.preventDefault(); setPrompt(event as BeforeInstallPromptEvent); }; const onInstalled = () => { setInstalled(true); setPrompt(null); };
    setInstalled(window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    window.addEventListener('online', onOnline); window.addEventListener('offline', onOffline); window.addEventListener('beforeinstallprompt', onPrompt); window.addEventListener('appinstalled', onInstalled);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); window.removeEventListener('beforeinstallprompt', onPrompt); window.removeEventListener('appinstalled', onInstalled); };
  }, []);
  async function install() { if (!prompt) return; await prompt.prompt(); setPrompt(null); }
  return <>{!online && <div className="sticky top-0 z-50 bg-amber-100 px-4 py-2 text-center text-xs font-bold text-amber-900">오프라인 상태입니다. 로그인, 챗봇, 기록 저장, 업로드와 지도는 인터넷 연결이 필요합니다.</div>}{online && prompt && !installed && <div className="sticky top-0 z-50 flex items-center justify-center gap-3 bg-blue-50 px-4 py-2 text-xs text-blue-900"><span>LinkSuwon을 앱처럼 설치해 보세요.</span><button type="button" onClick={() => void install()} className="rounded-lg bg-suwon px-3 py-1.5 font-bold text-white">설치</button><button type="button" onClick={() => setPrompt(null)} className="text-blue-700">닫기</button></div>}</>;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}
