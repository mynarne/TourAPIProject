import type { TrafficDestination } from '../../../api/trafficApi';
import type { TrafficLanguage } from '../../../api/trafficApi';

type TransitRouteCardProps = {
  language: TrafficLanguage;
  destinations: TrafficDestination[];
  selectedId: string;
  onSelect: (id: string) => void;
  onDirections: () => void;
  onOpenMap: () => void;
  locationState: string;
};

export function TransitRouteCard({ language, destinations, selectedId, onSelect, onDirections, onOpenMap, locationState }: TransitRouteCardProps) {
  const copy = {
    kor: { title: '스마트 길찾기', description: '현재 위치에서 수원 주요 장소까지 네이버 대중교통 길찾기를 엽니다.', origin: '출발지', gps: '현재 위치 (GPS)', station: '수원역 중심', destination: '도착지', directions: '대중교통 길찾기', map: '네이버 지도 열기' },
    eng: { title: 'Smart directions', description: 'Open Naver transit directions from your current location to key Suwon places.', origin: 'Origin', gps: 'Current location (GPS)', station: 'Suwon Station', destination: 'Destination', directions: 'Transit directions', map: 'Open Naver Map' },
    jpn: { title: 'スマート道案内', description: '現在地から水原の主要スポットまでNaverの公共交通ルートを開きます。', origin: '出発地', gps: '現在地（GPS）', station: '水原駅中心', destination: '目的地', directions: '公共交通ルート', map: 'Naver地図を開く' },
    chs: { title: '智能导航', description: '打开从当前位置前往水原主要景点的Naver公共交通路线。', origin: '出发地', gps: '当前位置（GPS）', station: '水原站中心', destination: '目的地', directions: '公共交通路线', map: '打开Naver地图' },
    cht: { title: '智慧導航', description: '開啟從目前位置前往水原主要景點的Naver大眾運輸路線。', origin: '出發地', gps: '目前位置（GPS）', station: '水原站中心', destination: '目的地', directions: '大眾運輸路線', map: '開啟Naver地圖' },
  }[language];
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-black text-slate-900">{copy.title}</h2>
      <p className="mt-2 text-sm text-slate-500">{copy.description}</p>
      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
        <span className="text-xs font-bold text-slate-500">{copy.origin}</span>
        <p className="mt-1 font-bold text-slate-900">{locationState === 'success' ? copy.gps : copy.station}</p>
      </div>
      <label className="mt-5 block text-xs font-bold text-slate-500" htmlFor="traffic-destination">{copy.destination}</label>
      <select id="traffic-destination" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold outline-none focus:border-suwon" value={selectedId} onChange={(event) => onSelect(event.target.value)}>
        {destinations.map((destination) => <option key={destination.id} value={destination.id}>{destination.name}</option>)}
      </select>
      <div className="mt-5 grid gap-3">
        <button className="rounded-2xl bg-suwon px-4 py-3 font-bold text-white transition hover:opacity-90" type="button" onClick={onDirections}>{copy.directions}</button>
        <button className="rounded-2xl border border-slate-200 px-4 py-3 font-bold text-slate-700 transition hover:bg-slate-50" type="button" onClick={onOpenMap}>{copy.map}</button>
      </div>
    </section>
  );
}
