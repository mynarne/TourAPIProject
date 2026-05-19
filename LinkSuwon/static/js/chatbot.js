// 전체 화면 모드로 전환되었으므로 토글 함수는 더 이상 사용하지 않습니다. 
// 하위 호환성(에러 방지)을 위해 빈 함수로 남겨둡니다.
function toggleChatbot() {
    console.log("전체 화면 모드에서는 토글 기능을 사용하지 않습니다.");
}

// 메시지 전송 및 제미나이 API 연동 함수
async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;

    const messagesContainer = document.getElementById('chat-messages');

    // 사용자가 입력한 메시지 화면에 추가 (CSS 클래스 연동)
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'chat-bubble user-bubble shadow-sm';
    userMessageDiv.textContent = message;
    messagesContainer.appendChild(userMessageDiv);

    input.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // 템플릿 변수 대신 현재 언어 정보를 안전하게 가져오도록 유지
    const lang = document.documentElement.lang || 'ko';

    // 신규: 시스템 UI 메시지 다국어 매핑 정의
    const systemMsgMap = {
        'ko': {
            loading: '답변을 생성하고 있습니다...',
            error: '챗봇 연결에 문제가 발생했습니다. 다시 시도해 주세요.'
        },
        'en': {
            loading: 'Generating a response...',
            error: 'A connection error occurred. Please try again.'
        },
        'ja': {
            loading: '回答を生成しています...',
            error: '接続に問題が発生しました。もう一度お試しください。'
        },
        'zh': {
            loading: '正在生成回复...',
            error: '连接出现问题，请稍后再试。'
        }
    };

    // 현재 언어 설정에 맞는 멘트 선택 (없으면 한국어 기본값)
    const currentMsgs = systemMsgMap[lang] || systemMsgMap['ko'];

    // 로딩 메시지 추가 (API 응답 대기 시간 동안 언어별 분기 메시지 표시)
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'chat-bubble loading-bubble shadow-sm';
    loadingDiv.textContent = currentMsgs.loading;
    messagesContainer.appendChild(loadingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
        // 언어 코드 매핑
        const langMap = {
            'ko': 'kor', 'en': 'eng', 'ja': 'jpn', 'zh': 'chs'
        };
        const currentLangCode = langMap[lang] || 'kor';

        const response = await fetch(`/ask_chatbot?lang=${currentLangCode}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `message=${encodeURIComponent(message)}`
        });

        // 정상적으로 통신이 끝났으므로 로딩 메시지 제거
        if (messagesContainer.contains(loadingDiv)) {
            messagesContainer.removeChild(loadingDiv);
        }

        if (response.ok) {
            const botText = await response.text();

            // 챗봇 응답 메시지 화면에 추가 (CSS 클래스 연동)
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'chat-bubble ai-bubble shadow-sm';
            botMessageDiv.textContent = botText;
            messagesContainer.appendChild(botMessageDiv);
        } else {
            throw new Error('API 응답 실패');
        }
    } catch (error) {
        console.error("챗봇 에러:", error);
        
        // 에러 발생 시 로딩 메시지가 남아있다면 제거
        if (messagesContainer.contains(loadingDiv)) {
            messagesContainer.removeChild(loadingDiv);
        }

        const errMessageDiv = document.createElement('div');
        errMessageDiv.className = 'chat-bubble ai-bubble shadow-sm';
        errMessageDiv.style.color = '#990000';
        errMessageDiv.style.backgroundColor = '#ffcccc';
        // 에러 메시지도 언어별 맞춤 멘트로 출력
        errMessageDiv.textContent = currentMsgs.error;
        messagesContainer.appendChild(errMessageDiv);
    }

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}