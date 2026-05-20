let map = null;
let markers = [];
let infoWindows = [];
let currentLat = null;
let currentLng = null;
let globalSpots = []; // 메모리 격리용 전역 데이터 보관 리스트

// 브라우저 렌더링 타이밍에 가장 견고한 DOMContentLoaded 인터페이스로 완전 동기화
document.addEventListener("DOMContentLoaded", function() {
    const dataElement = document.getElementById('spot-data');
    if (dataElement) {
        globalSpots = JSON.parse(dataElement.textContent);
        if (globalSpots && globalSpots.length > 0) {
            initLinkSuwonMap(globalSpots);
        }
    }
});

/**
 * 지도가 최초 실행될 때 모든 공공 API 핫플 마커들을 기본적으로 지도 위에 자동 활성화합니다.
 */
function initLinkSuwonMap(spotItems) {
    const mapOptions = {
        center: new naver.maps.LatLng(37.282, 127.014),
        zoom: 13,
        mapTypeControl: true,
        zoomControl: true,
        minZoom: 10,
    };
    
    map = new naver.maps.Map('map', mapOptions);

    // [기능 보강] 명소를 클릭하기 전에도 전체 마커가 기본 노출되도록 루프 구동
    if (spotItems && spotItems.length > 0) {
        spotItems.forEach((item, index) => {
            if (item.mapx && item.mapy) {
                const position = new naver.maps.LatLng(item.mapy, item.mapx);
                
                const marker = new naver.maps.Marker({
                    position: position,
                    map: map,
                    title: item.title,
                    animation: naver.maps.Animation.DROP
                });

                // 지도 위의 마커를 찍어도 하단 캐러셀 터치와 마찬가지로 비동기 서랍장이 열리도록 연동
                naver.maps.Event.addListener(marker, "click", function() {
                    loadInlineSpotDetail(index);
                });

                markers.push(marker);
            }
        });
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                currentLat = position.coords.latitude;
                currentLng = position.coords.longitude;
                const myLocation = new naver.maps.LatLng(currentLat, currentLng);

                new naver.maps.Marker({
                    position: myLocation,
                    map: map,
                    icon: {
                        content: '<div class="spot-user-gps-marker"></div>',
                        anchor: new naver.maps.Point(9, 9)
                    }
                });
            },
            () => { console.log("기기 GPS 권한 수집 거부"); }
        );
    }
}

/**
 * [핵심 기능] 백엔드에 연동해 둔 새 API를 호출하여 진짜 상세 소개글(Overview)을 비동기적으로 스크래핑해 꽂아주는 핵심 엔진
 */
function loadInlineSpotDetail(index) {
    const item = globalSpots[index];
    if (!item) return;

    // 상세서랍 활성화 클래스 투입 및 맵 리사이징 적용
    const panel = document.getElementById('spot-inline-detail-panel');
    const mapFrame = document.getElementById('map');
    if (panel && mapFrame) {
        panel.classList.add('active');
        mapFrame.classList.add('split-mode');
        if (map) map.updateSize(); // 가로폭 레이아웃 전환 시 네이버 맵 깨짐 방지
    }

    // 통신 완료 전까지 사용자에게 실시간 피드백을 전달하는 스피너 로더 가동
    document.getElementById('panel-item-title').innerText = item.title;
    document.getElementById('panel-item-overview').innerHTML = `
        <div class="d-flex align-items-center gap-2 py-3 text-primary">
            <div class="spinner-border spinner-border-sm" role="status"></div>
            <span class="small fw-bold">소개 정보를 안전하게 불러오는 중입니다...</span>
        </div>`;
    document.getElementById('panel-item-addr').innerText = item.addr1;

    const urlParams = new URLSearchParams(window.location.search);
    const currentLang = urlParams.get('lang') || 'kor';
    let langParam = 'ko';
    if (currentLang === 'eng') langParam = 'en';
    if (currentLang === 'jpn') langParam = 'ja';

    const routeBtnText = currentLang === 'kor' ? '⚡ 현위치에서 대중교통 길찾기' : '⚡ Transit Routes';
    const endText = encodeURIComponent(item.title);
    let naverMapUrl = "";

    if (currentLat && currentLng) {
        const startText = encodeURIComponent("현위치");
        naverMapUrl = `https://map.naver.com/v5/directions/${currentLng},${currentLat},startText}/${item.mapx},${item.mapy},${endText}/-/transit?c=14,0,0,0,dh&lang=${langParam}`;
    } else {
        naverMapUrl = `https://map.naver.com/v5/directions/-/${item.mapx},${item.mapy},${endText}/-/transit?c=14,0,0,0,dh&lang=${langParam}`;
    }

    const placeholder = document.getElementById('panel-dynamic-route-placeholder');
    placeholder.innerHTML = `<a href="${naverMapUrl}" target="_blank" class="btn btn-success btn-sm w-100 fw-bold border-0 py-2" style="background-color: #03C75A;">${routeBtnText}</a>`;

    // 백엔드의 비동기 전용 라우터로 통신 요청을 쏘아서 진짜 Overview 수신
    fetch(`/spot/api/detail/${item.contentid}?lang=${currentLang}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // 수신 완료된 순수 공공 가이드 텍스트 안전 치환 이식
                document.getElementById('panel-item-overview').innerHTML = data.overview;
                if (data.addr1) {
                    document.getElementById('panel-item-addr').innerText = data.addr1;
                }
            } else {
                document.getElementById('panel-item-overview').innerText = "상세 정보 데이터를 수신하지 못했습니다.";
            }
        })
        .catch(err => {
            console.error("상세 데이터 통신 실패:", err);
            document.getElementById('panel-item-overview').innerText = "소개 정보를 불러오는 중 서버 통신 에러가 발생했습니다.";
        });

    if (map) {
        const targetLatLng = new naver.maps.LatLng(item.mapy, item.mapx);
        map.setCenter(targetLatLng);
        map.setZoom(15);
    }
}

/**
 * 접기(✕) 기능 처리 함수: 확장 서랍장을 닫아버리고 온전한 풀 스크린 지도를 복구시킵니다.
 */
function closeInlineDetailPanel() {
    const panel = document.getElementById('spot-inline-detail-panel');
    const mapFrame = document.getElementById('map');
    if (panel && mapFrame) {
        panel.classList.remove('active');
        mapFrame.classList.remove('split-mode');
        if (map) {
            map.updateSize(); // 풀 스크린 환원 후 맵 크기 동기화 재가동
            map.setCenter(new naver.maps.LatLng(37.282, 127.014));
            map.setZoom(13);
        }
    }
}