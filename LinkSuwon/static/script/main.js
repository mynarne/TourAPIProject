let map = null;
let markers = [];
let infoWindows = [];

/**
 * 지도 초기화 및 마커 표시
 * @param {Array} spotItems - Flask에서 넘겨받은 관광지 리스트
 */
function initLinkSuwonMap(spotItems) {
    // 1. 지도 생성 (수원 화성 행궁 중심)
    const mapOptions = {
        center: new naver.maps.LatLng(37.282, 127.014),
        zoom: 13,
        mapTypeControl: true,
        zoomControl: true, // 줌 조절 버튼 추가
        minZoom: 10,
    };
    
    map = new naver.maps.Map('map', mapOptions);

    // 2. 데이터가 있으면 마커 찍기
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

                // 마커 클릭 시 정보창(InfoWindow) 구성
                // 정보창에 상세페이지 이동 버튼
                const infoWindow = new naver.maps.InfoWindow({
                    content: `
                        <div style="padding:15px; min-width:220px; line-height:1.5;">
                            <h4 style="margin:0 0 5px 0; color:#002b5b;">${item.title}</h4>
                            <p style="font-size:13px; color:#666; margin-bottom:12px;">${item.addr1}</p>
                            <div style="display:flex; gap:5px;">
                                <a href="/detail/${item.contentid}?lang=kor" 
                                style="flex:1; text-align:center; font-size:12px; color:#fff; background:#002b5b; padding:7px 0; text-decoration:none; border-radius:3px;">
                                상세보기
                                </a>
                                
                                <!-- [2026 최신 규격] 이 링크는 네이버 지도가 '목적지'로 인식하도록 설계된 공식 파라미터여유 -->
                                <a href="https://map.naver.com/v5/directions/?slng=&slat=&stext=${encodeURIComponent('내 위치')}&elng=${item.mapx}&elat=${item.mapy}&etext=${encodeURIComponent(item.title)}&menu=route" 
                                    target="_blank"
                                    style="flex:1; text-align:center; font-size:12px; color:#002b5b; background:#fff; border:1px solid #002b5b; padding:7px 0; text-decoration:none; border-radius:3px;">
                                    길찾기
                                </a>
                            </div>
                        </div>`
                });

                naver.maps.Event.addListener(marker, "click", function() {
                    // 다른 열려있는 정보창 닫기
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

    // 3. [현위치 찾기] 기능 추가
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const myLocation = new naver.maps.LatLng(lat, lng);

                // 내 위치에 파란색 동그라미 마커 표시
                new naver.maps.Marker({
                    position: myLocation,
                    map: map,
                    icon: {
                        content: '<div style="width:16px; height:16px; background:rgba(0, 122, 255, 0.8); border:2px solid #fff; border-radius:50%; box-shadow:0 0 5px rgba(0,0,0,0.3);"></div>',
                        anchor: new naver.maps.Point(8, 8)
                    }
                });
                
                console.log("현위치 파악 성공!");
            },
            () => { console.log("현위치 권한 거부됨"); }
        );
    }
}