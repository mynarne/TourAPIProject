# LinkSuwon 개발 규칙

## 1. 프로젝트 기본 원칙

LinkSuwon은 수원을 방문하는 국내외 관광객을 위한 다국어 관광 정보 플랫폼이다.

이 프로젝트는 단순 관광지 목록 웹사이트가 아니라, 관광지 정보, 지도, AI 가이드, 여행 기록, 즐겨찾기, PWA 기능을 결합한 모바일 중심 여행 보조 서비스로 개발한다.

개발 시 기존에 정상 동작하는 기능은 최대한 보존하고, 리뉴얼이 필요한 영역만 단계적으로 개선한다.

---

## 2. 기술 스택

### Backend

* Python
* Flask
* requests
* python-dotenv

### Frontend

* HTML5
* CSS3
* Vanilla JavaScript

### External API

* Korea Tourism Organization TourAPI
* Naver Map API
* Gemini REST API

### Local Data

* JSON Seed Data
* LocalStorage

---

## 3. 핵심 보존 규칙

다음 기능은 삭제하거나 구조를 무너뜨리지 않는다.

* 5개 언어 지원 구조
* `lang` URL 파라미터 기반 언어 처리
* TourAPI 관광지 목록 조회
* 관광지 상세 조회
* Naver Map API 연동
* Gemini 챗봇 연동
* `.env` 기반 환경변수 관리
* `app.py`와 `LinkSuwon/api_manager.py` 분리 구조
* 기존에 존재하는 주요 관광지 데이터
* 기존 여행 팁 또는 교통 안내 콘텐츠

기존 코드를 수정할 때는 기능을 제거하기 전에 대체 구조를 먼저 만든다.

---

## 4. 금지 사항

다음 작업은 금지한다.

* API Key를 코드에 직접 작성하지 않는다.
* `.env` 파일을 Git에 포함하지 않는다.
* HTML 내부에 긴 CSS를 직접 작성하지 않는다.
* HTML 내부에 긴 JavaScript를 직접 작성하지 않는다.
* 하나의 파일에 모든 기능을 몰아넣지 않는다.
* 기존 동작 기능을 이유 없이 삭제하지 않는다.
* 다국어 텍스트를 한 언어만 수정하고 다른 언어를 방치하지 않는다.
* 로딩/에러/빈 데이터 상태 없이 API 결과만 전제로 화면을 만들지 않는다.
* `verify=False`를 운영 기본값처럼 사용하지 않는다.
* 챗봇 요청 실패 시 사용자가 원인을 알 수 없는 상태로 방치하지 않는다.

---

## 5. 권장 파일 구조

이 프로젝트의 권장 폴더 및 파일 구조는 다음과 같다.

```txt
LinkSuwon/
├── app.py
├── requirements.txt
├── .env.example
├── README.md
├── rule.md
├── LinkSuwon/
│   ├── __init__.py
│   ├── api_manager.py
│   ├── config.py
│   ├── i18n.py
│   └── seed_data.py
├── templates/
│   ├── base.html
│   ├── index.html
│   ├── detail.html
│   ├── saved.html
│   ├── records.html
│   ├── courses.html
│   ├── tips.html
│   ├── offline.html
│   └── includes/
│       ├── header.html
│       ├── footer.html
│       ├── chatbot.html
│       └── bottom_nav.html
├── static/
│   ├── style/
│   │   ├── base.css
│   │   ├── layout.css
│   │   ├── components.css
│   │   ├── pages.css
│   │   ├── chatbot.css
│   │   └── responsive.css
│   ├── script/
│   │   ├── main.js
│   │   ├── map.js
│   │   ├── chatbot.js
│   │   ├── storage.js
│   │   ├── pwa.js
│   │   └── records.js
│   ├── data/
│   │   ├── places_seed.json
│   │   ├── courses.json
│   │   └── travel_tips.json
│   ├── image/
│   ├── manifest.json
│   └── service-worker.js
```

---

## 6. Python / Flask 개발 규칙

* Flask 라우트는 `app.py`에서 관리한다.
* External API 호출은 `LinkSuwon/api_manager.py`에서 관리한다.
* 환경변수 로딩은 한 곳에서 처리한다.
* 언어 코드 검증 함수는 공통으로 사용한다.
* API 응답은 화면에 넘기기 전 정규화한다.
* 예외 발생 시 빈 리스트 또는 fallback 데이터를 반환하여 화면이 깨지지 않게 한다.
* API 호출에는 timeout을 설정한다.
* 에러 메시지는 개발자용 로그와 사용자용 메시지를 구분한다.

---

## 7. 다국어 처리 규칙

지원 언어 코드는 다음으로 고정한다.

```txt
kor, eng, jpn, chs, cht
```

* 지원하지 않는 언어 코드는 `kor`로 fallback한다.
* 모든 페이지는 현재 언어 코드를 유지해야 한다.
* 링크 생성 시 `?lang={{ lang }}` 구조를 누락하지 않는다.
* UI 문구는 가능한 한 템플릿 내부 하드코딩을 줄이고 i18n 사전으로 관리한다.
* 관광지 데이터가 특정 언어에서 부족하면 Seed Data로 보완한다.
* 챗봇 응답 언어는 현재 선택된 언어와 일치해야 한다.

---

## 8. Frontend 개발 규칙

* CSS는 `static/style/`에 분리한다. (또는 기존 `static/css/`를 단계적으로 마이그레이션)
* JavaScript는 `static/script/`에 분리한다. (또는 기존 `static/js/`를 단계적으로 마이그레이션)
* 공통 컴포넌트는 `templates/includes/`에 분리한다.
* 모바일 우선으로 작성한다.
* 버튼, 카드, 지도, 챗봇 등 반복 UI는 재사용 가능한 클래스 이름을 사용한다.
* DOM 요소를 찾을 때 없는 요소에 접근하지 않도록 방어 코드를 작성한다.
* Fetch 요청은 실패 처리를 반드시 포함한다.
* 중복 클릭 및 중복 전송을 방지한다.

---

## 9. LocalStorage 규칙

LocalStorage는 로그인 없는 개인 기록 기능에 사용한다.

### 저장 가능 데이터

* 즐겨찾기 관광지
* 방문 기록
* 간단 메모
* 최근 본 관광지
* 사용자 언어 설정

### 저장 금지 데이터

* API Key
* 민감한 개인정보
* 서버 인증 정보
* 사용자의 정확한 위치 기록

### Key 이름 규칙

```txt
linksuwon:savedPlaces
linksuwon:visitRecords
linksuwon:recentPlaces
linksuwon:language
```

---

## 10. PWA 규칙

* `manifest.json`을 작성한다.
* `service-worker.js`를 작성한다.
* 정적 CSS, JS, 기본 이미지, offline 페이지를 캐싱한다.
* API 응답 전체를 무리하게 캐싱하지 않는다.
* 오프라인 상태에서는 안내 페이지 또는 기존 캐시 데이터를 보여준다.
* 서비스워커 등록 실패 시 콘솔에만 오류를 남기고 화면은 정상 동작해야 한다.

---

## 11. 챗봇 규칙

* 챗봇은 수원 관광 안내 범위 안에서 답변한다.
* 선택된 언어에 맞춰 답변해야 한다.
* 사용자의 질문이 불명확하면 짧게 되묻는다.
* API 호출 실패 시 친절한 실패 메시지를 출력한다.
* 전송 중에는 입력창 또는 버튼을 잠시 비활성화한다.
* HTML 응답을 직접 삽입하지 않고 텍스트로 처리한다.
* 프롬프트에는 현재 언어, 현재 페이지, 현재 관광지 정보를 포함할 수 있다.

---

## 12. 디자인 규칙

* 디자인은 수원화성, 행궁동, 성곽길, 로컬 여행 감성을 현대적인 모바일 여행앱 UI로 재해석한다.
* 복잡한 장식보다 카드, 지도, 여백, 명확한 버튼을 우선한다.
* 메인 컬러는 신뢰감 있는 네이비 계열을 사용한다.
* 보조 컬러는 성곽 돌담, 행궁 노을, 여행 지도 느낌을 반영한다.
* 모바일 하단 주요 액션 접근성을 우선한다.
* 다국어 문장 길이가 달라져도 UI가 깨지지 않아야 한다.

---

## 13. 작업 완료 전 체크리스트

작업 후 다음 항목을 확인한다.

* Flask 서버가 정상 실행되는가?
* 기본 포트 5001에서 접근 가능한가?
* 5개 언어 전환이 가능한가?
* 관광지 목록이 표시되는가?
* 관광지 상세 페이지가 표시되는가?
* API 실패 시 fallback이 동작하는가?
* 네이버 지도 영역이 깨지지 않는가?
* 챗봇 요청 실패 처리가 있는가?
* 즐겨찾기 저장/해제가 동작하는가?
* 여행 기록 저장/삭제가 동작하는가?
* 모바일 화면에서 레이아웃이 깨지지 않는가?
* `.env` 없이 실행했을 때 적절한 안내가 나오는가?
* `.env`가 Git에 포함되지 않는가?
* CSS와 JS가 HTML에 과하게 인라인으로 들어가 있지 않은가?
