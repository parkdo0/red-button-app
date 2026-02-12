"use client";

import { useState, useCallback } from "react";

interface KitTool {
  id: string;
  title: string;
  description: string;
  buttonLabel: string;
  gradient: string;
  buttonColor: string;
  emoji: string;
  badge?: string;
}

const KIT_TOOLS: KitTool[] = [
  {
    id: "roulette",
    title: "벌칙 룰렛",
    description: "룰렛을 돌려 재밌는 벌칙으로\n게임을 더 즐겨보세요.",
    buttonLabel: "룰렛 굴리기",
    gradient: "from-pink-600 via-rose-500 to-pink-700",
    buttonColor: "bg-pink-400 hover:bg-pink-500",
    emoji: "🎰",
    badge: "HOT",
  },
  {
    id: "first",
    title: "선 정하기 게임",
    description: "가위바위보 말고 색다른 방법으로\n선을 정해보세요.",
    buttonLabel: "선 정하기",
    gradient: "from-cyan-600 via-cyan-500 to-teal-600",
    buttonColor: "bg-cyan-400 hover:bg-cyan-500",
    emoji: "⭐",
  },
  {
    id: "team",
    title: "팀 정하기 게임",
    description: "누구랑 같은 팀이 되고 싶나요?\n최대 8팀까지 나눠보세요.",
    buttonLabel: "팀 정하기",
    gradient: "from-violet-600 via-purple-500 to-violet-700",
    buttonColor: "bg-violet-400 hover:bg-violet-500",
    emoji: "👥",
  },
];

/** 벌칙 목록 */
const PUNISHMENTS = [
  "물 한 잔 원샷! 💧",
  "30초 안에 자기소개 랩 하기 🎤",
  "옆 사람 칭찬 3개 하기 💕",
  "개인기 하나 보여주기 🎪",
  "1분 동안 말 안 하기 🤫",
  "다음 판 핸디캡! 😈",
  "얼음 하나 입에 넣고 10초 🧊",
  "가장 좋아하는 노래 한 소절 🎵",
];

/**
 * 게임 키트 - 실제 레드버튼 앱 기준
 * 벌칙 룰렛 / 선 정하기 / 팀 정하기 3개 카드
 */
export default function KitPage() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  return (
    <div className="h-full overflow-y-auto scrollbar-thin bg-bg-primary">
      <div className="flex h-full items-center justify-center gap-5 px-8 py-8">
        {KIT_TOOLS.map((tool) => (
          <div
            key={tool.id}
            className={`relative flex h-[360px] w-[260px] flex-col items-center justify-between rounded-3xl bg-gradient-to-b ${tool.gradient} p-6 shadow-2xl`}
          >
            {/* HOT 뱃지 */}
            {tool.badge && (
              <span className="absolute top-4 left-4 rounded-full bg-red-500 px-2.5 py-0.5 text-[10px] font-bold text-white">
                {tool.badge}
              </span>
            )}

            {/* 이모지 */}
            <div className="flex-1 flex items-center justify-center">
              <span className="text-7xl drop-shadow-lg">{tool.emoji}</span>
            </div>

            {/* 텍스트 */}
            <div className="text-center">
              <h3 className="text-xl font-black text-white">{tool.title}</h3>
              <p className="mt-2 text-[12px] text-white/70 whitespace-pre-line leading-relaxed">
                {tool.description}
              </p>
            </div>

            {/* 버튼 */}
            <button
              onClick={() => setActiveModal(tool.id)}
              className={`mt-4 w-full rounded-xl ${tool.buttonColor} py-3 text-[14px] font-bold text-white transition-colors touch-feedback`}
            >
              {tool.buttonLabel}
            </button>
          </div>
        ))}
      </div>

      {/* 모달: 벌칙 룰렛 */}
      {activeModal === "roulette" && (
        <RouletteModal onClose={() => setActiveModal(null)} />
      )}

      {/* 모달: 선 정하기 */}
      {activeModal === "first" && (
        <FirstPickerModal onClose={() => setActiveModal(null)} />
      )}

      {/* 모달: 팀 정하기 */}
      {activeModal === "team" && (
        <TeamPickerModal onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
}

// ──────────────────────────────────────
// 벌칙 룰렛 모달
// ──────────────────────────────────────
function RouletteModal({ onClose }: { onClose: () => void }) {
  const [result, setResult] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);

  const spin = useCallback(() => {
    setSpinning(true);
    setResult(null);
    setTimeout(() => {
      const idx = Math.floor(Math.random() * PUNISHMENTS.length);
      setResult(PUNISHMENTS[idx]);
      setSpinning(false);
    }, 1500);
  }, []);

  return (
    <ToolModal title="벌칙 룰렛 🎰" onClose={onClose}>
      <div className="flex flex-col items-center gap-6 py-4">
        <div className={`flex h-32 w-full items-center justify-center rounded-2xl bg-bg-card border border-border-default ${spinning ? "animate-pulse" : ""}`}>
          {spinning ? (
            <span className="text-2xl font-bold text-text-muted">🎰 돌리는 중...</span>
          ) : result ? (
            <span className="text-xl font-bold text-red-primary px-4 text-center">{result}</span>
          ) : (
            <span className="text-lg text-text-muted">버튼을 눌러 룰렛을 돌려보세요!</span>
          )}
        </div>
        <button
          onClick={spin}
          disabled={spinning}
          className="rb-btn-primary w-full py-3.5 text-base disabled:opacity-60"
        >
          {spinning ? "돌리는 중..." : "룰렛 굴리기"}
        </button>
      </div>
    </ToolModal>
  );
}

// ──────────────────────────────────────
// 선 정하기 모달
// ──────────────────────────────────────
function FirstPickerModal({ onClose }: { onClose: () => void }) {
  const [playerCount, setPlayerCount] = useState(4);
  const [result, setResult] = useState<number | null>(null);

  const pick = () => {
    setResult(null);
    setTimeout(() => {
      setResult(Math.floor(Math.random() * playerCount) + 1);
    }, 800);
  };

  return (
    <ToolModal title="선 정하기 ⭐" onClose={onClose}>
      <div className="flex flex-col gap-5 py-2">
        <div>
          <label className="text-sm font-semibold text-text-secondary mb-2 block">인원 수</label>
          <div className="flex gap-2">
            {[2, 3, 4, 5, 6, 7, 8].map((n) => (
              <button
                key={n}
                onClick={() => { setPlayerCount(n); setResult(null); }}
                className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all touch-feedback ${
                  playerCount === n
                    ? "bg-cyan-500 text-white"
                    : "bg-bg-card text-text-muted border border-border-default"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="flex h-24 items-center justify-center rounded-2xl bg-bg-card border border-border-default">
          {result ? (
            <span className="text-3xl font-black text-cyan-400">{result}번째 사람이 선!</span>
          ) : (
            <span className="text-text-muted">결과가 여기에 표시됩니다</span>
          )}
        </div>

        <button onClick={pick} className="w-full rounded-xl bg-cyan-500 py-3.5 text-base font-bold text-white hover:bg-cyan-600 transition-colors touch-feedback">
          선 정하기
        </button>
      </div>
    </ToolModal>
  );
}

// ──────────────────────────────────────
// 팀 정하기 모달
// ──────────────────────────────────────
function TeamPickerModal({ onClose }: { onClose: () => void }) {
  const [playerCount, setPlayerCount] = useState(6);
  const [teamCount, setTeamCount] = useState(2);
  const [teams, setTeams] = useState<number[][] | null>(null);

  const pickTeams = () => {
    const players = Array.from({ length: playerCount }, (_, i) => i + 1);
    // Fisher-Yates shuffle
    for (let i = players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [players[i], players[j]] = [players[j], players[i]];
    }
    const result: number[][] = Array.from({ length: teamCount }, () => []);
    players.forEach((p, i) => result[i % teamCount].push(p));
    setTeams(result);
  };

  return (
    <ToolModal title="팀 정하기 👥" onClose={onClose}>
      <div className="flex flex-col gap-4 py-2">
        <div>
          <label className="text-sm font-semibold text-text-secondary mb-2 block">인원 수</label>
          <div className="flex gap-2">
            {[4, 5, 6, 7, 8, 9, 10].map((n) => (
              <button
                key={n}
                onClick={() => { setPlayerCount(n); setTeams(null); }}
                className={`flex-1 rounded-xl py-2 text-sm font-bold transition-all touch-feedback ${
                  playerCount === n ? "bg-violet-500 text-white" : "bg-bg-card text-text-muted border border-border-default"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-text-secondary mb-2 block">팀 수</label>
          <div className="flex gap-2">
            {[2, 3, 4].map((n) => (
              <button
                key={n}
                onClick={() => { setTeamCount(n); setTeams(null); }}
                className={`flex-1 rounded-xl py-2 text-sm font-bold transition-all touch-feedback ${
                  teamCount === n ? "bg-violet-500 text-white" : "bg-bg-card text-text-muted border border-border-default"
                }`}
              >
                {n}팀
              </button>
            ))}
          </div>
        </div>

        {teams && (
          <div className="flex gap-3 mt-1">
            {teams.map((team, i) => (
              <div key={i} className="flex-1 rounded-2xl bg-bg-card border border-border-default p-3 text-center">
                <p className="text-xs font-bold text-violet-400 mb-2">{i + 1}팀</p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {team.map((p) => (
                    <span key={p} className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/20 text-xs font-bold text-violet-300">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <button onClick={pickTeams} className="w-full rounded-xl bg-violet-500 py-3.5 text-base font-bold text-white hover:bg-violet-600 transition-colors touch-feedback">
          팀 정하기
        </button>
      </div>
    </ToolModal>
  );
}

// ──────────────────────────────────────
// 공통 모달
// ──────────────────────────────────────
function ToolModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] animate-backdrop" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-bg-secondary border border-border-default p-6 shadow-2xl animate-modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-primary">{title}</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl text-text-muted hover:bg-bg-card hover:text-text-primary transition-colors touch-feedback">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
