import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import type { TrafficLanguage } from '../api/trafficApi';
import { NaverMapFallback } from '../components/map/NaverMapFallback';
import { TransitRouteCard } from '../features/traffic/components/TransitRouteCard';
import { TrafficMapPanel } from '../features/traffic/components/TrafficMapPanel';
import { TransportInfo } from '../features/traffic/components/TransportInfo';
import { useTraffic } from '../features/traffic/hooks/useTraffic';
import { useTrafficLocation } from '../features/traffic/hooks/useTrafficLocation';

const languageSet = new Set<TrafficLanguage>(['kor', 'eng', 'jpn', 'chs', 'cht']);

export function TrafficPage() {
  const [searchParams] = useSearchParams();
  const rawLanguage = searchParams.get('language') || searchParams.get('lang') || 'kor';
  const language = (languageSet.has(rawLanguage as TrafficLanguage) ? rawLanguage : 'kor') as TrafficLanguage;
  const { data, state, error, retry } = useTraffic(language);
  const location = useTrafficLocation();
  const [selectedId, setSelectedId] = useState('suwon_station');

  const selectedDestination = useMemo(
    () => data?.destinations.find((destination) => destination.id === selectedId) || data?.destinations[0],
    [data, selectedId],
  );

  if (state === 'loading') return <TrafficMessage message="교통 정보를 불러오는 중입니다." />;
  if (state === 'error') return <TrafficMessage message={error || '교통 정보를 불러오지 못했습니다.'} onRetry={() => void retry()} error />;
  if (state === 'empty' || !data || !selectedDestination) return <TrafficMessage message="표시할 교통 정보가 없습니다." />;

  const latitude = location.coordinates?.latitude || data.center.latitude;
  const longitude = location.coordinates?.longitude || data.center.longitude;
  const mapTitle = location.coordinates ? '현재 위치' : '수원역';

  return (
    <section className="page-shell">
      <Link className="mb-8 inline-flex rounded-lg px-2 py-2 text-sm font-bold text-suwon hover:bg-suwon-soft" to="/">← 홈으로</Link>
      <header className="mb-8">
        <p className="eyebrow">LinkSuwon Transit</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">수원 교통 안내</h1>
        <p className="mt-3 text-slate-500">교통카드, 대중교통 이용 팁과 네이버 지도 길찾기를 한곳에서 확인하세요.</p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,.8fr)]">
        <TrafficMapPanel latitude={latitude} longitude={longitude} title={mapTitle} locationState={location.state} />
        <TransitRouteCard destinations={data.destinations} selectedId={selectedDestination.id} onSelect={setSelectedId} onDirections={() => openDirections(location.coordinates, selectedDestination, language)} onOpenMap={() => openMap(location.coordinates, data.center, language)} locationState={location.state} />
      </div>
      {location.state === 'denied' && <p className="mt-4 text-sm text-amber-700">위치 권한을 사용할 수 없어 수원역을 기본 위치로 표시합니다.</p>}
      {location.state === 'error' && <p className="mt-4 text-sm text-slate-500">현재 위치를 확인하지 못해 수원역을 기본 위치로 표시합니다.</p>}
      <div className="mt-8"><TransportInfo guides={data.guides} /></div>
    </section>
  );
}

function openDirections(origin: { latitude: number; longitude: number } | null, destination: { name: string; latitude: number; longitude: number }, language: TrafficLanguage) {
  const lang = { kor: 'ko', eng: 'en', jpn: 'ja', chs: 'zh-Hans', cht: 'zh-Hant' }[language];
  const start = origin ? `${origin.longitude},${origin.latitude},${encodeURIComponent('현재 위치')}` : '-';
  const url = origin
    ? `https://map.naver.com/v5/directions/${start}/${destination.longitude},${destination.latitude},${encodeURIComponent(destination.name)}/-/transit?c=14,0,0,0,dh&lang=${lang}`
    : `https://map.naver.com/v5/directions/-/${destination.longitude},${destination.latitude},${encodeURIComponent(destination.name)}/-/transit?c=14,0,0,0,dh&lang=${lang}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function openMap(origin: { latitude: number; longitude: number } | null, center: { latitude: number; longitude: number }, language: TrafficLanguage) {
  const lang = { kor: 'ko', eng: 'en', jpn: 'ja', chs: 'zh-Hans', cht: 'zh-Hant' }[language];
  const point = origin || center;
  window.open(`https://map.naver.com/v5/?c=${point.longitude},${point.latitude},15,0,0,0,dh&lang=${lang}`, '_blank', 'noopener,noreferrer');
}

function TrafficMessage({ message, onRetry, error = false }: { message: string; onRetry?: () => void; error?: boolean }) {
  return (
    <section className="mx-auto max-w-3xl px-5 py-24 text-center">
      <NaverMapFallback message={message} tone={error ? 'error' : 'neutral'} />
      {onRetry && <button className="mt-5 rounded-xl bg-suwon px-5 py-3 font-bold text-white" type="button" onClick={onRetry}>다시 시도</button>}
    </section>
  );
}
