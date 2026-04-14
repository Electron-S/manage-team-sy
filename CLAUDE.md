# manage-team-sy — CLAUDE.md

## 프로젝트 개요
파견직 근무 관리 대시보드. 와이프가 데이터 수정, 팀원들은 GitHub Pages URL로 조회만 함.

## 파일 위치
- **로컬:** `/mnt/d/Develop/manage-team-sy/` (= `D:\Develop\manage-team-sy\`)
- **GitHub:** `https://github.com/Electron-S/manage-team-sy` (branch: master, public)
- **GitHub Pages:** `https://electron-s.github.io/manage-team-sy/`

## 파일 구조
- `index.html`: 메인 앱 (GitHub Pages에서 `data.json` fetch)
- `data.json`: 실제 데이터 파일 (`data.json?t=timestamp`로 최신 데이터 로드)

## 사용 방법 (와이프)
1. `https://electron-s.github.io/manage-team-sy/` 접속
2. 우측 상단 🔒 클릭 → 비밀번호 입력 → 관리자 모드 진입
3. 셀 클릭으로 데이터 수정
4. **☁ GitHub 저장** 클릭 → GitHub에 직접 commit → 1분 내 팀원 반영

## 관리자 모드
- 비밀번호: `sy2026!` (SHA-256 해시로 소스코드에 저장, 평문 없음)
- 관리자만: 셀 편집, 직원 추가/삭제, undo/redo, GitHub 저장, 내보내기
- 비관리자: 보기 전용

## GitHub API 저장
- GitHub Personal Access Token 필요 (브라우저 localStorage에 저장, 기기마다 따로 설정)
- 토큰 발급: GitHub Settings → Developer settings → Fine-grained tokens → Contents Read/Write

## 배포 방식
- push하면 GitHub Pages 자동 반영 (약 1분 소요)
- localStorage: 자동 임시저장 (브라우저 로컬)
