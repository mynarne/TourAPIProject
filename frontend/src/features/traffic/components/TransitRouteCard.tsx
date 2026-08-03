import type { TrafficDestination } from '../../../api/trafficApi';

type TransitRouteCardProps = {
  destinations: TrafficDestination[];
  selectedId: string;
  onSelect: (id: string) => void;
  onDirections: () => void;
  onOpenMap: () => void;
  locationState: string;
};

export function TransitRouteCard({ destinations, selectedId, onSelect, onDirections, onOpenMap, locationState }: TransitRouteCardProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-black text-slate-900">스마트 길찾기</h2>
      <p className="mt-2 text-sm text-slate-500">현재 위치에서 수원 주요 장소까지 네이버 대중교통 길찾기를 엽니다.</p>
      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
        <span className="text-xs font-bold text-slate-500">출발지</span>
        <p className="mt-1 font-bold text-slate-900">{locationState === 'success' ? '현재 위치 (GPS)' : '수원역 중심'}</p>
      </div>
      <label className="mt-5 block text-xs font-bold text-slate-500" htmlFor="traffic-destination">도착지</label>
      <select id="traffic-destination" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold outline-none focus:border-suwon" value={selectedId} onChange={(event) => onSelect(event.target.value)}>
        {destinations.map((destination) => <option key={destination.id} value={destination.id}>{destination.name}</option>)}
      </select>
      <div className="mt-5 grid gap-3">
        <button className="rounded-2xl bg-suwon px-4 py-3 font-bold text-white transition hover:opacity-90" type="button" onClick={onDirections}>대중교통 길찾기</button>
        <button className="rounded-2xl border border-slate-200 px-4 py-3 font-bold text-slate-700 transition hover:bg-slate-50" type="button" onClick={onOpenMap}>네이버 지도 열기</button>
      </div>
    </section>
  );
}
