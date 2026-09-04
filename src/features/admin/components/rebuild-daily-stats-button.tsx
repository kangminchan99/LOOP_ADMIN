'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function RebuildDailyStatsButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    if (isPending) {
      return;
    }

    setIsPending(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/dashboard/daily-stats/rebuild', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('통계 재집계에 실패했습니다.');
      }

      setMessage('통계 재집계가 완료되었습니다.');

      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.',
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:items-end">
      <button
        className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
        type="button"
        disabled={isPending}
        onClick={handleClick}
      >
        {isPending ? '재집계 중...' : '통계 재집계'}
      </button>

      {message ? <p className="text-xs text-slate-400">{message}</p> : null}
    </div>
  );
}
