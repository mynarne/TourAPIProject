import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SpotCard } from '../features/spots/components/SpotCard';
import { SpotMapView } from '../features/spots/components/SpotMapView';
import { useTourSpots } from '../features/spots/hooks/useTourSpots';
import { useLanguage } from '../i18n';
import type { TourCategory } from '../api/tourismApi';

const PAGE_SIZE = 30;
const CATEGORY_OPTIONS: TourCategory[] = [
  'all', 'heritage', 'museum', 'art_gallery', 'library', 'cultural_facility',
  'festival', 'course', 'leisure', 'stay', 'market', 'food', 'nature', 'exchange',
];

// Haversine 거리 계산 (km)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // 지구 반경 (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('keyword') || searchParams.get('query') || '';
  const parsedPage = Number.parseInt(searchParams.get('page') || '1', 10);
  const initialPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const initialCategory = CATEGORY_OPTIONS.includes(searchParams.get('category') as TourCategory)
    ? searchParams.get('category') as TourCategory
    : 'all';
  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');
  const locationSource = searchParams.get('locationSource') === 'gps' ? 'gps' : 'suwon_station';

  const parsedLat = latParam ? parseFloat(latParam) : NaN;
  const parsedLng = lngParam ? parseFloat(lngParam) : NaN;
  const hasValidLocation = Number.isFinite(parsedLat) && Number.isFinite(parsedLng)
    && parsedLat >= -90 && parsedLat <= 90 && parsedLng >= -180 && parsedLng <= 180;
  const userLat = hasValidLocation ? parsedLat : null;
  const userLng = hasValidLocation ? parsedLng : null;

  const [searchInput, setSearchInput] = useState(initialQuery);
  const [keyword, setKeyword] = useState(initialQuery);
  const [isComposing, setIsComposing] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [category, setCategory] = useState<TourCategory>(initialCategory);
  const { language, t } = useLanguage();
  const searchParamsKey = searchParams.toString();
  const params = useMemo(() => ({ language, page, pageSize: PAGE_SIZE, category, keyword }), [language, page, category, keyword]);
  const { items, state, error, pagination, retry } = useTourSpots(params);

  useEffect(() => {
    setSearchInput(initialQuery);
    setKeyword(initialQuery);
    setPage(initialPage);
    setCategory(initialCategory);
  }, [searchParamsKey]);

  useEffect(() => {
    if (isComposing) return undefined;
    const timer = window.setTimeout(() => {
      if (searchInput !== keyword) {
        setKeyword(searchInput);
        setPage(1);
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [isComposing, keyword, searchInput]);

  useEffect(() => {
    if (state !== 'loading' && pagination.totalPages > 0 && page > pagination.totalPages) {
      setPage(pagination.totalPages);
    }
  }, [page, pagination.totalPages, state]);

  useEffect(() => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set('lang', language);
      next.set('page', String(page));
      if (category === 'all') next.delete('category');
      else next.set('category', category);
      if (keyword) next.set('query', keyword);
      else next.delete('query');
      next.delete('keyword');
      return next;
    }, { replace: true });
  }, [category, keyword, language, page, setSearchParams]);

  const formatText = (key: string, values: Record<string, string | number>) =>
    Object.entries(values).reduce((text, [name, value]) => text.replace(`{${name}}`, String(value)), t(key));

  const visiblePages = Array.from({ length: pagination.totalPages }, (_, index) => index + 1)
    .filter((value) => value === 1 || value === pagination.totalPages || Math.abs(value - page) <= 2);

  // 위치 좌표가 있으면 거리순 정렬
  const sortedItems = useMemo(() => {
    if (userLat != null && userLng != null && items.length > 0) {
      return [...items].sort((a, b) => {
        const distA = a.latitude && a.longitude ? calculateDistance(userLat, userLng, a.latitude, a.longitude) : 99999;
        const distB = b.latitude && b.longitude ? calculateDistance(userLat, userLng, b.latitude, b.longitude) : 99999;
        return distA - distB;
      });
    }
    return items;
  }, [items, userLat, userLng]);

  return (
    <section className="page-shell">
      <div className="flex flex-col justify-between gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-end sm:p-8">
        <div>
          <div className="flex items-center gap-2">
            <p className="eyebrow">Explore Suwon</p>
            {userLat != null && userLng != null && (
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-black text-suwon">
                📍 {locationSource === 'gps' ? t('location_sort_gps_badge') : t('location_sort_station_badge')}
              </span>
            )}
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{t('menu_attractions')}</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
            {userLat != null && userLng != null
              ? locationSource === 'gps' ? t('location_sort_gps_desc') : t('location_sort_station_desc')
              : t('hero_subtitle')}
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:max-w-xs">
          <label className="sr-only" htmlFor="spot-search">{t('placeholder_search')}</label>
          <input
            id="spot-search"
            className="field w-full"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder={t('placeholder_search')}
            aria-label={t('placeholder_search')}
          />
          <label className="sr-only" htmlFor="spot-category">{t('category_filter')}</label>
          <select
            id="spot-category"
            className="field w-full"
            value={category}
            onChange={(event) => { setCategory(event.target.value as TourCategory); setPage(1); }}
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>{t(`cat_${option}`)}</option>
            ))}
          </select>
        </div>
      </div>

      {pagination.totalCount > 0 && (
        <div className="mt-6 flex items-center justify-between gap-4 text-sm text-slate-500">
          <p>{formatText('result_count', { count: pagination.totalCount })}</p>
          <p>{formatText('page_status', { page, totalPages: pagination.totalPages })}</p>
        </div>
      )}

      {state === 'loading' && <p className="py-16 text-center text-slate-500">{t('msg_loading')}</p>}
      {state === 'error' && (
        <div className="py-16 text-center">
          <p className="text-red-600">{error}</p>
          <button className="mt-4 rounded-lg bg-suwon px-4 py-2 font-semibold text-white" onClick={() => void retry()}>
            {t('btn_back')}
          </button>
        </div>
      )}
      {state === 'empty' && <p className="py-16 text-center text-slate-500">{t('msg_api_fail')}</p>}
      {state === 'success' && (
        <>
          <SpotMapView spots={sortedItems} />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sortedItems.map((spot) => (
              <SpotCard key={spot.contentId} spot={spot} />
            ))}
          </div>
          {pagination.totalPages > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-2" aria-label={t('category_filter')}>
              <button
                type="button"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                {t('page_previous')}
              </button>
              <div className="hidden items-center gap-1 sm:flex">
                {visiblePages.map((pageNumber) => (
                  <button
                    type="button"
                    key={pageNumber}
                    className={`h-9 min-w-9 rounded-xl px-2 text-sm font-bold ${pageNumber === page ? 'bg-suwon text-white' : 'border border-slate-200 text-slate-600'}`}
                    aria-current={pageNumber === page ? 'page' : undefined}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>
              <span className="text-sm font-semibold text-slate-600 sm:hidden">
                {formatText('page_status', { page, totalPages: pagination.totalPages })}
              </span>
              <button
                type="button"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}
              >
                {t('page_next')}
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
