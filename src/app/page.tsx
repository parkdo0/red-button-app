"use client";

import { GAME_CATEGORIES } from "@/data/mock";
import GameCategoryRow from "@/components/GameCategoryRow";

/**
 * 추천 게임 홈 - 실제 레드버튼 앱 기준
 * 넷플릭스 스타일 카테고리별 가로 스크롤
 * 검색/필터 없음 (→ /search 페이지로 분리)
 */
export default function HomePage() {
  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      {/* 상단 안내 배너 */}
      <div className="mx-6 mt-5 mb-4 md:mx-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-bg-card border border-border-default px-4 py-2">
          <span className="text-xs text-text-secondary">
            보드게임이 처음이시라면, 이 게임 어떠세요?
          </span>
        </div>
      </div>

      {/* 카테고리별 추천 게임 행 */}
      <div className="flex flex-col gap-6 px-6 pb-8 md:px-8">
        {GAME_CATEGORIES.map((category) => (
          <GameCategoryRow
            key={category.id}
            category={category}
          />
        ))}
      </div>
    </div>
  );
}
