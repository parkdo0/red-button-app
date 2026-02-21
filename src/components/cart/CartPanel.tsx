"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { useToast } from "@/components/ToastProvider";
import { formatPrice } from "@/data/constants";
import type { CreateOrderRequest, OrderResponse } from "@/types/api";
import OrderConfirmModal from "@/components/cart/OrderConfirmModal";

interface Props {
  onClose: () => void;
}

/**
 * 장바구니 슬라이드 패널 - 레드버튼 스타일
 */
export default function CartPanel({ onClose }: Props) {
  const { items, totalPrice, totalCount, updateQuantity, removeItem, clearCart } = useCart();
  const { showToast } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);

  const handleConfirmOrder = async () => {
    if (isOrdering) return;
    setIsOrdering(true);

    const body: CreateOrderRequest = {
      storeId: 1,
      tableId: 1,
      items: items.map((item) => ({
        menuId: item.menuId,
        quantity: item.quantity,
        selectedOptionIds: item.selectedOptions.map((o) => o.id),
      })),
    };

    try {
      // DB 연동 시: const order = await postApi<OrderResponse>("/api/orders", body);
      console.log("주문 요청:", body);
      await new Promise((r) => setTimeout(r, 600));
      showToast(`주문이 접수되었습니다! (${formatPrice(totalPrice)})`);

      clearCart();
      setShowConfirm(false);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "주문 처리 중 오류가 발생했습니다.";
      showToast(message, "error");
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex justify-end bg-black/50 backdrop-blur-[2px] animate-backdrop" onClick={onClose}>
        <div className="flex h-full w-full max-w-sm flex-col bg-bg-secondary animate-panel" onClick={(e) => e.stopPropagation()}>
          {/* 헤더 */}
          <div className="flex items-center justify-between border-b border-border-default px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-red-primary" />
              <h2 className="text-lg font-bold text-text-primary">장바구니</h2>
              {totalCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-primary px-1.5 text-[10px] font-bold text-white">
                  {totalCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {items.length > 0 && (
                <button onClick={clearCart} className="text-[11px] font-medium text-text-muted hover:text-red-primary transition-colors">
                  전체 삭제
                </button>
              )}
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-text-muted hover:bg-bg-card hover:text-text-primary transition-colors touch-feedback"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* 아이템 리스트 */}
          <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-text-muted">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-card">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-text-muted">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                </div>
                <p className="text-sm font-medium">장바구니가 비어있습니다</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {items.map((item, index) => (
                  <div
                    key={item.cartId}
                    className="animate-card rb-card p-4"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-text-primary">{item.menuName}</h3>
                        {item.selectedOptions.length > 0 && (
                          <p className="mt-0.5 text-[11px] text-text-muted">
                            {item.selectedOptions.map((o) => o.name).join(", ")}
                          </p>
                        )}
                      </div>
                      <button onClick={() => removeItem(item.cartId)} className="text-[11px] text-text-muted hover:text-red-primary transition-colors">
                        삭제
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      {/* 수량 조절 */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.cartId, -1)}
                          disabled={isOrdering}
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-border-default text-sm text-text-secondary hover:bg-bg-card-hover transition-colors touch-feedback disabled:opacity-40"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-text-primary">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartId, 1)}
                          disabled={isOrdering}
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-border-default text-sm text-text-secondary hover:bg-bg-card-hover transition-colors touch-feedback disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-extrabold text-text-primary">{formatPrice(item.subTotal)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 하단 결제 */}
          {items.length > 0 && (
            <div className="border-t border-border-default px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-text-secondary">총 금액</span>
                <span className="text-xl font-extrabold text-text-primary">{formatPrice(totalPrice)}</span>
              </div>
              <button
                onClick={() => setShowConfirm(true)}
                disabled={isOrdering}
                className="rb-btn-primary w-full py-3.5 text-base touch-feedback disabled:opacity-60"
              >
                주문하기
              </button>
            </div>
          )}
        </div>
      </div>

      {showConfirm && (
        <OrderConfirmModal
          items={items}
          totalPrice={totalPrice}
          isLoading={isOrdering}
          onConfirm={handleConfirmOrder}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}
