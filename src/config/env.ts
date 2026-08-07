// env 설정 파일
export const env = {
  apiBaseUrl: process.env.LOOP_API_BASE_URL ?? 'http://localhost:3000',
} as const;
