let map = null;
let markers = [];
let globalSpots = [];
let currentCategory = 'all';
let currentSearchQuery = '';
let currentSelectedSpotIndex = null;

// 모바일용 탭 상태 ('list' 또는 'map')
let currentMobileTab = 'list';

// 추천 코스 모드 관련 변수
let currentCourse = null;
let coursePolylines = [];

// GPS 내 위치 기반 정렬 관련 변수
let isGpsSorted = false;
let userCoords = null;

const COURSES_DATA = {
    alley: {
        name: { kor: '행궁동 감성 골목 투어', eng: 'Haenggung-dong Romantic Alley Tour', jpn: '行宮洞レトロ感性路地ツアー', chs: '行宫洞文艺胡同之旅', cht: '行宮洞文藝胡同之旅' },
        spots: ['126228', '126233', '126227'] // 화성행궁, 수원화성박물관, 방화수류정
    },
    fortress: {
        name: { kor: '수원화성 성곽 완벽 정복', eng: 'Hwaseong Fortress Expedition', jpn: '水原華城城郭完全制覇', chs: '水原华城城墙完美之旅', cht: '水原華城城牆完美之旅' },
        spots: ['126230', '126232', '126229', '126234'] // 장안문, 연무대, 창룡문, 서장대
    },
    night: {
        name: { kor: '은은한 달빛 아래 성곽길 야경 산책', eng: 'Moonlit Fortress Night Walk', jpn: 'ロマンチック夜間城郭ライトアップ', chs: '月光下的城墙夜景漫步', cht: '月光下的城牆夜景漫步' },
        spots: ['126227', '126230', '126234'] // 방화수류정, 장안문, 서장대
    }
};

document.addEventListener("DOMContentLoaded", function() {
    const dataElement = document.getElementById('spot-data');
    if (dataElement) {
        globalSpots = JSON.parse(dataElement.textContent);
        
        const urlParams = new URLSearchParams(window.location.search);
        
        // URL 파라미터에서 초기 검색어 복원 (메인 페이지 검색 연동)
        const searchParam = urlParams.get('search');
        if (searchParam && searchParam.trim()) {
            currentSearchQuery = searchParam.trim();
            const searchInput = document.getElementById('spot-search-input');
            if (searchInput) searchInput.value = currentSearchQuery;
        }

        // 코스 파라미터 체크
        const courseParam = urlParams.get('course');
        if (courseParam && COURSES_DATA[courseParam]) {
            currentCourse = courseParam;
        }
        
        if (globalSpots && globalSpots.length > 0) {
            const filtered = getFilteredSpots();
            initLinkSuwonMap(filtered);
            renderPlacesList();
            
            // URL 파라미터 체크하여 탭 설정
            const tabParam = urlParams.get('tab');
            if (tabParam === 'map') {
                switchMobileTab('map');
            }
        }
    }
});

/**
 * 네이버 지도 초기화 및 마커 배치
 */
function initLinkSuwonMap(spots) {
    // 1. 네이버 맵 객체 존재 여부 체크 (오프라인 방어막)
    if (typeof naver === 'undefined' || !naver.maps) {
        console.warn("--- [오프라인 감지] 네이버 지도 스크립트가 로드되지 않았습니다. 폴백 지형도 UI를 적용합니다. ---");
        const mapEl = document.getElementById('naver-map');
        if (mapEl) {
            mapEl.className = 'absolute inset-0 w-full h-full relative flex flex-col items-center justify-center p-6 text-center text-white bg-slate-900 overflow-hidden';
            mapEl.innerHTML = `
                <img src="https://images.unsplash.com/photo-1627068593444-245781a74d28?q=80&w=1200" 
                     class="absolute inset-0 w-full h-full object-cover opacity-35 filter grayscale"
                     alt="Offline guide map">
                <div class="relative z-10 flex flex-col items-center gap-2">
                    <span class="material-symbols-outlined text-4xl text-amber-400 animate-pulse">location_off</span>
                    <h3 class="font-headline text-base font-bold">수원화성 오프라인 지형 정보</h3>
                    <p class="text-xs text-white/70 max-w-xs leading-relaxed">
                        현재 지도 서비스가 오프라인 상태입니다. 네트워크 연결 시 실시간 길찾기 및 네이버 인터랙티브 지도를 조회할 수 있습니다.
                    </p>
                </div>`;
        }
        return;
    }

    const mapOptions = {
        center: new naver.maps.LatLng(37.282, 127.014),
        zoom: 13,
        mapTypeControl: false,
        zoomControl: true,
        minZoom: 10
    };
    
    map = new naver.maps.Map('naver-map', mapOptions);

    updateMapMarkers(spots);
}

/**
 * 카테고리 분류 헬퍼
 */
// TourAPI contenttypeid 및 cat 코드 기반 카테고리 분류
const CATEGORY_MAP = {
    // contenttypeid 기반
    '12':  'heritage',  // 관광지
    '14':  'museum',    // 문화시설
    '15':  'festival',  // 축제/행사
    '25':  'course',    // 여행코스
    '28':  'leisure',   // 레포츠
    '32':  'stay',      // 숙박
    '38':  'market',    // 쇼핑
    '39':  'food',      // 음식점
    // 외국어 서비스 contenttypeid
    '76':  'heritage',  // 관광지 (외국어)
    '78':  'museum',    // 문화시설 (외국어)
    '79':  'festival',  // 축제 (외국어)
    '80':  'leisure',   // 레포츠 (외국어)
    '75':  'stay',      // 숙박 (외국어)
    '82':  'market',    // 쇼핑 (외국어)
    '83':  'food',      // 음식점 (외국어)
};

const CATEGORY_LABEL = {
    heritage: { kor: '유적지', eng: 'Heritage', jpn: '史跡', chs: '历史遗址', cht: '歷史遺址' },
    museum:   { kor: '박물관', eng: 'Museum',   jpn: '博物館', chs: '博物馆',   cht: '博物館' },
    festival: { kor: '축제',   eng: 'Festival', jpn: 'フェスティバル', chs: '节庆', cht: '節慶' },
    course:   { kor: '코스',   eng: 'Course',   jpn: 'コース', chs: '路线',   cht: '路線' },
    leisure:  { kor: '레저',   eng: 'Leisure',  jpn: 'レジャー', chs: '休闲',  cht: '休閒' },
    stay:     { kor: '숙박',   eng: 'Stay',     jpn: '宿泊',   chs: '住宿',   cht: '住宿' },
    market:   { kor: '쇼핑',   eng: 'Shopping', jpn: 'ショッピング', chs: '购物', cht: '購物' },
    food:     { kor: '음식점', eng: 'Food',     jpn: 'グルメ', chs: '美食',   cht: '美食' },
    nature:   { kor: '자연',   eng: 'Nature',   jpn: '自然',   chs: '自然',   cht: '自然' },
    exchange: { kor: '환전/ATM', eng: 'Exchange & ATM', jpn: '両替/ATM', chs: '换钱/ATM', cht: '換錢/ATM' },
};

function getSpotCategory(item) {
    // 환전/ATM 우선 분류 (cat 필드가 있거나 contentid가 90000번대인 경우)
    if (item.cat === 'exchange' || (item.contentid && String(item.contentid).startsWith('90000'))) return 'exchange';
    
    // 1순위: contenttypeid 필드
    if (item.contenttypeid && CATEGORY_MAP[String(item.contenttypeid)]) {
        return CATEGORY_MAP[String(item.contenttypeid)];
    }
    // 2순위: cat1 대분류 코드
    const cat1 = item.cat1 || '';
    if (cat1 === 'A01') return 'nature';    // 자연
    if (cat1 === 'A02') return 'heritage';  // 인문(문화/역사/종교)
    if (cat1 === 'A03') return 'leisure';   // 레포츠
    if (cat1 === 'A04') return 'market';    // 쇼핑
    if (cat1 === 'A05') return 'food';      // 음식
    if (cat1 === 'B02') return 'stay';      // 숙박
    // 3순위: 제목 키워드 fallback
    const title = (item.title || '').toLowerCase();
    if (title.includes('박물관') || title.includes('museum') || title.includes('미술관')) return 'museum';
    if (title.includes('시장') || title.includes('market') || title.includes('갈비') || title.includes('food')) return 'food';
    if (title.includes('공원') || title.includes('park') || title.includes('호수') || title.includes('lake')) return 'nature';
    return 'heritage';
}

function getCategoryLabel(category, lang) {
    const labels = CATEGORY_LABEL[category] || CATEGORY_LABEL['heritage'];
    return labels[lang] || labels['eng'];
}

// 카테고리별 배지 컬러 매핑
function getCategoryColor(category) {
    const colors = {
        heritage: 'bg-[#FDF2EB] text-[#8d4e26]',
        museum:   'bg-[#EBF2FD] text-[#1a4fa0]',
        festival: 'bg-[#FDF0FF] text-[#7a1fa0]',
        course:   'bg-[#F0FDF4] text-[#166534]',
        leisure:  'bg-[#ECFDF5] text-[#065f46]',
        stay:     'bg-[#FFF7ED] text-[#92400e]',
        market:   'bg-[#FFF1F2] text-[#9f1239]',
        food:     'bg-[#FFFBEB] text-[#92400e]',
        nature:   'bg-[#F0FDF4] text-[#14532d]',
        exchange: 'bg-[#F0FDFA] text-[#0f766e]',
    };
    return colors[category] || colors['heritage'];
}

/**
 * 명소 목록 동적 렌더링 (Stitch 디자인 적용)
 */
function renderPlacesList() {
    const container = document.getElementById('places-list-container');
    if (!container) return;

    const filtered = getFilteredSpots();
    
    // 코스 모드에서는 카테고리 바 숨기기
    const catBar = document.querySelector('.px-4.py-3.flex.gap-2.overflow-x-auto');
    if (catBar) {
        if (currentCourse) catBar.classList.add('hidden');
        else catBar.classList.remove('hidden');
    }

    let html = '';

    if (currentCourse && COURSES_DATA[currentCourse]) {
        const lang = new URLSearchParams(window.location.search).get('lang') || 'kor';
        const courseName = COURSES_DATA[currentCourse].name[lang] || COURSES_DATA[currentCourse].name['eng'];
        const exitText = { kor: '코스 종료', eng: 'Exit Course', jpn: 'コース終了', chs: '结束路线', cht: '結束路線' }[lang] || 'Exit';
        html += `
            <div class="bg-secondary/10 border border-secondary/20 rounded-2xl p-4 flex justify-between items-center mb-2">
                <div class="min-w-0 flex-1 pr-2">
                    <span class="text-[10px] font-bold text-secondary uppercase tracking-wider block mb-0.5">Active Course</span>
                    <h4 class="font-headline text-sm font-extrabold text-primary truncate">${courseName}</h4>
                </div>
                <button onclick="exitCourseMode()" class="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-xs font-bold border-0 transition-colors shrink-0">
                    ${exitText}
                </button>
            </div>
        `;
    }
    
    if (filtered.length === 0) {
        const lang = new URLSearchParams(window.location.search).get('lang') || 'kor';
        const noResultMsgs = {
            kor: '일치하는 명소가 없습니다.',
            eng: 'No matching places found.',
            jpn: '一致する場所が見つかりません。',
            chs: '没有找到相关景点。',
            cht: '沒有找到相關景點。'
        };
        container.innerHTML = html + `
            <div class="text-center py-12 text-muted">
                <span class="material-symbols-outlined text-4xl mb-2">search_off</span>
                <p class="small">${noResultMsgs[lang] || noResultMsgs['eng']}</p>
            </div>`;
        return;
    }

    // 카드 목록 시작

    filtered.forEach((item, idx) => {
        const index = globalSpots.findIndex(s => s.contentid === item.contentid);
        const category = getSpotCategory(item);
        const isSaved = isPlaceSaved(item.contentid);
        const favIcon = isSaved ? 'bookmark' : 'bookmark_border';
        const favClass = isSaved ? 'text-secondary filled-icon' : 'text-on-surface';

        html += `
            <article class="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/20 shadow-md flex flex-col group hover:shadow-lg transition-all duration-300 overflow-hidden animate-reveal" style="animation-delay: ${idx * 60}ms;">
                <div class="relative aspect-video w-full overflow-hidden bg-surface-container">
                    <img class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                         src="${item.firstimage ? item.firstimage : '/static/images/default.png'}" 
                         alt="${item.title}"
                         loading="lazy"
                         decoding="async"/>
                    <div class="absolute top-4 left-4 flex gap-1.5 items-center">
                        <div class="${getCategoryColor(category)} px-2.5 py-1 rounded-md text-xs font-bold tracking-wider backdrop-blur-sm bg-opacity-90">
                            ${getCategoryLabel(category, new URLSearchParams(window.location.search).get('lang') || 'kor')}
                        </div>
                        ${item.distance !== undefined ? `
                        <div class="bg-secondary/90 text-white px-2 py-1 rounded-md text-[10px] font-bold tracking-wider backdrop-blur-sm flex items-center gap-0.5 shadow-sm">
                            <span class="material-symbols-outlined text-[12px] font-extrabold align-middle">my_location</span>
                            <span>${item.distance < 1.0 ? `${Math.round(item.distance * 1000)}m` : `${item.distance.toFixed(1)}km`}</span>
                        </div>` : ''}
                    </div>
                    <button onclick="toggleFavoriteEvent(event, '${item.contentid}', '${item.title.replace(/'/g, "\\'")}', '${item.firstimage}', '${item.addr1.replace(/'/g, "\\'")}')" 
                            id="fav-btn-${item.contentid}"
                            class="absolute top-4 right-4 p-2 bg-surface-container-lowest/80 backdrop-blur-sm rounded-full ${favClass} hover:text-secondary transition-colors shadow-sm flex items-center justify-center">
                        <span class="material-symbols-outlined text-[20px]">${favIcon}</span>
                    </button>
                </div>
                <div class="p-5 flex flex-col gap-2">
                    <h3 class="font-headline text-lg font-bold text-on-surface group-hover:text-primary transition-colors">${item.title}</h3>
                    <p class="font-body text-sm text-on-surface-variant line-clamp-2">${item.addr1}</p>
                    
                    <div class="mt-4 pt-4 border-t border-outline-variant/10 flex justify-between items-center">
                        <button onclick="focusOnMap('${item.mapy}', '${item.mapx}', '${item.title.replace(/'/g, "\\'")}')" 
                                class="text-secondary font-bold text-sm hover:underline bg-transparent border-0 p-0">
                            ${currentLangText('view_map')}
                        </button>
                        <button onclick="loadInlineSpotDetail(${index})" 
                                class="bg-primary hover:bg-primary-container text-on-primary font-bold text-xs px-4 py-2 rounded-xl transition-colors border-0">
                            ${currentLangText('view_detail')}
                        </button>
                    </div>
                </div>
            </article>`;
    });

    container.innerHTML = html;
}

/**
 * 다국어 텍스트 대응 헬퍼
 */
function currentLangText(key) {
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get('lang') || 'kor';
    const dict = {
        view_map: { kor: '지도 보기', eng: 'View Map', jpn: '地図で見る', chs: '在地图上查看', cht: '在地圖上查看' },
        view_detail: { kor: '상세 보기', eng: 'View Detail', jpn: '詳細を見る', chs: '查看详情', cht: '查看詳情' }
    };
    return dict[key] ? (dict[key][lang] || dict[key]['eng']) : '';
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // 지구 반경 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // km 반환
}

// 한글 자모 분리 코드표 기반 초성 추출 유틸리티
function getChosung(str) {
    const cho = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
    let result = "";
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i) - 44032;
        if (code > -1 && code < 11172) {
            result += cho[Math.floor(code / 588)];
        } else {
            result += str.charAt(i);
        }
    }
    return result;
}

// Fuzzy / 초성 매칭 판단
function isFuzzyMatch(targetStr, queryStr, item = null) {
    if (!queryStr) return true; // 검색어가 비어있을 때는 무조건 노출
    if (!targetStr) return false;
    
    const targetLower = targetStr.toLowerCase();
    const queryLower = queryStr.trim().toLowerCase().replace(/\s+/g, ''); // 공백 제거

    // 1단계: 단순 문자열 부분 일치
    if (targetLower.replace(/\s+/g, '').includes(queryLower)) return true;

    // 2단계: "수원화성" 검색어 특별 보정 (수원화성 8대 명소는 어떤 언어 환경이든 ID 기반으로 통과)
    if (queryLower === '수원화성' || queryLower === 'suwonhwaseong' || queryLower === '화성' || queryLower === 'hwaseong') {
        const hwasungIds = ['126227', '126228', '126229', '126230', '126231', '126232', '126233', '126234'];
        if (item && item.contentid && hwasungIds.includes(String(item.contentid))) {
            return true;
        }
    }

    // 3단계: 입력값이 한글 초성으로만 구성되어 있는지 판단
    const isChosungQuery = /^[ㄱ-ㅎ\s]+$/.test(queryLower);
    if (isChosungQuery) {
        const targetCho = getChosung(targetLower);
        if (targetCho.includes(queryLower)) return true;
    }

    return false;
}

/**
 * 필터링된 데이터셋 획득
 */
function getFilteredSpots() {
    let result = [];
    if (currentCourse && COURSES_DATA[currentCourse]) {
        const courseSpotIds = COURSES_DATA[currentCourse].spots;
        result = courseSpotIds.map(id => globalSpots.find(item => String(item.contentid) === String(id))).filter(Boolean);
    } else {
        result = globalSpots.filter(item => {
            const matchesCategory = currentCategory === 'all' || getSpotCategory(item) === currentCategory;
            const matchesSearch = isFuzzyMatch(item.title, currentSearchQuery, item) ||
                                  isFuzzyMatch(item.addr1, currentSearchQuery, item);
            return matchesCategory && matchesSearch;
        });
    }

    // GPS 정렬 활성화 시 실시간 거리 기준 정렬
    if (isGpsSorted && userCoords) {
        result.forEach(item => {
            if (item.mapx && item.mapy) {
                item.distance = calculateDistance(userCoords.lat, userCoords.lng, parseFloat(item.mapy), parseFloat(item.mapx));
            } else {
                item.distance = Infinity;
            }
        });
        result.sort((a, b) => a.distance - b.distance);
    } else {
        result.forEach(item => delete item.distance);
    }

    return result;
}

/**
 * 실시간 검색 필터
 */
function filterPlaces() {
    currentSearchQuery = document.getElementById('spot-search-input').value;
    renderPlacesList();
    updateMapMarkers(getFilteredSpots());
}

/**
 * 카테고리 필터 선택
 */
function filterCategory(category) {
    currentCategory = category;
    
    // 카테고리 버튼 활성화 스타일 제어
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.classList.remove('bg-primary', 'text-on-primary', 'ring-primary');
        btn.classList.add('bg-surface', 'text-on-surface', 'ring-outline-variant/30');
    });
    
    const activeBtn = document.getElementById(`cat-${category}`);
    if (activeBtn) {
        activeBtn.classList.remove('bg-surface', 'text-on-surface', 'ring-outline-variant/30');
        activeBtn.classList.add('bg-primary', 'text-on-primary', 'ring-primary');
    }

    renderPlacesList();
    updateMapMarkers(getFilteredSpots());
}

/**
 * 지도 마커 업데이트
 */
function updateMapMarkers(spots) {
    // 1. 네이버 맵 객체 존재 여부 체크 (오프라인 방어막)
    if (typeof naver === 'undefined' || !naver.maps || !map) {
        console.warn("--- [오프라인 방어막] 네이버 지도 객체가 없어 마커 업데이트를 생략합니다. ---");
        return;
    }

    // 기존 마커 제거
    markers.forEach(m => m.setMap(null));
    markers = [];

    // 기존 코스 경로선 제거
    coursePolylines.forEach(line => line.setMap(null));
    coursePolylines = [];

    spots.forEach((item, idx) => {
        if (item.mapx && item.mapy) {
            const position = new naver.maps.LatLng(item.mapy, item.mapx);
            
            // 코스 모드일 때는 마커에 번호를 표시해 순서를 직관적으로 알 수 있게 함
            let markerContent = `
                <div class="flex flex-col items-center cursor-pointer relative" style="filter: drop-shadow(0px 3px 6px rgba(0,0,0,0.2));">
                    <span class="material-symbols-outlined text-primary text-[36px]" style="font-variation-settings: 'FILL' 1;">location_on</span>
                    <span class="absolute top-[7px] w-2.5 h-2.5 bg-white rounded-full"></span>
                </div>`;
            
            let anchorPoint = new naver.maps.Point(16, 32);
            
            if (currentCourse) {
                const rainbowColors = ['#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#007aff', '#5856d6', '#af52de'];
                const pinColor = rainbowColors[idx % rainbowColors.length];
                markerContent = `
                    <div class="flex flex-col items-center cursor-pointer relative" style="filter: drop-shadow(0px 3px 8px rgba(0,0,0,0.24));">
                        <div class="flex items-center justify-center rounded-full w-8 h-8 text-white font-extrabold text-xs border-2 border-white transition-transform hover:scale-110" 
                             style="background-color: ${pinColor}; box-shadow: 0 3px 8px rgba(0,0,0,0.2);">
                            ${idx + 1}
                        </div>
                        <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px]" 
                             style="border-t-color: ${pinColor}; margin-top: -1px;"></div>
                    </div>`;
                anchorPoint = new naver.maps.Point(16, 37);
            }

            const marker = new naver.maps.Marker({
                position: position,
                map: map,
                title: item.title,
                icon: {
                    content: markerContent,
                    anchor: anchorPoint
                }
            });

            const index = globalSpots.findIndex(s => s.contentid === item.contentid);
            naver.maps.Event.addListener(marker, "click", function() {
                loadInlineSpotDetail(index);
            });

            markers.push(marker);
        }
    });

    // 코스 모드 시 도보 경로 그리기 및 지도 포커스 자동 확대
    if (currentCourse && spots.length > 1) {
        const rainbowColors = ['#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#007aff', '#5856d6', '#af52de'];
        
        // 무지개 동선 구간별로 개별 Polyline 드로잉
        for (let i = 0; i < spots.length - 1; i++) {
            const p1 = new naver.maps.LatLng(spots[i].mapy, spots[i].mapx);
            const p2 = new naver.maps.LatLng(spots[i + 1].mapy, spots[i + 1].mapx);
            const color = rainbowColors[i % rainbowColors.length];
            
            const polyline = new naver.maps.Polyline({
                map: map,
                path: [p1, p2],
                strokeColor: color,
                strokeOpacity: 0.9,
                strokeWeight: 6, // 더욱 선명하게 굵기 상향
                strokeStyle: 'solid', // 실선으로 선명하게
                strokeLineCap: 'round',
                strokeLineJoin: 'round'
            });
            coursePolylines.push(polyline);
        }

        // 지도 뷰포트를 코스 전체 명소가 포함되도록 이동
        if (map) {
            const bounds = new naver.maps.LatLngBounds();
            pathCoords.forEach(coord => bounds.extend(coord));
            map.fitBounds(bounds);
        }
    }

    // 코스 진행 요약 카드 오버레이 업데이트
    updateCourseUI(spots);
}

/**
 * 특정 명소 지도로 포커싱
 */
function focusOnMap(lat, lng, title) {
    // 1. 네이버 맵 객체 존재 여부 체크 (오프라인 방어막)
    if (typeof naver === 'undefined' || !naver.maps || !map) {
        console.warn("--- [오프라인 방어막] 네이버 지도 객체가 없어 지도로 초점을 맞출 수 없습니다. ---");
        return;
    }
    const target = new naver.maps.LatLng(parseFloat(lat), parseFloat(lng));
    map.setCenter(target);
    map.setZoom(15);

    // 모바일인 경우 지도 탭으로 강제 전환
    if (window.innerWidth < 768) {
        switchMobileTab('map');
    }
}

/**
 * 모바일용 리스트 <-> 지도 탭 토글
 */
function switchMobileTab(tab) {
    currentMobileTab = tab;
    const listPane = document.getElementById('list-pane');
    const mapPane = document.getElementById('map-pane');
    const listTabBtn = document.getElementById('mobile-tab-list');
    const mapTabBtn = document.getElementById('mobile-tab-map');

    if (tab === 'list') {
        listPane.classList.remove('hidden');
        mapPane.classList.add('hidden', 'md:block');
        
        listTabBtn.classList.add('text-secondary', 'border-b-2', 'border-secondary');
        listTabBtn.classList.remove('text-on-surface-variant');
        mapTabBtn.classList.remove('text-secondary', 'border-b-2', 'border-secondary');
        mapTabBtn.classList.add('text-on-surface-variant');
    } else {
        listPane.classList.add('hidden');
        mapPane.classList.remove('hidden', 'md:block');
        
        mapTabBtn.classList.add('text-secondary', 'border-b-2', 'border-secondary');
        mapTabBtn.classList.remove('text-on-surface-variant');
        listTabBtn.classList.remove('text-secondary', 'border-b-2', 'border-secondary');
        listTabBtn.classList.add('text-on-surface-variant');
        
        // 지도 크기 업데이트 필수
        if (map) {
            setTimeout(() => {
                map.updateSize();
            }, 100);
        }
    }
}

/**
 * 상세 드로어(Drawer) 비동기 로드 및 활성화
 */
function loadInlineSpotDetail(index) {
    const item = globalSpots[index];
    if (!item) return;

    currentSelectedSpotIndex = index;
    
    const drawer = document.getElementById('spot-drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    const drawerContent = document.getElementById('drawer-content');

    // 드로어 노출 애니메이션 시작
    backdrop.classList.remove('hidden');
    drawer.classList.remove('translate-y-full');
    drawer.classList.add('translate-y-0');

    // 스피너 로더 노출
    drawerContent.innerHTML = `
        <div class="flex items-center justify-center py-10 text-primary">
            <div class="spinner-border spinner-border-sm mr-2" role="status"></div>
            <span class="small font-bold">Loading details...</span>
        </div>`;

    // 최근 본 장소 기록 추가
    addRecentPlace(item);

    // 상세 내용 비동기 Fetch
    const urlParams = new URLSearchParams(window.location.search);
    const currentLang = urlParams.get('lang') || 'kor';

    fetch(`/spot/api/detail/${item.contentid}?lang=${currentLang}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderDrawerContent(item, data, currentLang);
            } else {
                drawerContent.innerHTML = `<p class="text-danger text-center py-5">Failed to load details.</p>`;
            }
        })
        .catch(err => {
            console.error(err);
            drawerContent.innerHTML = `<p class="text-danger text-center py-5">Error loading details.</p>`;
        });

    if (typeof naver !== 'undefined' && naver.maps && map) {
        const targetLatLng = new naver.maps.LatLng(item.mapy, item.mapx);
        map.setCenter(targetLatLng);
        map.setZoom(15);
    }
}

/**
 * 드로어 내부 레이아웃 렌더링
 */
function renderDrawerContent(item, detailData, lang) {
    const overview = detailData.overview || '';
    const infocenter = detailData.infocenter || '';
    const usetime = detailData.usetime || '';
    const restdate = detailData.restdate || '';
    const parking = detailData.parking || '';
    const usefee = detailData.usefee || '';
    const drawerContent = document.getElementById('drawer-content');
    if (!drawerContent) return;

    const isSaved = isPlaceSaved(item.contentid);
    
    // 다국어 딕셔너리
    const txt = {
        fav_cancel: { kor: '★ 즐겨찾기 취소', eng: '★ Cancel Save', jpn: '★ お気に入り解除', chs: '★ 取消收藏', cht: '★ 取消收藏' },
        fav_save: { kor: '⭐ 즐겨찾기 저장', eng: '⭐ Save Place', jpn: '⭐ お気に入り追加', chs: '⭐ 收藏景点', cht: '⭐ 收藏景點' },
        add_log: { kor: '✍️ 방문 기록 추가', eng: '✍️ Add Log', jpn: '✍️ 訪問記録追加', chs: '✍️ 添加记录', cht: '✍️ 添加記錄' },
        visit_date: { kor: '📅 방문 날짜', eng: '📅 Visit Date', jpn: '📅 訪問日', chs: '📅 访问日期', cht: '📅 訪問日期' },
        review_memo: { kor: '✍️ 리뷰 메모', eng: '✍️ Review Memo', jpn: '✍️ メモ', chs: '✍️ 评价备注', cht: '✍️ 評價備註' },
        placeholder_memo: { kor: '방문 후기를 적어보세요...', eng: 'Write your review...', jpn: '旅行の感想を書いてください...', chs: '写下您的游玩评价...', cht: '寫下您的遊玩評價...' },
        save_btn: { kor: '기록 저장', eng: 'Save Log', jpn: '記録を保存', chs: '保存记录', cht: '儲存記錄' },
        ask_ai: { kor: 'AI 가이드에게 질문하기', eng: 'Ask AI Guide', jpn: 'AIガイドに質問する', chs: '咨询AI助手', cht: '諮詢AI助手' }
    };

    // 현재 언어의 텍스트 매핑 (유효하지 않으면 영어)
    const getTxt = (key) => txt[key][lang] || txt[key]['eng'];

    const favText = isSaved ? getTxt('fav_cancel') : getTxt('fav_save');
    const favBtnClass = isSaved ? 'bg-yellow-400 text-on-surface' : 'bg-surface text-on-surface ring-1 ring-outline-variant/30';
    
    drawerContent.innerHTML = `
        <div class="flex flex-col gap-4">
            <img class="w-full aspect-video object-cover rounded-2xl shadow-sm" src="${item.firstimage ? item.firstimage : '/static/images/default.png'}" alt="${item.title}">
            
            <div>
                <h4 class="font-headline text-xl font-extrabold text-primary mb-1">${item.title}</h4>
                <p class="text-xs text-outline flex items-center gap-1 mb-3">
                    <span class="material-symbols-outlined text-[14px]">location_on</span>
                    ${item.addr1}
                </p>
            </div>

            <!-- 상세 소개글 -->
            <div class="font-body text-sm text-on-surface-variant leading-relaxed border-t border-b border-outline-variant/10 py-3 my-1 max-h-48 overflow-y-auto no-scrollbar">
                ${overview}
            </div>

            <!-- 상세 정보 그리드 (API에서 가져온 데이터만 표시) -->
            ${ (infocenter || usetime || restdate || usefee || parking) ? `
            <div class="grid grid-cols-2 gap-2 text-xs">
                ${ infocenter ? `<div class="bg-surface-container rounded-xl p-3"><span class="font-bold text-primary block mb-0.5">📞 ${ {kor:'전화번호', eng:'Phone', jpn:'電話番号', chs:'电话', cht:'電話'}[lang]||'Phone' }</span><span class="text-on-surface-variant">${infocenter}</span></div>` : '' }
                ${ usetime ? `<div class="bg-surface-container rounded-xl p-3"><span class="font-bold text-primary block mb-0.5">⏰ ${ {kor:'이용시간', eng:'Hours', jpn:'営業時間', chs:'营业时间', cht:'營業時間'}[lang]||'Hours' }</span><span class="text-on-surface-variant">${usetime}</span></div>` : '' }
                ${ restdate ? `<div class="bg-surface-container rounded-xl p-3"><span class="font-bold text-primary block mb-0.5">🚫 ${ {kor:'휴무일', eng:'Closed', jpn:'休業日', chs:'休息日', cht:'休息日'}[lang]||'Closed' }</span><span class="text-on-surface-variant">${restdate}</span></div>` : '' }
                ${ usefee ? `<div class="bg-surface-container rounded-xl p-3"><span class="font-bold text-primary block mb-0.5">🎟️ ${ {kor:'입장료', eng:'Admission', jpn:'入場料', chs:'门票', cht:'門票'}[lang]||'Admission' }</span><span class="text-on-surface-variant">${usefee}</span></div>` : '' }
                ${ parking ? `<div class="bg-surface-container rounded-xl p-3 col-span-2"><span class="font-bold text-primary block mb-0.5">🅿️ ${ {kor:'주차', eng:'Parking', jpn:'駐車場', chs:'停车', cht:'停車'}[lang]||'Parking' }</span><span class="text-on-surface-variant">${parking}</span></div>` : '' }
            </div>` : '' }

            <!-- 액션 버튼 -->
            <div class="grid grid-cols-2 gap-3 mt-1">
                <button onclick="toggleDrawerFavorite('${item.contentid}')" 
                        id="drawer-fav-btn" 
                        class="py-3 rounded-xl font-bold text-xs transition-colors border-0 flex items-center justify-center gap-1 ${favBtnClass}">
                    ${favText}
                </button>
                <button class="py-3 bg-surface text-on-surface ring-1 ring-outline-variant/30 rounded-xl font-bold text-xs border-0 flex items-center justify-center gap-1"
                        onclick="toggleDrawerLogForm()">
                    ${getTxt('add_log')}
                </button>
            </div>

            <!-- 방문 기록 작성 폼 (기본 숨김) -->
            <div id="drawer-log-form" class="hidden border border-outline-variant/20 rounded-2xl p-4 bg-background mt-2">
                <label class="block text-xs font-bold text-primary mb-1">${getTxt('visit_date')}</label>
                <input type="date" id="quick-log-date" class="w-full bg-white border border-outline-variant/30 rounded-xl px-3 py-2 text-xs outline-none mb-3">
                
                <label class="block text-xs font-bold text-primary mb-1">${getTxt('review_memo')}</label>
                <textarea id="quick-log-memo" rows="2" class="w-full bg-white border border-outline-variant/30 rounded-xl px-3 py-2 text-xs outline-none resize-none mb-4" placeholder="${getTxt('placeholder_memo')}"></textarea>
                
                <button onclick="submitQuickLog()" class="w-full bg-success text-white font-bold text-xs py-2.5 rounded-xl border-0">${getTxt('save_btn')}</button>
            </div>

            <!-- AI 및 길찾기 액션 -->
            <div class="flex flex-col gap-2 mt-2">
                <a href="/chat?lang=${lang}&spot=${encodeURIComponent(item.title)}" class="w-full bg-primary text-on-primary font-bold text-xs py-3 rounded-xl text-center text-decoration-none flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined text-[18px]">smart_toy</span> ${getTxt('ask_ai')}
                </a>
            </div>
        </div>`;

    // 날짜 자동 세팅
    const dateInput = document.getElementById('quick-log-date');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
}

/**
 * 드로어 내 즐겨찾기 토글
 */
function toggleDrawerFavorite(contentid) {
    if (currentSelectedSpotIndex === null) return;
    const item = globalSpots[currentSelectedSpotIndex];
    
    toggleFavoriteEvent(null, item.contentid, item.title, item.firstimage, item.addr1);
    
    // 드로어 내부 버튼 갱신
    const favBtn = document.getElementById('drawer-fav-btn');
    if (favBtn) {
        const isSaved = isPlaceSaved(contentid);
        const urlParams = new URLSearchParams(window.location.search);
        const lang = urlParams.get('lang') || 'kor';
        
        const txt = {
            fav_cancel: { kor: '★ 즐겨찾기 취소', eng: '★ Cancel Save', jpn: '★ お気に入り解除', chs: '★ 取消收藏', cht: '★ 取消收藏' },
            fav_save: { kor: '⭐ 즐겨찾기 저장', eng: '⭐ Save Place', jpn: '⭐ お気に入り追加', chs: '⭐ 收藏景点', cht: '⭐ 收藏景點' }
        };
        const favText = isSaved ? (txt.fav_cancel[lang] || txt.fav_cancel['eng']) : (txt.fav_save[lang] || txt.fav_save['eng']);
        
        favBtn.className = `py-3 rounded-xl font-bold text-xs transition-colors border-0 flex items-center justify-center gap-1 ` +
                           (isSaved ? 'bg-yellow-400 text-on-surface' : 'bg-surface text-on-surface ring-1 ring-outline-variant/30');
        favBtn.innerHTML = favText;
    }
}

/**
 * 드로어 내 방문 기록 작성 폼 토글
 */
function toggleDrawerLogForm() {
    const form = document.getElementById('drawer-log-form');
    if (form) {
        form.classList.toggle('hidden');
    }
}

/**
 * 드로어 내 방문 기록 제출
 */
function submitQuickLog() {
    if (currentSelectedSpotIndex === null) return;
    const item = globalSpots[currentSelectedSpotIndex];
    
    const visitDate = document.getElementById('quick-log-date').value;
    const memo = document.getElementById('quick-log-memo').value;
    const urlParams = new URLSearchParams(window.location.search);
    const currentLang = urlParams.get('lang') || 'kor';

    const success = addVisitRecord({
        contentid: item.contentid,
        title: item.title,
        visit_date: visitDate,
        memo: memo,
        lang: currentLang
    });

    if (success) {
        alert(currentLang === 'kor' ? '방문 기록이 타임라인에 추가되었습니다!' : 'Log added to your timeline!');
        toggleDrawerLogForm();
    } else {
        alert('Failed to save log.');
    }
}

/**
 * 카드/드로어 연동 즐겨찾기 상태 변경 공통 리스너
 */
function toggleFavoriteEvent(event, contentid, title, firstimage, addr1) {
    if (event) event.stopPropagation();

    const btn = document.getElementById(`fav-btn-${contentid}`);
    const isSaved = isPlaceSaved(contentid);

    if (isSaved) {
        removePlace(contentid);
        if (btn) {
            btn.className = "absolute top-4 right-4 p-2 bg-surface-container-lowest/80 backdrop-blur-sm rounded-full text-on-surface hover:text-secondary transition-colors shadow-sm flex items-center justify-center";
            btn.innerHTML = `<span class="material-symbols-outlined text-[20px]">bookmark_border</span>`;
        }
    } else {
        savePlace({ contentid, title, firstimage, addr1 });
        if (btn) {
            btn.className = "absolute top-4 right-4 p-2 bg-surface-container-lowest/80 backdrop-blur-sm rounded-full text-secondary filled-icon hover:text-secondary transition-colors shadow-sm flex items-center justify-center";
            btn.innerHTML = `<span class="material-symbols-outlined text-[20px]">bookmark</span>`;
        }
    }
}

/**
 * 드로어 닫기
 */
function closeDrawer() {
    currentSelectedSpotIndex = null;
    const drawer = document.getElementById('spot-drawer');
    const backdrop = document.getElementById('drawer-backdrop');

    if (drawer && backdrop) {
        drawer.classList.remove('translate-y-0');
        drawer.classList.add('translate-y-full');
        backdrop.classList.add('hidden');
    }
}

/**
 * 코스 진행 현황 오버레이 UI 업데이트
 */
function updateCourseUI(spots) {
    const pane = document.getElementById('map-pane');
    if (!pane) return;

    // 기존 오버레이 제거
    const existing = document.getElementById('course-floating-card');
    if (existing) existing.remove();

    if (!currentCourse || !COURSES_DATA[currentCourse]) return;

    const courseInfo = COURSES_DATA[currentCourse];
    const lang = new URLSearchParams(window.location.search).get('lang') || 'kor';
    const courseName = courseInfo.name[lang] || courseInfo.name['eng'];
    const exitText = { kor: '코스 종료', eng: 'Exit Course', jpn: 'コース終了', chs: '结束路线', cht: '結束路線' }[lang] || 'Exit';

    const card = document.createElement('div');
    card.id = 'course-floating-card';
    // 지도 상단에 절대좌표 배치
    card.className = 'absolute top-4 left-4 right-4 md:left-6 md:right-auto md:w-80 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-outline-variant/20 z-20 flex flex-col gap-3 transition-all duration-300';

    // 코스 단계 리스트 HTML 생성
    const stepsHtml = spots.map((s, i) => `
        <div class="flex items-center gap-2">
            <span class="w-5 h-5 rounded-full bg-secondary text-white text-[10px] font-bold flex items-center justify-center shrink-0">${i+1}</span>
            <span class="text-xs font-bold text-primary truncate flex-1 cursor-pointer hover:underline" onclick="focusOnMap('${s.mapy}', '${s.mapx}', '${s.title.replace(/'/g, "\\'")}')">
                ${s.title}
            </span>
        </div>
    `).join('<div class="w-[1px] h-3 bg-outline-variant/40 ml-2.5 my-0.5"></div>');

    card.innerHTML = `
        <div class="flex justify-between items-center border-b border-outline-variant/15 pb-2">
            <div class="min-w-0 flex-1 pr-2">
                <span class="text-[9px] font-extrabold uppercase tracking-wider text-secondary block mb-0.5">Course Mode</span>
                <h4 class="font-headline text-xs font-extrabold text-primary truncate">${courseName}</h4>
            </div>
            <button onclick="exitCourseMode()" class="px-2.5 py-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg text-[10px] font-bold border-0 transition-colors shrink-0">
                ${exitText}
            </button>
        </div>
        <div class="flex flex-col py-1">
            ${stepsHtml}
        </div>
    `;
    
    pane.appendChild(card);
}

/**
 * 코스 모드 비활성화 및 화면 리셋
 */
function exitCourseMode() {
    currentCourse = null;

    // URL 파라미터에서 course 제거
    const url = new URL(window.location.href);
    url.searchParams.delete('course');
    window.history.pushState({}, '', url);

    // 필터 리로드 및 마커 갱신
    renderPlacesList();
    updateMapMarkers(getFilteredSpots());

    // 코스 UI 제거
    const card = document.getElementById('course-floating-card');
    if (card) card.remove();

    // 지도 원상 복구 (기본 화성행궁 위치)
    if (typeof naver !== 'undefined' && naver.maps && map) {
        map.setCenter(new naver.maps.LatLng(37.282, 127.014));
        map.setZoom(13);
    }
}

/**
 * GPS 기반 내 위치 정렬 토글 제어
 */
function toggleGpsSort() {
    const btn = document.getElementById('gps-sort-btn');
    const btnText = document.getElementById('gps-btn-text');
    const statusEl = document.getElementById('gps-status');
    const lang = new URLSearchParams(window.location.search).get('lang') || 'kor';

    const msgs = {
        kor: {
            btn_on: '거리순 정렬 끄기',
            btn_off: '내 위치 기준 정렬',
            acquiring: '위치 획득 중...',
            denied: '위치 권한 거부됨',
            unavailable: '위치 제공 차단됨',
            timeout: '위치 요청 초과됨',
            error: '위치 로드 실패',
            success: '연동됨'
        },
        eng: {
            btn_on: 'Turn Off Distance Sort',
            btn_off: 'Sort by Distance',
            acquiring: 'Locating...',
            denied: 'Permission Denied',
            unavailable: 'GPS Unavailable',
            timeout: 'Request Timeout',
            error: 'GPS Failed',
            success: 'GPS Synced'
        },
        jpn: {
            btn_on: '距離順をオフ',
            btn_off: '距離順に整列',
            acquiring: '位置取得中...',
            denied: '権限がありません',
            unavailable: '取得できません',
            timeout: '時間切れ',
            error: '取得失敗',
            success: '同期完了'
        },
        chs: {
            btn_on: '关闭距离排序',
            btn_off: '按距离排序',
            acquiring: '定位中...',
            denied: '权限拒绝',
            unavailable: '定位不可用',
            timeout: '定位超时',
            error: '定位失败',
            success: '定位成功'
        },
        cht: {
            btn_on: '關閉距離排序',
            btn_off: '按距離排序',
            acquiring: '定位中...',
            denied: '權限拒絕',
            unavailable: '定位不可用',
            timeout: '定位超時',
            error: '定位失敗',
            success: '定位成功'
        }
    };

    const currentMsg = msgs[lang] || msgs['eng'];

    if (isGpsSorted) {
        isGpsSorted = false;
        userCoords = null;

        if (btn) {
            btn.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-outline-variant/30 bg-surface-container hover:bg-outline-variant/30 font-bold transition-all text-on-surface-variant cursor-pointer";
        }
        if (btnText) btnText.textContent = currentMsg.btn_off;
        if (statusEl) statusEl.textContent = '';
        
        renderPlacesList();
        updateMapMarkers(getFilteredSpots());
    } else {
        if (!navigator.geolocation) {
            alert(lang === 'kor' ? '이 브라우저는 위치 조회를 지원하지 않습니다.' : 'Geolocation not supported.');
            return;
        }

        if (statusEl) statusEl.textContent = currentMsg.acquiring;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                isGpsSorted = true;
                userCoords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                if (btn) {
                    btn.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-secondary bg-secondary/10 hover:bg-secondary/15 font-bold transition-all text-secondary cursor-pointer shadow-sm";
                }
                if (btnText) btnText.textContent = currentMsg.btn_on;
                if (statusEl) statusEl.textContent = `🟢 ${currentMsg.success}`;

                renderPlacesList();
                updateMapMarkers(getFilteredSpots());
            },
            (error) => {
                let errText = currentMsg.error;
                if (error.code === error.PERMISSION_DENIED) errText = currentMsg.denied;
                else if (error.code === error.POSITION_UNAVAILABLE) errText = currentMsg.unavailable;
                else if (error.code === error.TIMEOUT) errText = currentMsg.timeout;

                if (statusEl) statusEl.textContent = `🔴 ${errText}`;
            },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
        );
    }
}


