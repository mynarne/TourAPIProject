import { apiFetch } from './client';

export type ChatbotLanguage = 'kor' | 'eng' | 'jpn' | 'chs' | 'cht';

export type ChatbotCourse = { title: string; places: string[] } | null;

export type ChatbotReply = {
  message: string;
  provider: string;
  course: ChatbotCourse;
};

type ChatbotResponse = { success: true; data: ChatbotReply; message: null };

export function sendChatbotMessage(message: string, language: ChatbotLanguage, location?: { latitude: number; longitude: number } | null) {
  return apiFetch<ChatbotResponse>('/chatbot/messages', {
    method: 'POST',
    body: JSON.stringify({ message, language, location: location || undefined }),
  });
}
