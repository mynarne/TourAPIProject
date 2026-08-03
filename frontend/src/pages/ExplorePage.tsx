import { useMemo, useState } from 'react';

import { SpotCard } from '../features/spots/components/SpotCard';
import { SpotMapView } from '../features/spots/components/SpotMapView';
import { useTourSpots } from '../features/spots/hooks/useTourSpots';

export function ExplorePage() {
  const [keyword, setKeyword] = useState('');
  const params = useMemo(() => ({ language: 'kor' as const, page: 1, pageSize: 20, keyword }), [keyword]);
  const { items, state, error, retry } = useTourSpots(params);

  return (
    <section className="page-shell">
      <div className="flex flex-col justify-between gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-end sm:p-8">
        <div>
          <p className="eyebrow">Explore Suwon</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">수원 명소 둘러보기</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">수원화성부터 행궁동의 작은 공간까지, 지금 가고 싶은 장소를 찾아보세요.</p>
        </div>
        <input
          className="field w-full sm:max-w-xs"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="명소 검색"
          aria-label="명소 검색"
        />
      </div>

      {state === 'loading' && <p className="py-16 text-center text-slate-500">관광지 정보를 불러오는 중입니다.</p>}
      {state === 'error' && (
        <div className="py-16 text-center">
          <p className="text-red-600">{error}</p>
          <button className="mt-4 rounded-lg bg-suwon px-4 py-2 font-semibold text-white" onClick={() => void retry()}>
            다시 시도
          </button>
        </div>
      )}
      {state === 'empty' && <p className="py-16 text-center text-slate-500">검색 결과가 없습니다.</p>}
      {state === 'success' && (
        <>
          <SpotMapView spots={items} />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((spot) => <SpotCard key={spot.contentId} spot={spot} />)}
          </div>
        </>
      )}
    </section>
  );
}
