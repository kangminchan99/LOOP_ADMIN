// 관리자 웹 내부 로그인 API
import { env } from '@/src/config/env';
import { NextResponse } from 'next/server';

type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as LoginRequest;

  const response = await fetch(`${env.apiBaseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!response.ok) {
    return NextResponse.json(
      { message: '로그인에 실패했습니다.' },
      { status: response.status },
    );
  }

  const tokens = (await response.json()) as LoginResponse;

  const accessTokenMaxAge = 60 * 15;
  const accessTokenExpiresAt = String(Date.now() + accessTokenMaxAge * 1000);

  const nextResponse = NextResponse.json({
    ok: true,
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
