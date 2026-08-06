# Loop Admin

Loop 서비스 운영을 위한 Next.js 관리자 웹입니다.

```txt
loop_app      → Flutter 모바일 앱
loop_server   → NestJS API 서버
loop_admin    → Next.js 관리자 웹
```

## 목적

운영자가 Loop 서비스의 유저, 게시글, 댓글, 알림, 신고 상태를 확인하고 관리할 수 있는 별도 웹 도구를 만든다.

첫 번째 버전은 관리자 대시보드와 기본 관리 화면을 만드는 데 집중한다.

## 기술 스택

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- ESLint

## 시작하기

의존성 설치:

```bash
npm ci
```

개발 서버 실행:

```bash
npm run dev -- -p 3001
```

확인 주소:

```txt
http://localhost:3001
```

NestJS 서버가 보통 `3000` 포트를 사용하므로 관리자 웹은 `3001` 포트로 실행한다.

## 환경변수

`.env.example`을 참고해 `.env.local`을 만든다.

```bash
cp .env.example .env.local
```

예시:

```env
LOOP_API_BASE_URL=http://localhost:3000
```

주의:

- `.env.local`은 Git에 올리지 않는다.
- 민감한 값은 `NEXT_PUBLIC_` 환경변수로 만들지 않는다.

## 주요 문서

| 파일 | 역할 |
|---|---|
| `PROJECT.md` | 제품 목적, 범위, 성공 조건 |
| `ARCHITECTURE.md` | 시스템 구조와 의존성 방향 |
| `AGENTS.md` | 작업 규칙과 검증 절차 |
| `docs/TESTING.md` | 테스트와 검증 방법 |
| `docs/SECURITY.md` | 보안과 권한 경계 |
| `docs/decisions/` | 중요한 기술 결정 기록 |

## 검증

린트:

```bash
npm run lint
```

빌드:

```bash
npm run build
```

전체 검증:

```bash
npm run lint && npm run build
```

## 현재 구현 상태

- Next.js 프로젝트 생성 완료
- 관리자 홈 대시보드 mock 화면 구현
- 프로젝트 하네스 문서 적용
- 실제 관리자 API 연결은 다음 단계에서 진행

## 다음 단계

1. `src/config/env.ts` 생성
2. NestJS 서버에 `GET /admin/dashboard` API 구현
3. 관리자 로그인 화면 구현
4. 관리자 레이아웃과 사이드바 구현
5. 유저/게시글/댓글 관리 테이블 구현
