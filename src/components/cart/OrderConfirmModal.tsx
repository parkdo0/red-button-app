"use client";

import { formatPrice } from "@/data/mock";
import { type CartItem } from "@/components/cart/CartProvider";

interface Props {
  items: CartItem[];
  totalPrice: number;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 주문 확인 모달 - 레드버튼 스타일
 */
export default function OrderConfirmModal({ items, totalPrice, isLoading = false, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-[2px] animate-backdrop" onClick={!isLoading ? onCancel : undefined}>
      <div className="w-full max-w-sm rounded-3xl border border-border-default bg-bg-secondary p-6 shadow-2xl animate-modal" onClick={(e) => e.stopPropagation()}>
        {/* 아이콘 */}
        <div className="mb-4 flex justify-center">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${isLoading ? "bg-yellow-badge/10" : "bg-red-subtle"}`}>
            <span className="text-2xl">{isLoading ? "⏳" : "🛒"}</span>
          </div>
        </div>

        <h2 className="text-center text-lg font-extrabold text-text-primary">
          {isLoading ? "주문 처리 중..." : "주문을 확인해주세요"}
        </h2>

        {/* 주문 요약 */}
        <div className="mt-4 max-h-48 overflow-y-auto rounded-2xl bg-bg-card border border-border-default p-4 scrollbar-thin">
          <div className="flex flex-col gap-2.5">
            {items.map((item) => (
              <div key={item.cartId} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="truncate font-medium text-text-primary">{item.menuName}</span>
                  <span className="flex-shrink-0 text-text-muted">x{item.quantity}</span>
                </div>
                <span className="flex-shrink-0 font-semibold text-text-secondary">{formatPrice(item.subTotal)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 합계 */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-text-muted">총 금액</span>
          <span className="text-xl font-extrabold text-red-primary">{formatPrice(totalPrice)}</span>
        </div>

        {/* 버튼 */}
        <div className="mt-5 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 rounded-2xl border border-border-default bg-bg-card py-3.5 text-sm font-semibold text-text-secondary transition-colors hover:bg-bg-card-hover touch-feedback disabled:opacity-40"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="rb-btn-primary flex-1 py-3.5 text-sm touch-feedback disabled:opacity-60"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                처리 중
              </span>
            ) : "주문하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
