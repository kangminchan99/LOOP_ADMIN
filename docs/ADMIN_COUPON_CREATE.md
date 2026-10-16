# 관리자 쿠폰 이벤트 생성 구현 계획

상태: 문서만 작성. 이 문서는 구현·연동·테스트 완료를 의미하지 않는다.

## 목표와 사용자 흐름

관리자가 웹에서 쿠폰 이벤트 이름, 수량, 발급 기간, 쿠폰 만료 시각을 입력하고 이벤트를 생성한다.

1. 관리자 로그인 후 메뉴의 `쿠폰 이벤트 생성`으로 이동한다.
2. 이벤트 이름·전체 수량·발급 시작·종료·쿠폰 만료 일시를 입력한다.
3. 입력값을 확인하고 `이벤트 생성`을 누른다.
4. 생성된 이벤트 ID와 설정 내용을 확인한다. 최초 상태는 신규 발급 중지다.
5. `신규 발급 활성화`를 누르면 발급 기간 안에서 앱 사용자가 쿠폰을 받을 수 있다.
6. 필요한 경우 해당 이벤트의 신규 발급을 중지한다. 이미 발급된 쿠폰은 유지된다.

웹 화면의 버튼 표시만으로 권한을 보장하지 않는다. 최종 관리자 권한과 발급 규칙은 기존 NestJS 서버가 검사한다.

## 기존 서버 API

확인 대상: `loop_server/src/admin/controllers/admin-coupon-events.controller.ts`, `src/coupons/dto/create-coupon-event.dto.ts`, `src/coupons/services/coupon-events.service.ts`.

| 동작 | NestJS API | 정상 응답 |
| --- | --- | --- |
| 이벤트 생성 | `POST /admin/coupon-events` | 201, 이벤트 상세 |
| 활성·중지 | `PATCH /admin/coupon-events/:eventId/activation` | 200, 변경된 이벤트 상세 |

두 API 모두 `JwtAuthGuard + AdminGuard`가 필요하며 Service에서도 DB의 관리자 권한을 확인한다.

생성 요청 예시(실제 테스트 시 유효한 기간으로 변경):

```json
{
  "title": "오픈 기념 선착순 쿠폰",
  "totalQuantity": 100,
  "startsAt": "2026-11-01T09:00:00+09:00",
  "endsAt": "2026-11-07T23:59:59+09:00",
  "couponExpiresAt": "2026-11-30T23:59:59+09:00"
}
```

활성화 요청은 `{ "isActive": true }`, 중지는 `{ "isActive": false }`다.
생성 요청에 `isActive`, `issuedCount`, 관리자 ID를 추가하지 않는다. 초기 상태와 발급량은 서버가 결정한다.

## 호출 구조

```text
관리자 브라우저 /coupons
  → CreateCouponEventForm (클라이언트 컴포넌트)
  → 기능별 브라우저 API 함수
  → Next.js /api/admin/coupon-events Route Handler
  → NestJS /admin/coupon-events
  → 기존 Service / Repository / PostgreSQL
```

- 페이지의 제목·안내 등은 Server Component로 유지한다.
- 입력·제출·처리 상태만 Client Component에서 관리한다.
- 브라우저는 같은 출처의 BFF API를 호출한다. 인증 토큰은 Route Handler가 HttpOnly 쿠키에서 읽는다.
- API 주소는 기존 `src/config/env.ts`를 사용한다.
- 관리자 역할과 데이터 무결성 검사는 서버가 최종 수행한다.
- 새 패키지 없이 기존 React·Next.js·fetch·Tailwind로 구현한다.

## 단계별 구현 순서

### 1단계: 요청·응답 타입과 입력 규칙

예정 파일: `src/features/coupons/types/coupon-event.ts`.

- 요청 타입 `CreateCouponEventInput`: title, totalQuantity, startsAt, endsAt, couponExpiresAt.
- 응답 타입 `CouponEvent`: 요청 필드와 id, issuedCount, remainingQuantity, isActive, createdAt, updatedAt, serverTime.
- 제목은 trim 후 1~100자, 수량은 1~100,000 정수.
- 시간대가 포함된 날짜 문자열, 밀리초 이하 최대 3자리.
- 순서: 발급 시작 < 발급 종료 < 쿠폰 만료.
- 브라우저와 BFF에서 입력 검증을 공유할 수 있게 순수 함수로 분리한다. 서버 검증은 유지한다.

완료 기준: 서버 DTO와 필드·타입·제약이 일치한다.

### 2단계: 생성 BFF Route Handler

예정 파일: `app/api/admin/coupon-events/route.ts`.

- `POST`를 export한다.
- 기존 관리자 쓰기 API와 같은 Origin 검사와 accessToken 쿠키 확인을 적용한다.
- 잘못된 JSON·필드·날짜는 400으로 반환한다.
- 검증한 본문과 Bearer 토큰을 NestJS 생성 API에 전달한다.
- 캐시 없이 요청하고 적절한 타임아웃·리다이렉트 차단을 둔다.
- 서버 내부 오류와 토큰은 응답·로그에 노출하지 않는다.
- 생성 요청은 자동 재시도하지 않는다. 타임아웃이면 이미 생성됐을 수 있다는 안내를 반환한다.

완료 기준: 권한·입력 오류는 안전한 안내를 반환하고 정상 응답은 201과 이벤트 정보다.

### 3단계: 브라우저 API 함수

예정 파일: `src/features/coupons/api/create-coupon-event.ts`.

- 같은 출처의 `POST /api/admin/coupon-events`를 호출한다.
- 토큰을 인자로 받거나 브라우저 저장소에서 읽지 않는다.
- 성공 응답 구조와 실패 응답을 확인한다.
- 확정된 거절과 결과 미확정을 구분해 폼에 전달한다.

완료 기준: UI가 HTTP·응답 파싱을 직접 반복 구현하지 않는다.

### 4단계: 생성 폼

예정 파일: `src/features/coupons/components/create-coupon-event-form.tsx`.

- 이름·수량·시작·종료·만료 입력에 label, required와 범위 검증을 둔다.
- `datetime-local`은 브라우저 현지 시간이라는 설명을 표시하고, 전송 시 시간대 포함 ISO 문자열로 변환한다.
- 요청 중 입력과 제출 버튼을 비활성화한다. 첫 await 전 ref 가드로 연속 제출을 막는다.
- 실패하면 입력을 유지한다. 결과 미확정이면 생성 여부를 조회로 확인하도록 안내하고 무조건 재전송하지 않는다.
- 성공하면 생성 ID·수량·기간·비활성 상태를 보여준다.
- 오류는 `role="alert"`, 완료 안내는 `role="status"` 등으로 전달한다.
- 모바일은 세로 입력, 넓은 화면은 날짜 입력을 2열로 배치한다. 버튼은 최소 높이 44px를 확보한다.
- Tailwind 투명도는 `bg-white/4` 같은 프로젝트 표기를 따른다.

완료 기준: 중복 클릭 방지, 입력 유지, 결과 안내와 모바일 접근이 가능하다.

### 5단계: 페이지와 관리자 내비게이션

예정 파일: `app/(admin)/coupons/page.tsx`, `src/features/admin/components/admin-shell.tsx`.

- `/coupons` 페이지에 제목·설명·폼을 배치한다.
- 기존 관리자 레이아웃과 인증 흐름을 사용한다.
- 공통 navItems에 메뉴를 추가해 모바일·데스크톱 모두 접근하게 한다.
- 새로고침·재로그인 후의 입력 보존은 별도 요구가 없다면 제공하지 않는다.

완료 기준: 로그인한 관리자가 메뉴에서 생성 화면에 진입한다.

### 6단계: 활성·중지 연결

예정 파일:

- `app/api/admin/coupon-events/[id]/activation/route.ts`
- `src/features/coupons/api/update-coupon-event-activation.ts`
- 생성 결과 컴포넌트 또는 기존 폼의 결과 영역

Origin·쿠키·이벤트 ID(1~2147483647)·boolean 본문을 검사한 뒤 PATCH로 전달한다.
생성과 활성화를 분리한다. 활성화 실패를 이벤트 생성 실패로 표시하거나 생성 POST를 반복하지 않는다.
수량이나 기간은 이 API로 수정하지 않는다. 표시할 상태는 서버 응답으로 갱신한다.

완료 기준: 생성된 이벤트의 활성·중지를 요청하고 결과를 확인할 수 있다.

### 7단계: 검증

자동 검증 예정:

- 제목 trim·길이, 정수 수량과 상한, 날짜 시간대·순서.
- Origin 불일치·무인증 요청은 백엔드 호출 없이 차단.
- 201 생성 응답과 토큰의 서버 간 전달.
- 401·403·400·404·429 및 5xx 안내, 내부 오류 본문 비노출.
- 통신 실패 후 POST 자동 재시도 없음.
- 활성화 ID·boolean 검증과 PATCH 전달.

기본 검사: `npm run lint`, `npm run build`.
쿠폰 전용 모의 응답 테스트는 구현 단계에서 추가하고, 실제 생성 테스트는 승인된 로컬 테스트 계정·DB에서 수행한다.

수동 검증 예정:

1. 관리자 로그인 → 생성 → 비활성 상태 확인.
2. 신규 발급 활성화 → 앱 이벤트 목록·상세에서 확인.
3. 일반 사용자 403, 만료 로그인 401 확인.
4. 잘못된 날짜·수량, 중복 클릭, 통신 중단 시 입력·오류 안내 확인.
5. 390px·768px·1280px에서 레이아웃, 입력·버튼 접근과 키보드 동작 확인.

## 범위와 후속 작업

- 이번 범위: 신규 이벤트 생성과 생성 결과의 활성·중지.
- 기존 이벤트 목록·검색·편집·삭제, 발급 내역 관리, 쿠폰 사용·교환은 후속 기능이다.
- 앱의 발급·조회 API와 기존 데이터는 변경하지 않는다.
- 현재 생성 POST에는 멱등 키가 없다. UI 중복 클릭 방어는 다른 탭·새로고침 이후의 중복 생성까지 보장하지 않는다.
- 결과 미확정 확인은 기존 앱 목록 또는 Swagger의 `GET /coupon-events`를 사용한다. 웹 목록 조회 기능을 추가하면 웹 안에서도 확인하도록 연결한다.
- 문서 작성 시점에는 위 자동·수동 검증을 수행하지 않았다.
