// ═══════════════════════════════════════
// MANAGE
// ═══════════════════════════════════════
function renderManage() {
  ensureMonthStructures();
  const tbody=document.getElementById('mg-tbody');
  tbody.innerHTML='';
  S.persons.forEach((name,i)=>{
    const a=S.getA(currentYear(), name);
    const aTotal=a?Object.values(a).reduce((s,v)=>s+v,0):0;
    const rate=S.wkRate(name);
    const exempt=S.isExempt(name);
    const rc=exempt?'var(--muted)':rate>.5?'var(--red)':rate>.2?'var(--ylw)':'var(--grn)';
    const a25=S.annual2025[name]||0;
    const mk=S.currentMonth;
    const mdata=S.getM(mk,name);

    const tr=document.createElement('tr');
    if(exempt) tr.className='exempt-tr';
    tr.innerHTML=`
      <td style="color:var(--muted);font-family:'JetBrains Mono',monospace;">${i+1}</td>
      <td class="nc">${name}</td>
      <td></td>
      <td style="text-align:center;"><span class="tag t-blue">${aTotal.toFixed(1)}</span></td>
      <td>${exempt ? `<span class="exempt-badge">⚠ 예외</span>` : `<span style="color:${rc};font-family:'JetBrains Mono',monospace;font-weight:700;">${(rate*100).toFixed(1)}%</span>`}</td>
      <td style="text-align:center;"></td>
      <td>${isAdmin()?`<button class="${exempt?'toggle-exempt active':'toggle-exempt'}" onclick="toggleExempt('${name}')">${exempt?'✓ 근무 복귀':'예외 설정'}</button>`:''}</td>
      <td>${isAdmin()?`<button class="btn-del" onclick="openDelete('${name}')">삭제</button>`:''}</td>
    `;

    // name rename
    makeEditable(tr.cells[1], name, 'text', newName => {
      if (!newName || newName===name) return;
      if (S.allPersons.includes(newName)) { toast('이미 존재하는 이름입니다.'); return; }
      const pi=S.persons.indexOf(name);
      if(pi>-1) S.persons[pi]=newName;
      S.monthKeys.forEach(mk2=>{
        if(S.monthly[mk2]&&S.monthly[mk2][name]){S.monthly[mk2][newName]=S.monthly[mk2][name];delete S.monthly[mk2][name];}
      });
      Object.keys(S.annualByYear).forEach(year => {
        if (S.annualByYear[year] && S.annualByYear[year][name]) {
          S.annualByYear[year][newName] = S.annualByYear[year][name];
          delete S.annualByYear[year][name];
        }
      });
      if(S.annual2025[name]!==undefined){S.annual2025[newName]=S.annual2025[name];delete S.annual2025[name];}
      if(S.weekend[name]){S.weekend[newName]=S.weekend[name];delete S.weekend[name];}
      if(S.weekendExempt.has(name)){S.weekendExempt.delete(name);S.weekendExempt.add(newName);}
    });

    editTextTd(tr.cells[2], mdata.note, v=>{ mdata.note=v; });
    editNumTdBlue(tr.cells[5], a25, v=>{ S.annual2025[name]=v; });
    tbody.appendChild(tr);
  });
}
