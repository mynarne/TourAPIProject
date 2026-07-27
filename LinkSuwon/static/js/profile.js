/**
 * profile.js — LinkSuwon 마이페이지 클라이언트 로직
 * storage.js, sync.js 의존
 */

const P_LANG = window.PROFILE_PAGE_LANG || 'kor';

/* ── 다국어 사전 ── */
const PM = {
    logout_btn: { kor: '로그아웃', eng: 'Logout', jpn: 'ログアウト', chs: '退出登录', cht: '登出' },
    not_logged_in: {
        kor: '로그인하지 않은 상태입니다',
        eng: 'You are not logged in',
        jpn: 'ログインしていません',
        chs: '您尚未登录',
        cht: '您尚未登入'
    },
    login_guide: {
        kor: '구글 계정으로 로그인하여 데이터를 연동해보세요.',
        eng: 'Sign in with Google to sync and back up your data.',
        jpn: 'Googleアカウントでログインしてデータを同期しましょう。',
        chs: '登录谷歌账号以进行数据同步与备份。',
        cht: '登入谷歌帳號以進行數據同步與備份。'
    },
    sync_success: {
        kor: '동기화가 성공적으로 완료되었습니다!',
        eng: 'Sync completed successfully!',
        jpn: '同期が正常に完了しました！',
        chs: '同步成功！',
        cht: '同步成功！'
    },
    sync_fail: {
        kor: '동기화 중 오류가 발생했습니다. 로그인을 확인해주세요.',
        eng: 'Sync failed. Please check your login status.',
        jpn: '同期中にエラーが発生しました。ログインを確認してください。',
        chs: '同步失败。请检查登录状态。',
        cht: '同步失敗。請檢查登入狀態。'
    },
    copy_success: {
        kor: 'ID가 복사되었습니다!',
        eng: 'ID copied to clipboard!',
        jpn: 'IDがコピーされました！',
        chs: 'ID已复制到剪贴板！',
        cht: 'ID已複製到剪貼簿！'
    },
    syncing: {
        kor: '동기화 중...',
        eng: 'Syncing...',
        jpn: '同期中...',
        chs: '正在同步...',
        cht: '正在同步...'
    }
};

const pm = key => (PM[key] && (PM[key][P_LANG] || PM[key]['eng'])) || '';

window.addEventListener('DOMContentLoaded', () => {
    loadProfileStats();
    loadProfileAccount();
    renderStampBoard();
});

/* ── 통계 및 UUID 로드 ── */
function loadProfileStats() {
    // 1. 즐겨찾기 수
    try {
        const saved = JSON.parse(localStorage.getItem('linksuwon:savedPlaces') || '[]');
        const savedEl = document.getElementById('profile-stat-saved');
        if (savedEl) savedEl.textContent = saved.length;
    } catch (e) { console.error(e); }

    // 2. 기록 수
    try {
        const records = JSON.parse(localStorage.getItem('linksuwon:visitRecords') || '[]');
        const recordsEl = document.getElementById('profile-stat-records');
        if (recordsEl) recordsEl.textContent = records.length;
    } catch (e) { console.error(e); }

    // 3. UUID
    const uuid = localStorage.getItem('linksuwon_user_uuid') || 'LS-NOT-INITIALIZED';
    const uuidEl = document.getElementById('profile-uuid-code');
    if (uuidEl) uuidEl.textContent = uuid;
}

/* ── 계정 상태 로드 및 렌더링 ── */
async function loadProfileAccount() {
    const container = document.getElementById('profile-account-section');
    if (!container) return;

    try {
        const response = await fetch('/auth/status');
        const data = await response.json();

        if (data.is_logged_in) {
            // 로그인 상태
            container.innerHTML = `
                <div class="flex items-center gap-4">
                    <img class="w-16 h-16 rounded-full border border-secondary/20 shadow-sm" 
                         src="${data.user.picture}" 
                         alt="${data.user.name}">
                    <div class="flex-1">
                        <h2 class="font-headline text-lg font-extrabold text-primary mb-0.5">${data.user.name}</h2>
                        <p class="text-xs text-on-surface-variant">${data.user.email || ''}</p>
                    </div>
                    <button onclick="triggerLogout()" 
                            class="px-4 py-2 rounded-xl border border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors font-bold text-xs bg-transparent">
                        ${pm('logout_btn')}
                    </button>
                </div>`;
        } else {
            // 비로그인 상태
            container.innerHTML = `
                <div class="flex flex-col items-center text-center gap-3">
                    <div class="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-outline">
                        <span class="material-symbols-outlined text-2xl">account_circle</span>
                    </div>
                    <div>
                        <h3 class="font-headline text-sm font-bold text-primary mb-1">${pm('not_logged_in')}</h3>
                        <p class="text-xs text-on-surface-variant max-w-[280px] leading-relaxed mb-4">${pm('login_guide')}</p>
                    </div>
                    <!-- 구글 로그인 버튼 전용 타겟 -->
                    <div id="profile-g-btn-container" class="flex justify-center"></div>
                </div>`;

            // 구글 GIS 로그인 버튼 활성화
            renderProfileGoogleButton();
        }
    } catch (error) {
        console.error(error);
        container.innerHTML = `<p class="text-danger text-xs text-center">Failed to load account info.</p>`;
    }
}

/* ── 구글 로그인 버튼 렌더링 ── */
function renderProfileGoogleButton() {
    const btnContainer = document.getElementById('profile-g-btn-container');
    if (!btnContainer) return;

    if (window.google) {
        initProfileGoogleSignIn();
    } else {
        const script = document.createElement('script');
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => {
            initProfileGoogleSignIn();
        };
        document.head.appendChild(script);
    }
}

function initProfileGoogleSignIn() {
    const clientId = window.GOOGLE_CLIENT_ID || "109848529329-placeholderclientid12345.apps.googleusercontent.com";
    
    google.accounts.id.initialize({
        client_id: clientId,
        callback: handleProfileCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true
    });

    google.accounts.id.renderButton(
        document.getElementById("profile-g-btn-container"),
        { 
            theme: "outline", 
            size: "large",
            type: "standard",
            shape: "pill",
            text: "signin",
            logo_alignment: "left"
        }
    );
}

async function handleProfileCredentialResponse(response) {
    try {
        const loginRes = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential: response.credential })
        });

        const loginData = await loginRes.json();
        if (loginData.success) {
            // 동기화 실행 및 리로드
            await triggerDataSync();
            window.location.reload();
        } else {
            alert("Google Login Failed.");
        }
    } catch (error) {
        console.error(error);
    }
}

/* ── 수동 동기화 ── */
async function handleManualSync() {
    const btn = document.getElementById('manual-sync-btn');
    const icon = document.getElementById('sync-btn-icon');
    const text = document.getElementById('sync-btn-text');
    const msg = document.getElementById('sync-status-msg');

    if (!btn || !icon || !text) return;

    // 로딩 활성화
    btn.disabled = true;
    icon.classList.add('animate-spin');
    const originText = text.textContent;
    text.textContent = pm('syncing');

    // 딜레이 체감용 500ms 부여
    await new Promise(r => setTimeout(r, 500));

    try {
        // 로그인 상태 체크
        const statusRes = await fetch('/auth/status');
        const statusData = await statusRes.json();

        if (statusData.is_logged_in) {
            // 동기화 수행
            await triggerDataSync();
            
            // 통계 리로드
            loadProfileStats();

            // 성공 메시지
            if (msg) {
                msg.textContent = pm('sync_success') + ` (${new Date().toLocaleTimeString()})`;
                msg.className = "text-[11px] text-center text-green-600 mt-1 block";
            }
        } else {
            // 비로그인 실패
            if (msg) {
                msg.textContent = pm('sync_fail');
                msg.className = "text-[11px] text-center text-red-500 mt-1 block";
            }
        }
    } catch (e) {
        console.error(e);
        if (msg) {
            msg.textContent = pm('sync_fail');
            msg.className = "text-[11px] text-center text-red-500 mt-1 block";
        }
    } finally {
        // 복구
        btn.disabled = false;
        icon.classList.remove('animate-spin');
        text.textContent = originText;
    }
}

/* ── UUID 복사 ── */
function copyDeviceID() {
    const codeEl = document.getElementById('profile-uuid-code');
    const iconEl = document.getElementById('copy-icon');
    if (!codeEl || !iconEl) return;

    const idText = codeEl.textContent;
    navigator.clipboard.writeText(idText).then(() => {
        alert(pm('copy_success'));
        
        // 아이콘 일시적으로 변경 피드백
        iconEl.textContent = 'check';
        iconEl.classList.add('text-green-600');
        setTimeout(() => {
            iconEl.textContent = 'content_copy';
            iconEl.classList.remove('text-green-600');
        }, 1500);
    }).catch(err => {
        console.error('복사 실패:', err);
    });
}

/* ── 계정 탈퇴 및 데이터 파기 (Danger Zone) ── */
const DELETE_CONFIRM = {
    kor: {
        q1: "정말로 모든 데이터와 동기화 정보를 파기하시겠습니까?\n이 작업은 되돌릴 수 없습니다.",
        q2: "마지막 경고입니다. 계정이 삭제되고 현재 로컬 브라우저의 저장된 여행 정보가 모두 초기화됩니다. 계속 진행할까요?",
        success: "성공적으로 모든 데이터가 파기되었습니다."
    },
    eng: {
        q1: "Are you sure you want to permanently delete all data and backups?\nThis action cannot be undone.",
        q2: "Final warning. Your account will be deleted, and all cached travel data in this browser will be wiped. Proceed?",
        success: "All account and local data have been permanently wiped."
    },
    jpn: {
        q1: "本当にすべてのデータと同期情報を削除しますか？\nこの操作は取り消せません。",
        q2: "最後の警告です。アカウントが削除され、このブラウザのローカルデータがすべて初期化されます。続行しますか？",
        success: "すべてのデータが正常に削除されました。"
    },
    chs: {
        q1: "您确定要永久销毁所有数据和同步备份吗？\n此操作无法撤销。",
        q2: "最后警告：您的账号将被注销，当前浏览器缓存的所有旅行数据都将被清空。是否继续？",
        success: "所有账号与本地数据已成功销毁。"
    },
    cht: {
        q1: "您確定要永久銷毀所有數據和同步備份嗎？\n此操作無法撤銷。",
        q2: "最後警告：您的帳號將被註銷，當前瀏覽器快取的所有旅行數據都將被清空。是否繼續？",
        success: "所有帳號與本地數據已成功銷毀。"
    }
};

async function handleDeleteAccount() {
    const texts = DELETE_CONFIRM[P_LANG] || DELETE_CONFIRM['eng'];
    
    if (!confirm(texts.q1)) return;
    if (!confirm(texts.q2)) return;
    
    try {
        // 1. 로그인 상태 확인 후 백엔드 탈퇴 시도
        const statusRes = await fetch('/auth/status');
        const statusData = await statusRes.json();
        
        if (statusData.is_logged_in) {
            const deleteRes = await fetch('/auth/delete_account', { method: 'POST' });
            if (!deleteRes.ok) {
                throw new Error("Failed to delete account from backend");
            }
        }
        
        // 2. 프론트엔드 LocalStorage 전체 삭제
        localStorage.removeItem('linksuwon:savedPlaces');
        localStorage.removeItem('linksuwon:visitRecords');
        localStorage.removeItem('linksuwon:recentPlaces');
        localStorage.removeItem('linksuwon:overallReview');
        
        alert(texts.success);
        
        // 메인 페이지로 안전하게 팅겨냅니다.
        window.location.href = `/?lang=${P_LANG}`;
        
    } catch (error) {
        console.error("Delete account error:", error);
        alert("Error: " + error.message);
    }
}

/* ── 수원화성 스탬프 보드 렌더링 ── */
const PROFILE_STAMP_SPOTS = [
    { id: '126228', name: { kor: '화성행궁', eng: 'Haenggung', jpn: '行宮', chs: '行宫', cht: '行宮' }, icon: 'castle' },
    { id: '126227', name: { kor: '방화수류정', eng: 'Suryujeong', jpn: '水流亭', chs: '水流亭', cht: '水流亭' }, icon: 'park' },
    { id: '126230', name: { kor: '장안문', eng: 'Janganmun', jpn: '長安門', chs: '长安门', cht: '長安門' }, icon: 'gate' },
    { id: '126231', name: { kor: '팔달문', eng: 'Paldalmun', jpn: '八達門', chs: '八达门', cht: '八達門' }, icon: 'gate' },
    { id: '126229', name: { kor: '창룡문', eng: 'Changryong', jpn: '蒼龍門', chs: '苍龙门', cht: '蒼龍門' }, icon: 'gate' },
    { id: '126232', name: { kor: '연무대', eng: 'Yeonmudae', jpn: '錬武台', chs: '炼武台', cht: '鍊武台' }, icon: 'sports_martial_arts' },
    { id: '126233', name: { kor: '화성박물관', eng: 'Museum', jpn: '博物館', chs: '博物馆', cht: '博物館' }, icon: 'museum' },
    { id: '126234', name: { kor: '서장대', eng: 'Seojangdae', jpn: '西将台', chs: '西将台', cht: '西將台' }, icon: 'visibility' }
];

function renderStampBoard() {
    const gridContainer = document.getElementById('stamp-grid-container');
    const badgeCard = document.getElementById('explorer-badge-card');
    const countBadge = document.getElementById('stamp-count-badge');
    if (!gridContainer) return;

    // 로컬스토리지에서 획득 스탬프 배열 파싱
    const savedStamps = JSON.parse(localStorage.getItem('linksuwon:stamps') || '[]');
    const count = savedStamps.length;

    // 0 / 8 개수 업데이트
    if (countBadge) {
        countBadge.textContent = `${count} / 8`;
        if (count === 8) {
            countBadge.classList.remove('text-amber-600', 'bg-amber-50');
            countBadge.classList.add('text-green-600', 'bg-green-50');
        }
    }

    // 8칸 도장판 동적 렌더링
    gridContainer.innerHTML = PROFILE_STAMP_SPOTS.map(spot => {
        const isCollected = savedStamps.includes(spot.id);
        const nameText = spot.name[P_LANG] || spot.name['eng'];
        
        // 도장이 찍혔는지에 따른 스타일 차별화
        const bgStyle = isCollected 
            ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white ring-2 ring-amber-500/20' 
            : 'bg-surface-container-high text-outline-variant/70 border border-outline-variant/10';
        const textStyle = isCollected 
            ? 'text-amber-950 font-extrabold dark:text-amber-100' 
            : 'text-outline/60 font-medium';
        const stampCircle = isCollected
            ? `<div class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border border-white flex items-center justify-center text-[10px] text-white shadow-sm font-black animate-ping [animation-duration:1.5s]">🏵️</div>
               <div class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border border-white flex items-center justify-center text-[10px] text-white shadow-sm font-black z-10">🏵️</div>`
            : '';

        return `
            <a href="/spot/detail/${spot.id}?lang=${P_LANG}" class="relative flex flex-col items-center justify-center p-3 rounded-2xl ${bgStyle} hover:scale-[1.03] transition-all text-decoration-none h-[88px] cursor-pointer">
                ${stampCircle}
                <span class="material-symbols-outlined text-2xl mb-1">${spot.icon}</span>
                <span class="text-[10px] text-center truncate w-full ${textStyle}">${nameText}</span>
            </a>`;
    }).join('');

    // 8개 모두 모았을 때 "🏆 수원화성 탐험가" 뱃지 팝업
    if (count === 8 && badgeCard) {
        badgeCard.classList.remove('hidden');
    }
}

/* ── 로컬스토리지 백업 내보내기 (JSON Export) ── */
function exportLocalData() {
    const backupKeys = [
        'linksuwon:savedPlaces',
        'linksuwon:visitRecords',
        'linksuwon:recentPlaces',
        'linksuwon:stamps'
    ];
    const data = {};

    backupKeys.forEach(key => {
        const val = localStorage.getItem(key);
        if (val) {
            try {
                data[key] = JSON.parse(val);
            } catch (e) {
                data[key] = val;
            }
        }
    });

    // 다운로드 링크 동적 생성
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `linksuwon_backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/* ── 로컬스토리지 백업 가져오기 (JSON Import) ── */
function importLocalData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // 데이터 검증 (최소 하나의 유효 키 존재 여부)
            const validKeys = [
                'linksuwon:savedPlaces',
                'linksuwon:visitRecords',
                'linksuwon:recentPlaces',
                'linksuwon:stamps'
            ];
            const hasValidKey = Object.keys(data).some(key => validKeys.includes(key));

            if (!hasValidKey) {
                alert(P_LANG === 'kor' ? "유효하지 않은 백업 파일입니다." : "Invalid backup file.");
                return;
            }

            const confirmMsg = P_LANG === 'kor'
                ? "백업 데이터를 복원하시겠습니까? 기존 기기의 로컬 데이터는 덮어쓰기됩니다."
                : "Do you want to restore this backup? Existing local data will be overwritten.";

            if (!confirm(confirmMsg)) return;

            // 로컬스토리지 갱신
            validKeys.forEach(key => {
                if (data[key] !== undefined) {
                    const valStr = typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key];
                    localStorage.setItem(key, valStr);
                }
            });

            // 화면 데이터 갱신
            loadProfileStats();
            renderStampBoard();

            alert(P_LANG === 'kor' ? "데이터 복원이 완료되었습니다!" : "Data restored successfully!");
            window.location.reload();

        } catch (err) {
            console.error("복원 실패:", err);
            alert(P_LANG === 'kor' ? "파일 분석 중 오류가 발생했습니다." : "Error parsing backup file.");
        }
    };
    reader.readAsText(file);
    
    // 이벤트 인풋 초기화 (같은 파일 업로드 재동작 보장)
    event.target.value = '';
}

/* ── 개발자용 스탬프 일괄 획득 치트 (Demo Cheat) ── */
function cheatAllStamps() {
    const allStamps = ['126227', '126228', '126229', '126230', '126231', '126232', '126233', '126234'];
    localStorage.setItem('linksuwon:stamps', JSON.stringify(allStamps));
    
    // 알림창 출력 후 재로드
    alert(P_LANG === 'kor' ? "🏆 축하합니다! 8대 명소 스탬프를 일괄 획득하여 마스터가 되었습니다." : "🏆 Congratulations! You got all 8 stamps instantly!");
    window.location.reload();
}

/* ── 개발자용 스탬프만 리셋 (Demo Reset) ── */
function resetStampsOnly() {
    localStorage.setItem('linksuwon:stamps', JSON.stringify([]));
    
    // 알림창 출력 후 재로드
    alert(P_LANG === 'kor' ? "스탬프판이 초기화되었습니다." : "Stamps reset successfully.");
    window.location.reload();
}
