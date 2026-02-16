"use client";

import { useState } from "react";
import { GAME_CATEGORIES, MOCK_GAMES, type GameCategory, type Game } from "@/data/mock";

interface EditableCategory {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  gameIds: number[];
  isActive: boolean;
}

/**
 * 본사 > 추천 카테고리 편성
 * 홈 화면 가로 스크롤 Row 구성 관리
 */
export default function HQRecommendPage() {
  const [categories, setCategories] = useState<EditableCategory[]>(
    GAME_CATEGORIES.map((c) => ({
      id: c.id,
      title: c.title.replace(/\n/g, " "),
      subtitle: c.subtitle,
      emoji: c.emoji,
      gameIds: c.games.map((g) => g.id),
      isActive: true,
    }))
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [gamePickerFor, setGamePickerFor] = useState<string | null>(null);

  /** 순서 이동 */
  const move = (id: string, dir: -1 | 1) => {
    setCategories((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      const target = idx + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  /** 활성 토글 */
  const toggleActive = (id: string) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)));
  };

  /** 게임 추가 */
  const addGame = (catId: string, gameId: number) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === catId && !c.gameIds.includes(gameId)
          ? { ...c, gameIds: [...c.gameIds, gameId] }
          : c
      )
    );
  };

  /** 게임 제거 */
  const removeGame = (catId: string, gameId: number) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, gameIds: c.gameIds.filter((id) => id !== gameId) } : c))
    );
  };

  /** 삭제 */
  const deleteCategory = (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-6 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">추천 편성</h1>
            <p className="text-xs text-gray-500">태블릿 앱 홈 화면의 가로 스크롤 Row를 구성합니다</p>
          </div>
          <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700">
            + 새 카테고리
          </button>
        </div>

        <div className="space-y-3">
          {categories.map((cat, idx) => {
            const isExpanded = expandedId === cat.id;
            const games = cat.gameIds.map((id) => MOCK_GAMES.find((g) => g.id === id)).filter(Boolean) as Game[];

            return (
              <div key={cat.id} className={`rounded-xl border transition-colors ${cat.isActive ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50 opacity-60"}`}>
                {/* Row 헤더 */}
                <div className="flex items-center gap-3 p-4">
                  {/* 순서 */}
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => move(cat.id, -1)} className="text-gray-400 hover:text-gray-600" disabled={idx === 0}>▲</button>
                    <button onClick={() => move(cat.id, 1)} className="text-gray-400 hover:text-gray-600" disabled={idx === categories.length - 1}>▼</button>
                  </div>

                  {/* 이모지 */}
                  <span className="text-2xl">{cat.emoji}</span>

                  {/* 정보 */}
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : cat.id)}>
                    <h3 className="text-sm font-bold text-gray-900">{cat.title}</h3>
                    <p className="text-[10px] text-gray-400">게임 {cat.gameIds.length}개 포함</p>
                  </div>

                  {/* 액션 */}
                  <button onClick={() => toggleActive(cat.id)} className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${cat.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
                    {cat.isActive ? "활성" : "비활성"}
                  </button>
                  <button onClick={() => setExpandedId(isExpanded ? null : cat.id)} className="text-xs text-gray-400 hover:text-gray-600">
                    {isExpanded ? "접기" : "펼치기"}
                  </button>
                  <button onClick={() => deleteCategory(cat.id)} className="rounded bg-gray-100 px-2 py-1 text-[10px] text-gray-500 hover:bg-red-100 hover:text-red-600">🗑</button>
                </div>

                {/* 확장: 게임 목록 */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-4">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {games.map((game) => (
                        <span key={game.id} className="flex items-center gap-1.5 rounded-lg bg-gray-50 border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700">
                          {game.title}
                          <button onClick={() => removeGame(cat.id, game.id)} className="text-gray-400 hover:text-red-600">×</button>
                        </span>
                      ))}
                    </div>
                    {/* 게임 추가 드롭다운 */}
                    <div className="relative">
                      <button
                        onClick={() => setGamePickerFor(gamePickerFor === cat.id ? null : cat.id)}
                        className="rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs text-gray-400 hover:border-gray-400 hover:text-gray-600"
                      >
                        + 게임 추가
                      </button>
                      {gamePickerFor === cat.id && (
                        <div className="absolute left-0 top-full z-10 mt-1 max-h-48 w-64 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                          {MOCK_GAMES.filter((g) => !cat.gameIds.includes(g.id)).map((game) => (
                            <button
                              key={game.id}
                              onClick={() => { addGame(cat.id, game.id); setGamePickerFor(null); }}
                              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                            >
                              <span>{game.title}</span>
                              <span className="text-[10px] text-gray-400">{game.recommendedPlayers}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
