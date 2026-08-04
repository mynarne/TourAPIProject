import { NaverMap } from '../../../components/map/NaverMap';
import type { TrafficLanguage } from '../../../api/trafficApi';

type TrafficMapPanelProps = {
  language: TrafficLanguage;
  latitude: number;
  longitude: number;
  title: string;
  locationState: string;
};

export function TrafficMapPanel({ language, latitude, longitude, title, locationState }: TrafficMapPanelProps) {
  const copy = {
    kor: { title: '수원 교통 지도', current: '현재 위치를 중심으로 표시 중입니다.', station: '수원역을 기본 위치로 표시합니다.', badge: 'Naver Map' },
    eng: { title: 'Suwon transit map', current: 'Showing your current location.', station: 'Showing Suwon Station as the default.', badge: 'Naver Map' },
    jpn: { title: '水原交通マップ', current: '現在地を中心に表示しています。', station: '水原駅を初期位置として表示しています。', badge: 'Naver Map' },
    chs: { title: '水原交通地图', current: '正在以当前位置为中心显示。', station: '正在显示水原站作为默认位置。', badge: 'Naver Map' },
    cht: { title: '水原交通地圖', current: '正在以目前位置為中心顯示。', station: '正在顯示水原站作為預設位置。', badge: 'Naver Map' },
  }[language];
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between px-3 py-2">
        <div>
          <h2 className="font-black text-slate-900">{copy.title}</h2>
          <p className="text-xs text-slate-500">{locationState === 'success' ? copy.current : copy.station}</p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-suwon">{copy.badge}</span>
      </div>
      <NaverMap latitude={latitude} longitude={longitude} zoom={14} markerTitle={title} className="h-80 w-full" />
    </section>
  );
}
