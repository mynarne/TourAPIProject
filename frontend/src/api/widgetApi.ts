export type WeatherData = {
  status: 'fresh' | 'stale' | 'unavailable';
  temp: string | null;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | null;
  desc: string | null;
};

export type ExchangeData = {
  status: 'fresh' | 'stale' | 'unavailable';
  USD: string | null;
  JPY: string | null;
  CNY: string | null;
  TWD: string | null;
  units?: Record<string, string>;
};

type WidgetResponse<T> = { success: boolean; data: T; message: string | null };

export async function fetchSuwonWeather(): Promise<WeatherData> {
  try {
    const res = await fetch('/api/v1/weather');
    if (res.ok) {
      const payload = (await res.json()) as WidgetResponse<WeatherData>;
      return payload.data;
    }
  } catch {
    // fallback
  }
  return {
    status: 'unavailable',
    temp: null,
    condition: null,
    desc: null,
  };
}

export async function fetchSuwonExchange(): Promise<ExchangeData> {
  try {
    const res = await fetch('/api/v1/exchange');
    if (res.ok) {
      const payload = (await res.json()) as WidgetResponse<ExchangeData>;
      return payload.data;
    }
  } catch {
    // fallback
  }
  return {
    status: 'unavailable',
    USD: null,
    JPY: null,
    CNY: null,
    TWD: null,
  };
}
