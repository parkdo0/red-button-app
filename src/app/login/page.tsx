"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type LoginTab = "admin" | "table";

interface StoreOption {
  id: number;
  name: string;
  storeCode: string;
}

/**
 * 통합 로그인 페이지
 * 탭 1: 매장관리 (관리자 아이디/비밀번호)
 * 탭 2: 테이블 (매장 선택 + PIN + 테이블 선택)
 */
export default function LoginPage() {
  const [tab, setTab] = useState<LoginTab>("admin");

  return (
    <div className="w-full max-w-[420px] mx-4">
      {/* 로고 */}
      <div className="mb-8 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600 shadow-lg shadow-red-600/30">
          <span className="text-lg font-extrabold text-white tracking-tight">RB</span>
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-white">Red Button</h1>
        <p className="mt-1 text-sm text-gray-400">보드게임 카페 관리 시스템</p>
      </div>

      {/* 카드 */}
      <div className="rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* 탭 */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setTab("admin")}
            className={`flex-1 py-3.5 text-center text-sm font-bold transition-colors relative ${
              tab === "admin" ? "text-red-600" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            매장관리
            {tab === "admin" && <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-red-600 rounded-full" />}
          </button>
          <button
            onClick={() => setTab("table")}
            className={`flex-1 py-3.5 text-center text-sm font-bold transition-colors relative ${
              tab === "table" ? "text-red-600" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            테이블
            {tab === "table" && <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-red-600 rounded-full" />}
          </button>
        </div>

        {/* 폼 */}
        <div className="p-6">
          {tab === "admin" ? <AdminLoginForm /> : <TableLoginForm />}
        </div>
      </div>

      {/* 하단 안내 */}
      <p className="mt-6 text-center text-xs text-gray-500">
        © 2025 Red Button. All rights reserved.
      </p>
    </div>
  );
}

// ──────────────────────────────────────
// 관리자 로그인 폼
// ──────────────────────────────────────

function AdminLoginForm() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim() || !password.trim()) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "admin", loginId: loginId.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "로그인에 실패했습니다.");
        return;
      }

      router.push(data.redirect);
    } catch {
      setError("서버 연결에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-gray-600">아이디</label>
        <input
          type="text"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          placeholder="관리자 아이디"
          autoComplete="username"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-red-300 focus:bg-white focus:outline-none transition-colors"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-gray-600">비밀번호</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          autoComplete="current-password"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-red-300 focus:bg-white focus:outline-none transition-colors"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-1 w-full rounded-xl bg-red-600 py-3 text-sm font-bold text-white transition-all hover:bg-red-700 active:scale-[0.98] disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {loading ? "로그인 중..." : "로그인"}
      </button>

      {/* 테스트 계정 안내 */}
      <div className="mt-2 rounded-lg bg-gray-50 p-3">
        <p className="text-[10px] font-bold text-gray-400 mb-1.5">테스트 계정</p>
        <div className="flex flex-col gap-1 text-[11px] text-gray-500">
          <span>본사: <code className="bg-gray-200 px-1 rounded">hq</code> / <code className="bg-gray-200 px-1 rounded">admin1234</code></span>
          <span>수원점: <code className="bg-gray-200 px-1 rounded">suwon</code> / <code className="bg-gray-200 px-1 rounded">store1234</code></span>
        </div>
      </div>
    </form>
  );
}

// ──────────────────────────────────────
// 테이블 로그인 폼
// ──────────────────────────────────────

function TableLoginForm() {
  const router = useRouter();
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [storeId, setStoreId] = useState<number | "">("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 매장 목록 로드
  useEffect(() => {
    fetch("/api/auth/stores")
      .then((r) => r.json())
      .then((data) => setStores(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // 선택된 매장의 storeCode
  const selectedStore = stores.find((s) => s.id === storeId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId || !selectedStore) {
      setError("매장을 선택해주세요.");
      return;
    }
    if (code.length < 4) {
      setError("설정 코드 4자리를 입력해주세요.");
      return;
    }

    // 매장접두사 + 입력 코드 = 전체 setupCode
    const fullCode = selectedStore.storeCode + code.toUpperCase();

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "table", storeId: Number(storeId), setupCode: fullCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "인증에 실패했습니다.");
        return;
      }

      router.push(data.redirect);
    } catch {
      setError("서버 연결에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* 매장 선택 */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-gray-600">매장</label>
        <select
          value={storeId}
          onChange={(e) => {
            setStoreId(e.target.value ? Number(e.target.value) : "");
            setCode("");
            setError("");
          }}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-red-300 focus:bg-white focus:outline-none transition-colors"
        >
          <option value="">매장을 선택하세요</option>
          {stores.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* 설정 코드 입력 */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-gray-600">
          설정 코드
          {selectedStore && (
            <span className="ml-2 text-gray-400 font-normal">
              {selectedStore.storeCode} +
            </span>
          )}
        </label>
        <input
          type="text"
          value={code}
          onChange={(e) => {
            const v = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 4);
            setCode(v);
            setError("");
          }}
          placeholder="4자리 코드"
          maxLength={4}
          disabled={!storeId}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 text-center tracking-[0.5em] font-bold uppercase placeholder:text-gray-400 placeholder:tracking-normal placeholder:font-normal focus:border-red-300 focus:bg-white focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !storeId || code.length < 4}
        className="mt-1 w-full rounded-xl bg-red-600 py-3 text-sm font-bold text-white transition-all hover:bg-red-700 active:scale-[0.98] disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {loading ? "설정 중..." : "시작하기"}
      </button>

      {/* 안내 */}
      <p className="text-center text-[10px] text-gray-400">
        매장 오픈 시 직원이 각 태블릿에 한 번만 설정합니다.
      </p>

      {/* 테스트 코드 안내 */}
      <div className="rounded-lg bg-gray-50 p-3">
        <p className="text-[10px] font-bold text-gray-400 mb-1">테스트 설정 코드</p>
        <div className="flex flex-col gap-0.5 text-[11px] text-gray-500">
          <span>수원점 31번: <code className="bg-gray-200 px-1 rounded">31AA</code></span>
          <span>수원점 1번: <code className="bg-gray-200 px-1 rounded">01AA</code></span>
        </div>
      </div>
    </form>
  );
}
