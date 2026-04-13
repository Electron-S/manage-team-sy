// ═══════════════════════════════════════
// UNDO / REDO STACK
// ═══════════════════════════════════════
const History = {
  undoStack: [],  // 과거 스냅샷 목록 (최대 50개)
  redoStack: [],  // redo 스냅샷 목록
  MAX: 50,
  _isUndoing: false,

  // 현재 상태 스냅샷 (깊은 복사)
  snapshot() {
    ensureMonthStructures();
    return JSON.parse(JSON.stringify({
      currentMonth:  S.currentMonth,
      monthKeys:     S.monthKeys,
      monthLabels:   S.monthLabels,
      persons:       S.persons,
      monthly:       S.monthly,
      annualByYear:  S.annualByYear,
      annual2025:    S.annual2025,
      weekend:       S.weekend,
      weekendDates:  S.weekendDates,
      weekendExempt: [...S.weekendExempt],
    }));
  },

  // 변경 전에 현재 상태를 undoStack에 저장
  push() {
    if (this._isUndoing) return;
    this.undoStack.push(this.snapshot());
    if (this.undoStack.length > this.MAX) this.undoStack.shift();
    this.redoStack = []; // 새 변경이 생기면 redo 초기화
    this.updateButtons();
  },

  // 되돌리기
  undo() {
    if (!this.undoStack.length) return;
    this._isUndoing = true;
    this.redoStack.push(this.snapshot()); // 현재 상태를 redo에 저장
    const prev = this.undoStack.pop();
    applyImportedData(prev);
    this._isUndoing = false;
    this.updateButtons();
    saveToLocalStorage();
    renderPage(curPage);
    const remaining = this.undoStack.length;
    notifyBadge(`↩ 취소됨 (${remaining}개 더 가능)`);
    toast(`↩ 변경을 취소했습니다. (${remaining}개 더 취소 가능)`);
  },

  // 다시 실행
  redo() {
    if (!this.redoStack.length) return;
    this._isUndoing = true;
    this.undoStack.push(this.snapshot());
    const next = this.redoStack.pop();
    applyImportedData(next);
    this._isUndoing = false;
    this.updateButtons();
    saveToLocalStorage();
    renderPage(curPage);
    notifyBadge('↪ 다시 실행됨');
    toast('↪ 다시 실행했습니다.');
  },

  // 버튼 활성/비활성
  updateButtons() {
    const ub = document.getElementById('undoBtn');
    const rb = document.getElementById('redoBtn');
    if (!ub || !rb) return;
    ub.disabled = this.undoStack.length === 0;
    rb.disabled = this.redoStack.length === 0;
    ub.title = this.undoStack.length
      ? `마지막 변경 취소 — ${this.undoStack.length}개 이력 (Ctrl+Z)`
      : '취소할 이력 없음';
    rb.title = this.redoStack.length
      ? `다시 실행 — ${this.redoStack.length}개 (Ctrl+Y)`
      : '다시 실행할 항목 없음';
    // 이력 수 표시
    ub.textContent = this.undoStack.length ? `↩ 취소 (${this.undoStack.length})` : '↩ 취소';
    rb.textContent = this.redoStack.length ? `↪ 다시 (${this.redoStack.length})` : '↪ 다시';
  },
};

function undo() { if (!isAdmin()) return; History.undo(); }
function redo() { if (!isAdmin()) return; History.redo(); }
