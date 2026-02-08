"use client";

import { Game } from "@/data/mock";
import GameCard from "@/components/GameCard";

interface Props {
  category: string;
  games: Game[];
}

/**
 * 넷플릭스 스타일 카테고리별 가로 스크롤 행
 */
export default function GameCategoryRow({ category, games }: Props) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-text-primary">
        🎲 {category}
      </h2>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth-x pb-2">
        {games.map((game, index) => (
          <GameCard key={game.id} game={game} index={index} />
        ))}
      </div>
    </section>
  );
}
