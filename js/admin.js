// ═══════════════════════════════════════
// 관리자 모드
// ═══════════════════════════════════════
const ADMIN_PW_HASH = '46de1b41d1dcf8723cf9f6d8a98a25db8bfe88565a5c3a2a8f6efe323eb58be8';
const ADMIN_KEY = 'wm_admin_v1';
const TOKEN_KEY = 'wm_gh_token_v1';
const GITHUB_REPO = 'Electron-S/manage-team-sy';
const GITHUB_FILE = 'data.json';

function isAdmin() {
  return localStorage.getItem(ADMIN_KEY) === '1';
}

function updateAdminUI() {
  const admin = isAdmin();
  if (admin) {
    document.body.classList.add('is-admin');
    document.getElementById('adminToggleBtn').classList.add('on');
    document.getElementById('adminToggleBtn').title = '관리자 설정';
    document.getElementById('adminToggleBtn').textContent = '🔓';
    document.getElementById('hdr-mode-hint').textContent = '셀 클릭으로 수정 가능';
  } else {
    document.body.classList.remove('is-admin');
    document.getElementById('adminToggleBtn').classList.remove('on');
    document.getElementById('adminToggleBtn').title = '관리자 로그인';
    document.getElementById('adminToggleBtn').textContent = '🔒';
    document.getElementById('hdr-mode-hint').textContent = '보기 전용';
  }
  History.updateButtons();
  renderPage(curPage);
}

function openAdminModal() {
  if (isAdmin()) {
    document.getElementById('adminPanel').style.display = 'block';
    document.getElementById('adminLogin').style.display = 'none';
    const tok = localStorage.getItem(TOKEN_KEY);
    const td = document.getElementById('tokenDisplay');
    td.textContent = tok ? tok.slice(0,8) + '••••••••••••••••••••••••••••••••' : '(미설정)';
    td.style.color = tok ? 'var(--grn)' : 'var(--red)';
  } else {
    document.getElementById('adminLogin').style.display = 'block';
    document.getElementById('adminPanel').style.display = 'none';
    setTimeout(() => document.getElementById('adminPwInput').focus(), 80);
  }
  document.getElementById('adminModal').style.display = 'flex';
  document.getElementById('adminPwInput').value = '';
  document.getElementById('adminPwError').style.display = 'none';
}

function closeAdminModal() {
  document.getElementById('adminModal').style.display = 'none';
}

async function confirmAdminLogin() {
  const pw = document.getElementById('adminPwInput').value;
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(pw));
  const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
  if (hex !== ADMIN_PW_HASH) {
    document.getElementById('adminPwError').style.display = 'block';
    document.getElementById('adminPwInput').value = '';
    document.getElementById('adminPwInput').focus();
    return;
  }
  localStorage.setItem(ADMIN_KEY, '1');
  closeAdminModal();
  updateAdminUI();
  toast('✓ 관리자 모드 활성화');
}

function logoutAdmin() {
  if (!confirm('관리자 모드에서 로그아웃합니다.')) return;
  localStorage.removeItem(ADMIN_KEY);
  closeAdminModal();
  updateAdminUI();
  toast('관리자 모드 종료');
}

function saveGithubToken() {
  const tok = document.getElementById('tokenInput').value.trim();
  if (!tok) { toast('토큰을 입력해주세요.'); return; }
  localStorage.setItem(TOKEN_KEY, tok);
  document.getElementById('tokenInput').value = '';
  const td = document.getElementById('tokenDisplay');
  td.textContent = tok.slice(0,8) + '••••••••••••••••••••••••••••••••';
  td.style.color = 'var(--grn)';
  toast('✓ GitHub 토큰 저장됨');
}

function clearGithubToken() {
  if (!confirm('저장된 GitHub 토큰을 삭제합니다.')) return;
  localStorage.removeItem(TOKEN_KEY);
  const td = document.getElementById('tokenDisplay');
  td.textContent = '(미설정)';
  td.style.color = 'var(--red)';
  toast('토큰 삭제됨');
}

// ═══════════════════════════════════════
// GITHUB API 저장
// ═══════════════════════════════════════
async function pushToGitHub() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    openAdminModal();
    toast('❗ 먼저 GitHub 토큰을 설정해주세요.');
    return;
  }

  const btn = document.getElementById('githubSaveBtn');
  btn.disabled = true;
  btn.textContent = '⏳ 저장 중...';

  try {
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
    const jsonStr = JSON.stringify(data, null, 2);
    // 한글 포함 base64 인코딩
    const content = btoa(unescape(encodeURIComponent(jsonStr)));

    const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE}`;
    const headers = {
      Authorization: `token ${token}`,
      'Content-Type': 'application/json',
    };

    // 현재 파일 SHA 가져오기
    const getRes = await fetch(apiUrl, { headers });
    if (!getRes.ok) {
      const err = await getRes.json();
      throw new Error(err.message || `GET 실패 (${getRes.status})`);
    }
    const getJson = await getRes.json();
    const sha = getJson.sha;

    // 커밋
    const now = new Date();
    const kst = new Date(now.getTime() + 9*60*60*1000);
    const stamp = kst.toISOString().slice(0,16).replace('T',' ');
    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: `데이터 업데이트 (${stamp} KST)`,
        content,
        sha,
      }),
    });

    if (!putRes.ok) {
      const err = await putRes.json();
      throw new Error(err.message || `PUT 실패 (${putRes.status})`);
    }

    notifyBadge('☁ GitHub 저장됨');
    toast('✓ GitHub에 저장 완료! 팀원들에게 약 1분 내 반영됩니다.');
  } catch (e) {
    toast('❌ GitHub 저장 실패: ' + e.message);
    console.error(e);
  } finally {
    btn.disabled = false;
    btn.textContent = '☁ GitHub 저장';
  }
}
