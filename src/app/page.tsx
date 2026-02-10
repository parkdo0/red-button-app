"use client";

import { useState, useMemo } from "react";
import { MOCK_GAMES, type Game } from "@/data/mock";
import GameCategoryRow from "@/components/GameCategoryRow";
import GameFilterSidebar, { type FilterState } from "@/components/GameFilterSidebar";

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
      const match = game.tags.some((t) => t.group === "player_count" && filters.playerCount.has(t.value));
      if (!match) return false;
    }
    if (filters.genre.size > 0) {
      const match = game.tags.some((t) => t.group === "genre" && filters.genre.has(t.value));
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
  return Array.from(map.entries()).map(([category, games]) => ({ category, games }));
}

/**
 * 메인 페이지: 게임 찾기
 * 레드버튼 전용앱 스타일 - 검색 + 필터 + 카테고리별 추천
 */
export default function HomePage() {
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    playerCount: new Set(),
    genre: new Set(),
    difficulty: new Set(),
  });

  const filtered = useMemo(() => filterGames(MOCK_GAMES, filters, search), [filters, search]);
  const categories = useMemo(() => groupByCategory(filtered), [filtered]);

  const hasAnyFilter =
    filters.playerCount.size > 0 || filters.genre.size > 0 || filters.difficulty.size > 0 || search.trim().length > 0;

  return (
    <div className="flex h-full">
      {/* 게임 리스트 영역 */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6 md:px-8">
        {/* 헤더 영역 */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">게임 찾기</h1>
          </div>
          <p className="text-sm text-text-muted">
            {hasAnyFilter
              ? `${filtered.length}개의 게임이 검색되었습니다`
              : "수백 가지 보드게임 중 지금 플레이하기 좋은 게임을 찾아보세요"}
          </p>

          {/* 검색바 */}
          <div className="relative mt-4">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
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
              className="rb-input w-full py-3 pl-11 pr-10 text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-bg-elevated text-text-muted hover:text-text-primary transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* 카테고리별 가로 스크롤 */}
        {categories.length > 0 ? (
          <div className="flex flex-col gap-8">
            {categories.map(({ category, games }) => (
              <GameCategoryRow key={category} category={category} games={games} />
            ))}
          </div>
        ) : (
          <div className="flex h-60 flex-col items-center justify-center gap-3 text-text-muted">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-card">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-text-muted">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <p className="text-sm font-medium">조건에 맞는 게임이 없습니다</p>
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
