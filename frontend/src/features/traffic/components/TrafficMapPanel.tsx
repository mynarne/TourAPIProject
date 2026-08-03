import { NaverMap } from '../../../components/map/NaverMap';

type TrafficMapPanelProps = {
  latitude: number;
  longitude: number;
  title: string;
  locationState: string;
};

export function TrafficMapPanel({ latitude, longitude, title, locationState }: TrafficMapPanelProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between px-3 py-2">
        <div>
          <h2 className="font-black text-slate-900">수원 교통 지도</h2>
          <p className="text-xs text-slate-500">{locationState === 'success' ? '현재 위치를 중심으로 표시 중입니다.' : '수원역을 기본 위치로 표시합니다.'}</p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-suwon">Naver Map</span>
      </div>
      <NaverMap latitude={latitude} longitude={longitude} zoom={14} markerTitle={title} className="h-80 w-full" />
    </section>
  );
}
