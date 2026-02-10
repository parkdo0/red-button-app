"use client";

/**
 * 스켈레톤 로딩 컴포넌트 - 레드버튼 스타일
 * 시머(shimmer) 효과 적용
 */

function Shimmer({ className }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-2xl ${className ?? ""}`} />;
}

export function GameCardSkeleton() {
  return (
    <div className="w-[180px] flex-shrink-0">
      <Shimmer className="aspect-[3/4] w-full" />
      <Shimmer className="mt-2.5 h-4 w-3/4 !rounded-lg" />
    </div>
  );
}

export function GameCategoryRowSkeleton() {
  return (
    <section>
      <div className="mb-3.5 flex items-center gap-2.5">
        <Shimmer className="h-5 w-1 !rounded-full" />
        <Shimmer className="h-5 w-24 !rounded-lg" />
      </div>
      <div className="flex gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <GameCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

export function MenuCardSkeleton() {
  return (
    <div className="flex gap-4 rounded-2xl border border-border-default bg-bg-card p-4">
      <Shimmer className="h-20 w-20 flex-shrink-0 !rounded-xl" />
      <div className="flex flex-1 flex-col justify-between py-0.5">
        <div>
          <Shimmer className="h-4 w-2/3 !rounded-lg" />
          <Shimmer className="mt-2 h-3 w-full !rounded-lg" />
        </div>
        <Shimmer className="h-5 w-1/3 !rounded-lg" />
      </div>
    </div>
  );
}

export function GameDetailSkeleton() {
  return (
    <div className="flex gap-8 px-8 py-6">
      <div className="flex-1">
        <Shimmer className="aspect-video w-full" />
        <Shimmer className="mt-6 h-8 w-1/3 !rounded-xl" />
        <div className="mt-3 flex gap-2">
          <Shimmer className="h-8 w-24 !rounded-xl" />
          <Shimmer className="h-8 w-20 !rounded-xl" />
          <Shimmer className="h-8 w-20 !rounded-xl" />
        </div>
        <Shimmer className="mt-4 h-4 w-full !rounded-lg" />
        <Shimmer className="mt-2 h-4 w-4/5 !rounded-lg" />
      </div>
      <div className="w-72">
        <Shimmer className="h-52" />
      </div>
    </div>
  );
}
