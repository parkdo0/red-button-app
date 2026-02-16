"use client";

import { useState, useRef, useEffect } from "react";

interface ChatThread {
  tableNo: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
}

interface Message {
  id: number;
  sender: "store" | "customer";
  text: string;
  time: string;
}

// Mock 데이터
const MOCK_THREADS: ChatThread[] = [
  { tableNo: "31", lastMessage: "화장실 어디에요?", lastTime: "2분 전", unread: 1 },
  { tableNo: "15", lastMessage: "주문한 음식 언제 나와요?", lastTime: "5분 전", unread: 1 },
  { tableNo: "7",  lastMessage: "안녕하세요, 레드버튼 수원점입니다!", lastTime: "12분 전", unread: 0 },
  { tableNo: "22", lastMessage: "카탄 게임 있나요?", lastTime: "18분 전", unread: 0 },
  { tableNo: "3",  lastMessage: "와이파이 비밀번호 알려주세요", lastTime: "25분 전", unread: 0 },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  "31": [
    { id: 1, sender: "store", text: "안녕하세요, 레드버튼 수원점입니다!\n즐거운 시간 보내시기 바랍니다.\n\n<wifi 정보>\nID: redbutton\nPW: red2563799", time: "17:02" },
    { id: 2, sender: "customer", text: "화장실 어디에요?", time: "17:11" },
  ],
  "15": [
    { id: 1, sender: "store", text: "안녕하세요, 레드버튼 수원점입니다!\n즐거운 시간 보내시기 바랍니다.", time: "16:55" },
    { id: 2, sender: "customer", text: "주문한 음식 언제 나와요?", time: "17:08" },
  ],
  "7": [
    { id: 1, sender: "store", text: "안녕하세요, 레드버튼 수원점입니다!\n즐거운 시간 보내시기 바랍니다.", time: "16:50" },
  ],
};

/**
 * 매장 > 카운터 쪽지 관리
 * 좌: 테이블별 대화 목록 / 우: 선택한 대화 상세
 */
export default function StoreChatPage() {
  const [threads] = useState(MOCK_THREADS);
  const [activeTable, setActiveTable] = useState<string>("31");
  const [messages, setMessages] = useState<Record<string, Message[]>>(MOCK_MESSAGES);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentMessages = messages[activeTable] ?? [];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [currentMessages.length, activeTable]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: Date.now(),
      sender: "store",
      text: input.trim(),
      time: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => ({
      ...prev,
      [activeTable]: [...(prev[activeTable] ?? []), newMsg],
    }));
    setInput("");
  };

  /** 빠른 답변 전송 */
  const sendQuickReply = (text: string) => {
    const newMsg: Message = {
      id: Date.now(),
      sender: "store",
      text,
      time: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => ({
      ...prev,
      [activeTable]: [...(prev[activeTable] ?? []), newMsg],
    }));
  };

  const quickReplies = [
    "네, 확인하겠습니다!",
    "잠시만 기다려주세요 😊",
    "화장실은 입구 왼쪽에 있습니다.",
    "음식은 약 5~10분 내로 나갑니다.",
  ];

  return (
    <div className="flex h-full">
      {/* 좌: 대화 목록 */}
      <div className="w-[240px] flex-shrink-0 border-r border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-bold text-gray-900">카운터 쪽지</h2>
          <p className="text-[10px] text-gray-400">
            읽지 않은 메시지 {threads.reduce((s, t) => s + t.unread, 0)}건
          </p>
        </div>
        <div className="divide-y divide-gray-50">
          {threads.map((thread) => (
            <button
              key={thread.tableNo}
              onClick={() => setActiveTable(thread.tableNo)}
              className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                activeTable === thread.tableNo ? "bg-red-50" : "hover:bg-gray-50"
              }`}
            >
              <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                thread.unread > 0 ? "bg-red-600 text-white" : "bg-gray-100 text-gray-500"
              }`}>
                {thread.tableNo}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">{thread.tableNo}번 테이블</span>
                  <span className="text-[10px] text-gray-400">{thread.lastTime}</span>
                </div>
                <p className="mt-0.5 truncate text-[11px] text-gray-500">{thread.lastMessage}</p>
              </div>
              {thread.unread > 0 && (
                <span className="mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
                  {thread.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 우: 대화 상세 */}
      <div className="flex flex-1 flex-col bg-gray-50">
        {/* 대화 헤더 */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-3">
          <h3 className="text-sm font-bold text-gray-900">{activeTable}번 테이블</h3>
        </div>

        {/* 메시지 목록 */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-3">
          {currentMessages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "store" ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                msg.sender === "store"
                  ? "bg-white border border-gray-200 text-gray-900"
                  : "bg-red-600 text-white"
              }`}>
                <p className="text-sm whitespace-pre-line">{msg.text}</p>
                <p className={`mt-1 text-[10px] ${msg.sender === "store" ? "text-gray-400" : "text-red-200"}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
          {currentMessages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-gray-300">아직 대화가 없습니다</p>
            </div>
          )}
        </div>

        {/* 빠른 답변 */}
        <div className="flex gap-2 overflow-x-auto px-5 py-2 border-t border-gray-100 bg-white">
          {quickReplies.map((text) => (
            <button
              key={text}
              onClick={() => sendQuickReply(text)}
              className="flex-shrink-0 rounded-full border border-gray-200 px-3 py-1 text-[11px] text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            >
              {text}
            </button>
          ))}
        </div>

        {/* 입력창 */}
        <div className="flex items-center gap-2 border-t border-gray-200 bg-white px-5 py-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="메시지를 입력하세요..."
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-red-300 focus:outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white disabled:bg-gray-200 disabled:text-gray-400"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
