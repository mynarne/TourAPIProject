import { Link } from 'react-router-dom';
import type { TravelRecord } from '../../../api/recordsApi';

export function TravelRecordCard({ record }: { record: TravelRecord }) {
  return <Link to={`/records/${record.id}`} className="group relative block min-h-[380px] overflow-hidden rounded-[2rem] bg-slate-200 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
    {record.imageUrl ? <img src={record.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-slate-100 to-indigo-100" />}
    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/15 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-6 text-white"><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">{record.visitedAt || 'Travel memory'}</p><h2 className="mt-2 text-2xl font-black tracking-tight">{record.title}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-white/80">{record.summary || '수원에서의 소중한 순간을 기록했어요.'}</p><div className="mt-4 flex items-center gap-2 text-xs text-white/75">📍 {record.location || '수원'}</div></div>
  </Link>;
}
