import type { TrafficGuide } from '../../../api/trafficApi';

const GUIDE_ICONS: Record<string, string> = {
  arrival: '🚆',
  cards: '💳',
  locations: '📍',
  tips: '💡',
  card_details: '🎫',
  traveler_guides: '🛡️',
};

export function TransportInfo({ guides }: { guides: Record<string, TrafficGuide> }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {Object.entries(guides).map(([key, guide]) => {
        const icon = GUIDE_ICONS[key] || '📋';
        return (
          <section key={key} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-black text-slate-900">
              <span className="text-2xl">{icon}</span>
              <span>{guide.title}</span>
            </h2>
            <div className="mt-5 grid gap-3">
              {guide.items.map((item, index) => (
                <details
                  key={item.title}
                  className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:bg-slate-50"
                  open={key === 'arrival' && index === 0}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between font-bold text-slate-900 select-none">
                    <span className="text-sm">{item.title}</span>
                    <span className="text-xs text-slate-400 transition-transform duration-200 group-open:rotate-180">
                      ▼
                    </span>
                  </summary>
                  <p className="mt-3 border-t border-slate-200/80 pt-3 text-xs leading-relaxed text-slate-600 whitespace-pre-line">
                    {item.description}
                  </p>
                </details>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
