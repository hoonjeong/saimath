# 사이수학 입학테스트 시스템

초등학생을 대상으로 한 온라인 수학 입학 테스트 시스템입니다.

## 프로젝트 개요

- **목적**: 학원의 입학 상담용 온라인 수학 테스트 시스템
- **대상**: 초등학생 1~6학년
- **핵심 기능**:
  - 관리자: 학년/학기별 시험지 생성 (25문제), 학생 결과 조회 및 분석
  - 학생: 정보 입력 → 25문제 풀이 → 즉시 채점 및 결과 확인

## 기술 스택

### Frontend
- React 18 + TypeScript
- React Router v6 (라우팅)
- Tailwind CSS (스타일링)
- Vite (빌드 도구)

### Backend
- Node.js + Express
- TypeScript
- SQLite (better-sqlite3) - 로컬 데이터베이스

## 프로젝트 구조

```
saimath/
├── server/              # 백엔드 서버
│   ├── index.ts        # Express 서버
│   └── database.ts     # 데이터베이스 설정
├── src/                # 프론트엔드
│   ├── pages/
│   │   ├── Home.tsx           # 메인 홈 화면
│   │   ├── student/           # 학생 페이지
│   │   │   ├── StudentWelcome.tsx
│   │   │   ├── StudentInfo.tsx
│   │   │   ├── StudentTest.tsx
│   │   │   └── StudentResult.tsx
│   │   └── admin/             # 관리자 페이지
│   │       ├── AdminLogin.tsx
│   │       ├── AdminHome.tsx
│   │       ├── AdminCreateTest.tsx
│   │       ├── AdminResults.tsx
│   │       └── AdminResultDetail.tsx
│   ├── App.tsx         # 메인 앱 컴포넌트
│   ├── main.tsx        # 엔트리 포인트
│   └── index.css       # 글로벌 스타일
├── data/               # 데이터베이스 파일 (자동 생성)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

이 명령어는 다음을 동시에 실행합니다:
- 프론트엔드 서버: http://localhost:3000
- 백엔드 API 서버: http://localhost:3001

### 3. 프로덕션 빌드

```bash
npm run build
```

## 주요 기능

### 학생용 기능
1. **시작 화면**: 테스트 안내 및 시작
2. **정보 입력**: 이름, 전화번호, 학년, 학기 입력
3. **테스트 응시**: 25문제 순차 풀이
   - 진행률 표시
   - 선지 선택 (4지선다)
   - 뒤로가기 불가
4. **결과 확인**: 즉시 채점 및 점수 표시
   - 총점, 정답 개수, 정답률
   - 점수별 격려 메시지

### 관리자용 기능
1. **로그인**: 관리자 인증 (기본 계정: admin / admin123)
2. **시험지 생성**:
   - 학년/학기 선택
   - 25문제 입력 (선지 4개 + 정답)
   - 진행률 표시
   - 임시 저장 지원
3. **결과 조회**:
   - 전체 학생 목록
   - 검색 (이름, 전화번호)
   - 필터링 (학년, 학기)
   - 상세 결과 보기 (문제별 정답/오답)

## 데이터베이스 스키마

### 1. test_papers (시험지)
- id: 기본키
- grade: 학년 (1~6)
- semester: 학기 (1 or 2)
- created_at: 생성 일시
- questions: 문제 JSON (25개)

### 2. test_results (응시 결과)
- id: 기본키
- student_name: 학생 이름
- student_phone: 전화번호
- grade: 학년
- semester: 학기
- test_paper_id: 시험지 ID (FK)
- taken_at: 응시 일시
- answers: 답안 JSON (25개)
- score: 총점
- correct_count: 정답 개수

### 3. admins (관리자)
- id: 기본키
- username: 아이디
- password: 비밀번호
- created_at: 생성 일시

## API 엔드포인트

### 학생 API
- `GET /api/test-papers/:grade/:semester` - 시험지 조회
- `POST /api/submit-test` - 테스트 제출 및 채점

### 관리자 API
- `POST /api/admin/login` - 로그인
- `POST /api/admin/test-papers` - 시험지 생성/수정
- `GET /api/admin/test-papers` - 전체 시험지 목록
- `GET /api/admin/test-papers/:grade/:semester` - 특정 시험지 조회
- `GET /api/admin/results` - 전체 결과 조회 (검색/필터 지원)
- `GET /api/admin/results/:id` - 상세 결과 조회

## MVP 버전 특징

현재 구현은 **Phase 1 (MVP)** 버전입니다:

### ✅ 포함된 기능
- 관리자 로그인
- 시험지 생성 (텍스트 문제)
- 학생 정보 입력
- 25문제 풀이
- 자동 채점
- 결과 조회

### ❌ 향후 추가 예정 (Phase 2+)
- 문제 이미지 업로드
- 임시 저장 기능
- 인쇄/엑셀 다운로드
- 고급 필터 및 통계
- 문제 은행 기능

## 사용 가이드

### 관리자
1. http://localhost:3000 접속
2. "관리자" 선택 → 로그인 (admin / admin123)
3. "시험지 만들기" → 학년/학기 선택 → 25문제 입력 → 저장
4. "결과 보기" → 학생 검색 → 상세 결과 확인

### 학생
1. http://localhost:3000 접속
2. "학생" 선택
3. 정보 입력 (이름, 전화번호, 학년, 학기)
4. 25문제 순차 풀이
5. 제출 후 즉시 결과 확인

## 보안 고려사항

⚠️ **주의**: 현재 MVP 버전은 개발용입니다. 프로덕션 배포 전 다음을 반드시 개선하세요:

1. 비밀번호 해시화 (bcrypt 등)
2. JWT 기반 인증
3. HTTPS 사용
4. 개인정보 암호화
5. SQL Injection 방지
6. CORS 정책 강화

## 문제 해결

### 데이터베이스 파일이 없다는 오류
→ `data` 폴더가 자동 생성되며, 서버 시작 시 데이터베이스가 초기화됩니다.

### 포트 충돌
→ `vite.config.ts` (포트 3000) 및 `server/index.ts` (포트 3001)에서 포트를 변경하세요.

### 시험지가 없다는 오류
→ 관리자 페이지에서 먼저 해당 학년/학기의 시험지를 생성하세요.

## 라이선스

MIT License

## 문의

프로젝트 관련 문의사항은 이슈로 남겨주세요.
