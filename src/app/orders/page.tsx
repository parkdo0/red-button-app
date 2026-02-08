import {
  MOCK_ORDERS,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_COLOR,
} from "@/data/mock-orders";
import { formatPrice } from "@/data/mock";
import Link from "next/link";

/**
 * 주문 내역 페이지
 * 현재 테이블의 주문 히스토리 확인
 */
export default function OrderHistoryPage() {
  const orders = MOCK_ORDERS;

  return (
    <div className="h-full overflow-y-auto px-6 py-5 md:px-8 md:py-6">
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary md:text-2xl">주문 내역</h1>
          <p className="mt-1 text-sm text-text-muted">A1 테이블</p>
        </div>
        <Link
          href="/order"
          className="rounded-xl bg-red-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-hover touch-feedback"
        >
          + 추가 주문
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="flex h-60 flex-col items-center justify-center gap-2 text-text-muted">
          <span className="text-4xl">📋</span>
          <p className="text-sm">아직 주문 내역이 없습니다</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order, index) => {
            // 주문 시간 포맷
            const orderedAt = new Date(order.orderedAt);
            const timeStr = orderedAt.toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={order.id}
                className="animate-card rounded-xl border border-border-default bg-bg-card p-5"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                {/* 주문 헤더 */}
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-text-primary">
                      주문 #{order.id}
                    </span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                        ORDER_STATUS_COLOR[order.status]
                      }`}
                    >
                      {ORDER_STATUS_LABEL[order.status]}
                    </span>
                  </div>
                  <span className="text-xs text-text-muted">{timeStr}</span>
                </div>

                {/* 주문 아이템 */}
                <div className="flex flex-col gap-2">
                  {order.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-text-primary">{item.menuName}</span>
                        <span className="text-text-muted">x{item.quantity}</span>
                        {item.options.length > 0 && (
                          <span className="text-xs text-text-muted">
                            ({item.options.map((o) => o.optionName).join(", ")})
                          </span>
                        )}
                      </div>
                      <span className="text-text-secondary">
                        {formatPrice(item.subTotal)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* 합계 */}
                <div className="mt-3 flex items-center justify-between border-t border-border-default pt-3">
                  <span className="text-sm text-text-muted">합계</span>
                  <span className="text-base font-bold text-text-primary">
                    {formatPrice(order.totalPrice)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
