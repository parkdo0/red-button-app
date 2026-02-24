"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { usePathname } from "next/navigation";

export interface SessionInfo {
  role: "HQ_ADMIN" | "STORE_ADMIN" | "TABLE";
  userId?: number;
  storeId?: number;
  storeName?: string;
  tableNo?: string;
  tableId?: number;
}

export const SessionContext = createContext<SessionInfo | null>(null);

export function useSession() {
  return useContext(SessionContext);
}

/** 폴링 간격 */
const ADMIN_POLL_INTERVAL = 5 * 60 * 1000; // 관리자: 5분
const TABLE_POLL_INTERVAL = 30 * 1000;      // 테이블: 30초

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [expired, setExpired] = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);
  const pathname = usePathname();

  const isLoginPage = pathname === "/login";

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.authenticated) {
        setSession(data);
        setExpired(false);
        setCheckedOut(false);
        return;
      }

      // 401 응답 처리
      if (!isLoginPage && session !== null) {
        if (data.reason === "checked_out") {
          setCheckedOut(true);
        } else {
          setExpired(true);
        }
      }
    } catch {
      // 네트워크 오류 무시
    }
  }, [isLoginPage, session]);

  // 초기 로딩
  useEffect(() => {
    if (isLoginPage) return;
    checkSession();
  }, [isLoginPage]); // eslint-disable-line react-hooks/exhaustive-deps

  // 폴링 — 역할에 따라 간격 다르게
  useEffect(() => {
    if (isLoginPage || expired || checkedOut) return;
    const interval = session?.role === "TABLE" ? TABLE_POLL_INTERVAL : ADMIN_POLL_INTERVAL;
    const timer = setInterval(checkSession, interval);
    return () => clearInterval(timer);
  }, [isLoginPage, expired, checkedOut, checkSession, session?.role]);

  return (
    <SessionContext.Provider value={session}>
      {children}
      {expired && !checkedOut && <SessionExpiredOverlay />}
      {checkedOut && <CheckedOutOverlay />}
    </SessionContext.Provider>
  );
}

// ──────────────────────────────────────
// 세션 만료 오버레이 (기존)
// ──────────────────────────────────────
function SessionExpiredOverlay() {
  const handleLogin = () => {
    window.location.href = "/login";
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
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

// ──────────────────────────────────────
// 퇴장 처리 오버레이 (토스트 스타일 → 자동 리다이렉트)
// ──────────────────────────────────────
function CheckedOutOverlay() {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = "/login";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-backdrop">
      <div className="mx-4 w-full max-w-sm rounded-3xl bg-bg-secondary border border-border-default p-8 text-center shadow-2xl animate-modal">
        {/* 아이콘 */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-primary/10">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E5244D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>

        <h2 className="mb-2 text-xl font-bold text-text-primary">
          퇴장 처리되었습니다
        </h2>
        <p className="mb-4 text-sm text-text-secondary">
          이용해 주셔서 감사합니다.<br />
          {countdown}초 후 초기 화면으로 이동합니다.
        </p>

        {/* 프로그레스 바 */}
        <div className="mx-auto w-48 h-1 rounded-full bg-bg-card overflow-hidden">
          <div
            className="h-full bg-red-primary rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${((3 - countdown) / 3) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
