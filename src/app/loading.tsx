import { GameCategoryRowSkeleton } from "@/components/Skeleton";

/**
 * 메인 페이지 로딩 스켈레톤 - 레드버튼 스타일
 */
export default function HomeLoading() {
  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto px-6 py-6 md:px-8">
        {/* 헤더 스켈레톤 */}
        <div className="mb-6">
          <div className="skeleton-shimmer h-8 w-32 rounded-xl" />
          <div className="skeleton-shimmer mt-2 h-4 w-64 rounded-lg" />
          <div className="skeleton-shimmer mt-4 h-12 w-full rounded-2xl" />
        </div>

        {/* 카테고리 행 */}
        <div className="flex flex-col gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <GameCategoryRowSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* 필터 사이드바 스켈레톤 */}
      <aside className="hidden w-64 border-l border-border-default bg-bg-secondary lg:block">
        <div className="border-b border-border-default px-5 py-4">
          <div className="skeleton-shimmer h-5 w-12 rounded-lg" />
        </div>
        <div className="px-5 py-4 flex flex-col gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <div className="skeleton-shimmer mb-2.5 h-4 w-16 rounded-lg" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="skeleton-shimmer h-8 w-16 rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
