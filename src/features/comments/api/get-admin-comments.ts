import { serverFetch } from '@/src/shared/api/server-fetch';
import type { AdminCommentListPage } from '../types/admin-comment';

type GetAdminCommentsParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export async function getAdminComments({
  page = 1,
  limit = 20,
  search,
}: GetAdminCommentsParams): Promise<AdminCommentListPage> {
  const params = new URLSearchParams();

  params.set('page', String(page));
  params.set('limit', String(limit));

  if (search?.trim()) {
    params.set('search', search.trim());
  }

  return serverFetch<AdminCommentListPage>(
    `/admin/comments?${params.toString()}`,
  );
}
