// ═══════════════════════════════════════
// EXPORT MODAL
// ═══════════════════════════════════════
function openExportModal() {
  updateLSStatus();
  document.getElementById('exportModal').style.display='flex';
}
function closeExportModal() { document.getElementById('exportModal').style.display='none'; }

// ─────────────────────────────────────
// HTML 파일로 저장 — 현재 데이터를 내장한 새 HTML 생성
// ─────────────────────────────────────
async function saveAsHTML() {
  toast('⏳ HTML 생성 중...');
  ensureMonthStructures();
  ensureWeekendDates();

  // 원본 소스를 fetch로 가져옴 (outerHTML은 DOM 파싱으로 변형될 수 있음)
  let originalHTML;
  try {
    const resp = await fetch(location.href);
    originalHTML = await resp.text();
  } catch(e) {
    // fetch 실패(로컬 파일 등)시 outerHTML 폴백
    originalHTML = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
  }

  // weekendExempt: new Set([...]) 교체
  let newHTML = originalHTML.replace(
    /weekendExempt:\s*new Set\(\[[\s\S]*?\]\)/,
    `weekendExempt: new Set(${JSON.stringify([...S.weekendExempt])})`
  );

  newHTML = newHTML.replace(
    /currentMonth:\s*'[^']*'/,
    `currentMonth: '${S.currentMonth}'`
  );

  // persons 배열 교체
  newHTML = replaceDataBlock(newHTML, 'persons', JSON.stringify(S.persons));

  // monthly 객체 교체
  newHTML = replaceDataBlock(newHTML, 'monthly', JSON.stringify(S.monthly));

  // monthKeys 배열 교체
  newHTML = replaceDataBlock(newHTML, 'monthKeys', JSON.stringify(S.monthKeys));

  // monthLabels 객체 교체
  newHTML = replaceDataBlock(newHTML, 'monthLabels', JSON.stringify(S.monthLabels));

  // annualByYear 교체
  newHTML = replaceDataBlock(newHTML, 'annualByYear', JSON.stringify(S.annualByYear));

  // annual2025 교체
  newHTML = replaceDataBlock(newHTML, 'annual2025', JSON.stringify(S.annual2025));

  // weekend 교체
  newHTML = replaceDataBlock(newHTML, 'weekend', JSON.stringify(S.weekend));

  // weekendDates 교체
  newHTML = replaceDataBlock(newHTML, 'weekendDates', JSON.stringify(S.weekendDates));

  // 파일명: 날짜+시간
  const now = new Date();
  const stamp = now.getFullYear()
    + String(now.getMonth()+1).padStart(2,'0')
    + String(now.getDate()).padStart(2,'0')
    + '_'
    + String(now.getHours()).padStart(2,'0')
    + String(now.getMinutes()).padStart(2,'0');
  const filename = `근무일정_대시보드_${stamp}.html`;

  downloadBlob(new Blob([newHTML], {type:'text/html;charset=utf-8;'}), filename);
  toast(`✓ "${filename}" 저장 완료`);
}

// 정규식으로 `key: <값>` 블록을 교체하는 헬퍼
// 배열/객체 경계를 괄호 깊이로 추적
function replaceDataBlock(html, key, newValueStr) {
  // key 뒤의 첫 { 또는 [ 을 시작점으로 잡아 대응하는 닫는 괄호까지 교체
  const startPattern = new RegExp(`(\\b${key}:\\s*)([\\[{])`);
  const match = html.match(startPattern);
  if (!match) return html;

  const keyStart = html.indexOf(match[0]);
  if (keyStart === -1) return html;

  // 실제 값 시작 위치 ([ 또는 { 의 위치)
  const valStart = keyStart + match[1].length;
  const openChar = html[valStart];
  const closeChar = openChar === '[' ? ']' : '}';

  let depth = 0;
  let inStr = false;
  let strChar = '';
  let i = valStart;

  while (i < html.length) {
    const ch = html[i];
    if (inStr) {
      if (ch === '\\') { i += 2; continue; }
      if (ch === strChar) inStr = false;
    } else {
      if (ch === '"' || ch === "'") { inStr = true; strChar = ch; }
      else if (ch === openChar) depth++;
      else if (ch === closeChar) {
        depth--;
        if (depth === 0) {
          // valStart ~ i 를 newValueStr 로 교체
          return html.slice(0, valStart) + newValueStr + html.slice(i + 1);
        }
      }
    }
    i++;
  }
  return html; // 파싱 실패 시 원본 반환
}

// ── JSON 내보내기 ──
function exportJSON() {
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
    version: '1.0',
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json;charset=utf-8;'});
  downloadBlob(blob, 'data.json');
  toast('✓ data.json 다운로드 완료 — GitHub에 업로드하면 팀원들에게 반영됩니다');
}

// ── CSV 내보내기 ──
function exportCSV() {
  const rows = [['이름','주말근무예외','월','휴가(일)','야근','주말특근','비고']];
  S.monthKeys.forEach(mk => {
    S.persons.forEach(name => {
      const r = S.getM(mk, name);
      rows.push([name, S.isExempt(name)?'예외':'', S.monthLabels[mk]||mk,
        r.vacation, r.overtime, r.weekend, r.note]);
    });
  });
  const csv = rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  downloadBlob(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'}), '근무일정_' + dateStamp() + '.csv');
  toast('✓ CSV 다운로드 완료');
}

// ── XLSX 내보내기 (순수 JS, 외부 라이브러리 없이) ──
function exportXLSX() {
  // SheetJS CDN 로드 후 실행
  if (typeof XLSX !== 'undefined') { doXLSX(); return; }
  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
  s.onload = doXLSX;
  s.onerror = () => toast('❌ 네트워크 오류 — 오프라인 상태에서는 JSON/CSV를 사용해주세요.');
  document.head.appendChild(s);
}

function doXLSX() {
  const wb = XLSX.utils.book_new();

  // 시트 1: 월별 근태
  const monthData = [['이름','주말근무','월','휴가(일)','야근','주말특근','비고']];
  S.monthKeys.forEach(mk => {
    S.persons.forEach(name => {
      const r = S.getM(mk, name);
      monthData.push([name, S.isExempt(name)?'예외':'배정', S.monthLabels[mk]||mk,
        r.vacation, r.overtime, r.weekend, r.note]);
    });
  });
  const ws1 = XLSX.utils.aoa_to_sheet(monthData);
  ws1['!cols'] = [{wch:10},{wch:8},{wch:12},{wch:8},{wch:6},{wch:8},{wch:30}];
  XLSX.utils.book_append_sheet(wb, ws1, '월별근태');

  // 시트 2+: 연도별 연간
  const months = [1,2,3,4,5,6,7,8,9,10,11,12];
  const annualYears = [...new Set(S.monthKeys.map(mk => yearFromMonthKey(mk)))].sort();
  annualYears.forEach(year => {
    const annualData = [['이름','1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월','합계']];
    S.persons.forEach(name => {
      const a = S.getA(year, name);
      const total = months.reduce((s,m)=>s+(a[m]||0),0);
      annualData.push([name, ...months.map(m=>a[m]||0), total]);
    });
    const ws = XLSX.utils.aoa_to_sheet(annualData);
    ws['!cols'] = [{wch:10},...Array(13).fill({wch:6})];
    XLSX.utils.book_append_sheet(wb, ws, `${year}연간`);
  });

  // 시트 3: 주말 근무
  const wkDates = S.weekendDates;
  const wkHeader = ['이름','주말근무여부','누적근무일', ...wkDates.map(d=>d.slice(5))];
  const wkData = [wkHeader];
  S.allPersons.forEach(name => {
    const exempt = S.isExempt(name);
    const w = S.getW(name);
    const cnt = S.wkCount(name);
    wkData.push([name, exempt?'예외':'배정', cnt,
      ...wkDates.map(d => w.dates[d] || '')]);
  });
  const ws3 = XLSX.utils.aoa_to_sheet(wkData);
  ws3['!cols'] = [{wch:10},{wch:10},{wch:10},...Array(wkDates.length).fill({wch:7})];
  XLSX.utils.book_append_sheet(wb, ws3, '주말근무');

  // 시트 4: 직원목록
  const mgData = [['이름','주말근무',`${currentYear()}합계`,'2025합계']];
  S.persons.forEach(name => {
    const a=S.getA(currentYear(), name);
    const total=a?Object.values(a).reduce((s,v)=>s+v,0):0;
    mgData.push([name, S.isExempt(name)?'예외':'배정', total, S.annual2025[name]||0]);
  });
  const ws4 = XLSX.utils.aoa_to_sheet(mgData);
  ws4['!cols'] = [{wch:10},{wch:10},{wch:10},{wch:10}];
  XLSX.utils.book_append_sheet(wb, ws4, '직원목록');

  XLSX.writeFile(wb, '근무일정_' + dateStamp() + '.xlsx');
  toast('✓ Excel 파일 다운로드 완료');
}

// ── JSON 불러오기 ──
function importJSON(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.persons || !data.monthly) throw new Error('형식 오류');
      if (!confirm(`"${file.name}" 파일을 불러옵니다.\n현재 데이터가 덮어씌워집니다. 계속하시겠습니까?`)) return;
      applyImportedData(data);
      saveToLocalStorage();
      closeExportModal();
      renderAll();
      toast(`✓ 데이터를 불러왔습니다 (${data.persons.length}명)`);
    } catch(err) {
      toast('❌ 파일 형식이 올바르지 않습니다. JSON 백업 파일을 선택해주세요.');
    }
    input.value = '';
  };
  reader.readAsText(file);
}

function handleDrop(event) {
  event.preventDefault();
  document.getElementById('drop-zone').style.borderColor = 'var(--b2)';
  const file = event.dataTransfer.files[0];
  if (!file || !file.name.endsWith('.json')) { toast('❌ JSON 파일만 지원됩니다.'); return; }
  const fakeInput = { files: [file] };
  importJSON(fakeInput);
}

// ── 유틸 ──
function dateStamp() { return new Date().toISOString().slice(0,10); }
function downloadBlob(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
