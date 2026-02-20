"use client";

import { useState, useEffect, useMemo } from "react";
import { DIFFICULTY_LABEL, type Difficulty } from "@/data/constants";

interface StoreGameItem {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  minPlayers: number;
  maxPlayers: number;
  difficulty: string;
  defaultShelfLoc: string;
  isVisible: boolean;
  shelfLocation: string;
  hasStoreConfig: boolean;
}

/**
 * 매장 > 게임 노출 관리
 */
export default function StoreGamesPage() {
  const [games, setGames] = useState<StoreGameItem[]>([]);
  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "owned" | "unowned">("all");
  const [loading, setLoading] = useState(true);

  const fetchGames = () => {
    fetch("/api/store-games?storeId=1")
      .then((r) => r.json())
      .then((data) => { setGames(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchGames(); }, []);

  const filtered = useMemo(() => {
    return games.filter((g) => {
      const matchSearch = !search || g.title.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        filterMode === "all" ||
        (filterMode === "owned" && g.hasStoreConfig) ||
        (filterMode === "unowned" && !g.hasStoreConfig);
      return matchSearch && matchFilter;
    });
  }, [games, search, filterMode]);

  /** 보유 토글 */
  const toggleOwnership = async (game: StoreGameItem) => {
    if (game.hasStoreConfig) {
      await fetch(`/api/store-games?storeId=1&gameId=${game.id}`, { method: "DELETE" });
    } else {
      await fetch("/api/store-games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: 1, gameId: game.id, isVisible: true, shelfLocation: "" }),
      });
    }
    fetchGames();
  };

  /** 노출 토글 */
  const toggleVisibility = async (game: StoreGameItem) => {
    await fetch("/api/store-games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId: 1, gameId: game.id, isVisible: !game.isVisible }),
    });
    setGames((prev) => prev.map((g) => g.id === game.id ? { ...g, isVisible: !g.isVisible } : g));
  };

  /** 진열 위치 변경 */
  const updateShelfLocation = async (game: StoreGameItem, loc: string) => {
    setGames((prev) => prev.map((g) => g.id === game.id ? { ...g, shelfLocation: loc } : g));
    await fetch("/api/store-games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId: 1, gameId: game.id, shelfLocation: loc }),
    });
  };

  const ownedCount = games.filter((g) => g.hasStoreConfig).length;
  const visibleCount = games.filter((g) => g.hasStoreConfig && g.isVisible).length;

  if (loading) return <div className="flex h-full items-center justify-center text-gray-400">로딩 중...</div>;

  return (
    <div className="flex h-full flex-col">
      {/* 헤더 */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">게임 노출 관리</h1>
            <p className="text-xs text-gray-500">
              보유 <strong className="text-red-600">{ownedCount}</strong>종
              · 노출 중 <strong className="text-green-600">{visibleCount}</strong>종
              · 마스터 전체 {games.length}종
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="게임명 검색..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-sm focus:border-red-300 focus:bg-white focus:outline-none"
            />
          </div>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {(["all", "owned", "unowned"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`px-3 py-2 text-xs font-medium transition-colors ${
                  filterMode === mode ? "bg-red-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                {mode === "all" && "전체"}
                {mode === "owned" && `보유 (${ownedCount})`}
                {mode === "unowned" && `미보유 (${games.length - ownedCount})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 테이블 */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2.5 text-left text-[11px] font-bold text-gray-500 w-[60px]">보유</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-bold text-gray-500">게임명</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-bold text-gray-500 w-[80px]">난이도</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-bold text-gray-500 w-[80px]">인원</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-bold text-gray-500 w-[100px]">기본 위치</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-bold text-gray-500 w-[120px]">매장 위치</th>
              <th className="px-4 py-2.5 text-center text-[11px] font-bold text-gray-500 w-[80px]">노출</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((game) => {
              const isOwned = game.hasStoreConfig;
              return (
                <tr key={game.id} className={`transition-colors ${isOwned ? "bg-white" : "bg-gray-50/50"}`}>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleOwnership(game)}
                      className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition-colors ${
                        isOwned ? "border-red-500 bg-red-500" : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {isOwned && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${isOwned ? "text-gray-900" : "text-gray-400"}`}>{game.title}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500">{DIFFICULTY_LABEL[game.difficulty as Difficulty] ?? game.difficulty}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500">{game.minPlayers}-{game.maxPlayers}인</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-400">{game.defaultShelfLoc}</span>
                  </td>
                  <td className="px-4 py-3">
                    {isOwned ? (
                      <input
                        type="text"
                        value={game.shelfLocation ?? ""}
                        onChange={(e) => updateShelfLocation(game, e.target.value)}
                        placeholder={game.defaultShelfLoc}
                        className="w-full rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700 focus:border-red-300 focus:outline-none"
                      />
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {isOwned ? (
                      <button
                        onClick={() => toggleVisibility(game)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          game.isVisible ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
                          style={{ transform: game.isVisible ? "translateX(18px)" : "translateX(2px)" }}
                        />
                      </button>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex h-40 items-center justify-center">
            <p className="text-sm text-gray-400">검색 결과가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
