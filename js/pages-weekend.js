// ═══════════════════════════════════════
// WEEKEND
// ═══════════════════════════════════════
function renderWeekend() {
  ensureWeekendDates();
  const dates = S.weekendDates;
  const all = S.allPersons;
  const active = all.filter(n=>!S.isExempt(n));
  const totalWork = active.reduce((s,n)=>s+S.wkCount(n),0);
  const avgRate = active.length ? active.reduce((s,n)=>s+S.wkRate(n),0)/active.length : 0;
  const exemptCount = all.filter(n=>S.isExempt(n)).length;

  document.getElementById('wk-kpi').innerHTML = `
    <div class="kpi blue"><div class="kpi-lbl">전체 인원</div><div class="kpi-val">${all.length}</div><div class="kpi-sub">등록</div></div>
    <div class="kpi green"><div class="kpi-lbl">배정 대상</div><div class="kpi-val">${active.length}</div><div class="kpi-sub">예외 제외</div></div>
    <div class="kpi yellow"><div class="kpi-lbl">예외 인원</div><div class="kpi-val">${exemptCount}</div><div class="kpi-sub">주말근무 면제</div></div>
    <div class="kpi cyan"><div class="kpi-lbl">평균 근무율</div><div class="kpi-val">${(avgRate*100).toFixed(1)}%</div><div class="kpi-sub">배정 대상 평균</div></div>
    <div class="kpi green"><div class="kpi-lbl">총 근무 일수</div><div class="kpi-val">${totalWork.toFixed(1)}</div><div class="kpi-sub">배정 대상 합산</div></div>
  `;

  // Heatmap — 예외 인원은 흐리게 + 줄무늬 처리
  let hm = `<div style="display:flex;gap:2px;margin-bottom:6px;align-items:flex-end;">
    <div style="width:80px;flex-shrink:0;"></div>`;
  dates.forEach(d=>{
    const mm=d.slice(5,7),dd=d.slice(8,10);
    hm+=`<div class="hm-date-lbl">${mm}/${dd}</div>`;
  });
  hm+='</div>';

  all.forEach(name=>{
    const exempt = S.isExempt(name);
    const w=S.getW(name);
    const rowCls = exempt ? ' hm-exempt-row' : '';
    const nameCls = exempt ? ' hm-exempt-name' : '';
    hm+=`<div style="display:flex;gap:2px;margin-bottom:3px;align-items:center;" class="${rowCls}">
      <div style="width:80px;flex-shrink:0;display:flex;align-items:center;gap:4px;">
        <div class="hm-name-cell${nameCls}" title="${name}" style="width:58px;">${name}</div>
        ${exempt ? `<span title="주말근무 예외" style="font-size:9px;color:var(--ylw);">⚠</span>` : ''}
      </div>`;
    dates.forEach(d=>{
      if (exempt) {
        hm+=`<div class="hm-cell hm-cell-exempt" title="${name}: 주말근무 예외 처리됨"></div>`;
      } else {
        const s=w.dates[d]||'';
        let cls='hm-off',txt='';
        if(s==='종일'){cls='hm-full';txt='●';}
        else if(s==='반일'){cls='hm-half';txt='◐';}
        hm+=`<div class="hm-cell ${cls}" title="${name} ${d}: ${s||'휴무'}" onclick="cycleWk('${name}','${d}')">${txt}</div>`;
      }
    });
    hm+='</div>';
  });

  // 범례
  hm += `<div style="display:flex;gap:14px;margin-top:10px;flex-wrap:wrap;">
    <div style="display:flex;align-items:center;gap:5px;font-size:10px;color:var(--muted);">
      <div style="width:12px;height:12px;border-radius:3px;background:var(--acc);"></div>종일
    </div>
    <div style="display:flex;align-items:center;gap:5px;font-size:10px;color:var(--muted);">
      <div style="width:12px;height:12px;border-radius:3px;background:var(--cyn);"></div>반일
    </div>
    <div style="display:flex;align-items:center;gap:5px;font-size:10px;color:var(--muted);">
      <div style="width:12px;height:12px;border-radius:3px;background:repeating-linear-gradient(45deg,var(--s2),var(--s2) 3px,#1a2030 3px,#1a2030 6px);"></div>예외 (면제)
    </div>
  </div>`;
  document.getElementById('wk-heatmap').innerHTML=hm;

  // Table — 예외 인원은 행 스타일 다르게
  const sorted = [...all].sort((a,b)=>{
    // exempt 인원은 맨 아래
    if(S.isExempt(a) && !S.isExempt(b)) return 1;
    if(!S.isExempt(a) && S.isExempt(b)) return -1;
    return S.wkCount(b)-S.wkCount(a);
  });
  document.getElementById('wk-tbody').innerHTML = sorted.map(name=>{
    const exempt = S.isExempt(name);
    const d=S.getW(name);
    const full=Object.values(d.dates).filter(s=>s==='종일').length;
    const half=Object.values(d.dates).filter(s=>s==='반일').length;
    const rate=S.wkRate(name); const cnt=S.wkCount(name);
    const rc=rate>.5?'var(--red)':rate>.2?'var(--ylw)':'var(--grn)';
    const sc=rate>.5?'t-red':rate>.2?'t-yellow':'t-green';
    const st=rate>.5?'높음':rate>.15?'보통':'낮음';
    const trCls = exempt ? ' class="exempt-tr"' : '';
    const rateTd = exempt
      ? `<span class="exempt-badge">⚠ 예외</span>`
      : `<span style="color:${rc};font-family:'JetBrains Mono',monospace;font-weight:700;">${(rate*100).toFixed(1)}%</span>`;
    const statTd = exempt
      ? `<span class="tag t-gray">면제</span>`
      : `<span class="tag ${sc}">${st}</span>`;
    const toggleLabel = exempt ? '✓ 근무 복귀' : '예외 설정';
    const toggleCls = exempt ? 'toggle-exempt active' : 'toggle-exempt';
    return `<tr${trCls}>
      <td class="nc">${name}</td>
      <td>${rateTd}</td>
      <td>${exempt ? '—' : `<span class="tag t-blue">${cnt}</span>`}</td>
      <td>${exempt ? '—' : `<span class="tag t-blue">${full}</span>`}</td>
      <td>${exempt ? '—' : `<span class="tag t-cyan">${half}</span>`}</td>
      <td>${statTd}</td>
      <td><button class="${toggleCls}" onclick="toggleExempt('${name}')">${toggleLabel}</button></td>
    </tr>`;
  }).join('');
}

function cycleWk(name, date) {
  if (!isAdmin()) return; // 관리자만 편집 가능
  if (S.isExempt(name)) return; // 예외 인원은 셀 클릭 무시
  History.push();
  const d=S.getW(name);
  const cur=d.dates[date]||'';
  if(!cur) d.dates[date]='종일';
  else if(cur==='종일') d.dates[date]='반일';
  else delete d.dates[date];
  renderWeekend();
  notifySaved();
}

function openAddWeekendDate() {
  if (!isAdmin()) return;
  ensureWeekendDates();
  const input = prompt('추가할 근무일을 입력하세요. 예: 2026-05-05');
  if (!input) return;
  const date = input.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    toast('❌ 날짜 형식은 YYYY-MM-DD 이어야 합니다.');
    return;
  }
  if (S.weekendDates.includes(date)) {
    toast('이미 등록된 근무일입니다.');
    return;
  }
  History.push();
  S.weekendDates.push(date);
  ensureWeekendDates();
  renderWeekend();
  notifySaved();
  toast(`✓ ${date} 근무일 추가됨`);
}

function toggleExempt(name) {
  if (!isAdmin()) return; // 관리자만 변경 가능
  History.push();
  S.toggleExempt(name);
  renderAll();
  const isNowExempt = S.isExempt(name);
  toast(isNowExempt
    ? `⚠ ${name} — 주말근무 예외 처리됨`
    : `✓ ${name} — 주말근무 배정 복귀`
  );
}
