import { useEffect, useRef } from 'react';

import { useNaverMapScript } from '../../hooks/useNaverMapScript';
import { NaverMapFallback } from './NaverMapFallback';

type NaverMapProps = {
  latitude: number;
  longitude: number;
  zoom?: number;
  showMarker?: boolean;
  markerTitle?: string;
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
  className = 'h-80',
}: NaverMapProps) {
  const validCoordinate = isValidCoordinate(latitude, longitude);
  const { status, error } = useNaverMapScript(validCoordinate);
  const sdkReady = status === 'ready' && Boolean(window.naver?.maps);
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const markerRef = useRef<naver.maps.Marker | null>(null);

  useEffect(() => {
    if (!validCoordinate || status !== 'ready' || !mapElementRef.current || !window.naver?.maps) return;

    const map = new window.naver.maps.Map(mapElementRef.current, {
      center: new window.naver.maps.LatLng(latitude, longitude),
      zoom,
      mapTypeControl: false,
      zoomControl: true,
      minZoom: 10,
    });
    mapRef.current = map;

    if (showMarker) {
      markerRef.current = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(latitude, longitude),
        map,
        title: markerTitle,
        icon: {
          content: '<div style="color:#1464d2;font-size:36px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.25))">●</div>',
          anchor: new window.naver.maps.Point(18, 18),
        },
      });
    }

    return () => {
      markerRef.current?.setMap(null);
      markerRef.current = null;
      map.destroy?.();
      mapRef.current = null;
      if (mapElementRef.current) mapElementRef.current.replaceChildren();
    };
  }, [latitude, longitude, markerTitle, showMarker, status, validCoordinate, zoom]);

  if (!validCoordinate) {
    return <NaverMapFallback message="위치 정보가 제공되지 않는 장소입니다." />;
  }
  if (status === 'idle' || status === 'loading') {
    return <NaverMapFallback message="지도를 불러오는 중입니다." />;
  }
  if (status === 'error' || (status === 'ready' && !sdkReady)) {
    return <NaverMapFallback message={error || '지도를 불러오지 못했습니다.'} tone="error" />;
  }

  return <div ref={mapElementRef} className={`overflow-hidden rounded-2xl ${className}`} aria-label={`${markerTitle} 위치 지도`} />;
}
