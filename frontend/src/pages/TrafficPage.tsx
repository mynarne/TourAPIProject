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

const TRAFFIC_COPY: Record<TrafficLanguage, { back: string; eyebrow: string; title: string; description: string; language: string; locationDenied: string; locationError: string; loading: string; empty: string; error: string; home: string }> = {
  kor: { back: '← 홈으로', eyebrow: 'Suwon Transit Guide', title: '수원 교통 안내', description: '수원에 도착하는 방법부터 교통카드 발급, 관광지 이동까지 여행자에게 필요한 정보를 한곳에 모았습니다.', language: '언어 선택', locationDenied: '위치 권한을 사용할 수 없어 수원역을 기본 위치로 표시합니다.', locationError: '현재 위치를 확인하지 못해 수원역을 기본 위치로 표시합니다.', loading: '교통 안내를 불러오는 중입니다.', empty: '표시할 교통 정보가 없습니다.', error: '교통 정보를 불러오지 못했습니다.', home: '홈으로' },
  eng: { back: '← Home', eyebrow: 'Suwon Transit Guide', title: 'Suwon Transit Guide', description: 'Find practical information for arriving in Suwon, getting a transit card and moving between attractions.', language: 'Language', locationDenied: 'Location access is unavailable, so Suwon Station is shown as the default.', locationError: 'We could not locate you, so Suwon Station is shown as the default.', loading: 'Loading transit guidance.', empty: 'No transit information is available.', error: 'We could not load transit information.', home: 'Home' },
  jpn: { back: '← ホーム', eyebrow: 'Suwon Transit Guide', title: '水原の交通案内', description: '水原へのアクセス、交通カードの発行、観光地間の移動に必要な情報をまとめました。', language: '言語', locationDenied: '位置情報を利用できないため、水原駅を初期位置として表示します。', locationError: '現在地を確認できないため、水原駅を初期位置として表示します。', loading: '交通案内を読み込んでいます。', empty: '表示できる交通情報がありません。', error: '交通情報を読み込めませんでした。', home: 'ホーム' },
  chs: { back: '← 返回首页', eyebrow: 'Suwon Transit Guide', title: '水原交通指南', description: '汇总前往水原、购买交通卡以及在景点之间移动所需的实用信息。', language: '语言', locationDenied: '无法使用位置权限，因此显示水原站作为默认位置。', locationError: '无法确认当前位置，因此显示水原站作为默认位置。', loading: '正在加载交通指南。', empty: '没有可显示的交通信息。', error: '无法加载交通信息。', home: '首页' },
  cht: { back: '← 回首頁', eyebrow: 'Suwon Transit Guide', title: '水原交通指南', description: '整理前往水原、購買交通卡以及在景點之間移動所需的實用資訊。', language: '語言', locationDenied: '無法使用位置權限，因此顯示水原站作為預設位置。', locationError: '無法確認目前位置，因此顯示水原站作為預設位置。', loading: '正在載入交通指南。', empty: '沒有可顯示的交通資訊。', error: '無法載入交通資訊。', home: '首頁' },
};

export function TrafficPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawLanguage = searchParams.get('language') || searchParams.get('lang') || 'kor';
  const language = (languageSet.has(rawLanguage as TrafficLanguage) ? rawLanguage : 'kor') as TrafficLanguage;
  const { data, state, error, retry } = useTraffic(language);
  const location = useTrafficLocation();
  const [selectedId, setSelectedId] = useState('suwon_station');

  const selectedDestination = useMemo(
    () => data?.destinations.find((destination) => destination.id === selectedId) || data?.destinations[0],
    [data, selectedId],
  );
  const copy = TRAFFIC_COPY[language];
  const changeLanguage = (nextLanguage: TrafficLanguage) => {
    setSearchParams((current) => {
      current.set('lang', nextLanguage);
      return current;
    });
  };

  if (state === 'loading') return <TrafficMessage message={copy.loading} />;
  if (state === 'error') return <TrafficMessage message={error || copy.error} onRetry={() => void retry()} error />;
  if (state === 'empty' || !data || !selectedDestination) return <TrafficMessage message={copy.empty} />;

  const latitude = location.coordinates?.latitude || data.center.latitude;
  const longitude = location.coordinates?.longitude || data.center.longitude;
  const mapTitle = location.coordinates ? '현재 위치' : '수원역';

  return (
    <section className="page-shell">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4"><Link className="inline-flex rounded-lg px-2 py-2 text-sm font-bold text-suwon hover:bg-suwon-soft" to="/">{copy.back}</Link><label className="flex items-center gap-2 text-xs font-bold text-slate-500"><span>{copy.language}</span><select className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-bold text-slate-700 outline-none focus:border-suwon" value={language} onChange={(event) => changeLanguage(event.target.value as TrafficLanguage)} aria-label={copy.language}><option value="kor">한국어</option><option value="eng">English</option><option value="jpn">日本語</option><option value="chs">简体中文</option><option value="cht">繁體中文</option></select></label></div>
      <header className="mb-8">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{copy.title}</h1>
        <p className="mt-3 max-w-2xl text-slate-500">{copy.description}</p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,.8fr)]">
        <TrafficMapPanel language={language} latitude={latitude} longitude={longitude} title={mapTitle} locationState={location.state} />
        <TransitRouteCard language={language} destinations={data.destinations} selectedId={selectedDestination.id} onSelect={setSelectedId} onDirections={() => openDirections(location.coordinates, selectedDestination, language)} onOpenMap={() => openMap(location.coordinates, data.center, language)} locationState={location.state} />
      </div>
      {location.state === 'denied' && <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{copy.locationDenied}</p>}
      {location.state === 'error' && <p className="mt-4 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600">{copy.locationError}</p>}
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
