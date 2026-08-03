# LinkSuwon (링크수원)

> **수원을 여행하는 국내외 관광객을 위한 다국어 스마트 관광 플랫폼**

LinkSuwon은 수원시를 방문하는 관광객이 **관광지 탐색부터 이동, AI 여행 추천, 여행 기록까지 하나의 서비스에서 이용할 수 있도록** 만든 관광 정보 플랫폼입니다.

한국관광공사 TourAPI 기반의 다국어 관광 정보와 네이버 지도, GPS 기반 교통 안내를 제공하며, NVIDIA GPT-OSS 기반 AI 여행 비서는 서비스 내부 관광 데이터를 Function Calling으로 조회하여 수원 여행에 특화된 답변을 제공합니다.

React + TypeScript 기반의 모바일 우선 UI와 Flask REST API 구조로 구성되어 있으며 PWA 설치와 제한적인 오프라인 이용을 지원합니다.

---

## ✨ 주요 기능

### 🌏 5개 언어 관광 정보

한국어, 영어, 일본어, 중국어 간체, 중국어 번체를 지원합니다.

- 한국어 (`kor`)
- 영어 (`eng`)
- 일본어 (`jpn`)
- 중국어 간체 (`chs`)
- 중국어 번체 (`cht`)

한국관광공사 TourAPI를 통해 수원 관광지의 목록과 상세 정보를 제공합니다.

---

### 🏯 수원 관광지 탐색

관광지 목록에서 원하는 장소를 검색하고 상세 정보를 확인할 수 있습니다.

- 관광지 검색
- 카테고리 탐색
- 다국어 정보
- 관광지 이미지
- 주소 및 위치 정보
- 상세 설명
- 네이버 지도 연동

관광지의 좌표 정보가 존재하는 경우 상세 화면에서 실제 위치를 지도와 함께 확인할 수 있습니다.

---

### 🗺️ 네이버 지도 & 교통 안내

Naver Maps JavaScript SDK와 브라우저 Geolocation API를 활용합니다.

- 관광지 위치 지도 표시
- 현재 GPS 위치 확인
- 목적지 선택
- 네이버 지도 대중교통 길찾기 연결
- 수원역 중심 fallback
- WOWPASS · NAMANE · T-money 안내
- 교통카드 및 일회용 지하철 카드 사용 안내
- 수원 여행자를 위한 대중교통 팁

실시간 버스·지하철 도착정보 API가 아닌 **GPS + 지도 + 정적 교통 안내를 결합한 여행자용 교통 기능**으로 구성되어 있습니다.

---

### 🤖 AI 여행 비서

NVIDIA Build의 OpenAI 호환 API를 통해 `openai/gpt-oss-20b` 모델을 사용합니다.

단순한 자유 대화형 챗봇이 아니라 LinkSuwon 내부 기능을 AI 도구로 연결했습니다.

지원 Function Calling:

- `search_suwon_spots`
  - 수원 관광지 검색
- `get_suwon_spot_detail`
  - 관광지 상세 정보 조회
- `get_suwon_transport_guide`
  - 수원 교통 및 교통카드 안내

예를 들어 다음과 같은 질문을 할 수 있습니다.

```text
인천공항에서 수원으로 가서 부모님과 하루 여행하려는데 코스를 추천해줘.
```

AI는 필요한 경우 관광지 및 교통 도구를 호출한 뒤 결과를 바탕으로 답변을 생성합니다.

한국어, 영어, 일본어, 중국어 간체, 중국어 번체 질문을 지원합니다.

---

### 📸 Travel Memory Archive

Google 로그인 사용자는 자신의 여행 기록을 저장하고 관리할 수 있습니다.

- 여행 기록 목록
- 기록 상세
- 기록 작성
- 기록 수정
- 개별 기록 삭제
- 대표 이미지 업로드
- 방문 날짜
- 장소 및 메모
- 관광지 위치 기반 지도 연결

이미지는 확장자와 MIME 타입을 검증하며 UUID 기반 파일명으로 저장합니다.

다른 사용자의 기록을 조회하거나 수정·삭제할 수 없도록 서버에서 사용자 소유권을 검증합니다.

---

### 🔐 Google 로그인 & Flask Session

Google Identity Services에서 발급한 credential을 Flask 백엔드에서 검증합니다.

```text
Google Identity Services
        ↓
React
        ↓ credential
Flask REST API
        ↓
Google token 검증
        ↓
User Upsert
        ↓
Flask Session
```

브라우저 새로고침 이후에도 서버의 `/api/v1/auth/me`를 통해 실제 로그인 상태를 다시 확인합니다.

Google credential이나 인증 토큰을 LocalStorage에 저장하지 않습니다.

---

### 📱 PWA

LinkSuwon은 모바일 홈 화면에 설치 가능한 Progressive Web App입니다.

Service Worker를 통해 다음 데이터를 제한적으로 캐시합니다.

- 애플리케이션 셸
- 정적 JS/CSS
- PWA 아이콘
- 이미 조회한 관광지 GET 데이터
- 교통 안내 GET 데이터

보안 또는 사용자 데이터와 관련된 다음 요청은 캐시하지 않습니다.

- 인증
- 여행 기록
- AI 챗봇
- 이미지 업로드
- POST / PATCH / DELETE 요청

네트워크가 없는 환경에서는 앱 셸과 캐시된 관광·교통 정보를 제한적으로 이용할 수 있습니다.

---

## 🧱 Architecture

```text
                         ┌──────────────────────┐
                         │       Browser        │
                         │ React + TypeScript   │
                         │       + PWA          │
                         └──────────┬───────────┘
                                    │
                          Same-Origin /api/v1
                                    │
                         ┌──────────▼───────────┐
                         │        Nginx         │
                         └──────┬────────┬──────┘
                                │        │
                         React Static    │
                                         │
                              ┌──────────▼──────────┐
                              │ Flask REST API     │
                              │     Gunicorn       │
                              └──────────┬─────────┘
                                         │
               ┌─────────────────────────┼─────────────────────────┐
               │                         │                         │
        ┌──────▼──────┐           ┌──────▼──────┐          ┌──────▼──────┐
        │   TourAPI   │           │   SQLite    │          │ NVIDIA Build│
        │ 관광 공공데이터 │           │ Users/Records│          │ GPT-OSS-20B │
        └─────────────┘           └─────────────┘          └─────────────┘

                         ┌──────────────────────┐
                         │     Naver Maps       │
                         │ Maps SDK / GPS Link  │
                         └──────────────────────┘

                         ┌──────────────────────┐
                         │ Google Identity     │
                         │      Services       │
                         └──────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- Zustand
- Tailwind CSS
- Service Worker / Web App Manifest

### Backend

- Python
- Flask
- Gunicorn
- REST API
- SQLite

### AI

- NVIDIA Build
- `openai/gpt-oss-20b`
- OpenAI-compatible API
- Function Calling

### External Services

- 한국관광공사 TourAPI
- Naver Maps JavaScript SDK
- Google Identity Services
- Browser Geolocation API

### Infrastructure

- Oracle Cloud
- Nginx
- Gunicorn
- systemd
- GitHub Actions

---

## 📂 Project Structure

```text
TourProject/
├── frontend/
│   ├── public/
│   │   ├── manifest.webmanifest
│   │   ├── sw.js
│   │   └── offline.html
│   └── src/
│       ├── api/
│       ├── components/
│       ├── features/
│       ├── hooks/
│       ├── pages/
│       ├── pwa/
│       └── stores/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── repositories/
│   │   └── services/
│   ├── tests/
│   ├── run.py
│   └── wsgi.py
│
├── LinkSuwon/
│   └── Legacy Flask application
│
├── deploy/
│   └── Deployment configuration
│
├── .github/
│   └── workflows/
│
├── app.py
├── requirements.txt
└── README.md
```

`LinkSuwon/`에는 기존 Flask 기반 구현이 보존되어 있으며, 주요 기능을 React + Flask REST API 구조로 점진적으로 리팩터링했습니다.

---

## 🔌 REST API

주요 API는 `/api/v1` 아래에서 제공됩니다.

### System

```http
GET /api/v1/health
```

### Tourism

```http
GET /api/v1/tour/spots
GET /api/v1/tour/spots/:contentId
```

### Traffic

```http
GET /api/v1/traffic
```

### AI Chatbot

```http
POST /api/v1/chatbot/messages
```

### Authentication

```http
GET    /api/v1/auth/me
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/sync
DELETE /api/v1/auth/account
```

### Travel Records

```http
GET    /api/v1/records
GET    /api/v1/records/:id
POST   /api/v1/records
PATCH  /api/v1/records/:id
DELETE /api/v1/records/:id
POST   /api/v1/records/upload
```

---

## 🚀 Local Development

### Requirements

- Python 3.12 권장
- Node.js 22 이상
- npm

### 1. Clone

```bash
git clone <repository-url>
cd TourProject
```

### 2. Python 환경 구성

```bash
python3 -m venv .venv

source .venv/bin/activate
```

Windows:

```powershell
.venv\Scripts\activate
```

의존성 설치:

```bash
pip install -r requirements.txt
pip install -r backend/requirements.txt
```

### 3. Frontend 설치

```bash
cd frontend
npm ci
cd ..
```

---

## 🔑 Environment Variables

실제 API Key와 Secret은 Git에 커밋하지 않습니다.

### Backend

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
UPLOAD_URL_PREFIX=/uploads
```

### Frontend

```env
VITE_GOOGLE_CLIENT_ID=
VITE_NAVER_MAP_CLIENT_ID=
VITE_API_BASE_URL=/api/v1
```

`VITE_*` 변수에는 브라우저에서 사용할 수 있는 공개 식별자만 사용합니다.

`NVIDIA_API_KEY`, `SECRET_KEY`, TourAPI Key 등의 비밀 값은 프론트엔드에 포함하지 않습니다.

---

## ▶️ Run

### Legacy Flask

```bash
python app.py
```

기본 개발 주소:

```text
http://localhost:5001
```

### Flask REST API

```bash
cd backend
python run.py
```

기본 개발 주소:

```text
http://localhost:5002
```

Health Check:

```text
http://localhost:5002/api/v1/health
```

### React

```bash
cd frontend
npm run dev
```

기본 개발 주소:

```text
http://localhost:5173
```

개발 환경에서는 Vite가 `/api` 요청을 Flask REST API로 proxy합니다.

---

## 🧪 Testing

Backend:

```bash
cd backend
PYTHONPATH=.. python -m pytest tests -q
```

현재 백엔드 테스트:

```text
28 passed
```

Frontend production build:

```bash
cd frontend
npm run build
```

Service Worker syntax:

```bash
node --check public/sw.js
```

Git diff validation:

```bash
git diff --check
```

---

## 🔒 Security

LinkSuwon은 다음 원칙을 적용합니다.

- API Key 및 Secret의 서버 측 관리
- Google credential 서버 검증
- Flask Session 기반 인증
- `HttpOnly` Session Cookie
- `SameSite=Lax`
- 운영 환경 `Secure` Cookie 지원
- 상태 변경 인증 요청 Origin 검증
- Records 사용자 소유권 검증
- 업로드 확장자 및 MIME 타입 검증
- 이미지 최대 10MB 제한
- UUID 기반 업로드 파일명
- 사용자 입력 HTML 직접 렌더링 금지
- 인증 및 사용자 데이터의 Service Worker 캐시 제외

---

## 🔄 Migration

LinkSuwon은 기존 Flask + Jinja 기반 서비스에서 시작했습니다.

서비스 전체를 한 번에 교체하는 방식 대신, 기능 단위의 수직 마이그레이션 방식으로 React + Flask REST API 구조로 전환했습니다.

```text
Legacy Flask / Jinja
        ↓
Tourism API
        ↓
Tourism Detail
        ↓
Naver Map
        ↓
Traffic
        ↓
AI Chatbot
        ↓
Travel Records
        ↓
Authentication
        ↓
PWA
        ↓
React + Flask REST Architecture
```

기존 기능을 유지하면서 각 기능을 독립적으로 검증하여 점진적으로 새로운 구조로 전환했습니다.

---

## 🚢 Deployment

배포는 GitHub Actions를 기준으로 자동화합니다.

```text
Local Development
        ↓
Test
        ↓
Git Push
        ↓
GitHub Actions
        ↓
Production Build
        ↓
Oracle Cloud
```

일반 배포 과정에서는 사용자 SQLite 데이터나 업로드 파일을 초기화하거나 삭제하지 않습니다.

운영 환경에서는 사용자 데이터를 애플리케이션 코드와 분리하여 관리할 수 있도록 다음 환경변수를 지원합니다.

```env
DATABASE_PATH=/path/to/runtime/linksuwon.db
UPLOAD_FOLDER=/path/to/runtime/uploads
UPLOAD_URL_PREFIX=/uploads
```

---

## 🎯 Project Goals

LinkSuwon은 단순히 관광 정보를 나열하는 서비스가 아니라,

**관광지를 찾고 → 이동하고 → AI에게 도움을 받고 → 여행을 기록하는 경험을 하나의 흐름으로 연결하는 것**

을 목표로 합니다.

```text
Explore
   ↓
Navigate
   ↓
Ask AI
   ↓
Travel
   ↓
Record
```

---

## 📄 License

This project is intended for portfolio, educational, and competition purposes.