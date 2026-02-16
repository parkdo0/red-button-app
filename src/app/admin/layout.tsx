"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * 관리자 공통 레이아웃
 * 좌측 사이드바 (본사/매장 구분) + 우측 콘텐츠
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHQ = pathname.startsWith("/admin/hq");
  const isStore = pathname.startsWith("/admin/store");

  return (
    <div className="flex h-dvh w-dvw overflow-hidden bg-gray-50">
      {/* 사이드바 */}
      <aside className="flex w-[220px] flex-shrink-0 flex-col border-r border-gray-200 bg-white">
        {/* 로고 */}
        <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600">
            <span className="text-[10px] font-extrabold text-white">RB</span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Red Button</p>
            <p className="text-[10px] text-gray-400">Admin Console</p>
          </div>
        </div>

        {/* 모드 전환 */}
        <div className="flex border-b border-gray-200">
          <Link
            href="/admin/hq"
            className={`flex-1 py-2.5 text-center text-[12px] font-bold transition-colors ${
              isHQ ? "text-red-600 border-b-2 border-red-600" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            본사
          </Link>
          <Link
            href="/admin/store"
            className={`flex-1 py-2.5 text-center text-[12px] font-bold transition-colors ${
              isStore ? "text-red-600 border-b-2 border-red-600" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            매장
          </Link>
        </div>

        {/* 메뉴 */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {isHQ || (!isHQ && !isStore) ? (
            <HQNav pathname={pathname} />
          ) : (
            <StoreNav pathname={pathname} />
          )}
        </nav>

        {/* 하단: 태블릿 앱 링크 */}
        <div className="border-t border-gray-200 px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-[12px] text-gray-400 hover:text-red-600 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="4" y="2" width="16" height="20" rx="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
            태블릿 앱으로 이동
          </Link>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}

// ──────────────────────────────────────
// 본사 네비게이션
// ──────────────────────────────────────
function HQNav({ pathname }: { pathname: string }) {
  const items = [
    { href: "/admin/hq", label: "대시보드", icon: "📊", exact: true },
    { href: "/admin/hq/games", label: "게임 관리", icon: "🎲" },
    { href: "/admin/hq/menus", label: "메뉴 관리", icon: "🍽" },
    { href: "/admin/hq/recommend", label: "추천 편성", icon: "⭐" },
    { href: "/admin/hq/events", label: "이벤트 관리", icon: "🎪" },
    { href: "/admin/hq/stores", label: "매장 현황", icon: "🏪" },
    { href: "/admin/hq/tags", label: "태그 관리", icon: "🏷" },
  ];

  return <NavList items={items} pathname={pathname} />;
}

// ──────────────────────────────────────
// 매장 네비게이션
// ──────────────────────────────────────
function StoreNav({ pathname }: { pathname: string }) {
  const items = [
    { href: "/admin/store", label: "대시보드", icon: "📊", exact: true },
    { href: "/admin/store/orders", label: "주문 관리", icon: "📋" },
    { href: "/admin/store/games", label: "게임 노출", icon: "🎲" },
    { href: "/admin/store/menus", label: "메뉴 관리", icon: "🍽" },
    { href: "/admin/store/tables", label: "테이블 현황", icon: "🪑" },
    { href: "/admin/store/chat", label: "카운터 쪽지", icon: "💬" },
    { href: "/admin/store/settings", label: "매장 설정", icon: "⚙️" },
  ];

  return (
    <>
      {/* 매장 선택 */}
      <div className="mb-3 rounded-lg bg-gray-50 px-3 py-2">
        <p className="text-[10px] text-gray-400">현재 매장</p>
        <p className="text-sm font-bold text-gray-900">수원점</p>
      </div>
      <NavList items={items} pathname={pathname} />
    </>
  );
}

// ──────────────────────────────────────
// 공통 네비 리스트
// ──────────────────────────────────────
interface NavItemDef {
  href: string;
  label: string;
  icon: string;
  exact?: boolean;
}

function NavList({ items, pathname }: { items: NavItemDef[]; pathname: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      {items.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
              isActive
                ? "bg-red-50 text-red-600"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <span className="text-sm">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
