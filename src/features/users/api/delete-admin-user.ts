export async function deleteAdminUser(id: number): Promise<void> {
  const response = await fetch(`/api/admin/users/${id}`, {
    method: 'DELETE',
    credentials: 'same-origin',
  });
  if (response.ok) return;
  const body: unknown = await response.json().catch(() => null);
  const message = body && typeof body === 'object' && 'message' in body && typeof body.message === 'string'
    ? body.message : '유저 삭제에 실패했습니다. 목록을 새로고침해 확인해주세요.';
  throw new Error(message);
}
