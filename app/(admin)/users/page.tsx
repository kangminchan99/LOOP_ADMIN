import { getAdminUsers } from '@/src/features/users/api/get-admin-users';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const users = await getAdminUsers();

  return (
    <main className="px-6 py-8 lg:px-8">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header>
          <p className="text-sm font-semibold text-violet-300">Users</p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">유저 관리</h1>

          <p className="mt-2 text-sm text-slate-400">
            가입한 사용자 목록, 권한, 포인트를 확인합니다.
          </p>
        </header>

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/4">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-200">
              전체 유저 {users.length.toLocaleString('ko-KR')}명
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-190 text-left text-sm">
              <thead className="bg-white/3 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">이메일</th>
                  <th className="px-5 py-3">닉네임</th>
                  <th className="px-5 py-3">권한</th>
                  <th className="px-5 py-3">포인트</th>
                  <th className="px-5 py-3">가입일</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {users.map((user) => (
                  <tr key={user.id} className="transition hover:bg-white/3">
                    <td className="px-5 py-4 text-slate-400">{user.id}</td>
                    <td className="px-5 py-4 text-slate-200">
                      {user.email ?? '-'}
                    </td>
                    <td className="px-5 py-4 text-white">{user.nickname}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-2.5 py-1 text-xs font-semibold text-violet-200">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-300">
                      {user.point.toLocaleString('ko-KR')}
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}
