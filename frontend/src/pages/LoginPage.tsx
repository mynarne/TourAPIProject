import { useCallback, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { loginWithGoogleCredential } from '../api/authApi';
import { GoogleSignInButton } from '../features/auth/components/GoogleSignInButton';
import { useAuth } from '../features/auth/hooks/useAuth';

export function LoginPage() {
  const { status, setAuthenticated } = useAuth(); const navigate = useNavigate(); const [params] = useSearchParams(); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const handleCredential = useCallback(async (credential: string) => { setLoading(true); setError(''); try { const result = await loginWithGoogleCredential(credential); if (!result.user) throw new Error('사용자 정보를 확인하지 못했습니다.'); setAuthenticated(result.user, result.csrfToken); navigate(params.get('next') || '/profile', { replace: true }); } catch (loginError) { setError(loginError instanceof Error ? loginError.message : '로그인에 실패했습니다.'); } finally { setLoading(false); } }, [navigate, params, setAuthenticated]);
  if (status === 'authenticated') return <Navigate to="/profile" replace />;
  return <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-5xl items-center justify-center px-5 py-16"><div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm"><p className="font-semibold text-suwon">Frog Lab · LinkSuwon</p><h1 className="mt-3 text-3xl font-black text-slate-900">수원 여행을 이어서 기록하세요</h1><p className="mt-4 text-sm leading-6 text-slate-500">Google 계정으로 로그인하면 여행 기록과 동기화 데이터를 안전하게 이어갈 수 있습니다.</p><div className="mt-8 flex justify-center"><GoogleSignInButton onCredential={(credential) => void handleCredential(credential)} disabled={loading} /></div>{loading && <p className="mt-4 text-sm text-suwon">로그인 처리 중...</p>}{error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<p className="mt-8 text-xs text-slate-400">Google credential은 브라우저에 저장하지 않고 백엔드에서 검증합니다.</p></div></section>;
}
