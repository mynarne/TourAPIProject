import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 text-center">
      <p className="eyebrow">404 · Not Found</p>
      <h1 className="mt-3 text-3xl font-black text-slate-950">페이지를 찾을 수 없습니다.</h1>
      <p className="mt-3 text-slate-500">주소를 확인하거나 수원 여행의 첫 화면으로 돌아가 주세요.</p>
      <Link className="mt-7 inline-flex rounded-xl bg-suwon px-5 py-3 font-bold text-white" to="/">
        홈으로 돌아가기
      </Link>
    </section>
  );
}
