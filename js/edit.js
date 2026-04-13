// ═══════════════════════════════════════
// INLINE EDIT
// ═══════════════════════════════════════
function makeEditable(td, initVal, type, onSave) {
  if (!isAdmin()) return; // 관리자만 편집 가능
  // wrap content in editable span
  const span = document.createElement('span');
  span.className = 'editable';
  span.innerHTML = td.innerHTML;
  td.innerHTML = '';
  td.appendChild(span);

  span.addEventListener('click', () => {
    if (td.querySelector('input')) return;
    const inp = document.createElement('input');
    inp.className = 'cell-input';
    inp.type = type==='text' ? 'text' : 'number';
    if (type!=='text') { inp.step='0.25'; inp.min='0'; }
    inp.value = type==='text' ? (initVal||'') : (initVal||0);
    span.style.display='none';
    td.appendChild(inp);
    inp.focus(); inp.select();

    function commit() {
      const v = type==='text' ? inp.value.trim() : Math.max(0, parseFloat(inp.value)||0);
      if (String(v) !== String(initVal)) History.push(); // 값이 바뀔 때만 이력 저장
      onSave(v);
      initVal = v;
      inp.remove();
      span.style.display='';
      renderAll();
    }
    inp.addEventListener('blur', commit);
    inp.addEventListener('keydown', e => {
      if (e.key==='Enter') { e.preventDefault(); commit(); }
      if (e.key==='Escape') { inp.remove(); span.style.display=''; }
    });
  });
}

// helper: render editable number td
function editNumTd(td, val, onChange) {
  const disp = val>0 ? `<span class="tag t-yellow">${val%1===0?val:val.toFixed(2)}</span>` : '—';
  td.innerHTML = disp;
  makeEditable(td, val, 'number', v => onChange(v));
}
function editNumTdBlue(td, val, onChange) {
  const disp = val>0 ? `<span class="tag t-blue">${val%1===0?val:val.toFixed(2)}</span>` : '—';
  td.innerHTML = disp;
  makeEditable(td, val, 'number', v => onChange(v));
}
function editTextTd(td, val, onChange) {
  td.innerHTML = val || '—';
  td.style.cssText = 'font-size:10px;color:var(--muted);max-width:200px;';
  makeEditable(td, val, 'text', v => onChange(v));
}
