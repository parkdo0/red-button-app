/**
 * 주문 내역 페이지 로딩 스켈레톤
 */
export default function OrdersLoading() {
  return (
    <div className="h-full overflow-y-auto px-6 py-5 md:px-8 md:py-6">
      <div className="mb-6 animate-pulse">
        <div className="h-7 w-28 rounded bg-bg-card" />
        <div className="mt-2 h-4 w-20 rounded bg-bg-card" />
      </div>

      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-border-default bg-bg-card p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="h-5 w-24 rounded bg-bg-secondary" />
              <div className="h-4 w-16 rounded bg-bg-secondary" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-4 w-full rounded bg-bg-secondary" />
              <div className="h-4 w-3/4 rounded bg-bg-secondary" />
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border-default pt-3">
              <div className="h-4 w-12 rounded bg-bg-secondary" />
              <div className="h-5 w-20 rounded bg-bg-secondary" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
