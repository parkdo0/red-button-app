"use client";

import Link from "next/link";
import { Game, DIFFICULTY_LABEL } from "@/data/mock";

interface Props {
  game: Game;
  index?: number;
}

/**
 * 게임 검색 결과 카드 - 실제 레드버튼 앱 기준
 * 가로형: 좌측 썸네일 | 중앙 설명+해시태그 | 우측 스펙 테이블
 */
export default function GameSearchCard({ game, index = 0 }: Props) {
  const genres = game.tags
    .filter((t) => t.group === "genre")
    .map((t) => t.value);

  return (
    <Link
      href={`/games/${game.id}`}
      className="group flex gap-4 rounded-2xl rb-card rb-card-glow p-4 animate-card touch-feedback"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* 좌측: 게임 이미지 (정사각형) */}
      <div className="flex h-[100px] w-[100px] flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-bg-elevated via-bg-card to-bg-secondary">
        <span className="text-4xl opacity-60 transition-transform duration-300 group-hover:scale-110">🎲</span>
      </div>

      {/* 중앙: 게임명 + 설명 + 해시태그 */}
      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div>
          <h3 className="text-[15px] font-bold text-text-primary group-hover:text-red-primary transition-colors leading-tight">
            {game.title}
          </h3>
          <p className="mt-1 text-xs text-text-secondary line-clamp-2 leading-relaxed">
            {game.description}
          </p>
        </div>
        {/* 해시태그 (빨간색) */}
        {game.hashtags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {game.hashtags.map((tag, i) => (
              <span key={i} className="text-[11px] font-medium text-red-primary">
                #{tag}
                {i < game.hashtags.length - 1 && (
                  <span className="mx-0.5 text-text-muted">·</span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 우측: 스펙 테이블 */}
      <div className="hidden flex-shrink-0 sm:flex sm:w-[160px] flex-col gap-1.5 py-0.5 text-[11px]">
        <SpecRow label="장르/테마" value={genres.slice(0, 2).join(", ")} />
        <SpecRow label="추천 인원" value={game.recommendedPlayers} />
        <SpecRow label="가능 인원" value={`${game.minPlayers}-${game.maxPlayers}인`} />
        <SpecRow label="난이도" value={DIFFICULTY_LABEL[game.difficulty]} />
        <SpecRow label="진열 위치" value={game.shelfLocation} highlight />
      </div>
    </Link>
  );
}

/** 스펙 행 */
function SpecRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-text-muted whitespace-nowrap">{label}</span>
      <span className={`font-semibold text-right ${highlight ? "text-red-primary" : "text-text-primary"}`}>
        {value}
      </span>
    </div>
  );
}
