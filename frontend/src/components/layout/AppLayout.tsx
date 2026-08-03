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
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a className="text-xl font-extrabold text-suwon" href="/">
            LinkSuwon
          </a>
          <div className="flex items-center gap-4 text-sm"><Link to="/explore" className="text-slate-500">탐색</Link><Link to="/traffic" className="text-slate-500">교통</Link><Link to="/chatbot" className="text-slate-500">AI 안내</Link>{status === 'authenticated' && user ? <Link to="/profile" className="font-bold text-suwon">{user.name}</Link> : status === 'loading' ? <span className="text-slate-400">확인 중</span> : <Link to="/login" className="font-bold text-suwon">로그인</Link>}</div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
