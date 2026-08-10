import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { RecordLanguage, TravelRecord } from '../api/recordsApi';
import { RecordEmptyState } from '../features/records/components/RecordEmptyState';
import { RecordForm } from '../features/records/components/RecordForm';
import { TravelRecordCard } from '../features/records/components/TravelRecordCard';
import { useRecords } from '../features/records/hooks/useRecords';
import { useLanguage } from '../i18n';

const languages = new Set<RecordLanguage>(['kor', 'eng', 'jpn', 'chs', 'cht']);

export function RecordsPage() {
  const { language, t } = useLanguage();
  const currentLang = (languages.has(language as RecordLanguage) ? language : 'kor') as RecordLanguage;
  const { records, setRecords, state, error, retry } = useRecords(currentLang);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TravelRecord>();

  function saved(record: TravelRecord) {
    setRecords((current) => (editing ? current.map((item) => (item.id === record.id ? record : item)) : [record, ...current]));
    setFormOpen(false);
    setEditing(undefined);
  }

  return (
    <section className="page-shell">
      <Link className="mb-8 inline-flex rounded-lg px-2 py-2 text-sm font-bold text-suwon hover:bg-suwon-soft" to={`/?lang=${currentLang}`}>
        {t('btn_back')}
      </Link>
      <header className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">Travel Memory Archive</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{t('timeline_title')}</h1>
          <p className="mt-3 text-slate-500">{t('dashboard_record_desc')}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(undefined);
            setFormOpen(true);
          }}
          className="rounded-xl bg-suwon px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-suwon-dark"
        >
          {t('btn_add_record')}
        </button>
      </header>

      {formOpen && (
        <div className="mb-8">
          <RecordForm initial={editing} language={currentLang} onSaved={saved} onCancel={() => { setFormOpen(false); setEditing(undefined); }} />
        </div>
      )}

      {state === 'loading' && (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-96 animate-pulse rounded-[2rem] bg-slate-200" />
          ))}
        </div>
      )}

      {state === 'error' && (
        <div className="rounded-3xl bg-red-50 p-10 text-center">
          <p className="text-red-700">{error || t('msg_api_fail')}</p>
          <button type="button" className="mt-4 rounded-xl bg-suwon px-4 py-2 text-sm font-bold text-white" onClick={() => void retry()}>
            {t('btn_back')}
          </button>
        </div>
      )}

      {state === 'empty' && <RecordEmptyState onCreate={() => setFormOpen(true)} />}

      {state === 'ready' && (
        <>
          <div className="mb-5 text-sm text-slate-500">{records.length} {t('menu_records')}</div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {records.map((record) => (
              <TravelRecordCard key={record.id} record={record} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
