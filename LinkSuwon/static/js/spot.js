let map = null;
let markers = [];
let globalSpots = [];
let currentCategory = 'all';
let currentSearchQuery = '';
let currentSelectedSpotIndex = null;

// 모바일용 탭 상태 ('list' 또는 'map')
let currentMobileTab = 'list';

document.addEventListener("DOMContentLoaded", function() {
    const dataElement = document.getElementById('spot-data');
    if (dataElement) {
        globalSpots = JSON.parse(dataElement.textContent);
        
        // URL 파라미터에서 초기 검색어 복원 (메인 페이지 검색 연동)
        const urlParams = new URLSearchParams(window.location.search);
        const searchParam = urlParams.get('search');
        if (searchParam && searchParam.trim()) {
            currentSearchQuery = searchParam.trim();
            const searchInput = document.getElementById('spot-search-input');
            if (searchInput) searchInput.value = currentSearchQuery;
        }
        
        if (globalSpots && globalSpots.length > 0) {
            initLinkSuwonMap(globalSpots);
            renderPlacesList();
            updateMapMarkers(getFilteredSpots());
            
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
function getSpotCategory(item) {
    const title = item.title.toLowerCase();
    if (title.includes('박물관') || title.includes('museum') || title.includes('미술관') || title.includes('art')) return 'museum';
    if (title.includes('시장') || title.includes('market') || title.includes('갈비') || title.includes('street') || title.includes('food')) return 'market';
    if (title.includes('수류정') || title.includes('연못') || title.includes('park') || title.includes('lake') || title.includes('pond')) return 'nature';
    return 'heritage'; // 기본값
}

/**
 * 명소 목록 동적 렌더링 (Stitch 디자인 적용)
 */
function renderPlacesList() {
    const container = document.getElementById('places-list-container');
    if (!container) return;

    const filtered = getFilteredSpots();
    
    if (filtered.length === 0) {
        const lang = new URLSearchParams(window.location.search).get('lang') || 'kor';
        const noResultMsgs = {
            kor: '일치하는 명소가 없습니다.',
            eng: 'No matching places found.',
            jpn: '一致する場所が見つかりません。',
            chs: '没有找到相关景点。',
            cht: '沒有找到相關景點。'
        };
        container.innerHTML = `
            <div class="text-center py-12 text-muted">
                <span class="material-symbols-outlined text-4xl mb-2">search_off</span>
                <p class="small">${noResultMsgs[lang] || noResultMsgs['eng']}</p>
            </div>`;
        return;
    }

    let html = '';
    filtered.forEach(item => {
        const index = globalSpots.findIndex(s => s.contentid === item.contentid);
        const category = getSpotCategory(item);
        const isSaved = isPlaceSaved(item.contentid);
        const favIcon = isSaved ? 'bookmark' : 'bookmark_border';
        const favClass = isSaved ? 'text-secondary filled-icon' : 'text-on-surface';

        html += `
            <article class="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/20 shadow-md flex flex-col group hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div class="relative aspect-video w-full overflow-hidden bg-surface-container">
                    <img class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                         src="${item.firstimage ? item.firstimage : '/static/images/default.png'}" 
                         alt="${item.title}"/>
                    <div class="absolute top-4 left-4 bg-[#FDF2EB] text-secondary px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider backdrop-blur-sm bg-opacity-90">
                        ${category}
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

/**
 * 필터링된 데이터셋 획득
 */
function getFilteredSpots() {
    return globalSpots.filter(item => {
        const matchesCategory = currentCategory === 'all' || getSpotCategory(item) === currentCategory;
        const matchesSearch = item.title.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
                              item.addr1.toLowerCase().includes(currentSearchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });
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
    // 기존 마커 제거
    markers.forEach(m => m.setMap(null));
    markers = [];

    spots.forEach((item, idx) => {
        if (item.mapx && item.mapy) {
            const position = new naver.maps.LatLng(item.mapy, item.mapx);
            const marker = new naver.maps.Marker({
                position: position,
                map: map,
                title: item.title,
                icon: {
                    content: `
                        <div class="flex flex-col items-center cursor-pointer">
                            <span class="material-symbols-outlined text-primary text-[32px] drop-shadow-md" style="font-variation-settings: 'FILL' 1;">location_on</span>
                        </div>`,
                    anchor: new naver.maps.Point(16, 32)
                }
            });

            const index = globalSpots.findIndex(s => s.contentid === item.contentid);
            naver.maps.Event.addListener(marker, "click", function() {
                loadInlineSpotDetail(index);
            });

            markers.push(marker);
        }
    });
}

/**
 * 특정 명소 지도로 포커싱
 */
function focusOnMap(lat, lng, title) {
    const target = new naver.maps.LatLng(parseFloat(lat), parseFloat(lng));
    if (map) {
        map.setCenter(target);
        map.setZoom(15);
    }

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
                renderDrawerContent(item, data.overview, currentLang);
            } else {
                drawerContent.innerHTML = `<p class="text-danger text-center py-5">Failed to load details.</p>`;
            }
        })
        .catch(err => {
            console.error(err);
            drawerContent.innerHTML = `<p class="text-danger text-center py-5">Error loading details.</p>`;
        });

    if (map) {
        const targetLatLng = new naver.maps.LatLng(item.mapy, item.mapx);
        map.setCenter(targetLatLng);
        map.setZoom(15);
    }
}

/**
 * 드로어 내부 레이아웃 렌더링
 */
function renderDrawerContent(item, overview, lang) {
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
