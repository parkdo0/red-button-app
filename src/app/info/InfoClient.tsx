"use client";

import { useState, useEffect } from "react";
import { IconWifi, IconGuide, IconCustomerFeedback, IconClock } from "@/components/icons/AppIcons";

interface Props {
  storeName: string;
  tableNo: string;
  wifiId: string;
  wifiPw: string;
  checkInTime: string;
  elapsedMin: number;
}

export default function InfoClient({ storeName, tableNo, wifiId, wifiPw, checkInTime, elapsedMin }: Props) {
  const [elapsedMinutes, setElapsedMinutes] = useState(elapsedMin);
  const [showGuide, setShowGuide] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // 이용 시간 카운트업 (1분마다 증가)
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedMinutes((prev) => prev + 1);
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full overflow-y-auto scrollbar-thin bg-bg-primary">
      {/* 상단: 매장 + 이용 시간 */}
      <div className="px-8 pt-8 pb-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-text-muted">이용 매장</p>
            <h1 className="text-3xl font-black text-text-primary mt-1">
              {storeName} {tableNo}번
            </h1>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-muted">이용 시간</p>
            <p className="text-3xl font-black text-text-primary mt-1">
              {elapsedMinutes}분
            </p>
            <p className="text-[11px] text-text-muted mt-0.5">
              입장시간: {checkInTime}
            </p>
          </div>
        </div>
      </div>

      {/* 카드 3개 그리드 */}
      <div className="grid grid-cols-3 gap-4 px-8 pb-8">
        {/* Wi-Fi */}
        <div className="rb-card p-6 flex flex-col items-center text-center">
          <div className="mb-3"><IconWifi /></div>
          <h3 className="text-lg font-bold text-blue-400">Wi-Fi</h3>
          <div className="mt-4 flex flex-col gap-1">
            <div>
              <span className="text-[11px] text-text-muted">ID</span>
              <p className="text-lg font-bold text-text-primary">{wifiId}</p>
            </div>
            <div className="mt-1">
              <span className="text-[11px] text-text-muted">PW</span>
              <p className="text-lg font-bold text-text-primary">{wifiPw}</p>
            </div>
          </div>
        </div>

        {/* 이용 안내 */}
        <button
          onClick={() => setShowGuide(true)}
          className="rb-card rb-card-glow p-6 flex flex-col items-center text-center cursor-pointer touch-feedback"
        >
          <div className="mb-3"><IconGuide /></div>
          <h3 className="text-lg font-bold text-text-primary">이용 안내</h3>
          <p className="mt-2 text-xs text-text-muted leading-relaxed">
            레드버튼 이용 방법을<br />설명해 드립니다
          </p>
          <div className="mt-auto pt-4">
            <span className="inline-flex rounded-xl bg-bg-elevated px-4 py-2 text-xs font-semibold text-text-secondary">
              이용 안내 보기
            </span>
          </div>
        </button>

        {/* 고객 의견 */}
        <button
          onClick={() => setShowFeedback(true)}
          className="rb-card rb-card-glow p-6 flex flex-col items-center text-center cursor-pointer touch-feedback"
        >
          <div className="mb-3"><IconCustomerFeedback /></div>
          <h3 className="text-lg font-bold text-text-primary">고객 의견</h3>
          <p className="mt-2 text-xs text-text-muted leading-relaxed">
            레드버튼 본사로 여러분의<br />제안이나 의견을 보내주세요
          </p>
          <div className="mt-auto pt-4">
            <span className="inline-flex rounded-xl bg-red-primary/10 px-4 py-2 text-xs font-semibold text-red-primary">
              의견 작성
            </span>
          </div>
        </button>
      </div>

      {/* 하단: 언어 선택 (실제 앱에 있음) */}
      <div className="flex justify-end px-8 pb-6">
        <div className="flex items-center gap-2 rounded-full bg-bg-card border border-border-default px-4 py-2 text-xs text-text-secondary">
          <span>🇰🇷</span>
          <span>한국어</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* 이용 안내 모달 */}
      {showGuide && (
        <Modal title="이용 안내" onClose={() => setShowGuide(false)}>
          <div className="flex flex-col gap-4 text-sm text-text-secondary leading-relaxed">
            <div>
              <h4 className="font-bold text-text-primary mb-1 flex items-center gap-1.5"><IconClock /> 이용 시간</h4>
              <p>기본 2시간 이용이며, 연장은 카운터에서 가능합니다.</p>
            </div>
            <div>
              <h4 className="font-bold text-text-primary mb-1">게임 이용</h4>
              <p>진열대에서 원하는 게임을 직접 가져오시면 됩니다. 게임 규칙은 태블릿에서 확인 가능합니다.</p>
            </div>
            <div>
              <h4 className="font-bold text-text-primary mb-1">음식 주문</h4>
              <p>태블릿의 &quot;메뉴 주문&quot;에서 주문하시면 자리로 가져다 드립니다.</p>
            </div>
            <div>
              <h4 className="font-bold text-text-primary mb-1">게임 반납</h4>
              <p>사용한 게임은 원래 자리에 반납해 주세요. 진열 위치는 태블릿에서 확인 가능합니다.</p>
            </div>
          </div>
        </Modal>
      )}

      {/* 고객 의견 모달 */}
      {showFeedback && (
        <Modal title="고객 의견" onClose={() => setShowFeedback(false)}>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-text-muted">
              레드버튼 본사로 전달됩니다. 매장 관련 의견을 자유롭게 작성해 주세요.
            </p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="의견을 입력해 주세요..."
              className="rb-input min-h-[120px] resize-none p-3 text-sm"
            />
            <button
              onClick={async () => {
                if (!feedback.trim() || submitting) return;
                setSubmitting(true);
                try {
                  const res = await fetch("/api/feedback", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ content: feedback.trim() }),
                  });
                  if (res.ok) {
                    setSubmitted(true);
                    setFeedback("");
                    setTimeout(() => {
                      setShowFeedback(false);
                      setSubmitted(false);
                    }, 1500);
                  }
                } catch { /* ignore */ }
                finally { setSubmitting(false); }
              }}
              disabled={!feedback.trim() || submitting}
              className={`w-full rounded-2xl py-3 text-sm font-bold transition-all touch-feedback ${
                feedback.trim() && !submitting
                  ? "rb-btn-primary"
                  : "bg-bg-card text-text-muted cursor-not-allowed"
              }`}
            >
              {submitted ? "제출 완료!" : submitting ? "제출 중..." : "제출하기"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/** 모달 공통 */
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] animate-backdrop" onClick={onClose}>
      <div className="w-full max-w-lg rounded-3xl bg-bg-secondary border border-border-default p-6 shadow-2xl animate-modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
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
