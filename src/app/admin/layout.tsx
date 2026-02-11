"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

const ADMIN_NAV = [
  {
    href: "/admin",
    label: "대시보드",
    exact: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: "/admin/orders",
    label: "주문 관리",
    exact: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    href: "/admin/calls",
    label: "직원 호출",
    exact: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
];

/**
 * 관리자 레이아웃 - 상단 네비게이션
 * 태블릿 앱 사이드바와 완전 분리
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {/* 상단 네비게이션 바 */}
      <header className="flex items-center justify-between border-b border-border-default bg-bg-secondary px-6 py-3">
        {/* 좌측: 로고 + 매장명 */}
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-primary shadow-md shadow-red-primary/20">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M8 5.14v14.72a1 1 0 0 0 1.5.86l11.74-7.36a1 1 0 0 0 0-1.72L9.5 4.28a1 1 0 0 0-1.5.86z" fill="white" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-bold text-text-primary">Red Button</span>
              <span className="ml-2 rb-badge bg-red-subtle text-red-primary">관리자</span>
            </div>
          </Link>

          {/* 구분선 */}
          <div className="h-6 w-px bg-border-default" />

          {/* 메뉴 탭 */}
          <nav className="flex items-center gap-1">
            {ADMIN_NAV.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200
                    ${isActive
                      ? "bg-red-subtle text-red-primary"
                      : "text-text-muted hover:bg-bg-card hover:text-text-secondary"
                    }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 우측: 매장 정보 + 태블릿 앱 링크 */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted">강남점</span>
          <Link
            href="/"
            className="rounded-xl border border-border-default bg-bg-card px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-card-hover"
          >
            태블릿 앱 →
          </Link>
        </div>
      </header>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
