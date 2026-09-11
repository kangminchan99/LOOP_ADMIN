import { env } from '@/src/config/env';
import { cookies } from 'next/headers';

const messages: Record<number, string> = {
  400: '잘못된 삭제 요청입니다.',
  401: '로그인이 만료되었습니다. 다시 로그인해주세요.',
  403: '유저를 삭제할 권한이 없습니다.',
  404: '이미 삭제되었거나 존재하지 않는 유저입니다. 목록을 새로고침해주세요.',
  409: '연결된 데이터 때문에 삭제할 수 없습니다.',
  429: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
};

function failure(message: string, status: number) {
  return Response.json({ message }, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // 쿠키 인증을 사용하는 변경 요청은 같은 출처에서만 허용.
  if (request.headers.get('origin') !== new URL(request.url).origin) {
    return failure('허용되지 않은 요청 출처입니다.', 403);
  }
  const { id } = await params;
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) {
    return failure('유효한 유저 ID가 필요합니다.', 400);
  }
  const token = (await cookies()).get('accessToken')?.value;
  if (!token) return failure(messages[401], 401);

  try {
    // 권한의 최종 검증은 기존 NestJS JwtAuthGuard + AdminGuard가 담당.
    const response = await fetch(`${env.apiBaseUrl}/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      return failure(messages[response.status] ?? '유저 삭제에 실패했습니다.', response.status);
    }
    // 기존 API의 200/204 빈 응답 모두 지원. JSON 파싱을 시도하지 않음.
    return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    // 요청이 서버에 도착했을 수도 있으므로 자동으로 삭제를 재시도하지 않음.
    return failure('삭제 결과를 확인하지 못했습니다. 목록을 새로고침해 확인해주세요.', 502);
  }
}
