"use client";

import { useState, useMemo } from "react";
import { DIFFICULTY_LABEL, type Game, type Difficulty } from "@/data/constants";
import GameSearchCard from "@/components/GameSearchCard";

/** DB에서 로드한 필터 옵션 */
interface FilterOptionsFromDB {
  genre: string[];
  playerCount: string[];
  playTime: string[];
}

interface Props {
  initialGames: Game[];
  filterOptions: FilterOptionsFromDB;
}

interface FilterState {
  genre: Set<string>;
  playerCount: Set<string>;
  difficulty: Set<string>;
  playTime: Set<string>;
}

const EMPTY_FILTER: FilterState = {
  genre: new Set(),
  playerCount: new Set(),
  difficulty: new Set(),
  playTime: new Set(),
};

/** 난이도는 enum 고정 */
const DIFFICULTY_OPTIONS: Difficulty[] = ["VERY_EASY", "EASY", "NORMAL", "SEMI_HARD", "HARD", "EXTREME"];

const CHO_SUNG = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];

function getChosung(str: string): string {
  return str.split("").map((ch) => {
    const code = ch.charCodeAt(0) - 0xAC00;
    if (code < 0 || code > 11171) return ch;
    return CHO_SUNG[Math.floor(code / 588)];
  }).join("");
}

function isChosungOnly(str: string): boolean {
  return /^[ㄱ-ㅎ]+$/.test(str);
}

function filterGames(games: Game[], filters: FilterState, search: string): Game[] {
  const keyword = search.trim().toLowerCase();
  return games.filter((game) => {
    if (keyword) {
      if (isChosungOnly(keyword)) {
        if (!getChosung(game.title).includes(keyword)) return false;
      } else {
        if (!game.title.toLowerCase().includes(keyword) && !game.description.toLowerCase().includes(keyword)) return false;
      }
    }
    if (filters.genre.size > 0 && !game.tags.some((t) => t.group === "genre" && filters.genre.has(t.value))) return false;
    if (filters.playerCount.size > 0 && !game.tags.some((t) => t.group === "player_count" && filters.playerCount.has(t.value))) return false;
    if (filters.difficulty.size > 0 && !filters.difficulty.has(game.difficulty)) return false;
    if (filters.playTime.size > 0 && !filters.playTime.has(game.playTimeCategory)) return false;
    return true;
  });
}

export default function SearchClient({ initialGames, filterOptions }: Props) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTER);

  const hasAnyFilter = filters.genre.size > 0 || filters.playerCount.size > 0 || filters.difficulty.size > 0 || filters.playTime.size > 0;
  const isSearchActive = search.trim().length > 0 || hasAnyFilter;
  const results = useMemo(() => filterGames(initialGames, filters, search), [initialGames, filters, search]);

  const suggestedGames = useMemo(() => {
    if (results.length > 0 || !isSearchActive) return [];
    if (filters.genre.size > 0) {
      return initialGames.filter((g) => g.tags.some((t) => t.group === "genre" && filters.genre.has(t.value))).slice(0, 7);
    }
    return initialGames.slice(0, 7);
  }, [results, isSearchActive, filters.genre, initialGames]);

  const toggle = (group: keyof FilterState, value: string) => {
    setFilters((prev) => {
      const next = { ...prev };
      const set = new Set(next[group]);
      if (set.has(value)) set.delete(value); else set.add(value);
      next[group] = set;
      return next;
    });
  };

  const clearAll = () => setFilters(EMPTY_FILTER);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="sticky top-0 z-10 bg-bg-primary/95 backdrop-blur-sm px-6 pt-5 pb-3 md:px-8">
          <div className="relative">
            <input type="text" placeholder="게임 이름(초성 가능)으로 검색" value={search} onChange={(e) => setSearch(e.target.value)} className="rb-input w-full py-3 pl-4 pr-12 text-sm" />
            <button className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-xl bg-red-primary text-white touch-feedback">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </button>
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-12 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-bg-elevated text-text-muted hover:text-text-primary transition-colors">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            )}
          </div>
        </div>

        {!isSearchActive ? (
          <div className="px-6 pb-8 md:px-8">
            <FilterSection filters={filters} onToggle={toggle} onClear={clearAll} hasAnyFilter={hasAnyFilter} filterOptions={filterOptions} />
          </div>
        ) : (
          <div className="px-6 pb-8 md:px-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold text-text-muted mr-1">게임 시간</span>
              {filterOptions.playTime.map((opt) => (
                <button key={opt} onClick={() => toggle("playTime", opt)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all touch-feedback ${filters.playTime.has(opt) ? "bg-red-primary text-white" : "bg-bg-card text-text-muted border border-border-default hover:border-border-hover"}`}>
                  {opt}
                </button>
              ))}
            </div>
            <div className="mb-3">
              <span className="text-sm font-bold text-text-primary">검색 결과 <span className="text-red-primary">{results.length}</span></span>
            </div>
            {results.length > 0 ? (
              <div className="flex flex-col gap-3">
                {results.map((game, index) => (<GameSearchCard key={game.id} game={game} index={index} />))}
              </div>
            ) : (
              <>
                <div className="flex h-20 items-center justify-center text-sm text-text-muted">조건에 맞는 게임이 없습니다</div>
                {suggestedGames.length > 0 && (
                  <div className="mt-2">
                    <div className="mb-3"><span className="text-sm font-bold text-text-primary">연관 추천 게임 <span className="text-red-primary">{suggestedGames.length}</span></span></div>
                    <div className="flex flex-col gap-3">
                      {suggestedGames.map((game, index) => (<GameSearchCard key={game.id} game={game} index={index} />))}
                    </div>
                  </div>
                )}
              </>
            )}
            {hasAnyFilter && (
              <button onClick={clearAll} className="mt-4 w-full rounded-xl border border-border-default py-2.5 text-sm font-medium text-text-muted hover:text-red-primary hover:border-red-primary/30 transition-colors touch-feedback">필터 초기화</button>
            )}
          </div>
        )}
      </div>
      <button className="fixed right-6 bottom-6 flex h-12 w-12 items-center justify-center rounded-full bg-bg-card border border-border-default shadow-lg touch-feedback hover:border-red-primary/30 transition-colors">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-red-primary"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
      </button>
    </div>
  );
}

// ── Filter UI Components ──

function FilterSection({ filters, onToggle, onClear, hasAnyFilter, filterOptions }: { filters: FilterState; onToggle: (g: keyof FilterState, v: string) => void; onClear: () => void; hasAnyFilter: boolean; filterOptions: FilterOptionsFromDB }) {
  return (
    <div className="flex flex-col gap-6">
      <FilterGroup label="장르/테마" options={filterOptions.genre} selected={filters.genre} onToggle={(v) => onToggle("genre", v)} />
      <FilterGroup label="인원수" options={filterOptions.playerCount} selected={filters.playerCount} onToggle={(v) => onToggle("playerCount", v)} />
      <FilterGroup label="난이도" options={DIFFICULTY_OPTIONS} selected={filters.difficulty} onToggle={(v) => onToggle("difficulty", v)} renderLabel={(v) => DIFFICULTY_LABEL[v as Difficulty] ?? v} />
      <FilterGroup label="게임 시간" options={filterOptions.playTime} selected={filters.playTime} onToggle={(v) => onToggle("playTime", v)} />
      {hasAnyFilter && (
        <div className="flex gap-3 pt-2">
          <button onClick={onClear} className="flex-1 rounded-xl border border-border-default py-2.5 text-sm font-medium text-text-muted hover:text-text-primary transition-colors touch-feedback">초기화</button>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ label, options, selected, onToggle, renderLabel }: { label: string; options: string[]; selected: Set<string>; onToggle: (v: string) => void; renderLabel?: (v: string) => string }) {
  return (
    <div>
      <h3 className="mb-2.5 text-sm font-bold text-text-primary">{label}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button key={opt} onClick={() => onToggle(opt)} className={`rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-150 touch-feedback ${selected.has(opt) ? "bg-red-primary text-white shadow-sm" : "bg-bg-card text-text-secondary border border-border-default hover:border-border-hover hover:text-text-primary"}`}>
            {renderLabel ? renderLabel(opt) : opt}
          </button>
        ))}
      </div>
    </div>
  );
}
