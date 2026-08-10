import { useLanguage } from '../../../i18n';
import type { AppLanguage } from '../../../i18n';

const QUICK_QUESTIONS: Record<AppLanguage, { title: string; questions: string[] }> = {
  kor: {
    title: '무엇을 도와드릴까요?',
    questions: ['수원화성 근처 저녁 코스 추천해줘', '비 오는 날 갈 만한 곳 알려줘', '부모님과 가기 좋은 장소 추천해줘', '수원역에서 하루 코스 짜줘'],
  },
  eng: {
    title: 'How can I help you today?',
    questions: ['Evening tour near Hwaseong Fortress', 'Places to visit on a rainy day', 'Family-friendly attractions in Suwon', 'One-day itinerary starting from Suwon Station'],
  },
  jpn: {
    title: '何かお手伝いしましょうか？',
    questions: ['水原華城周辺のディナーコースを教えて', '雨の日に訪れるべきおすすめスポット', '家族連れにおすすめの水原観光地', '水原駅発の1日おすすめコース'],
  },
  chs: {
    title: '请问有什么可以帮您？',
    questions: ['推荐水原华城附近的晚餐路线', '雨天适合游览的地方', '适合家庭同游的水原景点', '从水原站出发的一日游路线'],
  },
  cht: {
    title: '請問有什麼可以幫您？',
    questions: ['推薦水原華城附近的晚餐路線', '下雨天適合遊覽的地方', '適合家庭同遊的水原景點', '從水原站出發的一日遊路線'],
  },
};

export function ChatEmptyState({ onSelect }: { onSelect: (question: string) => void }) {
  const { language } = useLanguage();
  const copy = QUICK_QUESTIONS[language] || QUICK_QUESTIONS.kor;

  return (
    <div className="mb-6 rounded-3xl border border-blue-100 bg-blue-50 p-5">
      <p className="font-bold text-slate-900">{copy.title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {copy.questions.map((question) => (
          <button
            key={question}
            className="rounded-full border border-blue-100 bg-white px-3 py-2 text-xs font-bold text-suwon transition hover:bg-suwon hover:text-white"
            type="button"
            onClick={() => onSelect(question)}
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}
