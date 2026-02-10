"use client";

import { Game } from "@/data/mock";
import GameCard from "@/components/GameCard";

interface Props {
  category: string;
  games: Game[];
}

/**
 * 넷플릭스 스타일 카테고리별 가로 스크롤 행
 * 레드버튼 디자인: 카테고리 헤더 + 좌측 레드 포인트
 */
export default function GameCategoryRow({ category, games }: Props) {
  return (
    <section>
      {/* 카테고리 헤더 */}
      <div className="mb-3.5 flex items-center gap-2.5">
        <div className="h-5 w-1 rounded-full bg-red-primary" />
        <h2 className="text-[17px] font-bold text-text-primary tracking-tight">
          {category}
        </h2>
        <span className="text-xs text-text-muted">{games.length}</span>
      </div>

      {/* 가로 스크롤 */}
      <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth-x pb-3 -mx-1 px-1">
        {games.map((game, index) => (
          <GameCard key={game.id} game={game} index={index} />
        ))}
      </div>
    </section>
  );
}
