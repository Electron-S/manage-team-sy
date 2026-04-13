// ═══════════════════════════════════════
// PERSONS
// ═══════════════════════════════════════
function renderPersons() {
  ensureMonthStructures();
  const mk=S.currentMonth;
  document.getElementById('pg-grid').innerHTML = S.persons.map(name=>{
    const m=S.getM(mk,name);
  const a=S.getA(currentYear(), name);
    const aTotal=a?Object.values(a).reduce((s,v)=>s+v,0):0;
    const a25=S.annual2025[name]||0;
    const exempt=S.isExempt(name);
    const rate=S.wkRate(name);
    const cnt=S.wkCount(name);
    const rc=exempt?'var(--muted)':rate>.5?'var(--red)':rate>.2?'var(--ylw)':'var(--grn)';
    const rateDisp=exempt
      ? `<span class="exempt-badge" style="font-size:9px;padding:1px 6px;">⚠ 예외</span>`
      : `<span style="color:${rc};font-size:10px;font-family:'JetBrains Mono',monospace;margin-left:auto;">${(rate*100).toFixed(1)}%</span>`;
    const pcBorder = exempt ? 'border-color:rgba(245,158,11,.25);opacity:.75;' : '';
    return `<div class="pc" style="${pcBorder}">
      <div class="pc-name">${name} ${rateDisp}</div>
      <div class="pc-stats">
        <div><div class="pc-sv" style="color:var(--ylw);">${m.vacation||'—'}</div><div class="pc-sl">이달휴가</div></div>
        <div><div class="pc-sv" style="color:var(--acc);">${aTotal.toFixed(1)}</div><div class="pc-sl">${currentYear().slice(2)}년합계</div></div>
        <div><div class="pc-sv" style="color:${exempt?'var(--muted)':'var(--cyn)'};">${exempt?'—':cnt}</div><div class="pc-sl">주말근무</div></div>
        <div><div class="pc-sv" style="color:var(--grn);">${a25}</div><div class="pc-sl">25년합계</div></div>
      </div>
      ${m.note?`<div class="pc-note">${m.note}</div>`:''}
    </div>`;
  }).join('');
}
