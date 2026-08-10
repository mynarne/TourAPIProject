import { useState, type FormEvent } from 'react';
import { createRecord, uploadRecordImage, updateRecord } from '../../../api/recordsApi';
import type { RecordFormProps } from '../types';
import type { AppLanguage } from '../../../i18n';

const FORM_COPY: Record<
  AppLanguage,
  {
    titleLabel: string;
    dateLabel: string;
    contentIdLabel: string;
    optional: string;
    memoLabel: string;
    imageLabel: string;
    uploading: string;
    cancel: string;
    saving: string;
    save: string;
    update: string;
    titleError: string;
    saveError: string;
    uploadError: string;
  }
> = {
  kor: {
    titleLabel: '장소명 또는 제목',
    dateLabel: '방문 날짜',
    contentIdLabel: '관광지 ID',
    optional: '(선택)',
    memoLabel: '여행 기록 및 메모',
    imageLabel: '대표 사진',
    uploading: '이미지 업로드 중...',
    cancel: '취소',
    saving: '저장 중...',
    save: '기록 남기기',
    update: '기록 수정',
    titleError: '장소명 또는 제목을 입력해 주세요.',
    saveError: '기록을 저장하지 못했습니다.',
    uploadError: '이미지 업로드에 실패했습니다.',
  },
  eng: {
    titleLabel: 'Place Name or Title',
    dateLabel: 'Visit Date',
    contentIdLabel: 'Attraction ID',
    optional: '(Optional)',
    memoLabel: 'Travel Notes & Memories',
    imageLabel: 'Photo',
    uploading: 'Uploading image...',
    cancel: 'Cancel',
    saving: 'Saving...',
    save: 'Save Record',
    update: 'Update Record',
    titleError: 'Please enter a place name or title.',
    saveError: 'Failed to save travel record.',
    uploadError: 'Failed to upload image.',
  },
  jpn: {
    titleLabel: '場所名またはタイトル',
    dateLabel: '訪問日',
    contentIdLabel: '観光地ID',
    optional: '(任意)',
    memoLabel: '旅行の思い出・メモ',
    imageLabel: '写真',
    uploading: '画像をアップロード中...',
    cancel: 'キャンセル',
    saving: '保存中...',
    save: '記録を追加',
    update: '記録を更新',
    titleError: '場所名またはタイトルを入力してください。',
    saveError: '記録を保存できませんでした。',
    uploadError: '画像のアップロードに失敗しました。',
  },
  chs: {
    titleLabel: '地点名称或标题',
    dateLabel: '游览日期',
    contentIdLabel: '景点ID',
    optional: '(可选)',
    memoLabel: '旅行笔记与回忆',
    imageLabel: '照片',
    uploading: '正在上传图片...',
    cancel: '取消',
    saving: '正在保存...',
    save: '保存记录',
    update: '更新记录',
    titleError: '请输入地点名称或标题。',
    saveError: '保存旅行记录失败。',
    uploadError: '上传图片失败。',
  },
  cht: {
    titleLabel: '地點名稱或標題',
    dateLabel: '遊覽日期',
    contentIdLabel: '景點ID',
    optional: '(選填)',
    memoLabel: '旅行筆記與回憶',
    imageLabel: '照片',
    uploading: '正在上傳圖片...',
    cancel: '取消',
    saving: '正在保存...',
    save: '儲存記錄',
    update: '更新記錄',
    titleError: '請輸入地點名稱或標題。',
    saveError: '儲存旅行記錄失敗。',
    uploadError: '上傳圖片失敗。',
  },
};

export function RecordForm({ initial, language, onSaved, onCancel }: RecordFormProps) {
  const copy = FORM_COPY[(language as AppLanguage) || 'kor'] || FORM_COPY.kor;
  const [title, setTitle] = useState(initial?.title || '');
  const [contentId, setContentId] = useState(initial?.contentId || '');
  const [visitedAt, setVisitedAt] = useState(initial?.visitedAt || new Date().toISOString().slice(0, 10));
  const [memo, setMemo] = useState(initial?.memo || '');
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleImage(file?: File) {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      setImageUrl(await uploadRecordImage(file));
    } catch (uploadErr) {
      setError(uploadErr instanceof Error ? uploadErr.message : copy.uploadError);
    } finally {
      setUploading(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      setError(copy.titleError);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const input = { title: title.trim(), contentId: contentId.trim(), visitedAt, memo: memo.trim(), imageUrl, language };
      onSaved(initial ? await updateRecord(initial.id, input) : await createRecord(input));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : copy.saveError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="label">{copy.titleLabel}</span>
          <input className="field" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} required />
        </label>
        <label>
          <span className="label">{copy.dateLabel}</span>
          <input className="field" type="date" value={visitedAt} onChange={(event) => setVisitedAt(event.target.value)} required />
        </label>
        <label>
          <span className="label">
            {copy.contentIdLabel} <em>{copy.optional}</em>
          </span>
          <input className="field" value={contentId} onChange={(event) => setContentId(event.target.value)} placeholder="126508" />
        </label>
        <label className="sm:col-span-2">
          <span className="label">{copy.memoLabel}</span>
          <textarea className="field min-h-32 resize-y" value={memo} onChange={(event) => setMemo(event.target.value)} maxLength={2000} />
        </label>
        <label className="sm:col-span-2">
          <span className="label">{copy.imageLabel}</span>
          <input
            className="block w-full text-sm text-slate-500"
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            onChange={(event) => void handleImage(event.target.files?.[0])}
          />
          {uploading && <span className="mt-2 block text-xs text-suwon">{copy.uploading}</span>}
          {imageUrl && <img className="mt-3 h-28 w-full rounded-2xl object-cover" src={imageUrl} alt="Upload preview" />}
        </label>
      </div>
      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-xl px-4 py-3 text-sm font-bold text-slate-500">
          {copy.cancel}
        </button>
        <button type="submit" disabled={saving || uploading} className="rounded-xl bg-suwon px-5 py-3 text-sm font-bold text-white transition hover:bg-suwon-dark disabled:opacity-50">
          {saving ? copy.saving : initial ? copy.update : copy.save}
        </button>
      </div>
    </form>
  );
}
