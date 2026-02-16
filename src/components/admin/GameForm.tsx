"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FILTER_OPTIONS,
  DIFFICULTY_LABEL,
  type Game,
  type Difficulty,
  type GameTag,
} from "@/data/mock";

interface Props {
  /** 수정 모드일 때 기존 게임 데이터 전달 */
  initialData?: Game;
  mode: "create" | "edit";
}

/** 빈 폼 초기값 */
const EMPTY_FORM = {
  title: "",
  description: "",
  thumbnailUrl: "",
  videoUrl: "",
  minPlayers: 2,
  maxPlayers: 4,
  recommendedPlayers: "2-4인",
  playTime: 30,
  playTimeCategory: "15-30분",
  difficulty: "NORMAL" as Difficulty,
  shelfLocation: "",
  hashtags: [] as string[],
  selectedGenres: [] as string[],
  selectedPlayers: [] as string[],
};

/**
 * 게임 등록/수정 공통 폼 컴포넌트
 * 태그 멀티셀렉트 + 해시태그 동적 추가/삭제
 */
export default function GameForm({ initialData, mode }: Props) {
  const router = useRouter();

  // 초기 데이터에서 폼 상태 추출
  const [form, setForm] = useState(() => {
    if (initialData) {
      return {
        title: initialData.title,
        description: initialData.description ?? "",
        thumbnailUrl: initialData.thumbnailUrl,
        videoUrl: initialData.videoUrl,
        minPlayers: initialData.minPlayers,
        maxPlayers: initialData.maxPlayers,
        recommendedPlayers: initialData.recommendedPlayers,
        playTime: initialData.playTime ?? 30,
        playTimeCategory: initialData.playTimeCategory,
        difficulty: initialData.difficulty,
        shelfLocation: initialData.shelfLocation,
        hashtags: initialData.hashtags.map((h) => h.replace(/^#/, "")),
        selectedGenres: initialData.tags.filter((t) => t.group === "genre").map((t) => t.value),
        selectedPlayers: initialData.tags.filter((t) => t.group === "player_count").map((t) => t.value),
      };
    }
    return EMPTY_FORM;
  });

  const [newHashtag, setNewHashtag] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  /** 필드 업데이트 헬퍼 */
  const updateField = useCallback(<K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }, []);

  /** 장르 태그 토글 */
  const toggleGenre = (genre: string) => {
    setForm((prev) => ({
      ...prev,
      selectedGenres: prev.selectedGenres.includes(genre)
        ? prev.selectedGenres.filter((g) => g !== genre)
        : [...prev.selectedGenres, genre],
    }));
  };

  /** 인원수 태그 토글 */
  const togglePlayer = (player: string) => {
    setForm((prev) => ({
      ...prev,
      selectedPlayers: prev.selectedPlayers.includes(player)
        ? prev.selectedPlayers.filter((p) => p !== player)
        : [...prev.selectedPlayers, player],
    }));
  };

  /** 해시태그 추가 */
  const addHashtag = () => {
    const trimmed = newHashtag.trim().replace(/^#/, "");
    if (!trimmed || form.hashtags.includes(trimmed)) return;
    setForm((prev) => ({ ...prev, hashtags: [...prev.hashtags, trimmed] }));
    setNewHashtag("");
  };

  /** 해시태그 삭제 */
  const removeHashtag = (tag: string) => {
    setForm((prev) => ({ ...prev, hashtags: prev.hashtags.filter((h) => h !== tag) }));
  };

  /** 유효성 검사 */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = "게임명을 입력하세요";
    if (form.minPlayers > form.maxPlayers) newErrors.maxPlayers = "최소 인원보다 커야 합니다";
    if (form.selectedGenres.length === 0) newErrors.genres = "최소 1개 장르를 선택하세요";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /** 저장 (Mock - 실제로는 API 호출) */
  const handleSubmit = () => {
    if (!validate()) return;
    // TODO: API 호출 (POST /api/admin/games or PUT /api/admin/games/:id)
    alert(`${mode === "create" ? "등록" : "수정"} 완료! (Mock)`);
    router.push("/admin/hq/games");
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-6 py-6">
        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {mode === "create" ? "새 게임 등록" : `게임 수정 — ${form.title}`}
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">마스터 게임 DB에 추가됩니다</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.back()}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              className="rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white hover:bg-red-700"
            >
              {mode === "create" ? "등록" : "저장"}
            </button>
          </div>
        </div>

        {/* ── 기본 정보 ── */}
        <Section title="기본 정보">
          <Field label="게임명" required error={errors.title}>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="예: 라스베가스"
              className={inputClass(errors.title)}
            />
          </Field>
          <Field label="설명">
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="게임에 대한 간략한 설명을 작성하세요"
              rows={3}
              className={inputClass() + " resize-none"}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="썸네일 URL">
              <input
                type="url"
                value={form.thumbnailUrl}
                onChange={(e) => updateField("thumbnailUrl", e.target.value)}
                placeholder="/images/games/example.jpg"
                className={inputClass()}
              />
            </Field>
            <Field label="영상 URL (YouTube)">
              <input
                type="url"
                value={form.videoUrl}
                onChange={(e) => updateField("videoUrl", e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className={inputClass()}
              />
            </Field>
          </div>
        </Section>

        {/* ── 게임 스펙 ── */}
        <Section title="게임 스펙">
          <div className="grid grid-cols-3 gap-4">
            <Field label="최소 인원" required>
              <input
                type="number"
                min={1}
                max={20}
                value={form.minPlayers}
                onChange={(e) => updateField("minPlayers", +e.target.value)}
                className={inputClass()}
              />
            </Field>
            <Field label="최대 인원" required error={errors.maxPlayers}>
              <input
                type="number"
                min={1}
                max={20}
                value={form.maxPlayers}
                onChange={(e) => updateField("maxPlayers", +e.target.value)}
                className={inputClass(errors.maxPlayers)}
              />
            </Field>
            <Field label="추천 인원 (텍스트)">
              <input
                type="text"
                value={form.recommendedPlayers}
                onChange={(e) => updateField("recommendedPlayers", e.target.value)}
                placeholder="3-5인"
                className={inputClass()}
              />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="플레이 시간 (분)">
              <input
                type="number"
                min={5}
                max={300}
                value={form.playTime}
                onChange={(e) => updateField("playTime", +e.target.value)}
                className={inputClass()}
              />
            </Field>
            <Field label="시간 카테고리">
              <select
                value={form.playTimeCategory}
                onChange={(e) => updateField("playTimeCategory", e.target.value)}
                className={inputClass()}
              >
                {FILTER_OPTIONS.playTime.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="기본 진열 위치">
              <input
                type="text"
                value={form.shelfLocation}
                onChange={(e) => updateField("shelfLocation", e.target.value)}
                placeholder="ㄱㄴㄷ-6"
                className={inputClass()}
              />
            </Field>
          </div>

          {/* 난이도 라디오 */}
          <Field label="난이도" required>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(DIFFICULTY_LABEL) as Difficulty[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => updateField("difficulty", d)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    form.difficulty === d
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {DIFFICULTY_LABEL[d]}
                </button>
              ))}
            </div>
          </Field>
        </Section>

        {/* ── 태그 (장르 + 인원수) ── */}
        <Section title="태그 (복수 선택)">
          <Field label="장르 / 테마" required error={errors.genres}>
            <div className="flex flex-wrap gap-2">
              {FILTER_OPTIONS.genre.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    form.selectedGenres.includes(genre)
                      ? "border-red-400 bg-red-50 text-red-700"
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </Field>
          <Field label="인원수">
            <div className="flex flex-wrap gap-2">
              {FILTER_OPTIONS.playerCount.map((pc) => (
                <button
                  key={pc}
                  type="button"
                  onClick={() => togglePlayer(pc)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    form.selectedPlayers.includes(pc)
                      ? "border-blue-400 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {pc}
                </button>
              ))}
            </div>
          </Field>
        </Section>

        {/* ── 해시태그 ── */}
        <Section title="해시태그">
          <p className="mb-3 text-xs text-gray-400">태블릿 앱에서 빨간 글씨로 표시됩니다. (# 자동 추가)</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {form.hashtags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-medium text-red-600"
              >
                #{tag}
                <button
                  onClick={() => removeHashtag(tag)}
                  className="text-red-400 hover:text-red-700"
                >
                  ×
                </button>
              </span>
            ))}
            {form.hashtags.length === 0 && (
              <span className="text-xs text-gray-300">해시태그를 추가하세요</span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newHashtag}
              onChange={(e) => setNewHashtag(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addHashtag())}
              placeholder="해시태그 입력 후 Enter"
              className={inputClass() + " flex-1"}
            />
            <button
              type="button"
              onClick={addHashtag}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200"
            >
              추가
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
}

// ── 공통 헬퍼 컴포넌트 ──

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="mb-4 text-sm font-bold text-gray-900">{title}</h2>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Field({ label, required, error, children }: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-gray-600">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

function inputClass(error?: string): string {
  return `w-full rounded-lg border ${
    error ? "border-red-300 bg-red-50/30" : "border-gray-200 bg-gray-50"
  } px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-red-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-200`;
}
