import type { ChatMessage as ChatMessageType } from '../types';
import { ChatMarkdown } from './ChatMarkdown';

export function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[88%] rounded-3xl px-4 py-3 text-sm leading-6 shadow-sm ${isUser ? 'rounded-tr-md bg-suwon text-white' : 'rounded-tl-md border border-slate-200 bg-white text-slate-700'}`}>
        <ChatMarkdown content={message.content} />
        {message.course && <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50 p-3 text-xs text-slate-700"><strong>{message.course.title}</strong><ol className="mt-2 list-decimal pl-4">{message.course.places.map((place) => <li key={place}>{place}</li>)}</ol></div>}
      </div>
    </div>
  );
}
