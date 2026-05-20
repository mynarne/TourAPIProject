// 네이버 지도 인스턴스 전역 관리용 변수
let map = null;
let currentLat = null; // 사용자의 실시간 위도 저장 변수
let currentLng = null; // 사용자의 실시간 경도 저장 변수

// 페이지 로드 시 스마트 길찾기 위치 트래커 작동 시작
window.onload = function() {
    initTrafficPageMap();
};

/**
 * 1. 실시간 GPS 현위치 추적 및 미니지도 초기화
 */
function initTrafficPageMap() {
    const mapContainer = document.getElementById('traffic-map');
    if (!mapContainer) return;

    // 기본 위치 세팅 (수원역 주위 임시 기본 마커 좌표)
    const defaultCenter = new naver.maps.LatLng(37.2664, 127.0002);
    
    const mapOptions = {
        center: defaultCenter,
        zoom: 14,
        mapTypeControl: false,
        zoomControl: true
    };

    map = new naver.maps.Map('traffic-map', mapOptions);

    // HTML5 Geolocation API 적용하여 사용자 기기의 위경도 실시간 스캔
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                currentLat = position.coords.latitude;
                currentLng = position.coords.longitude;
                const userLatLng = new naver.maps.LatLng(currentLat, currentLng);

                // 사용자의 GPS 위치가 잡히면 해당 포인터로 지도의 센터를 즉시 이동
                map.setCenter(userLatLng);

                // 현위치를 나타내는 푸른색 정밀 마커 표시
                new naver.maps.Marker({
                    position: userLatLng,
                    map: map,
                    icon: {
                        content: '<div style="width:16px; height:16px; background:#0066cc; border:2px solid #fff; border-radius:50%; box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>',
                        anchor: new naver.maps.Point(8, 8)
                    }
                });

                console.log("--- [교통안전 DEBUG] 사용자 실시간 기기 위치 연동 성공 ---");
            },
            () => {
                console.log("--- [교통안전 DEBUG] 사용자 위치 획득 실패 (수원역 중심 대체) ---");
            }
        );
    }
}

/**
 * 2. 출발지(실시간 현위치)에서 선택한 명소(대폭 확장된 핫플)까지 대중교통 길찾기 호출
 */
function startNaverNavigation() {
    const selectEl = document.getElementById('end-point-select');
    if (!selectEl) return;

    const selectedOption = selectEl.options[selectEl.selectedIndex];
    const destLat = selectedOption.getAttribute('data-lat');
    const destLng = selectedOption.getAttribute('data-lng');
    const destName = selectedOption.getAttribute('data-name');

    if (!destLat || !destLng) {
        console.error("목적지의 정밀 좌표가 지정되지 않았습니다.");
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const currentLang = urlParams.get('lang') || 'kor';
    let langParam = 'ko';

    // 매칭 테이블 기반 다국어 코드 가이드 이식
    if (currentLang === 'eng') {
        langParam = 'en';
    } else if (currentLang === 'jpn') {
        langParam = 'ja';
    } else if (currentLang === 'chs') {
        langParam = 'zh-Hans';
    } else if (currentLang === 'cht') {
        langParam = 'zh-Hant';
    }

    let directionsUrl = "";
    const endText = encodeURIComponent(destName);

    // 실시간 현위치 GPS 확보 여부에 따른 하이퍼링크 라우팅
    if (currentLat && currentLng) {
        const startText = encodeURIComponent("현위치");
        directionsUrl = `https://map.naver.com/v5/directions/${currentLng},${currentLat},${startText}/${destLng},${destLat},${endText}/-/transit?c=14,0,0,0,dh&lang=${langParam}`;
    } else {
        directionsUrl = `https://map.naver.com/v5/directions/-/${destLng},${destLat},${endText}/-/transit?c=14,0,0,0,dh&lang=${langParam}`;
    }

    window.open(directionsUrl, '_blank');
}

/**
 * 3. 목적지를 지정하지 않고 현재 위치 탐색용으로 네이버 지도를 크게 여는 기능
 */
function openNaverMapApp() {
    const urlParams = new URLSearchParams(window.location.search);
    const currentLang = urlParams.get('lang') || 'kor';
    let langParam = 'ko';

    if (currentLang === 'eng') {
        langParam = 'en';
    } else if (currentLang === 'jpn') {
        langParam = 'ja';
    } else if (currentLang === 'chs') {
        langParam = 'zh-Hans';
    } else if (currentLang === 'cht') {
        langParam = 'zh-Hant';
    }

    let mapUrl = "";
    if (currentLat && currentLng) {
        // GPS 수집이 끝났으면 해당 중심 위치로 브라우징 지도 오픈
        mapUrl = `https://map.naver.com/v5/?c=${currentLng},${currentLat},15,0,0,0,dh&lang=${langParam}`;
    } else {
        // 좌표 획득 전이면 수원역 중심으로 오픈
        mapUrl = `https://map.naver.com/v5/?c=127.0002,37.2664,15,0,0,0,dh&lang=${langParam}`;
    }
    window.open(mapUrl, '_blank');
}

/**
 * ==================== [신규 추가] 무인 단말기 슬라이드 모달 보조 제어 제어문 ====================
 */

// 단말기 위치 모달 열기
function openKioskLocationModal() {
    const modal = document.getElementById('kiosk-location-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// 단말기 실물 미리보기 모달 열기
function openKioskVisualModal() {
    const modal = document.getElementById('kiosk-visual-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// 모달 닫기 공통 처리 함수
function closeKioskModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// 바깥 반투명 여백 클릭 시 모달이 슥 닫히는 센스 넘치는 사용자 편의 인터랙션 구현
window.addEventListener('click', function(event) {
    const locModal = document.getElementById('kiosk-location-modal');
    const visualModal = document.getElementById('kiosk-visual-modal');
    
    if (event.target === locModal) {
        locModal.style.display = 'none';
    }
    if (event.target === visualModal) {
        visualModal.style.display = 'none';
    }
});