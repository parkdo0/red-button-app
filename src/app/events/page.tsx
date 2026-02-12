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

const MOCK_EVENTS: EventItem[] = [
  {
    id: 1,
    title: "LIAR & TROLL SHOW",
    subtitle: "드디어! 레드버튼 오리지널 게임 세번째 시리즈 공개! 🎉🎉",
    description: "트롤이 움직이는 순간, 게임의 흐름이 달라진다",
    bgGradient: "from-red-900 via-red-800 to-red-950",
    emoji: "🎭",
  },
  {
    id: 2,
    title: "레드버튼 SNS 이벤트",
    subtitle: "인스타그램 팔로우 & 리뷰 남기기",
    description: "팔로우 + 방문 리뷰 작성 시 음료 1잔 무료!\n@redbutton_official 태그 필수",
    bgGradient: "from-purple-900 via-purple-800 to-indigo-950",
    emoji: "📸",
  },
  {
    id: 3,
    title: "Happy Birthday!",
    subtitle: "생일 축하 이벤트 🎂",
    description: "생일 당일 방문 시 케이크 + 이용시간 30분 연장!\n신분증 확인 필수",
    bgGradient: "from-pink-900 via-pink-800 to-rose-950",
    emoji: "🎂",
  },
];

/**
 * 이벤트 페이지 - 실제 레드버튼 앱 기준
 * 풀스크린 캐러셀 + 좌우 네비게이션 + 페이지 인디케이터
 */
export default function EventsPage() {
  const [current, setCurrent] = useState(0);
  const total = MOCK_EVENTS.length;
  const event = MOCK_EVENTS[current];

  const goNext = () => setCurrent((prev) => (prev + 1) % total);
  const goPrev = () => setCurrent((prev) => (prev - 1 + total) % total);

  return (
    <div className="relative flex h-full flex-col bg-bg-primary overflow-hidden">
      {/* 상단 자막 */}
      <div className="absolute top-0 left-0 right-0 z-10 px-6 pt-4">
        <p className="text-[13px] font-semibold text-text-secondary">{event.subtitle}</p>
      </div>

      {/* 메인 풀스크린 콘텐츠 */}
      <div className={`flex-1 flex items-center justify-center bg-gradient-to-br ${event.bgGradient} transition-all duration-500`}>
        <div className="flex flex-col items-center text-center px-12">
          <div className="text-7xl mb-6">{event.emoji}</div>
          <h1 className="text-4xl font-black text-white tracking-tight leading-tight">
            {event.title}
          </h1>
          <p className="mt-4 text-sm text-white/80 whitespace-pre-line leading-relaxed max-w-md">
            {event.description}
          </p>
        </div>
      </div>

      {/* 하단 네비게이션 바 */}
      <div className="flex items-center justify-between border-t border-border-default bg-bg-primary px-6 py-3">
        <button
          onClick={goPrev}
          className="flex items-center gap-2 rounded-xl bg-bg-card border border-border-default px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors touch-feedback"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          이전 이벤트
        </button>

        {/* 페이지 인디케이터 */}
        <span className="text-sm font-bold text-text-primary">
          {current + 1}/{total}
        </span>

        <button
          onClick={goNext}
          className="flex items-center gap-2 rounded-xl bg-red-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-red-hover transition-colors touch-feedback"
        >
          다음 이벤트
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
