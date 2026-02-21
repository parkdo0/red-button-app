import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/auth";

/**
 * GET /api/chat?storeId=1&tableNo=31
 * 채팅 메시지 목록
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getApiSession(request);
    if (!session) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const storeId = Number(request.nextUrl.searchParams.get("storeId"));
    const tableNo = request.nextUrl.searchParams.get("tableNo") ?? "";

    if (!storeId || !tableNo) {
      return NextResponse.json({ error: "storeId, tableNo는 필수입니다." }, { status: 400 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { storeId, tableNo },
      orderBy: { createdAt: "asc" },
    });

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

    const validSenders = ["CUSTOMER", "STAFF"];
    if (!validSenders.includes(sender)) {
      return NextResponse.json({ error: "sender는 CUSTOMER 또는 STAFF입니다." }, { status: 400 });
    }

    const chatMessage = await prisma.chatMessage.create({
      data: { storeId, tableNo, sender, text: message },
    });

    return NextResponse.json(chatMessage, { status: 201 });
  } catch (error) {
    console.error("메시지 전송 실패:", error);
    return NextResponse.json({ error: "메시지 전송에 실패했습니다." }, { status: 500 });
  }
}
