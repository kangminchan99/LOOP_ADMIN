import { cookies } from 'next/headers';
import { env } from '@/src/config/env';
import { validateCouponEvent } from '@/src/features/coupons/lib/validate-coupon-event';
import type { CreateCouponEventInput } from '@/src/features/coupons/types/coupon-event';

const messages: Record<number, string> = {
  400: '입력값과 날짜 순서를 확인해주세요.',
  401: '로그인이 만료되었습니다. 다시 로그인해주세요.',
  403: '관리자만 쿠폰 이벤트를 생성할 수 있습니다.',
  429: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
};

function failure(message: string, status: number, uncertain = false) {
  return Response.json(
    { message, uncertain },
    {
      status,
      headers: { 'Cache-Control': 'private, no-store' },
    },
  );
}

export async function POST(request: Request) {
  // 1. 쿠키를 사용하는 쓰기 요청은 같은 출처에서만 허용한다.
  if (request.headers.get('origin') !== new URL(request.url).origin) {
    return failure('허용되지 않은 요청 출처입니다.', 403);
  }

  // 2. 서버에서 HttpOnly 인증 쿠키를 읽는다.
  const token = (await cookies()).get('accessToken')?.value;

  if (!token) {
    return failure(messages[401], 401);
  }

  // 3. JSON 파싱과 입력 검증을 수행한다.
  let input: CreateCouponEventInput;

  try {
    const body: unknown = await request.json();
    input = validateCouponEvent(body);
  } catch (error) {
    return failure(
      error instanceof SyntaxError
        ? '올바른 JSON 요청이 필요합니다.'
        : error instanceof Error
          ? error.message
          : '입력값을 확인해주세요.',
      400,
    );
  }

  try {
    // 4. NestJS 관리자 API에 요청한다. 최종 권한은 NestJS가 검사한다.
    const response = await fetch(`${env.apiBaseUrl}/admin/coupon-events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      // 서버 내부 오류 본문은 브라우저에 그대로 전달하지 않는다.
      return failure(
        messages[response.status] ??
          '생성 결과를 확인하지 못했습니다. 이벤트 생성 여부를 확인해주세요.',
        response.status,
        response.status >= 500,
      );
    }

    // 5. 생성된 이벤트 정보를 브라우저에 반환한다.
    const event: unknown = await response.json();

    return Response.json(event, {
      status: 201,
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch {
    // 통신 실패여도 DB에는 생성됐을 수 있으므로 자동 재시도하지 않는다.
    return failure(
      '생성 결과를 확인하지 못했습니다. 앱 또는 Swagger에서 생성 여부를 확인해주세요.',
      502,
      true,
    );
  }
}
