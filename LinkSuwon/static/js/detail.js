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
    // 1. 네이버 맵 객체 존재 여부 체크 (오프라인 방어막)
    if (typeof naver === 'undefined' || !naver.maps) {
        console.warn("--- [오프라인 감지] 네이버 지도 스크립트가 로드되지 않았습니다. 폴백 지형도 UI를 적용합니다. ---");
        const mapEl = document.getElementById('detail-map');
        if (mapEl) {
            mapEl.className = 'w-full h-48 rounded-xl overflow-hidden relative cursor-pointer group shadow-inner border border-outline-variant/20';
            mapEl.innerHTML = `
                <img src="https://images.unsplash.com/photo-1627068593444-245781a74d28?q=80&w=600" 
                     class="absolute inset-0 w-full h-full object-cover opacity-85 filter grayscale-[20%] group-hover:scale-105 transition-transform duration-500"
                     alt="Suwon Hwaseong Offline Guide Map">
                <div class="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-1.5 p-4 text-center text-white">
                    <span class="material-symbols-outlined text-3xl text-amber-400 animate-pulse">location_off</span>
                    <span class="text-xs font-black tracking-wide">수원화성 오프라인 지형 안내도</span>
                    <span class="text-[10px] text-white/80 leading-relaxed max-w-[220px]">
                        네트워크 연결 시 정밀 지도가 표시됩니다. 클릭 시 지형 이미지를 봅니다.
                    </span>
                </div>`;
            
            mapEl.onclick = function() {
                openOfflineMapModal();
            };
        }
        return;
    }

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

// ──────────────────────────────────────────────
// 실시간 수다방 (Live Tour Talk) 로직
// ──────────────────────────────────────────────

const ADJECTIVES = ['신난', '행복한', '차분한', '낭만적인', '빛나는', '산뜻한', '포근한', '신비로운', '명랑한', '기분좋은'];
const NOUNS = ['장안문', '방화수류정', '화홍문', '창룡문', '화성행궁', '연무대', '팔달문', '행리단길', '성곽길', '행궁광장'];

function generateRandomNickname() {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const num = Math.floor(100 + Math.random() * 900); // 100~999
    return `${adj}_${noun}${num}`;
}

function initTalkSection(contentId) {
    // 1. 닉네임 초기화 (localStorage에 저장된 닉네임 복원 또는 랜덤 생성)
    let savedNickname = localStorage.getItem('linksuwon:nickname');
    if (!savedNickname) {
        savedNickname = generateRandomNickname();
        localStorage.setItem('linksuwon:nickname', savedNickname);
    }
    
    const nickInput = document.getElementById('talk-nickname');
    if (nickInput) {
        nickInput.value = savedNickname;
        
        // 닉네임 변경 시 로컬스토리지에 실시간 저장
        nickInput.addEventListener('input', () => {
            localStorage.setItem('linksuwon:nickname', nickInput.value.trim());
        });
    }

    // 2. 한줄 톡 목록 불러오기
    loadTalks(contentId);
}

async function loadTalks(contentId) {
    const container = document.getElementById('talk-list-container');
    if (!container) return;

    try {
        const response = await fetch(`/spot/api/talk/${contentId}`);
        const result = await response.json();
        
        if (result.success) {
            if (result.talks.length === 0) {
                container.innerHTML = `
                    <div class="py-8 text-center text-xs text-on-surface-variant/60 italic">
                        아직 나눈 이야기가 없습니다. 첫 마디를 남겨보세요!
                    </div>`;
                return;
            }

            container.innerHTML = result.talks.map(talk => {
                let congestionBadge = '';
                if (talk.congestion === 'smooth') {
                    congestionBadge = '<span class="inline-flex items-center gap-0.5 bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full text-[10px] font-bold">🟢 원활</span>';
                } else if (talk.congestion === 'normal') {
                    congestionBadge = '<span class="inline-flex items-center gap-0.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded-full text-[10px] font-bold">🟡 보통</span>';
                } else if (talk.congestion === 'crowded') {
                    congestionBadge = '<span class="inline-flex items-center gap-0.5 bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full text-[10px] font-bold">🔴 혼잡</span>';
                }

                // 시간 포맷팅
                let dateStr = '';
                if (talk.created_at) {
                    const t = new Date(talk.created_at);
                    dateStr = t.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' });
                }

                return `
                    <div class="flex flex-col gap-1.5 p-3.5 bg-surface-container rounded-2xl border border-outline-variant/15 transition-all hover:scale-[1.01]">
                        <div class="flex justify-between items-center gap-2">
                            <span class="text-xs font-bold text-primary truncate max-w-[150px]">${talk.nickname}</span>
                            <div class="flex items-center gap-2">
                                ${congestionBadge}
                                <span class="text-[10px] text-outline">${dateStr}</span>
                            </div>
                        </div>
                        <p class="text-xs text-on-surface-variant leading-relaxed text-break-custom font-body">${talk.message}</p>
                    </div>`;
            }).join('');
        }
    } catch (e) {
        console.error("톡 로딩 에러:", e);
        container.innerHTML = `<div class="py-4 text-center text-xs text-red-500">이야기를 불러오는 중 에러가 발생했습니다.</div>`;
    }
}

async function submitTalk(contentId) {
    const nickInput = document.getElementById('talk-nickname');
    const msgInput = document.getElementById('talk-message');
    if (!nickInput || !msgInput) return;

    const nickname = nickInput.value.trim();
    const message = msgInput.value.trim();

    if (!nickname) {
        alert("닉네임을 입력해주세요.");
        return;
    }
    if (!message) {
        alert("메시지를 입력해주세요.");
        return;
    }

    // 혼잡도 감지
    let congestion = 'normal';
    const activeRadio = document.querySelector('input[name="talk-congestion"]:checked');
    if (activeRadio) {
        congestion = activeRadio.value;
    }

    try {
        const response = await fetch(`/spot/api/talk/${contentId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nickname, message, congestion })
        });

        const result = await response.json();
        if (result.success) {
            msgInput.value = ''; // 작성창 비우기
            loadTalks(contentId); // 목록 갱신
        } else {
            alert("메시지 등록 실패: " + result.message);
        }
    } catch (e) {
        console.error("메시지 전송 에러:", e);
        alert("메시지 전송에 실패했습니다.");
    }
}

// ──────────────────────────────────────────────
// 다국어 TTS 오디오 가이드 로직
// ──────────────────────────────────────────────

let ttsUtterance = null;
let isPlayingTTS = false;

// 음성 목록 미리 캐싱 (일부 브라우저 비동기 지연 해결용)
if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.getVoices();
}

function toggleTTS() {
    if (!('speechSynthesis' in window)) {
        alert("이 브라우저에서는 오디오 가이드를 지원하지 않습니다.");
        return;
    }

    const btn = document.getElementById('tts-toggle-btn');
    const icon = document.getElementById('tts-icon');
    const textEl = document.getElementById('tts-text');

    if (isPlayingTTS) {
        // 일시 정지 및 취소
        window.speechSynthesis.cancel();
        isPlayingTTS = false;
        if (icon) icon.textContent = 'play_arrow';
        if (textEl) textEl.textContent = 'Listen';
        if (btn) btn.classList.replace('bg-red-500', 'bg-primary');
    } else {
        // 낭독할 본문 확보
        const overviewEl = document.getElementById('detail-overview');
        if (!overviewEl) return;
        const textToSpeak = overviewEl.innerText.trim();

        if (!textToSpeak) {
            alert("읽을 설명글이 없습니다.");
            return;
        }

        ttsUtterance = new SpeechSynthesisUtterance(textToSpeak);

        // 재생 속도 설정
        const speedSelect = document.getElementById('tts-speed');
        if (speedSelect) {
            ttsUtterance.rate = parseFloat(speedSelect.value);
        } else {
            ttsUtterance.rate = 1.2; // 기본 속도 1.2배속
        }

        // 다국어 보이스 매핑
        const urlParams = new URLSearchParams(window.location.search);
        const currentLang = urlParams.get('lang') || 'kor';
        
        let targetLocale = 'ko-KR';
        if (currentLang === 'eng') targetLocale = 'en-US';
        else if (currentLang === 'jpn') targetLocale = 'ja-JP';
        else if (currentLang === 'chs') targetLocale = 'zh-CN';
        else if (currentLang === 'cht') targetLocale = 'zh-HK'; // 홍콩/대만 광둥어/번체

        const voices = window.speechSynthesis.getVoices();
        
        // 언어 로케일이 정확히 일치하거나 전반부가 겹치는 음성 매핑
        let selectedVoice = voices.find(v => v.lang === targetLocale);
        if (!selectedVoice) {
            // 차선책 매핑 (예: en-GB 등)
            const prefix = targetLocale.split('-')[0];
            selectedVoice = voices.find(v => v.lang.startsWith(prefix));
        }

        if (selectedVoice) {
            ttsUtterance.voice = selectedVoice;
            console.log(`--- [TTS] 매핑된 보이스: ${selectedVoice.name} (${selectedVoice.lang}) ---`);
        }

        // 이벤트 리스너 바인딩
        ttsUtterance.onend = () => {
            isPlayingTTS = false;
            if (icon) icon.textContent = 'play_arrow';
            if (textEl) textEl.textContent = 'Listen';
            if (btn) {
                btn.classList.add('bg-primary');
                btn.classList.remove('bg-red-500');
            }
        };

        ttsUtterance.onerror = (event) => {
            console.error("TTS 에러 발생:", event);
            isPlayingTTS = false;
            if (icon) icon.textContent = 'play_arrow';
            if (textEl) textEl.textContent = 'Listen';
            if (btn) {
                btn.classList.add('bg-primary');
                btn.classList.remove('bg-red-500');
            }
        };

        // 낭독 시작
        window.speechSynthesis.speak(ttsUtterance);
        isPlayingTTS = true;
        if (icon) icon.textContent = 'stop';
        if (textEl) textEl.textContent = 'Stop';
        if (btn) {
            btn.classList.remove('bg-primary');
            btn.classList.add('bg-red-500');
        }
    }
}

// 다른 페이지로 이동 시 재생 중인 TTS 자동 종료
window.addEventListener('beforeunload', () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
});

// ──────────────────────────────────────────────
// GPS 기반 수원화성 스탬프 투어 로직
// ──────────────────────────────────────────────

const STAMP_SPOTS = {
    '126227': { name: '방화수류정', lat: 37.287222, lng: 127.017778 },
    '126228': { name: '화성행궁', lat: 37.282778, lng: 127.013611 },
    '126229': { name: '창룡문', lat: 37.287222, lng: 127.025278 },
    '126230': { name: '장안문', lat: 37.289444, lng: 127.013889 },
    '126231': { name: '팔달문', lat: 37.277222, lng: 127.016944 },
    '126232': { name: '연무대 (동장대)', lat: 37.286944, lng: 127.023333 },
    '126233': { name: '수원화성박물관', lat: 37.282778, lng: 127.019444 },
    '126234': { name: '서장대', lat: 37.283889, lng: 127.008889 }
};

let currentSpotId = null;

// 스탬프 도장판 초기화
function initStampButton(contentId) {
    currentSpotId = contentId;
    const targetSpot = STAMP_SPOTS[contentId];
    if (!targetSpot) return; // 8대 명소가 아니면 종료

    const stampContainer = document.getElementById('detail-stamp-container');
    if (stampContainer) {
        stampContainer.classList.remove('hidden'); // 활성화
    }

    const savedStamps = JSON.parse(localStorage.getItem('linksuwon:stamps') || '[]');
    if (savedStamps.includes(contentId)) {
        markStampAsCompleted();
    }
}

// 획득 상태 UI 반영
function markStampAsCompleted() {
    const btn = document.getElementById('detail-stamp-btn');
    const icon = document.getElementById('stamp-btn-icon');
    const textEl = document.getElementById('stamp-btn-text');

    if (btn && textEl) {
        btn.disabled = true;
        btn.classList.remove('bg-amber-500', 'hover:bg-amber-600');
        btn.classList.add('bg-green-600', 'cursor-not-allowed', 'opacity-90');
        if (icon) icon.textContent = 'verified';
        textEl.textContent = '🏵️ 스탬프 획득 완료! (Stamp Collected)';
    }
}

// 하버사인 공식 (위도/경도 간 거리 m 구하기)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // 지구 반경 (m)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // 거리 (m)
}

// GPS 연동 실시간 스탬프 획득 검증 시도
function tryStampInDetail() {
    if (!currentSpotId || !STAMP_SPOTS[currentSpotId]) return;

    const targetSpot = STAMP_SPOTS[currentSpotId];
    
    // GPS 로딩 얼럿 대용 버튼 상태 변환
    const btn = document.getElementById('detail-stamp-btn');
    const textEl = document.getElementById('stamp-btn-text');
    
    if (!btn || !textEl) return;
    const originalText = textEl.textContent;
    textEl.textContent = '🛰️ GPS 신호 수신 중...';
    btn.disabled = true;

    if (!navigator.geolocation) {
        alert("이 기기에서는 GPS 위치 정보 서비스를 지원하지 않습니다.");
        textEl.textContent = originalText;
        btn.disabled = false;
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            const distance = calculateDistance(userLat, userLng, targetSpot.lat, targetSpot.lng);

            console.log(`--- [스탬프 인증] 유저 좌표: ${userLat}, ${userLng} | 대상 좌표: ${targetSpot.lat}, ${targetSpot.lng} | 실거리: ${distance.toFixed(1)}m ---`);

            btn.disabled = false;
            textEl.textContent = originalText;

            // 반경 50미터 이내 허용
            if (distance <= 50) {
                saveStampToLocal(currentSpotId, targetSpot.name);
            } else {
                const distText = distance >= 1000 ? `${(distance / 1000).toFixed(2)}km` : `${distance.toFixed(0)}m`;
                const cheatConfirm = confirm(`인증에 실패했습니다. (명소로부터 ${distText} 떨어져 있음)\n\n※ 모의 GPS 테스트 또는 실내 감도 이슈가 있는 경우, 테스트 목적으로 강제 스탬프를 획득하시겠습니까?`);
                if (cheatConfirm) {
                    saveStampToLocal(currentSpotId, targetSpot.name);
                }
            }
        },
        (error) => {
            console.error("GPS 위치 수집 오류:", error);
            btn.disabled = false;
            textEl.textContent = originalText;
            
            const cheatConfirm = confirm(`GPS 위치 정보를 가져올 수 없습니다.\n\n※ 모의 GPS 테스트 또는 권한 이슈가 있는 경우, 테스트 목적으로 강제 스탬프를 획득하시겠습니까?`);
            if (cheatConfirm) {
                saveStampToLocal(currentSpotId, targetSpot.name);
            }
        },
        { enableHighAccuracy: true, timeout: 8000 }
    );
}

// 스탬프 로컬스토리지 저장 및 완료 처리
function saveStampToLocal(contentId, spotName) {
    const savedStamps = JSON.parse(localStorage.getItem('linksuwon:stamps') || '[]');
    if (!savedStamps.includes(contentId)) {
        savedStamps.push(contentId);
        localStorage.setItem('linksuwon:stamps', JSON.stringify(savedStamps));
    }
    
    // 도장 쾅! 효과 및 알럿
    alert(`🎉 축하합니다!\n'${spotName}' 스탬프를 획득하셨습니다!`);
    markStampAsCompleted();
}

// 주변 대중교통(버스정류장/지하철역) 실시간 정보 바로가기 딥링크
function showNearbyTransit() {
    if (!destLat || !destLng) {
        console.error("목적지 위치 정보가 세팅되지 않았습니다.");
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const currentLang = urlParams.get('lang') || 'kor';
    let langParam = 'ko';

    if (currentLang === 'eng') langParam = 'en';
    else if (currentLang === 'jpn') langParam = 'ja';
    else if (currentLang === 'chs') langParam = 'zh-Hans';
    else if (currentLang === 'cht') langParam = 'zh-Hant';

    // 네이버 지도에서 특정 위경도 주변의 버스 정류장 검색 쿼리 매핑
    const query = encodeURIComponent(`수원 ${destTitle} 주변 버스정류장`);
    const naverTransitUrl = `https://map.naver.com/v5/search/${query}?c=15,0,0,0,dh&lang=${langParam}`;

    window.open(naverTransitUrl, '_blank');
}

// 오프라인 정적 성곽 지형도 모달 열기
function openOfflineMapModal() {
    const modalId = 'offline-map-modal';
    let modal = document.getElementById(modalId);
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4';
        modal.innerHTML = `
            <button onclick="document.getElementById('${modalId}').remove()" 
                    class="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center border-0 hover:bg-white/20 active:scale-95 transition-all cursor-pointer">
                <span class="material-symbols-outlined">close</span>
            </button>
            <div class="w-full max-w-2xl overflow-auto max-h-[85vh] flex justify-center rounded-2xl bg-surface-container shadow-2xl p-1">
                <img src="https://images.unsplash.com/photo-1627068593444-245781a74d28?q=80&w=1200" 
                     class="max-w-none w-[600px] h-auto object-contain cursor-zoom-in rounded-xl transition-all duration-300" 
                     alt="Detailed Sightseeing Map"
                     onclick="toggleMapZoom(this)">
            </div>
            <p class="text-[11px] text-white/70 mt-3 font-semibold">※ 이미지를 탭하여 크기를 변경해 성곽 위치를 확인하세요.</p>
        `;
        document.body.appendChild(modal);
    }
}

function toggleMapZoom(img) {
    if (img.classList.contains('cursor-zoom-in')) {
        img.className = 'max-w-none w-[1200px] h-auto object-contain cursor-zoom-out rounded-xl transition-all duration-300';
        img.classList.replace('cursor-zoom-in', 'cursor-zoom-out');
    } else {
        img.className = 'max-w-none w-[600px] h-auto object-contain cursor-zoom-in rounded-xl transition-all duration-300';
        img.classList.replace('cursor-zoom-out', 'cursor-zoom-in');
    }
}