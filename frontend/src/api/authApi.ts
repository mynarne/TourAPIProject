import { apiFetch } from './client';

export type AuthUser = { id: number; email: string | null; name: string; picture: string | null };
export type AuthResponse = { authenticated: boolean; user: AuthUser | null; csrfToken?: string };
type ApiEnvelope<T> = { success: boolean; data: T; message: string | null };

export async function getAuthMe() { return (await apiFetch<ApiEnvelope<AuthResponse>>('/auth/me')).data; }
export async function loginWithGoogleCredential(credential: string) { return (await apiFetch<ApiEnvelope<AuthResponse>>('/auth/login', { method: 'POST', body: JSON.stringify({ credential }) })).data; }
export async function logout() { await apiFetch<ApiEnvelope<null>>('/auth/logout', { method: 'POST' }); }
export async function syncLocalData(savedPlaces: unknown[], visitRecords: unknown[]) { return (await apiFetch<ApiEnvelope<{ savedPlaces: unknown[]; visitRecords: unknown[] }>>('/auth/sync', { method: 'POST', body: JSON.stringify({ savedPlaces, visitRecords }) })).data; }
export async function deleteAccount() { await apiFetch<ApiEnvelope<null>>('/auth/account', { method: 'DELETE' }); }
