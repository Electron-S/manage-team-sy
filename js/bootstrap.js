// ═══════════════════════════════════════
// KEYBOARD
// ═══════════════════════════════════════
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeAdd(); closeDelete(); closeExportModal(); closeAdminModal(); }
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
  if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
});

// ═══════════════════════════════════════
// INIT — HTTP이면 data.json 우선 로드, 아니면 localStorage 복원
// ═══════════════════════════════════════
(async () => {
  if (location.protocol.startsWith('http')) {
    try {
      const res = await fetch('data.json?t=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        applyImportedData(data);
        updateAdminUI();
        History.updateButtons();
        renderOverview();
        return;
      }
    } catch(e) {}
  }
  const savedAt = loadFromLocalStorage();
  if (savedAt) {
    const dt = new Date(savedAt);
    const fmt = `${dt.getMonth()+1}/${dt.getDate()} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`;
    document.getElementById('savedBadge').textContent = `✓ 복원됨 (${fmt})`;
    document.getElementById('savedBadge').style.opacity = '1';
    setTimeout(() => document.getElementById('savedBadge').style.opacity = '0', 3000);
  }
  updateAdminUI();
  History.updateButtons();
  renderOverview();
})();
