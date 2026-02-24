"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { DIFFICULTY_LABEL, type Difficulty } from "@/data/constants";

interface Game {
  id: number;
  title: string;
  description: string;
  difficulty: Difficulty;
  minPlayers: number;
  maxPlayers: number;
  playTimeCategory: string;
  defaultShelfLoc: string;
  tags: { group: string; value: string }[];
}

const ITEMS_PER_PAGE = 8;

export default function HQGamesPage() {
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGames = () => {
    fetch("/api/games")
      .then((r) => r.json())
      .then((data) => { setGames(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchGames(); }, []);

  const filtered = useMemo(() => {
    return games.filter((g) => {
      const matchSearch = search === "" || g.title.toLowerCase().includes(search.toLowerCase());
      const matchDiff = difficultyFilter === "ALL" || g.difficulty === difficultyFilter;
      return matchSearch && matchDiff;
    });
  }, [games, search, difficultyFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
    await fetch(`/api/games/${id}`, { method: "DELETE" });
    fetchGames();
  };

  const getGenreTags = (game: Game): string[] =>
    game.tags?.filter((t) => t.group === "genre").map((t) => t.value) ?? [];

  const difficultyColor: Record<Difficulty, string> = {
    VERY_EASY: "bg-emerald-100 text-emerald-700",
    EASY: "bg-green-100 text-green-700",
    NORMAL: "bg-blue-100 text-blue-700",
    SEMI_HARD: "bg-yellow-100 text-yellow-700",
    HARD: "bg-orange-100 text-orange-700",
    EXTREME: "bg-red-100 text-red-700",
  };

  if (loading) return <div className="flex h-full items-center justify-center text-gray-400">불러오는 중...</div>;

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">게임 관리</h1>
            <p className="mt-0.5 text-sm text-gray-500">마스터 게임 DB · 총 {filtered.length}건</p>
          </div>
          <Link href="/admin/hq/games/new" className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            새 게임 등록
          </Link>
        </div>

        <div className="mb-4 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input type="text" placeholder="게임명 검색..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 placeholder:italic placeholder:font-light focus:border-red-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-200" />
          </div>
          <select value={difficultyFilter} onChange={(e) => { setDifficultyFilter(e.target.value as Difficulty | "ALL"); setPage(1); }} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:border-red-300 focus:outline-none">
            <option value="ALL">난이도 전체</option>
            {(["VERY_EASY", "EASY", "NORMAL", "SEMI_HARD", "HARD", "EXTREME"] as Difficulty[]).map((d) => (
              <option key={d} value={d}>{DIFFICULTY_LABEL[d]}</option>
            ))}
          </select>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="w-12 px-4 py-3 text-center font-semibold text-gray-500">ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-500">게임명</th>
                  <th className="w-24 px-4 py-3 text-center font-semibold text-gray-500">난이도</th>
                  <th className="w-20 px-4 py-3 text-center font-semibold text-gray-500">인원</th>
                  <th className="w-20 px-4 py-3 text-center font-semibold text-gray-500">시간</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-500">장르</th>
                  <th className="w-20 px-4 py-3 text-center font-semibold text-gray-500">진열</th>
                  <th className="w-24 px-4 py-3 text-center font-semibold text-gray-500">액션</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">검색 결과가 없습니다.</td></tr>
                ) : (
                  paginated.map((game) => (
                    <tr key={game.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-center text-gray-400">{game.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-lg"></div>
                          <div>
                            <p className="font-semibold text-gray-900">{game.title}</p>
                            <p className="text-[11px] text-gray-400 line-clamp-1">{game.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${difficultyColor[game.difficulty]}`}>{DIFFICULTY_LABEL[game.difficulty]}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">{game.minPlayers}-{game.maxPlayers}인</td>
                      <td className="px-4 py-3 text-center text-gray-600">{game.playTimeCategory}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {getGenreTags(game).slice(0, 3).map((tag) => (
                            <span key={tag} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600">{tag}</span>
                          ))}
                          {getGenreTags(game).length > 3 && <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-400">+{getGenreTags(game).length - 3}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-500">{game.defaultShelfLoc}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Link href={`/admin/hq/games/${game.id}/edit`} className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="수정">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                          </Link>
                          <button onClick={() => handleDelete(game.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="삭제">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
              <p className="text-xs text-gray-400">{(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, filtered.length)} / {filtered.length}건</p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">← 이전</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)} className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${p === page ? "bg-red-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}>{p}</button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">다음 →</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
