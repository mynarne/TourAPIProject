import type { TourSpot } from '../../../api/tourismApi';
import { Link } from 'react-router-dom';

type SpotCardProps = {
  spot: TourSpot;
};

export function SpotCard({ spot }: SpotCardProps) {
  return (
    <Link to={`/spots/${encodeURIComponent(spot.contentId)}`} className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm no-underline transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
      {spot.imageUrl ? (
        <img className="h-48 w-full object-cover transition duration-500 group-hover:scale-105" src={spot.imageUrl} alt={spot.title} loading="lazy" />
      ) : (
        <div className="flex h-48 items-center justify-center bg-suwon-soft text-sm font-semibold text-suwon">
          사진 준비 중
        </div>
      )}
      <div className="p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-suwon">{spot.category}</p>
        <h2 className="mt-2 text-lg font-black text-slate-900">{spot.title}</h2>
        <p className="mt-2 line-clamp-2 text-sm text-slate-500">{spot.overview || spot.address}</p>
      </div>
    </Link>
  );
}
