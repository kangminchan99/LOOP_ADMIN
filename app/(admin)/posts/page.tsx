import { getAdminPosts } from '@/src/features/posts/api/get-admin-posts';
import { AdminPostsTable } from '@/src/features/posts/components/admin-posts-table';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

type AdminPostsPageProps = {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
  }>;
};

export default async function AdminPostsPage({
  searchParams,
}: AdminPostsPageProps) {
  const params = await searchParams;

  const page = getPositiveNumber(params.page, DEFAULT_PAGE);
  const limit = getPositiveNumber(params.limit, DEFAULT_LIMIT);
  const search = params.search?.trim() || undefined;

  const postsPage = await getAdminPosts({
    page,
    limit,
    search,
  });

  const paginationPages = getPaginationPages(
    postsPage.page,
    postsPage.totalPages,
  );

  const previousPage = Math.max(1, postsPage.page - 1);
  const nextPage = Math.min(postsPage.totalPages, postsPage.page + 1);

  return (
    <main className="px-6 py-8 lg:px-8">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header>
          <p className="text-sm font-semibold text-violet-300">Posts</p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            게시글 관리
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            앱에 작성된 게시글을 조회하고 검색합니다.
          </p>
        </header>

        <form
          action="/posts"
          className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/4 p-4 md:flex-row md:items-center"
        >
          <input
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-violet-400 md:max-w-sm"
            defaultValue={search ?? ''}
            name="search"
            placeholder="제목 또는 내용 검색"
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
              전체 게시글 {postsPage.total.toLocaleString('ko-KR')}개
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {postsPage.totalPages === 0
                ? '검색 결과 없음'
                : `${postsPage.page.toLocaleString('ko-KR')} / ${postsPage.totalPages.toLocaleString('ko-KR')} 페이지`}
            </p>

            {search ? (
              <p className="mt-1 text-xs text-violet-300">검색어: {search}</p>
            ) : null}
          </div>

          <AdminPostsTable posts={postsPage.items} />
        </section>

        {postsPage.totalPages > 0 ? (
          <nav
            aria-label="게시글 목록 페이지네이션"
            className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/4 p-4 md:flex-row md:items-center md:justify-between"
          >
            <p className="text-sm text-slate-400">
              총 {postsPage.total.toLocaleString('ko-KR')}개 ·{' '}
              {postsPage.page.toLocaleString('ko-KR')} /{' '}
              {postsPage.totalPages.toLocaleString('ko-KR')} 페이지
            </p>

            <div className="flex items-center justify-between gap-3 md:hidden">
              <PaginationLink
                disabled={postsPage.page <= 1}
                href={buildPostsHref({
                  page: previousPage,
                  limit: postsPage.limit,
                  search,
                })}
              >
                이전
              </PaginationLink>

              <span className="text-sm font-semibold text-white">
                {postsPage.page} / {postsPage.totalPages}
              </span>

              <PaginationLink
                disabled={postsPage.page >= postsPage.totalPages}
                href={buildPostsHref({
                  page: nextPage,
                  limit: postsPage.limit,
                  search,
                })}
              >
                다음
              </PaginationLink>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <PaginationLink
                disabled={postsPage.page <= 1}
                href={buildPostsHref({
                  page: previousPage,
                  limit: postsPage.limit,
                  search,
                })}
              >
                이전
              </PaginationLink>

              {paginationPages.map((paginationPage) => (
                <PaginationLink
                  key={paginationPage}
                  active={paginationPage === postsPage.page}
                  href={buildPostsHref({
                    page: paginationPage,
                    limit: postsPage.limit,
                    search,
                  })}
                >
                  {paginationPage.toLocaleString('ko-KR')}
                </PaginationLink>
              ))}

              <PaginationLink
                disabled={postsPage.page >= postsPage.totalPages}
                href={buildPostsHref({
                  page: nextPage,
                  limit: postsPage.limit,
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

function buildPostsHref({
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

  return `/posts?${searchParams.toString()}`;
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
