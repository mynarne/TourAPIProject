import type { TourSpotDetail } from '../../../api/tourismApi';

export function SpotInfoSection({ spot }: { spot: TourSpotDetail }) {
  const rows = [
    ['전화번호', spot.telephone],
    ['이용시간', spot.openHours],
    ['휴무일', spot.restDate],
    ['주차', spot.parking],
    ['이용요금', spot.usageFee],
    ['소요시간', spot.duration],
  ].filter(([, value]) => value);

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold">상세 안내</h2>
      <p className="mt-3 whitespace-pre-line leading-8 text-slate-600">
        {spot.overview || '등록된 소개 정보가 없습니다.'}
      </p>
      {rows.length > 0 && (
        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div className="rounded-2xl bg-slate-50 p-4" key={label}>
              <dt className="text-sm font-bold text-suwon">{label}</dt>
              <dd className="mt-1 text-sm text-slate-600">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
