"use client";

import { useState, useMemo } from "react";
import { formatPrice } from "@/data/mock";
import {
  MOCK_ADMIN_ORDERS,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_COLOR,
  NEXT_ACTION_LABEL,
  ORDER_STATUS_TRANSITIONS,
  timeAgo,
  formatTime,
  type AdminOrder,
  type OrderStatus,
} from "@/data/mock-admin";

const STATUS_FILTERS: { label: string; value: OrderStatus | "ALL" }[] = [
  { label: "전체", value: "ALL" },
  { label: "접수 대기", value: "PENDING" },
  { label: "접수 완료", value: "CONFIRMED" },
  { label: "준비 중", value: "PREPARING" },
  { label: "완료", value: "COMPLETED" },
  { label: "취소", value: "CANCELLED" },
];

/**
 * 관리자 주문 관리 페이지
 * 전체 주문 목록 + 상태 필터 + 상태 변경
 */
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>(MOCK_ADMIN_ORDERS);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [searchTable, setSearchTable] = useState("");

  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => statusFilter === "ALL" || o.status === statusFilter)
      .filter((o) => !searchTable || o.tableNumber.toLowerCase().includes(searchTable.toLowerCase()))
      .sort((a, b) => {
        // 활성 주문 우선, 그 안에서 PENDING 먼저
        const priority: Record<string, number> = { PENDING: 0, CONFIRMED: 1, PREPARING: 2, COMPLETED: 3, CANCELLED: 4 };
        if (priority[a.status] !== priority[b.status]) return priority[a.status] - priority[b.status];
        return new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime();
      });
  }, [orders, statusFilter, searchTable]);

  const updateOrderStatus = (orderId: number, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  // 상태별 카운트
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: orders.length };
    for (const o of orders) {
      counts[o.status] = (counts[o.status] ?? 0) + 1;
    }
    return counts;
  }, [orders]);

  return (
    <div className="h-full overflow-y-auto scrollbar-thin px-6 py-6">
      {/* 헤더 */}
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">주문 관리</h1>
        <p className="mt-1 text-sm text-text-muted">전체 {orders.length}건의 주문</p>
      </div>

      {/* 필터 바 */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        {/* 상태 필터 탭 */}
        <div className="flex gap-1.5">
          {STATUS_FILTERS.map((f) => {
            const count = statusCounts[f.value] ?? 0;
            const isActive = statusFilter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all touch-feedback
                  ${isActive ? "bg-red-primary text-white" : "bg-bg-card text-text-muted border border-border-default hover:border-border-hover"}`}
              >
                {f.label}
                <span className={`text-[10px] ${isActive ? "text-white/70" : "text-text-muted"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 테이블 검색 */}
        <div className="relative ml-auto">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="테이블 검색..."
            value={searchTable}
            onChange={(e) => setSearchTable(e.target.value)}
            className="rb-input py-1.5 pl-8 pr-3 text-xs w-36"
          />
        </div>
      </div>

      {/* 주문 리스트 */}
      {filteredOrders.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filteredOrders.map((order, index) => {
            const nextStatuses = ORDER_STATUS_TRANSITIONS[order.status];
            const isPending = order.status === "PENDING";

            return (
              <div
                key={order.id}
                className={`animate-card rb-card p-4 ${isPending ? "border-yellow-badge/20 bg-yellow-badge/3" : ""}`}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {/* 헤더 */}
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg-elevated text-sm font-bold text-text-primary">
                      {order.tableNumber}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-text-primary">주문 #{order.id}</span>
                        <span className={`rb-badge border ${ORDER_STATUS_COLOR[order.status]}`}>
                          {ORDER_STATUS_LABEL[order.status]}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-muted">{formatTime(order.orderedAt)} · {timeAgo(order.orderedAt)}</p>
                    </div>
                  </div>
                  <span className="text-lg font-extrabold text-text-primary">{formatPrice(order.totalPrice)}</span>
                </div>

                {/* 아이템 */}
                <div className="mb-3 rounded-xl bg-bg-elevated/50 px-3 py-2.5">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text-primary">{item.menuName}</span>
                        <span className="text-text-muted">x{item.quantity}</span>
                        {item.options.length > 0 && (
                          <span className="text-[11px] text-text-muted">({item.options.join(", ")})</span>
                        )}
                      </div>
                      <span className="font-medium text-text-secondary">{formatPrice(item.subTotal)}</span>
                    </div>
                  ))}
                </div>

                {/* 액션 버튼 */}
                {nextStatuses.length > 0 && (
                  <div className="flex justify-end gap-2">
                    {nextStatuses.includes("CANCELLED") && (
                      <button
                        onClick={() => updateOrderStatus(order.id, "CANCELLED")}
                        className="rounded-xl border border-border-default bg-bg-card px-4 py-2 text-xs font-semibold text-text-muted transition-colors hover:bg-bg-card-hover hover:text-red-primary touch-feedback"
                      >
                        주문 취소
                      </button>
                    )}
                    {nextStatuses.filter((s) => s !== "CANCELLED").map((status) => (
                      <button
                        key={status}
                        onClick={() => updateOrderStatus(order.id, status)}
                        className={`rounded-xl px-5 py-2 text-xs font-bold transition-all touch-feedback
                          ${isPending
                            ? "bg-yellow-badge text-black hover:bg-yellow-badge/80"
                            : "bg-red-primary text-white hover:bg-red-hover"
                          }`}
                      >
                        {NEXT_ACTION_LABEL[order.status]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex h-60 flex-col items-center justify-center gap-3 text-text-muted">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-card">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-text-muted">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <p className="text-sm font-medium">해당 조건의 주문이 없습니다</p>
        </div>
      )}
    </div>
  );
}
