import { useEffect, useState } from 'react';

import { getHealth } from '../api/healthApi';

export function HomePage() {
  const [apiStatus, setApiStatus] = useState('연결 확인 중');

  useEffect(() => {
    getHealth()
      .then((response) => setApiStatus(response.data.status === 'ok' ? 'API 연결 완료' : 'API 확인 필요'))
      .catch(() => setApiStatus('API 연결 대기 중'));
  }, []);

  return (
    <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-6xl items-center px-5 py-16">
      <div className="max-w-2xl">
        <p className="mb-4 font-semibold text-suwon">Frog Lab · LinkSuwon</p>
        <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
          수원의 모든 연결을
          <br />
          하나의 여행 경험으로
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-600">
          React 프론트엔드와 Flask REST API를 연결하는 1단계 화면입니다.
        </p>
        <div className="mt-8 inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-suwon">
          {apiStatus}
        </div>
        <a className="mt-6 inline-block rounded-xl bg-suwon px-5 py-3 font-bold text-white" href="/explore">
          수원 명소 둘러보기
        </a>
        <a className="ml-3 inline-block rounded-xl border border-suwon px-5 py-3 font-bold text-suwon" href="/records">
          여행 기록 보기
        </a>
      </div>
    </section>
  );
}
