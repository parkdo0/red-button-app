"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { useToast } from "@/components/ToastProvider";
import { formatPrice } from "@/data/constants";
import { ORDER_STATUS_LABEL } from "@/data/order-constants";
import OrderConfirmModal from "@/components/cart/OrderConfirmModal";
import { orderApi } from "@/lib/api";
import type { CreateOrderRequest } from "@/types/api";
import { useSession } from "@/components/SessionProvider";

type PanelTab = "cart" | "history";

/**
 * F&B 주문 우측 상시 패널 - 실제 레드버튼 앱 기준
 * ✅ Split View (항상 보임, 오버레이 아님)
 * ✅ 장바구니 탭 + 주문 내역 탭
 * ✅ 라이트 테마 (흰 배경)
 * ✅ 하단 안내: "1인 1주문 필수입니다. 세트메뉴는 2인 인정 됩니다."
 */
export default function OrderCartPanel() {
  const [activeTab, setActiveTab] = useState<PanelTab>("cart");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const { items, totalPrice, totalCount, updateQuantity, removeItem, clearCart } = useCart();
  const { showToast } = useToast();

  const session = useSession();

  const handleConfirmOrder = async () => {
    if (isOrdering) return;
    setIsOrdering(true);

    const body: CreateOrderRequest = {
      storeId: session?.storeId ?? 1,
      tableId: session?.tableId ?? 1,
      items: items.map((item) => ({
        menuId: item.menuId,
        quantity: item.quantity,
        selectedOptionIds: item.selectedOptions.map((o) => o.id),
      })),
    };

    try {
      await orderApi.create(body);
      showToast(`주문이 접수되었습니다! (${formatPrice(totalPrice)})`);
      clearCart();
      setShowConfirm(false);
      setActiveTab("history"); // 주문 후 내역 탭으로 전환
    } catch (err) {
      const message = err instanceof Error ? err.message : "주문 처리 중 오류가 발생했습니다.";
      showToast(message, "error");
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <>
      <div className="flex w-[340px] flex-shrink-0 flex-col border-l border-gray-200 bg-white lg:w-[380px]">
        {/* 헤더: X 버튼 + 탭 + 모두 지우기 */}
        <div className="flex items-center border-b border-gray-200">
          {/* 닫기 (← 실제 앱에서는 X 아이콘) */}
          <button className="flex h-12 w-12 items-center justify-center text-gray-900 touch-feedback">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* 탭 */}
          <div className="flex flex-1">
            <button
              onClick={() => setActiveTab("cart")}
              className={`relative flex-1 py-3 text-center text-[14px] font-bold transition-colors ${
                activeTab === "cart" ? "text-red-600" : "text-gray-400"
              }`}
            >
              장바구니
              {activeTab === "cart" && (
                <div className="absolute bottom-0 left-4 right-4 h-[3px] rounded-full bg-red-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`relative flex-1 py-3 text-center text-[14px] font-bold transition-colors ${
                activeTab === "history" ? "text-red-600" : "text-gray-400"
              }`}
            >
              주문 내역
              {activeTab === "history" && (
                <div className="absolute bottom-0 left-4 right-4 h-[3px] rounded-full bg-red-600" />
              )}
            </button>
          </div>

          {/* 모두 지우기 */}
          {activeTab === "cart" && items.length > 0 && (
            <button
              onClick={clearCart}
              className="px-3 text-[12px] font-medium text-gray-400 hover:text-red-600 transition-colors"
            >
              모두 지우기
            </button>
          )}
        </div>

        {/* 콘텐츠 영역 */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "cart" ? (
            <CartContent
              items={items}
              updateQuantity={updateQuantity}
              removeItem={removeItem}
              isOrdering={isOrdering}
            />
          ) : (
            <HistoryContent />
          )}
        </div>

        {/* 하단 */}
        {activeTab === "cart" && (
          <div className="border-t border-gray-200 px-4 py-3">
            {/* 안내 문구 */}
            <p className="mb-3 text-center text-[11px] text-red-500">
              1인 1주문 필수입니다. 세트메뉴는 2인 인정 됩니다.
            </p>
            {/* 주문하기 버튼 */}
            <button
              onClick={() => {
                if (totalCount > 0) setShowConfirm(true);
              }}
              disabled={totalCount === 0 || isOrdering}
              className={`w-full rounded-lg py-3 text-[15px] font-bold transition-all touch-feedback ${
                totalCount > 0
                  ? "bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              주문하기
            </button>
          </div>
        )}
      </div>

      {/* 주문 확인 모달 */}
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

// ──────────────────────────────────────
// 장바구니 탭 콘텐츠
// ──────────────────────────────────────
import type { CartItem } from "@/components/cart/CartProvider";

function CartContent({
  items,
  updateQuantity,
  removeItem,
  isOrdering,
}: {
  items: CartItem[];
  updateQuantity: (cartId: string, delta: number) => void;
  removeItem: (cartId: string) => void;
  isOrdering: boolean;
}) {
  if (items.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-gray-400">
        <p className="text-[15px] font-medium">장바구니가</p>
        <p className="text-[15px] font-medium">비어있습니다</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-gray-100 px-4 py-3">
      {items.map((item) => (
        <div key={item.cartId} className="py-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="text-[14px] font-bold text-gray-900">{item.menuName}</h4>
              {item.selectedOptions.length > 0 && (
                <p className="mt-0.5 text-[11px] text-gray-400">
                  {item.selectedOptions.map((o) => o.name).join(", ")}
                </p>
              )}
            </div>
            <button
              onClick={() => removeItem(item.cartId)}
              className="ml-2 text-[11px] text-gray-400 hover:text-red-600 transition-colors"
            >
              삭제
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between">
            {/* 수량 조절 */}
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => updateQuantity(item.cartId, -1)}
                disabled={isOrdering}
                className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-xs text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40"
              >
                −
              </button>
              <span className="w-7 text-center text-[13px] font-bold text-gray-900">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.cartId, 1)}
                disabled={isOrdering}
                className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-xs text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40"
              >
                +
              </button>
            </div>
            <span className="text-[14px] font-extrabold text-gray-900">
              {formatPrice(item.subTotal)}
            </span>
          </div>
        </div>
      ))}

      {/* 총 금액 */}
      <div className="flex items-center justify-between pt-3">
        <span className="text-[13px] font-medium text-gray-500">총 주문 금액</span>
        <span className="text-[18px] font-extrabold text-red-600">
          {formatPrice(items.reduce((sum, i) => sum + i.subTotal, 0))}
        </span>
      </div>
    </div>
  );
}

// ──────────────────────────────────────
// 주문 내역 탭 콘텐츠
// ──────────────────────────────────────
interface ApiOrder {
  id: number;
  status: string;
  totalPrice: number;
  orderedAt: string;
  items: { id: number; menuName: string; quantity: number; subTotal: number; options: { optionName: string }[] }[];
}

function HistoryContent() {
  const session = useSession();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.storeId || !session?.tableId) return;
    fetch(`/api/orders?storeId=${session.storeId}&tableId=${session.tableId}`)
      .then((r) => r.json())
      .then((data) => { setOrders(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [session?.storeId, session?.tableId]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        <p className="text-[13px]">불러오는 중...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-gray-400">
        <p className="text-[15px] font-medium">주문 내역이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-gray-100 px-4 py-3">
      {orders.map((order) => {
        const time = new Date(order.orderedAt);
        const timeStr = `${time.getHours() > 12 ? "오후" : "오전"} ${time.getHours() > 12 ? time.getHours() - 12 : time.getHours()}:${String(time.getMinutes()).padStart(2, "0")}`;

        return (
          <div key={order.id} className="py-3">
            {/* 주문 상태 뱃지 */}
            <div className="mb-2">
              <span className={`inline-flex rounded px-2 py-0.5 text-[11px] font-bold ${getStatusStyle(order.status)}`}>
                {ORDER_STATUS_LABEL[order.status]}
              </span>
            </div>

            {/* 주문 시간 */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] text-gray-400">주문시간</span>
              <span className="text-[12px] text-gray-600">{timeStr}</span>
            </div>

            {/* 주문 아이템 목록 */}
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-1.5 border-t border-gray-50 first:border-t-0">
                <div>
                  <span className="text-[13px] font-bold text-gray-900">{item.menuName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[13px] font-bold text-gray-900">
                    {formatPrice(item.subTotal)}
                  </span>
                  <p className="text-[10px] text-gray-400">수량 : {item.quantity}개</p>
                </div>
              </div>
            ))}

            {/* 총 금액 */}
            <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-200">
              <span className="text-[13px] font-medium text-gray-500">총 주문 금액</span>
              <span className="text-[16px] font-extrabold text-red-600">
                {formatPrice(order.totalPrice)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** 주문 상태별 스타일 (라이트 테마) */
function getStatusStyle(status: string): string {
  const styles: Record<string, string> = {
    PENDING: "bg-yellow-50 text-yellow-600 border border-yellow-200",
    CONFIRMED: "bg-blue-50 text-blue-600 border border-blue-200",
    PREPARING: "bg-red-50 text-red-600 border border-red-200",
    COMPLETED: "bg-green-50 text-green-600 border border-green-200",
    CANCELLED: "bg-gray-50 text-gray-500 border border-gray-200",
  };
  return styles[status] ?? "bg-gray-50 text-gray-500";
}
