/**
 * record.js — LinkSuwon 여행 기록 타임라인
 * storage.js 의존 (getVisitRecords, deleteVisitRecord, updateVisitRecord, getSavedPlaces)
 */

const LANG = window.RECORD_PAGE_LANG || 'kor';

/* ──────────────────────────────────────────────
   다국어 사전
────────────────────────────────────────────── */
const T = {
    empty_title: {
        kor: '아직 기록이 없어요',
        eng: 'No records yet',
        jpn: 'まだ記録がありません',
        chs: '还没有记录',
        cht: '還沒有記錄'
    },
    empty_sub: {
        kor: '명소 페이지에서 방문 기록을 추가해보세요!',
        eng: 'Add visit logs from the Spots page!',
        jpn: 'スポットページから訪問記録を追加してみてください！',
        chs: '前往景点页面添加您的访问记录！',
        cht: '前往景點頁面添加您的訪問記錄！'
    },
    go_spots: {
        kor: '명소 보러 가기',
        eng: 'Browse Spots',
        jpn: 'スポットを見る',
        chs: '浏览景点',
        cht: '瀏覽景點'
    },
    edit: { kor: '수정', eng: 'Edit', jpn: '編集', chs: '编辑', cht: '編輯' },
    delete: { kor: '삭제', eng: 'Delete', jpn: '削除', chs: '删除', cht: '刪除' },
    save: { kor: '저장', eng: 'Save', jpn: '保存', chs: '保存', cht: '儲存' },
    cancel: { kor: '취소', eng: 'Cancel', jpn: 'キャンセル', chs: '取消', cht: '取消' },
    confirm_delete: {
        kor: '이 기록을 삭제할까요?',
        eng: 'Delete this record?',
        jpn: 'この記録を削除しますか？',
        chs: '确定删除此记录？',
        cht: '確定刪除此記錄？'
    },
    confirm_clear: {
        kor: '정말 전체 기록을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.',
        eng: 'Delete ALL records? This cannot be undone.',
        jpn: '本当に全記録を削除しますか？この操作は取り消せません。',
        chs: '确定删除所有记录？此操作无法撤销。',
        cht: '確定刪除所有記錄？此操作無法撤銷。'
    },
    no_memo: {
        kor: '메모 없음',
        eng: 'No memo written',
        jpn: 'メモなし',
        chs: '暂无备注',
        cht: '暫無備註'
    }
};

function t(key) {
    return (T[key] && (T[key][LANG] || T[key]['eng'])) || '';
}

/* ──────────────────────────────────────────────
   카테고리 매핑
────────────────────────────────────────────── */
const CAT_LABEL = {
    heritage: { kor: '유적지', eng: 'Heritage', jpn: '史跡', chs: '历史遗址', cht: '歷史遺址' },
    museum:   { kor: '박물관', eng: 'Museum',   jpn: '博物館', chs: '博物馆', cht: '博物館' },
    festival: { kor: '축제',   eng: 'Festival', jpn: 'フェスティバル', chs: '节庆', cht: '節慶' },
    food:     { kor: '음식점', eng: 'Food',     jpn: 'グルメ', chs: '美食', cht: '美食' },
    nature:   { kor: '자연',   eng: 'Nature',   jpn: '自然', chs: '自然', cht: '自然' },
    leisure:  { kor: '레저',   eng: 'Leisure',  jpn: 'レジャー', chs: '休闲', cht: '休閒' },
    market:   { kor: '쇼핑',   eng: 'Shopping', jpn: 'ショッピング', chs: '购物', cht: '購物' },
    stay:     { kor: '숙박',   eng: 'Stay',     jpn: '宿泊', chs: '住宿', cht: '住宿' },
    course:   { kor: '코스',   eng: 'Course',   jpn: 'コース', chs: '路线', cht: '路線' },
};

const CAT_ICON = {
    heritage: 'account_balance', museum: 'museum', festival: 'celebration',
    food: 'restaurant', nature: 'park', leisure: 'sports_tennis',
    market: 'shopping_bag', stay: 'hotel', course: 'route'
};

const CAT_COLOR = {
    heritage: '#8d4e26', museum: '#1a4fa0', festival: '#7a1fa0',
    food: '#92400e', nature: '#14532d', leisure: '#065f46',
    market: '#9f1239', stay: '#92400e', course: '#166534'
};

function inferCategory(title) {
    const t = (title || '').toLowerCase();
    if (t.includes('박물관') || t.includes('museum') || t.includes('미술관')) return 'museum';
    if (t.includes('갈비') || t.includes('식당') || t.includes('food') || t.includes('bonsuwon')) return 'food';
    if (t.includes('시장') || t.includes('market') || t.includes('쇼핑')) return 'market';
    if (t.includes('공원') || t.includes('park') || t.includes('호수') || t.includes('수류정') || t.includes('연못')) return 'nature';
    if (t.includes('숙소') || t.includes('hotel') || t.includes('stay')) return 'stay';
    return 'heritage';
}

function getCatLabel(cat) {
    const map = CAT_LABEL[cat] || CAT_LABEL['heritage'];
    return map[LANG] || map['eng'];
}

/* ──────────────────────────────────────────────
   페이지 초기화
────────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
    initUserUUID();
    renderTimeline();
    initOverallReview();
});

function initOverallReview() {
    const input = document.getElementById('travel-review-input');
    if (!input) return;

    // LocalStorage에서 기존 총평 복원
    const savedReview = localStorage.getItem('linksuwon:overallReview');
    if (savedReview) {
        input.value = savedReview;
    }

    // 입력 시 실시간으로 저장
    input.addEventListener('input', () => {
        localStorage.setItem('linksuwon:overallReview', input.value);
    });
}

function initUserUUID() {
    let uuid = localStorage.getItem('linksuwon_user_uuid');
    if (!uuid || !uuid.startsWith('LS-')) {
        const arr = new Uint32Array(4);
        window.crypto.getRandomValues(arr);
        uuid = 'LS-' + Array.from(arr).map(n => n.toString(36)).join('').substring(0, 12).toUpperCase();
        localStorage.setItem('linksuwon_user_uuid', uuid);
    }
    const el = document.getElementById('user-uuid-display');
    if (el) el.textContent = 'ID: ' + uuid;
}

/* ──────────────────────────────────────────────
   타임라인 렌더링
────────────────────────────────────────────── */
function renderTimeline() {
    const container = document.getElementById('timeline-container');
    if (!container) return;

    const records = getVisitRecords(); // storage.js

    // UI 요소 표시 제어
    const statsBar       = document.getElementById('stats-bar');
    const reviewSection  = document.getElementById('overall-review-section');
    const exportActions  = document.getElementById('export-actions');
    const clearAction    = document.getElementById('clear-action');

    if (records.length === 0) {
        // 빈 상태
        [statsBar, reviewSection, exportActions, clearAction].forEach(el => el && el.classList.add('hidden'));
        container.innerHTML = renderEmptyState();
        return;
    }

    // 통계 업데이트
    updateStats(records);
    [statsBar, reviewSection, exportActions, clearAction].forEach(el => el && el.classList.remove('hidden'));

    // 이미지 매핑: savedPlaces에서 firstimage 가져오기
    const savedPlaces = getSavedPlaces();
    const imageMap = {};
    savedPlaces.forEach(p => { if (p.contentid) imageMap[p.contentid] = p.firstimage; });

    container.innerHTML = records.map((rec, idx) => renderRecord(rec, idx, imageMap)).join('');
}

function renderEmptyState() {
    const lang = LANG;
    return `
        <div class="flex flex-col items-center justify-center py-20 text-center">
            <div class="float-icon w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mb-6 shadow-inner">
                <span class="material-symbols-outlined text-5xl text-outline">explore</span>
            </div>
            <h3 class="font-headline text-lg font-bold text-primary mb-2">${t('empty_title')}</h3>
            <p class="text-sm text-on-surface-variant mb-6 max-w-[260px] leading-relaxed">${t('empty_sub')}</p>
            <a href="/spot?lang=${lang}"
               class="inline-flex items-center gap-2 bg-primary text-on-primary font-bold text-sm px-6 py-3 rounded-xl text-decoration-none hover:opacity-90 transition-opacity">
                <span class="material-symbols-outlined text-[18px]">travel_explore</span>
                ${t('go_spots')}
            </a>
        </div>`;
}

function renderRecord(rec, idx, imageMap) {
    const cat   = inferCategory(rec.title);
    const icon  = CAT_ICON[cat] || 'location_on';
    const color = CAT_COLOR[cat] || '#8d4e26';
    const img   = rec.custom_image || imageMap[rec.contentid] || rec.firstimage || '';

    const dateStr = rec.visit_date
        ? new Date(rec.visit_date).toLocaleDateString(LANG === 'kor' ? 'ko-KR' : (LANG === 'jpn' ? 'ja-JP' : 'en-US'), { year:'numeric', month:'long', day:'numeric' })
        : rec.visit_date;

    return `
        <div class="relative flex items-start gap-4 group animate-reveal" style="animation-delay: ${idx * 70}ms;" id="item-${rec.id}">
            <!-- 타임라인 점 -->
            <div class="relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-transform duration-200 group-hover:scale-110"
                 style="background-color: ${color};">
                <span class="material-symbols-outlined text-white text-[18px]">${icon}</span>
            </div>

            <!-- 카드 -->
            <div class="flex-1 record-card bg-surface-container-lowest rounded-2xl overflow-hidden shadow-md ring-1 ring-outline-variant/15 mb-1">

                <!-- 썸네일 (이미지 있을 때) -->
                ${img ? `
                <div class="relative h-40 overflow-hidden group/thumb">
                    <div class="record-thumb absolute inset-0" style="background-image: url('${img}');"></div>
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    
                    <!-- 사진 업로드 카메라 오버레이 -->
                    <button onclick="triggerImageUpload('${rec.id}')"
                            class="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center border-0 transition-colors shadow-sm"
                            title="Upload Photo">
                        <span class="material-symbols-outlined text-[18px]">photo_camera</span>
                    </button>
                    
                    <span class="absolute bottom-3 left-3 text-xs font-bold text-white px-2.5 py-1 rounded-full" style="background-color:${color}aa;">
                        ${getCatLabel(cat)}
                    </span>
                </div>` : `
                <div class="px-4 pt-4 pb-0 flex justify-between items-center">
                    <span class="inline-block text-xs font-bold px-2.5 py-1 rounded-full cat-${cat}">
                        ${getCatLabel(cat)}
                    </span>
                    <!-- 사진이 없을 때도 올릴 수 있는 카메라 버튼 -->
                    <button onclick="triggerImageUpload('${rec.id}')"
                            class="w-7 h-7 rounded-full bg-surface-container hover:bg-outline-variant/30 text-outline flex items-center justify-center border-0 transition-colors"
                            title="Upload Photo">
                        <span class="material-symbols-outlined text-[16px]">add_a_photo</span>
                    </button>
                </div>`}

                <!-- 숨김 파일 인풋 -->
                <input type="file" id="file-input-${rec.id}" accept="image/*" class="hidden" onchange="uploadRecordImage('${rec.id}')">

                <div class="p-4">
                    <!-- 날짜 + 제목 -->
                    <p class="text-[11px] text-outline mb-1">${dateStr}</p>
                    <h3 class="font-headline text-base font-bold text-on-surface mb-2">${rec.title}</h3>

                    <!-- 메모 표시 -->
                    <div id="memo-text-${rec.id}" class="text-sm text-on-surface-variant leading-relaxed min-h-[1.5rem]">
                        ${rec.memo
                            ? `<span>${rec.memo}</span>`
                            : `<span class="italic text-outline text-xs">${t('no_memo')}</span>`
                        }
                    </div>

                    <!-- 메모 편집 영역 (숨김) -->
                    <div id="edit-area-${rec.id}" class="hidden mt-3 border-t border-outline-variant/10 pt-3">
                        <textarea id="edit-input-${rec.id}" rows="2"
                                  class="w-full bg-surface-container border border-outline-variant/30 rounded-xl p-3 text-xs outline-none resize-none mb-2">${rec.memo || ''}</textarea>
                        <div class="flex gap-2 justify-end">
                            <button onclick="saveEdit('${rec.id}')"
                                    class="bg-primary text-on-primary font-bold text-xs px-4 py-1.5 rounded-lg border-0">
                                ${t('save')}
                            </button>
                            <button onclick="cancelEdit('${rec.id}')"
                                    class="bg-surface-container text-on-surface-variant font-bold text-xs px-4 py-1.5 rounded-lg border border-outline-variant/30">
                                ${t('cancel')}
                            </button>
                        </div>
                    </div>

                    <!-- 액션 버튼 -->
                    <div id="actions-${rec.id}" class="flex gap-4 mt-4 pt-3 border-t border-outline-variant/10">
                        <button onclick="enableEdit('${rec.id}')"
                                class="flex items-center gap-1 text-xs font-bold text-primary hover:text-secondary transition-colors bg-transparent border-0 p-0">
                            <span class="material-symbols-outlined text-[14px]">edit</span>
                            ${t('edit')}
                        </button>
                        <button onclick="removeLog('${rec.id}')"
                                class="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 transition-colors bg-transparent border-0 p-0">
                            <span class="material-symbols-outlined text-[14px]">delete</span>
                            ${t('delete')}
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
}

/* ──────────────────────────────────────────────
   통계 바 업데이트
────────────────────────────────────────────── */
function updateStats(records) {
    const countEl = document.getElementById('stat-count');
    const daysEl  = document.getElementById('stat-days');
    const memoEl  = document.getElementById('stat-memo');

    if (countEl) countEl.textContent = records.length;

    // 고유 방문 날짜 수
    const uniqueDays = new Set(records.map(r => r.visit_date).filter(Boolean)).size;
    if (daysEl) daysEl.textContent = uniqueDays;

    // 메모 작성 수
    const memoCount = records.filter(r => r.memo && r.memo.trim()).length;
    if (memoEl) memoEl.textContent = memoCount;
}

/* ──────────────────────────────────────────────
   편집 / 저장 / 취소
────────────────────────────────────────────── */
function enableEdit(id) {
    document.getElementById(`memo-text-${id}`).classList.add('hidden');
    document.getElementById(`actions-${id}`).classList.add('hidden');
    document.getElementById(`edit-area-${id}`).classList.remove('hidden');
    document.getElementById(`edit-input-${id}`).focus();
}

function cancelEdit(id) {
    document.getElementById(`memo-text-${id}`).classList.remove('hidden');
    document.getElementById(`actions-${id}`).classList.remove('hidden');
    document.getElementById(`edit-area-${id}`).classList.add('hidden');
}

function saveEdit(id) {
    const newMemo = document.getElementById(`edit-input-${id}`).value;
    if (updateVisitRecord(id, newMemo)) {
        renderTimeline();
    }
}

/* ──────────────────────────────────────────────
   삭제
────────────────────────────────────────────── */
function removeLog(id) {
    if (!confirm(t('confirm_delete'))) return;
    if (deleteVisitRecord(id)) {
        // 카드 페이드 아웃
        const el = document.getElementById(`item-${id}`);
        if (el) {
            el.style.transition = 'opacity 0.3s, transform 0.3s';
            el.style.opacity = '0';
            el.style.transform = 'translateX(-16px)';
            setTimeout(() => renderTimeline(), 320);
        }
    }
}

function clearAllRecords() {
    if (!confirm(t('confirm_clear'))) return;
    localStorage.removeItem('linksuwon:visitRecords');
    localStorage.removeItem('linksuwon:overallReview');
    const input = document.getElementById('travel-review-input');
    if (input) input.value = '';
    renderTimeline();
}

/* ──────────────────────────────────────────────
   내보내기
────────────────────────────────────────────── */
function getExportFileName(ext) {
    const names = {
        kor: '나의_수원_여행_기록', eng: 'My_Suwon_Trip_Log',
        jpn: '私の_水原_旅行記録', chs: '我的_水原_旅行记录', cht: '我的_水原_旅行記錄'
    };
    return `${names[LANG] || names['eng']}.${ext}`;
}

function exportLogAsImage() {
    const area = document.getElementById('log-export-area');
    area.classList.add('exporting');
    html2canvas(area, { scale: 2, useCORS: true }).then(canvas => {
        area.classList.remove('exporting');
        const link = document.createElement('a');
        link.download = getExportFileName('png');
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}

function exportLogAsPDF() {
    const area = document.getElementById('log-export-area');
    area.classList.add('exporting');
    html2canvas(area, { scale: 2, useCORS: true }).then(canvas => {
        area.classList.remove('exporting');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfW = pdf.internal.pageSize.getWidth();
        const pdfH = (canvas.height * pdfW) / canvas.width;
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, pdfW - 20, pdfH - 20);
        pdf.save(getExportFileName('pdf'));
    });
}

/* ──────────────────────────────────────────────
   커스텀 사진 업로드
────────────────────────────────────────────── */
function triggerImageUpload(id) {
    const el = document.getElementById(`file-input-${id}`);
    if (el) el.click();
}

async function uploadRecordImage(id) {
    const fileInput = document.getElementById(`file-input-${id}`);
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) return;

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/record/upload', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        if (result.success) {
            // storage.js 의존: updateVisitRecord(id, memo, customImage)
            updateVisitRecord(id, null, result.url);
            renderTimeline();
        } else {
            alert("사진 업로드 실패: " + result.message);
        }
    } catch (e) {
        console.error("업로드 에러:", e);
        alert("사진 업로드 중 오류가 발생했습니다.");
    }
}

async function shareTripCourse() {
    const visitRecords = getVisitRecords();
    const overallReview = localStorage.getItem('linksuwon:overallReview') || '';

    if (!visitRecords || visitRecords.length === 0) {
        alert(LANG === 'kor' ? "공유할 방문 기록이 없습니다." : "No records to share.");
        return;
    }

    try {
        const response = await fetch('/record/api/share', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                overallReview: overallReview,
                visitRecords: visitRecords
            })
        });

        const result = await response.json();
        if (result.success) {
            const shareUrl = `${window.location.origin}/record/share/${result.share_id}?lang=${LANG}`;
            
            // 모바일 네이티브 공유 API 지원 여부 확인
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: LANG === 'kor' ? '나의 수원 여행 기록' : 'My Suwon Travel Log',
                        text: LANG === 'kor' ? '내가 다녀온 수원 여행 코스를 확인해보세요!' : 'Check out my Suwon trip itinerary!',
                        url: shareUrl
                    });
                    console.log("공유 성공");
                } catch (err) {
                    console.log("공유 취소 또는 에러:", err);
                }
            } else {
                // 클립보드에 링크 복사
                try {
                    await navigator.clipboard.writeText(shareUrl);
                    alert(LANG === 'kor' 
                        ? `공유 링크가 클립보드에 복사되었습니다!\n원하는 곳에 붙여넣어 공유하세요.\n\n${shareUrl}` 
                        : `Share link copied to clipboard!\n\n${shareUrl}`);
                } catch (clipErr) {
                    // Fallback
                    const input = document.createElement('input');
                    input.value = shareUrl;
                    document.body.appendChild(input);
                    input.select();
                    document.execCommand('copy');
                    document.body.removeChild(input);
                    alert(LANG === 'kor' 
                        ? `공유 링크:\n${shareUrl}\n\n이 주소를 복사해서 공유하세요.` 
                        : `Copy this link to share:\n${shareUrl}`);
                }
            }
        } else {
            alert((LANG === 'kor' ? "공유 링크 생성 실패: " : "Failed to create share link: ") + result.message);
        }
    } catch (e) {
        console.error("공유 에러:", e);
        alert(LANG === 'kor' ? "공유 중 오류가 발생했습니다." : "An error occurred while sharing.");
    }
}