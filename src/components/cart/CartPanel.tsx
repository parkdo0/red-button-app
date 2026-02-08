"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { useToast } from "@/components/ToastProvider";
import { formatPrice } from "@/data/mock";
import OrderConfirmModal from "@/components/cart/OrderConfirmModal";

interface Props {
  onClose: () => void;
}

/**
 * 장바구니 슬라이드 패널 (우측에서 열림)
 */
export default function CartPanel({ onClose }: Props) {
  const { items, totalPrice, totalCount, updateQuantity, removeItem, clearCart } =
    useCart();
  const { showToast } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);

  /** 주문 확정 */
  const handleConfirmOrder = () => {
    // TODO: POST /api/orders 호출로 교체
    console.log("📦 주문 데이터:", {
      storeId: 1,
      tableId: 1,
      items: items.map((item) => ({
        menuId: item.menuId,
        quantity: item.quantity,
        selectedOptionIds: item.selectedOptions.map((o) => o.id),
      })),
      totalPrice,
    });

    showToast(`주문이 접수되었습니다! (${formatPrice(totalPrice)})`);
    clearCart();
    setShowConfirm(false);
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 flex justify-end bg-black/40 animate-backdrop"
        onClick={onClose}
      >
        <div
          className="flex h-full w-full max-w-sm flex-col bg-bg-secondary animate-panel"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between border-b border-border-default px-5 py-4">
            <h2 className="text-lg font-bold text-text-primary">
              장바구니 <span className="text-red-primary">({totalCount})</span>
            </h2>
            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-text-muted hover:text-red-primary transition-colors"
                >
                  전체 삭제
                </button>
              )}
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-bg-card hover:text-text-primary transition-colors touch-feedback"
              >
                ✕
              </button>
            </div>
          </div>

          {/* 아이템 리스트 */}
          <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-hide">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-text-muted">
                <span className="text-4xl">🛒</span>
                <p className="text-sm">장바구니가 비어있습니다</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {items.map((item, index) => (
                  <div
                    key={item.cartId}
                    className="animate-card rounded-xl border border-border-default bg-bg-card p-4"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-text-primary">
                          {item.menuName}
                        </h3>
                        {item.selectedOptions.length > 0 && (
                          <p className="mt-0.5 text-xs text-text-muted">
                            {item.selectedOptions.map((o) => o.name).join(", ")}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.cartId)}
                        className="text-xs text-text-muted hover:text-red-primary transition-colors"
                      >
                        삭제
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.cartId, -1)}
                          className="flex h-8 w-8 items-center justify-center rounded-md border border-border-default text-sm text-text-secondary hover:bg-bg-card-hover transition-colors touch-feedback"
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-sm font-bold text-text-primary">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cartId, 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-md border border-border-default text-sm text-text-secondary hover:bg-bg-card-hover transition-colors touch-feedback"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-bold text-text-primary">
                        {formatPrice(item.subTotal)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 하단 */}
          {items.length > 0 && (
            <div className="border-t border-border-default px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-text-secondary">총 금액</span>
                <span className="text-xl font-bold text-text-primary">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <button
                onClick={() => setShowConfirm(true)}
                className="w-full rounded-xl bg-red-primary py-3.5 text-base font-bold text-white transition-colors hover:bg-red-hover touch-feedback"
              >
                주문하기
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 주문 확인 모달 */}
      {showConfirm && (
        <OrderConfirmModal
          items={items}
          totalPrice={totalPrice}
          onConfirm={handleConfirmOrder}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}
