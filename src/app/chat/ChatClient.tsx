"use client";

import { useState, useRef, useEffect } from "react";

export interface ChatMsg {
  id: number;
  sender: "store" | "customer";
  text: string;
  time: string;
}

/** 빠른 질문 버튼 */
const QUICK_BUTTONS = [
  { label: "🕐 이용 시간", message: "이용 시간이 얼마나 남았나요?" },
  { label: "📶 와이파이 비밀번호", message: "와이파이 비밀번호가 뭔가요?" },
  { label: "🚻 화장실 위치", message: "화장실이 어디에 있나요?" },
];

interface Props {
  storeName: string;
  initialMessages: ChatMsg[];
}

/** 매장 자동 응답 */
const AUTO_REPLIES: Record<string, string> = {
  "이용 시간이 얼마나 남았나요?": "현재 이용 시간은 약 1시간 32분 남았습니다. 연장을 원하시면 카운터로 말씀해주세요!",
  "와이파이 비밀번호가 뭔가요?": "와이파이 정보입니다!\nID: redbutton\nPW: red2563799",
  "화장실이 어디에 있나요?": "화장실은 매장 입구 왼쪽에 있습니다. 성별 구분 없이 이용 가능합니다!",
};

function getCurrentTime(): string {
  const now = new Date();
  const h = now.getHours();
  const m = String(now.getMinutes()).padStart(2, "0");
  const period = h >= 12 ? "오후" : "오전";
  const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${period} ${hour12}:${m}`;
}

/**
 * 카운터 쪽지 - 실제 레드버튼 앱 기준
 * 카카오톡 스타일 채팅 UI + 빠른 질문 버튼
 */
export default function ChatClient({ storeName, initialMessages }: Props) {
  const [messages, setMessages] = useState<ChatMsg[]>(initialMessages);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextIdRef = useRef(initialMessages.length + 1);

  // 메시지 추가 시 스크롤
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const customerMsg: ChatMsg = {
      id: nextIdRef.current++,
      sender: "customer",
      text: text.trim(),
      time: getCurrentTime(),
    };
    setMessages((prev) => [...prev, customerMsg]);
    setInput("");

    // 자동 응답 (1초 딜레이)
    const reply = AUTO_REPLIES[text.trim()];
    if (reply) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: nextIdRef.current++,
            sender: "store",
            text: reply,
            time: getCurrentTime(),
          },
        ]);
      }, 1000);
    } else {
      // 기본 응답
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: nextIdRef.current++,
            sender: "store",
            text: "확인했습니다! 곧 답변 드리겠습니다 😊",
            time: getCurrentTime(),
          },
        ]);
      }, 1200);
    }
  };

  return (
    <div className="flex h-full flex-col bg-bg-primary">
      {/* 헤더 */}
      <div className="flex-shrink-0 border-b border-border-default px-6 py-4">
        <h1 className="text-lg font-bold text-text-primary">{storeName}</h1>
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
            disabled={!input.trim()}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-all touch-feedback ${
              input.trim()
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
