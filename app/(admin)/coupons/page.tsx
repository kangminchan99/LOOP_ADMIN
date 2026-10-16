import { CreateCouponEventForm } from '@/src/features/coupons/components/create-coupon-event-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '쿠폰 이벤트 생성 | Loop Admin',
};

// 제목·레이아웃은 Server Component로 유지한다.
// 입력·제출 처리는 내부의 Client Component가 담당한다.
export default function AdminCouponsPage() {
  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header>
          <p className="text-sm font-semibold text-violet-300">Coupons</p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            쿠폰 이벤트 생성
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            선착순 쿠폰 이벤트의 수량과 발급 기간을 설정합니다.
          </p>
        </header>

        <CreateCouponEventForm />
      </section>
    </main>
  );
}
