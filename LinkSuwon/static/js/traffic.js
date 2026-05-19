let trafficMap = null;
let currentLat = null;
let currentLng = null;

// 페이지 로드 시 즉시 지도 생성
window.onload = function() {
    initTrafficMap();
};

/**
 * 교통 안내 페이지 내 현위치 미니 지도 초기화 함수
 */
function initTrafficMap() {
    // 1. 기본 위치 설정 (수원역 기준)
    const defaultOptions = {
        center: new naver.maps.LatLng(37.2664, 127.0002),
        zoom: 14,
        mapTypeControl: true,
        zoomControl: true,
        minZoom: 10
    };

    trafficMap = new naver.maps.Map('traffic-map', defaultOptions);

    // 2. 사용자의 GPS 정보를 받아와 지도 중심 이동 및 마커 생성
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                currentLat = position.coords.latitude;
                currentLng = position.coords.longitude;
                const myLocation = new naver.maps.LatLng(currentLat, currentLng);

                trafficMap.setCenter(myLocation);
                trafficMap.setZoom(16);

                // 현재 위치 포인트 마커 표시
                new naver.maps.Marker({
                    position: myLocation,
                    map: trafficMap,
                    icon: {
                        content: '<div style="width:18px; height:18px; background:rgba(0, 102, 204, 0.9); border:2px solid #fff; border-radius:50%; box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
                        anchor: new naver.maps.Point(9, 9)
                    }
                });
            },
            () => {
                console.log("현위치 권한 거부됨 또는 지원하지 않는 환경입니다.");
            }
        );
    }
}

/**
 * 선택된 목적지의 정확한 위경도를 활용하여 네이버 대중교통 길찾기로 다이렉트 연동
 */
function startNaverNavigation() {
    const destSelect = document.getElementById('end-point-select');
    // 선택된 option 태그에서 숨겨진 data 속성 추출
    const selectedOption = destSelect.options[destSelect.selectedIndex];
    const destName = selectedOption.getAttribute('data-name');
    const destLat = selectedOption.getAttribute('data-lat');
    const destLng = selectedOption.getAttribute('data-lng');

    let naverMapUrl = "";
    const endText = encodeURIComponent(destName);

    // URL의 언어 매개변수 확인 후 네이버 지도용 언어 코드로 변환
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

    // GPS 좌표가 수집된 경우, 위경도 기반 라우팅 URL 생성
    if (currentLat && currentLng) {
        const startText = encodeURIComponent('현위치');
        // 파라미터 구조: 출발지경도,출발지위도,출발지명 / 도착지경도,도착지위도,도착지명
        naverMapUrl = `https://map.naver.com/v5/directions/${currentLng},${currentLat},${startText}/${destLng},${destLat},${endText}/-/transit?c=14,0,0,0,dh&lang=${langParam}`;
    } else {
        // GPS 정보가 없을 경우, 목적지만 지정하여 앱 실행
        naverMapUrl = `https://map.naver.com/v5/directions/-/${destLng},${destLat},${endText}/-/transit?c=14,0,0,0,dh&lang=${langParam}`;
    }

    // 새 창으로 네이버 지도 열기
    window.open(naverMapUrl, '_blank');
}

/**
 * 특정 길찾기 없이 현재 위치를 중심으로 네이버 지도를 띄우는 함수
 */
function openNaverMapApp() {
    // URL의 언어 매개변수 확인 후 네이버 지도용 언어 코드로 변환
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

    if (currentLat && currentLng) {
        // 내 위치 중심으로 지도 뷰어 호출
        window.open(`https://map.naver.com/v5/?c=${currentLng},${currentLat},16,0,0,0,dh&lang=${langParam}`, '_blank');
    } else {
        // GPS 불가 시 기본 지도 홈 호출
        window.open(`https://map.naver.com/v5/?lang=${langParam}`, '_blank');
    }
}