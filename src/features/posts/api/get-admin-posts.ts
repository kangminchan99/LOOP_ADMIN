import { serverFetch } from '@/src/shared/api/server-fetch';
import type { AdminPostListPage } from '../types/admin-post';

type GetAdminPostsParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export async function getAdminPosts({
  page = 1,
  limit = 20,
  search,
}: GetAdminPostsParams): Promise<AdminPostListPage> {
  const params = new URLSearchParams();

  params.set('page', String(page));
  params.set('limit', String(limit));

  if (search?.trim()) {
    params.set('search', search.trim());
  }

  return serverFetch<AdminPostListPage>(`/admin/posts?${params.toString()}`);
}
