import type { ChatMessage as ChatMessageType } from '../types';
import { ChatMessage } from './ChatMessage';

export function ChatMessageList({ messages }: { messages: ChatMessageType[] }) {
  return <div className="flex flex-col gap-4">{messages.map((message) => <ChatMessage key={message.id} message={message} />)}</div>;
}
