"use client";

import { FILTER_OPTIONS, DIFFICULTY_LABEL } from "@/data/mock";

export interface FilterState {
  playerCount: Set<string>;
  genre: Set<string>;
  difficulty: Set<string>;
}

interface Props {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const GROUP_LABELS: Record<string, string> = {
  playerCount: "👥 인원수",
  genre: "🎯 장르",
  difficulty: "📊 난이도",
};

/**
 * 게임 필터 사이드바
 * 태블릿 가로: 항상 표시 / 세로: 토글 버튼으로 열기
 */
export default function GameFilterSidebar({ filters, onChange, isOpen, onToggle }: Props) {
  const toggle = (group: keyof FilterState, value: string) => {
    const next = { ...filters };
    const set = new Set(next[group]);
    if (set.has(value)) set.delete(value);
    else set.add(value);
    next[group] = set;
    onChange(next);
  };

  const clearAll = () => {
    onChange({
      playerCount: new Set(),
      genre: new Set(),
      difficulty: new Set(),
    });
  };

  const hasAnyFilter =
    filters.playerCount.size > 0 ||
    filters.genre.size > 0 ||
    filters.difficulty.size > 0;

  const activeCount =
    filters.playerCount.size + filters.genre.size + filters.difficulty.size;

  return (
    <>
      {/* 필터 토글 버튼 (사이드바가 닫혀있을 때) */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed right-4 top-4 z-30 flex items-center gap-1.5 rounded-xl border border-border-default bg-bg-secondary px-3 py-2 text-sm font-medium text-text-secondary shadow-lg transition-colors hover:bg-bg-card touch-feedback lg:hidden"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="14" y2="12" />
            <line x1="4" y1="18" x2="9" y2="18" />
          </svg>
          필터
          {activeCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-primary text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </button>
      )}

      {/* 모바일 백드롭 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 animate-backdrop lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* 사이드바 본체 */}
      <aside
        className={`
          fixed right-0 top-0 z-30 h-full w-60 flex-shrink-0 flex-col border-l border-border-default bg-bg-secondary px-4 py-6
          transition-transform duration-300 ease-out
          lg:static lg:flex lg:translate-x-0
          ${isOpen ? "flex translate-x-0 animate-panel" : "hidden translate-x-full lg:flex"}
        `}
      >
        {/* 헤더 */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-bold text-text-primary">필터</h2>
          <div className="flex items-center gap-2">
            {hasAnyFilter && (
              <button
                onClick={clearAll}
                className="text-xs text-text-muted hover:text-red-primary transition-colors"
              >
                초기화
              </button>
            )}
            {/* 닫기 (모바일 전용) */}
            <button
              onClick={onToggle}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:bg-bg-card hover:text-text-primary transition-colors lg:hidden"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 인원수 */}
        <FilterGroup
          label={GROUP_LABELS.playerCount}
          options={FILTER_OPTIONS.player_count as unknown as string[]}
          selected={filters.playerCount}
          onToggle={(v) => toggle("playerCount", v)}
        />

        {/* 장르 */}
        <FilterGroup
          label={GROUP_LABELS.genre}
          options={FILTER_OPTIONS.genre as unknown as string[]}
          selected={filters.genre}
          onToggle={(v) => toggle("genre", v)}
        />

        {/* 난이도 */}
        <FilterGroup
          label={GROUP_LABELS.difficulty}
          options={FILTER_OPTIONS.difficulty as unknown as string[]}
          selected={filters.difficulty}
          onToggle={(v) => toggle("difficulty", v)}
          renderLabel={(v) => DIFFICULTY_LABEL[v] ?? v}
        />
      </aside>
    </>
  );
}

// ============================================
// 서브 컴포넌트
// ============================================

interface FilterGroupProps {
  label: string;
  options: string[];
  selected: Set<string>;
  onToggle: (value: string) => void;
  renderLabel?: (value: string) => string;
}

function FilterGroup({ label, options, selected, onToggle, renderLabel }: FilterGroupProps) {
  return (
    <div className="mb-5">
      <h3 className="mb-2 text-xs font-semibold text-text-secondary">{label}</h3>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const isActive = selected.has(opt);
          return (
            <button
              key={opt}
              onClick={() => onToggle(opt)}
              className={`
                rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors touch-feedback
                ${
                  isActive
                    ? "bg-red-primary/15 text-red-primary border border-red-primary/30"
                    : "bg-bg-card text-text-muted border border-transparent hover:bg-bg-card-hover"
                }
              `}
            >
              {renderLabel ? renderLabel(opt) : opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
