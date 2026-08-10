'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function getCookieValue(name: string): string | null {
  const cookies = document.cookie.split('; ');

  const targetCookie = cookies.find((cookie) => cookie.startsWith(`${name}=`));

  if (!targetCookie) {
    return null;
  }

  return decodeURIComponent(targetCookie.split('=')[1] ?? '');
}

function formatRemainingTime(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function SessionTimer() {
  const router = useRouter();

  const [remainingMilliseconds, setRemainingMilliseconds] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    function updateRemainingTime() {
      const expiresAtValue = getCookieValue('accessTokenExpiresAt');

      if (!expiresAtValue) {
        setRemainingMilliseconds(0);
        return;
      }

      const expiresAtTime = new Date(expiresAtValue).getTime();
      const diff = expiresAtTime - Date.now();

      setRemainingMilliseconds(Math.max(0, diff));
    }

    updateRemainingTime();

    const intervalId = window.setInterval(updateRemainingTime, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  async function handleRefreshSession() {
    setIsRefreshing(true);

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('세션 연장 실패');
      }

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
        <strong className="font-semibold text-white">
          {formatRemainingTime(remainingMilliseconds)}
        </strong>
      </span>

      <button
        className="rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 font-semibold text-violet-200 transition hover:bg-violet-400/20 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isRefreshing}
        type="button"
        onClick={handleRefreshSession}
      >
        {isRefreshing ? '연장 중...' : '로그인 연장'}
      </button>
    </div>
  );
}
