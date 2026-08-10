# Loop Admin 반응형 레이아웃 적용 가이드

## 목적

관리자 페이지는 데스크톱에서 가장 많이 사용되지만, 태블릿이나 작은 노트북 화면에서도 깨지지 않아야 한다. 이 문서는 `loop_admin`에서 테이블, 페이지네이션, 사이드바, 상단 헤더를 반응형으로 적용할 때의 실무 기준을 정리한다.

## 기본 원칙

반응형은 화면을 “예쁘게 줄이는 작업”이 아니라, 화면 크기마다 필요한 정보를 무리 없이 사용할 수 있게 재배치하는 작업이다.

우선순위는 다음과 같이 둔다.

```txt
1. 핵심 정보가 가려지지 않을 것
2. 버튼과 입력창을 터치하기 쉬울 것
3. 테이블은 무리하게 압축하지 않을 것
4. 모바일에서는 정보를 줄이고, 데스크톱에서는 자세히 보여줄 것
5. 인증/세션 UI는 항상 접근 가능할 것
```

## 현재 레이아웃 구조

현재 관리자 화면은 Route Group을 사용한다.

```txt
app/
├── layout.tsx
├── (admin)/
│   ├── layout.tsx
│   ├── page.tsx
│   └── users/
│       └── page.tsx
└── login/
    └── page.tsx
```

역할은 다음과 같다.

```txt
app/layout.tsx
→ 전체 HTML 구조

app/(admin)/layout.tsx
→ 관리자 공통 레이아웃, 인증 체크, 사이드바, 상단 헤더

app/(admin)/page.tsx
→ 대시보드 내용

app/(admin)/users/page.tsx
→ 유저 관리 내용

app/login/page.tsx
→ 로그인 화면
```

`(admin)`은 URL에 포함되지 않는다.

```txt
app/(admin)/page.tsx
→ /

app/(admin)/users/page.tsx
→ /users
```

## Breakpoint 기준

Tailwind 기본 breakpoint를 기준으로 생각한다.

```txt
기본       모바일
sm         작은 태블릿
md         태블릿
lg         노트북/데스크톱 시작
xl         넓은 데스크톱
```

실무 적용 기준은 다음과 같이 잡는다.

```txt
기본~md
→ 단일 컬럼, 모바일 헤더, 간단한 페이지네이션

lg 이상
→ 사이드바 표시, 본문 좌측 여백 적용

xl 이상
→ 대시보드 카드 4열, 넓은 테이블 여백
```

## AdminLayout 기준

### 데스크톱 사이드바

현재 사이드바는 데스크톱 이상에서만 보이게 한다.

```tsx
<aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-slate-950/95 p-6 lg:block">
```

의미:

```txt
hidden
→ 기본 화면에서는 숨김

lg:block
→ lg 이상에서 표시

w-64
→ 사이드바 너비

fixed inset-y-0 left-0
→ 왼쪽에 고정
```

본문은 데스크톱에서 사이드바만큼 밀어준다.

```tsx
<div className="lg:pl-64">
```

의미:

```txt
lg 미만
→ 본문 왼쪽 여백 없음

lg 이상
→ 사이드바 너비만큼 왼쪽 여백
```

### 모바일 메뉴

현재 구조에서는 `lg` 미만에서 사이드바가 사라진다. 따라서 모바일/태블릿에서는 별도 메뉴가 필요하다.

실무적으로는 우선 간단한 상단 가로 메뉴를 추천한다.

```tsx
<nav className="flex gap-2 overflow-x-auto border-b border-white/10 px-6 py-3 text-sm lg:hidden">
  <Link href="/">대시보드</Link>
  <Link href="/users">유저</Link>
  <Link href="/posts">게시글</Link>
  <Link href="/comments">댓글</Link>
</nav>
```

핵심:

```txt
lg:hidden
→ 데스크톱에서는 숨김

overflow-x-auto
→ 작은 화면에서 메뉴가 넘치면 가로 스크롤
```

처음부터 복잡한 햄버거 메뉴보다, 상단 가로 메뉴가 구현과 유지보수 측면에서 더 실용적이다.

## 상단 헤더 기준

상단 헤더에는 관리자 콘솔 텍스트, 세션 타이머, 권한 배지가 들어간다.

작은 화면에서는 한 줄에 모두 넣으면 좁아질 수 있다.

권장 구조:

```tsx
<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  <p className="text-sm text-slate-400">관리자 콘솔</p>

  <div className="flex flex-wrap items-center gap-3">
    <SessionTimer />
    <span>ADMIN</span>
  </div>
</div>
```

의미:

```txt
기본
→ 세로 배치

sm 이상
→ 가로 배치

flex-wrap
→ 공간이 부족하면 줄바꿈
```

세션 타이머는 인증 UX와 관련된 정보이므로 모바일에서도 숨기지 않는 편이 좋다.

## 대시보드 카드 기준

대시보드 카드는 이미 좋은 방향이다.

```tsx
<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
```

화면별 동작:

```txt
모바일
→ 1열

md 이상
→ 2열

xl 이상
→ 4열
```

카드형 UI는 화면 크기에 따라 열 개수를 바꾸는 방식이 가장 안정적이다.

## 테이블 기준

관리자 테이블은 모바일에서 억지로 모든 컬럼을 줄이면 읽기 어렵다. 실무에서는 테이블에 가로 스크롤을 허용하는 방식이 흔하다.

```tsx
<div className="overflow-x-auto">
  <table className="w-full min-w-190 text-left text-sm">
    ...
  </table>
</div>
```

핵심:

```txt
overflow-x-auto
→ 작은 화면에서 테이블이 넘치면 가로 스크롤

min-w-190
→ 테이블이 너무 좁아져 컬럼이 깨지는 것을 방지
```

주의:

```txt
모바일에서 모든 컬럼을 억지로 보이게 만들지 않는다.
중요도가 낮은 컬럼은 나중에 숨기거나 상세 페이지로 보낸다.
```

컬럼 우선순위 예시:

```txt
유저 관리 필수
→ ID, 이메일, 닉네임, 권한

유저 관리 보조
→ 포인트, 가입일, 프로필 이미지
```

필요하면 작은 화면에서는 보조 컬럼을 숨길 수 있다.

```tsx
<th className="hidden px-5 py-3 md:table-cell">가입일</th>
<td className="hidden px-5 py-4 md:table-cell">...</td>
```

## 페이지네이션 기준

페이지네이션은 화면 크기에 따라 다르게 보여주는 것이 좋다.

### 모바일

모바일에서는 단순하게 보여준다.

```txt
[이전] 1 / 106 [다음]
```

권장:

```tsx
<div className="flex items-center justify-between gap-3 md:hidden">
  <Link href={previousHref}>이전</Link>
  <span>1 / 106</span>
  <Link href={nextHref}>다음</Link>
</div>
```

### 데스크톱

데스크톱에서는 페이지 번호를 조금 더 자세히 보여준다.

```txt
[이전] [1] [2] [3] [4] [5] [다음]
```

권장:

```tsx
<div className="hidden items-center justify-between gap-3 md:flex">
  <p>총 2,104명</p>
  <div className="flex items-center gap-2">
    ...
  </div>
</div>
```

핵심:

```txt
md:hidden
→ 모바일 전용

hidden md:flex
→ 데스크톱/태블릿 전용
```

## 검색 영역 기준

검색 폼은 모바일에서 세로, 데스크톱에서 가로가 좋다.

```tsx
<form className="flex flex-col gap-3 md:flex-row md:items-center">
  <input className="w-full md:max-w-sm" />
  <button className="w-full md:w-auto">검색</button>
</form>
```

동작:

```txt
모바일
→ input, button이 세로로 넓게 표시

md 이상
→ input과 button을 한 줄로 표시
```

관리자 검색은 URL query와 연결하는 것이 좋다.

```txt
/users?search=minchan&page=1&limit=20
```

이렇게 하면 새로고침, 공유, 뒤로가기가 자연스럽다.

## 페이지별 권장 레이아웃

### `/`

```txt
대시보드
→ 카드 grid
→ 모바일 1열
→ md 2열
→ xl 4열
```

### `/users`

```txt
검색 영역
→ 모바일 세로
→ md 이상 가로

테이블
→ overflow-x-auto
→ 필수 컬럼 우선

페이지네이션
→ 모바일 단순형
→ md 이상 번호형
```

### `/posts`, `/comments`

유저 페이지와 같은 패턴을 재사용한다.

```txt
검색/필터
테이블
페이지네이션
```

## Tailwind 작성 규칙

프로젝트에서는 투명도 클래스를 간단한 형태로 작성한다.

```txt
bg-white/[0.04]
→ bg-white/4

bg-white/[0.06]
→ bg-white/6

hover:bg-white/[0.06]
→ hover:bg-white/6
```

className은 가능한 아래 순서로 정리한다.

```txt
레이아웃
→ 위치
→ 크기
→ 간격
→ 테두리
→ 배경
→ 글자
→ 효과
→ 상태
→ 반응형
```

예시:

```tsx
className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-white/10 bg-white/4 p-6 text-sm text-slate-300 shadow-2xl transition hover:bg-white/6 md:max-w-lg"
```

## 구현 순서 추천

반응형을 적용할 때는 아래 순서로 진행한다.

```txt
1. AdminLayout 모바일 메뉴 추가
2. Header를 작은 화면에서 줄바꿈 가능하게 수정
3. /users 검색 영역을 모바일 세로, 데스크톱 가로로 구성
4. /users 테이블에 overflow-x-auto 유지
5. /users 페이지네이션을 모바일형/데스크톱형으로 분리
6. 같은 패턴을 /posts, /comments에 재사용
```

## 체크리스트

구현 후 아래 화면 크기로 확인한다.

```txt
390px
→ 모바일 기준

768px
→ 태블릿 기준

1024px
→ 사이드바 표시 시작

1280px 이상
→ 데스크톱 기준
```

확인할 것:

```txt
사이드바가 lg 이상에서만 보이는가
모바일에서 메뉴 접근이 가능한가
상단 세션 타이머가 잘리지 않는가
테이블이 깨지지 않고 가로 스크롤 되는가
페이지네이션 버튼이 화면 밖으로 밀리지 않는가
검색 input과 button이 모바일에서 터치하기 쉬운가
```

## 결론

`loop_admin`의 반응형 전략은 다음과 같이 가져간다.

```txt
데스크톱
→ 사이드바 + 넓은 테이블 + 상세 페이지네이션

모바일/태블릿
→ 상단 메뉴 + 가로 스크롤 테이블 + 단순 페이지네이션
```

관리자 페이지는 모바일 최적화 앱처럼 모든 정보를 압축해서 보여주기보다, 핵심 기능이 깨지지 않고 접근 가능하도록 만드는 것이 실무적으로 더 중요하다.
