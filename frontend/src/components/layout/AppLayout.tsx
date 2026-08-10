import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { PwaStatus } from '../../features/pwa/components/PwaStatus';
import { useLanguage, SUPPORTED_LANGUAGES, LANGUAGE_LABELS, AppLanguage } from '../../i18n';

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  const { status, user } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PwaStatus />
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link className="flex items-center gap-2.5 no-underline" to={`/?lang=${language}`}>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-suwon text-sm font-black text-white shadow-sm">LS</span>
            <span className="block text-base font-black leading-none text-slate-900">LinkSuwon</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-1.5 text-sm font-semibold" aria-label="주요 메뉴">
            <Link to={`/explore?lang=${language}`} className="rounded-lg px-2.5 py-2 text-slate-600 transition hover:bg-suwon-soft hover:text-suwon">
              {t('menu_attractions')}
            </Link>
            <Link to={`/traffic?lang=${language}`} className="rounded-lg px-2.5 py-2 text-slate-600 transition hover:bg-suwon-soft hover:text-suwon">
              {t('menu_map')}
            </Link>
            <Link to={`/chatbot?lang=${language}`} className="rounded-lg px-2.5 py-2 text-slate-600 transition hover:bg-suwon-soft hover:text-suwon">
              {t('menu_chatbot')}
            </Link>
            <Link to={`/records?lang=${language}`} className="rounded-lg px-2.5 py-2 text-slate-600 transition hover:bg-suwon-soft hover:text-suwon">
              {t('menu_records')}
            </Link>

            {/* Language Selector Dropdown */}
            <div className="relative flex items-center gap-1 border-l border-slate-200 pl-2">
              <span className="text-xs font-bold text-slate-400">🌐</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as AppLanguage)}
                className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-700 shadow-sm transition hover:border-suwon focus:outline-none"
                aria-label="언어 선택"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {LANGUAGE_LABELS[lang]}
                  </option>
                ))}
              </select>
            </div>

            {status === 'authenticated' && user ? (
              <Link to={`/profile?lang=${language}`} className="ml-1 rounded-lg bg-suwon-soft px-3 py-2 font-bold text-suwon">
                {user.name}
              </Link>
            ) : status === 'loading' ? (
              <span className="px-2.5 py-2 text-slate-400">{t('msg_loading')}</span>
            ) : (
              <Link to={`/login?lang=${language}`} className="ml-1 rounded-lg bg-suwon px-3 py-2 font-bold text-white shadow-sm transition hover:bg-suwon-dark">
                {t('menu_profile')}
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
