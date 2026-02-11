/**
 * 주문 내역 로딩 스켈레톤 - 레드버튼 스타일
 */
export default function OrdersLoading() {
  return (
    <div className="h-full overflow-y-auto px-6 py-6 md:px-8">
      <div className="mb-6">
        <div className="skeleton-shimmer h-8 w-32 rounded-xl" />
        <div className="skeleton-shimmer mt-2 h-4 w-20 rounded-lg" />
      </div>

      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rb-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="skeleton-shimmer h-5 w-24 rounded-lg" />
              <div className="skeleton-shimmer h-4 w-16 rounded-lg" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="skeleton-shimmer h-4 w-full rounded-lg" />
              <div className="skeleton-shimmer h-4 w-3/4 rounded-lg" />
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border-default pt-3">
              <div className="skeleton-shimmer h-4 w-12 rounded-lg" />
              <div className="skeleton-shimmer h-5 w-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
