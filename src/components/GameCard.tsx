"use client";

import Link from "next/link";
import { Game, DIFFICULTY_LABEL } from "@/data/constants";

interface Props {
  game: Game;
  index?: number;
}

/** 난이도별 뱃지 색상 */
const BADGE_CLASS: Record<string, string> = {
  VERY_EASY: "bg-green-badge/15 text-green-badge",
  EASY: "bg-green-badge/15 text-green-badge",
  NORMAL: "bg-yellow-badge/15 text-yellow-badge",
  SEMI_HARD: "bg-orange-badge/15 text-orange-badge",
  HARD: "bg-orange-badge/15 text-orange-badge",
  EXTREME: "bg-red-primary/15 text-red-primary",
};

/**
 * 게임 카드 - 실제 레드버튼 앱 기준
 * 가로 스크롤용 카드: 썸네일 + 태그 + 난이도·인원 정보
 */
export default function GameCard({ game, index = 0 }: Props) {
  return (
    <Link
      href={`/games/${game.id}`}
      className="group flex-shrink-0 w-[220px] animate-card touch-feedback"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* 썸네일 */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl rb-card rb-card-glow">
        {/* 그라데이션 배경 (이미지 대체) */}
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-bg-elevated via-bg-card to-bg-secondary">
          <span className="text-4xl opacity-60 transition-transform duration-300 group-hover:scale-110"></span>
        </div>

        {/* 하단 그라데이션 + 게임 이름 */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-2.5 pt-8">
          <h3 className="text-[14px] font-bold text-white leading-tight truncate">
            {game.title}
          </h3>
        </div>
      </div>

      {/* 해시태그 */}
      {game.hashtags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1 px-0.5">
          {game.hashtags.slice(0, 3).map((tag, i) => (
            <span key={i} className="text-[10px] text-text-muted">
              {i > 0 && <span className="mx-0.5 text-border-default">·</span>}
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* 난이도 + 인원 */}
      <div className="mt-1.5 flex items-center gap-1.5 px-0.5">
        <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold ${BADGE_CLASS[game.difficulty]}`}>
          {DIFFICULTY_LABEL[game.difficulty]}
        </span>
        <span className="text-[10px] text-text-muted">·</span>
        <span className="flex items-center gap-0.5 text-[10px] text-text-muted">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
          </svg>
          {game.recommendedPlayers} 추천
        </span>
      </div>
    </Link>
  );
}
