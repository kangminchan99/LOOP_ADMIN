'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function parseExpiresAt(expiresAtValue: string | null): number | null {
  if (!expiresAtValue) {
    return null;
  }

  const expiresAtTime = Number(expiresAtValue.trim());

  if (Number.isFinite(expiresAtTime)) {
    return expiresAtTime;
  }

  const parsedDateTime = Date.parse(expiresAtValue);

  if (!Number.isFinite(parsedDateTime)) {
    return null;
  }

  return parsedDateTime;
}

function formatRemainingTime(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

type SessionTimerProps = {
  initialAccessTokenExpiresAt?: string | null;
};

export function SessionTimer({
  initialAccessTokenExpiresAt,
}: SessionTimerProps) {
  const router = useRouter();

  const [expiresAtTime, setExpiresAtTime] = useState(() =>
    parseExpiresAt(initialAccessTokenExpiresAt ?? null),
  );
  const [now, setNow] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isExpired =
    now !== null && expiresAtTime !== null && now >= expiresAtTime;

  const remainingMilliseconds =
    now === null ? 0 : Math.max(0, (expiresAtTime ?? 0) - now);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setNow(Date.now());
    }, 0);

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!isExpired) {
      return;
    }

    router.push('/login');
    router.refresh();
  }, [isExpired, router]);

  async function handleRefreshSession() {
    setIsRefreshing(true);

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('세션 연장 실패');
      }

      const data = (await response.json()) as {
        accessTokenExpiresAt?: string;
      };

      setExpiresAtTime(parseExpiresAt(data.accessTokenExpiresAt ?? null));
      setNow(Date.now());
      router.refresh();
    } catch {
      router.push('/login');
      router.refresh();
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <div className="flex items-center gap-3 text-xs text-slate-300">
      <span>
        남은 시간{' '}
        <strong
          className="font-semibold text-white"
          id="session-timer-value"
          suppressHydrationWarning
        >
          {formatRemainingTime(remainingMilliseconds)}
        </strong>
      </span>

      <button
        className="rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 font-semibold text-violet-200 transition hover:bg-violet-400/20 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isRefreshing}
        id="session-refresh-button"
        type="button"
        onClick={handleRefreshSession}
      >
        {isRefreshing ? '연장 중...' : '로그인 연장'}
      </button>
    </div>
  );
}
