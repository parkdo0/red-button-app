import { MOCK_GAMES, DIFFICULTY_LABEL } from "@/data/mock";
import Link from "next/link";
import { notFound } from "next/navigation";
import YoutubePlayer from "@/components/YoutubePlayer";

interface Props {
  params: Promise<{ id: string }>;
}

const BADGE_CLASS: Record<string, string> = {
  EASY: "rb-badge rb-badge-easy",
  MEDIUM: "rb-badge rb-badge-medium",
  HARD: "rb-badge rb-badge-hard",
  EXPERT: "rb-badge rb-badge-expert",
};

/**
 * 게임 상세 페이지 - 레드버튼 스타일
 * 유튜브 영상 + 게임 정보 + 관련 게임 추천
 */
export default async function GameDetailPage({ params }: Props) {
  const { id } = await params;
  const game = MOCK_GAMES.find((g) => g.id === Number(id));

  if (!game) notFound();

  const similarGames = MOCK_GAMES.filter(
    (g) =>
      g.id !== game.id &&
      (g.categoryName === game.categoryName ||
        g.tags.some((t) => game.tags.some((gt) => gt.group === t.group && gt.value === t.value)))
  ).slice(0, 4);

  return (
    <div className="h-full overflow-y-auto scrollbar-thin px-6 py-6 md:px-8">
      {/* 뒤로 가기 */}
      <Link
        href="/"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-red-primary transition-colors touch-feedback"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        게임 목록
      </Link>

      {/* 메인 콘텐츠 */}
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        {/* 좌측: 영상 + 설명 */}
        <div className="flex-1 min-w-0">
          {/* 영상 래퍼 */}
          <div className="overflow-hidden rounded-2xl border border-border-default">
            <YoutubePlayer url={game.videoUrl ?? ""} />
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">{game.title}</h1>
              <span className={BADGE_CLASS[game.difficulty]}>{DIFFICULTY_LABEL[game.difficulty]}</span>
            </div>

            {/* 스펙 뱃지 */}
            <div className="mt-3 flex flex-wrap gap-2">
              <SpecBadge icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-red-primary"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>} text={`${game.minPlayers}~${game.maxPlayers}명`} />
              {game.playTime && <SpecBadge icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-red-primary"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>} text={`${game.playTime}분`} />}
              <SpecBadge icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-red-primary"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>} text={game.categoryName} />
            </div>

            <p className="mt-5 text-sm leading-relaxed text-text-secondary">{game.description}</p>

            {/* 태그 */}
            <div className="mt-4 flex flex-wrap gap-2">
              {game.tags.map((tag, i) => (
                <span key={i} className="rounded-xl bg-bg-card border border-border-default px-3 py-1 text-xs font-medium text-text-muted">
                  #{tag.value}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 우측: 게임 정보 + 관련 게임 */}
        <div className="w-full flex-shrink-0 lg:w-72">
          {/* 게임 스펙 카드 */}
          <div className="rb-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-4 w-1 rounded-full bg-red-primary" />
              <h2 className="text-[15px] font-bold text-text-primary">게임 정보</h2>
            </div>
            <div className="flex flex-col gap-3.5">
              <InfoRow label="인원" value={`${game.minPlayers}~${game.maxPlayers}명`} />
              {game.playTime && <InfoRow label="시간" value={`약 ${game.playTime}분`} />}
              <InfoRow label="난이도" value={DIFFICULTY_LABEL[game.difficulty]} />
              <InfoRow label="장르" value={game.categoryName} />
            </div>
          </div>

          {/* 관련 게임 */}
          {similarGames.length > 0 && (
            <div className="mt-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-4 w-1 rounded-full bg-red-primary" />
                <h2 className="text-[15px] font-bold text-text-primary">비슷한 게임</h2>
              </div>
              <div className="flex flex-col gap-2">
                {similarGames.map((sg) => (
                  <Link
                    key={sg.id}
                    href={`/games/${sg.id}`}
                    className="group flex items-center gap-3 rb-card rb-card-glow p-3 touch-feedback"
                  >
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-bg-elevated to-bg-secondary">
                      <span className="text-lg">🎲</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-text-primary group-hover:text-red-primary transition-colors">{sg.title}</p>
                      <p className="text-[11px] text-text-muted">{sg.minPlayers}~{sg.maxPlayers}인 · {DIFFICULTY_LABEL[sg.difficulty]}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SpecBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-xl bg-bg-card border border-border-default px-3 py-1.5 text-xs font-medium text-text-secondary">
      {icon}
      <span>{text}</span>
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="text-sm font-semibold text-text-primary">{value}</span>
    </div>
  );
}
