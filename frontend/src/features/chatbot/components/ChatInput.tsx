import { useState } from 'react';

export function ChatInput({ disabled, onSend }: { disabled: boolean; onSend: (message: string) => void }) {
  const [value, setValue] = useState('');
  const submit = () => { if (value.trim() && !disabled) { onSend(value); setValue(''); } };
  return (
    <div className="flex items-end gap-2 rounded-3xl border border-slate-200 bg-white p-2 shadow-lg">
      <textarea className="min-h-12 flex-1 resize-none rounded-2xl border-0 px-3 py-3 text-sm outline-none focus:ring-0" value={value} disabled={disabled} placeholder="수원 여행에 대해 물어보세요" onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submit(); } }} />
      <button className="h-12 rounded-2xl bg-suwon px-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50" type="button" disabled={disabled || !value.trim()} onClick={submit}>전송</button>
    </div>
  );
}
