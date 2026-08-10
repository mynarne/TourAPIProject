import { useEffect, useState } from 'react';
import { fetchSuwonWeather, type WeatherData } from '../../../api/widgetApi';
import type { AppLanguage } from '../../../i18n';

const WEATHER_TIPS: Record<
  'sunny' | 'cloudy' | 'rainy' | 'snowy',
  Record<AppLanguage, string>
> = {
  sunny: {
    kor: '🌞 햇살이 좋은 날입니다. 서장대에 올라 수원 시내 전경을 감상해보세요!',
    eng: '🌞 Sunny day! Ascend Seojangdae for a beautiful panoramic view of Suwon.',
    jpn: '🌞 晴れた日です。西将台に登って水原市内の全景を鑑賞してみてください！',
    chs: '🌞 阳光明媚！登上西将台，俯瞰水原市区的美丽全景。',
    cht: '🌞 陽光明媚！登上西將台，俯瞰水原市區的美麗全景。',
  },
  cloudy: {
    kor: '☁️ 선선한 바람이 부는 흐린 날입니다. 수원화성 성곽길을 조용히 걸어보기 좋습니다.',
    eng: "☁️ Cool and cloudy. It's a great, serene day to walk along the fortress walls.",
    jpn: '☁️ 涼しい風が吹く曇りの日です。水原華城の城郭通りを静かに歩くのに適しています。',
    chs: '☁️ 凉爽多云。这是一个沿着华城城墙静静漫步的好日子。',
    cht: '☁️ 涼爽多雲。這是一個沿著華城城牆靜靜漫步的好日子。',
  },
  rainy: {
    kor: '☔ 비가 내리네요. 아늑한 행궁동 카페거리나 수원화성박물관 실내 코스를 추천합니다.',
    eng: '☔ Rainy day. We recommend checking out cozy Haenggung-dong cafes or Suwon Hwaseong Museum.',
    jpn: '☔ 雨が降っていますね。居心地の良い行宮洞のカフェや水原華城博物館の室内コースをおすすめします。',
    chs: '☔ 下雨了。建议去温馨的行宫洞咖啡街或水原华城博物馆进行室内游览。',
    cht: '☔ 下雨了。建議去溫馨的行宮洞咖啡街或水原華城博物館進行室內遊覽。',
  },
  snowy: {
    kor: '❄️ 눈이 내립니다! 방화수류정 설경은 평생 잊지 못할 한 폭의 수묵화 같습니다.',
    eng: '❄️ Snowy day! The snowy landscape of Banghwasuryujeong looks like a stunning ink painting.',
    jpn: '❄️ 雪が降っています！訪花随柳亭の雪景は、一生忘れられない一幅の水墨画のようです。',
    chs: '❄️ 下雪了！访花随柳亭的雪景就像一幅终生难忘的水墨画。',
    cht: '❄️ 下雪了！訪花隨柳亭的雪景就像一幅終生難忘的水墨畫。',
  },
};

const WEATHER_LABELS: Record<AppLanguage, { title: string; tipLabel: string; unavailable: string }> = {
  kor: { title: '수원 실시간 날씨', tipLabel: '오늘의 여행 팁', unavailable: '현재 날씨 정보를 불러올 수 없습니다.' },
  eng: { title: 'Suwon Live Weather', tipLabel: 'Tour Tip', unavailable: 'Weather information is currently unavailable.' },
  jpn: { title: '水原のリアルタイム天気', tipLabel: '観光のヒント', unavailable: '現在、天気情報を取得できません。' },
  chs: { title: '水原实时天气', tipLabel: '今日游览贴士', unavailable: '暂无法获取当前天气信息。' },
  cht: { title: '水原即時天氣', tipLabel: '今日遊覽貼士', unavailable: '暫無法取得目前天氣資訊。' },
};

const WEATHER_CONDITION_LABELS: Record<NonNullable<WeatherData['condition']>, Record<AppLanguage, string>> = {
  sunny: { kor: '맑음', eng: 'Sunny', jpn: '晴れ', chs: '晴朗', cht: '晴朗' },
  cloudy: { kor: '흐림', eng: 'Cloudy', jpn: '曇り', chs: '多云', cht: '多雲' },
  rainy: { kor: '비', eng: 'Rainy', jpn: '雨', chs: '下雨', cht: '下雨' },
  snowy: { kor: '눈', eng: 'Snowy', jpn: '雪', chs: '下雪', cht: '下雪' },
};

export function WeatherWidget({ language }: { language: AppLanguage }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    void fetchSuwonWeather().then(setWeather);
  }, []);

  const labels = WEATHER_LABELS[language] || WEATHER_LABELS.kor;

  if (!weather) {
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

  if (weather.status === 'unavailable' || !weather.temp) {
    return (
      <div className="flex flex-col justify-center rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-400">
            🌦️
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

  const condition = weather.condition || 'cloudy';
  const tip = WEATHER_TIPS[condition]?.[language] || WEATHER_TIPS[condition]?.kor || WEATHER_TIPS.sunny.kor;
  const conditionLabel = WEATHER_CONDITION_LABELS[condition]?.[language] || WEATHER_CONDITION_LABELS[condition]?.kor;
  const staleLabel = {
    kor: '마지막 확인 데이터',
    eng: 'Last available data',
    jpn: '最後に確認したデータ',
    chs: '最后获取的数据',
    cht: '最後取得的資料',
  }[language];

  const iconInfo = {
    sunny: { icon: '☀️', bg: 'bg-amber-100 text-amber-700' },
    cloudy: { icon: '☁️', bg: 'bg-slate-100 text-slate-700' },
    rainy: { icon: '🌧️', bg: 'bg-blue-100 text-blue-700' },
    snowy: { icon: '❄️', bg: 'bg-sky-100 text-sky-700' },
  }[condition] || { icon: '☀️', bg: 'bg-amber-100 text-amber-700' };

  return (
    <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${iconInfo.bg}`}>
            {iconInfo.icon}
          </div>
          <div>
            <span className="text-[10px] font-black tracking-wider uppercase text-slate-400">
              {labels.title}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{weather.temp}°C</span>
              <span className="text-xs font-semibold text-slate-500">{conditionLabel}</span>
            </div>
            {weather.status === 'stale' && <span className="text-[10px] font-bold text-amber-600">{staleLabel}</span>}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-slate-50 p-3.5 border border-slate-100">
        <span className="block text-[10px] font-black uppercase text-suwon">{labels.tipLabel}</span>
        <p className="mt-1 text-xs font-medium leading-relaxed text-slate-700">{tip}</p>
      </div>
    </div>
  );
}
