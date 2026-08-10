import type { TourSpotDetail } from '../../../api/tourismApi';
import { useLanguage } from '../../../i18n';
import type { AppLanguage } from '../../../i18n';

const SECTION_COPY: Record<
  AppLanguage,
  {
    title: string;
    noOverview: string;
    telephone: string;
    openHours: string;
    restDate: string;
    parking: string;
    usageFee: string;
    duration: string;
  }
> = {
  kor: {
    title: '상세 안내',
    noOverview: '등록된 소개 정보가 없습니다.',
    telephone: '전화번호',
    openHours: '이용시간',
    restDate: '휴무일',
    parking: '주차 시설',
    usageFee: '이용요금',
    duration: '소요시간',
  },
  eng: {
    title: 'Detailed Information',
    noOverview: 'No overview available.',
    telephone: 'Telephone',
    openHours: 'Operating Hours',
    restDate: 'Closed Days',
    parking: 'Parking',
    usageFee: 'Admission Fee',
    duration: 'Estimated Duration',
  },
  jpn: {
    title: '詳細案内',
    noOverview: '登録された紹介情報はありません。',
    telephone: '電話番号',
    openHours: '利用時間',
    restDate: '休業日',
    parking: '駐車場',
    usageFee: '利用料金',
    duration: '所要時間',
  },
  chs: {
    title: '详细信息',
    noOverview: '暂无介绍信息。',
    telephone: '联系电话',
    openHours: '开放时间',
    restDate: '休息日',
    parking: '停车场',
    usageFee: '门票费用',
    duration: '建议游览时间',
  },
  cht: {
    title: '詳細資訊',
    noOverview: '暫無介紹資訊。',
    telephone: '聯絡電話',
    openHours: '開放時間',
    restDate: '休息日',
    parking: '停車場',
    usageFee: '門票費用',
    duration: '建議遊覽時間',
  },
};

export function SpotInfoSection({ spot }: { spot: TourSpotDetail }) {
  const { language } = useLanguage();
  const copy = SECTION_COPY[language] || SECTION_COPY.kor;

  const rows = [
    [copy.telephone, spot.telephone],
    [copy.openHours, spot.openHours],
    [copy.restDate, spot.restDate],
    [copy.parking, spot.parking],
    [copy.usageFee, spot.usageFee],
    [copy.duration, spot.duration],
  ].filter(([, value]) => value);

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold">{copy.title}</h2>
      <p className="mt-3 whitespace-pre-line leading-8 text-slate-600">
        {spot.overview || copy.noOverview}
      </p>
      {rows.length > 0 && (
        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div className="rounded-2xl bg-slate-50 p-4" key={label}>
              <dt className="text-sm font-bold text-suwon">{label}</dt>
              <dd className="mt-1 text-sm text-slate-600">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
