import { apiFetch } from './client';

export type TrafficLanguage = 'kor' | 'eng' | 'jpn' | 'chs' | 'cht';

export type TrafficDestination = {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
};

export type TrafficGuide = {
  title: string;
  items: Array<{ title: string; description: string }>;
};

export type TrafficData = {
  center: { latitude: number; longitude: number };
  destinations: TrafficDestination[];
  guides: Record<string, TrafficGuide>;
};

type TrafficResponse = { success: true; data: TrafficData; message: null };

export function getTraffic(language: TrafficLanguage) {
  return apiFetch<TrafficResponse>(`/traffic?language=${language}`);
}
