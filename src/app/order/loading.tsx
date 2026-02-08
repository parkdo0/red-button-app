import { MenuCardSkeleton } from "@/components/Skeleton";

/**
 * 주문 페이지 로딩 스켈레톤
 */
export default function OrderLoading() {
  return (
    <div className="flex h-full flex-col px-6 py-5 md:px-8 md:py-6">
      {/* 헤더 스켈레톤 */}
      <div className="mb-5 animate-pulse">
        <div className="h-7 w-28 rounded bg-bg-card" />
        <div className="mt-2 h-4 w-48 rounded bg-bg-card" />
      </div>

      {/* 탭 스켈레톤 */}
      <div className="mb-5 flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 w-20 animate-pulse rounded-full bg-bg-card" />
        ))}
      </div>

      {/* 메뉴 카드 스켈레톤 */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <MenuCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
