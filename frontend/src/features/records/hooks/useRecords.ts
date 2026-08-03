import { useCallback, useEffect, useState } from 'react';
import { getRecords, type RecordLanguage, type TravelRecord } from '../../../api/recordsApi';
import { ApiError } from '../../../api/client';
import type { RecordsState } from '../types';

export function useRecords(language: RecordLanguage) {
  const [records, setRecords] = useState<TravelRecord[]>([]); const [state, setState] = useState<RecordsState>('loading'); const [error, setError] = useState('');
  const load = useCallback(async () => { setState('loading'); setError(''); try { const result = await getRecords(language); setRecords(result); setState(result.length ? 'ready' : 'empty'); } catch (loadError) { setState('error'); setError(loadError instanceof ApiError && loadError.status === 401 ? '기록을 보려면 로그인이 필요합니다.' : loadError instanceof Error ? loadError.message : '기록을 불러오지 못했습니다.'); } }, [language]);
  useEffect(() => { void load(); }, [load]); return { records, setRecords, state, error: error || (state === 'error' ? '기록을 불러오지 못했습니다.' : ''), retry: load };
}
