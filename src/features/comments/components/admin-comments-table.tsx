import type { AdminCommentListItem } from '../types/admin-comment';
import { DeleteCommentButton } from './delete-comment-button';

type AdminCommentsTableProps = {
  comments: AdminCommentListItem[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function AdminCommentsTable({ comments }: AdminCommentsTableProps) {
  if (comments.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/4 p-8 text-center text-sm text-slate-400">
        댓글이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-220 text-left text-sm">
          <thead className="border-b border-white/10 bg-white/4 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">댓글</th>
              <th className="px-4 py-3">작성자</th>
              <th className="px-4 py-3">게시글</th>
              <th className="px-4 py-3">작성일</th>
              <th className="px-4 py-3">수정일</th>
              <th className="px-4 py-3">관리</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/10">
            {comments.map((comment) => (
              <tr key={comment.id} className="transition hover:bg-white/4">
                <td className="px-4 py-4 text-slate-400">{comment.id}</td>

                <td className="px-4 py-4">
                  <p className="max-w-90 line-clamp-2 text-slate-100">
                    {comment.content}
                  </p>
                </td>

                <td className="px-4 py-4">
                  <p className="text-slate-100">
                    {comment.authorNickname ?? '알 수 없음'}
                  </p>
                  <p className="text-xs text-slate-500">
                    ID {comment.authorId}
                  </p>
                </td>

                <td className="px-4 py-4">
                  <p className="max-w-70 truncate text-slate-100">
                    {comment.postTitle ?? '삭제된 게시글'}
                  </p>
                  <p className="text-xs text-slate-500">ID {comment.postId}</p>
                </td>

                <td className="px-4 py-4 text-slate-400">
                  {formatDate(comment.createdAt)}
                </td>

                <td className="px-4 py-4 text-slate-400">
                  {formatDate(comment.updatedAt)}
                </td>
                <td className="px-4 py-4">
                  <DeleteCommentButton
                    commentId={comment.id}
                    content={comment.content}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
