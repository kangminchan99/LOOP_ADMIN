import { adminHomeStats } from '@/src/features/dashboard/data/admin-home-stats';

/**
 * Next.js App Router의 page.tsx는 기본적으로 Server Component입니다.
 *
 * Server Component란?
 * - 브라우저가 아니라 서버에서 먼저 렌더링되는 컴포넌트입니다.
 * - useState/useEffect 같은 클라이언트 상태가 필요 없는 화면에 적합합니다.
 * - 관리자 홈처럼 "처음 진입 시 통계와 링크를 보여주는 화면"은 Server Component로 두는 게 성능상 좋습니다.
 *
 * 지금 단계에서는 실제 API를 붙이기 전이므로 mock 데이터를 사용합니다.
 * 다음 단계에서 NestJS의 /admin/dashboard API가 생기면 이 데이터를 fetch로 교체합니다.
 */
export default function AdminHomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 lg:px-8">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-violet-300">Loop Admin</p>

          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                관리자 대시보드
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                서비스 운영 상태를 빠르게 확인하고, 유저/게시글/댓글을 관리하는
                공간입니다.
              </p>
            </div>

            <div className="rounded-full border border-violet-400/30 bg-violet-400/10 px-4 py-2 text-sm text-violet-200">
              MVP 1단계 · 정적 대시보드
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {adminHomeStats.map((stat) => (
            <article
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-white/4 p-5 shadow-2xl shadow-black/20"
            >
              <p className="text-sm text-slate-400">{stat.label}</p>

              <div className="mt-3 flex items-end justify-between gap-4">
                <strong className="text-3xl font-bold text-white">
                  {stat.value}
                </strong>

                <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                  {stat.change}
                </span>
              </div>

              <p className="mt-3 text-xs text-slate-500">{stat.description}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <article className="rounded-2xl border border-white/10 bg-white/4 p-6">
            <h2 className="text-lg font-semibold">다음 구현 순서</h2>

            <ol className="mt-4 space-y-3 text-sm text-slate-300">
              <li>1. NestJS 서버에 관리자 대시보드 API 추가</li>
              <li>2. 관리자 로그인 화면과 토큰 저장 구조 구현</li>
              <li>3. 유저/게시글/댓글 관리 테이블 구현</li>
              <li>4. 신고/차단/전체 푸시 발송 기능 연결</li>
            </ol>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/4 p-6">
            <h2 className="text-lg font-semibold">성능 방향</h2>

            <p className="mt-4 text-sm leading-6 text-slate-300">
              첫 화면은 Server Component로 유지해서 클라이언트 JavaScript를
              최소화합니다. 검색, 필터, 테이블 정렬처럼 상호작용이 필요한 부분만
              나중에 Client Component로 분리합니다.
            </p>
          </article>
        </section>
      </section>
    </main>
  );
}
