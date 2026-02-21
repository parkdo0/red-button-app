"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/components/SessionProvider";

interface TableStatus {
  id: number;
  tableNo: string;
  seats: number;
  setupCode: string | null;
  status: "occupied" | "empty";
  guestCount: number;
  elapsedMinutes: number;
  sessionId: number | null;
  checkInAt: string | null;
}

/**
 * 매장 > 테이블 현황 관리
 */
export default function StoreTablesPage() {
  const session = useSession();
  const [tables, setTables] = useState<TableStatus[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTables = useCallback(() => {
    if (!session?.storeId) return;
    fetch(`/api/tables?storeId=${session.storeId}`)
      .then((r) => r.json())
      .then((data) => { setTables(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [session?.storeId]);

  useEffect(() => { fetchTables(); }, [fetchTables]);

  const occupied = tables.filter((t) => t.status === "occupied").length;
  const totalGuests = tables.reduce((sum, t) => sum + (t.guestCount ?? 0), 0);

  /** 입장 처리 */
  const checkIn = async (tableId: number, guestCount: number) => {
    try {
      await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: session?.storeId ?? 1, tableId, guestCount }),
      });
      setSelectedTable(null);
      fetchTables();
    } catch (err) {
      console.error("입장 처리 실패:", err);
    }
  };

  /** 코드 재발급 */
  const regenerateCode = async (tableId: number) => {
    try {
      const res = await fetch(`/api/tables/${tableId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "regenerateCode" }),
      });
      if (res.ok) {
        const updated = await res.json();
        // 선택된 테이블 + 목록 즉시 반영
        setSelectedTable((prev) => prev ? { ...prev, setupCode: updated.setupCode } : null);
        setTables((prev) => prev.map((t) => t.id === tableId ? { ...t, setupCode: updated.setupCode } : t));
      }
    } catch (err) {
      console.error("코드 재발급 실패:", err);
    }
  };

  /** 퇴장 처리 */
  const checkOut = async (table: TableStatus) => {
    if (!table.sessionId) return;
    try {
      await fetch(`/api/sessions/${table.sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "checkout" }),
      });
      setSelectedTable(null);
      fetchTables();
    } catch (err) {
      console.error("퇴장 처리 실패:", err);
    }
  };

  const formatTime = (mins: number | null | undefined) => {
    if (mins == null || mins === 0) return "";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
  };

  if (loading) return <div className="flex h-full items-center justify-center text-gray-400">로딩 중...</div>;

  return (
    <div className="flex h-full flex-col">
      {/* 헤더 */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-lg font-bold text-gray-900">테이블 현황</h1>
        <div className="mt-1 flex gap-4 text-xs text-gray-500">
          <span>전체 <strong className="text-gray-900">{tables.length}</strong></span>
          <span>이용 중 <strong className="text-red-600">{occupied}</strong></span>
          <span>빈 테이블 <strong className="text-green-600">{tables.length - occupied}</strong></span>
          <span>현재 인원 <strong className="text-blue-600">{totalGuests}명</strong></span>
        </div>
      </div>

      {/* 테이블 그리드 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-5 gap-3 md:grid-cols-7 lg:grid-cols-8">
          {tables.map((table) => (
            <button
              key={table.id}
              onClick={() => setSelectedTable(table)}
              className={`group flex flex-col items-center justify-center rounded-xl border-2 p-3 transition-all hover:shadow-md ${
                table.status === "occupied"
                  ? "border-red-300 bg-red-50 hover:border-red-400"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <span className={`text-lg font-extrabold ${table.status === "occupied" ? "text-red-700" : "text-gray-400"}`}>
                {table.tableNo}
              </span>
              {table.status === "occupied" ? (
                <>
                  <span className="text-[10px] font-bold text-red-600">{table.guestCount}명</span>
                  <span className="text-[9px] text-red-400">{formatTime(table.elapsedMinutes)}</span>
                </>
              ) : (
                <span className="text-[10px] text-gray-300">{table.seats}석</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 범례 */}
      <div className="flex gap-6 border-t border-gray-200 bg-white px-6 py-3">
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="h-3 w-3 rounded border-2 border-red-300 bg-red-50" /> 이용 중
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="h-3 w-3 rounded border-2 border-gray-200 bg-white" /> 빈 테이블
        </span>
      </div>

      {/* 테이블 상세 모달 */}
      {selectedTable && (
        <TableModal
          table={selectedTable}
          onClose={() => setSelectedTable(null)}
          onCheckIn={checkIn}
          onCheckOut={checkOut}
          onRegenerateCode={regenerateCode}
          formatTime={formatTime}
        />
      )}
    </div>
  );
}

function TableModal({ table, onClose, onCheckIn, onCheckOut, onRegenerateCode, formatTime }: {
  table: TableStatus;
  onClose: () => void;
  onCheckIn: (id: number, guests: number) => void;
  onCheckOut: (table: TableStatus) => void;
  onRegenerateCode: (tableId: number) => void;
  formatTime: (m: number | null | undefined) => string;
}) {
  const [guestInput, setGuestInput] = useState(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="w-full max-w-xs rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 text-center">
          <span className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-extrabold ${
            table.status === "occupied" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-400"
          }`}>
            {table.tableNo}
          </span>
          <h2 className="mt-2 text-lg font-bold text-gray-900">{table.tableNo}번 테이블</h2>
          <p className="text-xs text-gray-400">{table.seats}인석</p>
        </div>

        {table.status === "occupied" ? (
          <>
            <div className="mb-4 rounded-xl bg-red-50 p-3 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">인원</span>
                <span className="font-bold text-gray-900">{table.guestCount}명</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">이용 시간</span>
                <span className="font-bold text-red-600">{formatTime(table.elapsedMinutes)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">입장 시간</span>
                <span className="font-medium text-gray-700">
                  {table.checkInAt ? new Date(table.checkInAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }) : "-"}
                </span>
              </div>
            </div>
            <button
              onClick={() => onCheckOut(table)}
              className="w-full rounded-xl bg-gray-900 py-3 text-sm font-bold text-white hover:bg-gray-800"
            >
              퇴장 처리
            </button>
          </>
        ) : (
          <>
            <div className="mb-4">
              <label className="mb-1.5 text-xs font-semibold text-gray-600">인원 수</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setGuestInput((v) => Math.max(1, v - 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50"
                >−</button>
                <span className="w-8 text-center text-lg font-bold text-gray-900">{guestInput}</span>
                <button
                  onClick={() => setGuestInput((v) => Math.min(table.seats + 2, v + 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50"
                >+</button>
              </div>
            </div>
            <button
              onClick={() => onCheckIn(table.id, guestInput)}
              className="w-full rounded-xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-700"
            >
              입장 처리
            </button>
          </>
        )}

        {/* 설정 코드 */}
        <div className="mt-4 rounded-xl bg-gray-50 p-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-gray-400">설정 코드</span>
              <p className="text-sm font-bold tracking-wider text-gray-700">
                {table.setupCode ?? "미발급"}
              </p>
            </div>
            <button
              onClick={() => onRegenerateCode(table.id)}
              className="rounded-lg bg-gray-200 px-3 py-1.5 text-[11px] font-bold text-gray-600 hover:bg-gray-300 transition-colors"
            >
              {table.setupCode ? "재발급" : "발급"}
            </button>
          </div>
        </div>

        <button onClick={onClose} className="mt-2 w-full py-2 text-xs text-gray-400 hover:text-gray-600">닫기</button>
      </div>
    </div>
  );
}
