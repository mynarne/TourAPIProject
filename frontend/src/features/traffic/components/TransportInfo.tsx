import type { TrafficGuide } from '../../../api/trafficApi';

export function TransportInfo({ guides }: { guides: Record<string, TrafficGuide> }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {Object.entries(guides).map(([key, guide]) => (
        <section key={key} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-900">{guide.title}</h2>
          <div className="mt-4 grid gap-3">
            {guide.items.map((item) => (
              <details key={item.title} className="group rounded-2xl border border-slate-200 bg-slate-50 p-4" open={key === 'cards'}>
                <summary className="cursor-pointer list-none font-bold text-slate-900">{item.title}<span className="float-right text-slate-400 group-open:rotate-180">⌄</span></summary>
                <p className="mt-3 border-t border-slate-200 pt-3 text-sm leading-6 text-slate-600">{item.description}</p>
              </details>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
