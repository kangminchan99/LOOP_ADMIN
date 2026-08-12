import { serverFetch } from '@/src/shared/api/server-fetch';

export type AdminUser = {
  id: number;
  email: string | null;
  nickname: string;
  profileImageUrl: string | null;
  point: number;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
};

export type GetAdminUsersParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export type AdminUserListPage = {
  items: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export async function getAdminUsers(
  params: GetAdminUsersParams = {},
): Promise<AdminUserListPage> {
  const searchParams = new URLSearchParams();

  if (params.page) {
    searchParams.set('page', String(params.page));
  }

  if (params.limit) {
    searchParams.set('limit', String(params.limit));
  }

  if (params.search) {
    searchParams.set('search', params.search);
  }

  const queryString = searchParams.toString();
  const path = queryString ? `/admin/users?${queryString}` : '/admin/users';

  return serverFetch<AdminUserListPage>(path);
}
