import { useState } from 'react';
import { useLanguage } from '../../../i18n';
import type { AppLanguage } from '../../../i18n';

const INPUT_COPY: Record<AppLanguage, { placeholder: string; send: string }> = {
  kor: { placeholder: '수원 여행에 대해 물어보세요...', send: '전송' },
  eng: { placeholder: 'Ask anything about traveling in Suwon...', send: 'Send' },
  jpn: { placeholder: '水原旅行について何でも聞いてください...', send: '送信' },
  chs: { placeholder: '向AI咨询水原旅行相关问题...', send: '发送' },
  cht: { placeholder: '向AI諮詢水原旅行相關問題...', send: '發送' },
};

export function ChatInput({ disabled, onSend }: { disabled: boolean; onSend: (message: string) => void }) {
  const { language } = useLanguage();
  const copy = INPUT_COPY[language] || INPUT_COPY.kor;
  const [value, setValue] = useState('');

  const submit = () => {
    if (value.trim() && !disabled) {
      onSend(value);
      setValue('');
    }
  };

  return (
    <div className="flex items-end gap-2 rounded-3xl border border-slate-200 bg-white p-2 shadow-lg">
      <textarea
        className="min-h-12 flex-1 resize-none rounded-2xl border-0 px-3 py-3 text-sm outline-none focus:ring-0"
        value={value}
        disabled={disabled}
        placeholder={copy.placeholder}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
        }}
      />
      <button
        className="h-12 rounded-2xl bg-suwon px-4 font-bold text-white transition hover:bg-suwon-dark disabled:cursor-not-allowed disabled:opacity-50"
        type="button"
        disabled={disabled || !value.trim()}
        onClick={submit}
      >
        {copy.send}
      </button>
    </div>
  );
}
