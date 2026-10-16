import type { CreateCouponEventInput } from '../types/coupon-event';

const DATE_TIME_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;

// 외부 입력은 검사하기 전까지 타입을 확신할 수 없으므로 unknown으로 받는다.
export function validateCouponEvent(value: unknown): CreateCouponEventInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('이벤트 정보를 입력해주세요.');
  }

  const data = value as Record<string, unknown>;

  const allowedKeys = [
    'title',
    'totalQuantity',
    'startsAt',
    'endsAt',
    'couponExpiresAt',
  ];

  if (Object.keys(data).some((key) => !allowedKeys.includes(key))) {
    throw new Error('허용되지 않은 입력 항목입니다.');
  }

  // 이름 앞뒤 공백을 제거하고 길이를 검사한다.
  const title = typeof data.title === 'string' ? data.title.trim() : '';

  if (!title || Array.from(title).length > 100) {
    throw new Error('이벤트 이름은 1~100자로 입력해주세요.');
  }

  const totalQuantity = data.totalQuantity;

  if (
    typeof totalQuantity !== 'number' ||
    !Number.isInteger(totalQuantity) ||
    totalQuantity < 1 ||
    totalQuantity > 100000
  ) {
    throw new Error('발급 수량은 1~100,000 사이의 정수여야 합니다.');
  }

  const startsAt = validateDate(data.startsAt, '발급 시작');
  const endsAt = validateDate(data.endsAt, '발급 종료');
  const couponExpiresAt = validateDate(data.couponExpiresAt, '쿠폰 만료');

  if (
    Date.parse(startsAt) >= Date.parse(endsAt) ||
    Date.parse(endsAt) >= Date.parse(couponExpiresAt)
  ) {
    throw new Error('발급 시작 < 발급 종료 < 쿠폰 만료 순서여야 합니다.');
  }

  // 검사한 필드만 반환한다.
  return {
    title,
    totalQuantity,
    startsAt,
    endsAt,
    couponExpiresAt,
  };
}

function validateDate(value: unknown, label: string): string {
  if (
    typeof value !== 'string' ||
    !DATE_TIME_PATTERN.test(value) ||
    !Number.isFinite(Date.parse(value))
  ) {
    throw new Error(`${label} 일시에 올바른 날짜와 시간대를 입력해주세요.`);
  }

  // Date가 2월 30일 등을 다음 달 날짜로 보정하는 경우를 거른다.
  const calendarDate = value.slice(0, 10);
  const midnight = new Date(`${calendarDate}T00:00:00.000Z`);

  if (
    !Number.isFinite(midnight.getTime()) ||
    midnight.toISOString().slice(0, 10) !== calendarDate ||
    Number(value.slice(11, 13)) > 23 ||
    Number(value.slice(14, 16)) > 59 ||
    Number(value.slice(17, 19)) > 59
  ) {
    throw new Error(`${label} 일시가 유효하지 않습니다.`);
  }

  return value;
}
