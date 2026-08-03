import { Link, useParams, useSearchParams } from 'react-router-dom';

import { SpotDetailHero } from '../features/spots/components/SpotDetailHero';
import { SpotDetailSkeleton } from '../features/spots/components/SpotDetailSkeleton';
import { SpotImageGallery } from '../features/spots/components/SpotImageGallery';
import { SpotInfoSection } from '../features/spots/components/SpotInfoSection';
import { SpotLocationMap } from '../features/spots/components/SpotLocationMap';
import { useTourSpotDetail } from '../features/spots/hooks/useTourSpotDetail';

export function SpotDetailPage() {
  const { contentId } = useParams<{ contentId: string }>();
  const [searchParams] = useSearchParams();
  const language = (searchParams.get('language') || 'kor') as 'kor' | 'eng' | 'jpn' | 'chs' | 'cht';
  const { spot, state, error, retry } = useTourSpotDetail(contentId, language);

  if (state === 'loading') return <SpotDetailSkeleton />;
  if (state === 'not-found') {
    return <DetailError title="관광지를 찾을 수 없습니다." message="목록에서 다른 장소를 선택해 주세요." />;
  }
  if (state === 'error' || !spot) {
    return <DetailError title="상세 정보를 불러오지 못했습니다." message={error || '잠시 후 다시 시도해 주세요.'} onRetry={() => void retry()} />;
  }

  return (
    <section className="mx-auto max-w-5xl px-5 py-12">
      <Link className="mb-8 inline-block text-sm font-bold text-suwon" to="/explore">← 목록으로</Link>
      <SpotDetailHero spot={spot} />
      <SpotImageGallery title={spot.title} images={spot.images} />
      <SpotInfoSection spot={spot} />
      <SpotLocationMap latitude={spot.latitude} longitude={spot.longitude} title={spot.title} />
    </section>
  );
}

function DetailError({ title, message, onRetry }: { title: string; message: string; onRetry?: () => void }) {
  return (
    <section className="mx-auto max-w-5xl px-5 py-24 text-center">
      <h1 className="text-3xl font-black">{title}</h1>
      <p className="mt-3 text-slate-500">{message}</p>
      {onRetry && <button className="mt-6 rounded-xl bg-suwon px-5 py-3 font-bold text-white" onClick={onRetry}>다시 시도</button>}
      <div><Link className="mt-6 inline-block text-suwon underline" to="/explore">목록으로 돌아가기</Link></div>
    </section>
  );
}
