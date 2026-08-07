import { env } from '@/src/config/env';

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
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...options,

    // 관리자 화면 데이터는 항상 최신 운영 덷이터를 봐야하므로 캐싱하지 않음,
    cache: 'no-store',

    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
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
