import { useLanguage } from '../../../i18n';

export function ChatLoadingMessage() {
  const { t } = useLanguage();
  return <div className="max-w-[88%] rounded-3xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">{t('chatbot_loading')}</div>;
}
