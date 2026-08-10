import { useLanguage } from '../../../i18n';
import type { AppLanguage } from '../../../i18n';

const EMPTY_COPY: Record<AppLanguage, { title: string; desc: string; button: string }> = {
  kor: {
    title: '아직 남겨진 여행 기록이 없어요',
    desc: '수원에서 만난 장소와 순간을 사진 한 장, 짧은 문장으로 아카이브해 보세요.',
    button: '첫 기록 남기기',
  },
  eng: {
    title: 'No travel logs yet',
    desc: 'Archive your Suwon memories with a single photo and a short note.',
    button: 'Create First Log',
  },
  jpn: {
    title: 'まだ旅行記録がありません',
    desc: '水原で訪れた場所と瞬間を写真や短い文章でアーカイブしてみましょう。',
    button: '最初の記録を追加',
  },
  chs: {
    title: '还没有保存的旅行记录',
    desc: '用一张照片和简短文字，记录下您在水原的美好瞬间。',
    button: '添加第一条记录',
  },
  cht: {
    title: '還沒有儲存的旅行記錄',
    desc: '用一張照片和簡短文字，記錄下您在水原的美好瞬間。',
    button: '添加第一條記錄',
  },
};

export function RecordEmptyState({ onCreate }: { onCreate: () => void }) {
  const { language } = useLanguage();
  const copy = EMPTY_COPY[language] || EMPTY_COPY.kor;

  return (
    <div className="rounded-[2rem] border border-dashed border-blue-200 bg-blue-50/60 px-6 py-16 text-center">
      <div className="text-5xl">📷</div>
      <h2 className="mt-5 text-2xl font-black text-slate-900">{copy.title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">{copy.desc}</p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-6 rounded-xl bg-suwon px-5 py-3 text-sm font-bold text-white transition hover:bg-suwon-dark"
      >
        {copy.button}
      </button>
    </div>
  );
}
