import type { ChatbotCourse, ChatbotLanguage } from '../../api/chatbotApi';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'error';
  content: string;
  course?: ChatbotCourse;
};

export type ChatbotState = 'idle' | 'loading' | 'success' | 'error';
export type { ChatbotLanguage };
