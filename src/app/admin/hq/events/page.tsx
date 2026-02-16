"use client";

import { useState } from "react";

interface EventBanner {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

const MOCK_EVENTS: EventBanner[] = [
  { id: 1, title: "LIAR & TROLL SHOW", subtitle: "레드버튼 오리지널 게임 세번째 시리즈 공개!", imageUrl: "/images/events/liehunt.jpg", order: 1, isActive: true, startDate: "2026-01-15", endDate: "2026-03-31" },
  { id: 2, title: "Feel the NEW Tasty Rush!", subtitle: "새로운 맛의 짜릿한 순간을 느껴봐!", imageUrl: "/images/events/tasty-rush.jpg", order: 2, isActive: true, startDate: "2026-02-01", endDate: "2026-02-28" },
  { id: 3, title: "발렌타인 커플 이벤트", subtitle: "커플 보드게임 추천 + 음료 할인", imageUrl: "/images/events/valentine.jpg", order: 3, isActive: true, startDate: "2026-02-10", endDate: "2026-02-16" },
  { id: 4, title: "설날 특별 이벤트", subtitle: "가족과 함께하는 보드게임", imageUrl: "/images/events/newyear.jpg", order: 4, isActive: false, startDate: "2026-01-28", endDate: "2026-01-30" },
];

/**
 * 본사 > 이벤트 배너 관리
 * 카드 형태 + 드래그 순서변경(mock) + 활성/비활성 토글
 */
export default function HQEventsPage() {
  const [events, setEvents] = useState<EventBanner[]>(MOCK_EVENTS);
  const [editingId, setEditingId] = useState<number | null>(null);

  const toggleActive = (id: number) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, isActive: !e.isActive } : e)));
  };

  const moveUp = (id: number) => {
    setEvents((prev) => {
      const idx = prev.findIndex((e) => e.id === id);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next.map((e, i) => ({ ...e, order: i + 1 }));
    });
  };

  const moveDown = (id: number) => {
    setEvents((prev) => {
      const idx = prev.findIndex((e) => e.id === id);
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next.map((e, i) => ({ ...e, order: i + 1 }));
    });
  };

  const deleteEvent = (id: number) => {
    if (!confirm("삭제하시겠습니까?")) return;
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const activeCount = events.filter((e) => e.isActive).length;

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-6 py-6">
        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">이벤트 배너 관리</h1>
            <p className="text-xs text-gray-500">전체 {events.length}개 · 활성 {activeCount}개 · 태블릿 앱 이벤트 탭에 표시</p>
          </div>
          <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700">
            + 새 이벤트
          </button>
        </div>

        {/* 이벤트 카드 리스트 */}
        <div className="space-y-3">
          {events.map((event, index) => (
            <div
              key={event.id}
              className={`flex items-center gap-4 rounded-xl border p-4 transition-colors ${
                event.isActive ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50 opacity-60"
              }`}
            >
              {/* 순서 조절 */}
              <div className="flex flex-col gap-0.5">
                <button onClick={() => moveUp(event.id)} className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600" disabled={index === 0}>▲</button>
                <span className="text-center text-[10px] font-bold text-gray-400">{event.order}</span>
                <button onClick={() => moveDown(event.id)} className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600" disabled={index === events.length - 1}>▼</button>
              </div>

              {/* 썸네일 */}
              <div className="h-16 w-28 flex-shrink-0 rounded-lg bg-gray-200 flex items-center justify-center text-xs text-gray-400">
                🖼 배너
              </div>

              {/* 정보 */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-gray-900">{event.title}</h3>
                <p className="mt-0.5 text-xs text-gray-500 truncate">{event.subtitle}</p>
                <p className="mt-1 text-[10px] text-gray-400">
                  {event.startDate} ~ {event.endDate}
                </p>
              </div>

              {/* 상태 + 액션 */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(event.id)}
                  className={`rounded-full px-3 py-1 text-[10px] font-bold transition-colors ${
                    event.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {event.isActive ? "활성" : "비활성"}
                </button>
                <button className="rounded bg-gray-100 px-2 py-1 text-[10px] text-gray-600 hover:bg-gray-200">✏️</button>
                <button onClick={() => deleteEvent(event.id)} className="rounded bg-gray-100 px-2 py-1 text-[10px] text-gray-600 hover:bg-red-100 hover:text-red-600">🗑</button>
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <div className="flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-sm text-gray-400">등록된 이벤트가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
