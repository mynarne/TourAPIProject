import { useMemo, useState } from 'react';

import { SpotCard } from '../features/spots/components/SpotCard';
import { SpotMapView } from '../features/spots/components/SpotMapView';
import { useTourSpots } from '../features/spots/hooks/useTourSpots';

export function ExplorePage() {
  const [keyword, setKeyword] = useState('');
  const params = useMemo(() => ({ language: 'kor' as const, page: 1, pageSize: 20, keyword }), [keyword]);
  const { items, state, error, retry } = useTourSpots(params);

  return (
    <section className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="font-semibold text-suwon">Explore Suwon</p>
          <h1 className="mt-2 text-4xl font-black">수원 명소 둘러보기</h1>
        </div>
        <input
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-suwon"
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
