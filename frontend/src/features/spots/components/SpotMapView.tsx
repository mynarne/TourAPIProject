import type { TourSpot } from '../../../api/tourismApi';
import { NaverMap } from '../../../components/map/NaverMap';

export function SpotMapView({ spots }: { spots: TourSpot[] }) {
  const locatedSpots = spots.filter((spot) => spot.latitude !== null && spot.longitude !== null);
  const firstLocatedSpot = locatedSpots[0];
  if (!firstLocatedSpot || firstLocatedSpot.latitude === null || firstLocatedSpot.longitude === null) return null;

  return (
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-suwon">Map Preview</p>
          <h2 className="mt-1 text-xl font-bold">탐색 지도 미리보기</h2>
        </div>
        <p className="text-right text-xs text-slate-500">현재 검색 결과의 위치를 지도에서 확인할 수 있습니다.</p>
      </div>
      <NaverMap
        latitude={firstLocatedSpot.latitude}
        longitude={firstLocatedSpot.longitude}
        markerTitle={firstLocatedSpot.title}
        markers={locatedSpots.map((spot) => ({
          latitude: spot.latitude as number,
          longitude: spot.longitude as number,
          title: spot.title,
        }))}
        className="h-72"
      />
    </section>
  );
}
