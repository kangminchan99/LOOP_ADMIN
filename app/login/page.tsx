import { AdminLoginForm } from '@/src/features/auth/components/admin-login-form';

export default function AdminLoginPage() {
  return (
    // className 순서 [레이아웃 → 위치 → 크기 → 간격 → 테두리 → 배경 → 글자 → 효과 → 상태 → 반응형]
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/4 p-8 shadow-2xl shadow-black/30">
        <p className="text-sm font-semibold text-violet-300">Loop Admin</p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          관리자 로그인
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          관리자 권한이 있는 계정으로 로그인해주세요.
        </p>

        <AdminLoginForm />
      </section>
    </main>
  );
}
