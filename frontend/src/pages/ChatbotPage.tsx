import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import type { ChatbotLanguage } from '../api/chatbotApi';
import { ChatEmptyState } from '../features/chatbot/components/ChatEmptyState';
import { ChatInput } from '../features/chatbot/components/ChatInput';
import { ChatLoadingMessage } from '../features/chatbot/components/ChatLoadingMessage';
import { ChatMessageList } from '../features/chatbot/components/ChatMessageList';
import { useChatbot } from '../features/chatbot/hooks/useChatbot';

const languages = new Set<ChatbotLanguage>(['kor', 'eng', 'jpn', 'chs', 'cht']);

export function ChatbotPage() {
  const [searchParams] = useSearchParams();
  const rawLanguage = searchParams.get('language') || searchParams.get('lang') || 'kor';
  const language = (languages.has(rawLanguage as ChatbotLanguage) ? rawLanguage : 'kor') as ChatbotLanguage;
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const { messages, state, error, send, retry } = useChatbot(language, location);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(({ coords }) => setLocation({ latitude: coords.latitude, longitude: coords.longitude }), () => undefined, { timeout: 10000, maximumAge: 300000 });
  }, []);

  return (
    <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-4xl flex-col px-5 py-8">
      <header className="mb-6 flex items-center justify-between"><div><p className="font-semibold text-suwon">LinkSuwon AI Guide</p><h1 className="mt-1 text-3xl font-black text-slate-900">수원 여행 도우미</h1></div><Link className="text-sm font-bold text-suwon" to="/">홈으로</Link></header>
      <div className="flex-1 rounded-3xl bg-slate-50 p-4 sm:p-6"><ChatMessageList messages={messages} />{messages.length === 1 && state === 'idle' && <ChatEmptyState onSelect={(question) => void send(question)} />}{state === 'loading' && <div className="mt-4"><ChatLoadingMessage /></div>}{state === 'error' && <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">답변을 불러오지 못했습니다. <button className="font-bold underline" type="button" onClick={() => void retry()}>다시 시도</button></div>}</div>
      <div className="mt-4"><ChatInput disabled={state === 'loading'} onSend={(message) => void send(message)} /></div>
    </section>
  );
}
