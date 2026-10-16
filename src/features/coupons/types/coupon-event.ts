// POST /admin/coupon-events로 보낼 데이터
export type CreateCouponEventInput = {
  title: string;
  totalQuantity: number;

  // API에서는 날짜를 시간대가 포함된 문자열로 전달한다.
  startsAt: string;
  endsAt: string;
  couponExpiresAt: string;
};

// 생성·활성화 API에서 돌려주는 이벤트 정보
export type CouponEvent = CreateCouponEventInput & {
  id: number;
  issuedCount: number;
  remainingQuantity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  serverTime: string;
};
