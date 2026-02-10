"use client";

import Link from "next/link";
import { Game, DIFFICULTY_LABEL } from "@/data/mock";

interface Props {
  game: Game;
  index?: number;
}

const BADGE_CLASS: Record<string, string> = {
  EASY: "rb-badge rb-badge-easy",
  MEDIUM: "rb-badge rb-badge-medium",
  HARD: "rb-badge rb-badge-hard",
  EXPERT: "rb-badge rb-badge-expert",
};

/**
 * 게임 카드 - 레드버튼 스타일
 * 넷플릭스형 가로 스크롤 리스트 아이템
 */
export default function GameCard({ game, index = 0 }: Props) {
  return (
    <Link
      href={`/games/${game.id}`}
      className="group flex-shrink-0 w-[180px] animate-card touch-feedback"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* 썸네일 */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl rb-card rb-card-glow">
        {/* 그라데이션 배경 */}
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-bg-elevated via-bg-card to-bg-secondary">
          <span className="text-5xl opacity-60 transition-transform duration-300 group-hover:scale-110">🎲</span>
        </div>

        {/* 난이도 뱃지 */}
        <span className={`absolute top-3 right-3 ${BADGE_CLASS[game.difficulty]}`}>
          {DIFFICULTY_LABEL[game.difficulty]}
        </span>

        {/* 하단 그라데이션 + 정보 */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-3 pt-10">
          <div className="flex items-center gap-2.5 text-[11px] text-white/75">
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
              {game.minPlayers}~{game.maxPlayers}인
            </span>
            {game.playTime && (
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                {game.playTime}분
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 타이틀 */}
      <h3 className="mt-2.5 truncate text-[13px] font-semibold text-text-primary transition-colors group-hover:text-red-primary">
        {game.title}
      </h3>
    </Link>
  );
}
