import { useEffect, useState } from 'react';

type LocationState = 'idle' | 'loading' | 'success' | 'denied' | 'error';

export function useTrafficLocation() {
  const [state, setState] = useState<LocationState>('idle');
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setState('error');
      return;
    }

    setState('loading');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCoordinates({ latitude: coords.latitude, longitude: coords.longitude });
        setState('success');
      },
      (error) => setState(error.code === error.PERMISSION_DENIED ? 'denied' : 'error'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }, []);

  return { state, coordinates };
}
