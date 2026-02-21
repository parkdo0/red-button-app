"use client";

import { use, useState, useEffect } from "react";
import GameForm from "@/components/admin/GameForm";
import type { Game } from "@/data/constants";

/** 본사 > 게임 수정 */
export default function HQGameEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/games/${id}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); setLoading(false); return null; }
        return r.json();
      })
      .then((data) => { if (data) { setGame(data); setLoading(false); } })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [id]);

  if (loading) return <div className="flex h-full items-center justify-center text-gray-400">로딩 중...</div>;

  if (notFound || !game) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-4xl"></p>
          <p className="mt-2 text-lg font-bold text-gray-900">게임을 찾을 수 없습니다</p>
          <p className="mt-1 text-sm text-gray-500">ID: {id}</p>
        </div>
      </div>
    );
  }

  return <GameForm mode="edit" initialData={game} />;
}
