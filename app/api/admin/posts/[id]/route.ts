import { env } from '@/src/config/env';
import { cookies } from 'next/headers';

const messages: Record<number, string> = {
  400: '잘못된 게시글 ID입니다.',
  401: '로그인이 만료되었습니다. 다시 로그인해주세요.',
  403: '게시글을 삭제할 권한이 없습니다.',
  404: '이미 삭제되었거나 존재하지 않는 게시글입니다.',
  409: '연결된 데이터 때문에 삭제할 수 없습니다.',
  429: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
};

function failure(message: string, status: number) {
  return Response.json(
    { message },
    { status, headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // 1. 같은 출처에서 보낸 요청인지 확인
  if (request.headers.get('origin') !== new URL(request.url).origin) {
    return failure('허용되지 않은 요청 출처입니다.', 403);
  }

  // 2. 게시글 ID 검증
  const { id } = await params;

  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) {
    return failure(messages[400], 400);
  }

  // 3. HttpOnly 쿠키에서 인증 토큰 확인
  const token = (await cookies()).get('accessToken')?.value;

  if (!token) {
    return failure(messages[401], 401);
  }

  try {
    // 4. NestJS 관리자 삭제 API 호출
    const response = await fetch(`${env.apiBaseUrl}/admin/posts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      return failure(
        messages[response.status] ?? '게시글 삭제에 실패했습니다.',
        response.status,
      );
    }

    // 5. 성공 시 본문 없이 반환
    return new Response(null, {
      status: 204,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    // 실제 삭제됐을 수도 있으므로 자동 재시도하지 않음
    return failure(
      '삭제 결과를 확인하지 못했습니다. 목록을 새로고침해 확인해주세요.',
      502,
    );
  }
}
