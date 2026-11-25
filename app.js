/**
 * 국방 디지털 군 보급품 통합 관리 시스템 (Military Supply Ledger)
 * 
 * [초보자 안내]:
 * Supabase 가입 후 생성한 프로젝트의 URL과 anon key를 아래 따옴표 안에 붙여넣으세요!
 * 예시:
 * const DEFAULT_SUPABASE_URL = "https://abcdefghijklmn.supabase.co";
 * const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
 */

const DEFAULT_SUPABASE_URL = "https://sb_publishable_qcSJ9G7xh3wlqj_4iL45Uw_RrpMVTnK.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "https://vqihkbrdzzocaudmlpao.supabase.co/rest/v1/"

// 로컬 스토리지 또는 기본 설정에서 접속 정보 가져오기
let SUPABASE_URL = localStorage.getItem('supabase_url') || DEFAULT_SUPABASE_URL;
let SUPABASE_ANON_KEY = localStorage.getItem('supabase_key') || DEFAULT_SUPABASE_ANON_KEY;

let supabase = null;
let isDemoMode = false;

// 초기 데모 데이터 (DB 연결 전에도 화면이 바로 작동하도록 배려)
let mockLedgerList = [
    {
        id: 1,
        item_category: '장구/탄약',
        item_name: 'K-2 전투소총 멜빵끈',
        quantity: 2,
        unit: 'EA',
        user_name: '본부중대 병장 김태호',
        purpose: '신병 장구류 정비 및 교체',
        memo: '신병 전입에 따른 노후 멜빵끈 교체 지급 완료. 총기 상태 이상무.',
        status: '불출완료',
        created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
        id: 2,
        item_category: '급양/부식',
        item_name: '전투식량 2형 (소고기비빔밥)',
        quantity: 24,
        unit: 'EA',
        user_name: '1소대 하사 이진우',
        purpose: '야간 국지도발 대비 전술훈련 행동식',
        memo: '훈련 종료 후 미취식분 수량 확인 예정. 박스 개봉 상태 양호.',
        status: '불출완료',
        created_at: new Date(Date.now() - 3600000 * 3).toISOString()
    },
    {
        id: 3,
        item_category: '피복류',
        item_name: '디지털 방한두건 및 장갑세트',
        quantity: 5,
        unit: '세트',
        user_name: '2소대 상병 박서준',
        purpose: '동계 GOP 경계초소 투입 근무자 지급',
        memo: '초소 투입 전 전원 착용 상태 및 방한 규격 이상무.',
        status: '불출완료',
        created_at: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
        id: 4,
        item_category: '의무/방역',
        item_name: '야전 멸균 압박붕대 (대형)',
        quantity: 4,
        unit: 'EA',
        user_name: '의무실 상병 최도윤',
        purpose: '유격훈련 간 응급 구급낭 보충용',
        memo: '유효기간 2028년까지 확인 완료. 비상 구급배낭 2호에 수납.',
        status: '불출완료',
        created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
        id: 5,
        item_category: '통신/전자',
        item_name: '무전기 충전용 리튬배터리 (BA-6847)',
        quantity: 3,
        unit: 'EA',
        user_name: '통신소대 일병 정해인',
        purpose: '대대 지휘망 통신 점검 및 비상 대기',
        memo: '완충 상태 전압 테스트(14.4V) 정상 확인. 내일 18:00 반납 예정.',
        status: '사용중',
        created_at: new Date(Date.now() - 86400000).toISOString()
    }
];

let allLedgerData = [];

// ==========================================
// 1. 초기화 및 Supabase 클라이언트 연결
// ==========================================
function initApp() {
    const isExampleKey = SUPABASE_URL.includes("your-project-id") ||
        SUPABASE_ANON_KEY.includes("...") ||
        SUPABASE_URL.includes("여기에_") ||
        SUPABASE_ANON_KEY.includes("여기에_") ||
        !SUPABASE_URL ||
        !SUPABASE_ANON_KEY;

    if (isExampleKey) {
        // 예시 키이거나 미입력인 경우: 데모 모드로 실행
        isDemoMode = true;
        updateStatusBadge(false, "DB 키 입력 필요 (데모 모드)");
        document.getElementById('api-key-banner').classList.remove('hidden');

        // 로컬에 저장된 데모 데이터가 있다면 로드
        const savedLocal = localStorage.getItem('demo_military_ledger');
        if (savedLocal) {
            try {
                mockLedgerList = JSON.parse(savedLocal);
            } catch (e) {
                console.error(e);
            }
        }
        allLedgerData = [...mockLedgerList];
        renderLedgerTable(allLedgerData);
        updateStatistics(allLedgerData);
        hideLoading();
    } else {
        // 실제 Supabase 클라이언트 연결
        try {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            isDemoMode = false;
            updateStatusBadge(true, "Supabase DB 실시간 연결됨");
            document.getElementById('api-key-banner').classList.add('hidden');
            fetchLedgerList();
        } catch (error) {
            console.error("Supabase 초기화 오류:", error);
            isDemoMode = true;
            updateStatusBadge(false, "DB 연결 오류 (데모 모드 전환)");
            document.getElementById('api-key-banner').classList.remove('hidden');
            allLedgerData = [...mockLedgerList];
            renderLedgerTable(allLedgerData);
            updateStatistics(allLedgerData);
            hideLoading();
        }
    }
}

// 상단 DB 상태 뱃지 업데이트
function updateStatusBadge(isConnected, message) {
    const dot = document.getElementById('db-status-dot');
    const text = document.getElementById('db-status-text');
    if (!dot || !text) return;

    if (isConnected) {
        dot.className = "w-2 h-2 rounded-full bg-emerald-400";
        text.className = "text-emerald-400 font-semibold";
        text.textContent = message;
    } else {
        dot.className = "w-2 h-2 rounded-full bg-amber-400 animate-pulse";
        text.className = "text-amber-400 font-medium";
        text.textContent = message;
    }
}

// ==========================================
// 2. 데이터 불러오기 (Read)
// ==========================================
async function fetchLedgerList() {
    showLoading();

    if (isDemoMode) {
        allLedgerData = [...mockLedgerList];
        applyFilters();
        updateStatistics(allLedgerData);
        hideLoading();
        return;
    }

    try {
        const { data, error } = await supabase
            .from('military_supply_ledger')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        allLedgerData = data || [];
        applyFilters();
        updateStatistics(allLedgerData);
    } catch (error) {
        console.error("데이터 조회 실패:", error);
        alert(`Supabase 데이터 조회 오류: ${error.message}\n\n테이블이 생성되었는지 확인해주세요. (데모 모드로 전환합니다)`);
        isDemoMode = true;
        updateStatusBadge(false, "DB 테이블 확인 필요");
        allLedgerData = [...mockLedgerList];
        applyFilters();
        updateStatistics(allLedgerData);
    } finally {
        hideLoading();
    }
}

// ==========================================
// 3. 대장 등록하기 (Create)
// ==========================================
async function handleFormSubmit(event) {
    event.preventDefault();

    const submitBtn = document.getElementById('btn-submit');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1"></i> 저장 중...`;

    const category = document.getElementById('form-category').value;
    const name = document.getElementById('form-name').value.trim();
    const quantity = parseInt(document.getElementById('form-quantity').value, 10) || 1;
    const unit = document.getElementById('form-unit').value.trim() || 'EA';
    const user = document.getElementById('form-user').value.trim();
    const purpose = document.getElementById('form-purpose').value.trim();
    const status = document.getElementById('form-status').value;
    const memo = document.getElementById('form-memo').value.trim();

    const newRecord = {
        item_category: category,
        item_name: name,
        quantity: quantity,
        unit: unit,
        user_name: user,
        purpose: purpose,
        status: status,
        memo: memo || '특이사항 없음',
        created_at: new Date().toISOString()
    };

    try {
        if (isDemoMode) {
            // 데모 모드일 때는 메모리/로컬스토리지에 저장
            newRecord.id = Date.now();
            mockLedgerList.unshift(newRecord);
            localStorage.setItem('demo_military_ledger', JSON.stringify(mockLedgerList));
            allLedgerData = [...mockLedgerList];

            alert('✅ 대장이 성공적으로 등록되었습니다! (데모 모드 저장)');
        } else {
            // 실제 Supabase 데이터베이스에 INSERT
            const { data, error } = await supabase
                .from('military_supply_ledger')
                .insert([newRecord])
                .select();

            if (error) throw error;
            alert('✅ 군 보급품 사용 대장이 Supabase DB에 안전하게 기록되었습니다!');
            await fetchLedgerList();
        }

        // 폼 초기화
        document.getElementById('supply-ledger-form').reset();
        document.getElementById('form-quantity').value = "1";
        document.getElementById('form-unit').value = "EA";

        applyFilters();
        updateStatistics(allLedgerData);

    } catch (error) {
        console.error("등록 실패:", error);
        alert(`등록 중 오류가 발생했습니다: ${error.message}`);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}

// ==========================================
// 4. 상태 변경 및 삭제 (Update & Delete)
// ==========================================
async function toggleStatus(id, currentStatus) {
    const nextStatus = currentStatus === '사용중' ? '반납완료' : '사용중';
    if (!confirm(`해당 품목의 상태를 [${nextStatus}]로 변경하시겠습니까?`)) return;

    if (isDemoMode) {
        const item = mockLedgerList.find(x => x.id === id);
        if (item) item.status = nextStatus;
        localStorage.setItem('demo_military_ledger', JSON.stringify(mockLedgerList));
        allLedgerData = [...mockLedgerList];
        applyFilters();
        updateStatistics(allLedgerData);
        return;
    }

    try {
        const { error } = await supabase
            .from('military_supply_ledger')
            .update({ status: nextStatus })
            .eq('id', id);

        if (error) throw error;
        await fetchLedgerList();
    } catch (error) {
        alert(`상태 변경 오류: ${error.message}`);
    }
}

async function deleteLedgerItem(id) {
    if (!confirm('정말로 이 보급품 사용 기록을 삭제하시겠습니까?')) return;

    if (isDemoMode) {
        mockLedgerList = mockLedgerList.filter(x => x.id !== id);
        localStorage.setItem('demo_military_ledger', JSON.stringify(mockLedgerList));
        allLedgerData = [...mockLedgerList];
        applyFilters();
        updateStatistics(allLedgerData);
        return;
    }

    try {
        const { error } = await supabase
            .from('military_supply_ledger')
            .delete()
            .eq('id', id);

        if (error) throw error;
        await fetchLedgerList();
    } catch (error) {
        alert(`삭제 오류: ${error.message}`);
    }
}

// ==========================================
// 5. 테이블 렌더링 및 필터링
// ==========================================
function applyFilters() {
    const categoryFilter = document.getElementById('filter-category').value;
    const statusFilter = document.getElementById('filter-status').value;
    const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();

    const filtered = allLedgerData.filter(item => {
        const matchCategory = categoryFilter === 'ALL' || item.item_category === categoryFilter;
        const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;

        const matchSearch = !searchTerm ||
            (item.item_name && item.item_name.toLowerCase().includes(searchTerm)) ||
            (item.user_name && item.user_name.toLowerCase().includes(searchTerm)) ||
            (item.purpose && item.purpose.toLowerCase().includes(searchTerm)) ||
            (item.memo && item.memo.toLowerCase().includes(searchTerm));

        return matchCategory && matchStatus && matchSearch;
    });

    renderLedgerTable(filtered);
}

function renderLedgerTable(list) {
    const tbody = document.getElementById('ledger-tbody');
    const table = document.getElementById('ledger-table');
    const emptyState = document.getElementById('empty-state');

    if (!list || list.length === 0) {
        table.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    table.classList.remove('hidden');

    tbody.innerHTML = list.map((item, index) => {
        const catClass = getCategoryBadgeClass(item.item_category);
        const statusClass = getStatusBadgeClass(item.status);
        const formattedDate = formatDate(item.created_at || item.used_at);
        const safeMemo = (item.memo || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
        const safeName = (item.item_name || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
        const safeUser = (item.user_name || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');

        return `
            <tr class="transition hover:bg-slate-800/40">
                <td class="py-3 px-4 font-mono text-slate-500">${list.length - index}</td>
                <td class="py-3 px-4">
                    <span class="badge-category ${catClass}">${item.item_category}</span>
                </td>
                <td class="py-3 px-4 font-semibold text-slate-100 flex items-center space-x-1.5">
                    <span>${escapeHtml(item.item_name)}</span>
                </td>
                <td class="py-3 px-4 text-center font-bold text-emerald-400">
                    ${item.quantity} <span class="text-[10px] text-slate-400 font-normal">${item.unit || 'EA'}</span>
                </td>
                <td class="py-3 px-4 text-slate-300">
                    <i class="fa-regular fa-user text-slate-500 mr-1"></i>${escapeHtml(item.user_name)}
                </td>
                <td class="py-3 px-4 text-slate-300 max-w-xs truncate" title="${escapeHtml(item.purpose)}">
                    ${escapeHtml(item.purpose)}
                </td>
                <td class="py-3 px-4">
                    ${item.memo ? `
                        <button onclick="openMemoModal('${safeName}', '${safeUser}', '${formattedDate}', '${safeMemo}')" class="inline-flex items-center space-x-1 text-amber-400 hover:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[11px] transition">
                            <i class="fa-regular fa-comment-dots"></i>
                            <span>메모 보기</span>
                        </button>
                    ` : '<span class="text-slate-600">-</span>'}
                </td>
                <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusClass}">
                        ${item.status || '불출완료'}
                    </span>
                </td>
                <td class="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap font-mono">
                    ${formattedDate}
                </td>
                <td class="py-3 px-4 text-center whitespace-nowrap space-x-1">
                    ${item.status === '사용중' ? `
                        <button onclick="toggleStatus(${item.id}, '${item.status}')" title="반납 완료 처리" class="p-1 px-2 rounded bg-blue-900/40 hover:bg-blue-800 border border-blue-700/50 text-blue-300 text-[10px]">
                            반납
                        </button>
                    ` : ''}
                    <button onclick="deleteLedgerItem(${item.id})" title="기록 삭제" class="p-1 px-1.5 rounded hover:bg-red-900/40 text-slate-500 hover:text-red-400 transition text-[11px]">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// ==========================================
// 6. 통계 카드 업데이트
// ==========================================
function updateStatistics(list) {
    const totalEl = document.getElementById('stat-total');
    const todayEl = document.getElementById('stat-today');
    const memoEl = document.getElementById('stat-memo');
    const activeEl = document.getElementById('stat-active');

    const total = list.length;
    const todayString = new Date().toISOString().slice(0, 10);

    const todayCount = list.filter(item => {
        const itemDate = (item.created_at || '').slice(0, 10);
        return itemDate === todayString;
    }).length;

    const memoCount = list.filter(item => item.memo && item.memo.trim().length > 0 && item.memo !== '특이사항 없음').length;
    const activeCount = list.filter(item => item.status === '사용중').length;

    if (totalEl) totalEl.textContent = total;
    if (todayEl) todayEl.textContent = todayCount;
    if (memoEl) memoEl.textContent = memoCount;
    if (activeEl) activeEl.textContent = activeCount;
}

// ==========================================
// 7. 유틸리티 함수들
// ==========================================
function getCategoryBadgeClass(category) {
    switch (category) {
        case '장구/탄약': return 'cat-gear';
        case '급양/부식': return 'cat-food';
        case '피복류': return 'cat-cloth';
        case '의무/방역': return 'cat-med';
        case '통신/전자': return 'cat-comm';
        default: return 'cat-default';
    }
}

function getStatusBadgeClass(status) {
    switch (status) {
        case '불출완료': return 'badge-status-out';
        case '사용중': return 'badge-status-active';
        case '반납완료': return 'badge-status-returned';
        case '정비/수리': return 'badge-status-fix';
        default: return 'badge-status-out';
    }
}

function formatDate(isoString) {
    if (!isoString) return '-';
    try {
        const date = new Date(isoString);
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const h = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        return `${y}-${m}-${d} ${h}:${min}`;
    } catch {
        return isoString;
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showLoading() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.classList.remove('hidden');
}

function hideLoading() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.classList.add('hidden');
}

// 빠른 품목 자동입력
function fillQuickItem(cat, name, qty, unit, purpose) {
    document.getElementById('form-category').value = cat;
    document.getElementById('form-name').value = name;
    document.getElementById('form-quantity').value = qty;
    document.getElementById('form-unit').value = unit;
    document.getElementById('form-purpose').value = purpose;
    document.getElementById('form-name').focus();
}

// 상단 모달 열기
function openFormModal() {
    window.scrollTo({ top: 300, behavior: 'smooth' });
    document.getElementById('form-name').focus();
}

// 메모 모달 제어
function openMemoModal(item, user, date, content) {
    document.getElementById('modal-memo-item').textContent = `${item} - 특이사항 메모`;
    document.getElementById('modal-memo-user').textContent = user;
    document.getElementById('modal-memo-date').textContent = date;
    document.getElementById('modal-memo-content').textContent = content || '기록된 메모 내용이 없습니다.';
    document.getElementById('memo-modal').classList.remove('hidden');
}

function closeMemoModal() {
    document.getElementById('memo-modal').classList.add('hidden');
}

// Supabase 설정 모달 제어 (웹 브라우저에서 바로 키 입력 지원)
function openConfigModal() {
    document.getElementById('config-url').value = localStorage.getItem('supabase_url') || (DEFAULT_SUPABASE_URL.includes("여기에_") ? "" : DEFAULT_SUPABASE_URL);
    document.getElementById('config-key').value = localStorage.getItem('supabase_key') || (DEFAULT_SUPABASE_ANON_KEY.includes("여기에_") ? "" : DEFAULT_SUPABASE_ANON_KEY);
    document.getElementById('config-modal').classList.remove('hidden');
}

function closeConfigModal() {
    document.getElementById('config-modal').classList.add('hidden');
}

function saveSupabaseConfig() {
    const url = document.getElementById('config-url').value.trim();
    const key = document.getElementById('config-key').value.trim();

    if (!url || !key) {
        alert('Supabase URL과 anon public key를 모두 입력해주세요.');
        return;
    }

    localStorage.setItem('supabase_url', url);
    localStorage.setItem('supabase_key', key);
    SUPABASE_URL = url;
    SUPABASE_ANON_KEY = key;

    closeConfigModal();
    alert('Supabase 정보가 저장되었습니다. 화면을 새로고침하여 DB에 연결합니다.');
    location.reload();
}

function resetToDemo() {
    localStorage.removeItem('supabase_url');
    localStorage.removeItem('supabase_key');
    closeConfigModal();
    alert('데모 모드로 초기화되었습니다.');
    location.reload();
}

// 앱 실행
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

