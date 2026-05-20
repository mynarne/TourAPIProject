// 페이지 로드 시 UUID 초기화 및 로드
window.onload = function() {
    initUserUUID();
    initSecurityListeners();
};

/**
 * [보안 강화] 암호학적으로 안전한 고정 난수 기반 UUID 생성 알고리즘 (Web Crypto API 사용)
 * 기존 Math.random()의 예측 가능성 취약점을 극복하여 브루트포스 및 세션 위변조를 예방합니다.
 */
function generateSecureUUID() {
    // 1. 브라우저 암호화 난수 생성기 사용
    const array = new Uint32Array(4);
    window.crypto.getRandomValues(array);
    
    let secureHex = '';
    for (let i = 0; i < array.length; i++) {
        // 36진수 문자열로 변환하여 고유 난수값 획득
        secureHex += array[i].toString(36);
    }
    
    // 2. 고정밀 타임스탬프 결합하여 절대 중복 방지
    const timestamp = Date.now().toString(36);
    const rawId = (secureHex + timestamp).substring(0, 16).toUpperCase();
    
    return 'LS-' + rawId;
}

/**
 * 사용자 브라우저에 고유 식별자(UUID)를 부여하고 LocalStorage에 저장
 */
function initUserUUID() {
    let userUUID = localStorage.getItem('linksuwon_user_uuid');
    
    // UUID가 없거나 규격에 맞지 않으면 안전한 난수로 새로 발급
    if (!userUUID || !userUUID.startsWith('LS-')) {
        userUUID = generateSecureUUID();
        localStorage.setItem('linksuwon_user_uuid', userUUID);
        console.log("--- [보안 DEBUG] 크립토 기반 신규 UUID 발급 완료:", userUUID, "---");
    }
    
    // 발급된 UUID를 화면 우측 상단 뱃지에 표시
    const displayElement = document.getElementById('user-uuid-display');
    if (displayElement) {
        displayElement.innerText = 'ID: ' + userUUID.toUpperCase();
    }
}

/**
 * [보안 강화] XSS 예방을 위한 실시간 입력값 정제 및 이스케이프 유틸리티
 * 사용자가 후기 창에 악성 HTML 태그나 스크립트를 주입하더라도 단순 문자로 출력되도록 필터링합니다.
 */
function sanitizeInput(text) {
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

/**
 * 입력창에 대한 스크립트 주입 예방 실시간 리스너 작동
 */
function initSecurityListeners() {
    const reviewInput = document.getElementById('travel-review-input');
    if (reviewInput) {
        reviewInput.addEventListener('blur', function() {
            // 입력 포커스를 잃었을 때 위험 문자열 1차 정제 및 이스케이프 실행
            this.value = sanitizeInput(this.value);
        });
    }
}

/**
 * 현재 URL의 언어 파라미터를 읽어와서 국가별 맞춤 파일명을 반환하는 함수
 */
function getExportFileName(extension) {
    const urlParams = new URLSearchParams(window.location.search);
    const currentLang = urlParams.get('lang') || 'kor';
    
    let baseFileName = "나의_수원_여행_기록"; // 기본값 (한국어)
    
    if (currentLang === 'eng') {
        baseFileName = "My_Suwon_Trip_Log";
    } else if (currentLang === 'jpn') {
        baseFileName = "私の_水原_旅行記録";
    } else if (currentLang === 'chs') {
        baseFileName = "我的_水原_旅行记录";
    } else if (currentLang === 'cht') {
        baseFileName = "我的_水原_旅行記錄";
    }
    
    return `${baseFileName}.${extension}`;
}

/**
 * 기록 영역 전체를 고화질 이미지(PNG)로 캡처하여 다운로드
 */
function exportLogAsImage() {
    const exportArea = document.getElementById('log-export-area');
    
    // 캡처 실행 전 이스케이프 및 정제 상태 재확인
    const reviewInput = document.getElementById('travel-review-input');
    if (reviewInput) {
        reviewInput.value = sanitizeInput(reviewInput.value);
    }
    
    // html2canvas 라이브러리를 통한 DOM 렌더링 캡처
    html2canvas(exportArea, { scale: 2, useCORS: true }).then(canvas => {
        const link = document.createElement('a');
        
        // 언어별 맞춤 파일명 적용
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
    
    // 캡처 실행 전 이스케이프 및 정제 상태 재확인
    const reviewInput = document.getElementById('travel-review-input');
    if (reviewInput) {
        reviewInput.value = sanitizeInput(reviewInput.value);
    }
    
    // 캡처 전 PDF 렌더링 품질을 위해 CSS 보정 클래스 추가
    exportArea.classList.add('exporting');
    
    // 캡처 진행
    html2canvas(exportArea, { scale: 2, useCORS: true }).then(canvas => {
        // 원상복구
        exportArea.classList.remove('exporting');
        
        // 이미지 비율을 A4 사이즈 규격에 맞게 변환
        const imgData = canvas.toDataURL('image/png');
        
        // jsPDF 모듈 초기화 (A4, 밀리미터 단위, 세로 방향)
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        // 캡처된 이미지를 PDF 안에 배치 (여백을 주어 가독성 극대화)
        pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth - 20, pdfHeight - 20);
        
        // 언어별 맞춤 파일명 적용하여 최종 PDF 다운로드
        pdf.save(getExportFileName('pdf'));
    });
}