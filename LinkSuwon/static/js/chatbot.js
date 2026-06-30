// 전체 화면 모드로 전환되었으므로 토글 함수는 더 이상 사용하지 않습니다. 
function toggleChatbot() {
    console.log("전체 화면 모드에서는 토글 기능을 사용하지 않습니다.");
}

// 페이지 로드 시 특정 관광지(spot) 파라미터가 있으면 첫 질문 자동 발송
document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const spot = urlParams.get('spot');
    if (spot) {
        const lang = document.documentElement.lang || 'ko';
        let autoQuestion = `"${spot}"에 대해 자세히 설명해줘.`;
        if (lang === 'en') autoQuestion = `Please tell me more about "${spot}".`;
        if (lang === 'ja') autoQuestion = `"${spot}"について詳しく教えてください。`;
        if (lang.startsWith('zh')) autoQuestion = `请详细介绍一下"${spot}"。`;

        const input = document.getElementById('chat-input');
        if (input) {
            input.value = autoQuestion;
            // 즉시 전송하기 위해 약간의 딜레이 후 실행
            setTimeout(() => {
                sendChatMessage();
            }, 500);
        }
    }
});

// 메시지 전송 및 제미나이 API 연동 함수
async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;

    const messagesContainer = document.getElementById('chat-messages');

    // 사용자가 입력한 메시지 화면에 추가 (Stitch 테일윈드 스타일)
    const userMsgWrapper = document.createElement('div');
    userMsgWrapper.className = 'max-w-[85%] self-end msg-animation bg-primary text-on-primary p-4 rounded-2xl rounded-tr-sm shadow-sm text-sm font-body leading-relaxed text-break-custom';
    userMsgWrapper.textContent = message;
    messagesContainer.appendChild(userMsgWrapper);

    input.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    const lang = document.documentElement.lang || 'ko';

    // 시스템 UI 메시지 다국어 매핑 정의
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

    const currentMsgs = systemMsgMap[lang] || systemMsgMap['ko'];

    // 로딩 메시지 추가
    const loadingWrapper = document.createElement('div');
    loadingWrapper.className = 'flex gap-3 max-w-[85%] msg-animation';
    loadingWrapper.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 shadow-sm mt-1 animate-pulse">
            <span class="material-symbols-outlined text-on-secondary text-sm" style="font-variation-settings: 'FILL' 1;">smart_toy</span>
        </div>
        <div class="bg-surface-container-lowest p-4 rounded-2xl rounded-tl-sm border border-outline-variant/30 shadow-sm text-on-surface font-body text-sm leading-relaxed italic text-black-50">
            ${currentMsgs.loading}
        </div>`;
    messagesContainer.appendChild(loadingWrapper);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
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
        if (messagesContainer.contains(loadingWrapper)) {
            messagesContainer.removeChild(loadingWrapper);
        }

        if (response.ok) {
            const botText = await response.text();

            // 챗봇 응답 메시지 화면에 추가 (Stitch 테일윈드 스타일)
            const botMsgWrapper = document.createElement('div');
            botMsgWrapper.className = 'flex gap-3 max-w-[85%] msg-animation';
            botMsgWrapper.innerHTML = `
                <div class="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 shadow-sm mt-1">
                    <span class="material-symbols-outlined text-on-secondary text-sm" style="font-variation-settings: 'FILL' 1;">smart_toy</span>
                </div>
                <div class="bg-surface-container-lowest p-4 rounded-2xl rounded-tl-sm border border-outline-variant/30 shadow-sm text-on-surface font-body text-sm leading-relaxed text-break-custom">
                    ${botText}
                </div>`;
            
            messagesContainer.appendChild(botMsgWrapper);
        } else {
            throw new Error('API 응답 실패');
        }
    } catch (error) {
        console.error("챗봇 에러:", error);
        
        if (messagesContainer.contains(loadingWrapper)) {
            messagesContainer.removeChild(loadingWrapper);
        }

        const errWrapper = document.createElement('div');
        errWrapper.className = 'flex gap-3 max-w-[85%] msg-animation';
        errWrapper.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center shrink-0 shadow-sm mt-1">
                <span class="material-symbols-outlined text-white text-sm" style="font-variation-settings: 'FILL' 1;">error</span>
            </div>
            <div class="bg-red-50 p-4 rounded-2xl rounded-tl-sm border border-red-200 shadow-sm text-red-700 font-body text-sm leading-relaxed">
                ${currentMsgs.error}
            </div>`;
        
        messagesContainer.appendChild(errWrapper);
    }

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}