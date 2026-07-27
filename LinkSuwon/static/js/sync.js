/**
     LinkSuwon 구글 로그인 및 로컬-백엔드 데이터 양방향 동기화(Sync) 모듈
 */

document.addEventListener("DOMContentLoaded", function() {
    // 1. 구글 GIS SDK 로드 및 로그인 상태 확인
    checkLoginStatus();
});

/**
 * 백엔드에 로그인 상태를 확인하고 UI를 분기 렌더링합니다.
 */
async function checkLoginStatus() {
    try {
        const response = await fetch('/auth/status');
        const data = await response.json();
        
        if (data.is_logged_in) {
            renderLoggedInUI(data.user);
            // 로그인 상태라면 최초 1회 즉시 데이터 양방향 동기화 수행
            await triggerDataSync();
        } else {
            renderLoggedOutUI();
        }
    } catch (error) {
        console.error("❌ [Login Status Check Error]", error);
        renderLoggedOutUI();
    }
}

/**
 * 로그인된 상태의 UI를 헤더에 렌더링합니다.
 */
function renderLoggedInUI(user) {
    const container = document.getElementById('google-login-container');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const currentLang = urlParams.get('lang') || 'kor';

    container.innerHTML = `
        <div class="flex items-center gap-2.5">
            <a href="/profile?lang=${currentLang}" class="flex items-center gap-2 text-decoration-none hover:opacity-85">
                <img class="w-8 h-8 rounded-full border border-secondary/20 shadow-sm" src="${user.picture}" alt="${user.name}">
                <span class="hidden md:inline font-bold text-xs text-on-surface-variant">${user.name}</span>
            </a>
            <button onclick="triggerLogout()" class="px-2.5 py-1.5 rounded-lg border border-outline-variant/40 hover:bg-red-50 hover:text-red-600 transition-colors font-bold text-[10px] bg-transparent">
                Logout
            </button>
        </div>`;
}

/**
 * 비로그인 상태일 때 구글 로그인 버튼을 헤더에 활성화합니다.
 */
function renderLoggedOutUI() {
    const container = document.getElementById('google-login-container');
    if (!container) return;

    // 구글 GIS 버튼을 동적으로 생성하기 위한 타겟 컨테이너 지정
    container.innerHTML = `<div id="g_id_onload_btn"></div>`;

    // Google GIS 라이브러리 초기화 및 버튼 렌더링
    if (window.google) {
        initializeGoogleSignIn();
    } else {
        // SDK가 아직 로드되지 않은 경우 로드 완료 대기
        const script = document.createElement('script');
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => {
            initializeGoogleSignIn();
        };
        document.head.appendChild(script);
    }
}

/**
 * Google Identity Services 버튼을 이니셜라이즈합니다.
 */
function initializeGoogleSignIn() {
    // 환경변수로부터 로드된 클라이언트 ID 사용 (없을 시 플레이스홀더 fallback)
    const CLIENT_ID = window.GOOGLE_CLIENT_ID || "109848529329-placeholderclientid12345.apps.googleusercontent.com";

    google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true
    });

    google.accounts.id.renderButton(
        document.getElementById("g_id_onload_btn"),
        { 
            theme: "outline", 
            size: "medium",
            type: "standard",
            shape: "pill",
            text: "signin",
            logo_alignment: "left"
        }
    );
}

/**
 * 구글 로그인 성공 시 콜백
 */
async function handleCredentialResponse(response) {
    try {
        const loginRes = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ credential: response.credential })
        });

        const loginData = await loginRes.json();
        if (loginData.success) {
            // 로그인 성공 시 UI 갱신 및 데이터 동기화
            renderLoggedInUI(loginData.user);
            await triggerDataSync();
            // 동기화 완료 후 화면을 갱신하여 데이터 반영
            window.location.reload();
        } else {
            alert("Google Login Failed.");
        }
    } catch (error) {
        console.error("❌ [Google Sign-In Callback Error]", error);
    }
}

/**
 * 로그아웃을 실행합니다.
 */
async function triggerLogout() {
    try {
        const res = await fetch('/auth/logout', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
            // 로그아웃 시 LocalStorage 데이터는 안전하게 보존합니다.
            // 필요에 따라 클리어할 수도 있으나, 사용자의 편의를 위해 유지합니다.
            window.location.reload();
        }
    } catch (error) {
        console.error("❌ [Logout Error]", error);
    }
}

/**
 * LocalStorage 데이터와 백엔드 SQLite 데이터 간의 양방향 동기화(Sync)를 처리합니다.
 */
async function triggerDataSync() {
    try {
        // 1. 로컬 저장소 데이터 로드
        const savedPlacesStr = localStorage.getItem('linksuwon:savedPlaces') || '[]';
        const visitRecordsStr = localStorage.getItem('linksuwon:visitRecords') || '[]';

        const savedPlaces = JSON.parse(savedPlacesStr);
        const visitRecords = JSON.parse(visitRecordsStr);

        // 2. 백엔드 동기화 API 호출
        const res = await fetch('/auth/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                savedPlaces: savedPlaces,
                visitRecords: visitRecords
            })
        });

        if (res.ok) {
            const syncData = await res.json();
            if (syncData.success) {
                // 3. 백엔드에서 병합된 데이터를 로컬 저장소에 최종 덮어쓰기
                localStorage.setItem('linksuwon:savedPlaces', JSON.stringify(syncData.savedPlaces));
                localStorage.setItem('linksuwon:visitRecords', JSON.stringify(syncData.visitRecords));
                console.log("🔄 [LinkSuwon] 로컬과 클라우드 데이터베이스 동기화가 안전하게 완료되었습니다.");
            }
        }
    } catch (error) {
        console.error("❌ [Data Sync Error]", error);
    }
}

/**
 * 외부 유틸리티: 사용자가 새로운 명소를 저장하거나 기록을 남겼을 때 로그인 상태라면 백엔드로 푸시합니다.
 */
async function pushDataSyncSilently() {
    const response = await fetch('/auth/status');
    const data = await response.json();
    if (data.is_logged_in) {
        await triggerDataSync();
    }
}
