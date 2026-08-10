import { useCallback, useEffect, useRef, useState } from 'react';

import { getTourSpots, type GetTourSpotsParams, type TourSpot, type TourSpotsResponse } from '../../../api/tourismApi';
import type { SpotLoadState } from '../types';

const inFlightRequests = new Map<string, Promise<TourSpotsResponse>>();

const EMPTY_PAGINATION = { page: 1, pageSize: 20, totalCount: 0, totalPages: 0 };

export function useTourSpots(params: GetTourSpotsParams) {
  const [items, setItems] = useState<TourSpot[]>([]);
  const [state, setState] = useState<SpotLoadState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const requestVersion = useRef(0);

  const load = useCallback(async () => {
    const currentVersion = ++requestVersion.current;
    setState('loading');
    setError(null);
    // 이전 요청의 totalPages/currentPage가 새 페이지 요청을 되돌리지 않도록 초기화한다.
    setPagination(EMPTY_PAGINATION);
    try {
      const requestKey = JSON.stringify({
        language: params.language || 'kor',
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        category: params.category || 'all',
        keyword: params.keyword || '',
      });
      let request = inFlightRequests.get(requestKey);
      if (!request) {
        request = getTourSpots(params);
        inFlightRequests.set(requestKey, request);
        void request.then(() => {
          if (inFlightRequests.get(requestKey) === request) inFlightRequests.delete(requestKey);
        }, () => {
          if (inFlightRequests.get(requestKey) === request) inFlightRequests.delete(requestKey);
        });
      }
      const response = await request;
      if (currentVersion !== requestVersion.current) return;
      setItems(response.data.items);
      setPagination(response.data.pagination);
      setState(response.data.items.length ? 'success' : 'empty');
    } catch {
      if (currentVersion !== requestVersion.current) return;
      setItems([]);
      setPagination(EMPTY_PAGINATION);
      setError('관광지 정보를 불러오지 못했습니다.');
      setState('error');
    }
  }, [params.category, params.keyword, params.language, params.page, params.pageSize]);

  useEffect(() => {
    void load();
  }, [load]);

  return { items, state, error, pagination, retry: load };
}
