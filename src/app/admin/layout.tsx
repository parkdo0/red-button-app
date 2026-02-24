"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, SessionContext } from "@/components/SessionProvider";
import { useState, useEffect, useCallback } from "react";

/**
 * 관리자 공통 레이아웃
 * 좌측 사이드바 (본사/매장 구분) + 우측 콘텐츠
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const session = useSession();
  const isHQ = pathname.startsWith("/admin/hq");
  const isStore = pathname.startsWith("/admin/store");

  // HQ_ADMIN이 매장 탭을 볼 때 사용할 매장 선택 상태
  const [selectedStore, setSelectedStore] = useState<{ id: number; name: string } | null>(null);

  // HQ_ADMIN이 매장 탭에 있을 때, 선택한 매장으로 세션 오버라이드
  const isHQInStoreMode = isStore && session?.role === "HQ_ADMIN";
  const effectiveSession = isHQInStoreMode && selectedStore
    ? { ...session, storeId: selectedStore.id, storeName: selectedStore.name }
    : session;

  // 콘텐츠 렌더링: HQ_ADMIN이 매장 탭인데 매장 미선택 → 안내 표시
  const renderContent = () => {
    if (isHQInStoreMode && !selectedStore) {
      return (
        <div className="flex h-full items-center justify-center text-gray-400">
          <div className="text-center">
            <p className="text-4xl mb-4">🏪</p>
            <p className="text-lg font-bold text-gray-600 mb-2">매장을 선택해주세요</p>
            <p className="text-sm">좌측 사이드바에서 관리할 매장을 선택하세요</p>
          </div>
        </div>
      );
    }
    return children;
  };

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
            <StoreNav
              pathname={pathname}
              isHQAdmin={session?.role === "HQ_ADMIN"}
              selectedStore={selectedStore}
              onSelectStore={setSelectedStore}
            />
          )}
        </nav>

        {/* 하단: 사용자 정보 + 로그아웃 + 태블릿 링크 */}
        <div className="border-t border-gray-200 px-4 py-3 flex flex-col gap-2">
          {/* 현재 계정 정보 */}
          {session && (
            <div className="rounded-lg bg-gray-50 px-3 py-2">
              <p className="text-[10px] text-gray-400">
                {session.role === "HQ_ADMIN" ? "본사 관리자" : "매장 관리자"}
              </p>
              <p className="text-[12px] font-bold text-gray-700 truncate">
                {session.role === "STORE_ADMIN" ? session.storeName : "본사"}
              </p>
            </div>
          )}

          {/* 로그아웃 */}
          <LogoutButton />

          {/* 태블릿 앱 링크 */}
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

      {/* 메인 콘텐츠 — HQ_ADMIN일 때 선택한 매장으로 세션 오버라이드 */}
      <main className="flex-1 overflow-hidden">
        {isHQInStoreMode ? (
          <SessionContext.Provider value={effectiveSession}>
            {renderContent()}
          </SessionContext.Provider>
        ) : (
          children
        )}
      </main>
    </div>
  );
}

// ──────────────────────────────────────
// 본사 네비게이션
// ──────────────────────────────────────
function HQNav({ pathname }: { pathname: string }) {
  const items: NavItemDef[] = [
    { href: "/admin/hq", label: "대시보드", icon: "", exact: true },
    { href: "/admin/hq/games", label: "게임 관리", icon: "" },
    { href: "/admin/hq/menus", label: "메뉴 관리", icon: "" },
    { href: "/admin/hq/recommend", label: "추천 편성", icon: "⭐" },
    { href: "/admin/hq/events", label: "이벤트 관리", icon: "" },
    { href: "/admin/hq/stores", label: "매장 현황", icon: "" },
    { href: "/admin/hq/tags", label: "태그 관리", icon: "" },
    { href: "/admin/hq/coupons", label: "쿠폰 관리", icon: "🎟️" },
    { href: "/admin/hq/feedback", label: "고객 의견", icon: "📬" },
  ];

  return <NavList items={items} pathname={pathname} />;
}

// ──────────────────────────────────────
// 매장 네비게이션
// ──────────────────────────────────────
function StoreNav({ pathname, isHQAdmin, selectedStore, onSelectStore }: {
  pathname: string;
  isHQAdmin?: boolean;
  selectedStore: { id: number; name: string } | null;
  onSelectStore: (store: { id: number; name: string } | null) => void;
}) {
  const session = useSession();
  const storeId = isHQAdmin ? selectedStore?.id : session?.storeId;
  const storeName = isHQAdmin ? selectedStore?.name : session?.storeName;

  const [chatUnread, setChatUnread] = useState(0);
  const [stores, setStores] = useState<{ id: number; name: string }[]>([]);
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);

  // HQ_ADMIN: 매장 목록 로드
  useEffect(() => {
    if (!isHQAdmin) return;
    fetch("/api/stores")
      .then((r) => r.json())
      .then((data: { id: number; name: string }[]) => {
        setStores(data);
        // 첫 매장 자동 선택
        if (!selectedStore && data.length > 0) {
          onSelectStore({ id: data[0].id, name: data[0].name });
        }
      })
      .catch(() => {});
  }, [isHQAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  // 채팅 미읽 수 폴링 (5초)
  const fetchChatUnread = useCallback(async () => {
    if (!storeId) return;
    try {
      const res = await fetch(`/api/chat?storeId=${storeId}`);
      if (!res.ok) return;
      const threads: { unread: number }[] = await res.json();
      const total = threads.reduce((sum, t) => sum + (Number(t.unread) || 0), 0);
      setChatUnread(total);
    } catch {}
  }, [storeId]);

  useEffect(() => {
    fetchChatUnread();
    const interval = setInterval(fetchChatUnread, 5000);
    return () => clearInterval(interval);
  }, [fetchChatUnread]);

  const items: NavItemDef[] = [
    { href: "/admin/store", label: "대시보드", icon: "", exact: true },
    { href: "/admin/store/orders", label: "주문 관리", icon: "" },
    { href: "/admin/store/games", label: "게임 노출", icon: "" },
    { href: "/admin/store/menus", label: "메뉴 관리", icon: "" },
    { href: "/admin/store/tables", label: "테이블 현황", icon: "" },
    { href: "/admin/store/chat", label: "카운터 쪽지", icon: "", badge: chatUnread },
    { href: "/admin/store/settings", label: "매장 설정", icon: "" },
  ];

  return (
    <>
      {/* 매장 선택 */}
      <div className="mb-3 relative">
        {isHQAdmin ? (
          /* HQ_ADMIN: 매장 드롭다운 */
          <div>
            <button
              onClick={() => setStoreDropdownOpen(!storeDropdownOpen)}
              className="w-full rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-left hover:bg-red-100 transition-colors"
            >
              <p className="text-[10px] text-red-400 font-medium">본사 모드 · 매장 선택</p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-gray-900">{storeName ?? "선택..."}</p>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </button>
            {storeDropdownOpen && (
              <div className="absolute left-0 right-0 z-50 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg max-h-48 overflow-y-auto">
                {stores.map((store) => (
                  <button
                    key={store.id}
                    onClick={() => {
                      onSelectStore({ id: store.id, name: store.name });
                      setStoreDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                      selectedStore?.id === store.id ? "bg-red-50 text-red-600 font-bold" : "text-gray-700"
                    }`}
                  >
                    {store.name}
                  </button>
                ))}
                {stores.length === 0 && (
                  <p className="px-3 py-2 text-xs text-gray-400">등록된 매장이 없습니다</p>
                )}
              </div>
            )}
          </div>
        ) : (
          /* STORE_ADMIN: 고정 매장 표시 */
          <div className="rounded-lg bg-gray-50 px-3 py-2">
            <p className="text-[10px] text-gray-400">현재 매장</p>
            <p className="text-sm font-bold text-gray-900">{session?.storeName ?? ""}</p>
          </div>
        )}
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
  badge?: number;
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
            <span className="flex-1">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white">
                {item.badge > 99 ? "99+" : item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────
// 로그아웃 버튼
// ──────────────────────────────────────
function LogoutButton() {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        window.location.href = "/login";
      }
    } catch {
      setLoading(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex gap-1.5">
        <button
          onClick={handleLogout}
          disabled={loading}
          className="flex-1 rounded-lg bg-red-600 py-1.5 text-[11px] font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {loading ? "로그아웃 중..." : "확인"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="flex-1 rounded-lg border border-gray-200 py-1.5 text-[11px] font-medium text-gray-500 hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-2 text-[12px] text-gray-400 hover:text-red-600 transition-colors"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      로그아웃
    </button>
  );
}
