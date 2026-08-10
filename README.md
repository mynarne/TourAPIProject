# LinkSuwon

> 수원을 방문하는 국내외 여행자를 위한 다국어 스마트 관광 플랫폼

LinkSuwon은 수원 관광지를 탐색하고, 이동 방법을 확인하고, AI 여행 비서에게 질문하고, 여행 기록까지 남길 수 있도록 만든 지역 관광 서비스입니다.

한국관광공사 TourAPI와 수원 지역 큐레이션 데이터를 결합하고, 네이버 지도·GPS·Google Identity Services·NVIDIA Build GPT-OSS를 하나의 여행 흐름으로 연결합니다. 프론트엔드는 React + TypeScript PWA, 백엔드는 Flask REST API로 구성되어 있습니다.

## 주요 기능

### 다국어 관광 정보

다음 5개 언어를 지원합니다.

- 한국어 (`kor`)
- 영어 (`eng`)
- 일본어 (`jpn`)
- 중국어 간체 (`chs`)
- 중국어 번체 (`cht`)

관광지 목록, 상세 설명, 교통 안내, 챗봇 UI와 주요 상태 메시지에 동일한 언어 체계를 적용합니다.

### 수원 관광지 탐색

- 관광지 검색 및 카테고리 필터
- 페이지네이션과 전체 결과 수 표시
- 관광지 이미지·주소·상세 설명
- 종료된 축제의 최종 날짜 검증
- TourAPI 장애 시 로컬 큐레이션 및 최근 정상 데이터 fallback
- 관광지 목록 지도와 상세 위치 지도

TourAPI 데이터는 로컬 데이터와 병합한 뒤 중복 제거, 카테고리 필터, 현재성 검증을 거쳐 사용자에게 제공합니다. 과거 축제는 최종 응답 단계에서 다시 걸러냅니다.

### 지도와 여행자 교통 안내

Naver Maps JavaScript SDK와 브라우저 Geolocation API를 활용합니다.

- 관광지 위치와 마커 표시
- 현재 위치 기반 거리순 탐색
- 위치 권한 거부 시 수원역 기준 안내
- 네이버 대중교통 길찾기 연결
- 인천공항·서울역·수원역에서 수원으로 이동하는 방법
- WOWPASS, NAMANE, T-money, 일회용 지하철 카드 안내
- 환승·택시·교통카드 발급 및 충전 안내

실시간 버스·지하철 도착 API가 아닌, 여행자에게 필요한 정적 교통 안내와 지도·GPS 기능을 결합한 구조입니다.

### NVIDIA GPT-OSS 여행 비서

AI 챗봇은 NVIDIA Build의 OpenAI 호환 API와 `openai/gpt-oss-20b` 모델을 사용합니다. Gemini를 사용하거나 자동 fallback으로 호출하지 않습니다.

Function Calling 도구:

- `search_suwon_spots` — 수원 관광지 검색
- `get_suwon_spot_detail` — 관광지 상세 정보 조회
- `get_suwon_transport_guide` — 수원 교통 및 교통카드 안내

챗봇은 도구 결과를 우선하여 답변하며, TourAPI가 일시적으로 제한되면 NVIDIA 응답 자체를 실패시키지 않고 저장된 검증 데이터와 제한 안내를 활용하는 degraded mode로 동작합니다. 외부 관광정보를 확인할 수 없는 최신 축제·운영시간·요금은 추측하지 않습니다.

### 여행 기록 아카이브

Google 로그인 사용자는 Travel Memory Archive에 여행 기록을 저장할 수 있습니다.

- 기록 작성·조회·수정·삭제
- 방문 날짜, 장소, 메모, 태그
- 대표 이미지 업로드
- 장소 좌표 기반 지도 연결
- 사진 중심 반응형 아카이브 카드
- 서버 측 사용자 소유권 검증

업로드 파일은 확장자·MIME 타입·용량을 검증하고 서버에서 생성한 UUID 파일명으로 저장합니다.

### Google 로그인과 PWA

Google Identity Services credential은 백엔드에서 검증하고 Flask Session을 생성합니다. 인증 토큰을 LocalStorage나 SessionStorage에 저장하지 않습니다.

PWA는 앱 셸과 제한적인 관광·교통 GET 데이터만 캐시합니다. 인증, 기록, 챗봇, 업로드, 상태 변경 요청은 Service Worker 캐시에서 제외합니다.

## 기술 스택

| 영역 | 기술 |
| --- | --- |
| Frontend | React, TypeScript, Vite, React Router, Zustand |
| Styling | Tailwind CSS v4, 반응형 UI, Web App Manifest |
| Backend | Python, Flask, Flask Blueprint, REST API |
| Data | SQLite, Repository/Service 계층 |
| AI | NVIDIA Build, `openai/gpt-oss-20b`, OpenAI-compatible API, Function Calling |
| Tourism | 한국관광공사 TourAPI, 로컬 큐레이션, 검증된 enrichment 데이터 |
| Map | Naver Maps JavaScript SDK, Browser Geolocation API |
| Auth | Google Identity Services, Flask Session |
| Deployment | Oracle Cloud, Nginx, Gunicorn, systemd, GitHub Actions |

## 아키텍처

```text
Browser
  ├── React + TypeScript + PWA
  └── Google Identity Services / Naver Maps SDK
          │ same-origin /api/v1
          ▼
Nginx
  ├── React static assets
  └── /api/v1/*
          ▼
Flask REST API + Gunicorn
  ├── Tourism Service ── TourAPI + local catalog + enrichment
  ├── Traffic Service
  ├── Chatbot Service ── NVIDIA GPT-OSS-20B + tools
  ├── Auth / Session
  ├── Records Repository ── SQLite
  └── Upload validation
```

기존 Flask + Jinja 서비스에서 출발하여 기능 단위의 수직 마이그레이션 방식으로 React 프론트엔드와 Flask REST API 구조를 구축했습니다. 기존 서비스와 데이터 호환성을 고려하면서 관광지, 상세, 지도, 교통, 챗봇, 기록, 인증, PWA 순서로 기능을 이전했습니다.

## 프로젝트 구조

```text
TourProject/
├── frontend/
│   ├── public/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── features/
│       ├── pages/
│       ├── stores/
│       ├── i18n/
│       └── styles/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── repositories/
│   │   ├── services/
│   │   └── data/
│   └── tests/
├── LinkSuwon/          # 기존 Flask/Jinja 호환 영역
├── deploy/             # 배포 설정 참고 파일
├── .github/workflows/  # CI/CD
├── app.py              # 기존 Flask 진입점
├── requirements.txt
└── README.md
```

## REST API

주요 API는 `/api/v1` 아래에서 제공합니다.

```http
GET    /api/v1/health
GET    /api/v1/tour/spots
GET    /api/v1/tour/spots/:contentId
GET    /api/v1/traffic
GET    /api/v1/weather
GET    /api/v1/exchange
POST   /api/v1/chatbot/messages
GET    /api/v1/auth/me
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/records
GET    /api/v1/records/:id
POST   /api/v1/records
PATCH  /api/v1/records/:id
DELETE /api/v1/records/:id
POST   /api/v1/records/upload
```

공통 응답 형식:

```json
{
  "success": true,
  "data": {},
  "message": null
}
```

## 로컬 실행

### 요구 사항

- Python 3.12 권장
- Node.js 22 이상
- npm

### 설치

```bash
git clone <repository-url>
cd TourProject

python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install -r backend/requirements.txt

cd frontend
npm ci
cd ..
```

### 환경변수

실제 `.env` 파일과 API 키는 Git에 커밋하지 않습니다. 예시 파일을 복사하여 로컬 값을 입력합니다.

Backend `.env`:

```env
TOUR_API_KEY=
NVIDIA_API_KEY=
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL=openai/gpt-oss-20b
GOOGLE_CLIENT_ID=
SECRET_KEY=
SESSION_COOKIE_SECURE=False
DATABASE_PATH=
UPLOAD_FOLDER=
UPLOAD_URL_PREFIX=/static/uploads
```

Frontend `.env`:

```env
VITE_API_BASE_URL=/api/v1
VITE_GOOGLE_CLIENT_ID=
VITE_NAVER_MAP_CLIENT_ID=
```

NVIDIA, TourAPI, Google Client Secret, Flask `SECRET_KEY`는 백엔드에만 둡니다. 프론트엔드의 `VITE_*`에는 브라우저에 공개되어도 되는 식별자만 사용합니다.

### 실행

REST API:

```bash
cd backend
PYTHONPATH=.. ../.venv/bin/python run.py
```

React 개발 서버:

```bash
cd frontend
npm run dev
```

기존 Flask 호환 앱:

```bash
python app.py
```

## 테스트와 빌드

```bash
cd backend
PYTHONPATH=.. ../.venv/bin/python -m pytest tests -q

cd ../frontend
npm run build

cd ..
git diff --check
```

테스트는 외부 AI·관광 API를 무분별하게 호출하지 않도록 대부분 mock을 사용하며, 실제 운영 API 키는 테스트 로그에 출력하지 않습니다.

## 보안 원칙

- API 키와 Secret은 서버 환경변수로만 관리
- `SECRET_KEY` 공개 기본값 금지 및 운영 환경 누락 시 fail-fast
- Google credential 서버 검증
- HttpOnly·SameSite Session Cookie
- 사용자별 여행 기록 소유권 검증
- 업로드 MIME·확장자·용량 검증
- UUID 기반 파일명으로 path traversal 방지
- 사용자 입력 HTML 직접 렌더링 금지
- 인증·기록·챗봇 응답의 Service Worker 캐시 제외
- TourAPI 장애 시 검증되지 않은 최신 정보를 임의 생성하지 않음

## 배포

배포 흐름은 다음과 같습니다.

```text
로컬 개발
  → 테스트
  → Git push
  → GitHub Actions
  → React production build
  → Flask/Gunicorn 반영
  → health check
```

운영 Nginx와 기존 서비스 인프라를 재사용하며, 일반 배포 과정에서 SQLite DB와 사용자 업로드 파일을 초기화하지 않도록 runtime 데이터를 코드와 분리할 수 있습니다.

## License

Portfolio, educational, and competition project.
