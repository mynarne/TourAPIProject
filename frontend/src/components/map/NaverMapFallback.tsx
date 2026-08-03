type NaverMapFallbackProps = {
  message: string;
  tone?: 'neutral' | 'error';
};

export function NaverMapFallback({ message, tone = 'neutral' }: NaverMapFallbackProps) {
  return (
    <div className={`flex h-full min-h-64 items-center justify-center rounded-2xl px-6 text-center ${tone === 'error' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
      <div>
        <span className="material-symbols-outlined text-3xl">{tone === 'error' ? 'map_off' : 'location_off'}</span>
        <p className="mt-2 text-sm font-semibold">{message}</p>
      </div>
    </div>
  );
}
