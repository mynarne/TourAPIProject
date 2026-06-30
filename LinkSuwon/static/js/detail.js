let destLat = null;
let destLng = null;
let destTitle = "";
let currentLat = null;
let currentLng = null;

/**
 * 상세 페이지 단일 마커 지도 초기화 함수 및 실시간 위치 트래커 활성화
 * @param {number} mapY - 위도 (Latitude)
 * @param {number} mapX - 경도 (Longitude)
 * @param {string} title - 명소 이름
 */
function initDetailMap(mapY, mapX, title) {
    if (!mapX || !mapY) {
        console.error("좌표 데이터가 유효하지 않습니다.");
        return;
    }

    destLat = mapY;
    destLng = mapX;
    destTitle = title;

    const position = new naver.maps.LatLng(mapY, mapX);
    const mapOptions = {
        center: position,
        zoom: 16,
        mapTypeControl: true,
        zoomControl: true
    };

    const map = new naver.maps.Map('detail-map', mapOptions);

    new naver.maps.Marker({
        position: position,
        map: map,
        icon: {
            content: `
                <div class="detail-marker-label-box">
                    ${title}
                </div>`,
            anchor: new naver.maps.Point(20, 20)
        },
        animation: naver.maps.Animation.DROP
    });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                currentLat = position.coords.latitude;
                currentLng = position.coords.longitude;
                console.log("--- [상세보기 GPS] 출발지 사용자 좌표 연동 완료 ---");
            },
            () => {
                console.log("--- [상세보기 GPS] 위치 정보 수집 불가 (안전 기본값 처리) ---");
            }
        );
    }
}

function startDetailNavigation() {
    if (!destLat || !destLng) {
        console.error("목적지 위치 정보가 세팅되지 않았습니다.");
        return;
    }

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

    let naverMapUrl = "";
    const endText = encodeURIComponent(destTitle);

    if (currentLat && currentLng) {
        const startText = encodeURIComponent("현위치");
        naverMapUrl = `https://map.naver.com/v5/directions/${currentLng},${currentLat},${startText}/${destLng},${destLat},${endText}/-/transit?c=14,0,0,0,dh&lang=${langParam}`;
    } else {
        naverMapUrl = `https://map.naver.com/v5/directions/-/${destLng},${destLat},${endText}/-/transit?c=14,0,0,0,dh&lang=${langParam}`;
    }

    window.open(naverMapUrl, '_blank');
}