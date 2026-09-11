import { getAdminUsers } from '@/src/features/users/api/get-admin-users';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { DeleteUserButton } from '@/src/features/users/components/delete-user-button';

export const dynamic = 'force-dynamic';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

type AdminUsersPageProps = {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    deleted?: string;
  }>;
};

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const params = await searchParams;

  const page = getPositiveNumber(params.page, DEFAULT_PAGE);
  const limit = getPositiveNumber(params.limit, DEFAULT_LIMIT);
  const search = params.search?.trim() || undefined;

  const userPage = await getAdminUsers({
    page,
    limit,
    search,
  });

  const users = userPage.items;
  // 마지막 항목을 삭제한 뒤 빈 페이지에 머무르지 않도록 보정.
  const lastPage = Math.max(1, userPage.totalPages);
  if (page > lastPage) {
    const href = buildUsersHref({ page: lastPage, limit: userPage.limit, search });
    redirect(params.deleted === '1' ? `${href}&deleted=1` : href);
  }

  const paginationPages = getPaginationPages(
    userPage.page,
    userPage.totalPages,
  );
  const previousPage = Math.max(1, userPage.page - 1);
  const nextPage = Math.min(userPage.totalPages, userPage.page + 1);

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
        {params.deleted === '1' ? (
          <p role="status" className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">유저 삭제가 완료되었습니다.</p>
        ) : null}
        <form
          action="/users"
          className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/4 p-4 md:flex-row md:items-center"
        >
          <input
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-violet-400 md:max-w-sm"
            defaultValue={search ?? ''}
            name="search"
            placeholder="이메일 또는 닉네임 검색"
            type="search"
          />

          <input name="limit" type="hidden" value={limit} />

          <button
            className="rounded-xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 md:w-auto"
            type="submit"
          >
            검색
          </button>
        </form>

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/4">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-200">
              전체 유저 {userPage.total.toLocaleString('ko-KR')}명
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {userPage.totalPages === 0
                ? '검색 결과 없음'
                : `${userPage.page.toLocaleString('ko-KR')} / ${userPage.totalPages.toLocaleString('ko-KR')} 페이지`}
            </p>

            {search ? (
              <p className="mt-1 text-xs text-violet-300">검색어: {search}</p>
            ) : null}
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
                  <th className="px-5 py-3">관리</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {users.length > 0 ? (
                  users.map((user) => (
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
                      <td className="px-5 py-4">
                        <DeleteUserButton userId={user.id} nickname={user.nickname} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-5 py-10 text-center text-slate-400"
                      colSpan={7}
                    >
                      조회된 유저가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
        {userPage.totalPages > 0 ? (
          <nav
            aria-label="유저 목록 페이지네이션"
            className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/4 p-4 md:flex-row md:items-center md:justify-between"
          >
            <p className="text-sm text-slate-400">
              총 {userPage.total.toLocaleString('ko-KR')}명 ·{' '}
              {userPage.page.toLocaleString('ko-KR')} /{' '}
              {userPage.totalPages.toLocaleString('ko-KR')} 페이지
            </p>

            {/* 모바일: 단순 페이지네이션 */}
            <div className="flex items-center justify-between gap-3 md:hidden">
              <PaginationLink
                disabled={userPage.page <= 1}
                href={buildUsersHref({
                  page: previousPage,
                  limit: userPage.limit,
                  search,
                })}
              >
                이전
              </PaginationLink>

              <span className="text-sm font-semibold text-white">
                {userPage.page} / {userPage.totalPages}
              </span>

              <PaginationLink
                disabled={userPage.page >= userPage.totalPages}
                href={buildUsersHref({
                  page: nextPage,
                  limit: userPage.limit,
                  search,
                })}
              >
                다음
              </PaginationLink>
            </div>

            {/* md 이상: 번호형 페이지네이션 */}
            <div className="hidden items-center gap-2 md:flex">
              <PaginationLink
                disabled={userPage.page <= 1}
                href={buildUsersHref({
                  page: previousPage,
                  limit: userPage.limit,
                  search,
                })}
              >
                이전
              </PaginationLink>

              {paginationPages.map((paginationPage) => (
                <PaginationLink
                  key={paginationPage}
                  active={paginationPage === userPage.page}
                  href={buildUsersHref({
                    page: paginationPage,
                    limit: userPage.limit,
                    search,
                  })}
                >
                  {paginationPage.toLocaleString('ko-KR')}
                </PaginationLink>
              ))}

              <PaginationLink
                disabled={userPage.page >= userPage.totalPages}
                href={buildUsersHref({
                  page: nextPage,
                  limit: userPage.limit,
                  search,
                })}
              >
                다음
              </PaginationLink>
            </div>
          </nav>
        ) : null}
      </section>
    </main>
  );
}

function getPositiveNumber(
  value: string | undefined,
  fallback: number,
): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

function getPaginationPages(currentPage: number, totalPages: number): number[] {
  const visibleCount = 5;

  if (totalPages <= visibleCount) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const half = Math.floor(visibleCount / 2);
  let start = Math.max(1, currentPage - half);
  let end = start + visibleCount - 1;

  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - visibleCount + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function buildUsersHref({
  page,
  limit,
  search,
}: {
  page: number;
  limit: number;
  search?: string;
}): string {
  const searchParams = new URLSearchParams();

  searchParams.set('page', String(page));
  searchParams.set('limit', String(limit));

  if (search) {
    searchParams.set('search', search);
  }

  return `/users?${searchParams.toString()}`;
}

function PaginationLink({
  active = false,
  children,
  disabled = false,
  href,
}: {
  active?: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  href: string;
}) {
  const className = [
    'inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl border px-3 py-2 text-sm font-semibold transition',
    active
      ? 'border-violet-400/40 bg-violet-400/20 text-white'
      : 'border-white/10 bg-white/4 text-slate-300 hover:bg-white/6',
    disabled ? 'pointer-events-none opacity-40' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Link aria-disabled={disabled} className={className} href={href}>
      {children}
    </Link>
  );
}
