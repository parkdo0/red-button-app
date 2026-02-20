"use client";

import { useState, useEffect } from "react";

interface EventBanner {
  id: number;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  order: number;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
}

export default function HQEventsPage() {
  const [events, setEvents] = useState<EventBanner[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = () => {
    fetch("/api/events?all=true")
      .then((r) => r.json())
      .then((data) => { setEvents(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(); }, []);

  const toggleActive = async (id: number, current: boolean) => {
    await fetch(`/api/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    fetchEvents();
  };

  const moveUp = async (id: number) => {
    const idx = events.findIndex((e) => e.id === id);
    if (idx <= 0) return;
    const next = [...events];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setEvents(next);
    await Promise.all(next.map((e, i) =>
      fetch(`/api/events/${e.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: i + 1 }) })
    ));
  };

  const moveDown = async (id: number) => {
    const idx = events.findIndex((e) => e.id === id);
    if (idx >= events.length - 1) return;
    const next = [...events];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    setEvents(next);
    await Promise.all(next.map((e, i) =>
      fetch(`/api/events/${e.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: i + 1 }) })
    ));
  };

  const deleteEvent = async (id: number) => {
    if (!confirm("삭제하시겠습니까?")) return;
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    fetchEvents();
  };

  if (loading) return <div className="flex h-full items-center justify-center text-gray-400">로딩 중...</div>;

  const activeCount = events.filter((e) => e.isActive).length;
  const formatDate = (d: string | null) => d ? new Date(d).toISOString().split("T")[0] : "-";

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-6 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">이벤트 배너 관리</h1>
            <p className="text-xs text-gray-500">전체 {events.length}개 · 활성 {activeCount}개 · 태블릿 앱 이벤트 탭에 표시</p>
          </div>
          <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700">+ 새 이벤트</button>
        </div>

        <div className="space-y-3">
          {events.map((event, index) => (
            <div key={event.id} className={`flex items-center gap-4 rounded-xl border p-4 transition-colors ${event.isActive ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50 opacity-60"}`}>
              <div className="flex flex-col gap-0.5">
                <button onClick={() => moveUp(event.id)} className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600" disabled={index === 0}>▲</button>
                <span className="text-center text-[10px] font-bold text-gray-400">{index + 1}</span>
                <button onClick={() => moveDown(event.id)} className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600" disabled={index === events.length - 1}>▼</button>
              </div>
              <div className="h-16 w-28 flex-shrink-0 rounded-lg bg-gray-200 flex items-center justify-center text-xs text-gray-400">🖼 배너</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-gray-900">{event.title}</h3>
                <p className="mt-0.5 text-xs text-gray-500 truncate">{event.subtitle ?? ""}</p>
                <p className="mt-1 text-[10px] text-gray-400">{formatDate(event.startDate)} ~ {formatDate(event.endDate)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleActive(event.id, event.isActive)} className={`rounded-full px-3 py-1 text-[10px] font-bold transition-colors ${event.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
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
