"use client";

/**
 * 유튜브 영상 플레이어 - 레드버튼 스타일
 */
interface Props {
  url: string;
}

function extractVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes("youtube.com")) return urlObj.searchParams.get("v");
    if (urlObj.hostname === "youtu.be") return urlObj.pathname.slice(1);
  } catch { /* URL 파싱 실패 */ }
  return null;
}

export default function YoutubePlayer({ url }: Props) {
  const videoId = extractVideoId(url);

  if (!videoId) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-gradient-to-br from-bg-elevated to-bg-card">
        <div className="flex flex-col items-center gap-3 text-text-muted">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-secondary">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
          <span className="text-sm font-medium">영상을 불러올 수 없습니다</span>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
      <iframe
        className="h-full w-full"
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
        title="게임 소개 영상"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
