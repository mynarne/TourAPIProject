// 페이지 로드 시 UUID 초기화 및 로드
window.onload = function() {
    initUserUUID();
};

/**
 * 사용자 브라우저에 고유 식별자(UUID)를 부여하고 LocalStorage에 저장
 */
function initUserUUID() {
    let userUUID = localStorage.getItem('linksuwon_user_uuid');
    
    // UUID가 없으면 새로 생성하여 부여
    if (!userUUID) {
        // 무작위 난수 기반 가상 신분증 생성
        userUUID = 'LS-' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
        localStorage.setItem('linksuwon_user_uuid', userUUID);
        console.log("--- [DEBUG] 새로운 가상 UUID 발급 완료:", userUUID, "---");
    }
    
    // 발급된 UUID를 화면 우측 상단 뱃지에 표시
    const displayElement = document.getElementById('user-uuid-display');
    if (displayElement) {
        displayElement.innerText = 'ID: ' + userUUID.toUpperCase();
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