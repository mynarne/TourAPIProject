import { useEffect, useRef, useState } from 'react';

type Props = { onCredential: (credential: string) => void; disabled?: boolean };
let googleScriptPromise: Promise<void> | null = null;

function loadGoogleScript() {
  if (window.google) return Promise.resolve();
  if (googleScriptPromise) return googleScriptPromise;
  googleScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-google-gis]');
    if (existing) { existing.addEventListener('load', () => resolve()); existing.addEventListener('error', () => reject(new Error('Google 로그인 SDK를 불러오지 못했습니다.'))); return; }
    const script = document.createElement('script'); script.src = 'https://accounts.google.com/gsi/client'; script.async = true; script.defer = true; script.dataset.googleGis = 'true'; script.onload = () => resolve(); script.onerror = () => reject(new Error('Google 로그인 SDK를 불러오지 못했습니다.')); document.head.appendChild(script);
  });
  return googleScriptPromise;
}

export function GoogleSignInButton({ onCredential, disabled = false }: Props) {
  const container = useRef<HTMLDivElement>(null); const [error, setError] = useState('');
  useEffect(() => { let active = true; void loadGoogleScript().then(() => { if (!active || !container.current) return; const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID; if (!clientId) { setError('Google Client ID가 설정되지 않았습니다.'); return; } window.google.accounts.id.initialize({ client_id: clientId, callback: (response) => onCredential(response.credential), auto_select: false, cancel_on_tap_outside: true }); window.google.accounts.id.renderButton(container.current, { theme: 'outline', size: 'large', type: 'standard', shape: 'pill', text: 'signin', logo_alignment: 'left' }); }).catch((loadError) => { if (active) setError(loadError instanceof Error ? loadError.message : 'Google 로그인을 준비하지 못했습니다.'); }); return () => { active = false; }; }, [onCredential]);
  return <div className={disabled ? 'pointer-events-none opacity-50' : ''}><div ref={container} className="min-h-10" />{error && <p className="mt-2 text-xs text-red-600">{error}</p>}</div>;
}
