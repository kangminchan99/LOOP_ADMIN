import type { AdminPostListItem } from '../types/admin-post';

type AdminPostsTableProps = {
  posts: AdminPostListItem[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getSummaryStatusLabel(status: AdminPostListItem['summaryStatus']) {
  switch (status) {
    case 'PENDING':
      return '대기';
    case 'COMPLETED':
      return '완료';
    case 'FAILED':
      return '실패';
    case 'SKIPPED':
      return '스킵';
    default:
      return status;
  }
}

export function AdminPostsTable({ posts }: AdminPostsTableProps) {
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/4 p-8 text-center text-sm text-slate-400">
        게시글이 없습니다.
      </div>
    );
  }

  const newLocal =
    'border-b border-white/10 bg-white/4 text-xs uppercase tracking-wide text-slate-400';
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/4">
      <div className="overflow-x-auto">
        <table className="min-w-225 w-full text-left text-sm">
          <thead className={newLocal}>
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">제목</th>
              <th className="px-4 py-3">작성자</th>
              <th className="px-4 py-3">요약</th>
              <th className="px-4 py-3">생성일</th>
              <th className="px-4 py-3">수정일</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/10">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-white/4">
                <td className="px-4 py-4 text-slate-400">{post.id}</td>

                <td className="px-4 py-4">
                  <div className="max-w-90">
                    <p className="truncate font-medium text-slate-100">
                      {post.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                      {post.contentPreview}
                    </p>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <p className="text-slate-100">
                    {post.authorNickname ?? '알 수 없음'}
                  </p>
                  <p className="text-xs text-slate-500">ID {post.authorId}</p>
                </td>

                <td className="px-4 py-4">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                    {getSummaryStatusLabel(post.summaryStatus)}
                  </span>
                </td>

                <td className="px-4 py-4 text-slate-400">
                  {formatDate(post.createdAt)}
                </td>

                <td className="px-4 py-4 text-slate-400">
                  {formatDate(post.updatedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
