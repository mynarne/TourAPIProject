import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import type { ChatbotLanguage } from '../api/chatbotApi';
import { ChatEmptyState } from '../features/chatbot/components/ChatEmptyState';
import { ChatInput } from '../features/chatbot/components/ChatInput';
import { ChatLoadingMessage } from '../features/chatbot/components/ChatLoadingMessage';
import { ChatMessageList } from '../features/chatbot/components/ChatMessageList';
import { useChatbot } from '../features/chatbot/hooks/useChatbot';
import { useLanguage } from '../i18n';

const languages = new Set<ChatbotLanguage>(['kor', 'eng', 'jpn', 'chs', 'cht']);

export function ChatbotPage() {
  const { language, t } = useLanguage();
  const currentLang = (languages.has(language as ChatbotLanguage) ? language : 'kor') as ChatbotLanguage;
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const { messages, state, error, send, retry } = useChatbot(currentLang, location);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setLocation({ latitude: coords.latitude, longitude: coords.longitude }),
      () => undefined,
      { timeout: 10000, maximumAge: 300000 },
    );
  }, []);

  return (
    <section className="mx-auto flex min-h-[calc(100vh-64px)] max-w-4xl flex-col px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">LinkSuwon AI Guide</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{t('menu_chatbot')}</h1>
          <p className="mt-2 text-sm text-slate-500">{t('hero_subtitle')}</p>
        </div>
        <Link className="shrink-0 rounded-lg px-3 py-2 text-sm font-bold text-suwon hover:bg-suwon-soft" to={`/?lang=${currentLang}`}>
          {t('btn_back')}
        </Link>
      </header>

      <div className="flex-1 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <ChatMessageList messages={messages} />
        {messages.length === 1 && state === 'idle' && <ChatEmptyState onSelect={(question) => void send(question)} />}
        {state === 'loading' && (
          <div className="mt-4">
            <ChatLoadingMessage />
          </div>
        )}
        {state === 'error' && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {t('msg_api_fail')} ({error}){' '}
            <button className="font-bold underline" type="button" onClick={() => void retry()}>
              {t('btn_back')}
            </button>
          </div>
        )}
      </div>

      <div className="mt-4">
        <ChatInput disabled={state === 'loading'} onSend={(message) => void send(message)} />
      </div>
    </section>
  );
}
