import { getAdminComments } from '@/src/features/comments/api/get-admin-comments';
import { AdminCommentsTable } from '@/src/features/comments/components/admin-comments-table';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

type AdminCommentsPageProps = {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    deleted?: string;
  }>;
};

export default async function AdminCommentsPage({
  searchParams,
}: AdminCommentsPageProps) {
  const params = await searchParams;

  const page = getPositiveNumber(params.page, DEFAULT_PAGE);
  const limit = getPositiveNumber(params.limit, DEFAULT_LIMIT);
  const search = params.search?.trim() || undefined;

  const commentsPage = await getAdminComments({
    page,
    limit,
    search,
  });

  // 현재 페이지가 사라졌으면 마지막 유효 페이지로 이동
  const lastPage = Math.max(1, commentsPage.totalPages);

  if (page > lastPage) {
    const href = buildCommentsHref({
      page: lastPage,
      limit: commentsPage.limit,
      search,
    });

    redirect(params.deleted === '1' ? `${href}&deleted=1` : href);
  }

  const paginationPages = getPaginationPages(
    commentsPage.page,
    commentsPage.totalPages,
  );

  const previousPage = Math.max(1, commentsPage.page - 1);
  const nextPage = Math.min(commentsPage.totalPages, commentsPage.page + 1);

  return (
    <main className="px-6 py-8 lg:px-8">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header>
          <p className="text-sm font-semibold text-violet-300">Comments</p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">댓글 관리</h1>

          <p className="mt-2 text-sm text-slate-400">
            앱에 작성된 댓글과 연결된 게시글 정보를 확인합니다.
          </p>
        </header>
        {params.deleted === '1' ? (
          <p
            role="status"
            className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200"
          >
            댓글 삭제가 완료되었습니다.
          </p>
        ) : null}
        <form
          action="/comments"
          className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/4 p-4 md:flex-row md:items-center"
        >
          <input
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-violet-400 md:max-w-sm"
            defaultValue={search ?? ''}
            name="search"
            placeholder="댓글, 작성자, 게시글 검색"
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

        <section>
          <div className="mb-4 rounded-2xl border border-white/10 bg-white/4 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-200">
              전체 댓글 {commentsPage.total.toLocaleString('ko-KR')}개
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {commentsPage.totalPages === 0
                ? '검색 결과 없음'
                : `${commentsPage.page.toLocaleString('ko-KR')} / ${commentsPage.totalPages.toLocaleString('ko-KR')} 페이지`}
            </p>

            {search ? (
              <p className="mt-1 text-xs text-violet-300">검색어: {search}</p>
            ) : null}
          </div>

          <AdminCommentsTable comments={commentsPage.items} />
        </section>

        {commentsPage.totalPages > 0 ? (
          <nav
            aria-label="댓글 목록 페이지네이션"
            className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/4 p-4 md:flex-row md:items-center md:justify-between"
          >
            <p className="text-sm text-slate-400">
              총 {commentsPage.total.toLocaleString('ko-KR')}개 ·{' '}
              {commentsPage.page.toLocaleString('ko-KR')} /{' '}
              {commentsPage.totalPages.toLocaleString('ko-KR')} 페이지
            </p>

            <div className="flex items-center justify-between gap-3 md:hidden">
              <PaginationLink
                disabled={commentsPage.page <= 1}
                href={buildCommentsHref({
                  page: previousPage,
                  limit: commentsPage.limit,
                  search,
                })}
              >
                이전
              </PaginationLink>

              <span className="text-sm font-semibold text-white">
                {commentsPage.page} / {commentsPage.totalPages}
              </span>

              <PaginationLink
                disabled={commentsPage.page >= commentsPage.totalPages}
                href={buildCommentsHref({
                  page: nextPage,
                  limit: commentsPage.limit,
                  search,
                })}
              >
                다음
              </PaginationLink>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <PaginationLink
                disabled={commentsPage.page <= 1}
                href={buildCommentsHref({
                  page: previousPage,
                  limit: commentsPage.limit,
                  search,
                })}
              >
                이전
              </PaginationLink>

              {paginationPages.map((paginationPage) => (
                <PaginationLink
                  key={paginationPage}
                  active={paginationPage === commentsPage.page}
                  href={buildCommentsHref({
                    page: paginationPage,
                    limit: commentsPage.limit,
                    search,
                  })}
                >
                  {paginationPage.toLocaleString('ko-KR')}
                </PaginationLink>
              ))}

              <PaginationLink
                disabled={commentsPage.page >= commentsPage.totalPages}
                href={buildCommentsHref({
                  page: nextPage,
                  limit: commentsPage.limit,
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

function buildCommentsHref({
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

  return `/comments?${searchParams.toString()}`;
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
