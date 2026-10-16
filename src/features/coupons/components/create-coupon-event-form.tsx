'use client';

import { useRef, useState, type SubmitEvent } from 'react';
import {
  CouponCreateError,
  createCouponEvent,
} from '../api/create-coupon-event';
import { validateCouponEvent } from '../lib/validate-coupon-event';
import type {
  CouponEvent,
  CreateCouponEventInput,
} from '../types/coupon-event';

const inputClass =
  'min-h-11 w-full min-w-0 rounded-xl border border-white/20 bg-slate-950 px-4 py-3 text-white outline-none focus:border-violet-400';

const dateFields = [
  { name: 'startsAt', label: '발급 시작 일시' },
  { name: 'endsAt', label: '발급 종료 일시' },
  { name: 'couponExpiresAt', label: '쿠폰 만료 일시' },
] as const;

// 브라우저 현지 시간 입력을 UTC 문자열로 변환한다.
function toIsoString(value: FormDataEntryValue | null): string {
  if (typeof value !== 'string' || !value) {
    throw new Error('날짜와 시간을 모두 입력해주세요.');
  }

  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    throw new Error('올바른 날짜와 시간을 입력해주세요.');
  }

  return date.toISOString();
}

export function CreateCouponEventForm() {
  // React가 화면을 갱신하기 전의 연속 제출도 차단한다.
  const inFlight = useRef(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uncertain, setUncertain] = useState(false);
  const [createdEvent, setCreatedEvent] = useState<CouponEvent | null>(null);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (inFlight.current || uncertain || createdEvent) return;

    const formData = new FormData(event.currentTarget);
    setErrorMessage(null);

    let input: CreateCouponEventInput;

    try {
      input = validateCouponEvent({
        title: formData.get('title'),
        totalQuantity: Number(formData.get('totalQuantity')),
        startsAt: toIsoString(formData.get('startsAt')),
        endsAt: toIsoString(formData.get('endsAt')),
        couponExpiresAt: toIsoString(formData.get('couponExpiresAt')),
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : '입력값을 확인해주세요.',
      );
      return;
    }

    inFlight.current = true;
    setIsSubmitting(true);

    try {
      const result = await createCouponEvent(input);
      setCreatedEvent(result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '이벤트 생성 결과를 확인하지 못했습니다.',
      );

      // 결과가 불확실하면 생성 요청을 반복하지 않는다.
      setUncertain(error instanceof CouponCreateError ? error.uncertain : true);
    } finally {
      inFlight.current = false;
      setIsSubmitting(false);
    }
  }

  if (createdEvent) {
    return (
      <section
        role="status"
        className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5 sm:p-6"
      >
        <h2 className="text-lg font-semibold text-emerald-200">
          쿠폰 이벤트가 생성되었습니다.
        </h2>

        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-slate-400">이벤트 ID</dt>
            <dd>{createdEvent.id}</dd>
          </div>
          <div>
            <dt className="text-slate-400">이벤트 이름</dt>
            <dd className="wrap-break-word">{createdEvent.title}</dd>
          </div>
          <div>
            <dt className="text-slate-400">전체 수량</dt>
            <dd>{createdEvent.totalQuantity.toLocaleString('ko-KR')}장</dd>
          </div>
          <div>
            <dt className="text-slate-400">신규 발급 상태</dt>
            <dd>{createdEvent.isActive ? '활성' : '중지'}</dd>
          </div>
        </dl>

        <p className="mt-4 text-sm leading-6 text-slate-300">
          신규 발급을 활성화하면 설정한 발급 기간에 쿠폰을 받을 수 있습니다.
        </p>
      </section>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-busy={isSubmitting}
      className="rounded-2xl border border-white/10 bg-white/4 p-5 sm:p-6"
    >
      <fieldset
        disabled={isSubmitting || uncertain}
        className="min-w-0 space-y-5 disabled:opacity-60"
      >
        <legend className="mb-5 text-lg font-semibold">새 쿠폰 이벤트</legend>

        <label className="flex flex-col gap-2 text-sm">
          이벤트 이름
          <input
            name="title"
            required
            maxLength={100}
            placeholder="예: 오픈 기념 선착순 쿠폰"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm">
          전체 발급 수량
          <input
            name="totalQuantity"
            type="number"
            required
            min={1}
            max={100000}
            step={1}
            defaultValue={100}
            className={inputClass}
          />
          <span className="text-xs text-slate-400">
            1~100,000장 · 사용자별 이벤트당 1장
          </span>
        </label>

        <div className="grid min-w-0 gap-5 md:grid-cols-2">
          {dateFields.map((field) => (
            <label
              key={field.name}
              className="flex min-w-0 flex-col gap-2 text-sm"
            >
              {field.label}
              <input
                name={field.name}
                type="datetime-local"
                required
                className={`${inputClass} scheme-dark`}
              />
            </label>
          ))}
        </div>

        <p className="text-sm leading-6 text-slate-400">
          날짜는 브라우저의 현지 시간 기준입니다. 발급 시작 → 발급 종료 → 쿠폰
          만료 순서로 입력해주세요. 이벤트는 신규 발급 중지 상태로 생성됩니다.
        </p>

        <button
          type="submit"
          className="min-h-11 w-full rounded-xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 sm:w-auto"
        >
          {isSubmitting ? '생성 중…' : '이벤트 생성'}
        </button>
      </fieldset>

      {errorMessage ? (
        <p role="alert" className="mt-4 text-sm text-red-300">
          {errorMessage}
        </p>
      ) : null}

      {uncertain ? (
        <p className="mt-3 text-sm leading-6 text-amber-200">
          중복 생성을 막기 위해 추가 요청을 멈췄습니다. 앱 또는 Swagger에서 생성
          여부를 확인한 뒤 다시 진행해주세요.
        </p>
      ) : null}
    </form>
  );
}
