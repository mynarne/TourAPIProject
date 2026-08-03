import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { PwaStatus } from '../../features/pwa/components/PwaStatus';

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  const { status, user } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PwaStatus />
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link className="flex items-center gap-2.5 no-underline" to="/">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-suwon text-sm font-black text-white shadow-sm">LS</span>
            <span><span className="block text-base font-black leading-none text-slate-900">LinkSuwon</span><span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Frog Lab</span></span>
          </Link>
          <nav className="flex items-center gap-1 text-sm font-semibold" aria-label="주요 메뉴">
            <Link to="/explore" className="rounded-lg px-2.5 py-2 text-slate-600 transition hover:bg-suwon-soft hover:text-suwon">탐색</Link>
            <Link to="/traffic" className="rounded-lg px-2.5 py-2 text-slate-600 transition hover:bg-suwon-soft hover:text-suwon">교통</Link>
            <Link to="/chatbot" className="rounded-lg px-2.5 py-2 text-slate-600 transition hover:bg-suwon-soft hover:text-suwon">AI 안내</Link>
            {status === 'authenticated' && user ? <Link to="/profile" className="ml-1 rounded-lg bg-suwon-soft px-3 py-2 font-bold text-suwon">{user.name}</Link> : status === 'loading' ? <span className="px-2.5 py-2 text-slate-400">확인 중</span> : <Link to="/login" className="ml-1 rounded-lg bg-suwon px-3 py-2 font-bold text-white shadow-sm transition hover:bg-suwon-dark">로그인</Link>}
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
