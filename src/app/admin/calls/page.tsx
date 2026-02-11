"use client";

import { useState, useMemo } from "react";
import {
  MOCK_STAFF_CALLS,
  timeAgo,
  formatTime,
  type StaffCall,
} from "@/data/mock-admin";

/**
 * 관리자 직원 호출 관리 페이지
 * 미확인/확인 호출 목록 + 확인 처리
 */
export default function AdminCallsPage() {
  const [calls, setCalls] = useState<StaffCall[]>(MOCK_STAFF_CALLS);
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");

  const filteredCalls = useMemo(() => {
    return calls
      .filter((c) => {
        if (filter === "pending") return !c.acknowledged;
        if (filter === "done") return c.acknowledged;
        return true;
      })
      .sort((a, b) => {
        // 미확인 먼저, 그 안에서 최신순
        if (a.acknowledged !== b.acknowledged) return a.acknowledged ? 1 : -1;
        return new Date(b.calledAt).getTime() - new Date(a.calledAt).getTime();
      });
  }, [calls, filter]);

  const pendingCount = calls.filter((c) => !c.acknowledged).length;
  const doneCount = calls.filter((c) => c.acknowledged).length;

  const acknowledgeCall = (callId: number) => {
    setCalls((prev) =>
      prev.map((c) =>
        c.id === callId
          ? { ...c, acknowledged: true, acknowledgedAt: new Date().toISOString() }
          : c
      )
    );
  };

  /** 미확인 호출 일괄 확인 */
  const acknowledgeAll = () => {
    setCalls((prev) =>
      prev.map((c) =>
        !c.acknowledged
          ? { ...c, acknowledged: true, acknowledgedAt: new Date().toISOString() }
          : c
      )
    );
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-thin px-6 py-6">
      {/* 헤더 */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">직원 호출</h1>
          <p className="mt-1 text-sm text-text-muted">
            {pendingCount > 0 ? `${pendingCount}건의 호출이 대기 중입니다` : "대기 중인 호출이 없습니다"}
          </p>
        </div>
        {pendingCount > 0 && (
          <button
            onClick={acknowledgeAll}
            className="rb-btn-primary px-4 py-2 text-xs touch-feedback"
          >
            전체 확인
          </button>
        )}
      </div>

      {/* 필터 탭 */}
      <div className="mb-5 flex gap-2">
        {([
          { value: "all" as const, label: "전체", count: calls.length },
          { value: "pending" as const, label: "미확인", count: pendingCount },
          { value: "done" as const, label: "확인됨", count: doneCount },
        ]).map((f) => {
          const isActive = filter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all touch-feedback
                ${isActive ? "bg-red-primary text-white" : "bg-bg-card text-text-muted border border-border-default hover:border-border-hover"}`}
            >
              {f.label}
              <span className={`text-[10px] ${isActive ? "text-white/70" : "text-text-muted"}`}>{f.count}</span>
            </button>
          );
        })}
      </div>

      {/* 호출 목록 */}
      {filteredCalls.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filteredCalls.map((call, index) => (
            <div
              key={call.id}
              className={`animate-card flex items-center justify-between rounded-2xl border p-4 transition-all
                ${!call.acknowledged
                  ? "border-yellow-badge/25 bg-yellow-badge/5"
                  : "border-border-default bg-bg-card"
                }`}
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <div className="flex items-center gap-4">
                {/* 아이콘 */}
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl
                  ${!call.acknowledged ? "bg-yellow-badge/15" : "bg-bg-elevated"}`}>
                  <svg
                    width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                    className={!call.acknowledged ? "text-yellow-badge" : "text-text-muted"}
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>

                {/* 정보 */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-text-primary">{call.tableNumber}</span>
                    {!call.acknowledged && (
                      <span className="rb-badge bg-yellow-badge/12 text-yellow-badge border border-yellow-badge/30">대기 중</span>
                    )}
                    {call.acknowledged && (
                      <span className="rb-badge bg-green-badge/12 text-green-badge border border-green-badge/30">확인됨</span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-text-muted">
                    <span>호출: {formatTime(call.calledAt)} ({timeAgo(call.calledAt)})</span>
                    {call.acknowledged && call.acknowledgedAt && (
                      <>
                        <span>·</span>
                        <span>확인: {formatTime(call.acknowledgedAt)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* 확인 버튼 */}
              {!call.acknowledged && (
                <button
                  onClick={() => acknowledgeCall(call.id)}
                  className="rounded-xl bg-yellow-badge px-5 py-2.5 text-sm font-bold text-black transition-colors hover:bg-yellow-badge/80 touch-feedback"
                >
                  확인
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-60 flex-col items-center justify-center gap-3 text-text-muted">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-card">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-text-muted">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <p className="text-sm font-medium">
            {filter === "pending" ? "대기 중인 호출이 없습니다" : "호출 기록이 없습니다"}
          </p>
        </div>
      )}
    </div>
  );
}
