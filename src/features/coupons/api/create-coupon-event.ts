import type {
  CouponEvent,
  CreateCouponEventInput,
} from '../types/coupon-event';

// 화면에서 일반 실패와 결과 미확정을 구분하기 위한 오류
export class CouponCreateError extends Error {
  constructor(
    message: string,
    public readonly uncertain: boolean,
  ) {
    super(message);
    this.name = 'CouponCreateError';
  }
}

export async function createCouponEvent(
  input: CreateCouponEventInput,
): Promise<CouponEvent> {
  let response: Response;

  try {
    // 같은 웹사이트의 Next.js Route Handler를 호출한다.
    response = await fetch('/api/admin/coupon-events', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
  } catch {
    // 연결이 끊겼어도 서버에서는 생성됐을 수 있다.
    throw new CouponCreateError(
      '네트워크 오류로 생성 결과를 확인하지 못했습니다. 생성 여부를 확인해주세요.',
      true,
    );
  }

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const data =
      body && typeof body === 'object'
        ? (body as Record<string, unknown>)
        : null;

    throw new CouponCreateError(
      typeof data?.message === 'string'
        ? data.message
        : '이벤트 생성 요청을 완료하지 못했습니다.',
      data?.uncertain === true || response.status >= 500,
    );
  }

  // TypeScript 타입만으로 실제 응답을 보장할 수 없으므로 검사한다.
  if (!isCouponEvent(body)) {
    throw new CouponCreateError(
      '서버 응답을 확인하지 못했습니다. 이벤트 생성 여부를 확인해주세요.',
      true,
    );
  }

  return body;
}

// 성공 응답이 화면에서 사용할 이벤트 구조인지 확인한다.
function isCouponEvent(value: unknown): value is CouponEvent {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const data = value as Record<string, unknown>;

  const numberKeys = ['totalQuantity', 'issuedCount', 'remainingQuantity'];

  const dateKeys = [
    'startsAt',
    'endsAt',
    'couponExpiresAt',
    'createdAt',
    'updatedAt',
    'serverTime',
  ];

  return (
    typeof data.id === 'number' &&
    Number.isInteger(data.id) &&
    data.id > 0 &&
    typeof data.title === 'string' &&
    typeof data.isActive === 'boolean' &&
    numberKeys.every(
      (key) =>
        typeof data[key] === 'number' &&
        Number.isInteger(data[key]) &&
        data[key] >= 0,
    ) &&
    dateKeys.every(
      (key) =>
        typeof data[key] === 'string' && Number.isFinite(Date.parse(data[key])),
    )
  );
}
