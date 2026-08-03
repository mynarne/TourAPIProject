import { useEffect, useState } from 'react';

export type NaverMapScriptStatus = 'idle' | 'loading' | 'ready' | 'error';

let scriptPromise: Promise<void> | null = null;

function loadScript(clientId: string): Promise<void> {
  if (window.naver?.maps) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-linksuwon-naver-map]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('네이버 지도 SDK 로드 실패')));
      return;
    }

    const script = document.createElement('script');
    script.dataset.linksuwonNaverMap = 'true';
    script.async = true;
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(clientId)}&language=ko`;
    script.onload = () => {
      if (window.naver?.maps) resolve();
      else reject(new Error('네이버 지도 SDK 객체를 찾을 수 없습니다.'));
    };
    script.onerror = () => reject(new Error('네이버 지도 SDK 로드 실패'));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export function useNaverMapScript(enabled = true) {
  const [status, setStatus] = useState<NaverMapScriptStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setStatus('idle');
      return;
    }

    const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID;
    if (!clientId) {
      setStatus('error');
      setError('네이버 지도 Client ID가 설정되지 않았습니다.');
      return;
    }

    setStatus('loading');
    setError(null);
    loadScript(clientId)
      .then(() => setStatus('ready'))
      .catch((loadError: Error) => {
        setStatus('error');
        setError(loadError.message);
      });
  }, [enabled]);

  return { status, error };
}
