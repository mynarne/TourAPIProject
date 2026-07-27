// 전체 화면 모드로 전환되었으므로 토글 함수는 더 이상 사용하지 않습니다. 
function toggleChatbot() {
    console.log("전체 화면 모드에서는 토글 기능을 사용하지 않습니다.");
}

// AI 챗봇 실시간 내 위치 연동 전역 변수
let chatbotCoords = null;
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
        chatbotCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
    }, err => console.log("Chatbot location query offline/denied"));
}

// 간단한 안전 마크다운 렌더러
function renderMarkdown(text) {
    if (!text) return '';
    // HTML 이스케이프 (XSS 방지)
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // 볼드: **텍스트**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 이탤릭: *텍스트*
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // 인라인 코드: `코드`
    html = html.replace(/`(.*?)`/g, '<code class="bg-surface-variant/50 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>');
    
    // 리스트: - 항목 또는 * 항목
    html = html.replace(/^(?:[-*]\s+)(.*)$/gm, '<li class="ml-4 list-disc text-sm">$1</li>');
    
    // 줄바꿈 처리
    html = html.replace(/\n/g, '<br>');

    // 연속된 li 태그를 ul로 감싸기
    html = html.replace(/(<li class="ml-4 list-disc text-sm">.*?<\/li>)+/g, '<ul class="my-2 flex flex-col gap-1">$1</ul>');

    return linkifySpots(html);
}

const SPOT_LINKS = [
    { id: '126228', names: ['화성행궁', 'Hwaseong Haenggung', '華城行宮', '华城行宫'] },
    { id: '126233', names: ['수원화성박물관', 'Suwon Hwaseong Museum', '水原華城博物館', '水原华城博物馆'] },
    { id: '126227', names: ['방화수류정', 'Banghasuryujeong', '訪花随柳亭', '访花随柳亭', '용연', 'Yongyeon'] },
    { id: '126230', names: ['장안문', 'Janganmun', '長安門', '长安门'] },
    { id: '126232', names: ['연무대', 'Yeonmudae', '錬武台', '炼武台', '동장대', 'Dongjangdae', '東将台', '东将台'] },
    { id: '126229', names: ['창룡문', 'Changryongmun', '蒼龍門', '苍龙门'] },
    { id: '126234', names: ['서장대', 'Seojangdae', '西将台', '西将台'] },
    { id: '126231', names: ['팔달문', 'Paldalmun', '八達門', '八达门'] }
];

function linkifySpots(html) {
    const lang = document.documentElement.lang || 'ko';
    const langMap = { 'ko': 'kor', 'en': 'eng', 'ja': 'jpn', 'zh-CN': 'chs', 'zh-TW': 'cht' };
    const currentLangCode = langMap[lang] || 'kor';

    // 1. 기존 HTML 태그들 격리 (태그 내 속성명이 덮어쓰여 망가지는 현상 방지)
    const tags = [];
    let placeholderHtml = html.replace(/(<[^>]+>)/g, function(match) {
        tags.push(match);
        return `___TAG_HOLDER_${tags.length - 1}___`;
    });

    // 2. 관광지명 리스트 정렬 (긴 것 우선으로 중복 매칭 방지)
    let candidates = [];
    SPOT_LINKS.forEach(spot => {
        spot.names.forEach(name => {
            candidates.push({ id: spot.id, name: name });
        });
    });
    candidates.sort((a, b) => b.name.length - a.name.length);

    // 3. 순수 텍스트 영역에서 매칭 및 앵커 플레이스홀더화
    const anchors = [];
    candidates.forEach(c => {
        const escapedName = c.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(escapedName, 'g');
        
        placeholderHtml = placeholderHtml.replace(regex, function(match) {
            const anchorHtml = `<a href="/spot/detail/${c.id}?lang=${currentLangCode}" class="font-bold text-secondary underline hover:text-primary transition-colors inline-flex items-center gap-0.5" style="text-underline-offset:3px;">${match}<span class="material-symbols-outlined text-[11px] align-middle">open_in_new</span></a>`;
            anchors.push(anchorHtml);
            return `___ANCHOR_HOLDER_${anchors.length - 1}___`;
        });
    });

    // 4. 앵커 플레이스홀더 역치환
    for (let i = anchors.length - 1; i >= 0; i--) {
        placeholderHtml = placeholderHtml.replace(`___ANCHOR_HOLDER_${i}___`, anchors[i]);
    }

    // 5. HTML 태그 플레이스홀더 역치환
    for (let i = tags.length - 1; i >= 0; i--) {
        placeholderHtml = placeholderHtml.replace(`___TAG_HOLDER_${i}___`, tags[i]);
    }

    return placeholderHtml;
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
        if (lang === 'zh-CN') autoQuestion = `请详细介绍一下"${spot}"。`;
        if (lang === 'zh-TW') autoQuestion = `請詳細介紹一下"${spot}"。`;

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
    const sendBtn = document.getElementById('send-btn');
    if (!input || !sendBtn) return;

    const message = input.value.trim();
    if (!message) return;

    const messagesContainer = document.getElementById('chat-messages');

    // 사용자가 입력한 메시지 화면에 추가 (Stitch 테일윈드 스타일)
    const userMsgWrapper = document.createElement('div');
    userMsgWrapper.className = 'max-w-[85%] self-end msg-bubble-pop-user bg-primary text-on-primary p-4 rounded-2xl rounded-tr-sm shadow-sm text-sm font-body leading-relaxed text-break-custom';
    userMsgWrapper.textContent = message;
    messagesContainer.appendChild(userMsgWrapper);

    // 입력창 비우기 및 비활성화 (더블 서브밋 방지)
    input.value = '';
    input.disabled = true;
    sendBtn.disabled = true;
    sendBtn.classList.add('opacity-50', 'cursor-not-allowed');
    
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
        'zh-CN': {
            loading: '正在生成回复...',
            error: '连接出现问题，请稍后再试。'
        },
        'zh-TW': {
            loading: '正在產生回覆...',
            error: '連線出現問題，請稍後再試。'
        }
    };

    const currentMsgs = systemMsgMap[lang] || systemMsgMap['ko'];

    // 로딩 메시지 추가
    const loadingWrapper = document.createElement('div');
    loadingWrapper.className = 'flex gap-3 max-w-[85%] msg-bubble-pop';
    loadingWrapper.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 shadow-sm mt-1 animate-pulse">
            <span class="material-symbols-outlined text-on-secondary text-sm" style="font-variation-settings: 'FILL' 1;">smart_toy</span>
        </div>
        <div class="bg-surface-container-lowest p-4 rounded-2xl rounded-tl-sm border border-outline-variant/30 shadow-sm text-on-surface font-body text-sm leading-relaxed italic text-black-50 flex items-center gap-2">
            <div class="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce"></div>
            <div class="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div class="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce [animation-delay:0.4s]"></div>
            <span class="ml-1">${currentMsgs.loading}</span>
        </div>`;
    messagesContainer.appendChild(loadingWrapper);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
        const langMap = {
            'ko': 'kor', 'en': 'eng', 'ja': 'jpn', 'zh-CN': 'chs', 'zh-TW': 'cht'
        };
        const currentLangCode = langMap[lang] || 'kor';

        let bodyParams = `message=${encodeURIComponent(message)}`;
        if (chatbotCoords) {
            bodyParams += `&lat=${chatbotCoords.lat}&lng=${chatbotCoords.lng}`;
        }

        const response = await fetch(`/ask_chatbot?lang=${currentLangCode}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: bodyParams
        });

        // 정상적으로 통신이 끝났으므로 로딩 메시지 제거
        if (messagesContainer.contains(loadingWrapper)) {
            messagesContainer.removeChild(loadingWrapper);
        }

        if (response.ok) {
            const botText = await response.text();

            // 1. 코스 메타데이터 파싱 감지
            const courseDataRegex = /\[COURSE_DATA:\s*(\{.*?\})\]/;
            const match = botText.match(courseDataRegex);
            let cleanedBotText = botText;
            let courseObj = null;

            if (match) {
                try {
                    courseObj = JSON.parse(match[1]);
                    cleanedBotText = botText.replace(courseDataRegex, '').trim();
                } catch (e) {
                    console.error("코스 메타데이터 파싱 실패:", e);
                }
            }

            // 챗봇 응답 메시지 화면에 추가 (Stitch 테일윈드 스타일, 마크다운 렌더링 적용)
            const botMsgWrapper = document.createElement('div');
            botMsgWrapper.className = 'flex gap-3 max-w-[85%] msg-bubble-pop';
            
            let bubbleHtml = `
                <div class="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 shadow-sm mt-1">
                    <span class="material-symbols-outlined text-on-secondary text-sm" style="font-variation-settings: 'FILL' 1;">smart_toy</span>
                </div>
                <div class="bg-surface-container-lowest p-4 rounded-2xl rounded-tl-sm border border-outline-variant/30 shadow-sm text-on-surface font-body text-sm leading-relaxed text-break-custom flex flex-col gap-3">
                    <div>
                        ${renderMarkdown(cleanedBotText)}
                    </div>`;

            // 코스 복사 버튼 동적 주입
            if (courseObj && courseObj.places && courseObj.places.length > 0) {
                const btnLabel = lang === 'ko' ? '🧭 이 추천 코스 내 발자취로 가져오기' : '🧭 Import this course to my timeline';
                const courseId = 'course_' + Date.now();
                window[courseId] = courseObj;
                bubbleHtml += `
                    <button onclick="importCourseFromChat('${courseId}')"
                            class="w-full mt-2 py-2.5 rounded-xl bg-secondary text-white font-bold text-xs flex items-center justify-center gap-1 border-0 hover:opacity-90 active:scale-[0.98] transition-all shadow-sm">
                        <span class="material-symbols-outlined text-[15px]">fork_left</span>
                        ${btnLabel}
                    </button>`;
            }

            bubbleHtml += `</div>`;
            botMsgWrapper.innerHTML = bubbleHtml;
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
        errWrapper.className = 'flex gap-3 max-w-[85%] msg-bubble-pop';
        errWrapper.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center shrink-0 shadow-sm mt-1">
                <span class="material-symbols-outlined text-white text-sm" style="font-variation-settings: 'FILL' 1;">error</span>
            </div>
            <div class="bg-red-50 p-4 rounded-2xl rounded-tl-sm border border-red-200 shadow-sm text-red-700 font-body text-sm leading-relaxed">
                ${currentMsgs.error}
            </div>`;
        
        messagesContainer.appendChild(errWrapper);
    } finally {
        // 입력창 및 전송 버튼 활성화 복구
        input.disabled = false;
        sendBtn.disabled = false;
        sendBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        input.focus();
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// 챗봇 추천 코스 원클릭 로컬스토리지 주입 함수
function importCourseFromChat(courseId) {
    const courseObj = window[courseId];
    if (!courseObj || !courseObj.places || courseObj.places.length === 0) return;

    const lang = document.documentElement.lang || 'ko';
    const title = courseObj.title || (lang === 'ko' ? 'AI 추천 코스' : 'AI Suggested Course');
    const places = courseObj.places;

    const confirmMsg = lang === 'ko'
        ? `AI가 추천한 '${title}'의 ${places.length}개 장소를 내 발자취로 가져오시겠습니까?`
        : `Do you want to import ${places.length} places from '${title}' to your timeline?`;

    if (!confirm(confirmMsg)) return;

    // storage.js 의존: addVisitRecord
    let successCount = 0;
    places.forEach((placeName, idx) => {
        // 3개 장소 단위로 일차(Day)를 계산하여 날짜 부여 (오늘, 내일, 모레...)
        const dayOffset = Math.floor(idx / 3);
        const dateObj = new Date();
        dateObj.setDate(dateObj.getDate() + dayOffset);
        const dateStr = dateObj.toISOString().split('T')[0];

        // 8대 명소 이미지 매핑
        let matchedId = 'ai_' + Math.random().toString(36).substr(2, 9);
        let matchedImg = '';
        
        const cleanName = placeName.trim().toLowerCase();
        const matchedSpot = SPOT_LINKS.find(spot => 
            spot.names.some(n => cleanName.includes(n.toLowerCase()) || n.toLowerCase().includes(cleanName))
        );
        
        if (matchedSpot) {
            matchedId = matchedSpot.id;
            const spotImages = {
                '126227': '/static/images/banghwasuryujeong.jpg',
                '126228': '/static/images/hwaseong_haenggung.jpg',
                '126229': 'https://tong.visitkorea.or.kr/cms/resource/36/2617736_image2_1.jpg',
                '126230': 'https://tong.visitkorea.or.kr/cms/resource/37/2617737_image2_1.jpg',
                '126231': 'https://tong.visitkorea.or.kr/cms/resource/41/2617741_image2_1.jpg',
                '126232': 'https://tong.visitkorea.or.kr/cms/resource/42/2617742_image2_1.jpg',
                '126233': 'https://tong.visitkorea.or.kr/cms/resource/43/2617743_image2_1.jpg',
                '126234': 'https://tong.visitkorea.or.kr/cms/resource/44/2617744_image2_1.jpg'
            };
            matchedImg = spotImages[matchedId] || '';
        } else {
            // 디폴트 이미지
            matchedImg = '/static/images/default.png';
        }

        // addVisitRecord 형식에 부합하게 데이터 추가
        const success = addVisitRecord({
            contentid: matchedId,
            title: placeName,
            visit_date: dateStr,
            firstimage: matchedImg,
            memo: lang === 'ko' ? 'AI 추천 일정에 따른 방문' : 'Visited via AI recommendation',
            lang: lang === 'ko' ? 'kor' : 'eng'
        });
        if (success) successCount++;
    });

    if (successCount > 0) {
        const goMsg = lang === 'ko'
            ? `성공적으로 ${successCount}개의 장소를 가져왔습니다!\n나의 발자취 페이지로 이동하여 확인하시겠습니까?`
            : `Successfully imported ${successCount} places!\nWould you like to go to your timeline page?`;
        
        if (confirm(goMsg)) {
            const langMap = { 'ko': 'kor', 'en': 'eng', 'ja': 'jpn', 'zh-CN': 'chs', 'zh-TW': 'cht' };
            const currentLangCode = langMap[lang] || 'kor';
            location.href = `/record/?lang=${currentLangCode}`;
        }
    } else {
        alert(lang === 'ko' ? "가져오기에 실패했습니다." : "Failed to import course.");
    }
}
