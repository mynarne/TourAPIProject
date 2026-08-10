import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n';

export function NotFoundPage() {
  const { language, t } = useLanguage();

  return (
    <section className="mx-auto max-w-6xl px-5 py-24 text-center">
      <p className="eyebrow">404 · Not Found</p>
      <h1 className="mt-3 text-3xl font-black text-slate-950">{t('msg_api_fail')}</h1>
      <p className="mt-3 text-slate-500">{t('hero_subtitle')}</p>
      <Link className="mt-7 inline-flex rounded-xl bg-suwon px-5 py-3 font-bold text-white" to={`/?lang=${language}`}>
        {t('btn_back')}
      </Link>
    </section>
  );
}
