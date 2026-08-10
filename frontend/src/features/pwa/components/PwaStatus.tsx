import { useEffect, useState } from 'react';
import { useLanguage } from '../../../i18n';

export function PwaStatus() {
  const { t } = useLanguage();
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
  return <>{!online && <div className="sticky top-0 z-50 bg-amber-100 px-4 py-2 text-center text-xs font-bold text-amber-900">{t('offline_notice')}</div>}{online && prompt && !installed && <div className="sticky top-0 z-50 flex items-center justify-center gap-3 bg-blue-50 px-4 py-2 text-xs text-blue-900"><span>{t('install_app')}</span><button type="button" onClick={() => void install()} className="rounded-lg bg-suwon px-3 py-1.5 font-bold text-white">{t('install')}</button><button type="button" onClick={() => setPrompt(null)} className="text-blue-700">{t('close')}</button></div>}</>;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}
