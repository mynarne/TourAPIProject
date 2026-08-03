import { useCallback, useEffect, useState } from 'react';

import { ApiError } from '../../../api/client';
import { getTourSpotDetail, type TourLanguage, type TourSpotDetail } from '../../../api/tourismApi';

type DetailState = 'loading' | 'success' | 'not-found' | 'error';

export function useTourSpotDetail(contentId: string | undefined, language: TourLanguage = 'kor') {
  const [spot, setSpot] = useState<TourSpotDetail | null>(null);
  const [state, setState] = useState<DetailState>('loading');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!contentId) {
      setState('not-found');
      return;
    }
    setState('loading');
    setError(null);
    try {
      const response = await getTourSpotDetail(contentId, language);
      setSpot(response.data);
      setState('success');
    } catch (caughtError) {
      setSpot(null);
      if (caughtError instanceof ApiError && caughtError.status === 404) {
        setState('not-found');
      } else {
        setError('상세 정보를 불러오지 못했습니다.');
        setState('error');
      }
    }
  }, [contentId, language]);

  useEffect(() => {
    void load();
  }, [load]);

  return { spot, state, error, retry: load };
}
