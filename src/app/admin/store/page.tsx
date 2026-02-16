"use client";

import Link from "next/link";
import {
  MOCK_ADMIN_ORDERS,
  MOCK_TABLE_STATUS,
  MOCK_STORE_GAMES,
  ADMIN_ORDER_STATUS_LABEL,
  ADMIN_ORDER_STATUS_COLOR,
} from "@/data/mock-admin";
import { MOCK_MENUS, formatPrice } from "@/data/mock";

/**
 * 매장 대시보드 - 오늘의 운영 현황 한눈에
 */
export default function StoreDashboardPage() {
  const pendingOrders = MOCK_ADMIN_ORDERS.filter((o) => o.status === "PENDING").length;
  const preparingOrders = MOCK_ADMIN_ORDERS.filter((o) => o.status === "PREPARING").length;
  const occupiedTables = MOCK_TABLE_STATUS.filter((t) => t.status === "occupied").length;
  const totalTables = MOCK_TABLE_STATUS.length;
  const visibleGames = MOCK_STORE_GAMES.filter((g) => g.isVisible).length;
  const todayRevenue = MOCK_ADMIN_ORDERS
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + o.totalPrice, 0);

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-6 py-6">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">수원점 대시보드</h1>
          <p className="mt-1 text-sm text-gray-500">
            {new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="mb-6 grid grid-cols-4 gap-4">
          <StatCard
            label="신규 주문"
            value={`${pendingOrders}건`}
            color="orange"
            alert={pendingOrders > 0}
            link="/admin/store/orders"
          />
          <StatCard
            label="준비 중"
            value={`${preparingOrders}건`}
            color="yellow"
            link="/admin/store/orders"
          />
          <StatCard
            label="테이블 현황"
            value={`${occupiedTables}/${totalTables}`}
            sub={`${((occupiedTables / totalTables) * 100).toFixed(0)}% 이용 중`}
            color="blue"
            link="/admin/store/tables"
          />
          <StatCard
            label="오늘 매출"
            value={formatPrice(todayRevenue)}
            color="green"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* 최근 주문 */}
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
              <h2 className="text-sm font-bold text-gray-900">최근 주문</h2>
              <Link href="/admin/store/orders" className="text-xs font-medium text-red-600 hover:text-red-700">
                전체 보기 →
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {MOCK_ADMIN_ORDERS.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">#{order.id}</span>
                      <span className="text-xs text-gray-400">{order.tableNo}번</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${ADMIN_ORDER_STATUS_COLOR[order.status]}`}>
                        {ADMIN_ORDER_STATUS_LABEL[order.status]}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {order.items.map((i) => `${i.menuName} x${i.quantity}`).join(", ")}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-gray-700">{formatPrice(order.totalPrice)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 테이블 미니맵 */}
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
              <h2 className="text-sm font-bold text-gray-900">테이블 현황</h2>
              <Link href="/admin/store/tables" className="text-xs font-medium text-red-600 hover:text-red-700">
                전체 보기 →
              </Link>
            </div>
            <div className="grid grid-cols-7 gap-2 p-4">
              {MOCK_TABLE_STATUS.map((table) => (
                <div
                  key={table.id}
                  className={`flex h-10 items-center justify-center rounded-lg text-xs font-bold ${
                    table.status === "occupied"
                      ? "bg-red-100 text-red-700 border border-red-200"
                      : "bg-gray-50 text-gray-400 border border-gray-100"
                  }`}
                  title={table.status === "occupied" ? `${table.guestCount}명 / ${table.elapsedMinutes}분` : "빈 테이블"}
                >
                  {table.tableNo}
                </div>
              ))}
            </div>
            <div className="flex gap-4 border-t border-gray-100 px-5 py-2.5">
              <span className="flex items-center gap-1.5 text-[10px] text-gray-400">
                <span className="h-2.5 w-2.5 rounded bg-red-100 border border-red-200" /> 이용 중
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-gray-400">
                <span className="h-2.5 w-2.5 rounded bg-gray-50 border border-gray-100" /> 빈 테이블
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color, alert, link }: {
  label: string; value: string; sub?: string; color: string; alert?: boolean; link?: string;
}) {
  const colorMap: Record<string, string> = {
    orange: "bg-orange-50 text-orange-700",
    yellow: "bg-yellow-50 text-yellow-700",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
  };
  const content = (
    <div className={`rounded-xl border border-gray-200 bg-white p-4 ${alert ? "ring-2 ring-orange-300" : ""}`}>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-gray-900">{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-gray-400">{sub}</p>}
      {alert && (
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-600">
          🔔 처리 필요
        </span>
      )}
    </div>
  );
  return link ? <Link href={link}>{content}</Link> : content;
}
