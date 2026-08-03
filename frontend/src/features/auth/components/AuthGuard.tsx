import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

export function AuthGuard({ children }: { children: ReactNode }) {
  const { status } = useAuth(); const location = useLocation();
  if (status === 'loading') return <section className="mx-auto max-w-3xl px-5 py-24 text-center"><div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-blue-100" /><p className="mt-4 text-sm text-slate-500">로그인 상태를 확인하는 중입니다.</p></section>;
  if (status === 'error' || status === 'unauthenticated') return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  return <>{children}</>;
}
