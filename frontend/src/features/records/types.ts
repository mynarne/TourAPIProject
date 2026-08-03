import type { RecordLanguage, TravelRecord } from '../../api/recordsApi';
export type RecordsState = 'loading' | 'ready' | 'empty' | 'error';
export type RecordFormProps = { initial?: TravelRecord; language: RecordLanguage; onSaved: (record: TravelRecord) => void; onCancel?: () => void };
