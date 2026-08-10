import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { deleteAccount, syncLocalData } from '../api/authApi';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useLanguage } from '../i18n';

export function ProfilePage() {
  const { user, signOut } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [syncing, setSyncing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState('');

  async function sync() {
    setSyncing(true);
    setMessage('');
    try {
      const savedPlaces = JSON.parse(localStorage.getItem('linksuwon:savedPlaces') || '[]');
      const visitRecords = JSON.parse(localStorage.getItem('linksuwon:visitRecords') || '[]');
      const result = await syncLocalData(savedPlaces, visitRecords);
      localStorage.setItem('linksuwon:savedPlaces', JSON.stringify(result.savedPlaces));
      localStorage.setItem('linksuwon:visitRecords', JSON.stringify(result.visitRecords));
      setMessage(`${t('profile_sync')} ✓`);
    } catch {
      setMessage(t('msg_api_fail'));
    } finally {
      setSyncing(false);
    }
  }

  async function removeAccount() {
    setDeleting(true);
    try {
      await deleteAccount();
      ['linksuwon:savedPlaces', 'linksuwon:visitRecords', 'linksuwon:recentPlaces', 'linksuwon:overallReview'].forEach((key) =>
        localStorage.removeItem(key),
      );
      navigate(`/?lang=${language}`, { replace: true });
    } catch {
      setMessage(t('msg_api_fail'));
      setDeleting(false);
    }
  }

  if (!user) return null;

  return (
    <section className="mx-auto max-w-3xl px-5 py-12">
      <Link className="mb-8 inline-block text-sm font-bold text-suwon" to={`/?lang=${language}`}>
        {t('btn_back')}
      </Link>
      <header className="mb-8">
        <p className="font-semibold text-suwon">LinkSuwon Profile</p>
        <h1 className="mt-2 text-4xl font-black text-slate-900">{t('menu_profile')}</h1>
      </header>

      <div className="rounded-[2rem] bg-white p-7 shadow-sm">
        <div className="flex items-center gap-4">
          {user.picture ? (
            <img src={user.picture} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl">👤</div>
          )}
          <div>
            <h2 className="text-xl font-black">{user.name}</h2>
            <p className="text-sm text-slate-500">{user.email || ''}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link to={`/records?lang=${language}`} className="rounded-xl bg-suwon px-4 py-3 text-center text-sm font-bold text-white">
            {t('menu_records')}
          </Link>
          <button
            type="button"
            onClick={() => void sync()}
            disabled={syncing}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 disabled:opacity-50"
          >
            {syncing ? t('msg_loading') : t('profile_sync')}
          </button>
          <button
            type="button"
            onClick={() => void signOut().then(() => navigate('/'))}
            className="rounded-xl border border-red-200 px-4 py-3 text-sm font-bold text-red-600"
          >
            {t('btn_logout')}
          </button>
        </div>
        {message && <p className="mt-5 rounded-xl bg-blue-50 p-3 text-sm text-blue-800">{message}</p>}
      </div>

      <div className="mt-8 rounded-3xl border border-red-100 bg-red-50/60 p-6">
        <h2 className="font-black text-red-700">{t('danger_zone')}</h2>
        <p className="mt-2 text-sm leading-6 text-red-700/80">{t('delete_account_desc')}</p>
        {confirming ? (
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              disabled={deleting}
              onClick={() => void removeAccount()}
              className="rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              {deleting ? t('deleting') : t('confirm_delete')}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-600"
            >
              {t('cancel')}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="mt-4 rounded-xl border border-red-200 px-4 py-3 text-sm font-bold text-red-600"
          >
            {t('start_delete_account')}
          </button>
        )}
      </div>
    </section>
  );
}
