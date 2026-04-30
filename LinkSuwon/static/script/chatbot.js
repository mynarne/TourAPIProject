// 챗봇 열고 닫기 함수
function toggleChatbot() {
    const chatBox = document.getElementById('chat-box');
    if (chatBox.style.display === 'none' || chatBox.style.display === '') {
        chatBox.style.display = 'flex';
    } else {
        chatBox.style.display = 'none';
    }
}

// 메시지 전송 및 제미나이 API 연동 함수
async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;

    const messagesContainer = document.getElementById('chat-messages');

    // 사용자가 입력한 메시지 화면에 추가
    const userMessageDiv = document.createElement('div');
    userMessageDiv.style.cssText = "background-color: #002b5b; color: #fff; padding: 8px 12px; border-radius: 8px; align-self: flex-end; max-width: 80%;";
    userMessageDiv.textContent = message;
    messagesContainer.appendChild(userMessageDiv);

    input.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
        // 템플릿 변수 대신 현재 언어 정보를 안전하게 가져오도록 수정
        const lang = document.documentElement.lang || 'ko';
        
        // 언어 코드 매핑 (kor, eng, jpn 등)
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

        if (response.ok) {
            const botText = await response.text();

            const botMessageDiv = document.createElement('div');
            botMessageDiv.style.cssText = "background-color: #e1e8ed; padding: 8px 12px; border-radius: 8px; align-self: flex-start; max-width: 80%;";
            botMessageDiv.textContent = botText;
            messagesContainer.appendChild(botMessageDiv);
        } else {
            throw new Error('API 응답 실패');
        }
    } catch (error) {
        console.error("챗봇 에러:", error);
        const errMessageDiv = document.createElement('div');
        errMessageDiv.style.cssText = "background-color: #ffcccc; color: #990000; padding: 8px 12px; border-radius: 8px; align-self: flex-start; max-width: 80%;";
        errMessageDiv.textContent = "챗봇 연결에 문제 발생. 다시 시도해 보세요.";
        messagesContainer.appendChild(errMessageDiv);
    }

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}