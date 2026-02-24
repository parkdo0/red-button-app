import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/auth";

/**
 * GET /api/chat?storeId=1&tableNo=31  → 특정 테이블 메시지 목록
 * GET /api/chat?storeId=1             → 스레드 목록 (관리자용)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getApiSession(request);
    if (!session) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const storeId = Number(request.nextUrl.searchParams.get("storeId"));
    const tableNo = request.nextUrl.searchParams.get("tableNo");

    if (!storeId) {
      return NextResponse.json({ error: "storeId는 필수입니다." }, { status: 400 });
    }

    // tableNo 없으면 → 스레드 목록 반환 (관리자용)
    if (!tableNo) {
      const threads = await prisma.$queryRaw<
        { tableNo: string; lastMessage: string; lastTime: Date; unread: number; totalMessages: number }[]
      >`
        SELECT 
          cm.tableNo,
          (SELECT text FROM chat_messages WHERE storeId = cm.storeId AND tableNo = cm.tableNo ORDER BY createdAt DESC LIMIT 1) as lastMessage,
          MAX(cm.createdAt) as lastTime,
          SUM(CASE WHEN cm.isRead = false AND cm.sender = 'CUSTOMER' THEN 1 ELSE 0 END) as unread,
          COUNT(*) as totalMessages
        FROM chat_messages cm
        WHERE cm.storeId = ${storeId}
        GROUP BY cm.storeId, cm.tableNo
        ORDER BY MAX(cm.createdAt) DESC
      `;

      const formatted = threads.map((t) => ({
        tableNo: t.tableNo,
        lastMessage: t.lastMessage,
        lastTime: t.lastTime,
        unread: Number(t.unread),
        totalMessages: Number(t.totalMessages),
      }));

      return NextResponse.json(formatted);
    }

    // tableNo 있으면 → 특정 테이블 메시지 목록
    // 고객(TABLE) 요청 시 활성 세션 기준 필터링
    let sessionCheckInAt: Date | undefined;
    if (session.role === "TABLE" && session.storeId && session.tableId) {
      const activeSession = await prisma.tableSession.findFirst({
        where: { storeId: session.storeId, tableId: session.tableId, checkOutAt: null },
        orderBy: { checkInAt: "desc" },
      });
      if (activeSession) {
        sessionCheckInAt = activeSession.checkInAt;
      }
    }

    const messages = await prisma.chatMessage.findMany({
      where: {
        storeId,
        tableNo,
        ...(sessionCheckInAt ? { createdAt: { gte: sessionCheckInAt } } : {}),
      },
      orderBy: { createdAt: "asc" },
    });

    // 관리자가 읽으면 해당 테이블 고객 메시지 읽음 처리
    if (session.role !== "TABLE") {
      await prisma.chatMessage.updateMany({
        where: { storeId, tableNo, sender: "CUSTOMER", isRead: false },
        data: { isRead: true },
      });
    }

    return NextResponse.json(messages);
  } catch (error) {
    console.error("채팅 조회 실패:", error);
    return NextResponse.json({ error: "채팅을 불러오는 데 실패했습니다." }, { status: 500 });
  }
}

/**
 * POST /api/chat
 * 메시지 전송
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getApiSession(request);
    if (!session) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const body = await request.json();
    const { storeId, tableNo, sender, message } = body;

    if (!storeId || !tableNo || !sender || !message) {
      return NextResponse.json(
        { error: "storeId, tableNo, sender, message는 필수입니다." },
        { status: 400 }
      );
    }

    const validSenders = ["CUSTOMER", "STORE", "STAFF"];
    if (!validSenders.includes(sender)) {
      return NextResponse.json({ error: "sender는 CUSTOMER 또는 STORE입니다." }, { status: 400 });
    }

    // STAFF → STORE로 매핑 (DB enum은 STORE | CUSTOMER)
    const dbSender = sender === "STAFF" ? "STORE" : sender;

    const chatMessage = await prisma.chatMessage.create({
      data: { storeId, tableNo, sender: dbSender, text: message },
    });

    return NextResponse.json(chatMessage, { status: 201 });
  } catch (error) {
    console.error("메시지 전송 실패:", error);
    return NextResponse.json({ error: "메시지 전송에 실패했습니다." }, { status: 500 });
  }
}
