"use client";

import { useState, useEffect } from "react";

interface RecommendGame {
  id: number;
  title: string;
  recommendedPlayers: string;
}

interface RecommendCategory {
  id: number;
  title: string;
  subtitle: string;
  emoji: string;
  order: number;
  isActive: boolean;
  games: RecommendGame[];
}

export default function HQRecommendPage() {
  const [categories, setCategories] = useState<RecommendCategory[]>([]);
  const [allGames, setAllGames] = useState<RecommendGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [gamePickerFor, setGamePickerFor] = useState<number | null>(null);

  const fetchData = () => {
    Promise.all([
      fetch("/api/recommend?all=true").then((r) => r.json()),
      fetch("/api/games").then((r) => r.json()),
    ]).then(([cats, games]) => {
      setCategories(cats);
      setAllGames(games.map((g: Record<string, unknown>) => ({ id: g.id as number, title: g.title as string, recommendedPlayers: (g.recommendedPlayers as string) ?? "" })));
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const move = async (id: number, dir: -1 | 1) => {
    const idx = categories.findIndex((c) => c.id === id);
    const target = idx + dir;
    if (target < 0 || target >= categories.length) return;
    const next = [...categories];
    [next[idx], next[target]] = [next[target], next[idx]];
    setCategories(next);
    // 순서 저장
    await Promise.all(next.map((c, i) =>
      fetch(`/api/recommend/${c.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: i }) })
    ));
  };

  const toggleActive = async (id: number, current: boolean) => {
    await fetch(`/api/recommend/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    fetchData();
  };

  const addGame = async (catId: number, gameId: number) => {
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return;
    const newGameIds = [...cat.games.map((g) => g.id), gameId];
    await fetch(`/api/recommend/${catId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameIds: newGameIds }),
    });
    setGamePickerFor(null);
    fetchData();
  };

  const removeGame = async (catId: number, gameId: number) => {
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return;
    const newGameIds = cat.games.filter((g) => g.id !== gameId).map((g) => g.id);
    await fetch(`/api/recommend/${catId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameIds: newGameIds }),
    });
    fetchData();
  };

  const deleteCategory = async (id: number) => {
    if (!confirm("삭제하시겠습니까?")) return;
    await fetch(`/api/recommend/${id}`, { method: "DELETE" });
    fetchData();
  };

  if (loading) return <div className="flex h-full items-center justify-center text-gray-400">로딩 중...</div>;

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-6 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">추천 편성</h1>
            <p className="text-xs text-gray-500">태블릿 앱 홈 화면의 가로 스크롤 Row를 구성합니다</p>
          </div>
          <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700">+ 새 카테고리</button>
        </div>

        <div className="space-y-3">
          {categories.map((cat, idx) => {
            const isExpanded = expandedId === cat.id;
            return (
              <div key={cat.id} className={`rounded-xl border transition-colors ${cat.isActive ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50 opacity-60"}`}>
                <div className="flex items-center gap-3 p-4">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => move(cat.id, -1)} className="text-gray-400 hover:text-gray-600" disabled={idx === 0}>▲</button>
                    <button onClick={() => move(cat.id, 1)} className="text-gray-400 hover:text-gray-600" disabled={idx === categories.length - 1}>▼</button>
                  </div>
                  <span className="text-2xl">{cat.emoji}</span>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : cat.id)}>
                    <h3 className="text-sm font-bold text-gray-900">{cat.title}</h3>
                    <p className="text-[10px] text-gray-400">게임 {cat.games.length}개 포함</p>
                  </div>
                  <button onClick={() => toggleActive(cat.id, cat.isActive)} className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${cat.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
                    {cat.isActive ? "활성" : "비활성"}
                  </button>
                  <button onClick={() => setExpandedId(isExpanded ? null : cat.id)} className="text-xs text-gray-400 hover:text-gray-600">{isExpanded ? "접기" : "펼치기"}</button>
                  <button onClick={() => deleteCategory(cat.id)} className="rounded bg-gray-100 px-2 py-1 text-[10px] text-gray-500 hover:bg-red-100 hover:text-red-600"></button>
                </div>
                {isExpanded && (
                  <div className="border-t border-gray-100 p-4">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {cat.games.map((game) => (
                        <span key={game.id} className="flex items-center gap-1.5 rounded-lg bg-gray-50 border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700">
                          {game.title}
                          <button onClick={() => removeGame(cat.id, game.id)} className="text-gray-400 hover:text-red-600">×</button>
                        </span>
                      ))}
                    </div>
                    <div className="relative">
                      <button onClick={() => setGamePickerFor(gamePickerFor === cat.id ? null : cat.id)} className="rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs text-gray-400 hover:border-gray-400 hover:text-gray-600">+ 게임 추가</button>
                      {gamePickerFor === cat.id && (
                        <div className="absolute left-0 top-full z-10 mt-1 max-h-48 w-64 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                          {allGames.filter((g) => !cat.games.some((cg) => cg.id === g.id)).map((game) => (
                            <button key={game.id} onClick={() => addGame(cat.id, game.id)} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">
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
