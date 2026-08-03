import { useCallback, useEffect, useState } from 'react';

import { getTourSpots, type GetTourSpotsParams, type TourSpot } from '../../../api/tourismApi';
import type { SpotLoadState } from '../types';

export function useTourSpots(params: GetTourSpotsParams) {
  const [items, setItems] = useState<TourSpot[]>([]);
  const [state, setState] = useState<SpotLoadState>('idle');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState('loading');
    setError(null);
    try {
      const response = await getTourSpots(params);
      setItems(response.data.items);
      setState(response.data.items.length ? 'success' : 'empty');
    } catch {
      setItems([]);
      setError('관광지 정보를 불러오지 못했습니다.');
      setState('error');
    }
  }, [params.category, params.keyword, params.language, params.page, params.pageSize]);

  useEffect(() => {
    void load();
  }, [load]);

  return { items, state, error, retry: load };
}
