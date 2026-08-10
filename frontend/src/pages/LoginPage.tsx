import { useCallback, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { loginWithGoogleCredential } from '../api/authApi';
import { GoogleSignInButton } from '../features/auth/components/GoogleSignInButton';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useLanguage } from '../i18n';

export function LoginPage() {
  const { status, setAuthenticated } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCredential = useCallback(
    async (credential: string) => {
      setLoading(true);
      setError('');
      try {
        const result = await loginWithGoogleCredential(credential);
        if (!result.user) throw new Error(t('msg_api_fail'));
        setAuthenticated(result.user, result.csrfToken);
        navigate(params.get('next') || `/profile?lang=${language}`, { replace: true });
      } catch (loginError) {
        setError(loginError instanceof Error ? loginError.message : t('msg_api_fail'));
      } finally {
        setLoading(false);
      }
    },
    [language, navigate, params, setAuthenticated, t],
  );

  if (status === 'authenticated') return <Navigate to={`/profile?lang=${language}`} replace />;

  return (
    <section className="mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-7 text-center shadow-xl shadow-slate-200/60 sm:p-9">
        <p className="eyebrow">LinkSuwon Account</p>
        <h1 className="mt-3 text-3xl font-black text-slate-900">{t('menu_profile')}</h1>
        <p className="mt-4 text-sm leading-6 text-slate-500">{t('hero_subtitle')}</p>
        <div className="mt-8 flex justify-center">
          <GoogleSignInButton onCredential={(credential) => void handleCredential(credential)} disabled={loading} />
        </div>
        {loading && <p className="mt-4 text-sm text-suwon">{t('msg_loading')}</p>}
        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      </div>
    </section>
  );
}
