// 페이지 로드 시 UUID 초기화 및 로컬 데이터 로드
window.onload = function() {
    initUserUUID();
    renderTimeline();
};

/**
 * [보안 강화] 암호학적으로 안전한 고정 난수 기반 UUID 생성 알고리즘
 */
function generateSecureUUID() {
    const array = new Uint32Array(4);
    window.crypto.getRandomValues(array);
    
    let secureHex = '';
    for (let i = 0; i < array.length; i++) {
        secureHex += array[i].toString(36);
    }
    
    const timestamp = Date.now().toString(36);
    return 'LS-' + (secureHex + timestamp).substring(0, 16).toUpperCase();
}

/**
 * 사용자 브라우저에 고유 식별자(UUID)를 부여하고 LocalStorage에 저장
 */
function initUserUUID() {
    let userUUID = localStorage.getItem('linksuwon_user_uuid');
    
    if (!userUUID || !userUUID.startsWith('LS-')) {
        userUUID = generateSecureUUID();
        localStorage.setItem('linksuwon_user_uuid', userUUID);
    }
    
    const displayElement = document.getElementById('user-uuid-display');
    if (displayElement) {
        displayElement.innerText = 'ID: ' + userUUID.toUpperCase();
    }
}

/**
 * LocalStorage 데이터를 읽어와 타임라인을 동적으로 렌더링합니다.
 */
function renderTimeline() {
    const container = document.getElementById('timeline-container');
    if (!container) return;
    
    const records = getVisitRecords();
    const urlParams = new URLSearchParams(window.location.search);
    const currentLang = urlParams.get('lang') || 'kor';
    
    if (records.length === 0) {
        let emptyMsg = "아직 기록한 여행지가 없어요. 마음에 드는 장소를 방문 기록에 추가해보세요.";
        if (currentLang === 'eng') emptyMsg = "No travel logs yet. Add places you have visited to your log!";
        if (currentLang === 'jpn') emptyMsg = "まだ記録された旅行地がありません。お気に入りの場所を訪問記録に追加してみてください。";
        if (currentLang === 'chs' || currentLang === 'cht') emptyMsg = "还没有记录的旅行目的地。快把去过的地方添加到旅行记录中吧。";
        
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-20 text-center w-full">
                <div class="w-20 h-20 bg-surface-container-highest rounded-full flex items-center justify-center mb-4">
                    <span class="material-symbols-outlined text-[36px] text-outline">edit_document</span>
                </div>
                <p class="font-body text-sm text-on-surface-variant mb-2">${emptyMsg}</p>
            </div>`;
        return;
    }
    
    let html = '';
    records.forEach(record => {
        // 아이콘 및 카테고리 태그 매핑
        let icon = 'location_on';
        let category = 'Landmark';
        let bgClass = 'bg-secondary';

        if (record.title.includes('갈비') || record.title.includes('Bonsuwon') || record.title.includes('Food')) {
            icon = 'restaurant';
            category = 'Food';
            bgClass = 'bg-yellow-600';
        } else if (record.title.includes('박물관') || record.title.includes('Museum') || record.title.includes('미술관')) {
            icon = 'museum';
            category = 'Museum';
            bgClass = 'bg-blue-600';
        } else if (record.title.includes('수류정') || record.title.includes('Banghwasuryujeong') || record.title.includes('연못')) {
            icon = 'photo_camera';
            category = 'Scenic';
            bgClass = 'bg-green-600';
        }

        // 이미지 매칭을 위해 저장된 places 정보를 읽어와 이미지 링크 찾기
        const savedPlaces = getSavedPlaces();
        const matchedPlace = savedPlaces.find(p => p.contentid === record.contentid);
        const imageUrl = matchedPlace && matchedPlace.firstimage ? matchedPlace.firstimage : '';

        html += `
            <div class="relative flex items-start group" id="item-${record.id}">
                <!-- Timeline Icon Indicator -->
                <div class="flex items-center justify-center w-10 h-10 rounded-full border-4 border-surface ${bgClass} shadow-sm absolute left-0 shrink-0 z-10 transition-transform duration-300 group-hover:scale-110">
                    <span class="material-symbols-outlined text-white text-[18px]">${icon}</span>
                </div>

                <!-- Timeline Content Card -->
                <div class="w-[calc(100%-3rem)] ml-auto bg-surface-container-lowest rounded-[18px] shadow-ambient-md card-inner-stroke overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    ${imageUrl ? `
                    <div class="h-36 bg-surface-container w-full relative overflow-hidden">
                        <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('${imageUrl}')"></div>
                    </div>` : ''}
                    
                    <div class="p-4">
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-label-sm text-xs text-outline">${record.visit_date}</span>
                            <span class="font-label-sm text-[11px] bg-[#FDF2EB] text-[#8d4e26] px-2.5 py-0.5 rounded-full font-bold uppercase">${category}</span>
                        </div>
                        
                        <h3 class="font-headline text-base font-bold text-on-surface mb-2">${record.title}</h3>
                        
                        <!-- 메모 표시 영역 -->
                        <p class="font-body text-sm text-on-surface-variant leading-relaxed text-break-custom" id="memo-text-${record.id}">
                            ${record.memo ? record.memo : '<em class="text-black-50">No review memo written.</em>'}
                        </p>
                        
                        <!-- 메모 편집 입력창 (기본 숨김) -->
                        <div class="hidden mt-3 border-t border-outline-variant/10 pt-3" id="edit-area-${record.id}">
                            <textarea class="w-full bg-background border border-outline-variant/30 rounded-xl p-3 text-xs outline-none resize-none mb-2" id="edit-input-${record.id}" rows="2">${record.memo}</textarea>
                            <div class="flex gap-1.5 justify-end">
                                <button onclick="saveEdit('${record.id}')" class="bg-success text-white font-bold text-xs px-3 py-1.5 rounded-lg border-0">Save</button>
                                <button onclick="cancelEdit('${record.id}')" class="bg-surface text-on-surface ring-1 ring-outline-variant/30 font-bold text-xs px-3 py-1.5 rounded-lg border-0">Cancel</button>
                            </div>
                        </div>
                        
                        <!-- 제어 버튼 -->
                        <div class="flex gap-3 mt-4 pt-3 border-t border-outline-variant/10" id="actions-${record.id}">
                            <button onclick="enableEdit('${record.id}')" class="btn-xs p-0 border-0 bg-transparent text-primary hover:text-secondary font-bold text-xs flex items-center gap-1">
                                <span class="material-symbols-outlined text-[14px]">edit</span> Edit
                            </button>
                            <button onclick="removeLog('${record.id}')" class="btn-xs p-0 border-0 bg-transparent text-danger hover:opacity-80 font-bold text-xs flex items-center gap-1">
                                <span class="material-symbols-outlined text-[14px]">delete</span> Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
    });
    
    container.innerHTML = html;
}

/**
 * 편집 모드 활성화
 */
function enableEdit(id) {
    document.getElementById(`memo-text-${id}`).style.display = 'none';
    document.getElementById(`actions-${id}`).style.display = 'none';
    document.getElementById(`edit-area-${id}`).classList.remove('hidden');
}

/**
 * 편집 모드 취소
 */
function cancelEdit(id) {
    document.getElementById(`memo-text-${id}`).style.display = 'block';
    document.getElementById(`actions-${id}`).style.display = 'flex';
    document.getElementById(`edit-area-${id}`).classList.add('hidden');
}

/**
 * 수정된 메모 저장
 */
function saveEdit(id) {
    const newMemo = document.getElementById(`edit-input-${id}`).value;
    const success = updateVisitRecord(id, newMemo);
    if (success) {
        renderTimeline();
    }
}

/**
 * 방문 기록 삭제
 */
function removeLog(id) {
    const urlParams = new URLSearchParams(window.location.search);
    const currentLang = urlParams.get('lang') || 'kor';
    const confirmMsg = currentLang === 'kor' ? '정말 이 기록을 삭제하시겠습니까?' : 'Are you sure you want to delete this record?';
    
    if (confirm(confirmMsg)) {
        const success = deleteVisitRecord(id);
        if (success) {
            renderTimeline();
        }
    }
}

/**
 * 파일명 다국어 매핑 헬퍼
 */
function getExportFileName(extension) {
    const urlParams = new URLSearchParams(window.location.search);
    const currentLang = urlParams.get('lang') || 'kor';
    
    let baseFileName = "나의_수원_여행_기록";
    if (currentLang === 'eng') baseFileName = "My_Suwon_Trip_Log";
    if (currentLang === 'jpn') baseFileName = "私の_水原_旅行記録";
    if (currentLang === 'chs') baseFileName = "我的_水原_旅行记录";
    if (currentLang === 'cht') baseFileName = "我的_水原_旅行記錄";
    
    return `${baseFileName}.${extension}`;
}

/**
 * 기록 영역 전체를 고화질 이미지(PNG)로 캡처하여 다운로드
 */
function exportLogAsImage() {
    const exportArea = document.getElementById('log-export-area');
    
    const reviewInput = document.getElementById('travel-review-input');
    if (reviewInput) {
        reviewInput.value = sanitizeInput(reviewInput.value);
    }
    
    html2canvas(exportArea, { scale: 2, useCORS: true }).then(canvas => {
        const link = document.createElement('a');
        link.download = getExportFileName('png');
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}

/**
 * 기록 영역 전체를 가독성 좋은 PDF 문서로 변환하여 다운로드
 */
function exportLogAsPDF() {
    const exportArea = document.getElementById('log-export-area');
    
    const reviewInput = document.getElementById('travel-review-input');
    if (reviewInput) {
        reviewInput.value = sanitizeInput(reviewInput.value);
    }
    
    exportArea.classList.add('exporting');
    
    html2canvas(exportArea, { scale: 2, useCORS: true }).then(canvas => {
        exportArea.classList.remove('exporting');
        const imgData = canvas.toDataURL('image/png');
        
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth - 20, pdfHeight - 20);
        pdf.save(getExportFileName('pdf'));
    });
}
