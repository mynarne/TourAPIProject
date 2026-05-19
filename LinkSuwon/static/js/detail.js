/**
 * 상세 페이지 단일 마커 지도 초기화 함수
 * @param {number} mapY - 위도 (Latitude)
 * @param {number} mapX - 경도 (Longitude)
 * @param {string} title - 명소 이름
 */
function initDetailMap(mapY, mapX, title) {
    if (!mapX || !mapY) {
        console.error("좌표 데이터가 유효하지 않습니다.");
        return;
    }

    const position = new naver.maps.LatLng(mapY, mapX);

    const mapOptions = {
        center: position,
        zoom: 16,
        mapTypeControl: true,
        zoomControl: true
    };

    // detail.html에 있는 id="detail-map" 요소에 지도를 그립니다.
    const map = new naver.maps.Map('detail-map', mapOptions);

    // 단일 마커 표시
    new naver.maps.Marker({
        position: position,
        map: map,
        icon: {
            content: `
                <div style="padding:6px 10px; background:#1a2b3c; color:#fff; border-radius:6px; font-weight:bold; font-size:13px; box-shadow:0 2px 5px rgba(0,0,0,0.3);">
                    ${title}
                </div>`,
            anchor: new naver.maps.Point(20, 20)
        },
        animation: naver.maps.Animation.DROP
    });
}