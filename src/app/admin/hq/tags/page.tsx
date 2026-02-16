"use client";

import { useState } from "react";
import { FILTER_OPTIONS } from "@/data/mock";

interface TagGroup {
  key: string;
  label: string;
  description: string;
  tags: string[];
}

/**
 * 본사 > 태그 관리
 * 게임 필터에 사용되는 장르/인원수/난이도/플레이시간 태그 관리
 */
export default function HQTagsPage() {
  const [groups, setGroups] = useState<TagGroup[]>([
    { key: "genre", label: "장르 / 테마", description: "게임 검색 필터에서 사용되는 장르 태그", tags: [...FILTER_OPTIONS.genre] },
    { key: "player_count", label: "인원수", description: "게임 검색 필터에서 사용되는 인원수 옵션", tags: [...FILTER_OPTIONS.playerCount] },
    { key: "play_time", label: "게임 시간", description: "게임 검색 필터에서 사용되는 시간대 옵션", tags: [...FILTER_OPTIONS.playTime] },
  ]);
  const [newTagInput, setNewTagInput] = useState<Record<string, string>>({});

  /** 태그 추가 */
  const addTag = (groupKey: string) => {
    const value = newTagInput[groupKey]?.trim();
    if (!value) return;
    setGroups((prev) =>
      prev.map((g) =>
        g.key === groupKey && !g.tags.includes(value) ? { ...g, tags: [...g.tags, value] } : g
      )
    );
    setNewTagInput((prev) => ({ ...prev, [groupKey]: "" }));
  };

  /** 태그 삭제 */
  const removeTag = (groupKey: string, tag: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.key === groupKey ? { ...g, tags: g.tags.filter((t) => t !== tag) } : g))
    );
  };

  const totalTags = groups.reduce((s, g) => s + g.tags.length, 0);

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-6 py-6">
        <div className="mb-6">
          <h1 className="text-lg font-bold text-gray-900">태그 관리</h1>
          <p className="text-xs text-gray-500">총 {totalTags}개 태그 · 게임 검색 필터에 사용됩니다</p>
        </div>

        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.key} className="rounded-xl border border-gray-200 bg-white p-5">
              {/* 그룹 헤더 */}
              <div className="mb-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-gray-900">{group.label}</h2>
                  <span className="text-[10px] text-gray-400">{group.tags.length}개</span>
                </div>
                <p className="text-xs text-gray-400">{group.description}</p>
              </div>

              {/* 태그 목록 */}
              <div className="flex flex-wrap gap-2 mb-3">
                {group.tags.map((tag) => (
                  <span
                    key={tag}
                    className="group flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(group.key, tag)}
                      className="hidden text-gray-400 hover:text-red-600 group-hover:inline"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* 태그 추가 */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTagInput[group.key] ?? ""}
                  onChange={(e) => setNewTagInput((prev) => ({ ...prev, [group.key]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && addTag(group.key)}
                  placeholder="새 태그 입력 후 Enter"
                  className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs focus:border-red-300 focus:outline-none"
                />
                <button
                  onClick={() => addTag(group.key)}
                  className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200"
                >
                  추가
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 난이도 (읽기 전용 참고) */}
        <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-5">
          <h2 className="text-sm font-bold text-gray-700">난이도 (고정값)</h2>
          <p className="mb-3 text-xs text-gray-400">난이도는 enum으로 관리되며 여기서 변경할 수 없습니다</p>
          <div className="flex flex-wrap gap-2">
            {["Very Easy", "Easy", "Normal", "Semi-Hard", "Hard", "Extreme"].map((d) => (
              <span key={d} className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-500">{d}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
