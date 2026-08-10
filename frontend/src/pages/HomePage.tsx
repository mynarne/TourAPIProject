import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n';
import type { AppLanguage } from '../i18n';
import { WeatherWidget } from '../features/widgets/components/WeatherWidget';
import { ExchangeWidget } from '../features/widgets/components/ExchangeWidget';
import { useTrafficLocation } from '../features/traffic/hooks/useTrafficLocation';

const HOME_COPY: Record<
  AppLanguage,
  {
    nearMeTitle: string;
    nearMeDescLocation: string;
    nearMeDescStation: string;
    exploreNearMe: string;
    searchPlaceholder: string;
    searchBtn: string;
    bentoSpots: string;
    bentoSpotsDesc: string;
    bentoTraffic: string;
    bentoTrafficDesc: string;
    bentoRecords: string;
    bentoRecordsDesc: string;
    bentoAi: string;
    bentoAiDesc: string;
  }
> = {
  kor: {
    nearMeTitle: '📍 내 주변 수원 여행',
    nearMeDescLocation: '현재 위치를 기반으로 가까운 수원화성 명소와 코스를 탐색합니다.',
    nearMeDescStation: '위치 권한 미허용 시 수원역을 시작점으로 편리하게 탐색할 수 있습니다.',
    exploreNearMe: '내 주변 명소 둘러보기',
    searchPlaceholder: '수원의 가고 싶은 장소를 검색해 보세요',
    searchBtn: '검색',
    bentoSpots: '명소 안내',
    bentoSpotsDesc: '수원화성, 행궁동, 광교호수공원 등 대표 관광지 상세 정보',
    bentoTraffic: '스마트 교통 & 발급기',
    bentoTrafficDesc: '외국인 전용 교통카드 발급, 스마트 길찾기 및 대중교통 안내',
    bentoRecords: '나만의 기록',
    bentoRecordsDesc: '사진과 짧은 글귀로 간직하는 수원의 여행 추억 아카이브',
    bentoAi: 'AI 스마트 가이드',
    bentoAiDesc: '취향과 상황에 꼭 맞는 수원 맞춤형 여행 코스 실시간 추천',
  },
  eng: {
    nearMeTitle: '📍 Explore Suwon Around Me',
    nearMeDescLocation: 'Discover nearby attractions and routes based on your current location.',
    nearMeDescStation: 'Explore easily starting from Suwon Station when location access is off.',
    exploreNearMe: 'Explore Nearby Attractions',
    searchPlaceholder: 'Search attractions and places in Suwon...',
    searchBtn: 'Search',
    bentoSpots: 'Attractions',
    bentoSpotsDesc: 'Comprehensive guides for Hwaseong Fortress, Haenggung, and Gwanggyo Lake Park.',
    bentoTraffic: 'Smart Transit & Kiosks',
    bentoTrafficDesc: 'Tourist card issuance, smart navigation, and public transit guides.',
    bentoRecords: 'Travel Archives',
    bentoRecordsDesc: 'Capture and cherish your Suwon journey with photos and notes.',
    bentoAi: 'AI Tour Guide',
    bentoAiDesc: 'Personalized recommendations and instant travel itineraries.',
  },
  jpn: {
    nearMeTitle: '📍 現在地周辺の水原観光',
    nearMeDescLocation: '現在地を中心に近くの水原華城の見どころやおすすめコースを検索します。',
    nearMeDescStation: '位置情報がオフの場合は水原駅を起点としてスムーズに探索できます。',
    exploreNearMe: '周辺の見どころを探す',
    searchPlaceholder: '水原の行きたい場所を検索...',
    searchBtn: '検索',
    bentoSpots: '観光地案内',
    bentoSpotsDesc: '水原華城、行宮洞、光教湖水公園など代表スポットの詳細情報',
    bentoTraffic: 'スマート交通＆発券機',
    bentoTrafficDesc: '外国人専用交通カードの発行、スマート道案内、公共交通機関ガイド',
    bentoRecords: '思い出の記録',
    bentoRecordsDesc: '写真と文章で残す自分だけの水原旅行アーカイブ',
    bentoAi: 'AIスマートガイド',
    bentoAiDesc: '旅行スタイルに合わせた水原のおすすめコースをリアルタイム提案',
  },
  chs: {
    nearMeTitle: '📍 我周边的水原游览',
    nearMeDescLocation: '基于当前位置智能探索附近的水原华城景点与热门路线。',
    nearMeDescStation: '未开启位置权限时，将以水原站为中心方便快捷地进行探索。',
    exploreNearMe: '浏览周边景点',
    searchPlaceholder: '搜索水原想去的地点与景点...',
    searchBtn: '搜索',
    bentoSpots: '景点指南',
    bentoSpotsDesc: '水原华城、行宫洞、光教湖水公园等核心景点详细介绍',
    bentoTraffic: '智能交通与发卡机',
    bentoTrafficDesc: '外国人交通卡发卡机指南、智能导航与公交地铁出行贴士',
    bentoRecords: '旅行回忆档案',
    bentoRecordsDesc: '用照片和文字珍藏您在水原的点滴旅行记忆',
    bentoAi: 'AI智能向导',
    bentoAiDesc: '根据您的喜好与时间，实时为您定制水原专属旅行路线',
  },
  cht: {
    nearMeTitle: '📍 我周邊的水原遊覽',
    nearMeDescLocation: '基於目前位置智慧探索附近的水原華城景點與熱門路線。',
    nearMeDescStation: '未開啟位置權限時，將以水原站為中心方便快捷地進行探索。',
    exploreNearMe: '瀏覽周邊景點',
    searchPlaceholder: '搜尋水原想去的地點與景點...',
    searchBtn: '搜尋',
    bentoSpots: '景點指南',
    bentoSpotsDesc: '水原華城、行宮洞、光教湖水公園等核心景點詳細介紹',
    bentoTraffic: '智慧交通與發卡機',
    bentoTrafficDesc: '外國人交通卡發卡機指南、智慧導航與大眾運輸出行貼士',
    bentoRecords: '旅行回憶檔案',
    bentoRecordsDesc: '用照片與文字珍藏您在水原的點滴旅行記憶',
    bentoAi: 'AI智慧向導',
    bentoAiDesc: '根據您的喜好與時間，即時為您定製水原專屬旅行路線',
  },
};

export function HomePage() {
  const { language, t } = useLanguage();
  const location = useTrafficLocation();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const copy = HOME_COPY[language] || HOME_COPY.kor;

  const exploreUrl =
    location.state === 'success' && location.coordinates
      ? `/explore?lang=${language}&lat=${location.coordinates.latitude}&lng=${location.coordinates.longitude}&locationSource=gps`
      : `/explore?lang=${language}&lat=37.2664&lng=127.0002&locationSource=suwon_station`;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/explore?lang=${language}&query=${encodeURIComponent(keyword.trim())}`);
    } else {
      navigate(`/explore?lang=${language}`);
    }
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6 sm:pb-12 sm:pt-16">
        <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />

        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">LinkSuwon Travel Experience</p>
          <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">
            {t('hero_title')}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
            {t('hero_subtitle')}
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mt-8 flex items-center rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
            <span className="ml-3 text-lg text-slate-400">🔍</span>
            <input
              type="text"
              className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-slate-400"
              placeholder={copy.searchPlaceholder}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button
              type="submit"
              className="rounded-xl bg-suwon px-5 py-2.5 text-xs font-bold text-white transition hover:bg-suwon-dark"
            >
              {copy.searchBtn}
            </button>
          </form>
        </div>
      </section>

      {/* Live Widgets Section (Weather & Exchange Rates) */}
      <section className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <WeatherWidget language={language} />
          <ExchangeWidget language={language} />
        </div>
      </section>

      {/* Location-Based Nearby Tour CTA Box */}
      <section className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        <div className="flex flex-col justify-between gap-4 rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-sky-50/80 p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-black text-slate-900">{copy.nearMeTitle}</h2>
            <p className="mt-1 text-xs text-slate-600">
              {location.state === 'success' ? copy.nearMeDescLocation : copy.nearMeDescStation}
            </p>
          </div>
          <Link
            to={exploreUrl}
            className="inline-flex items-center justify-center rounded-xl bg-suwon px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-suwon-dark whitespace-nowrap"
          >
            {copy.exploreNearMe} →
          </Link>
        </div>
      </section>

      {/* Bento Quick Actions 4 Grid */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Bento 1: 관광지 탐색 */}
          <Link
            to={`/explore?lang=${language}`}
            className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md no-underline"
          >
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-suwon transition group-hover:bg-suwon group-hover:text-white">
                🏰
              </div>
              <h3 className="mt-4 text-base font-black text-slate-900">{copy.bentoSpots}</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">{copy.bentoSpotsDesc}</p>
            </div>
            <span className="mt-6 text-xs font-bold text-suwon group-hover:underline">Explore →</span>
          </Link>

          {/* Bento 2: 스마트 교통 & 발급기 */}
          <Link
            to={`/traffic?lang=${language}`}
            className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md no-underline"
          >
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-2xl text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white">
                💳
              </div>
              <h3 className="mt-4 text-base font-black text-slate-900">{copy.bentoTraffic}</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">{copy.bentoTrafficDesc}</p>
            </div>
            <span className="mt-6 text-xs font-bold text-emerald-600 group-hover:underline">Transit →</span>
          </Link>

          {/* Bento 3: 나만의 여행 기록 */}
          <Link
            to={`/records?lang=${language}`}
            className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md no-underline"
          >
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-2xl text-purple-600 transition group-hover:bg-purple-600 group-hover:text-white">
                📸
              </div>
              <h3 className="mt-4 text-base font-black text-slate-900">{copy.bentoRecords}</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">{copy.bentoRecordsDesc}</p>
            </div>
            <span className="mt-6 text-xs font-bold text-purple-600 group-hover:underline">Archive →</span>
          </Link>

          {/* Bento 4: AI 챗봇 가이드 */}
          <Link
            to={`/chatbot?lang=${language}`}
            className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md no-underline"
          >
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-2xl text-amber-600 transition group-hover:bg-amber-600 group-hover:text-white">
                🤖
              </div>
              <h3 className="mt-4 text-base font-black text-slate-900">{copy.bentoAi}</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">{copy.bentoAiDesc}</p>
            </div>
            <span className="mt-6 text-xs font-bold text-amber-600 group-hover:underline">Ask AI →</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
