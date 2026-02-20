"use client";

import { FILTER_OPTIONS, DIFFICULTY_LABEL } from "@/data/constants";

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
  playerCount: "인원수",
  genre: "장르",
  difficulty: "난이도",
};

const GROUP_ICONS: Record<string, React.ReactNode> = {
  playerCount: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-red-primary">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
    </svg>
  ),
  genre: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-red-primary">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  ),
  difficulty: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-red-primary">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
    </svg>
  ),
};

/**
 * 게임 필터 사이드바 - 레드버튼 스타일
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
    onChange({ playerCount: new Set(), genre: new Set(), difficulty: new Set() });
  };

  const hasAnyFilter =
    filters.playerCount.size > 0 || filters.genre.size > 0 || filters.difficulty.size > 0;
  const activeCount =
    filters.playerCount.size + filters.genre.size + filters.difficulty.size;

  return (
    <>
      {/* 필터 토글 FAB (모바일 전용) */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed right-4 top-4 z-30 flex items-center gap-2 rounded-2xl border border-border-default bg-bg-secondary/95 backdrop-blur-sm px-4 py-2.5 text-sm font-semibold text-text-secondary shadow-xl transition-all hover:bg-bg-card hover:border-border-hover touch-feedback lg:hidden"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="14" y2="12" />
            <line x1="4" y1="18" x2="9" y2="18" />
          </svg>
          필터
          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-primary text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </button>
      )}

      {/* 백드롭 */}
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-[2px] animate-backdrop lg:hidden" onClick={onToggle} />
      )}

      {/* 사이드바 */}
      <aside
        className={`
          fixed right-0 top-0 z-30 h-full w-64 flex-shrink-0 flex-col border-l border-border-default bg-bg-secondary overflow-y-auto scrollbar-thin
          transition-transform duration-300 ease-out
          lg:static lg:flex lg:translate-x-0
          ${isOpen ? "flex translate-x-0 animate-panel" : "hidden translate-x-full lg:flex"}
        `}
      >
        {/* 헤더 */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border-default bg-bg-secondary/95 backdrop-blur-sm px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-1 rounded-full bg-red-primary" />
            <h2 className="text-sm font-bold text-text-primary tracking-tight">필터</h2>
          </div>
          <div className="flex items-center gap-3">
            {hasAnyFilter && (
              <button onClick={clearAll} className="text-[11px] font-medium text-red-primary hover:text-red-light transition-colors">
                초기화
              </button>
            )}
            <button
              onClick={onToggle}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:bg-bg-card hover:text-text-primary transition-colors lg:hidden"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-5 py-4 flex flex-col gap-5">
          <FilterGroup
            label={GROUP_LABELS.playerCount}
            icon={GROUP_ICONS.playerCount}
            options={FILTER_OPTIONS.playerCount as unknown as string[]}
            selected={filters.playerCount}
            onToggle={(v) => toggle("playerCount", v)}
          />
          <FilterGroup
            label={GROUP_LABELS.genre}
            icon={GROUP_ICONS.genre}
            options={FILTER_OPTIONS.genre as unknown as string[]}
            selected={filters.genre}
            onToggle={(v) => toggle("genre", v)}
          />
          <FilterGroup
            label={GROUP_LABELS.difficulty}
            icon={GROUP_ICONS.difficulty}
            options={FILTER_OPTIONS.difficulty as unknown as string[]}
            selected={filters.difficulty}
            onToggle={(v) => toggle("difficulty", v)}
            renderLabel={(v) => DIFFICULTY_LABEL[v as keyof typeof DIFFICULTY_LABEL] ?? v}
          />
        </div>
      </aside>
    </>
  );
}

/* 필터 그룹 서브컴포넌트 */
interface FilterGroupProps {
  label: string;
  icon: React.ReactNode;
  options: string[];
  selected: Set<string>;
  onToggle: (value: string) => void;
  renderLabel?: (value: string) => string;
}

function FilterGroup({ label, icon, options, selected, onToggle, renderLabel }: FilterGroupProps) {
  return (
    <div>
      <div className="mb-2.5 flex items-center gap-1.5">
        {icon}
        <h3 className="text-xs font-bold text-text-secondary tracking-wide uppercase">{label}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isActive = selected.has(opt);
          return (
            <button
              key={opt}
              onClick={() => onToggle(opt)}
              className={`
                rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-200 touch-feedback
                ${isActive
                  ? "bg-red-primary text-white shadow-md shadow-red-primary/20"
                  : "bg-bg-card text-text-muted border border-border-default hover:border-border-hover hover:text-text-secondary"
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
