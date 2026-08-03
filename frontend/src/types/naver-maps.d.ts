export {};

declare global {
  namespace naver.maps {
    class Map {
      constructor(element: HTMLElement, options: MapOptions);
      setCenter(center: LatLng): void;
      setZoom(zoom: number): void;
      destroy?: () => void;
    }

    class LatLng {
      constructor(latitude: number, longitude: number);
    }

    class Marker {
      constructor(options: MarkerOptions);
      setMap(map: Map | null): void;
    }

    class Point {
      constructor(x: number, y: number);
    }

    namespace Event {
      function addListener(target: unknown, eventName: string, listener: () => void): unknown;
    }

    type MapOptions = {
      center: LatLng;
      zoom: number;
      mapTypeControl?: boolean;
      zoomControl?: boolean;
      minZoom?: number;
    };

    type MarkerOptions = {
      position: LatLng;
      map?: Map;
      title?: string;
      icon?: {
        content: string;
        anchor?: Point;
      };
    };
  }

  interface Window {
    naver?: typeof naver;
  }
}
