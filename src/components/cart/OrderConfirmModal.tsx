"use client";

import { formatPrice } from "@/data/mock";
import { type CartItem } from "@/components/cart/CartProvider";

interface Props {
  items: CartItem[];
  totalPrice: number;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 주문 확인 모달
 * 주문 전 최종 확인 단계
 */
export default function OrderConfirmModal({
  items,
  totalPrice,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-backdrop"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-bg-secondary p-6 animate-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 아이콘 */}
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-primary/15">
            <span className="text-2xl">🛒</span>
          </div>
        </div>

        {/* 타이틀 */}
        <h2 className="text-center text-lg font-bold text-text-primary">
          주문을 확인해주세요
        </h2>

        {/* 주문 요약 */}
        <div className="mt-4 max-h-48 overflow-y-auto rounded-xl bg-bg-card p-4 scrollbar-hide">
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <div key={item.cartId} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="text-text-primary">{item.menuName}</span>
                  <span className="text-text-muted">x{item.quantity}</span>
                </div>
                <span className="text-text-secondary">{formatPrice(item.subTotal)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 합계 */}
        <div className="mt-3 flex items-center justify-between border-t border-border-default pt-3">
          <span className="text-sm text-text-muted">총 금액</span>
          <span className="text-lg font-bold text-red-primary">
            {formatPrice(totalPrice)}
          </span>
        </div>

        {/* 버튼 */}
        <div className="mt-5 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-border-default bg-bg-card py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-card-hover touch-feedback"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-primary py-3 text-sm font-bold text-white transition-colors hover:bg-red-hover touch-feedback"
          >
            주문하기
          </button>
        </div>
      </div>
    </div>
  );
}
