import { GameCategoryRowSkeleton } from "@/components/Skeleton";

/**
 * 메인 페이지 로딩 스켈레톤
 */
export default function HomeLoading() {
  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto px-6 py-5 md:px-8 md:py-6">
        {/* 헤더 스켈레톤 */}
        <div className="mb-5 animate-pulse">
          <div className="h-7 w-28 rounded bg-bg-card" />
          <div className="mt-2 h-4 w-56 rounded bg-bg-card" />
          <div className="mt-4 h-10 w-full rounded-xl bg-bg-card" />
        </div>

        {/* 카테고리 행 스켈레톤 */}
        <div className="flex flex-col gap-7">
          {Array.from({ length: 3 }).map((_, i) => (
            <GameCategoryRowSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* 필터 사이드바 스켈레톤 */}
      <aside className="hidden w-60 border-l border-border-default bg-bg-secondary px-4 py-6 lg:block">
        <div className="animate-pulse">
          <div className="mb-5 h-5 w-12 rounded bg-bg-card" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="mb-5">
              <div className="mb-2 h-4 w-16 rounded bg-bg-card" />
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-8 w-14 rounded-lg bg-bg-card" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
