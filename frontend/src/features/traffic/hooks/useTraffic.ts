import { useCallback, useEffect, useState } from 'react';

import { getTraffic, type TrafficData, type TrafficLanguage } from '../../../api/trafficApi';

type TrafficState = 'loading' | 'success' | 'empty' | 'error';

export function useTraffic(language: TrafficLanguage) {
  const [data, setData] = useState<TrafficData | null>(null);
  const [state, setState] = useState<TrafficState>('loading');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setState('loading');
    setError('');
    try {
      const response = await getTraffic(language);
      const nextData = response.data;
      setData(nextData);
      setState(nextData.destinations.length || Object.keys(nextData.guides).length ? 'success' : 'empty');
    } catch (requestError) {
      setState('error');
      setError(requestError instanceof Error ? requestError.message : '교통 정보를 불러오지 못했습니다.');
    }
  }, [language]);

  useEffect(() => { void load(); }, [load]);

  return { data, state, error, retry: load };
}
