# LinkSuwon (링크수원)

LinkSuwon은 수원시를 방문하는 외국인 및 국내 관광객을 위한 **다국어 맞춤형 관광 정보 플랫폼**입니다. 
수원의 아름다운 문화유산(수원화성, 행궁동 등)을 다국어(5개 언어)로 소개하고, 네이버 지도 기반의 위치 정보 및 길찾기, AI 여행 비서(챗봇), 그리고 개인화된 여행 기록(즐겨찾기, 방문기)을 제공합니다.

본 프로젝트는 모바일 우선(Mobile-First) 반응형 UI와 오프라인에서도 작동하는 PWA(Progressive Web App)를 기반으로 작동합니다.

---

## 🚀 주요 기능

1. **다국어 지원 (5개 언어)**
   - 한국어(`kor`), 영어(`eng`), 일본어(`jpn`), 중국어 간체(`chs`), 중국어 번체(`cht`) 지원.
   - URL `?lang=` 파라미터를 통해 페이지 전환 시에도 다국어 세션을 유지합니다.
2. **공공 데이터 연동 (TourAPI)**
   - 한국관광공사 국문/외국어 관광 정보 API를 호출하여 수원 관광 명소 리스트 및 상세 설명 제공.
3. **네이버 지도 v3 연동**
   - 수원시 명소 위치 매핑, 사용자 실시간 GPS 위치 표시, 목적지 대중교통 길찾기 링크 제공.
4. **다국어 AI 여행 비서 (Gemini 챗봇)**
   - `gemini-3.1-flash` REST API를 직접 연동하여 사용자의 언어로 수원의 관광, 교통, 팁 등에 대해 실시간 질의응답을 제공합니다.
5. **나만의 기록 & 즐겨찾기 (LocalStorage)**
   - 로그인 없이 브라우저 `LocalStorage`를 활용해 즐겨찾는 명소(`linksuwon:savedPlaces`)와 나만의 방문 타임라인(`linksuwon:visitRecords`)을 저장 및 편집합니다.
   - 기록한 타임라인은 이미지(PNG) 또는 PDF 파일로 다운로드하여 소장할 수 있습니다.
6. **PWA (Progressive Web App) 지원**
   - 모바일 기기 홈 화면에 앱 설치를 지원하며, 서비스 워커를 통해 네트워크가 차단된 오프라인 환경에서도 로컬 데이터를 바탕으로 즐겨찾기 및 여행 기록 조회가 가능합니다.

---

## 🛠️ 설치 및 실행 방법

### 1. 가상환경 구성 및 패키지 설치
Python 3.8 이상 환경을 권장합니다.

```bash
# 가상환경 생성 (최초 1회)
python3 -m venv .venv

# 가상환경 활성화 (macOS/Linux)
source .venv/bin/activate

# 가상환경 활성화 (Windows)
.venv\Scripts\activate

# 필요한 패키지 설치
pip install -r requirements.txt
```

### 2. 환경 변수 설정
최상위 경로에 `.env` 파일을 생성하고 필요한 API 키를 작성합니다. `.env.example`을 참고하십시오.

```bash
cp .env.example .env
```

`.env` 파일 내용:
```env
TOUR_API_KEY=your_tourapi_decoding_key_here
NAVER_CLIENT_ID=your_naver_map_client_id_here
GEMINI_API_KEY=your_gemini_api_key_here
SSL_VERIFY=False
```

### 3. 애플리케이션 실행
```bash
python app.py
```
서버 실행 후 브라우저에서 `http://localhost:5001`로 접속할 수 있습니다. (맥북 에어 포트 충돌 방지를 위해 `5001` 포트를 사용합니다.)

---

## 📂 폴더 구조 안내

```txt
TourProject/
├── app.py                  # Flask 애플리케이션 진입점
├── requirements.txt        # 패키지 의존성 목록
├── .env                    # 로컬 환경변수 파일 (Git 제외)
├── .env.example            # 환경변수 템플릿
├── rule.md                 # 개발 협업 규칙 및 품질 표준
├── README.md               # 프로젝트 매뉴얼
└── LinkSuwon/              # 메인 애플리케이션 패키지
    ├── __init__.py
    ├── api_manager.py      # TourAPI 및 Gemini AI 연동 로직
    ├── config.py           # 환경설정 모듈 (예정)
    ├── i18n.py             # 다국어 텍스트 및 다국어 유틸리티 (예정)
    ├── seed_data.py        # API 장애 대비 백업 데이터 (예정)
    ├── templates/          # Jinja2 HTML 템플릿
    │   ├── base.html       # 기본 공통 레이아웃 (PWA 등록)
    │   ├── index.html      # 홈 / 랜딩 화면
    │   ├── spot.html       # 명소 안내 리스트 및 지도
    │   ├── detail.html     # 명소 상세 정보
    │   ├── record.html     # 여행 기록 작성 및 PDF 다운로드
    │   └── includes/       # 템플릿 컴포넌트 분리
    └── static/             # 정적 에셋
        ├── css/            # 스타일시트 (수정/보완 예정)
        ├── js/             # 자바스크립트 (수정/보완 예정)
        └── pwa/            # PWA 관련 파일 (manifest.json, service-worker.js)
```

---

## 🔒 보안 및 개발 규칙 (핵심 요약)

* **API Key 보안**: 어떠한 경우에도 API Key를 코드에 하드코딩하여 Git에 커밋하지 마십시오.
* **SSL 검증**: 개발 환경에서는 `SSL_VERIFY=False`로 동작시킬 수 있으나, 프로덕션 배포 시에는 반드시 `True`로 전환하여 MITM(중간자 공격) 패킷 감청을 예방하십시오.
* **XSS 방어**: 사용자 입력 폼(예: 여행 기록의 후기 메모)은 브라우저 렌더링 전 반드시 HTML 이스케이프(`sanitizeInput`) 처리를 수행합니다.
* **인라인 코드 배제**: HTML 파일 내에 긴 인라인 CSS/JS를 작성하지 않고, 반드시 `static` 내의 전용 파일로 분리하여 브라우저 캐싱과 유지보수성을 확보합니다.

상세한 개발 규칙은 [rule.md](file:///Volumes/SC/TourProject/rule.md)를 참고하시기 바랍니다.
