import { env } from '@/src/config/env';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
};

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { message: 'Refresh token이 없습니다.' },
      { status: 401 },
    );
  }

  const response = await fetch(`${env.apiBaseUrl}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refreshToken,
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    const nextResponse = NextResponse.json(
      { message: '로그인 연장에 실패했습니다.' },
      { status: response.status },
    );

    nextResponse.cookies.delete('accessToken');
    nextResponse.cookies.delete('refreshToken');
    nextResponse.cookies.delete('accessTokenExpiresAt');

    return nextResponse;
  }

  const tokens = (await response.json()) as RefreshResponse;

  const accessTokenMaxAge = 60 * 15;
  const accessTokenExpiresAt = new Date(
    Date.now() + accessTokenMaxAge * 1000,
  ).toISOString();

  const nextResponse = NextResponse.json({
    ok: true,
    accessTokenExpiresAt,
  });

  nextResponse.cookies.set('accessToken', tokens.accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: accessTokenMaxAge,
  });

  nextResponse.cookies.set('accessTokenExpiresAt', accessTokenExpiresAt, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: accessTokenMaxAge,
  });

  nextResponse.cookies.set('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return nextResponse;
}
