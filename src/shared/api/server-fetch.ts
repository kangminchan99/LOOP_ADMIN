import { env } from '@/src/config/env';
import { cookies } from 'next/headers';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 모든 API 호출의 공통 규칙
export async function serverFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const cookieStore = await cookies();
  // 관리자 화면 API 호출 시, 서버에서 쿠키를 읽어 accessToken을 가져와서 요청 헤더에 포함시킴
  const accessToken = cookieStore.get('accessToken')?.value;

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...options,

    // 관리자 화면 데이터는 항상 최신 운영 덷이터를 봐야하므로 캐싱하지 않음,
    cache: 'no-store',

    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();

    throw new ApiError(
      `API 요청 실패: ${response.status}`,
      response.status,
      body,
    );
  }

  return response.json() as Promise<T>;
}
