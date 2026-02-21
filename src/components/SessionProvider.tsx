"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { usePathname } from "next/navigation";

interface SessionInfo {
  role: "HQ_ADMIN" | "STORE_ADMIN" | "TABLE";
  userId?: number;
  storeId?: number;
  storeName?: string;
  tableNo?: string;
  tableId?: number;
}

const SessionContext = createContext<SessionInfo | null>(null);

export function useSession() {
  return useContext(SessionContext);
}

/** 폴링 간격 (5분) */
const POLL_INTERVAL = 5 * 60 * 1000;

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [expired, setExpired] = useState(false);
  const pathname = usePathname();

  // 로그인 페이지에서는 폴링/만료 체크 불필요
  const isLoginPage = pathname === "/login";

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setSession(data);
          setExpired(false);
          return;
        }
      }
      // 401 또는 authenticated=false → 세션 만료
      if (!isLoginPage && session !== null) {
        setExpired(true);
      }
    } catch {
      // 네트워크 오류는 무시 (오프라인 등)
    }
  }, [isLoginPage, session]);

  // 초기 로딩
  useEffect(() => {
    if (isLoginPage) return;
    checkSession();
  }, [isLoginPage]); // eslint-disable-line react-hooks/exhaustive-deps

  // 폴링
  useEffect(() => {
    if (isLoginPage || expired) return;
    const interval = setInterval(checkSession, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [isLoginPage, expired, checkSession]);

  return (
    <SessionContext.Provider value={session}>
      {children}
      {expired && <SessionExpiredOverlay />}
    </SessionContext.Provider>
  );
}

// ──────────────────────────────────────
// 세션 만료 오버레이
// ──────────────────────────────────────
function SessionExpiredOverlay() {
  const handleLogin = () => {
    window.location.href = "/login";
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
        {/* 아이콘 */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>

        <h2 className="mb-2 text-xl font-bold text-gray-900">
          세션이 만료되었습니다
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          이용 시간이 종료되었습니다.<br />
          다시 로그인해 주세요.
        </p>

        <button
          onClick={handleLogin}
          className="w-full rounded-xl bg-red-600 py-3.5 text-base font-bold text-white transition-colors hover:bg-red-700 active:bg-red-800"
        >
          로그인 화면으로
        </button>
      </div>
    </div>
  );
}
