"use client";

import { use } from "react";
import { MOCK_GAMES } from "@/data/mock";
import GameForm from "@/components/admin/GameForm";

/** 본사 > 게임 수정 */
export default function HQGameEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const game = MOCK_GAMES.find((g) => g.id === Number(id));

  if (!game) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-4xl">🎲</p>
          <p className="mt-2 text-lg font-bold text-gray-900">게임을 찾을 수 없습니다</p>
          <p className="mt-1 text-sm text-gray-500">ID: {id}</p>
        </div>
      </div>
    );
  }

  return <GameForm mode="edit" initialData={game} />;
}
