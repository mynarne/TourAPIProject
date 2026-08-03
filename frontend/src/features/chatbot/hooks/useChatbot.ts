import { useCallback, useState } from 'react';

import { sendChatbotMessage, type ChatbotLanguage } from '../../../api/chatbotApi';
import type { ChatMessage } from '../types';

const GREETINGS: Record<ChatbotLanguage, string> = {
  kor: '안녕하세요! 수원 여행을 도와드릴 AI 비서입니다. 관광지, 교통, 맛집, 여행 코스를 물어보세요.',
  eng: 'Hello! I am your Suwon travel guide. Ask me about attractions, transit, food, or itineraries.',
  jpn: 'こんにちは！水原旅行をお手伝いするAIガイドです。観光地、交通、グルメ、コースについて聞いてください。',
  chs: '您好！我是您的水原旅行AI助手。可以咨询景点、交通、美食和旅行路线。',
  cht: '您好！我是您的水原旅行AI助手。可以諮詢景點、交通、美食和旅行路線。',
};

export function useChatbot(language: ChatbotLanguage, location: { latitude: number; longitude: number } | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: 'greeting', role: 'assistant', content: GREETINGS[language] }]);
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [lastQuestion, setLastQuestion] = useState('');

  const send = useCallback(async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || state === 'loading') return;
    setLastQuestion(trimmed);
    setMessages((current) => [...current, { id: `user-${Date.now()}`, role: 'user', content: trimmed }]);
    setState('loading');
    setError('');
    try {
      const response = await sendChatbotMessage(trimmed, language, location);
      setMessages((current) => [...current, { id: `assistant-${Date.now()}`, role: 'assistant', content: response.data.message, course: response.data.course }]);
      setState('success');
    } catch (requestError) {
      setState('error');
      setError(requestError instanceof Error ? requestError.message : '챗봇 응답을 생성하지 못했습니다.');
    }
  }, [language, location, state]);

  const retry = useCallback(() => { if (lastQuestion) void send(lastQuestion); }, [lastQuestion, send]);

  return { messages, state, error, lastQuestion, send, retry };
}
