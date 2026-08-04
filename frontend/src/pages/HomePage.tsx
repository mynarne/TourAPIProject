import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div className="overflow-hidden">
      <section className="relative mx-auto max-w-6xl px-4 pb-14 pt-12 sm:px-6 sm:pb-20 sm:pt-20">
        <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="relative grid items-center gap-12 lg:grid-cols-[1.08fr_.92fr]">
          <div className="max-w-2xl">
            <p className="eyebrow">Suwon Travel Guide</p>
            <h1 className="mt-5 text-4xl font-black leading-[1.12] tracking-tight text-slate-950 sm:text-6xl">
              수원을 더 깊게,
              <br />
              <span className="text-suwon">여행을 더 가볍게.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              수원 명소를 발견하고, 이동 방법을 확인하고, AI 여행 비서와 코스를 계획해 보세요. 여행의 순간은 나만의 기록으로 남길 수 있습니다.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="inline-flex items-center justify-center rounded-xl bg-suwon px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-suwon-dark" to="/explore">수원 명소 둘러보기 <span className="ml-2">→</span></Link>
              <Link className="inline-flex items-center justify-center rounded-xl border border-suwon bg-white px-5 py-3.5 text-sm font-bold text-suwon transition hover:bg-suwon-soft" to="/chatbot">AI에게 여행 물어보기</Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-500"><span>✦ 5개 언어</span><span>✦ 지도 기반 탐색</span><span>✦ 여행 기록 아카이브</span></div>
          </div>
          <div className="relative mx-auto w-full max-w-md lg:mr-0">
            <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-suwon/20 via-blue-100/40 to-transparent blur-xl" />
            <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-5 shadow-2xl shadow-blue-200/70 sm:p-7">
              <div className="flex items-center justify-between text-xs font-bold text-blue-200"><span>LINK SUWON</span><span>01 / EXPLORE</span></div>
              <div className="mt-16 sm:mt-24"><p className="text-sm font-semibold text-blue-200">오늘의 수원</p><p className="mt-2 text-3xl font-black leading-tight text-white sm:text-4xl">성곽의 시간과<br />도시의 하루를 만나요.</p></div>
              <div className="mt-12 grid grid-cols-2 gap-3 sm:mt-16"><div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-slate-300">추천 시작점</p><p className="mt-1 font-bold text-white">수원화성</p></div><div className="rounded-2xl bg-suwon p-4"><p className="text-xs text-blue-100">여행 도우미</p><p className="mt-1 font-bold text-white">AI Guide ↗</p></div></div>
            </div>
          </div>
        </div>
      </section>
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 sm:grid-cols-3 sm:px-6 sm:py-10"><HomeFeature icon="01" title="발견하기" description="수원의 명소와 숨은 장소를 한눈에 탐색해요." to="/explore" /><HomeFeature icon="02" title="이동하기" description="현재 위치에서 목적지까지 편하게 길을 찾아요." to="/traffic" /><HomeFeature icon="03" title="남겨두기" description="사진과 문장으로 나만의 여행 장면을 보관해요." to="/records" /></div>
      </section>
    </div>
  );
}

function HomeFeature({ icon, title, description, to }: { icon: string; title: string; description: string; to: string }) {
  return <Link to={to} className="group rounded-2xl p-3 no-underline transition hover:bg-slate-50"><div className="flex items-start gap-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-suwon-soft text-xs font-black text-suwon transition group-hover:bg-suwon group-hover:text-white">{icon}</span><span><strong className="block text-base font-black text-slate-900">{title}<span className="ml-2 text-suwon transition group-hover:ml-3">→</span></strong><span className="mt-1 block text-sm leading-6 text-slate-500">{description}</span></span></div></Link>;
}
