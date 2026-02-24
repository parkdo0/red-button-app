"use client";

import { useState } from "react";
import { useSession } from "@/components/SessionProvider";
import { IconCelebration } from "@/components/icons/AppIcons";

interface CouponInfo {
  id: number;
  code: string;
  name: string;
  discountAmount: number;
  minOrderAmount: number;
}

export default function CouponPage() {
  const session = useSession();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [coupon, setCoupon] = useState<CouponInfo | null>(null);
  const [used, setUsed] = useState(false);
  const [using, setUsing] = useState(false);

  const handleVerify = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    setCoupon(null);

    try {
      const res = await fetch(`/api/coupons?code=${encodeURIComponent(code.trim())}`);
      const data = await res.json();
      if (data.valid) {
        setCoupon(data.coupon);
      } else {
        setError(data.error || "유효하지 않은 쿠폰입니다.");
      }
    } catch {
      setError("쿠폰 확인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleUse = async () => {
    if (!coupon || !session) return;
    setUsing(true);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "use",
          couponId: coupon.id,
          storeId: session.storeId,
          tableNo: session.tableNo,
        }),
      });
      if (res.ok) {
        setUsed(true);
      } else {
        const data = await res.json();
        setError(data.error || "쿠폰 사용에 실패했습니다.");
      }
    } catch {
      setError("쿠폰 사용에 실패했습니다.");
    } finally {
      setUsing(false);
    }
  };

  const reset = () => {
    setCode("");
    setCoupon(null);
    setError("");
    setUsed(false);
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-thin bg-bg-primary">
      <div className="flex flex-col items-center justify-center min-h-full px-8 py-12">
        {/* 타이틀 */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-primary/10 mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-red-primary">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M2 10h20" />
              <path d="M7 15h.01M11 15h2" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-text-primary">쿠폰 사용</h1>
          <p className="text-sm text-text-muted mt-1">쿠폰 코드를 입력해 주세요</p>
        </div>

        {used ? (
          /* 사용 완료 */
          <div className="w-full max-w-md text-center">
            <div className="rounded-3xl bg-bg-card border border-border-default p-8">
              <div className="flex justify-center mb-4 text-red-primary"><IconCelebration size={48} /></div>
              <h2 className="text-xl font-bold text-text-primary mb-2">쿠폰이 적용되었습니다!</h2>
              <p className="text-sm text-text-muted mb-1">{coupon?.name}</p>
              <p className="text-2xl font-black text-red-primary">
                {coupon?.discountAmount.toLocaleString()}원 할인
              </p>
            </div>
            <button
              onClick={reset}
              className="mt-6 w-full rounded-2xl bg-bg-card border border-border-default py-3 text-sm font-bold text-text-secondary touch-feedback"
            >
              다른 쿠폰 사용하기
            </button>
          </div>
        ) : (
          /* 입력 폼 */
          <div className="w-full max-w-md">
            {/* 코드 입력 */}
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                placeholder="쿠폰 코드 입력"
                maxLength={20}
                className="rb-input flex-1 px-4 py-3 text-center text-lg font-bold tracking-widest uppercase"
                autoFocus
              />
              <button
                onClick={handleVerify}
                disabled={!code.trim() || loading}
                className={`rounded-2xl px-6 py-3 text-sm font-bold transition-all touch-feedback ${
                  code.trim() && !loading
                    ? "rb-btn-primary"
                    : "bg-bg-card text-text-muted cursor-not-allowed"
                }`}
              >
                {loading ? "확인 중..." : "확인"}
              </button>
            </div>

            {/* 에러 */}
            {error && (
              <div className="mt-4 rounded-2xl bg-red-primary/10 border border-red-primary/20 px-4 py-3 text-center">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* 쿠폰 정보 표시 */}
            {coupon && (
              <div className="mt-6">
                <div className="rounded-3xl bg-bg-card border border-border-default p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="rounded-full bg-red-primary/10 px-3 py-1 text-[11px] font-bold text-red-primary">
                      {coupon.code}
                    </span>
                    <span className="text-[11px] text-text-muted">
                      {coupon.minOrderAmount > 0 && `${coupon.minOrderAmount.toLocaleString()}원 이상 주문 시`}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-text-primary">{coupon.name}</h3>
                  <p className="mt-2 text-3xl font-black text-red-primary">
                    {coupon.discountAmount.toLocaleString()}원 할인
                  </p>
                </div>

                <button
                  onClick={handleUse}
                  disabled={using}
                  className="mt-4 w-full rounded-2xl rb-btn-primary py-4 text-base font-bold touch-feedback"
                >
                  {using ? "적용 중..." : "쿠폰 사용하기"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
