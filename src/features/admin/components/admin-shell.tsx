'use client';

import { SessionTimer } from '@/src/features/auth/components/session-timer';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

type AdminShellProps = {
  children: React.ReactNode;
  accessTokenExpiresAt: string | null;
};

export function AdminShell({
  children,
  accessTokenExpiresAt,
}: AdminShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: '대시보드' },
    { href: '/users', label: '유저 관리' },
    { href: '/posts', label: '게시글 관리' },
    { href: '/comments', label: '댓글 관리' },
  ];

  function getNavItemClass(href: string) {
    const isActive =
      href === '/' ? pathname === '/' : pathname.startsWith(href);

    return [
      'rounded-xl px-3 py-2 transition',
      isActive
        ? 'bg-white/6 text-white'
        : 'text-slate-300 hover:bg-white/6 hover:text-white',
    ].join(' ');
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-slate-950/95 p-6 lg:block">
        <p className="text-sm font-semibold text-violet-300">Loop Admin</p>

        <nav className="mt-8 flex flex-col gap-2 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              className={getNavItemClass(item.href)}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/80 px-6 py-4 backdrop-blur lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                className="rounded-xl border border-white/10 px-3 py-2 text-sm text-white lg:hidden"
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                메뉴
              </button>

              <p className="text-sm text-slate-400">관리자 콘솔</p>
            </div>

            <div className="flex items-center gap-3">
              <SessionTimer
                key={accessTokenExpiresAt ?? 'no-session'}
                initialAccessTokenExpiresAt={accessTokenExpiresAt}
              />

              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                ADMIN
              </span>
            </div>
          </div>
        </header>

        {children}
      </div>

      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/60"
            type="button"
            aria-label="모바일 메뉴 닫기"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <aside className="relative h-full w-72 border-r border-white/10 bg-slate-950 p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-violet-300">
                Loop Admin
              </p>

              <button
                className="rounded-xl border border-white/10 px-3 py-2 text-sm text-white"
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                닫기
              </button>
            </div>

            <nav className="mt-8 flex flex-col gap-2 text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  className={getNavItemClass(item.href)}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
