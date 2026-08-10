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

export async function getAdminUsers(): Promise<AdminUser[]> {
  return serverFetch<AdminUser[]>('/users');
}
