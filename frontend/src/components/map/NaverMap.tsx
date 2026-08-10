import { useEffect, useRef, useState } from 'react';

import { useNaverMapScript } from '../../hooks/useNaverMapScript';
import { NaverMapFallback } from './NaverMapFallback';

type NaverMapProps = {
  latitude: number;
  longitude: number;
  zoom?: number;
  showMarker?: boolean;
  markerTitle?: string;
  markers?: Array<{ latitude: number; longitude: number; title: string }>;
  className?: string;
};

function isValidCoordinate(latitude: number, longitude: number) {
  return Number.isFinite(latitude) && Number.isFinite(longitude)
    && latitude >= -90 && latitude <= 90
    && longitude >= -180 && longitude <= 180;
}

export function NaverMap({
  latitude,
  longitude,
  zoom = 15,
  showMarker = true,
  markerTitle = '관광지',
  markers = [],
  className = 'h-80',
}: NaverMapProps) {
  const validCoordinate = isValidCoordinate(latitude, longitude);
  const { status, error } = useNaverMapScript(validCoordinate);
  const sdkReady = status === 'ready' && Boolean(window.naver?.maps);
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const markerRefs = useRef<naver.maps.Marker[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const markerKey = markers.map((marker) => `${marker.latitude},${marker.longitude},${marker.title}`).join('|');

  useEffect(() => {
    if (!validCoordinate || status !== 'ready' || !mapElementRef.current || !window.naver?.maps) return;

    setMapError(null);
    let map: naver.maps.Map | null = null;
    try {
      map = new window.naver.maps.Map(mapElementRef.current, {
        center: new window.naver.maps.LatLng(latitude, longitude),
        zoom,
      });
      mapRef.current = map;

      const markerItems = markers.length > 0 ? markers.filter((marker) => isValidCoordinate(marker.latitude, marker.longitude)) : [];
      if (showMarker && markerItems.length === 0) {
        markerItems.push({ latitude, longitude, title: markerTitle });
      }
      markerRefs.current = markerItems.map((marker) => new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(marker.latitude, marker.longitude),
        map: map as naver.maps.Map,
        title: marker.title,
      }));
    } catch (mapCreationError) {
      console.error('네이버 지도를 초기화하지 못했습니다.', mapCreationError);
      markerRefs.current.forEach((marker) => marker.setMap(null));
      markerRefs.current = [];
      mapRef.current = null;
      setMapError('지도를 불러오지 못했습니다.');
    }

    return () => {
      markerRefs.current.forEach((marker) => marker.setMap(null));
      markerRefs.current = [];
      // SDK의 destroy는 버전별 동작 차이가 있어 marker만 명시적으로 해제한다.
      mapRef.current = null;
      if (mapElementRef.current) mapElementRef.current.replaceChildren();
    };
  }, [latitude, longitude, markerKey, markerTitle, showMarker, status, validCoordinate, zoom]);

  if (!validCoordinate) {
    return <NaverMapFallback message="위치 정보가 제공되지 않는 장소입니다." />;
  }
  if (status === 'idle' || status === 'loading') {
    return <NaverMapFallback message="지도를 불러오는 중입니다." />;
  }
  if (status === 'error' || (status === 'ready' && !sdkReady)) {
    return <NaverMapFallback message={error || '지도를 불러오지 못했습니다.'} tone="error" />;
  }
  if (mapError) {
    return <NaverMapFallback message={mapError} tone="error" />;
  }

  return <div ref={mapElementRef} className={`overflow-hidden rounded-2xl ${className}`} aria-label={`${markerTitle} 위치 지도`} />;
}
