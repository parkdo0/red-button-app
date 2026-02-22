"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export interface ChatMsg {
  id: number;
  sender: "store" | "customer";
  text: string;
  time: string;
}

/** 빠른 질문 버튼 */
const QUICK_BUTTONS = [
  { label: "이용 시간", message: "이용 시간이 얼마나 남았나요?" },
  { label: "와이파이 비밀번호", message: "와이파이 비밀번호가 뭔가요?" },
  { label: "화장실 위치", message: "화장실이 어디에 있나요?" },
];

interface Props {
  storeName: string;
  storeId: number;
  tableNo: string;
  initialMessages: ChatMsg[];
}

function getCurrentTime(): string {
  const now = new Date();
  const h = now.getHours();
  const m = String(now.getMinutes()).padStart(2, "0");
  const period = h >= 12 ? "오후" : "오전";
  const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${period} ${hour12}:${m}`;
}

function formatMsgTime(dateStr: string): string {
  const d = new Date(dateStr);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const period = h >= 12 ? "오후" : "오전";
  const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${period} ${hour12}:${m}`;
}

/**
 * 카운터 쪽지 - SSE 실시간 채팅
 * 메시지 전송: POST /api/chat
 * 메시지 수신: SSE /api/chat/stream
 */
export default function ChatClient({ storeName, storeId, tableNo, initialMessages }: Props) {
  const [messages, setMessages] = useState<ChatMsg[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const seenIdsRef = useRef<Set<number>>(new Set(initialMessages.map((m) => m.id)));

  // 메시지 추가 시 스크롤
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // SSE 연결
  useEffect(() => {
    const es = new EventSource(`/api/chat/stream?storeId=${storeId}&tableNo=${tableNo}`);

    es.addEventListener("connected", () => {
      setConnected(true);
    });

    es.addEventListener("messages", (e) => {
      try {
        const newMsgs: { id: number; sender: string; text: string; createdAt: string }[] = JSON.parse(e.data);
        setMessages((prev) => {
          const toAdd: ChatMsg[] = [];
          for (const m of newMsgs) {
            if (!seenIdsRef.current.has(m.id)) {
              seenIdsRef.current.add(m.id);
              toAdd.push({
                id: m.id,
                sender: m.sender === "STORE" ? "store" : "customer",
                text: m.text,
                time: formatMsgTime(m.createdAt),
              });
            }
          }
          return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
        });
      } catch {}
    });

    es.onerror = () => {
      setConnected(false);
      // 자동 재연결 (EventSource 기본 동작)
    };

    return () => {
      es.close();
      setConnected(false);
    };
  }, [storeId, tableNo]);

  // 메시지 전송
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || sending) return;
    setSending(true);

    // 낙관적 업데이트
    const tempId = -(Date.now());
    const optimisticMsg: ChatMsg = {
      id: tempId,
      sender: "customer",
      text: text.trim(),
      time: getCurrentTime(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          tableNo,
          sender: "CUSTOMER",
          text: text.trim(),
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        // 낙관적 메시지를 실제 ID로 교체
        seenIdsRef.current.add(saved.id);
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, id: saved.id } : m))
        );
      }
    } catch {
      // 전송 실패 시 메시지 유지 (재시도 가능)
    } finally {
      setSending(false);
    }
  }, [storeId, tableNo, sending]);

  return (
    <div className="flex h-full flex-col bg-bg-primary">
      {/* 헤더 */}
      <div className="flex-shrink-0 border-b border-border-default px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-text-primary">{storeName}</h1>
          <span className={`h-2 w-2 rounded-full ${connected ? "bg-green-500" : "bg-gray-400"}`} title={connected ? "연결됨" : "연결 중..."} />
        </div>
      </div>

      {/* 채팅 영역 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4">
        <div className="flex flex-col gap-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "customer" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex items-end gap-1.5 max-w-[70%] ${msg.sender === "customer" ? "flex-row-reverse" : ""}`}>
                <div
                  className={`rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed whitespace-pre-line ${
                    msg.sender === "store"
                      ? "bg-bg-card border border-border-default text-text-primary rounded-tl-md"
                      : "bg-red-primary text-white rounded-tr-md"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-text-muted flex-shrink-0">{msg.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 하단: 입력 + 빠른 버튼 */}
      <div className="flex-shrink-0 border-t border-border-default bg-bg-secondary">
        {/* 빠른 질문 버튼 */}
        <div className="flex gap-2 px-4 pt-3 pb-2 overflow-x-auto scrollbar-hide">
          {QUICK_BUTTONS.map((btn) => (
            <button
              key={btn.label}
              onClick={() => sendMessage(btn.message)}
              className="flex-shrink-0 rounded-full bg-bg-card border border-border-default px-4 py-2 text-[12px] font-medium text-text-secondary hover:border-red-primary/30 hover:text-red-primary transition-colors touch-feedback"
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* 입력란 */}
        <div className="flex items-center gap-2 px-4 pb-4 pt-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="카운터에 보낼 메시지를 입력해주세요"
            className="rb-input flex-1 py-2.5 px-4 text-[13px]"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || sending}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-all touch-feedback ${
              input.trim() && !sending
                ? "bg-red-primary text-white"
                : "bg-bg-card text-text-muted"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
