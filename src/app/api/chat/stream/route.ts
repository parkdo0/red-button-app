import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/chat/stream — SSE 실시간 채팅 스트림
 * 
 * 고객: ?storeId=1&tableNo=31 → 해당 테이블 메시지만
 * 관리자: ?storeId=1 → 전체 테이블 메시지 (스레드 업데이트 포함)
 */
export async function GET(request: NextRequest) {
  const storeId = Number(request.nextUrl.searchParams.get("storeId"));
  const tableNo = request.nextUrl.searchParams.get("tableNo") ?? "";
  const isAdmin = !tableNo; // tableNo 없으면 관리자 모드

  if (!storeId) {
    return new Response("storeId is required", { status: 400 });
  }

  let lastId = 0;
  let alive = true;
  let pollCount = 0;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          alive = false;
        }
      };

      // 관리자용: 스레드 요약 조회 함수
      const fetchThreads = async () => {
        const threads = await prisma.$queryRaw<
          { tableNo: string; lastMessage: string; lastTime: string; unread: number }[]
        >`
          SELECT 
            tableNo,
            (SELECT text FROM chat_messages c2 
             WHERE c2.storeId = ${storeId} AND c2.tableNo = chat_messages.tableNo 
             ORDER BY c2.id DESC LIMIT 1) as lastMessage,
            (SELECT createdAt FROM chat_messages c3 
             WHERE c3.storeId = ${storeId} AND c3.tableNo = chat_messages.tableNo 
             ORDER BY c3.id DESC LIMIT 1) as lastTime,
            SUM(CASE WHEN sender = 'CUSTOMER' AND isRead = false THEN 1 ELSE 0 END) as unread
          FROM chat_messages
          WHERE storeId = ${storeId}
          GROUP BY tableNo
          ORDER BY lastTime DESC
        `;
        return threads;
      };

      // 초기 lastId 설정
      try {
        const latest = await prisma.chatMessage.findFirst({
          where: isAdmin ? { storeId } : { storeId, tableNo },
          orderBy: { id: "desc" },
          select: { id: true },
        });
        lastId = latest?.id ?? 0;
      } catch {
        lastId = 0;
      }

      // 연결 확인
      send("connected", { storeId, tableNo, isAdmin });

      // 관리자 모드: 초기 스레드 데이터 전송
      if (isAdmin) {
        try {
          const threads = await fetchThreads();
          send("threads", threads);
        } catch {}
      }

      // 1.5초마다 새 메시지 확인
      const poll = async () => {
        while (alive) {
          try {
            const where = isAdmin
              ? { storeId, id: { gt: lastId } }
              : { storeId, tableNo, id: { gt: lastId } };

            const newMessages = await prisma.chatMessage.findMany({
              where,
              orderBy: { id: "asc" },
            });

            if (newMessages.length > 0) {
              lastId = newMessages[newMessages.length - 1].id;
              send("messages", newMessages);
            }

            // 관리자: 매 3번째 폴링(~4.5초)마다 스레드 갱신 (읽음 상태 반영)
            if (isAdmin) {
              pollCount++;
              if (newMessages.length > 0 || pollCount % 3 === 0) {
                const threads = await fetchThreads();
                send("threads", threads);
              }
            }
          } catch {
            // DB 에러 시 무시하고 계속
          }

          // 1.5초 대기
          await new Promise((r) => setTimeout(r, 1500));
        }
      };

      // 30초마다 heartbeat
      const heartbeat = setInterval(() => {
        if (!alive) {
          clearInterval(heartbeat);
          return;
        }
        send("heartbeat", { time: Date.now() });
      }, 30000);

      // 폴링 시작
      poll().finally(() => {
        clearInterval(heartbeat);
        try { controller.close(); } catch {}
      });
    },
    cancel() {
      alive = false;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
