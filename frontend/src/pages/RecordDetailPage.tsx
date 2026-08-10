import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteRecord, getRecord, type RecordLanguage, type TravelRecord } from '../api/recordsApi';
import { NaverMapFallback } from '../components/map/NaverMapFallback';
import { RecordForm } from '../features/records/components/RecordForm';
import { SpotLocationMap } from '../features/spots/components/SpotLocationMap';
import { useLanguage } from '../i18n';

const languages = new Set<RecordLanguage>(['kor', 'eng', 'jpn', 'chs', 'cht']);

export function RecordDetailPage() {
  const { id } = useParams();
  const { language, t } = useLanguage();
  const currentLang = (languages.has(language as RecordLanguage) ? language : 'kor') as RecordLanguage;
  const [record, setRecord] = useState<TravelRecord>();
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    void getRecord(Number(id), currentLang)
      .then(setRecord)
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : t('msg_api_fail')));
  }, [id, currentLang, t]);

  if (error) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-24 text-center">
        <NaverMapFallback message={error} tone="error" />
        <Link to={`/records?lang=${currentLang}`} className="mt-5 inline-block rounded-xl bg-suwon px-5 py-3 font-bold text-white">
          {t('btn_back')}
        </Link>
      </section>
    );
  }

  if (!record) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-24">
        <div className="h-96 animate-pulse rounded-[2rem] bg-slate-200" />
      </section>
    );
  }

  const currentRecord = record;
  async function remove() {
    if (!window.confirm(t('confirm_delete_record'))) return;
    await deleteRecord(currentRecord.id);
    navigate(`/records?lang=${currentLang}`);
  }

  return (
    <section className="mx-auto max-w-5xl px-5 py-12">
      <Link className="mb-8 inline-block text-sm font-bold text-suwon" to={`/records?lang=${currentLang}`}>
        {t('btn_back')}
      </Link>
      {editing ? (
        <RecordForm
          initial={record}
          language={currentLang}
          onSaved={(saved) => {
            setRecord(saved);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm">
            <div className="relative h-72 bg-gradient-to-br from-blue-100 to-slate-200 md:h-[28rem]">
              {record.imageUrl && <img src={record.imageUrl} alt="" className="h-full w-full object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
              <div className="absolute bottom-0 p-7 text-white">
                <p className="text-sm font-bold text-blue-200">{record.visitedAt}</p>
                <h1 className="mt-2 text-4xl font-black">{record.title}</h1>
              </div>
            </div>
            <div className="grid gap-8 p-7 md:grid-cols-[1fr_280px]">
              <article>
                <p className="whitespace-pre-wrap text-lg leading-8 text-slate-700">{record.memo || t('placeholder_review')}</p>
              </article>
              <aside className="space-y-3 text-sm text-slate-500">
                <p>📍 {record.location || 'Suwon'}</p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setEditing(true)} className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-700">
                    {t('btn_edit')}
                  </button>
                  <button type="button" onClick={() => void remove()} className="rounded-xl bg-red-50 px-4 py-2 font-bold text-red-600">
                    {t('btn_delete')}
                  </button>
                </div>
              </aside>
            </div>
          </div>
          {record.latitude != null && record.longitude != null && (
            <div className="mt-8">
              <h2 className="mb-3 text-xl font-black">{t('menu_map')}</h2>
              <SpotLocationMap latitude={record.latitude} longitude={record.longitude} title={record.title} />
            </div>
          )}
        </>
      )}
    </section>
  );
}
