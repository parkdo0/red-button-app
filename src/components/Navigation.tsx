"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";

/**
 * 사이드바 네비게이션 - 실제 레드버튼 앱 기준
 * 8개 메뉴 + RBTN 로고 + 쿠폰 하단 고정
 */

interface NavItem {
  href: string;
  label: string;
  matchPaths: string[];
  icon: React.ReactNode;
  activeIcon?: React.ReactNode; // 활성 상태 별도 아이콘 (선택)
  showCartBadge?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "추천 게임",
    matchPaths: ["/", "/games"],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    href: "/search",
    label: "게임 검색",
    matchPaths: ["/search"],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    href: "/order",
    label: "메뉴 주문",
    matchPaths: ["/order"],
    showCartBadge: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {/* 감자튀김 모양 아이콘 */}
        <path d="M8 2v4M12 2v4M16 2v4" />
        <path d="M4 6h16l-2 14H6L4 6z" />
      </svg>
    ),
  },
  {
    href: "/chat",
    label: "카운터 쪽지",
    matchPaths: ["/chat"],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: "/info",
    label: "이용 정보",
    matchPaths: ["/info"],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="18" x2="12" y2="12" />
        <line x1="12" y1="9" x2="12.01" y2="9" />
      </svg>
    ),
  },
  {
    href: "/events",
    label: "이벤트",
    matchPaths: ["/events"],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 2v4M16 2v4" />
        <path d="M5 11h14M5 15h14M5 19h14" />
        <rect x="3" y="4" width="18" height="18" rx="2" />
      </svg>
    ),
  },
  {
    href: "/kit",
    label: "게임 키트",
    matchPaths: ["/kit"],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
];

export default function Navigation() {
  const pathname = usePathname();
  const { totalCount } = useCart();

  // 관리자 페이지에서는 사이드바 숨김
  if (pathname.startsWith("/admin")) return null;

  return (
    <nav className="flex w-[80px] flex-col items-center justify-between bg-[#111015] py-4 border-r border-[#222]">
      {/* 상단: RBTN 로고 */}
      <div className="flex flex-col items-center">
        <Link href="/" className="group">
          <div className="flex h-[38px] w-[54px] items-center justify-center rounded-lg bg-red-primary transition-transform group-hover:scale-105">
            <span className="text-[15px] font-extrabold tracking-wider text-white">RBTN</span>
          </div>
        </Link>
      </div>

      {/* 중앙: 메뉴 */}
      <div className="flex flex-1 flex-col items-center gap-0.5 mt-4 overflow-y-auto scrollbar-hide">
        {NAV_ITEMS.map((item) => {
          const isActive = item.matchPaths.some((p) =>
            p === "/" ? pathname === "/" : pathname.startsWith(p)
          );

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                relative flex w-[68px] flex-col items-center gap-1 rounded-lg px-1 py-2.5
                transition-all duration-200 touch-feedback
                ${isActive
                  ? "text-red-primary"
                  : "text-[#888] hover:text-[#bbb]"
                }
              `}
            >
              {item.icon}
              <span className="text-[10px] font-medium leading-tight whitespace-nowrap">
                {item.label}
              </span>

              {/* 장바구니 뱃지 */}
              {item.showCartBadge && totalCount > 0 && (
                <span className="absolute right-1 top-1 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-red-primary px-1 text-[8px] font-bold text-white">
                  {totalCount > 9 ? "9+" : totalCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* 하단: 쿠폰 사용 */}
      <div className="flex flex-col items-center mt-2">
        <Link
          href="/coupon"
          className="flex flex-col items-center gap-1 text-[#888] hover:text-red-primary transition-colors touch-feedback"
        >
          <div className="flex h-8 w-10 items-center justify-center rounded-md bg-red-primary/15">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="text-red-primary">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M2 10h20" />
              <path d="M7 15h.01M11 15h2" />
            </svg>
          </div>
          <span className="text-[9px] font-medium text-red-primary">쿠폰 사용</span>
        </Link>
      </div>
    </nav>
  );
}
