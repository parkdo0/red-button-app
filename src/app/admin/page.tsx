"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/data/mock";
import {
  MOCK_ADMIN_ORDERS,
  MOCK_STAFF_CALLS,
  MOCK_TABLES,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_COLOR,
  NEXT_ACTION_LABEL,
  ORDER_STATUS_TRANSITIONS,
  timeAgo,
  formatTime,
  type AdminOrder,
  type StaffCall,
  type OrderStatus,
} from "@/data/mock-admin";

/**
 * 관리자 대시보드 - 핵심 지표 + 실시간 현황
 */
export default function AdminDashboard() {
  const [orders, setOrders] = useState<AdminOrder[]>(MOCK_ADMIN_ORDERS);
  const [calls, setCalls] = useState<StaffCall[]>(MOCK_STAFF_CALLS);

  // 통계
  const pendingOrders = orders.filter((o) => o.status === "PENDING").length;
  const activeOrders = orders.filter((o) => ["PENDING", "CONFIRMED", "PREPARING"].includes(o.status)).length;
  const pendingCalls = calls.filter((c) => !c.acknowledged).length;
  const occupiedTables = MOCK_TABLES.filter((t) => t.isOccupied).length;
  const todayRevenue = orders.filter((o) => o.status !== "CANCELLED").reduce((sum, o) => sum + o.totalPrice, 0);

  /** 주문 상태 변경 */
  const updateOrderStatus = (orderId: number, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  /** 호출 확인 처리 */
  const acknowledgeCall = (callId: number) => {
    setCalls((prev) =>
      prev.map((c) =>
        c.id === callId
          ? { ...c, acknowledged: true, acknowledgedAt: new Date().toISOString() }
          : c
      )
    );
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-thin px-6 py-6">
      {/* 통계 카드 */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="신규 주문"
          value={pendingOrders}
          unit="건"
          color={pendingOrders > 0 ? "text-yellow-badge" : "text-text-primary"}
          bgColor={pendingOrders > 0 ? "bg-yellow-badge/8" : "bg-bg-card"}
          pulse={pendingOrders > 0}
        />
        <StatCard
          label="처리 중"
          value={activeOrders}
          unit="건"
          color="text-blue-400"
          bgColor="bg-blue-500/8"
        />
        <StatCard
          label="직원 호출"
          value={pendingCalls}
          unit="건"
          color={pendingCalls > 0 ? "text-red-primary" : "text-text-primary"}
          bgColor={pendingCalls > 0 ? "bg-red-subtle" : "bg-bg-card"}
          pulse={pendingCalls > 0}
        />
        <StatCard
          label="금일 매출"
          value={formatPrice(todayRevenue)}
          color="text-green-badge"
          bgColor="bg-green-badge/8"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 좌측: 신규 주문 (처리 필요) */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-red-primary" />
              <h2 className="text-base font-bold text-text-primary">주문 현황</h2>
            </div>
            <Link href="/admin/orders" className="text-xs font-medium text-red-primary hover:text-red-light transition-colors">
              전체 보기 →
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {orders
              .filter((o) => ["PENDING", "CONFIRMED", "PREPARING"].includes(o.status))
              .sort((a, b) => {
                // PENDING 먼저, 그 안에서 오래된 순
                const priority: Record<string, number> = { PENDING: 0, CONFIRMED: 1, PREPARING: 2 };
                if (priority[a.status] !== priority[b.status]) return priority[a.status] - priority[b.status];
                return new Date(a.orderedAt).getTime() - new Date(b.orderedAt).getTime();
              })
              .map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={updateOrderStatus}
                />
              ))}

            {activeOrders === 0 && (
              <div className="flex h-40 items-center justify-center rounded-2xl border border-border-default bg-bg-card text-sm text-text-muted">
                처리할 주문이 없습니다
              </div>
            )}
          </div>
        </div>

        {/* 우측: 직원 호출 + 테이블 현황 */}
        <div className="flex flex-col gap-6">
          {/* 직원 호출 */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-red-primary" />
                <h2 className="text-base font-bold text-text-primary">직원 호출</h2>
              </div>
              <Link href="/admin/calls" className="text-xs font-medium text-red-primary hover:text-red-light transition-colors">
                전체 보기 →
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              {calls
                .filter((c) => !c.acknowledged)
                .map((call) => (
                  <div
                    key={call.id}
                    className="flex items-center justify-between rounded-2xl border border-yellow-badge/20 bg-yellow-badge/5 p-4 animate-card"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-badge/15">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="text-yellow-badge">
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-sm font-bold text-text-primary">{call.tableNumber}</span>
                        <p className="text-[11px] text-text-muted">{timeAgo(call.calledAt)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => acknowledgeCall(call.id)}
                      className="rounded-xl bg-yellow-badge/15 px-3 py-1.5 text-xs font-semibold text-yellow-badge transition-colors hover:bg-yellow-badge/25 touch-feedback"
                    >
                      확인
                    </button>
                  </div>
                ))}

              {pendingCalls === 0 && (
                <div className="flex h-20 items-center justify-center rounded-2xl border border-border-default bg-bg-card text-xs text-text-muted">
                  대기 중인 호출 없음
                </div>
              )}
            </div>
          </div>

          {/* 테이블 현황 (미니맵) */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-red-primary" />
              <h2 className="text-base font-bold text-text-primary">테이블 현황</h2>
              <span className="text-xs text-text-muted">{occupiedTables}/{MOCK_TABLES.length}</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {MOCK_TABLES.map((table) => (
                <div
                  key={table.number}
                  className={`flex flex-col items-center justify-center rounded-xl border p-2.5 transition-colors
                    ${table.isOccupied
                      ? "border-green-badge/20 bg-green-badge/5"
                      : "border-border-default bg-bg-card"
                    }`}
                >
                  <span className={`text-xs font-bold ${table.isOccupied ? "text-green-badge" : "text-text-muted"}`}>
                    {table.number}
                  </span>
                  {table.isOccupied && (
                    <span className="text-[9px] text-text-muted">{table.currentOrderCount}건</span>
                  )}
                </div>
              ))}
            </div>

            {/* 범례 */}
            <div className="mt-2 flex items-center gap-4 justify-center">
              <span className="flex items-center gap-1 text-[10px] text-text-muted">
                <span className="h-2 w-2 rounded-full bg-green-badge/40" /> 이용 중
              </span>
              <span className="flex items-center gap-1 text-[10px] text-text-muted">
                <span className="h-2 w-2 rounded-full bg-border-default" /> 빈 테이블
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================
   서브 컴포넌트
   ============================================ */

function StatCard({
  label,
  value,
  unit,
  color,
  bgColor,
  pulse,
}: {
  label: string;
  value: string | number;
  unit?: string;
  color: string;
  bgColor: string;
  pulse?: boolean;
}) {
  return (
    <div className={`rounded-2xl border border-border-default ${bgColor} p-4`}>
      <p className="text-[11px] font-medium text-text-muted">{label}</p>
      <div className="mt-1 flex items-baseline gap-1">
        {pulse && <span className="inline-block h-2 w-2 rounded-full bg-current animate-pulse" style={{ color: "inherit" }} />}
        <span className={`text-2xl font-extrabold ${color}`}>{value}</span>
        {unit && <span className="text-xs text-text-muted">{unit}</span>}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  onUpdateStatus,
}: {
  order: AdminOrder;
  onUpdateStatus: (orderId: number, status: OrderStatus) => void;
}) {
  const nextStatuses = ORDER_STATUS_TRANSITIONS[order.status];
  const isPending = order.status === "PENDING";

  return (
    <div
      className={`rb-card p-4 ${isPending ? "border-yellow-badge/20 bg-yellow-badge/3" : ""}`}
    >
      {/* 헤더 */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-bg-elevated text-xs font-bold text-text-primary">
            {order.tableNumber}
          </span>
          <div>
            <span className="text-sm font-bold text-text-primary">주문 #{order.id}</span>
            <p className="text-[11px] text-text-muted">{formatTime(order.orderedAt)} · {timeAgo(order.orderedAt)}</p>
          </div>
        </div>
        <span className={`rb-badge border ${ORDER_STATUS_COLOR[order.status]}`}>
          {ORDER_STATUS_LABEL[order.status]}
        </span>
      </div>

      {/* 아이템 목록 */}
      <div className="mb-3 flex flex-col gap-1.5 rounded-xl bg-bg-elevated/50 px-3 py-2.5">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
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

      {/* 하단: 금액 + 액션 버튼 */}
      <div className="flex items-center justify-between">
        <span className="text-base font-extrabold text-text-primary">{formatPrice(order.totalPrice)}</span>

        {nextStatuses.length > 0 && (
          <div className="flex gap-2">
            {/* 취소 버튼 (PENDING / CONFIRMED 일 때) */}
            {nextStatuses.includes("CANCELLED") && (
              <button
                onClick={() => onUpdateStatus(order.id, "CANCELLED")}
                className="rounded-xl border border-border-default bg-bg-card px-3 py-1.5 text-xs font-semibold text-text-muted transition-colors hover:bg-bg-card-hover hover:text-red-primary touch-feedback"
              >
                취소
              </button>
            )}
            {/* 다음 상태 버튼 (메인 액션) */}
            {nextStatuses.filter((s) => s !== "CANCELLED").map((status) => (
              <button
                key={status}
                onClick={() => onUpdateStatus(order.id, status)}
                className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all touch-feedback
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
    </div>
  );
}
