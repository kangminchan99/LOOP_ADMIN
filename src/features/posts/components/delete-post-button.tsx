'use client';

import { deleteAdminPost } from '@/src/features/posts/api/delete-admin-posts';
import { useRouter, useSearchParams } from 'next/navigation';
import { useId, useRef, useState } from 'react';

type Props = { postId: number; title: string };

export function DeletePostButton({ postId, title }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dialog = useRef<HTMLDialogElement>(null);
  const inFlight = useRef(false);
  const titleId = useId();
  const inputId = useId();
  const [confirmation, setConfirmation] = useState('');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function openDialog() {
    setConfirmation('');
    setMessage(null);
    dialog.current?.showModal();
  }

  async function remove() {
    // 입력한 게시글 ID가 맞을 때만 한 번 요청.
    if (inFlight.current || confirmation.trim() !== String(postId)) return;
    inFlight.current = true;
    setPending(true);
    setMessage(null);
    try {
      await deleteAdminPost(postId);
      dialog.current?.close();
      // 검색과 페이지 크기를 유지하며 목록 갱신.
      const params = new URLSearchParams(searchParams.toString());
      params.set('deleted', '1');
      router.replace(`/posts?${params.toString()}`, { scroll: false });
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : '삭제 결과를 확인하지 못했습니다. 목록을 새로고침해주세요.',
      );
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        aria-label={`${title} (ID ${postId}) 삭제`}
        className="min-h-11 whitespace-nowrap rounded-lg border border-red-400/30 px-3 py-2 text-sm text-red-300 transition hover:bg-red-400/10 focus-visible:outline-2 focus-visible:outline-red-300"
      >
        삭제
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        onCancel={(event) => {
          if (inFlight.current) event.preventDefault();
        }}
        className="fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 p-6 text-slate-100 shadow-xl backdrop:bg-black/60"
      >
        <h2 id={titleId} className="text-lg font-semibold">
          게시글을 삭제하시겠습니까?
        </h2>
        <p className="mt-3 break-words text-sm text-slate-200">
          {title} · ID {postId}
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          삭제 후 복구할 수 없습니다. 해당 게시글에 작성된 댓글도 함께 삭제됩니다.
        </p>
        <label htmlFor={inputId} className="mt-5 block text-sm text-slate-300">
          확인을 위해 게시글 ID {postId}을 입력해주세요.
        </label>
        <input
          id={inputId}
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          inputMode="numeric"
          autoComplete="off"
          disabled={pending}
          className="mt-2 min-h-11 w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 outline-none focus:border-violet-400"
        />
        {message ? (
          <p role="alert" className="mt-3 text-sm text-red-300">
            {message}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={pending}
            onClick={() => dialog.current?.close()}
            className="min-h-11 rounded-xl border border-white/20 px-4 py-2 text-sm disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            disabled={pending || confirmation.trim() !== String(postId)}
            onClick={remove}
            className="min-h-11 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? '삭제 중...' : '영구 삭제'}
          </button>
        </div>
      </dialog>
    </>
  );
}
