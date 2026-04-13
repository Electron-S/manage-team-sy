// ═══════════════════════════════════════
// ADD / DELETE
// ═══════════════════════════════════════
function openAdd() {
  if (!isAdmin()) return;
  ['add-name','add-note','add-v25'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('add-exempt').checked = false;
  document.getElementById('addModal').style.display='flex';
  setTimeout(()=>document.getElementById('add-name').focus(),80);
}
function closeAdd() { document.getElementById('addModal').style.display='none'; }
function confirmAdd() {
  const name=document.getElementById('add-name').value.trim();
  if(!name){toast('이름을 입력해주세요.');return;}
  const note=document.getElementById('add-note').value.trim();
  const v25=parseFloat(document.getElementById('add-v25').value)||0;
  const exempt=document.getElementById('add-exempt').checked;
  History.push(); // 변경 전 스냅샷 저장
  if(!S.addPerson(name,note,v25)){History.undoStack.pop();toast('이미 존재하는 직원입니다.');return;}
  if(exempt) S.weekendExempt.add(name);
  closeAdd();
  renderAll();
  toast(`✓ ${name} 직원이 추가되었습니다.${exempt?' (주말근무 예외)':''}`);
}

function openDelete(name) {
  if (!isAdmin()) return;
  S.pendingDelete=name;
  document.getElementById('del-name').textContent=name;
  document.getElementById('delModal').style.display='flex';
}
function closeDelete() { document.getElementById('delModal').style.display='none'; S.pendingDelete=null; }
function confirmDelete() {
  const name=S.pendingDelete;
  if(!name)return;
  History.push();
  S.removePerson(name);
  closeDelete();
  renderAll();
  toast(`🗑 ${name} 직원이 삭제되었습니다.`);
}
