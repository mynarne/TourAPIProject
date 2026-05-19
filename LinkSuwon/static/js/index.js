let map = null;
let markers = [];
let infoWindows = [];

/**
 * 메인 페이지 지도 초기화 및 관광지 마커 표시
 * @param {Array} spotItems - Flask에서 넘겨받은 관광지 리스트 데이터
 */
function initLinkSuwonMap(spotItems) {
    // 1. 지도 생성 (수원 화성 행궁 중심 좌표)
    const mapOptions = {
        center: new naver.maps.LatLng(37.282, 127.014),
        zoom: 13,
        mapTypeControl: true,
        zoomControl: true, // 줌 조절 버튼 활성화
        minZoom: 10,
    };
    
    map = new naver.maps.Map('map', mapOptions);

    // 2. 관광지 데이터 기반 마커 생성
    if (spotItems && spotItems.length > 0) {
        spotItems.forEach(item => {
            if (item.mapx && item.mapy) {
                const position = new naver.maps.LatLng(item.mapy, item.mapx);
                
                const marker = new naver.maps.Marker({
                    position: position,
                    map: map,
                    title: item.title,
                    animation: naver.maps.Animation.DROP
                });

                // 마커 클릭 시 나타날 정보창(InfoWindow) HTML 구성
                const infoWindow = new naver.maps.InfoWindow({
                    content: `
                        <div style="padding:15px; min-width:220px; line-height:1.5;">
                            <h4 style="margin:0 0 8px 0; color:#1a2b3c; font-weight:700;">${item.title}</h4>
                            <p style="font-size:13px; color:#666; margin-bottom:12px;">${item.addr1}</p>
                            <div style="display:flex; gap:8px;">
                                <a href="/detail/${item.contentid}?lang=kor" 
                                style="flex:1; text-align:center; font-size:13px; font-weight:bold; color:#fff; background:#1a2b3c; padding:8px 0; text-decoration:none; border-radius:6px;">
                                상세보기
                                </a>
                                
                                <a href="https://map.naver.com/v5/directions/?slng=&slat=&stext=${encodeURIComponent('내 위치')}&elng=${item.mapx}&elat=${item.mapy}&etext=${encodeURIComponent(item.title)}&menu=route" 
                                    target="_blank"
                                    style="flex:1; text-align:center; font-size:13px; font-weight:bold; color:#1a2b3c; background:#fff; border:1px solid #1a2b3c; padding:8px 0; text-decoration:none; border-radius:6px;">
                                    길찾기
                                </a>
                            </div>
                        </div>`
                });

                // 마커 클릭 이벤트 등록
                naver.maps.Event.addListener(marker, "click", function() {
                    // 열려있는 다른 정보창 닫기
                    infoWindows.forEach(iw => iw.close());
                    
                    if (infoWindow.getMap()) {
                        infoWindow.close();
                    } else {
                        infoWindow.open(map, marker);
                    }
                });

                markers.push(marker);
                infoWindows.push(infoWindow);
            }
        });
    }

    // 3. HTML5 Geolocation API를 활용한 사용자 현위치 파악
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const myLocation = new naver.maps.LatLng(lat, lng);

                // 현재 위치에 파란색 포인트 마커 표시
                new naver.maps.Marker({
                    position: myLocation,
                    map: map,
                    icon: {
                        content: '<div style="width:18px; height:18px; background:rgba(0, 102, 204, 0.9); border:2px solid #fff; border-radius:50%; box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
                        anchor: new naver.maps.Point(9, 9)
                    }
                });
                
                console.log("현위치 파악 성공");
            },
            () => { console.log("현위치 권한 거부됨 또는 지원하지 않음"); }
        );
    }
}