"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  /** 해당 메뉴의 활성 판단 경로 패턴 */
  matchPaths: string[];
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "게임 찾기",
    matchPaths: ["/", "/games"],
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="3" />
        <circle cx="8" cy="8" r="1.5" fill="currentColor" />
        <circle cx="16" cy="8" r="1.5" fill="currentColor" />
        <circle cx="8" cy="16" r="1.5" fill="currentColor" />
        <circle cx="16" cy="16" r="1.5" fill="currentColor" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: "/order",
    label: "주문하기",
    matchPaths: ["/order"],
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 14h18" />
        <path d="M4 14c0-4.418 3.582-8 8-8s8 3.582 8 8" />
        <path d="M5 14v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />
        <line x1="8" y1="11" x2="8" y2="11.01" />
        <line x1="12" y1="9" x2="12" y2="9.01" />
        <line x1="16" y1="11" x2="16" y2="11.01" />
      </svg>
    ),
  },
  {
    href: "/orders",
    label: "주문 내역",
    matchPaths: ["/orders"],
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex w-[72px] flex-col items-center justify-between border-r border-border-default bg-bg-secondary py-5">
      {/* 상단: 로고 */}
      <div className="flex flex-col items-center gap-1">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-primary">
          <span className="text-base font-bold text-white">R</span>
        </div>
        <span className="text-[9px] text-text-muted">RedButton</span>
      </div>

      {/* 중앙: 메뉴 */}
      <div className="flex flex-col items-center gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive = item.matchPaths.some((p) =>
            p === "/" ? pathname === "/" : pathname.startsWith(p)
          );

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center gap-0.5 rounded-xl px-2 py-2
                transition-colors duration-200 touch-feedback
                ${
                  isActive
                    ? "bg-red-primary/15 text-red-primary"
                    : "text-text-muted hover:bg-bg-card hover:text-text-secondary"
                }
              `}
            >
              {item.icon}
              <span className="text-[9px] font-medium leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* 하단: 테이블 번호 */}
      <div className="flex flex-col items-center gap-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-default bg-bg-card">
          <span className="text-xs font-bold text-text-primary">A1</span>
        </div>
        <span className="text-[9px] text-text-muted">테이블</span>
      </div>
    </nav>
  );
}
