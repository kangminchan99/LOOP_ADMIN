import { ApiError, serverFetch } from '@/src/shared/api/server-fetch';

export type AdminDashboardResponse = {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  totalNotifications: number;
  unreadNotifications: number;
  todayUsers: number;
  todayPosts: number;
  todayComments: number;
  generatedAt: string;
};

export type AdminDashboardResult = {
  data: AdminDashboardResponse | null;
  error: string | null;
};

export async function getAdminDashboard(): Promise<AdminDashboardResult> {
  try {
    const data = await serverFetch<AdminDashboardResponse>('/admin/dashboard');

    return {
      data,
      error: null,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        data: null,
        error: `서버 API 요청 실패: ${error.status}`,
      };
    }

    return {
      data: null,
      error: '알 수 없는 오류가 발생했습니다.',
    };
  }
}
