// ═══════════════════════════════════════
// LOCAL STORAGE — 자동 저장
// ═══════════════════════════════════════
const LS_KEY = 'wm_dashboard_v1';

function saveToLocalStorage() {
  try {
    ensureMonthStructures();
    ensureWeekendDates();
    const data = {
      currentMonth: S.currentMonth,
      monthKeys: S.monthKeys,
      monthLabels: S.monthLabels,
      persons: S.persons,
      monthly: S.monthly,
      annualByYear: S.annualByYear,
      annual2025: S.annual2025,
      weekend: S.weekend,
      weekendDates: S.weekendDates,
      weekendExempt: [...S.weekendExempt],
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(LS_KEY, JSON.stringify(data));
    updateLSStatus();
  } catch(e) { console.warn('저장 실패:', e); }
}

function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    applyImportedData(data);
    return data.savedAt;
  } catch(e) { return false; }
}

function applyImportedData(data) {
  if (data.currentMonth) S.currentMonth = data.currentMonth;
  if (data.monthKeys)    S.monthKeys = data.monthKeys;
  if (data.monthLabels)  S.monthLabels = data.monthLabels;
  if (data.persons)      S.persons      = data.persons;
  if (data.monthly)      S.monthly      = data.monthly;
  if (data.annualByYear) S.annualByYear = data.annualByYear;
  else if (data.annual2026) S.annualByYear = {'2026': data.annual2026};
  if (data.annual2025)   S.annual2025   = data.annual2025;
  if (data.weekend)      S.weekend      = data.weekend;
  if (data.weekendDates) S.weekendDates = data.weekendDates;
  S.weekendExempt = data.weekendExempt ? new Set(data.weekendExempt) : new Set();
  ensureMonthStructures();
  ensureWeekendDates();
}

function clearLocalStorage() {
  if (!confirm('브라우저에 저장된 데이터를 초기화하고 기본값으로 되돌릴까요?\n페이지가 새로고침됩니다.')) return;
  localStorage.removeItem(LS_KEY);
  location.reload();
}

function updateLSStatus() {
  const raw = localStorage.getItem(LS_KEY);
  const dot = document.getElementById('ls-dot');
  const info = document.getElementById('ls-info');
  if (!dot || !info) return;
  if (raw) {
    try {
      const d = JSON.parse(raw);
      const dt = new Date(d.savedAt);
      const fmt = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}:${String(dt.getSeconds()).padStart(2,'0')}`;
      info.textContent = '마지막 저장: ' + fmt;
      dot.style.background = 'var(--grn)';
    } catch(e) { info.textContent = '저장 데이터 손상'; dot.style.background='var(--red)'; }
  } else {
    info.textContent = '저장된 데이터 없음 (기본값 사용 중)';
    dot.style.background = 'var(--muted)';
  }
}
