import { getOrdersByTable } from "@/lib/queries";
import { requireTableSession } from "@/lib/auth";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_COLOR,
} from "@/data/order-constants";
import { formatPrice } from "@/data/constants";
import Link from "next/link";

/**
 * 주문 내역 페이지 - Server Component (DB 연결)
 */
export default async function OrderHistoryPage() {
  const { storeId, tableNo } = await requireTableSession();
  const orders = await getOrdersByTable(storeId, tableNo);

  return (
    <div className="h-full overflow-y-auto scrollbar-thin px-6 py-6 md:px-8">
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">주문 내역</h1>
          <p className="mt-1 text-sm text-text-muted">{tableNo}번 테이블</p>
        </div>
        <Link href="/order" className="rb-btn-primary px-5 py-2.5 text-sm touch-feedback">
          + 추가 주문
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="flex h-60 flex-col items-center justify-center gap-3 text-text-muted">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-card">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-text-muted">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <p className="text-sm font-medium">아직 주문 내역이 없습니다</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order, index) => {
            const timeStr = order.orderedAt.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });

            return (
              <div
                key={order.id}
                className="animate-card rb-card p-5"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                {/* 주문 헤더 */}
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-text-primary">주문 #{order.id}</span>
                    <span className={`rb-badge ${ORDER_STATUS_COLOR[order.status] ?? ""}`}>
                      {ORDER_STATUS_LABEL[order.status] ?? order.status}
                    </span>
                  </div>
                  <span className="text-xs text-text-muted">{timeStr}</span>
                </div>

                {/* 주문 아이템 */}
                <div className="flex flex-col gap-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text-primary">{item.menuName}</span>
                        <span className="text-text-muted">x{item.quantity}</span>
                        {item.options.length > 0 && (
                          <span className="text-[11px] text-text-muted">
                            ({item.options.map((o) => o.optionName).join(", ")})
                          </span>
                        )}
                      </div>
                      <span className="font-semibold text-text-secondary">{formatPrice(item.subTotal)}</span>
                    </div>
                  ))}
                </div>

                {/* 합계 */}
                <div className="mt-3 flex items-center justify-between border-t border-border-default pt-3">
                  <span className="text-sm text-text-muted">합계</span>
                  <span className="text-base font-extrabold text-text-primary">{formatPrice(order.totalPrice)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
