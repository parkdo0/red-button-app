"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface Props {
  compact?: boolean;
}

/**
 * 게임 타이머 - 레드버튼 스타일
 * 이용 시간 측정 (카운트업) + 일시정지/리셋
 */
export default function GameTimer({ compact = false }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning]);

  const toggle = useCallback(() => setIsRunning((prev) => !prev), []);
  const reset = useCallback(() => { setIsRunning(false); setElapsed(0); }, []);

  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;
  const timeStr = hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  if (compact) {
    return (
      <>
        <button
          onClick={() => setIsExpanded(true)}
          className={`flex w-[62px] flex-col items-center gap-1 rounded-2xl px-2 py-3 transition-colors duration-200 touch-feedback
            ${isRunning ? "bg-green-badge/10 text-green-badge" : elapsed > 0 ? "bg-yellow-badge/10 text-yellow-badge" : "text-text-muted hover:bg-bg-card hover:text-text-secondary"}`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="text-[9px] font-semibold leading-tight">
            {elapsed > 0 ? timeStr : "타이머"}
          </span>
        </button>

        {isExpanded && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] animate-backdrop" onClick={() => setIsExpanded(false)}>
            <div className="w-80 rounded-3xl border border-border-default bg-bg-secondary p-6 shadow-2xl animate-modal" onClick={(e) => e.stopPropagation()}>
              <TimerDisplay timeStr={timeStr} isRunning={isRunning} elapsed={elapsed} onToggle={toggle} onReset={reset} onClose={() => setIsExpanded(false)} />
            </div>
          </div>
        )}
      </>
    );
  }

  return <TimerDisplay timeStr={timeStr} isRunning={isRunning} elapsed={elapsed} onToggle={toggle} onReset={reset} />;
}

interface TimerDisplayProps {
  timeStr: string;
  isRunning: boolean;
  elapsed: number;
  onToggle: () => void;
  onReset: () => void;
  onClose?: () => void;
}

function TimerDisplay({ timeStr, isRunning, elapsed, onToggle, onReset, onClose }: TimerDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-5">
      {/* 헤더 */}
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-4 w-1 rounded-full bg-red-primary" />
          <h3 className="text-sm font-bold text-text-primary">게임 타이머</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-xl text-text-muted hover:bg-bg-card hover:text-text-primary transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* 시간 표시 - 프리미엄 원형 디스플레이 */}
      <div className={`flex h-32 w-32 items-center justify-center rounded-full border-2 transition-colors
        ${isRunning ? "border-green-badge/40 bg-green-badge/5" : elapsed > 0 ? "border-yellow-badge/40 bg-yellow-badge/5" : "border-border-default bg-bg-card"}`}>
        <span className={`font-mono text-3xl font-extrabold tracking-wider
          ${isRunning ? "text-green-badge" : elapsed > 0 ? "text-yellow-badge" : "text-text-primary"}`}>
          {timeStr}
        </span>
      </div>

      <span className="text-xs text-text-muted">
        {isRunning ? "게임 진행 중..." : elapsed > 0 ? "일시정지" : "시작 버튼을 눌러주세요"}
      </span>

      {/* 컨트롤 */}
      <div className="flex w-full gap-3">
        <button
          onClick={onToggle}
          className={`flex-1 rounded-2xl py-3 text-sm font-bold transition-all touch-feedback
            ${isRunning
              ? "bg-yellow-badge/15 text-yellow-badge hover:bg-yellow-badge/25"
              : "bg-green-badge/15 text-green-badge hover:bg-green-badge/25"}`}
        >
          {isRunning ? "일시정지" : elapsed > 0 ? "계속" : "시작"}
        </button>
        {elapsed > 0 && (
          <button onClick={onReset} className="rounded-2xl bg-bg-card border border-border-default px-5 py-3 text-sm font-semibold text-text-muted transition-colors hover:bg-bg-card-hover touch-feedback">
            리셋
          </button>
        )}
      </div>
    </div>
  );
}
