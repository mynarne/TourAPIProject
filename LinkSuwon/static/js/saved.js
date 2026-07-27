/**
 * saved.js — LinkSuwon 즐겨찾기 페이지
 * storage.js 의존 (getSavedPlaces, removePlace)
 */

const LANG = window.SAVED_PAGE_LANG || 'kor';
const SPOT_URL = window.SAVED_PAGE_SPOT_URL || '/spot/';

/* ── 카테고리 ── */
const CAT_MAP_SAVED = {
    '12': 'heritage', '14': 'museum', '15': 'festival',
    '28': 'leisure',  '32': 'stay',   '38': 'market', '39': 'food',
    '76': 'heritage', '78': 'museum', '79': 'festival',
    '80': 'leisure',  '75': 'stay',   '82': 'market', '83': 'food',
};
const CAT_LABEL_SAVED = {
    heritage: { kor: '유적지', eng: 'Heritage', jpn: '史跡',     chs: '历史遗址', cht: '歷史遺址' },
    museum:   { kor: '박물관', eng: 'Museum',   jpn: '博物館',   chs: '博物馆',   cht: '博物館' },
    festival: { kor: '축제',   eng: 'Festival', jpn: 'フェス',   chs: '节庆',     cht: '節慶' },
    food:     { kor: '음식점', eng: 'Food',     jpn: 'グルメ',   chs: '美食',     cht: '美食' },
    nature:   { kor: '자연',   eng: 'Nature',   jpn: '自然',     chs: '自然',     cht: '自然' },
    leisure:  { kor: '레저',   eng: 'Leisure',  jpn: 'レジャー', chs: '休闲',     cht: '休閒' },
    market:   { kor: '쇼핑',   eng: 'Shopping', jpn: 'ショッピング', chs: '购物', cht: '購物' },
    stay:     { kor: '숙박',   eng: 'Stay',     jpn: '宿泊',     chs: '住宿',     cht: '住宿' },
};

function inferCatSaved(place) {
    if (place.contenttypeid && CAT_MAP_SAVED[String(place.contenttypeid)]) {
        return CAT_MAP_SAVED[String(place.contenttypeid)];
    }
    const t = (place.title || '').toLowerCase();
    if (t.includes('박물관') || t.includes('museum') || t.includes('미술관')) return 'museum';
    if (t.includes('갈비') || t.includes('식당') || t.includes('food'))    return 'food';
    if (t.includes('시장') || t.includes('market'))                          return 'market';
    if (t.includes('공원') || t.includes('park') || t.includes('호수'))     return 'nature';
    return 'heritage';
}

function getCatLabelSaved(cat) {
    return (CAT_LABEL_SAVED[cat] || CAT_LABEL_SAVED.heritage)[LANG] || (CAT_LABEL_SAVED[cat] || CAT_LABEL_SAVED.heritage).eng;
}

/* ── 다국어 ── */
const TL = {
    empty_title:   { kor: '아직 저장된 장소가 없어요', eng: 'No saved places yet', jpn: 'まだ保存された場所はありません', chs: '还没有收藏的景点', cht: '還沒有收藏的景點' },
    empty_sub:     { kor: '명소 탭에서 ⭐를 눌러 저장해보세요!', eng: 'Tap ⭐ on any spot to save it!', jpn: 'スポットタブで⭐をタップして保存してください！', chs: '在景点标签页点击⭐收藏！', cht: '在景點標籤頁點擊⭐收藏！' },
    go_spots:      { kor: '명소 탐색하기', eng: 'Browse Spots', jpn: 'スポットを見る', chs: '浏览景点', cht: '瀏覽景點' },
    remove:        { kor: '삭제', eng: 'Remove', jpn: '削除', chs: '删除', cht: '刪除' },
    visit_log:     { kor: '기록 추가', eng: 'Add Log', jpn: '記録追加', chs: '添加记录', cht: '添加記錄' },
    ask_ai:        { kor: 'AI 질문', eng: 'Ask AI', jpn: 'AI質問', chs: 'AI咨询', cht: 'AI諮詢' },
    confirm_remove:{ kor: '즐겨찾기에서 삭제할까요?', eng: 'Remove from saved?', jpn: 'お気に入りから削除しますか？', chs: '确定从收藏中删除？', cht: '確定從收藏中刪除？' },
    confirm_clear: { kor: '전체 즐겨찾기를 삭제할까요?', eng: 'Clear all saved places?', jpn: '全てのお気に入りを削除しますか？', chs: '确定清除所有收藏？', cht: '確定清除所有收藏？' },
    no_result:     { kor: '검색 결과가 없습니다.', eng: 'No results found.', jpn: '検索結果がありません。', chs: '没有搜索结果。', cht: '沒有搜尋結果。' },
};
const tl = key => (TL[key] && (TL[key][LANG] || TL[key].eng)) || '';

/* ── 초기화 ── */
let allSaved = [];
window.addEventListener('DOMContentLoaded', () => {
    allSaved = getSavedPlaces();
    renderSaved(allSaved);
});

/* ── 렌더링 ── */
function renderSaved(places) {
    const grid  = document.getElementById('saved-grid');
    const badge = document.getElementById('saved-count-badge');
    const clearBtn = document.getElementById('clear-all-btn');

    const countLabel = { kor: '곳', eng: 'places', jpn: '件', chs: '个景点', cht: '個景點' };
    if (badge) badge.textContent = `${places.length} ${countLabel[LANG] || countLabel.eng}`;
    if (clearBtn) places.length > 0 ? clearBtn.classList.remove('hidden') : clearBtn.classList.add('hidden');

    if (!grid) return;

    if (places.length === 0) {
        grid.innerHTML = renderEmpty();
        return;
    }

    grid.innerHTML = places.map((p, idx) => renderCard(p, idx)).join('');
}

function renderEmpty() {
    return `
        <div class="col-span-2 flex flex-col items-center justify-center py-20 text-center">
            <div class="float-icon w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mb-6 shadow-inner">
                <span class="material-symbols-outlined text-5xl text-outline">bookmark_border</span>
            </div>
            <h3 class="font-headline text-lg font-bold text-primary mb-2">${tl('empty_title')}</h3>
            <p class="text-sm text-on-surface-variant mb-6 max-w-[260px] leading-relaxed">${tl('empty_sub')}</p>
            <a href="${SPOT_URL}"
               class="inline-flex items-center gap-2 bg-primary text-on-primary font-bold text-sm px-6 py-3 rounded-xl text-decoration-none hover:opacity-90 transition-opacity">
                <span class="material-symbols-outlined text-[18px]">travel_explore</span>
                ${tl('go_spots')}
            </a>
        </div>`;
}

function renderCard(place, idx) {
    const cat   = inferCatSaved(place);
    const label = getCatLabelSaved(cat);
    const img   = place.firstimage || '';
    const chatUrl = `/chat?lang=${LANG}&spot=${encodeURIComponent(place.title)}`;

    return `
        <article class="saved-card bg-surface-container-lowest rounded-2xl overflow-hidden shadow-md ring-1 ring-outline-variant/15 flex flex-col animate-reveal"
                 style="animation-delay: ${idx * 60}ms;"
                 id="saved-${place.contentid}">

            <!-- 썸네일 -->
            <div class="relative h-40 overflow-hidden bg-surface-container">
                ${img
                    ? `<img src="${img}" alt="${place.title}" class="thumb-img w-full h-full object-cover" loading="lazy" decoding="async">`
                    : `<div class="w-full h-full flex items-center justify-center">
                           <span class="material-symbols-outlined text-5xl text-outline/40">photo_camera</span>
                       </div>`
                }
                <!-- 카테고리 뱃지 -->
                <span class="absolute top-3 left-3 cat-${cat} text-[10px] font-bold px-2 py-0.5 rounded-full">
                    ${label}
                </span>
                <!-- 삭제 버튼 -->
                <button onclick="removeSaved('${place.contentid}')"
                        class="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full text-red-400 hover:text-red-600 hover:bg-white transition-colors border-0 shadow-sm">
                    <span class="material-symbols-outlined text-[18px]">close</span>
                </button>
            </div>

            <!-- 내용 -->
            <div class="p-4 flex flex-col flex-1">
                <h3 class="font-headline text-sm font-bold text-on-surface mb-1 line-clamp-1">${place.title}</h3>
                <p class="text-[11px] text-on-surface-variant line-clamp-2 flex-1 mb-3">
                    <span class="material-symbols-outlined text-[12px] align-middle">location_on</span>
                    ${place.addr1 || ''}
                </p>

                <!-- 액션 버튼 -->
                <div class="grid grid-cols-2 gap-2">
                    <button onclick="addLogFromSaved('${place.contentid}', '${place.title.replace(/'/g, "\\'")}', '${img}')"
                            class="py-2 rounded-xl border border-outline-variant/30 text-on-surface-variant font-bold text-[10px] flex items-center justify-center gap-1 bg-transparent hover:bg-surface-container transition-colors">
                        <span class="material-symbols-outlined text-[14px]">edit_note</span>
                        ${tl('visit_log')}
                    </button>
                    <a href="${chatUrl}"
                       class="py-2 rounded-xl bg-primary text-on-primary font-bold text-[10px] flex items-center justify-center gap-1 text-decoration-none hover:opacity-90 transition-opacity">
                        <span class="material-symbols-outlined text-[14px]">smart_toy</span>
                        ${tl('ask_ai')}
                    </a>
                </div>
            </div>
        </article>`;
}

/* ── 검색 필터 ── */
function filterSaved() {
    const q = document.getElementById('saved-search').value.trim().toLowerCase();
    if (!q) {
        renderSaved(allSaved);
        return;
    }
    const filtered = allSaved.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.addr1 || '').toLowerCase().includes(q)
    );

    const grid = document.getElementById('saved-grid');
    if (!grid) return;
    if (filtered.length === 0) {
        grid.innerHTML = `<p class="col-span-2 text-center text-sm text-on-surface-variant py-12">${tl('no_result')}</p>`;
    } else {
        grid.innerHTML = filtered.map(p => renderCard(p)).join('');
    }
}

/* ── 개별 삭제 ── */
function removeSaved(contentid) {
    if (!confirm(tl('confirm_remove'))) return;
    const el = document.getElementById(`saved-${contentid}`);
    if (el) {
        el.classList.add('removing');
        setTimeout(() => {
            removePlace(contentid); // storage.js
            allSaved = getSavedPlaces();
            renderSaved(allSaved);
        }, 300);
    }
}

/* ── 전체 삭제 ── */
function clearAllSaved() {
    if (!confirm(tl('confirm_clear'))) return;
    localStorage.removeItem('linksuwon:savedPlaces');
    allSaved = [];
    renderSaved([]);
}

/* ── 방문 기록 빠른 추가 ── */
function addLogFromSaved(contentid, title, firstimage) {
    const today = new Date().toISOString().split('T')[0];
    const memo = prompt(
        LANG === 'kor' ? `"${title}" 방문 메모를 입력하세요:` :
        LANG === 'eng' ? `Enter a visit memo for "${title}":` :
        LANG === 'jpn' ? `「${title}」の訪問メモを入力してください:` :
        `请输入"${title}"的访问备注:`,
        ''
    );
    if (memo === null) return; // 취소

    const result = addVisitRecord({  // storage.js
        contentid,
        title,
        visit_date: today,
        memo: memo,
        lang: LANG,
        firstimage
    });
    if (result) {
        const msg = {
            kor: '방문 기록이 추가됐습니다! 📔',
            eng: 'Visit log added! 📔',
            jpn: '訪問記録が追加されました！ 📔',
            chs: '访问记录已添加！ 📔',
            cht: '訪問記錄已添加！ 📔'
        };
        alert(msg[LANG] || msg.eng);
    }
}
