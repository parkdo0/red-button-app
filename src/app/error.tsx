"use client";

/**
 * 전역 에러 바운더리
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <span className="text-6xl">⚠️</span>
      <h1 className="text-2xl font-bold text-text-primary">
        문제가 발생했습니다
      </h1>
      <p className="max-w-sm text-center text-sm text-text-muted">
        {error.message || "알 수 없는 오류가 발생했습니다. 다시 시도해주세요."}
      </p>
      <button
        onClick={reset}
        className="mt-2 rounded-xl bg-red-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-hover"
      >
        다시 시도
      </button>
    </div>
  );
}
