export async function deleteAdminPost(id: number): Promise<void> {
  // 1. Next.js Route Handler에 삭제 요청
  const response = await fetch(`/api/admin/posts/${id}`, {
    method: 'DELETE',
    credentials: 'same-origin',
  });

  // 2. 성공 응답은 본문이 없으므로 바로 종료
  if (response.ok) return;

  // 3. 실패 응답에서 안전하게 메시지 추출
  const body: unknown = await response.json().catch(() => null);

  const message =
    body &&
    typeof body === 'object' &&
    'message' in body &&
    typeof body.message === 'string'
      ? body.message
      : '게시글 삭제에 실패했습니다. 목록을 새로고침해 확인해주세요.';

  throw new Error(message);
}
