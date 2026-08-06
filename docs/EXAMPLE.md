# 작성 예시

이 문서는 `loop_admin`에서 기능을 추가할 때 기대하는 작업 단위를 보여주는 예시다.

## 예시 작업: 관리자 유저 목록 화면

요구사항:

```txt
관리자가 유저 목록을 페이지 단위로 확인한다.
검색어로 이메일 또는 닉네임을 검색할 수 있다.
```

작업 범위:

```txt
1. 서버에 GET /admin/users API가 있는지 확인
2. 응답 DTO를 기준으로 TypeScript 타입 작성
3. users feature 폴더 생성
4. 목록 페이지 생성
5. 검색 입력은 Client Component로 분리
6. lint/build 실행
```

권장 구조:

```txt
app/(admin)/users/page.tsx
src/features/users/api/get-admin-users.ts
src/features/users/components/admin-users-table.tsx
src/features/users/types/admin-user.ts
```

완료 보고 예시:

```txt
결과
- 관리자 유저 목록 화면을 추가했습니다.
- 검색어와 page/limit query string을 기준으로 목록을 조회합니다.

검증
- npm run lint: 통과
- npm run build: 통과

남은 작업
- 유저 상세/권한 변경 기능은 다음 단계입니다.
```

