// ═══════════════════════════════════════
// OVERVIEW
// ═══════════════════════════════════════
function renderOverview() {
  ensureMonthStructures();
  const mk = S.currentMonth;
  const mdata = S.monthly[mk]||{};
  const all = S.persons;
  const totalVac = all.reduce((s,n)=>s+(S.getM(mk,n).vacation||0),0);
  const nonZero = all.filter(n=>(S.getM(mk,n).vacation||0)>0).length;
  const topWk = all.reduce((b,n)=>{const c=S.wkCount(n);return c>b.c?{n,c}:b;},{n:'—',c:0});
  const topVac = all.reduce((b,n)=>{const v=S.getM(mk,n).vacation||0;return v>b.v?{n,v}:b;},{n:'—',v:0});

  document.getElementById('ov-kpi').innerHTML = `
    <div class="kpi blue"><div class="kpi-lbl">전체 인원</div><div class="kpi-val">${all.length}</div><div class="kpi-sub">등록 직원</div></div>
    <div class="kpi yellow"><div class="kpi-lbl">이달 휴가 합계</div><div class="kpi-val">${totalVac.toFixed(1)}</div><div class="kpi-sub">${S.monthLabels[mk]||mk}</div></div>
    <div class="kpi green"><div class="kpi-lbl">최고 주말 근무</div><div class="kpi-val">${topWk.c}</div><div class="kpi-sub">${topWk.n}</div></div>
    <div class="kpi red"><div class="kpi-lbl">이달 휴가 최다</div><div class="kpi-val">${topVac.v}</div><div class="kpi-sub">${topVac.n}</div></div>
    <div class="kpi cyan"><div class="kpi-lbl">휴가 사용자</div><div class="kpi-val">${nonZero}</div><div class="kpi-sub">1일 이상</div></div>
  `;
  document.getElementById('ov-mlbl').textContent = S.monthLabels[mk]||mk;

  const maxVac = Math.max(...all.map(n=>S.getM(mk,n).vacation||0),0.1);
  document.getElementById('ov-vac').innerHTML = all.map(n=>barRow(n,S.getM(mk,n).vacation||0,maxVac,'linear-gradient(90deg,var(--acc),var(--acc2))')).join('');

  const wkArr = all.map(n=>({n,c:S.wkCount(n),exempt:S.isExempt(n)})).sort((a,b)=>b.c-a.c);
  const maxWk = Math.max(...wkArr.filter(d=>!d.exempt).map(d=>d.c),0.1);
  document.getElementById('ov-wk').innerHTML = wkArr.map(d=>{
    if(d.exempt) {
      return `<div class="bar-row" style="opacity:.4;">
        <span class="bar-lbl" title="${d.n}" style="text-decoration:line-through;">${d.n}</span>
        <div class="bar-track" style="flex:1;"><div style="height:100%;background:repeating-linear-gradient(45deg,var(--s2),var(--s2) 3px,#1a2030 3px,#1a2030 6px);border-radius:4px;"></div></div>
        <span class="bar-val" style="font-size:9px;color:var(--muted);">예외</span>
      </div>`;
    }
    return barRow(d.n,d.c,maxWk,'linear-gradient(90deg,var(--grn),#10b981)');
  }).join('');

  const tbody = document.getElementById('ov-tbody');
  tbody.innerHTML = '';
  all.forEach(name => {
    const m = S.getM(mk,name);
    const exempt = S.isExempt(name);
    const rate = S.wkRate(name);
    const cnt = S.wkCount(name);
    const rc = rate>.5?'var(--red)':rate>.2?'var(--ylw)':'var(--grn)';
    const tr = document.createElement('tr');
    if(exempt) tr.className='exempt-tr';
    tr.innerHTML = `
      <td class="nc">${name}${exempt?` <span class="exempt-badge" style="font-size:9px;padding:1px 6px;">⚠ 예외</span>`:''}</td>
      <td></td><td></td><td></td>
      <td>${exempt ? `<span class="exempt-badge">면제</span>` : `<span style="color:${rc};font-family:'JetBrains Mono',monospace;font-weight:700;">${(rate*100).toFixed(1)}%</span>`}</td>
      <td>${exempt ? '—' : `<span class="tag t-blue">${cnt}</span>`}</td>
      <td></td>
      <td>${isAdmin()?`<button class="btn-del" onclick="openDelete('${name}')">삭제</button>`:''}</td>
    `;
    editNumTd(tr.cells[1], m.vacation, v=>{ m.vacation=v; });
    editNumTdBlue(tr.cells[2], m.overtime, v=>{ m.overtime=v; });
    editNumTdBlue(tr.cells[3], m.weekend, v=>{ m.weekend=v; });
    editTextTd(tr.cells[6], m.note, v=>{ m.note=v; });
    tbody.appendChild(tr);
  });
}
