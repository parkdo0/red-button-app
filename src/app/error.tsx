"use client";

/**
 * 전역 에러 바운더리 - 레드버튼 스타일
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-red-subtle">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="text-red-primary">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">문제가 발생했습니다</h1>
      <p className="max-w-sm text-center text-sm text-text-muted leading-relaxed">
        {error.message || "알 수 없는 오류가 발생했습니다. 다시 시도해주세요."}
      </p>
      <button onClick={reset} className="rb-btn-primary mt-2 px-8 py-3 text-sm touch-feedback">
        다시 시도
      </button>
    </div>
  );
}
