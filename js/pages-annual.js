// ═══════════════════════════════════════
// ANNUAL
// ═══════════════════════════════════════
function renderAnnual() {
  ensureMonthStructures();
  const months=[1,2,3,4,5,6,7,8,9,10,11,12];
  const mN=['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  const all=S.persons;

  const year = currentYear();
  const totals=months.map(m=>all.reduce((s,n)=>s+(S.getA(year, n)[m]||0),0));
  const maxT=Math.max(...totals,0.1);
  document.querySelector('#page-annual .card-hdr .card-title').textContent = `📈 ${year}년 월별 휴가 추이 (전체 합산)`;
  document.querySelectorAll('#page-annual .card-hdr .card-title')[1].textContent = `📋 ${year}년 직원별 월별 휴가`;
  document.getElementById('an-trend').innerHTML=totals.map((v,i)=>{
    const pct=(v/maxT)*100;
    const c=v>5?'var(--red)':v>2?'var(--ylw)':v>0?'var(--acc)':'var(--s2)';
    return `<div class="trend-col"><span style="font-size:8px;color:var(--muted);font-family:'JetBrains Mono',monospace;">${v>0?v.toFixed(1):''}</span>
      <div class="trend-bar" style="width:100%;background:${c};height:${Math.max(pct,v>0?4:1)}%;"></div></div>`;
  }).join('');
  document.getElementById('an-mlbls').innerHTML=mN.map(m=>
    `<div style="flex:1;text-align:center;font-size:8px;color:var(--muted);font-family:'JetBrains Mono',monospace;">${m}</div>`
  ).join('');

  // Table header
  document.getElementById('an-thead').innerHTML='<th>이름</th>'+mN.map(m=>`<th>${m}</th>`).join('')+'<th>합계</th>';

  // Table body
  const tbody=document.getElementById('an-tbody');
  tbody.innerHTML='';
  all.forEach(name=>{
    const a=S.getA(year, name);
    const total=months.reduce((s,m)=>s+(a[m]||0),0);
    const tr=document.createElement('tr');
    let cells=`<td class="nc">${name}</td>`;
    months.forEach(()=>cells+=`<td style="text-align:center;"></td>`);
    cells+=`<td style="text-align:center;font-weight:700;"></td>`;
    tr.innerHTML=cells;

    months.forEach((m,i)=>{
      const td=tr.cells[i+1];
      const v=a[m]||0;
      td.innerHTML=v>0?`<span class="tag t-yellow">${v%1===0?v:v.toFixed(2)}</span>`:'—';
      makeEditable(td,v,'number',nv=>{
        a[m]=nv;
        const nt=months.reduce((s,mx)=>s+(a[mx]||0),0);
        tr.cells[13].innerHTML=`<span class="tag t-blue">${nt.toFixed(2)}</span>`;
      });
    });
    tr.cells[13].innerHTML=`<span class="tag t-blue">${total.toFixed(2)}</span>`;
    tbody.appendChild(tr);
  });

  // 2025 chart
  const d25=Object.entries(S.annual2025).sort((a,b)=>b[1]-a[1]);
  const m25=Math.max(...d25.map(d=>d[1]),0.1);
  document.getElementById('an-2025').innerHTML=d25.map(([n,v])=>{
    const c=v>10?'linear-gradient(90deg,var(--red),#f97316)':v>5?'linear-gradient(90deg,var(--ylw),#f59e0b)':'linear-gradient(90deg,var(--grn),#10b981)';
    return barRow(n,v,m25,c);
  }).join('');
}
