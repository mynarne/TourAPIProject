import type { TourSpotDetail } from '../../../api/tourismApi';

export function SpotDetailHero({ spot }: { spot: TourSpotDetail }) {
  return (
    <div className="mb-8">
      <p className="font-semibold uppercase tracking-wide text-suwon">{spot.category}</p>
      <h1 className="mt-2 text-4xl font-black tracking-tight">{spot.title}</h1>
      <p className="mt-3 text-slate-500">{spot.address}{spot.addressDetail ? ` ${spot.addressDetail}` : ''}</p>
    </div>
  );
}
