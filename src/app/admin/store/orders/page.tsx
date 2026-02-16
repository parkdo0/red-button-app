"use client";

import { useState } from "react";
import {
  MOCK_ADMIN_ORDERS,
  ADMIN_ORDER_STATUS_LABEL,
  ADMIN_ORDER_STATUS_COLOR,
  ORDER_STATUS_FLOW,
  type AdminOrder,
} from "@/data/mock-admin";
import { formatPrice } from "@/data/mock";

type OrderStatus = AdminOrder["status"];

const STATUS_COLUMNS: OrderStatus[] = ["PENDING", "CONFIRMED", "PREPARING", "COMPLETED"];

/**
 * 매장 > 주문 관리
 * 칸반 보드 스타일 (상태별 컬럼)
 */
export default function StoreOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>(MOCK_ADMIN_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  /** 주문 상태 변경 */
  const updateStatus = (orderId: number, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    // 상세 모달이 열려 있으면 업데이트
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : null);
    }
  };

  /** 경과 시간 텍스트 */
  const elapsed = (isoDate: string) => {
    const mins = Math.floor((Date.now() - new Date(isoDate).getTime()) / 60000);
    if (mins < 1) return "방금";
    if (mins < 60) return `${mins}분 전`;
    return `${Math.floor(mins / 60)}시간 ${mins % 60}분 전`;
  };

  return (
    <div className="flex h-full flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <div>
          <h1 className="text-lg font-bold text-gray-900">주문 관리</h1>
          <p className="text-xs text-gray-500">실시간 주문 접수 및 상태 관리</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
            🔔 신규 {orders.filter((o) => o.status === "PENDING").length}건
          </span>
          <span className="text-xs text-gray-400">
            전체 {orders.length}건
          </span>
        </div>
      </div>

      {/* 칸반 보드 */}
      <div className="flex flex-1 gap-4 overflow-x-auto p-4">
        {STATUS_COLUMNS.map((status) => {
          const columnOrders = orders
            .filter((o) => o.status === status)
            .sort((a, b) => new Date(a.orderedAt).getTime() - new Date(b.orderedAt).getTime());

          return (
            <div key={status} className="flex w-[280px] flex-shrink-0 flex-col">
              {/* 컬럼 헤더 */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${ADMIN_ORDER_STATUS_COLOR[status]}`}>
                    {ADMIN_ORDER_STATUS_LABEL[status]}
                  </span>
                  <span className="text-xs font-medium text-gray-400">{columnOrders.length}</span>
                </div>
              </div>

              {/* 주문 카드 리스트 */}
              <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
                {columnOrders.length === 0 && (
                  <div className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 p-6">
                    <p className="text-xs text-gray-300">주문 없음</p>
                  </div>
                )}
                {columnOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`cursor-pointer rounded-xl border bg-white p-4 transition-shadow hover:shadow-md ${
                      status === "PENDING" ? "border-orange-200 shadow-sm" : "border-gray-200"
                    }`}
                  >
                    {/* 주문 헤더 */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-gray-900">#{order.id}</span>
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-600">
                          {order.tableNo}번
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400">{elapsed(order.orderedAt)}</span>
                    </div>

                    {/* 메뉴 목록 */}
                    <div className="mb-3 space-y-1">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">
                            {item.menuName}
                            {item.options.length > 0 && (
                              <span className="ml-1 text-gray-400">({item.options.join(", ")})</span>
                            )}
                          </span>
                          <span className="font-medium text-gray-500">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* 합계 + 액션 */}
                    <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                      <span className="text-sm font-bold text-gray-900">{formatPrice(order.totalPrice)}</span>
                      <div className="flex gap-1.5">
                        {ORDER_STATUS_FLOW[status]?.map((nextStatus) => (
                          <button
                            key={nextStatus}
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStatus(order.id, nextStatus as OrderStatus);
                            }}
                            className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition-colors ${
                              nextStatus === "CANCELLED"
                                ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                : "bg-red-600 text-white hover:bg-red-700"
                            }`}
                          >
                            {nextStatus === "CONFIRMED" && "접수"}
                            {nextStatus === "PREPARING" && "준비"}
                            {nextStatus === "COMPLETED" && "완료"}
                            {nextStatus === "CANCELLED" && "취소"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 주문 상세 모달 */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={(newStatus) => updateStatus(selectedOrder.id, newStatus)}
          elapsed={elapsed}
        />
      )}
    </div>
  );
}

// ── 주문 상세 모달 ──
function OrderDetailModal({ order, onClose, onStatusChange, elapsed }: {
  order: AdminOrder;
  onClose: () => void;
  onStatusChange: (status: OrderStatus) => void;
  elapsed: (iso: string) => string;
}) {
  const nextStatuses = ORDER_STATUS_FLOW[order.status] ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-xl font-extrabold text-gray-900">#{order.id}</span>
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${ADMIN_ORDER_STATUS_COLOR[order.status]}`}>
              {ADMIN_ORDER_STATUS_LABEL[order.status]}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* 정보 */}
        <div className="mb-4 grid grid-cols-3 gap-3 rounded-xl bg-gray-50 p-3">
          <div>
            <p className="text-[10px] text-gray-400">테이블</p>
            <p className="text-sm font-bold text-gray-900">{order.tableNo}번</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400">주문 시간</p>
            <p className="text-sm font-bold text-gray-900">{elapsed(order.orderedAt)}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400">총 금액</p>
            <p className="text-sm font-bold text-red-600">{formatPrice(order.totalPrice)}</p>
          </div>
        </div>

        {/* 메뉴 상세 */}
        <div className="mb-4 rounded-xl border border-gray-200 divide-y divide-gray-100">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.menuName}</p>
                {item.options.length > 0 && (
                  <p className="text-[11px] text-gray-400">{item.options.join(", ")}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-700">{formatPrice(item.subTotal)}</p>
                <p className="text-[10px] text-gray-400">x{item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 액션 버튼 */}
        {nextStatuses.length > 0 && (
          <div className="flex gap-2">
            {nextStatuses.map((nextStatus) => (
              <button
                key={nextStatus}
                onClick={() => { onStatusChange(nextStatus as OrderStatus); onClose(); }}
                className={`flex-1 rounded-xl py-3 text-sm font-bold transition-colors ${
                  nextStatus === "CANCELLED"
                    ? "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                {nextStatus === "CONFIRMED" && "접수하기"}
                {nextStatus === "PREPARING" && "준비 시작"}
                {nextStatus === "COMPLETED" && "완료 처리"}
                {nextStatus === "CANCELLED" && "주문 취소"}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
