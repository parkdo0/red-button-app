"use client";

import { useState, useMemo } from "react";
import { MOCK_GAMES, type Game } from "@/data/mock";
import GameCategoryRow from "@/components/GameCategoryRow";
import GameFilterSidebar, {
  type FilterState,
} from "@/components/GameFilterSidebar";

/** 필터 + 검색 조건에 맞는 게임만 반환 */
function filterGames(games: Game[], filters: FilterState, search: string): Game[] {
  const keyword = search.trim().toLowerCase();

  return games.filter((game) => {
    if (keyword) {
      const matchSearch =
        game.title.toLowerCase().includes(keyword) ||
        game.description.toLowerCase().includes(keyword) ||
        game.categoryName.toLowerCase().includes(keyword);
      if (!matchSearch) return false;
    }

    if (filters.playerCount.size > 0) {
      const match = game.tags.some(
        (t) => t.group === "player_count" && filters.playerCount.has(t.value)
      );
      if (!match) return false;
    }

    if (filters.genre.size > 0) {
      const match = game.tags.some(
        (t) => t.group === "genre" && filters.genre.has(t.value)
      );
      if (!match) return false;
    }

    if (filters.difficulty.size > 0) {
      if (!filters.difficulty.has(game.difficulty)) return false;
    }

    return true;
  });
}

/** 카테고리별 그룹핑 */
function groupByCategory(games: Game[]): { category: string; games: Game[] }[] {
  const map = new Map<string, Game[]>();
  for (const game of games) {
    const list = map.get(game.categoryName) ?? [];
    list.push(game);
    map.set(game.categoryName, list);
  }
  return Array.from(map.entries()).map(([category, games]) => ({
    category,
    games,
  }));
}

/**
 * 메인 페이지: 게임 찾기
 * 검색 + 필터 + 넷플릭스 스타일 카테고리별 가로 스크롤
 */
export default function HomePage() {
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    playerCount: new Set(),
    genre: new Set(),
    difficulty: new Set(),
  });

  const filtered = useMemo(
    () => filterGames(MOCK_GAMES, filters, search),
    [filters, search]
  );
  const categories = useMemo(() => groupByCategory(filtered), [filtered]);

  const hasAnyFilter =
    filters.playerCount.size > 0 ||
    filters.genre.size > 0 ||
    filters.difficulty.size > 0 ||
    search.trim().length > 0;

  return (
    <div className="flex h-full">
      {/* 게임 리스트 영역 */}
      <div className="flex-1 overflow-y-auto px-6 py-5 md:px-8 md:py-6">
        {/* 헤더 + 검색 */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-text-primary md:text-2xl">게임 찾기</h1>
          <p className="mt-1 text-sm text-text-muted">
            {hasAnyFilter
              ? `${filtered.length}개의 게임이 검색되었습니다`
              : "카테고리별로 보드게임을 둘러보세요"}
          </p>

          {/* 검색바 */}
          <div className="relative mt-4">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="게임 이름으로 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border-default bg-bg-card py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-red-primary/50"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 카테고리별 가로 스크롤 행 */}
        {categories.length > 0 ? (
          <div className="flex flex-col gap-7">
            {categories.map(({ category, games }) => (
              <GameCategoryRow
                key={category}
                category={category}
                games={games}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-60 flex-col items-center justify-center gap-2 text-text-muted">
            <span className="text-4xl">🔍</span>
            <p className="text-sm">조건에 맞는 게임이 없습니다</p>
            <p className="text-xs">필터를 조정하거나 검색어를 변경해보세요</p>
          </div>
        )}
      </div>

      {/* 사이드바 필터 */}
      <GameFilterSidebar
        filters={filters}
        onChange={setFilters}
        isOpen={filterOpen}
        onToggle={() => setFilterOpen((prev) => !prev)}
      />
    </div>
  );
}
