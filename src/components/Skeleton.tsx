"use client";

/**
 * 스켈레톤 로딩 컴포넌트
 * DB 연동 후 데이터 로딩 시 사용
 */

/** 게임 카드 스켈레톤 */
export function GameCardSkeleton() {
  return (
    <div className="w-48 flex-shrink-0 animate-pulse">
      <div className="aspect-[3/4] rounded-xl bg-bg-card" />
      <div className="mt-2 h-4 w-3/4 rounded bg-bg-card" />
    </div>
  );
}

/** 카테고리 행 스켈레톤 */
export function GameCategoryRowSkeleton() {
  return (
    <section>
      <div className="mb-3 h-6 w-24 animate-pulse rounded bg-bg-card" />
      <div className="flex gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <GameCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

/** 메뉴 카드 스켈레톤 */
export function MenuCardSkeleton() {
  return (
    <div className="flex animate-pulse gap-4 rounded-xl border border-border-default bg-bg-card p-4">
      <div className="h-20 w-20 flex-shrink-0 rounded-lg bg-bg-secondary" />
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="h-4 w-2/3 rounded bg-bg-secondary" />
          <div className="mt-2 h-3 w-full rounded bg-bg-secondary" />
        </div>
        <div className="h-4 w-1/3 rounded bg-bg-secondary" />
      </div>
    </div>
  );
}

/** 게임 상세 스켈레톤 */
export function GameDetailSkeleton() {
  return (
    <div className="flex animate-pulse gap-8 px-8 py-6">
      <div className="flex-1">
        <div className="aspect-video w-full rounded-xl bg-bg-card" />
        <div className="mt-6 h-8 w-1/3 rounded bg-bg-card" />
        <div className="mt-3 h-4 w-full rounded bg-bg-card" />
        <div className="mt-2 h-4 w-4/5 rounded bg-bg-card" />
      </div>
      <div className="w-72">
        <div className="h-48 rounded-xl bg-bg-card" />
      </div>
    </div>
  );
}
