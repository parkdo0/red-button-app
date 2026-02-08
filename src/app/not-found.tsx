import Link from "next/link";

/**
 * 404 Not Found 페이지
 */
export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <span className="text-6xl">🎲</span>
      <h1 className="text-2xl font-bold text-text-primary">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="text-sm text-text-muted">
        요청하신 페이지가 존재하지 않거나 이동되었습니다.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-xl bg-red-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-hover"
      >
        게임 목록으로
      </Link>
    </div>
  );
}
