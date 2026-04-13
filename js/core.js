// ═══════════════════════════════════════
// PAGE SWITCHING
// ═══════════════════════════════════════
let curPage = 'overview';
function switchPage(el) {
  const page = el.dataset.page;
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t=>t.classList.remove('active'));
  document.getElementById('page-'+page).classList.add('active');
  el.classList.add('active');
  curPage = page;
  renderPage(page);
}
function renderPage(p) {
  if(p==='overview') renderOverview();
  else if(p==='monthly') renderMonthly();
  else if(p==='weekend') renderWeekend();
  else if(p==='annual') renderAnnual();
  else if(p==='persons') renderPersons();
  else if(p==='manage') renderManage();
}
function renderAll() { renderPage(curPage); notifySaved(); }

// ═══════════════════════════════════════
// UTILS
// ═══════════════════════════════════════
function notifySaved() {
  saveToLocalStorage();
  History.updateButtons();
  notifyBadge('✓ 저장됨');
}
function notifyBadge(msg) {
  const b = document.getElementById('savedBadge');
  b.textContent = msg;
  b.style.opacity='1';
  setTimeout(()=>b.style.opacity='0', 2000);
}
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent=msg; t.style.display='block';
  setTimeout(()=>t.style.display='none',2300);
}
function barRow(label, value, maxVal, color) {
  const pct = maxVal>0 ? Math.round((value/maxVal)*100) : 0;
  const disp = value>0 ? (value%1===0 ? value : value.toFixed(2)) : '';
  return `<div class="bar-row">
    <span class="bar-lbl" title="${label}">${label}</span>
    <div class="bar-track"><div class="bar-fill" style="width:${Math.max(pct,value>0?5:0)}%;background:${color};">${disp}</div></div>
    <span class="bar-val">${value>0?(value%1===0?value:value.toFixed(2)):'—'}</span>
  </div>`;
}

function monthLabel(mk) {
  return S.monthLabels[mk] || mk;
}

function yearFromMonthKey(mk) {
  return String(mk).split('.')[0];
}

function currentYear() {
  return yearFromMonthKey(S.currentMonth);
}

function compareDateKey(a, b) {
  return String(a).localeCompare(String(b));
}

function compareMonthKey(a, b) {
  const [ay, am] = String(a).split('.').map(Number);
  const [by, bm] = String(b).split('.').map(Number);
  return (ay - by) || (am - bm);
}

function sanitizeRosterData() {
  const personSet = new Set(S.persons || []);
  Object.keys(S.monthly || {}).forEach(mk => {
    const rows = S.monthly[mk] || {};
    Object.keys(rows).forEach(name => {
      if (!personSet.has(name)) delete rows[name];
    });
  });
  Object.keys(S.annualByYear || {}).forEach(year => {
    const rows = S.annualByYear[year] || {};
    Object.keys(rows).forEach(name => {
      if (!personSet.has(name)) delete rows[name];
    });
  });
  Object.keys(S.annual2025 || {}).forEach(name => {
    if (!personSet.has(name)) delete S.annual2025[name];
  });
}

function ensureMonthStructures() {
  sanitizeRosterData();
  const monthlyKeys = Object.keys(S.monthly || {});
  const mergedKeys = new Set([...(S.monthKeys || []), ...monthlyKeys]);
  S.monthKeys = [...mergedKeys].sort(compareMonthKey);
  if (!S.monthLabels) S.monthLabels = {};
  S.monthKeys.forEach(mk => {
    const year = yearFromMonthKey(mk);
    const [, month] = mk.split('.');
    if (!S.monthLabels[mk] && year && month) {
      S.monthLabels[mk] = `${year}년 ${Number(month)}월`;
    }
    if (!S.monthly[mk]) S.monthly[mk] = {};
    S.persons.forEach(name => S.getM(mk, name));
    S.persons.forEach(name => S.getA(year, name));
  });
  if (!S.monthKeys.includes(S.currentMonth)) {
    S.currentMonth = S.monthKeys[S.monthKeys.length - 1] || S.currentMonth;
  }
}

function ensureWeekendDates() {
  S.weekendDates = [...new Set(S.weekendDates || [])].sort(compareDateKey);
}
