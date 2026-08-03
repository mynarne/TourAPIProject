import { apiFetch } from './client';

export type HealthResponse = {
  success: boolean;
  data: {
    service: string;
    status: string;
  };
  message: string | null;
};

export function getHealth() {
  return apiFetch<HealthResponse>('/health');
}
