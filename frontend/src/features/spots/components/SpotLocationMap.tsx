import { NaverMap } from '../../../components/map/NaverMap';

type SpotLocationMapProps = {
  latitude: number | null;
  longitude: number | null;
  title: string;
};

export function SpotLocationMap({ latitude, longitude, title }: SpotLocationMapProps) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-xl font-bold">위치</h2>
      {latitude === null || longitude === null ? (
        <div className="flex h-80 items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-500">
          위치 정보가 제공되지 않는 장소입니다.
        </div>
      ) : (
        <NaverMap latitude={latitude} longitude={longitude} zoom={15} markerTitle={title} className="h-80" />
      )}
      <p className="mt-3 text-sm text-slate-500">{title}의 대표 위치를 표시합니다.</p>
    </section>
  );
}
