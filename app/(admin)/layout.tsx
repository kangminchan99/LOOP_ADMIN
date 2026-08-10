import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-slate-950/95 p-6 lg:block">
        <p className="text-sm font-semibold text-violet-300">Loop Admin</p>

        <nav className="mt-8 flex flex-col gap-2 text-sm text-slate-300">
          <Link className="rounded-xl bg-white/6 px-3 py-2 text-white" href="/">
            대시보드
          </Link>
          <Link
            className="rounded-xl px-3 py-2 transition hover:bg-white/6"
            href="/users"
          >
            유저 관리
          </Link>
          <Link
            className="rounded-xl px-3 py-2 transition hover:bg-white/6"
            href="/posts"
          >
            게시글 관리
          </Link>
          <Link
            className="rounded-xl px-3 py-2 transition hover:bg-white/6"
            href="/comments"
          >
            댓글 관리
          </Link>
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/80 px-6 py-4 backdrop-blur lg:px-8">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">관리자 콘솔</p>

            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              ADMIN
            </span>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
