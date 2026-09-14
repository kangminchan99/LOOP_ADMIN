# 관리자 댓글 삭제 구현 계획

## 상태와 범위

2026-09-14 기준 구현 전 계획이다. 사용자가 한 단계씩 소스 코드를 수정한다. 문서 작성은 기능 완료나 테스트 통과를 뜻하지 않는다.

관련 문서: [보안](SECURITY.md), [테스트](TESTING.md), [반응형](RESPONSIVE_LAYOUT.md).
서버 선행 작업: [서버 댓글 삭제 가이드](../../loop_server/docs/admin-comment-delete.md). 이 링크는 두 저장소를 같은 상위 폴더에 배치한 로컬 환경 기준이다.

## 목표 흐름

댓글 삭제 버튼 → deleteAdminComment(id) → Next.js DELETE /api/admin/comments/:id
→ NestJS DELETE /admin/comments/:id → 관리자 권한 확인 → DB 삭제 → 204 → 목록 갱신

페이지와 테이블은 Server Component로 유지하고, 삭제 버튼과 확인창만 Client Component로 만든다.

## 구현 순서

1. 서버 준비: 관리자 DELETE API와 204·400·401·403·404 응답을 먼저 검증한다. 기존 앱의 작성자 전용 삭제 규칙은 유지한다.
2. `app/api/admin/comments/[id]/route.ts` 생성: Origin·양의 안전한 정수 ID·accessToken 쿠키를 검사한다. NestJS로 Bearer 토큰을 전달하며 시간 제한과 리다이렉트 차단을 적용한다. 성공은 빈 204로 반환하고 서버 내부 오류를 노출하지 않는다.
3. `src/features/comments/api/delete-admin-comment.ts` 생성: `deleteAdminComment(id: number): Promise<void>`가 같은 출처의 Route Handler를 호출한다. 성공 본문을 JSON 파싱하지 않고 실패 메시지는 안전하게 추출한다.
4. `src/features/comments/components/delete-comment-button.tsx` 생성: 댓글 ID·내용을 표시하고 ID 입력으로 삭제를 확인한다. 취소·중복 요청 방지·요청 중 비활성·오류 표시를 제공한다. 실제 삭제 요청은 자동 재시도하지 않는다.
5. `src/features/comments/components/admin-comments-table.tsx` 수정: 관리 열에 버튼을 연결하고 행별 댓글 ID·내용을 전달한다. 테이블 전체에 `use client`를 추가하지 않는다.
6. `app/(admin)/comments/page.tsx` 수정: 성공 후 검색어·limit를 유지하고 목록 및 건수를 갱신한다. 마지막 페이지가 사라지면 유효한 마지막 페이지로 보정하고, 0건이면 1페이지 빈 목록으로 처리한다. 완료 안내용 `deleted=1`은 성공 증명 값이 아니다.
7. 검증: lint·build, 관련 자동 테스트와 수동 UI 검증 결과를 기록한다. 실제 구현 후 PROJECT·SECURITY·TESTING 및 이 문서의 상태를 갱신한다.

## 기존 코드 참고

- `app/api/admin/posts/[id]/route.ts`
- `src/features/posts/api/delete-admin-posts.ts`
- `src/features/posts/components/delete-post-button.tsx`
- `app/(admin)/posts/page.tsx`

복사 시 postId·title·/posts·게시글용 경고 문구가 남지 않도록 확인한다. 댓글을 지워도 부모 게시글과 작성자는 삭제되지 않는다.

## 반응형과 접근성

- 모바일에서는 테이블 가로 스크롤을 유지하고 확인창이 화면 폭을 넘지 않게 한다.
- 긴 댓글은 `wrap-break-word` 등으로 줄바꿈한다. `bg-white/4` 등 프로젝트의 정규 Tailwind 표기를 따른다.
- 키보드 포커스, 취소 및 Escape, 요청 중 닫기 방지, 터치 영역을 확인한다.

## 검증 체크리스트 — 아직 미실행

- [ ] 무인증 401, 일반 사용자 403, 잘못된 ID 400, 없는 댓글 404, 관리자 204
- [ ] 같은 출처 검사, HttpOnly 토큰 비노출, 빈 응답 및 통신 실패 처리
- [ ] ID 불일치 시 삭제 불가, 취소 시 무요청, 중복 클릭 방지
- [ ] 삭제 성공 후 검색 조건·건수 갱신 및 마지막 페이지 보정
- [ ] 375px·데스크톱 확인창과 테이블, 키보드 접근성
- [ ] 서버·관리자 웹 lint와 build, 관련 테스트

운영 데이터로 테스트하지 않는다. 통신 실패 시 이미 삭제됐을 수 있으므로 목록을 다시 확인한다. 감사 로그·복구·알림 회수·과거 통계 재집계·앱 로컬 캐시 실시간 동기화는 이번 범위 밖이다.
