<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Loop Admin 구현 가이드

이 문서는 `loop_admin` 관리자 페이지를 만들 때 따를 실무형 기준을 정리한다.  
다음 프로젝트에서 Next.js 관리자 페이지를 만들 때도 같은 순서로 재사용할 수 있다.

## 0. 기본 원칙

- 관리자 페이지는 모바일 앱과 분리된 별도 웹 프로젝트로 관리한다.
- 백엔드는 기존 NestJS 서버의 관리자 API를 사용한다.
- Next.js App Router를 사용한다.
- TypeScript를 기본으로 사용한다.
- Tailwind CSS를 기본 스타일링 도구로 사용한다.
- 화면 전체를 Client Component로 만들지 않는다.
- 상호작용이 필요 없는 화면은 Server Component로 유지한다.
- 검색, 필터, 모달, 폼, 테이블 정렬처럼 브라우저 상태가 필요한 부분만 Client Component로 분리한다.

```txt
loop_app      → Flutter 모바일 앱
loop_server   → NestJS API 서버
loop_admin    → Next.js 관리자 웹
```

## 1. 프로젝트 생성

루트 구조 예시:

```txt
/Volumes/T7/
├── loop/
├── loop_server/
└── loop_admin/
```

생성 명령어:

```bash
cd /Volumes/T7
npx create-next-app@latest loop_admin
```

권장 선택:

```txt
TypeScript: Yes
ESLint: Yes
Tailwind CSS: Yes
src directory: Yes 또는 프로젝트 상황에 맞게 선택
App Router: Yes
import alias: 기본값 @/*
```

실행:

```bash
cd /Volumes/T7/loop_admin
npm run dev -- -p 3001
```

NestJS 서버가 `3000` 포트를 쓰므로 관리자 웹은 보통 `3001`로 실행한다.

## 2. Git ignore / 환경변수

`.gitignore`에 반드시 포함:

```gitignore
node_modules/
.next/
out/
build/
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
!.env.example
.vercel/
*.tsbuildinfo
```

`.env.example` 예시:

```env
LOOP_API_BASE_URL=http://localhost:3000
```

주의:

- `NEXT_PUBLIC_` 접두사가 붙은 환경변수는 브라우저 번들에 포함된다.
- 관리자 토큰, 서버 시크릿, API Secret은 절대 `NEXT_PUBLIC_`로 만들지 않는다.
- 초기 MVP에서는 API 주소를 public으로 써도 되지만, 실무 고도화 단계에서는 Next.js Route Handler를 BFF처럼 두고 서버 전용 환경변수를 사용하는 구조가 더 안전하다.

## 3. 권장 폴더 구조

관리자 페이지는 기능이 많아지므로 처음부터 역할별로 나눈다.

```txt
loop_admin/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── login/
│   │   └── page.tsx
│   └── dashboard/
│       └── page.tsx
└── src/
    ├── config/
    │   └── env.ts
    ├── shared/
    │   ├── api/
    │   ├── components/
    │   ├── lib/
    │   └── types/
    └── features/
        ├── auth/
        ├── dashboard/
        ├── users/
        ├── posts/
        ├── comments/
        ├── notifications/
        └── reports/
```

역할:

- `app/`: URL 라우팅, page/layout/loading/error 파일
- `src/config`: 환경변수, 앱 설정
- `src/shared/api`: 공통 fetcher, API 에러 처리
- `src/shared/components`: 버튼, 카드, 테이블 같은 공통 UI
- `src/features/*`: 기능별 도메인 코드

## 4. 1단계: 관리자 홈 화면 만들기

목표:

```txt
기본 Next.js 템플릿 제거
→ Loop Admin 관리자 홈 대시보드 화면으로 교체
→ 아직 API 연결 없이 정적 mock 데이터 사용
```

권장 파일:

```txt
app/page.tsx
src/features/dashboard/data/admin-home-stats.ts
```

구현 원칙:

- `app/page.tsx`는 기본 Server Component로 유지한다.
- `use client`를 붙이지 않는다.
- 통계 데이터는 임시 상수로 분리한다.
- 다음 단계에서 `GET /admin/dashboard` API로 교체할 수 있게 만든다.

예시 데이터 파일:

```ts
// src/features/dashboard/data/admin-home-stats.ts

/**
 * 관리자 홈에서 보여줄 임시 통계 데이터.
 * 다음 단계에서 NestJS /admin/dashboard API 응답으로 교체한다.
 */
export const adminHomeStats = [
  {
    label: '전체 유저',
    value: '1,248',
    change: '+12 오늘',
    description: '가입 완료된 전체 사용자 수',
  },
  {
    label: '전체 게시글',
    value: '8,420',
    change: '+38 오늘',
    description: '삭제되지 않은 전체 게시글 수',
  },
  {
    label: '전체 댓글',
    value: '24,918',
    change: '+116 오늘',
    description: '사용자가 작성한 전체 댓글 수',
  },
] as const;
```

`page.tsx` 작성 원칙:

- 정적 화면이므로 Server Component 사용
- `adminHomeStats.map()`으로 카드 렌더링
- 관리자 기능 진입 링크 영역을 함께 둔다
- 초기에는 API 호출을 하지 않는다

## 5. 2단계: 관리자 API 설계

서버 우선 구현 권장:

```txt
GET /admin/dashboard
GET /admin/users?page=1&limit=20&keyword=
GET /admin/posts?page=1&limit=20&keyword=
GET /admin/comments?page=1&limit=20&keyword=
POST /admin/notifications/broadcast
```

모든 관리자 API는 NestJS에서 아래 Guard를 적용한다.

```txt
JwtAuthGuard + AdminGuard
```

관리자 페이지의 테이블은 보통 cursor pagination보다 page/limit 방식이 관리하기 편하다.

## 6. 3단계: 인증 구조

초기 MVP:

```txt
관리자 로그인
→ NestJS /auth/login 호출
→ accessToken 저장
→ 관리자 API 호출 시 Authorization Bearer 첨부
```

실무 고도화:

- 가능하면 access token을 localStorage에 오래 보관하지 않는다.
- Next.js Route Handler를 BFF로 두고 HttpOnly Cookie 기반 인증을 고려한다.
- 관리자 페이지는 일반 앱보다 권한 탈취 위험이 크므로 토큰 저장 전략을 신중히 잡는다.

## 7. 4단계: 데이터 패칭

초기:

- Server Component에서 `fetch` 사용
- 관리자 대시보드처럼 정적/요약성 데이터는 서버에서 가져온다.

상호작용 많은 화면:

- 검색
- 필터
- 페이지 이동
- 정렬
- 모달

이런 화면은 Client Component + TanStack Query 도입을 고려한다.

권장 순서:

```txt
1. fetch 기반으로 시작
2. 테이블/검색이 복잡해지면 TanStack Query 추가
```

처음부터 패키지를 많이 넣지 않는다.

## 8. 5단계: 관리자 UI 구성

MVP 화면:

```txt
/              → 관리자 홈
/login         → 관리자 로그인
/dashboard     → 대시보드
/users         → 유저 관리
/posts         → 게시글 관리
/comments      → 댓글 관리
/notifications → 알림 발송/목록
/reports       → 신고 관리
```

공통 레이아웃:

```txt
Sidebar
Header
Content
```

레이아웃은 `app/(admin)/layout.tsx` 같은 route group으로 분리할 수 있다.

```txt
app/
├── login/
│   └── page.tsx
└── (admin)/
    ├── layout.tsx
    ├── dashboard/page.tsx
    ├── users/page.tsx
    └── posts/page.tsx
```

`(admin)`은 URL에 포함되지 않는 그룹 폴더다.

## 9. 성능 기준

- 기본은 Server Component
- 필요한 컴포넌트에만 `use client`
- 큰 테이블은 pagination 사용
- 검색은 debounce 적용
- 리스트 요청은 query string으로 상태를 표현한다
- 이미지가 필요하면 `next/image` 사용
- 폰트는 `next/font` 사용
- mock 데이터는 실제 API 연결 후 제거한다

## 10. 코드 주석 기준

처음 배우는 프로젝트이므로 아래 위치에는 주석을 자세히 단다.

- Server Component / Client Component를 나누는 이유
- 환경변수 파일
- API fetcher
- 인증 토큰 처리
- 권한 체크
- 페이지네이션
- 테이블 검색/필터
- 에러 처리

단, 모든 JSX 태그마다 주석을 달지는 않는다.  
구조와 의도가 헷갈릴 수 있는 지점에만 단다.

## 11. 작업 순서 요약

```txt
1. 기본 홈 화면을 Loop Admin 대시보드로 변경
2. src/config/env.ts 생성
3. 관리자 대시보드 mock 데이터 생성
4. NestJS 서버에 /admin/dashboard API 생성
5. Next.js에서 서버 API fetch 연결
6. 로그인 페이지 생성
7. 인증 토큰 처리
8. 관리자 레이아웃 생성
9. 유저/게시글/댓글 테이블 구현
10. 알림/신고 관리 기능 추가
```
