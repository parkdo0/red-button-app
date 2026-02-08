"use client";

import { useCart } from "@/components/cart/CartProvider";
import { formatPrice } from "@/data/mock";

interface Props {
  onOpenCart: () => void;
}

/**
 * 장바구니 플로팅 바 (주문 페이지 하단 고정)
 * 아이템이 있을 때만 표시
 */
export default function CartBar({ onOpenCart }: Props) {
  const { totalCount, totalPrice } = useCart();

  if (totalCount === 0) return null;

  return (
    <div className="border-t border-border-default bg-bg-secondary px-6 py-3 animate-bar">
      <button
        onClick={onOpenCart}
        className="flex w-full items-center justify-between rounded-xl bg-red-primary px-5 py-3.5 transition-colors hover:bg-red-hover touch-feedback"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
            {totalCount}
          </span>
          <span className="text-sm font-medium text-white">장바구니 보기</span>
        </div>
        <span className="text-base font-bold text-white">
          {formatPrice(totalPrice)}
        </span>
      </button>
    </div>
  );
}
