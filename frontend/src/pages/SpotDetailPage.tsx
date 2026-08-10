import { Link, useParams } from 'react-router-dom';

import { SpotDetailHero } from '../features/spots/components/SpotDetailHero';
import { SpotDetailSkeleton } from '../features/spots/components/SpotDetailSkeleton';
import { SpotImageGallery } from '../features/spots/components/SpotImageGallery';
import { SpotInfoSection } from '../features/spots/components/SpotInfoSection';
import { SpotLocationMap } from '../features/spots/components/SpotLocationMap';
import { useTourSpotDetail } from '../features/spots/hooks/useTourSpotDetail';
import { useLanguage } from '../i18n';

export function SpotDetailPage() {
  const { contentId } = useParams<{ contentId: string }>();
  const { language, t } = useLanguage();
  const { spot, state, error, retry } = useTourSpotDetail(contentId, language);

  if (state === 'loading') return <SpotDetailSkeleton />;
  if (state === 'not-found') {
    return <DetailError title={t('msg_api_fail')} message={t('msg_no_saved')} backLabel={t('btn_back')} />;
  }
  if (state === 'error' || !spot) {
    return <DetailError title={t('msg_api_fail')} message={error || t('msg_loading')} onRetry={() => void retry()} backLabel={t('btn_back')} />;
  }

  return (
    <section className="mx-auto max-w-5xl px-5 py-12">
      <Link className="mb-8 inline-block text-sm font-bold text-suwon" to={`/explore?lang=${language}`}>{t('btn_back')}</Link>
      <SpotDetailHero spot={spot} />
      <SpotImageGallery title={spot.title} images={spot.images} />
      <SpotInfoSection spot={spot} />
      <SpotLocationMap latitude={spot.latitude} longitude={spot.longitude} title={spot.title} />
    </section>
  );
}

function DetailError({ title, message, onRetry, backLabel }: { title: string; message: string; onRetry?: () => void; backLabel: string }) {
  return (
    <section className="mx-auto max-w-5xl px-5 py-24 text-center">
      <h1 className="text-3xl font-black">{title}</h1>
      <p className="mt-3 text-slate-500">{message}</p>
      {onRetry && <button className="mt-6 rounded-xl bg-suwon px-5 py-3 font-bold text-white" onClick={onRetry}>{backLabel}</button>}
      <div><Link className="mt-6 inline-block text-suwon underline" to="/explore">{backLabel}</Link></div>
    </section>
  );
}
