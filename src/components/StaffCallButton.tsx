"use client";

import { useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { useSession } from "@/components/SessionProvider";

/**
 * 직원 호출 버튼 - 레드버튼 스타일
 * 채팅 API로 자동 메시지 전송
 */
export default function StaffCallButton() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const { showToast } = useToast();
  const session = useSession();

  const handleCall = async () => {
    if (isCalling || cooldown) return;
    setIsCalling(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: session?.storeId ?? 1,
          tableNo: session?.tableNo ?? "1",
          sender: "CUSTOMER",
          message: "🔔 [직원 호출] 테이블에서 직원을 호출했습니다.",
        }),
      });
      if (res.ok) {
        showToast("직원을 호출했습니다. 잠시만 기다려주세요!");
      } else {
        showToast("호출에 실패했습니다. 다시 시도해주세요.", "error");
      }
      setShowConfirm(false);
      setCooldown(true);
      setTimeout(() => setCooldown(false), 10000);
    } catch {
      showToast("호출에 실패했습니다. 다시 시도해주세요.", "error");
    } finally {
      setIsCalling(false);
    }
  };

  const tableLabel = session?.tableNo ? `${session.tableNo}번` : "";

  return (
    <>
      <button
        onClick={() => !cooldown && setShowConfirm(true)}
        disabled={cooldown}
        className={`flex w-[62px] flex-col items-center gap-1 rounded-2xl px-2 py-3 transition-colors duration-200 touch-feedback
          ${cooldown ? "bg-green-badge/10 text-green-badge" : "text-text-muted hover:bg-bg-card hover:text-text-secondary"}`}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <span className="text-[9px] font-semibold leading-tight">{cooldown ? "호출됨" : "직원호출"}</span>
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] animate-backdrop" onClick={() => !isCalling && setShowConfirm(false)}>
          <div className="w-80 rounded-3xl border border-border-default bg-bg-secondary p-6 shadow-2xl animate-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-badge/10">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="text-yellow-badge">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
            </div>
            <h2 className="text-center text-lg font-extrabold text-text-primary">직원을 호출할까요?</h2>
            <p className="mt-2 text-center text-sm text-text-muted">{tableLabel} 테이블로 직원이 방문합니다</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setShowConfirm(false)} disabled={isCalling} className="flex-1 rounded-2xl border border-border-default bg-bg-card py-3.5 text-sm font-semibold text-text-secondary transition-colors hover:bg-bg-card-hover touch-feedback disabled:opacity-40">
                취소
              </button>
              <button onClick={handleCall} disabled={isCalling} className="rb-btn-primary flex-1 py-3.5 text-sm touch-feedback disabled:opacity-60">
                {isCalling ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    호출 중
                  </span>
                ) : "호출하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
