import { MenuCardSkeleton } from "@/components/Skeleton";

/**
 * 주문 페이지 로딩 스켈레톤 - 레드버튼 스타일
 */
export default function OrderLoading() {
  return (
    <div className="flex h-full flex-col px-6 py-6 md:px-8">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="skeleton-shimmer h-8 w-32 rounded-xl" />
        <div className="skeleton-shimmer mt-2 h-4 w-48 rounded-lg" />
      </div>

      {/* 탭 */}
      <div className="mb-6 flex gap-2.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton-shimmer h-11 w-24 rounded-full" />
        ))}
      </div>

      {/* 메뉴 카드 */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <MenuCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
