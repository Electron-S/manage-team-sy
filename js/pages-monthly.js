// ═══════════════════════════════════════
// MONTHLY
// ═══════════════════════════════════════
function renderMonthly() {
  ensureMonthStructures();
  document.getElementById('mo-tabs').innerHTML = S.monthKeys.map(mk=>
    `<div class="month-btn${mk===S.currentMonth?' active':''}" onclick="setMonth('${mk}')">${monthLabel(mk)}</div>`
  ).join('');

  const mk = S.currentMonth;
  const all = S.persons;
  document.getElementById('mo-title').textContent = (S.monthLabels[mk]||mk)+' 근태 상세';

  const totalVac = all.reduce((s,n)=>s+(S.getM(mk,n).vacation||0),0);
  const totalOT  = all.reduce((s,n)=>s+(S.getM(mk,n).overtime||0),0);
  const totalWk  = all.reduce((s,n)=>s+(S.getM(mk,n).weekend||0),0);
  const nonZero  = all.filter(n=>(S.getM(mk,n).vacation||0)>0).length;

  document.getElementById('mo-kpi').innerHTML = `
    <div class="kpi blue"><div class="kpi-lbl">인원</div><div class="kpi-val">${all.length}</div><div class="kpi-sub">대상</div></div>
    <div class="kpi yellow"><div class="kpi-lbl">총 휴가</div><div class="kpi-val">${totalVac.toFixed(2)}</div><div class="kpi-sub">합산</div></div>
    <div class="kpi red"><div class="kpi-lbl">총 야근</div><div class="kpi-val">${totalOT}</div><div class="kpi-sub">합산</div></div>
    <div class="kpi cyan"><div class="kpi-lbl">총 주말특근</div><div class="kpi-val">${totalWk}</div><div class="kpi-sub">합산</div></div>
    <div class="kpi green"><div class="kpi-lbl">휴가 사용자</div><div class="kpi-val">${nonZero}</div><div class="kpi-sub">1일 이상</div></div>
  `;

  const tbody = document.getElementById('mo-tbody');
  tbody.innerHTML='';
  all.forEach(name => {
    const r = S.getM(mk, name);
    const tr = document.createElement('tr');
    tr.innerHTML = `<td class="nc">${name}</td><td></td><td></td><td></td><td></td><td>${isAdmin()?`<button class="btn-del" onclick="openDelete('${name}')">삭제</button>`:''}</td>`;
    editNumTd(tr.cells[1], r.vacation, v=>{ r.vacation=v; });
    editNumTdBlue(tr.cells[2], r.overtime, v=>{ r.overtime=v; });
    editNumTdBlue(tr.cells[3], r.weekend, v=>{ r.weekend=v; });
    editTextTd(tr.cells[4], r.note, v=>{ r.note=v; });
    tbody.appendChild(tr);
  });

  const maxV = Math.max(...all.map(n=>S.getM(mk,n).vacation||0), 0.1);
  document.getElementById('mo-chart').innerHTML = all.map(n=>barRow(n,S.getM(mk,n).vacation||0,maxV,'linear-gradient(90deg,var(--acc),var(--acc2))')).join('');
}

function setMonth(mk) {
  S.currentMonth = mk;
  renderAll();
}

function openAddMonth() {
  if (!isAdmin()) return;
  ensureMonthStructures();
  const latestMonth = [...S.monthKeys].sort(compareMonthKey).at(-1);
  if (!latestMonth) return;
  const [yearStr, monthStr] = latestMonth.split('.');
  const latestYear = Number(yearStr);
  const latestMonthNum = Number(monthStr);
  const nextYear = latestMonthNum === 12 ? latestYear + 1 : latestYear;
  const nextMonthNum = latestMonthNum === 12 ? 1 : latestMonthNum + 1;
  const mk = `${nextYear}.${String(nextMonthNum).padStart(2,'0')}`;
  if (S.monthKeys.includes(mk)) {
    setMonth(mk);
    toast(`${monthLabel(mk)}이 이미 등록되어 있어 해당 월로 이동합니다.`);
    return;
  }
  History.push();
  S.monthKeys.push(mk);
  S.monthKeys.sort(compareMonthKey);
  const [year, month] = mk.split('.');
  S.monthLabels[mk] = `${year}년 ${Number(month)}월`;
  S.monthly[mk] = {};
  S.persons.forEach(name => S.getM(mk, name));
  S.currentMonth = mk;
  curPage = 'monthly';
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t=>t.classList.remove('active'));
  document.getElementById('page-monthly').classList.add('active');
  document.querySelector('.nav-tab[data-page="monthly"]').classList.add('active');
  renderPage(curPage);
  notifySaved();
  toast(`✓ ${monthLabel(mk)} 추가됨`);
}
