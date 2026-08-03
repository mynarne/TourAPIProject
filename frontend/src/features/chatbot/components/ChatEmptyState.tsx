const QUICK_QUESTIONS = ['수원화성 근처 저녁 코스 추천해줘', '비 오는 날 갈 만한 곳 알려줘', '부모님과 가기 좋은 장소 추천해줘', '수원역에서 하루 코스 짜줘'];

export function ChatEmptyState({ onSelect }: { onSelect: (question: string) => void }) {
  return <div className="mb-6 rounded-3xl border border-blue-100 bg-blue-50 p-5"><p className="font-bold text-slate-900">무엇을 도와드릴까요?</p><div className="mt-3 flex flex-wrap gap-2">{QUICK_QUESTIONS.map((question) => <button key={question} className="rounded-full border border-blue-100 bg-white px-3 py-2 text-xs font-bold text-suwon" type="button" onClick={() => onSelect(question)}>{question}</button>)}</div></div>;
}
