"use client";

import { useCart } from "@/components/cart/CartProvider";
import { formatPrice } from "@/data/mock";

interface Props {
  onOpenCart: () => void;
}

/**
 * 장바구니 플로팅 바 - 레드버튼 스타일
 */
export default function CartBar({ onOpenCart }: Props) {
  const { totalCount, totalPrice } = useCart();

  if (totalCount === 0) return null;

  return (
    <div className="border-t border-border-default bg-bg-secondary/95 backdrop-blur-sm px-6 py-3 animate-bar">
      <button
        onClick={onOpenCart}
        className="rb-btn-primary flex w-full items-center justify-between px-5 py-3.5 touch-feedback"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
            {totalCount}
          </span>
          <span className="text-sm font-semibold text-white">장바구니 보기</span>
        </div>
        <span className="text-base font-extrabold text-white">
          {formatPrice(totalPrice)}
        </span>
      </button>
    </div>
  );
}
