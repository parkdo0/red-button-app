import Link from "next/link";

/**
 * 404 Not Found - 레드버튼 스타일
 */
export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-bg-card">
        <span className="text-4xl"></span>
      </div>
      <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">페이지를 찾을 수 없습니다</h1>
      <p className="text-sm text-text-muted">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
      <Link href="/" className="rb-btn-primary mt-2 px-8 py-3 text-sm touch-feedback">
        게임 목록으로
      </Link>
    </div>
  );
}
