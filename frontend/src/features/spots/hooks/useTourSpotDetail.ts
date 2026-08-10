import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError } from '../../../api/client';
import { getTourSpotDetail, type TourLanguage, type TourSpotDetail } from '../../../api/tourismApi';

type DetailState = 'loading' | 'success' | 'not-found' | 'error';

const inFlightDetails = new Map<string, Promise<Awaited<ReturnType<typeof getTourSpotDetail>>>>();

export function useTourSpotDetail(contentId: string | undefined, language: TourLanguage = 'kor') {
  const [spot, setSpot] = useState<TourSpotDetail | null>(null);
  const [state, setState] = useState<DetailState>('loading');
  const [error, setError] = useState<string | null>(null);
  const requestVersion = useRef(0);

  const load = useCallback(async () => {
    const currentVersion = ++requestVersion.current;
    if (!contentId) {
      setState('not-found');
      return;
    }
    setState('loading');
    setError(null);
    try {
      const requestKey = `${contentId}:${language}`;
      let request = inFlightDetails.get(requestKey);
      if (!request) {
        request = getTourSpotDetail(contentId, language);
        inFlightDetails.set(requestKey, request);
        void request.then(() => {
          if (inFlightDetails.get(requestKey) === request) inFlightDetails.delete(requestKey);
        }, () => {
          if (inFlightDetails.get(requestKey) === request) inFlightDetails.delete(requestKey);
        });
      }
      const response = await request;
      if (currentVersion !== requestVersion.current) return;
      setSpot(response.data);
      setState('success');
    } catch (caughtError) {
      if (currentVersion !== requestVersion.current) return;
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
