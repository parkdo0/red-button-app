"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import GameTimer from "@/components/GameTimer";
import StaffCallButton from "@/components/StaffCallButton";

interface NavItem {
  href: string;
  label: string;
  matchPaths: string[];
  icon: React.ReactNode;
  showCartBadge?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "게임 찾기",
    matchPaths: ["/", "/games"],
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    href: "/order",
    label: "주문하기",
    matchPaths: ["/order"],
    showCartBadge: true,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    href: "/orders",
    label: "주문 내역",
    matchPaths: ["/orders"],
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
];

export default function Navigation() {
  const pathname = usePathname();
  const { totalCount } = useCart();

  return (
    <nav className="flex w-[80px] flex-col items-center justify-between border-r border-border-default bg-bg-secondary py-6">
      {/* 상단: 레드버튼 로고 */}
      <div className="flex flex-col items-center gap-2">
        <Link href="/" className="group flex flex-col items-center gap-1.5">
          {/* 레드버튼 로고 마크 */}
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-primary shadow-lg shadow-red-primary/20 transition-transform group-hover:scale-105">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              {/* 심볼: 플레이 버튼 (보드게임 시작) */}
              <path d="M8 5.14v14.72a1 1 0 0 0 1.5.86l11.74-7.36a1 1 0 0 0 0-1.72L9.5 4.28a1 1 0 0 0-1.5.86z" fill="white" />
            </svg>
          </div>
          <span className="text-[8px] font-bold tracking-wider text-text-muted uppercase">
            Red Button
          </span>
        </Link>
      </div>

      {/* 중앙: 메뉴 */}
      <div className="flex flex-col items-center gap-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = item.matchPaths.some((p) =>
            p === "/" ? pathname === "/" : pathname.startsWith(p)
          );

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                relative flex w-[62px] flex-col items-center gap-1 rounded-2xl px-2 py-3
                transition-all duration-200 touch-feedback
                ${
                  isActive
                    ? "bg-red-subtle text-red-primary"
                    : "text-text-muted hover:bg-bg-card hover:text-text-secondary"
                }
              `}
            >
              {/* 왼쪽 인디케이터 */}
              {isActive && (
                <div className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-red-primary" />
              )}

              {item.icon}
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>

              {/* 장바구니 뱃지 */}
              {item.showCartBadge && totalCount > 0 && (
                <span className="absolute -right-0.5 top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-primary px-1 text-[9px] font-bold text-white shadow-lg shadow-red-primary/30">
                  {totalCount > 9 ? "9+" : totalCount}
                </span>
              )}
            </Link>
          );
        })}

        {/* 구분선 */}
        <div className="my-2 h-px w-10 bg-border-default" />

        {/* 게임 타이머 */}
        <GameTimer compact />

        {/* 직원 호출 */}
        <StaffCallButton />
      </div>

      {/* 하단: 테이블 번호 */}
      <div className="flex flex-col items-center gap-1.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-default bg-bg-card">
          <span className="text-sm font-bold text-text-primary">A1</span>
        </div>
        <span className="text-[9px] text-text-muted">테이블</span>
      </div>
    </nav>
  );
}
