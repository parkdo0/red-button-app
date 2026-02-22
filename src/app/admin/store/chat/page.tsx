"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "@/components/SessionProvider";

interface ChatThread {
  tableNo: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
}

interface Message {
  id: number;
  sender: "STORE" | "CUSTOMER";
  text: string;
  createdAt: string;
  tableNo?: string;
}

/**
 * 매장 > 카운터 쪽지 관리
 * SSE 실시간 수신 + POST 전송
 */
export default function StoreChatPage() {
  const session = useSession();
  const storeId = session?.storeId;

  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeTable, setActiveTable] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeTableRef = useRef<string>("");

  // ref 동기화 (SSE 콜백에서 최신 값 참조)
  useEffect(() => { activeTableRef.current = activeTable; }, [activeTable]);

  // 스레드 목록 로드
  const loadThreads = useCallback(async () => {
    if (!storeId) return;
    try {
      const res = await fetch(`/api/chat?storeId=${storeId}`);
      if (!res.ok) return;
      const data = await res.json();
      setThreads(
        data.map((t: { tableNo: string; lastMessage: string; lastTime: string; unread: number }) => ({
          tableNo: t.tableNo,
          lastMessage: t.lastMessage ?? "",
          lastTime: formatTimeAgo(t.lastTime),
          unread: Number(t.unread),
        }))
      );
      // 첫 진입 시 자동 선택
      if (!activeTableRef.current && data.length > 0) {
        setActiveTable(data[0].tableNo);
      }
    } catch {}
  }, [storeId]);

  // 특정 테이블 메시지 로드 (읽음 처리 포함)
  const loadMessages = useCallback(async () => {
    if (!storeId || !activeTable) return;
    try {
      const res = await fetch(`/api/chat?storeId=${storeId}&tableNo=${activeTable}`);
      if (!res.ok) return;
      const data: Message[] = await res.json();
      setMessages(data);
      // 읽음 처리 후 스레드 unread 즉시 반영
      setThreads((prev) =>
        prev.map((t) =>
          t.tableNo === activeTable ? { ...t, unread: 0 } : t
        )
      );
    } catch {}
  }, [storeId, activeTable]);

  // 초기 로드
  useEffect(() => { loadThreads(); }, [loadThreads]);
  useEffect(() => { loadMessages(); }, [loadMessages]);

  // SSE 연결 (관리자 모드: tableNo 없이)
  useEffect(() => {
    if (!storeId) return;

    const es = new EventSource(`/api/chat/stream?storeId=${storeId}`);

    es.addEventListener("connected", () => setConnected(true));

    es.addEventListener("threads", (e) => {
      try {
        const data: { tableNo: string; lastMessage: string; lastTime: string; unread: number }[] = JSON.parse(e.data);
        setThreads(
          data.map((t) => ({
            tableNo: t.tableNo,
            lastMessage: t.lastMessage ?? "",
            lastTime: formatTimeAgo(t.lastTime),
            unread: Number(t.unread),
          }))
        );
      } catch {}
    });

    es.addEventListener("messages", (e) => {
      try {
        const newMsgs: Message[] = JSON.parse(e.data);
        const currentTable = activeTableRef.current;

        // 현재 보고 있는 테이블의 메시지만 채팅창에 추가
        const relevant = newMsgs.filter((m) => m.tableNo === currentTable);
        if (relevant.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const toAdd = relevant.filter((m) => !existingIds.has(m.id));
            return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
          });

          // 현재 보고 있는 테이블의 고객 메시지 → 자동 읽음 처리
          const hasCustomerMsg = relevant.some((m) => m.sender === "CUSTOMER");
          if (hasCustomerMsg) {
            fetch(`/api/chat?storeId=${storeId}&tableNo=${currentTable}`).catch(() => {});
          }
        }

        // 스레드 목록에 새 메시지 즉시 반영 (lastMessage 업데이트)
        for (const msg of newMsgs) {
          const msgTable = msg.tableNo;
          if (msgTable) {
            setThreads((prev) => {
              const exists = prev.find((t) => t.tableNo === msgTable);
              if (exists) {
                return prev.map((t) =>
                  t.tableNo === msgTable
                    ? {
                        ...t,
                        lastMessage: msg.text,
                        lastTime: "방금",
                        unread: msgTable === currentTable ? 0 : t.unread + (msg.sender === "CUSTOMER" ? 1 : 0),
                      }
                    : t
                );
              }
              // 새 테이블에서 첫 메시지
              return [
                {
                  tableNo: msgTable,
                  lastMessage: msg.text,
                  lastTime: "방금",
                  unread: msg.sender === "CUSTOMER" ? 1 : 0,
                },
                ...prev,
              ];
            });
          }
        }
      } catch {}
    });

    es.onerror = () => setConnected(false);

    return () => {
      es.close();
      setConnected(false);
    };
  }, [storeId]);

  // 스크롤 하단 유지
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, activeTable]);

  // 메시지 전송
  const sendMessage = async () => {
    if (!input.trim() || !storeId || !activeTable || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          tableNo: activeTable,
          sender: "STAFF",
          message: input.trim(),
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        setInput("");
        setMessages((prev) => {
          if (prev.some((m) => m.id === saved.id)) return prev;
          return [...prev, saved];
        });
      }
    } catch {} finally { setSending(false); }
  };

  const sendQuickReply = async (text: string) => {
    if (!storeId || !activeTable || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          tableNo: activeTable,
          sender: "STAFF",
          message: text,
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        setMessages((prev) => {
          if (prev.some((m) => m.id === saved.id)) return prev;
          return [...prev, saved];
        });
      }
    } catch {} finally { setSending(false); }
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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900">카운터 쪽지</h2>
              <p className="text-[10px] text-gray-400">
                읽지 않은 메시지 {threads.reduce((s, t) => s + t.unread, 0)}건
              </p>
            </div>
            <span className={`h-2 w-2 rounded-full ${connected ? "bg-green-500" : "bg-gray-300"}`} title={connected ? "실시간 연결" : "연결 중..."} />
          </div>
        </div>
        {threads.length === 0 ? (
          <div className="flex h-40 items-center justify-center">
            <p className="text-xs text-gray-300">대화가 없습니다</p>
          </div>
        ) : (
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
        )}
      </div>

      {/* 우: 대화 상세 */}
      <div className="flex flex-1 flex-col bg-gray-50">
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-3">
          <h3 className="text-sm font-bold text-gray-900">
            {activeTable ? `${activeTable}번 테이블` : "테이블을 선택하세요"}
          </h3>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "STORE" ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                msg.sender === "STORE"
                  ? "bg-white border border-gray-200 text-gray-900"
                  : "bg-red-600 text-white"
              }`}>
                <p className="text-sm whitespace-pre-line">{msg.text}</p>
                <p className={`mt-1 text-[10px] ${msg.sender === "STORE" ? "text-gray-400" : "text-red-200"}`}>
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          ))}
          {messages.length === 0 && activeTable && (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-gray-300">아직 대화가 없습니다</p>
            </div>
          )}
          {!activeTable && (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-gray-300">좌측에서 테이블을 선택해주세요</p>
            </div>
          )}
        </div>

        {activeTable && (
          <div className="flex gap-2 overflow-x-auto px-5 py-2 border-t border-gray-100 bg-white">
            {quickReplies.map((text) => (
              <button
                key={text}
                onClick={() => sendQuickReply(text)}
                disabled={sending}
                className="flex-shrink-0 rounded-full border border-gray-200 px-3 py-1 text-[11px] text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50"
              >
                {text}
              </button>
            ))}
          </div>
        )}

        {activeTable && (
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
              disabled={!input.trim() || sending}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white disabled:bg-gray-200 disabled:text-gray-400"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "방금";
  if (min < 60) return `${min}분 전`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

function formatTime(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h >= 12 ? "오후" : "오전"} ${h > 12 ? h - 12 : h === 0 ? 12 : h}:${m}`;
}
