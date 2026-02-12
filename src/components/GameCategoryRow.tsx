"use client";

import { GameCategory } from "@/data/mock";
import GameCard from "@/components/GameCard";

interface Props {
  category: GameCategory;
}

/**
 * 넷플릭스 스타일 카테고리별 가로 스크롤 행
 * 실제 레드버튼 앱: 감성적인 카테고리 제목 (2줄 + 이모지)
 */
export default function GameCategoryRow({ category }: Props) {
  return (
    <section>
      {/* 카테고리 헤더 - 실제 앱처럼 멀티라인 + 이모지 */}
      <div className="mb-3.5 flex items-start gap-2.5">
        <div className="mt-1 h-8 w-1 flex-shrink-0 rounded-full bg-red-primary" />
        <div className="flex-1">
          <h2 className="text-[15px] font-bold text-text-primary leading-snug whitespace-pre-line">
            {category.title}
            <span className="ml-1">{category.emoji}</span>
          </h2>
          {category.subtitle && (
            <p className="mt-0.5 text-[11px] text-text-muted">{category.subtitle}</p>
          )}
        </div>
      </div>

      {/* 가로 스크롤 */}
      <div className="flex gap-3.5 overflow-x-auto scrollbar-hide scroll-smooth-x pb-3 -mx-1 px-1">
        {category.games.map((game, index) => (
          <GameCard key={game.id} game={game} index={index} />
        ))}
      </div>
    </section>
  );
}
