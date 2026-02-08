"use client";

/**
 * 유튜브 영상 플레이어
 * URL에서 videoId를 추출하여 iframe으로 임베드
 */
interface Props {
  url: string;
}

/** 유튜브 URL에서 videoId 추출 */
function extractVideoId(url: string): string | null {
  try {
    // youtube.com/watch?v=xxx
    const urlObj = new URL(url);
    if (urlObj.hostname.includes("youtube.com")) {
      return urlObj.searchParams.get("v");
    }
    // youtu.be/xxx
    if (urlObj.hostname === "youtu.be") {
      return urlObj.pathname.slice(1);
    }
  } catch {
    // URL 파싱 실패
  }
  return null;
}

export default function YoutubePlayer({ url }: Props) {
  const videoId = extractVideoId(url);

  if (!videoId) {
    // 유효하지 않은 URL → 플레이스홀더
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-bg-card">
        <div className="flex flex-col items-center gap-2 text-text-muted">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          <span className="text-sm">영상을 불러올 수 없습니다</span>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
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
