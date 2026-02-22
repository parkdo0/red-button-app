"use client";

import { useState, useEffect, useCallback } from "react";
import { formatPrice } from "@/data/constants";
import { PAYMENT_METHOD_LABEL } from "@/data/order-constants";
import type { PaymentMethod } from "@/types/api";

interface Props {
  totalPrice: number;
  onComplete: (method: PaymentMethod) => void;
  onCancel: () => void;
}

type Step = "select" | "waiting" | "success" | "failed";

const PAYMENT_METHODS: { key: PaymentMethod; label: string; desc: string }[] = [
  { key: "CARD", label: "카드 결제", desc: "카드를 단말기에 터치해주세요" },
  { key: "SAMSUNG_PAY", label: "삼성페이", desc: "삼성페이로 단말기에 터치해주세요" },
  { key: "KAKAO_PAY", label: "카카오페이", desc: "카카오페이로 단말기에 터치해주세요" },
  { key: "NAVER_PAY", label: "네이버페이", desc: "네이버페이로 단말기에 터치해주세요" },
];

/**
 * 결제 수단 선택 + 결제 대기 + 결제 완료 모달
 * 실제 환경: 카드 단말기(VAN사)로 금액 전달 → 단말기 결제 → 콜백 수신
 * 클론 환경: mock 2.5초 후 자동 결제 성공
 */
export default function PaymentWaitingModal({ totalPrice, onComplete, onCancel }: Props) {
  const [step, setStep] = useState<Step>("select");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("CARD");

  // Mock: 결제 대기 중 → 2.5초 후 성공
  useEffect(() => {
    if (step !== "waiting") return;
    const timer = setTimeout(() => {
      // 실제 환경에서는 VAN사 콜백(POST /api/orders/[id]/payment)으로 결과 수신
      // mock: 항상 성공
      setStep("success");
    }, 2500);
    return () => clearTimeout(timer);
  }, [step]);

  // 성공 후 1초 대기 → 주문 생성 진행
  useEffect(() => {
    if (step !== "success") return;
    const timer = setTimeout(() => {
      onComplete(selectedMethod);
    }, 1000);
    return () => clearTimeout(timer);
  }, [step, selectedMethod, onComplete]);

  const handlePay = useCallback(() => {
    setStep("waiting");
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onClick={step === "select" ? onCancel : undefined}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Step 1: 결제 수단 선택 */}
        {step === "select" && (
          <>
            <h2 className="text-center text-lg font-extrabold text-gray-900">
              결제 수단 선택
            </h2>
            <p className="mt-1 text-center text-sm text-gray-500">
              총 결제 금액: <span className="font-bold text-red-600">{formatPrice(totalPrice)}</span>
            </p>

            <div className="mt-5 flex flex-col gap-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setSelectedMethod(m.key)}
                  className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-all ${
                    selectedMethod === m.key
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    selectedMethod === m.key ? "bg-red-100" : "bg-gray-100"
                  }`}>
                    {m.key === "CARD" && <CardIcon selected={selectedMethod === m.key} />}
                    {m.key === "SAMSUNG_PAY" && <PhoneIcon selected={selectedMethod === m.key} />}
                    {m.key === "KAKAO_PAY" && <WalletIcon selected={selectedMethod === m.key} />}
                    {m.key === "NAVER_PAY" && <WalletIcon selected={selectedMethod === m.key} />}
                  </div>
                  <div>
                    <p className={`text-[14px] font-bold ${
                      selectedMethod === m.key ? "text-red-600" : "text-gray-900"
                    }`}>
                      {m.label}
                    </p>
                    <p className="text-[11px] text-gray-400">{m.desc}</p>
                  </div>
                  {selectedMethod === m.key && (
                    <div className="ml-auto">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 rounded-xl border border-gray-200 bg-white py-3.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handlePay}
                className="flex-1 rounded-xl bg-red-600 py-3.5 text-sm font-bold text-white transition-colors hover:bg-red-700"
              >
                결제하기
              </button>
            </div>
          </>
        )}

        {/* Step 2: 결제 대기 중 */}
        {step === "waiting" && (
          <div className="flex flex-col items-center py-4">
            {/* 카드 터치 애니메이션 */}
            <div className="relative mb-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gray-100">
                <CardIcon selected={false} size={48} />
              </div>
              {/* 펄스 애니메이션 */}
              <div className="absolute inset-0 animate-ping rounded-2xl border-2 border-red-400 opacity-30" />
            </div>

            <h2 className="text-lg font-extrabold text-gray-900">결제 진행 중</h2>
            <p className="mt-2 text-center text-sm text-gray-500">
              {PAYMENT_METHODS.find((m) => m.key === selectedMethod)?.desc}
            </p>
            <p className="mt-4 text-xl font-extrabold text-red-600">
              {formatPrice(totalPrice)}
            </p>

            {/* 로딩 인디케이터 */}
            <div className="mt-5 flex items-center gap-2">
              <div className="h-2 w-2 animate-bounce rounded-full bg-red-400" style={{ animationDelay: "0s" }} />
              <div className="h-2 w-2 animate-bounce rounded-full bg-red-400" style={{ animationDelay: "0.15s" }} />
              <div className="h-2 w-2 animate-bounce rounded-full bg-red-400" style={{ animationDelay: "0.3s" }} />
            </div>

            <button
              onClick={onCancel}
              className="mt-6 rounded-xl border border-gray-200 bg-white px-8 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
            >
              취소
            </button>
          </div>
        )}

        {/* Step 3: 결제 성공 */}
        {step === "success" && (
          <div className="flex flex-col items-center py-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-extrabold text-gray-900">결제 완료</h2>
            <p className="mt-1 text-sm text-gray-500">
              {PAYMENT_METHOD_LABEL[selectedMethod]} {formatPrice(totalPrice)}
            </p>
          </div>
        )}

        {/* Step 4: 결제 실패 (mock에서는 사용 안 하지만 구조는 준비) */}
        {step === "failed" && (
          <div className="flex flex-col items-center py-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-extrabold text-gray-900">결제 실패</h2>
            <p className="mt-1 text-sm text-gray-500">카드를 확인 후 다시 시도해주세요.</p>

            <div className="mt-5 flex gap-3 w-full">
              <button
                onClick={onCancel}
                className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-600"
              >
                취소
              </button>
              <button
                onClick={() => setStep("waiting")}
                className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-bold text-white"
              >
                재시도
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────
// SVG 아이콘 (외부 라이브러리 없이)
// ──────────────────────────────────────
function CardIcon({ selected, size = 20 }: { selected: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={selected ? "#dc2626" : "#6b7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function PhoneIcon({ selected }: { selected: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={selected ? "#dc2626" : "#6b7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}

function WalletIcon({ selected }: { selected: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={selected ? "#dc2626" : "#6b7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}
