/**
 * LinkSuwon LocalStorage Storage Manager
 * 
 * 로그인 없이 브라우저 단에서 관광지 즐겨찾기, 여행 기록, 최근 본 명소를 
 * 안전하고 지속성 있게 관리하는 모듈입니다.
 */

// LocalStorage Keys
const KEYS = {
    SAVED_PLACES: 'linksuwon:savedPlaces',
    VISIT_RECORDS: 'linksuwon:visitRecords',
    RECENT_PLACES: 'linksuwon:recentPlaces',
    LANGUAGE: 'linksuwon:language'
};

/**
 * [보안] XSS 공격을 방지하기 위한 문자열 정제 함수
 */
function sanitizeInput(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        "/": '&#x2F;'
    };
    const reg = /[&<>"'/]/ig;
    return text.replace(reg, (match) => map[match]);
}

/* ==========================================
   1. 즐겨찾기 관리 (Saved Places)
   ========================================== */

/**
 * 즐겨찾기에 등록된 전체 관광지 목록 조회
 */
function getSavedPlaces() {
    try {
        const data = localStorage.getItem(KEYS.SAVED_PLACES);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("즐겨찾기 로딩 에러:", e);
        return [];
    }
}

/**
 * 특정 관광지를 즐겨찾기에 추가
 * @param {Object} place { contentid, title, firstimage, addr1 }
 */
function savePlace(place) {
    if (!place || !place.contentid) return false;
    
    const saved = getSavedPlaces();
    // 중복 방지
    const exists = saved.some(item => item.contentid === place.contentid);
    if (!exists) {
        saved.push({
            contentid: place.contentid,
            title: sanitizeInput(place.title),
            firstimage: place.firstimage || '',
            addr1: sanitizeInput(place.addr1 || '')
        });
        localStorage.setItem(KEYS.SAVED_PLACES, JSON.stringify(saved));
        if (window.pushDataSyncSilently) { pushDataSyncSilently(); }
        return true;
    }
    return false;
}

/**
 * 즐겨찾기에서 특정 관광지 제거
 */
function removePlace(contentid) {
    if (!contentid) return false;
    let saved = getSavedPlaces();
    const originalLength = saved.length;
    saved = saved.filter(item => item.contentid !== contentid);
    
    if (saved.length !== originalLength) {
        localStorage.setItem(KEYS.SAVED_PLACES, JSON.stringify(saved));
        if (window.pushDataSyncSilently) { pushDataSyncSilently(); }
        return true;
    }
    return false;
}

/**
 * 즐겨찾기 등록 여부 판단
 */
function isPlaceSaved(contentid) {
    if (!contentid) return false;
    const saved = getSavedPlaces();
    return saved.some(item => item.contentid === contentid);
}


/* ==========================================
   2. 여행 기록 관리 (Visit Records)
   ========================================== */

/**
 * 전체 여행 기록 조회 (방문 시간 기준 역순 정렬)
 */
function getVisitRecords() {
    try {
        const data = localStorage.getItem(KEYS.VISIT_RECORDS);
        const records = data ? JSON.parse(data) : [];
        // 최근 등록순으로 정렬
        return records.sort((a, b) => b.id.localeCompare(a.id));
    } catch (e) {
        console.error("여행 기록 로딩 에러:", e);
        return [];
    }
}

/**
 * 여행 기록(방문지) 추가
 * @param {Object} record { contentid, title, visit_date, memo, lang }
 */
function addVisitRecord(record) {
    if (!record || !record.title) return false;
    
    const records = getVisitRecords();
    // 밀리초 단위 동시 다발적 생성 충돌을 방지하기 위해 랜덤 접미사를 붙인 고유 ID 부여
    const randomSuffix = Math.random().toString(36).substr(2, 5);
    const newRecord = {
        id: 'log_' + Date.now() + '_' + randomSuffix, // 고유 ID 부여
        contentid: record.contentid || '',
        title: sanitizeInput(record.title),
        visit_date: record.visit_date || new Date().toISOString().split('T')[0],
        firstimage: record.firstimage || '', // 챗봇 일정 저장 및 명소 상세 페이지를 위해 firstimage 필드 보존!
        memo: sanitizeInput(record.memo || ''),
        lang: record.lang || 'kor',
        created_at: new Date().toISOString()
    };
    
    records.push(newRecord);
    localStorage.setItem(KEYS.VISIT_RECORDS, JSON.stringify(records));
    if (window.pushDataSyncSilently) { pushDataSyncSilently(); }
    return newRecord;
}

/**
 * 여행 기록의 메모 수정
 */
function updateVisitRecord(id, newMemo, newCustomImage = null) {
    if (!id) return false;
    const records = getVisitRecords();
    const index = records.findIndex(item => item.id === id);
    
    if (index !== -1) {
        if (newMemo !== undefined && newMemo !== null) {
            records[index].memo = sanitizeInput(newMemo);
        }
        if (newCustomImage !== null) {
            records[index].custom_image = newCustomImage;
        }
        localStorage.setItem(KEYS.VISIT_RECORDS, JSON.stringify(records));
        if (window.pushDataSyncSilently) { pushDataSyncSilently(); }
        return true;
    }
    return false;
}

/**
 * 여행 기록 삭제
 */
function deleteVisitRecord(id) {
    if (!id) return false;
    let records = getVisitRecords();
    const originalLength = records.length;
    records = records.filter(item => item.id !== id);
    
    if (records.length !== originalLength) {
        localStorage.setItem(KEYS.VISIT_RECORDS, JSON.stringify(records));
        if (window.pushDataSyncSilently) { pushDataSyncSilently(); }
        return true;
    }
    return false;
}


/* ==========================================
   3. 최근 본 관광지 관리 (Recent Places)
   ========================================== */

/**
 * 최근 본 관광지 목록 조회 (최대 5개)
 */
function getRecentPlaces() {
    try {
        const data = localStorage.getItem(KEYS.RECENT_PLACES);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("최근 본 관광지 로딩 에러:", e);
        return [];
    }
}

/**
 * 최근 본 관광지 추가 (최대 5개 유지, 중복 시 최상단 이동)
 */
function addRecentPlace(place) {
    if (!place || !place.contentid) return false;
    
    let recent = getRecentPlaces();
    // 기존 존재 시 삭제 후 맨 앞으로
    recent = recent.filter(item => item.contentid !== place.contentid);
    recent.unshift({
        contentid: place.contentid,
        title: sanitizeInput(place.title),
        firstimage: place.firstimage || '',
        addr1: sanitizeInput(place.addr1 || ''),
        mapx: place.mapx || '',
        mapy: place.mapy || ''
    });
    
    // 최대 10개 유지 (오프라인 캐싱 범위 확대를 위해 10개로 확장)
    if (recent.length > 10) {
        recent = recent.slice(0, 10);
    }
    
    localStorage.setItem(KEYS.RECENT_PLACES, JSON.stringify(recent));
    return true;
}
