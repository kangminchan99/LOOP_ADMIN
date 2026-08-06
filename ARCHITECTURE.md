# 아키텍처

이 문서는 `loop_admin`의 현재 구조와 반드시 지켜야 할 의존성 방향을 설명한다.

## 시스템 구성

```txt
관리자 브라우저
    ↓ HTTPS
Next.js Loop Admin
    ↓ REST API
NestJS loop_server
    ↓
PostgreSQL / Redis / FCM / S3
```

`loop_admin`은 관리자 웹 UI만 담당한다.  
비즈니스 로직과 권한 검증의 최종 책임은 `loop_server`에 둔다.

## 주요 디렉터리

| 경로 | 역할 | 주요 의존성 |
|---|---|---|
| `app/` | Next.js App Router 라우팅, page/layout/loading/error | `src/features`, `src/shared` |
| `src/config/` | 환경변수와 앱 설정 | 없음 |
| `src/shared/api/` | 공통 API 호출, 에러 처리, 인증 헤더 처리 | `src/config` |
| `src/shared/components/` | 버튼, 카드, 테이블, 레이아웃 같은 공통 UI | React, Tailwind |
| `src/shared/types/` | 공통 타입 | 없음 |
| `src/features/dashboard/` | 관리자 대시보드 | `src/shared` |
| `src/features/auth/` | 관리자 로그인/로그아웃 | `src/shared/api` |
| `src/features/users/` | 유저 관리 | `src/shared/api`, `src/shared/components` |
| `src/features/posts/` | 게시글 관리 | `src/shared/api`, `src/shared/components` |
| `src/features/comments/` | 댓글 관리 | `src/shared/api`, `src/shared/components` |
| `src/features/notifications/` | 알림 관리와 전체 푸시 | `src/shared/api` |
| `src/features/reports/` | 신고 관리 | `src/shared/api` |

## 주요 실행 흐름

### 관리자 홈

```txt
GET /
→ app/page.tsx
→ dashboard mock 데이터 렌더링
→ 추후 GET /admin/dashboard API로 교체
```

### 관리자 API 호출

```txt
관리자 화면
→ shared api fetcher
→ loop_server /admin/*
→ JwtAuthGuard + AdminGuard
→ Service/Repository
→ 응답
```

## 의존성 방향

```txt
app → features → shared → config/types
```

허용:

- `app/*`는 필요한 feature를 import할 수 있다.
- `features/*`는 `shared/*`를 import할 수 있다.
- `shared/*`는 특정 feature를 import하지 않는다.
- `config/*`와 `types/*`는 가능한 한 하위 의존성을 갖지 않는다.

금지:

- feature끼리 직접 강하게 의존하지 않는다.
- 컴포넌트에서 `process.env`를 직접 여러 곳에서 읽지 않는다.
- API 주소, 인증 토큰 처리, 에러 처리를 화면마다 중복 구현하지 않는다.

## Server Component / Client Component 기준

기본은 Server Component다.

Server Component로 유지:

- 정적 관리자 홈
- 초기 목록 조회
- 메타데이터
- 권한 체크용 서버 로직

Client Component로 분리:

- 검색 입력
- 필터 선택
- 페이지네이션 클릭
- 모달
- 폼 입력
- 토스트
- 테이블 정렬

## 외부 시스템

| 시스템 | 용도 | 실패 시 동작 |
|---|---|---|
| `loop_server` NestJS | 관리자 REST API | 에러 상태를 UI에 표시하고 재시도 안내 |
| PostgreSQL | 서버의 영속 데이터 | 직접 접근하지 않음 |
| Redis/BullMQ | 서버의 비동기 작업 | 직접 접근하지 않음 |
| FCM | 서버를 통한 푸시 발송 | 발송 실패 상태 표시 |
| S3/CloudFront | 이미지 조회 | 서버가 내려준 URL만 사용 |

## 반드시 지켜야 할 구조적 원칙

- 관리자 권한 검증은 프론트 UI 숨김만으로 처리하지 않는다.
- 모든 관리자 API는 서버에서 `JwtAuthGuard + AdminGuard`로 보호한다.
- 관리자 토큰이나 비밀값을 문서와 코드에 커밋하지 않는다.
- `NEXT_PUBLIC_` 환경변수에는 공개되어도 되는 값만 둔다.
- 대시보드 첫 화면은 가능한 한 Server Component로 유지한다.
- 상호작용이 필요한 컴포넌트에만 `use client`를 붙인다.

## 알려진 제약과 기술 부채

- 현재 관리자 홈은 mock 데이터를 사용한다.
- 아직 관리자 로그인/토큰 저장 방식이 확정되지 않았다.
- 최종적으로는 HttpOnly Cookie 기반 BFF 구조를 검토한다.
- 아직 E2E 테스트 도구가 없다.

