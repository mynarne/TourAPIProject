import { useEffect, useState } from 'react';
import { fetchSuwonExchange, type ExchangeData } from '../../../api/widgetApi';
import type { AppLanguage } from '../../../i18n';

const EXCHANGE_LABELS: Record<AppLanguage, { title: string; subtitle: string; unavailable: string }> = {
  kor: { title: '오늘의 주요 환율', subtitle: '네이버 금융 매매기준율', unavailable: '환율 정보를 불러올 수 없습니다.' },
  eng: { title: 'USD Exchange Rate', subtitle: 'Standard Market Rate (KRW)', unavailable: 'Exchange rate is currently unavailable.' },
  jpn: { title: '日本円の為替レート', subtitle: '基準為替レート (KRW)', unavailable: '為替レート情報を取得できません。' },
  chs: { title: '人民币实时汇率', subtitle: '基准汇率 (KRW)', unavailable: '暂无法获取汇率信息。' },
  cht: { title: '新台幣即時匯率', subtitle: '基準匯率 (KRW)', unavailable: '暫無法取得匯率資訊。' },
};

export function ExchangeWidget({ language }: { language: AppLanguage }) {
  const [exchange, setExchange] = useState<ExchangeData | null>(null);

  useEffect(() => {
    void fetchSuwonExchange().then(setExchange);
  }, []);

  const labels = EXCHANGE_LABELS[language] || EXCHANGE_LABELS.kor;
  const formatter = new Intl.NumberFormat('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (!exchange) {
    return (
      <div className="flex min-h-40 animate-pulse items-center rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="h-12 w-12 rounded-2xl bg-slate-100" />
        <div className="ml-3 space-y-2">
          <div className="h-3 w-28 rounded bg-slate-100" />
          <div className="h-5 w-36 rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  if (exchange.status === 'unavailable') {
    return (
      <div className="flex flex-col justify-center rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-400">
            💱
          </div>
          <div>
            <span className="text-[10px] font-black tracking-wider uppercase text-slate-400">
              {labels.title}
            </span>
            <p className="text-xs font-semibold text-slate-500 mt-1">{labels.unavailable}</p>
          </div>
        </div>
      </div>
    );
  }

  const usdVal = parseFloat(exchange.USD || '0');
  const jpyVal = parseFloat(exchange.JPY || '0');
  const cnyVal = parseFloat(exchange.CNY || '0');
  const twdVal = parseFloat(exchange.TWD || '0');
  const staleLabel = {
    kor: '마지막 확인 데이터',
    eng: 'Last available data',
    jpn: '最後に確認したデータ',
    chs: '最后获取的数据',
    cht: '最後取得的資料',
  }[language];

  return (
    <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-2xl text-emerald-700">
          💱
        </div>
        <div>
          <span className="text-[10px] font-black tracking-wider uppercase text-slate-400">
            {labels.title}
          </span>
          <p className="text-xs text-slate-500">{labels.subtitle}</p>
        </div>
      </div>
      {exchange.status === 'stale' && <p className="mt-3 text-[10px] font-bold text-amber-600">{staleLabel}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-black text-suwon border border-blue-100">
            USD {formatter.format(usdVal)}
          </span>
          <span className="rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-800 border border-red-100">
            CNY {formatter.format(cnyVal)}
          </span>
          <span className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-black text-amber-800 border border-amber-100">
            100 JPY {formatter.format(jpyVal)}
          </span>
          <span className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-black text-slate-700 border border-slate-200">
            TWD {formatter.format(twdVal)}
          </span>
      </div>
    </div>
  );
}
