"use client";

import Link from "next/link";
import { Game, DIFFICULTY_LABEL } from "@/data/mock";

interface Props {
  game: Game;
  index?: number;
}

const DIFFICULTY_COLOR: Record<string, string> = {
  EASY: "bg-green-600/20 text-green-400",
  MEDIUM: "bg-yellow-600/20 text-yellow-400",
  HARD: "bg-orange-600/20 text-orange-400",
  EXPERT: "bg-red-600/20 text-red-400",
};

/**
 * 게임 카드 (가로 스크롤 리스트 내 아이템)
 */
export default function GameCard({ game, index = 0 }: Props) {
  return (
    <Link
      href={`/games/${game.id}`}
      className="group flex-shrink-0 w-48 animate-card touch-feedback"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* 썸네일 */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-bg-card transition-transform duration-200 group-hover:scale-[1.03]">
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-bg-card to-bg-card-hover">
          <span className="text-4xl">🎲</span>
        </div>

        {/* 난이도 뱃지 */}
        <span
          className={`absolute top-2 right-2 rounded-md px-2 py-0.5 text-xs font-medium ${DIFFICULTY_COLOR[game.difficulty]}`}
        >
          {DIFFICULTY_LABEL[game.difficulty]}
        </span>

        {/* 하단 그라데이션 */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />

        {/* 인원 / 시간 */}
        <div className="absolute bottom-2 left-2 flex items-center gap-2 text-xs text-white/80">
          <span>👥 {game.minPlayers}~{game.maxPlayers}인</span>
          {game.playTime && <span>⏱ {game.playTime}분</span>}
        </div>
      </div>

      {/* 타이틀 */}
      <h3 className="mt-2 truncate text-sm font-medium text-text-primary group-hover:text-red-primary transition-colors">
        {game.title}
      </h3>
    </Link>
  );
}
