import { env } from '@/src/config/env';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    return NextResponse.json(
      { message: '로그인이 필요합니다.' },
      { status: 401 },
    );
  }

  const response = await fetch(
    `${env.apiBaseUrl}/admin/dashboard/daily-stats/rebuild`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    },
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return NextResponse.json(
      data ?? { message: '통계 재집계에 실패했습니다.' },
      { status: response.status },
    );
  }

  return NextResponse.json(data);
}
