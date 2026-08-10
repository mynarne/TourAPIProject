import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import type { TrafficLanguage } from '../api/trafficApi';
import { NaverMapFallback } from '../components/map/NaverMapFallback';
import { CardKioskGuide } from '../features/traffic/components/CardKioskGuide';
import { TransitRouteCard } from '../features/traffic/components/TransitRouteCard';
import { TrafficMapPanel } from '../features/traffic/components/TrafficMapPanel';
import { TransportInfo } from '../features/traffic/components/TransportInfo';
import { useTraffic } from '../features/traffic/hooks/useTraffic';
import { useTrafficLocation } from '../features/traffic/hooks/useTrafficLocation';
import { useLanguage } from '../i18n';

const languageSet = new Set<TrafficLanguage>(['kor', 'eng', 'jpn', 'chs', 'cht']);

const TRAFFIC_COPY: Record<
  TrafficLanguage,
  {
    back: string;
    eyebrow: string;
    title: string;
    description: string;
    directionsSection: string;
    mapSection: string;
    kioskSection: string;
    guidesSection: string;
    locationDenied: string;
    locationError: string;
    loading: string;
    empty: string;
    error: string;
    retry: string;
  }
> = {
  kor: {
    back: '← 홈으로',
    eyebrow: 'Suwon Transit & Navigation',
    title: '수원 스마트 교통 & 발급기 안내',
    description: '수원 도착부터 실물 교통카드 발급, 스마트 길찾기, 주요 관광지 이동까지 여행자에게 필요한 모든 교통 정보를 한눈에 확인하세요.',
    directionsSection: '스마트 길찾기 & 빠른 네비게이션',
    mapSection: '네이버 지도 연동',
    kioskSection: '교통카드 발급기 & 실물 패스',
    guidesSection: '수원 도착 및 필수 여행 팁',
    locationDenied: '위치 권한을 사용할 수 없어 수원역을 기본 위치로 표시합니다.',
    locationError: '현재 위치를 확인하지 못해 수원역을 기본 위치로 표시합니다.',
    loading: '교통 안내를 불러오는 중입니다...',
    empty: '표시할 교통 정보가 없습니다.',
    error: '교통 정보를 불러오지 못했습니다.',
    retry: '다시 시도',
  },
  eng: {
    back: '← Home',
    eyebrow: 'Suwon Transit & Navigation',
    title: 'Suwon Transit & Kiosk Guide',
    description: 'Everything you need for getting to Suwon, issuing physical transit cards, and navigating to attractions.',
    directionsSection: 'Smart Directions & Navigation',
    mapSection: 'Naver Map View',
    kioskSection: 'Transit Card Kiosk & Physical Passes',
    guidesSection: 'Arrival Guides & Essential Tips',
    locationDenied: 'Location access is unavailable; Suwon Station is shown as the default.',
    locationError: 'Could not detect your location; Suwon Station is shown as the default.',
    loading: 'Loading transit information...',
    empty: 'No transit information available.',
    error: 'Failed to load transit information.',
    retry: 'Retry',
  },
  jpn: {
    back: '← ホーム',
    eyebrow: 'Suwon Transit & Navigation',
    title: '水原スマート交通＆発券機ガイド',
    description: '水原へのアクセスから交通カードの発券、スマート道案内、主要観光地への移動まで必要な交通情報を一目で確認できます。',
    directionsSection: 'スマート道案内＆ナビゲーション',
    mapSection: 'Naver地図連携',
    kioskSection: '交通カード発券機＆実物パス',
    guidesSection: '水原アクセス＆旅行者のヒント',
    locationDenied: '位置情報を利用できないため、水原駅を初期位置として表示します。',
    locationError: '現在地を確認できないため、水原駅を初期位置として表示します。',
    loading: '交通案内を読み込んでいます...',
    empty: '表示できる交通情報がありません。',
    error: '交通情報を読み込めませんでした。',
    retry: '再試行',
  },
  chs: {
    back: '← 返回首页',
    eyebrow: 'Suwon Transit & Navigation',
    title: '水原智能交通与自助发卡机指南',
    description: '汇总从抵达水原、购买实体交通卡、智能导航到主要景点游览所需的全部实用交通信息。',
    directionsSection: '智能导航与路线查询',
    mapSection: 'Naver地图联动',
    kioskSection: '交通卡自助机与实体通行卡',
    guidesSection: '抵达水原指南与实用贴士',
    locationDenied: '无法使用位置权限，因此显示水原站作为默认位置。',
    locationError: '无法确认当前位置，因此显示水原站作为默认位置。',
    loading: '正在加载交通指南...',
    empty: '没有可显示的交通信息。',
    error: '无法加载交通信息。',
    retry: '重试',
  },
  cht: {
    back: '← 回首頁',
    eyebrow: 'Suwon Transit & Navigation',
    title: '水原智慧交通與自助發卡機指南',
    description: '整理從抵達水原、購買實體交通卡、智慧導航到主要景點遊覽所需的全部實用交通資訊。',
    directionsSection: '智慧導航與路線查詢',
    mapSection: 'Naver地圖連動',
    kioskSection: '交通卡自助機與實體通行卡',
    guidesSection: '抵達水原指南與實用貼士',
    locationDenied: '無法使用位置權限，因此顯示水原站作為預設位置。',
    locationError: '無法確認目前位置，因此顯示水原站作為預設位置。',
    loading: '正在載入交通指南...',
    empty: '沒有可顯示的交通資訊。',
    error: '無法載入交通資訊。',
    retry: '重試',
  },
};

export function TrafficPage() {
  const { language } = useLanguage();
  const currentLang = (languageSet.has(language as TrafficLanguage) ? language : 'kor') as TrafficLanguage;
  const { data, state, error, retry } = useTraffic(currentLang);
  const location = useTrafficLocation();
  const [selectedId, setSelectedId] = useState('suwon_station');

  const selectedDestination = useMemo(
    () => data?.destinations.find((destination) => destination.id === selectedId) || data?.destinations[0],
    [data, selectedId],
  );
  const copy = TRAFFIC_COPY[currentLang];

  const handleDirections = () => {
    if (!selectedDestination) return;
    const originLng = location.coordinates?.longitude ?? 127.0002;
    const originLat = location.coordinates?.latitude ?? 37.2664;
    const originName = location.state === 'success' ? '내 위치' : '수원역';
    const url = `https://map.naver.com/v5/directions/-/${originLng},${originLat},${encodeURIComponent(originName)}/${selectedDestination.longitude},${selectedDestination.latitude},${encodeURIComponent(selectedDestination.name)}/-/pubtrans`;
    window.open(url, '_blank');
  };

  const handleOpenMap = () => {
    if (!selectedDestination) return;
    const url = `https://map.naver.com/v5/search/${encodeURIComponent(selectedDestination.name)}`;
    window.open(url, '_blank');
  };

  return (
    <section className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex items-center justify-between">
        <Link className="text-sm font-bold text-suwon no-underline" to={`/?lang=${currentLang}`}>
          {copy.back}
        </Link>
      </div>

      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{copy.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{copy.description}</p>
      </header>

      {location.state === 'denied' && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold text-amber-900">
          ⚠️ {copy.locationDenied}
        </div>
      )}
      {location.state === 'error' && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold text-amber-900">
          ⚠️ {copy.locationError}
        </div>
      )}

      {state === 'loading' && <p className="py-16 text-center text-slate-500">{copy.loading}</p>}
      {state === 'error' && (
        <div className="py-16 text-center">
          <p className="text-red-600">{error || copy.error}</p>
          <button className="mt-4 rounded-lg bg-suwon px-4 py-2 font-semibold text-white" onClick={() => void retry()}>
            {copy.retry}
          </button>
        </div>
      )}
      {state === 'empty' && <p className="py-16 text-center text-slate-500">{copy.empty}</p>}

      {state === 'success' && data && (
        <div className="space-y-10">
          {/* Top: Smart Directions + Interactive Naver Map */}
          <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-950">{copy.directionsSection}</h2>
              <TransitRouteCard
                language={currentLang}
                destinations={data.destinations}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onDirections={handleDirections}
                onOpenMap={handleOpenMap}
                locationState={location.state}
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-950">{copy.mapSection}</h2>
              {selectedDestination ? (
                <TrafficMapPanel
                  language={currentLang}
                  latitude={selectedDestination.latitude}
                  longitude={selectedDestination.longitude}
                  title={selectedDestination.name}
                  locationState={location.state}
                />
              ) : (
                <NaverMapFallback message="위치 지도 표시 불가" />
              )}
            </div>
          </div>

          {/* Middle: Visual Card & Kiosk Guide */}
          <div>
            <CardKioskGuide language={currentLang} />
          </div>

          {/* Bottom: Comprehensive Transport & Safety Guides */}
          <div className="space-y-4">
            <h2 className="text-xl font-black text-slate-950">{copy.guidesSection}</h2>
            <TransportInfo guides={data.guides} />
          </div>
        </div>
      )}
    </section>
  );
}
