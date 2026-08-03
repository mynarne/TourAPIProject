import { apiFetch } from './client';

export type RecordLanguage = 'kor' | 'eng' | 'jpn' | 'chs' | 'cht';
export type TravelRecord = {
  id: number; title: string; placeName: string; contentId: string; visitedAt: string;
  summary: string; memo: string; location: string; latitude: number | null; longitude: number | null;
  imageUrl: string | null; images: string[]; tags: string[]; language: RecordLanguage;
  createdAt: string | null; updatedAt: string | null;
};
export type RecordInput = { title: string; contentId?: string; visitedAt: string; memo?: string; imageUrl?: string; language?: RecordLanguage };
type ApiEnvelope<T> = { success: boolean; data: T; message: string | null };

export async function getRecords(language: RecordLanguage) { return (await apiFetch<ApiEnvelope<TravelRecord[]>>(`/records?language=${language}`)).data; }
export async function getRecord(id: number, language: RecordLanguage) { return (await apiFetch<ApiEnvelope<TravelRecord>>(`/records/${id}?language=${language}`)).data; }
export async function createRecord(input: RecordInput) { return (await apiFetch<ApiEnvelope<TravelRecord>>('/records', { method: 'POST', body: JSON.stringify(input) })).data; }
export async function updateRecord(id: number, input: Partial<RecordInput>) { return (await apiFetch<ApiEnvelope<TravelRecord>>(`/records/${id}`, { method: 'PATCH', body: JSON.stringify(input) })).data; }
export async function deleteRecord(id: number) { await apiFetch<ApiEnvelope<null>>(`/records/${id}`, { method: 'DELETE' }); }

export async function uploadRecordImage(file: File) {
  const form = new FormData(); form.append('file', file);
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/records/upload`, { method: 'POST', credentials: 'include', body: form });
  const result = await response.json() as ApiEnvelope<{ url: string }>;
  if (!response.ok || !result.success) throw new Error(result.message || '이미지를 업로드하지 못했습니다.');
  return result.data.url;
}
