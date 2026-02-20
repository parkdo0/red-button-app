"use client";

import { useState } from "react";

interface EventItem {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  bgGradient: string;
  emoji: string;
}

interface Props {
  events: EventItem[];
}

export default function EventsClient({ events }: Props) {
  const [current, setCurrent] = useState(0);
  const total = events.length;

  if (total === 0) {
    return (
      <div className="flex h-full items-center justify-center text-text-muted">
        진행 중인 이벤트가 없습니다
      </div>
    );
  }

  const event = events[current];
  const goNext = () => setCurrent((prev) => (prev + 1) % total);
  const goPrev = () => setCurrent((prev) => (prev - 1 + total) % total);

  return (
    <div className="relative flex h-full flex-col bg-bg-primary overflow-hidden">
      <div className="absolute top-0 left-0 right-0 z-10 px-6 pt-4">
        <p className="text-[13px] font-semibold text-text-secondary">{event.subtitle}</p>
      </div>

      <div className={`flex-1 flex items-center justify-center bg-gradient-to-br ${event.bgGradient} transition-all duration-500`}>
        <div className="flex flex-col items-center text-center px-12">
          <div className="text-7xl mb-6">{event.emoji}</div>
          <h1 className="text-4xl font-black text-white tracking-tight leading-tight">{event.title}</h1>
          <p className="mt-4 text-sm text-white/80 whitespace-pre-line leading-relaxed max-w-md">{event.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border-default bg-bg-primary px-6 py-3">
        <button onClick={goPrev} className="flex items-center gap-2 rounded-xl bg-bg-card border border-border-default px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors touch-feedback">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
          이전 이벤트
        </button>
        <span className="text-sm font-bold text-text-primary">{current + 1}/{total}</span>
        <button onClick={goNext} className="flex items-center gap-2 rounded-xl bg-red-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-red-hover transition-colors touch-feedback">
          다음 이벤트
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>
    </div>
  );
}
