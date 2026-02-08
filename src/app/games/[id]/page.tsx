import { MOCK_GAMES, DIFFICULTY_LABEL } from "@/data/mock";
import Link from "next/link";
import { notFound } from "next/navigation";
import YoutubePlayer from "@/components/YoutubePlayer";

interface Props {
  params: Promise<{ id: string }>;
}

/** 난이도 색상 */
const DIFF_COLOR: Record<string, string> = {
  EASY: "bg-green-600/20 text-green-400",
  MEDIUM: "bg-yellow-600/20 text-yellow-400",
  HARD: "bg-orange-600/20 text-orange-400",
  EXPERT: "bg-red-600/20 text-red-400",
};

/**
 * 게임 상세 페이지
 * 유튜브 영상 + 게임 정보 + 관련 게임 추천
 */
export default async function GameDetailPage({ params }: Props) {
  const { id } = await params;
  const game = MOCK_GAMES.find((g) => g.id === Number(id));

  if (!game) notFound();

  // 관련 게임: 같은 카테고리 또는 같은 태그를 가진 다른 게임
  const similarGames = MOCK_GAMES.filter(
    (g) =>
      g.id !== game.id &&
      (g.categoryName === game.categoryName ||
        g.tags.some((t) =>
          game.tags.some((gt) => gt.group === t.group && gt.value === t.value)
        ))
  ).slice(0, 4);

  return (
    <div className="h-full overflow-y-auto px-6 py-5 md:px-8 md:py-6">
      {/* 뒤로 가기 */}
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors touch-feedback"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        게임 목록
      </Link>

      {/* 메인 콘텐츠: 가로 배치 (태블릿 기준) */}
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        {/* 좌측: 영상 + 설명 */}
        <div className="flex-1 min-w-0">
          <YoutubePlayer url={game.videoUrl ?? ""} />

          <div className="mt-5">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-text-primary md:text-2xl">
                {game.title}
              </h1>
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-medium ${DIFF_COLOR[game.difficulty]}`}
              >
                {DIFFICULTY_LABEL[game.difficulty]}
              </span>
            </div>

            {/* 빠른 스펙 뱃지 (모바일 친화) */}
            <div className="mt-3 flex flex-wrap gap-2">
              <SpecBadge icon="👥" text={`${game.minPlayers}~${game.maxPlayers}명`} />
              {game.playTime && <SpecBadge icon="⏱" text={`${game.playTime}분`} />}
              <SpecBadge icon="🎯" text={game.categoryName} />
            </div>

            <p className="mt-4 text-sm leading-relaxed text-text-secondary">
              {game.description}
            </p>

            {/* 태그 */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {game.tags.map((tag, i) => (
                <span
                  key={i}
                  className="rounded-md bg-bg-card px-2.5 py-1 text-xs text-text-muted"
                >
                  #{tag.value}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 우측: 게임 정보 + 관련 게임 */}
        <div className="w-full flex-shrink-0 lg:w-72">
          {/* 게임 스펙 카드 */}
          <div className="rounded-xl border border-border-default bg-bg-card p-5">
            <h2 className="mb-4 text-base font-semibold text-text-primary">게임 정보</h2>
            <div className="flex flex-col gap-3">
              <InfoRow label="인원" value={`${game.minPlayers}~${game.maxPlayers}명`} />
              {game.playTime && <InfoRow label="시간" value={`약 ${game.playTime}분`} />}
              <InfoRow label="난이도" value={DIFFICULTY_LABEL[game.difficulty]} />
              <InfoRow label="장르" value={game.categoryName} />
            </div>
          </div>

          {/* 관련 게임 */}
          {similarGames.length > 0 && (
            <div className="mt-5">
              <h2 className="mb-3 text-base font-semibold text-text-primary">
                비슷한 게임
              </h2>
              <div className="flex flex-col gap-2">
                {similarGames.map((sg) => (
                  <Link
                    key={sg.id}
                    href={`/games/${sg.id}`}
                    className="flex items-center gap-3 rounded-lg border border-border-default bg-bg-card p-3 transition-colors hover:border-red-primary/50 hover:bg-bg-card-hover touch-feedback"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-bg-secondary">
                      <span className="text-lg">🎲</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-text-primary">{sg.title}</p>
                      <p className="text-xs text-text-muted">
                        {sg.minPlayers}~{sg.maxPlayers}인 · {DIFFICULTY_LABEL[sg.difficulty]}
                      </p>
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

/** 스펙 뱃지 */
function SpecBadge({ icon, text }: { icon: string; text: string }) {
  return (
    <span className="flex items-center gap-1 rounded-lg bg-bg-card px-2.5 py-1.5 text-xs text-text-secondary">
      <span>{icon}</span>
      <span>{text}</span>
    </span>
  );
}

/** 정보 행 */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="text-sm font-medium text-text-primary">{value}</span>
    </div>
  );
}
