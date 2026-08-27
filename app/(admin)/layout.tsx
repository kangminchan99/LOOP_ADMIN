import { AdminShell } from '@/src/features/admin/components/admin-shell';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const accessTokenExpiresAt =
    cookieStore.get('accessTokenExpiresAt')?.value ?? null;

  if (!accessToken) {
    redirect('/login');
  }

  return (
    <AdminShell accessTokenExpiresAt={accessTokenExpiresAt}>
      {children}
    </AdminShell>
  );
}
