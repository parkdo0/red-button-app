import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/auth";

/**
 * GET /api/feedback — 본사 관리자용 피드백 목록
 * ?page=1&limit=20
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getApiSession(request);
    if (!session || session.role === "TABLE") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const page = Number(request.nextUrl.searchParams.get("page") ?? "1");
    const limit = Number(request.nextUrl.searchParams.get("limit") ?? "20");
    const skip = (page - 1) * limit;

    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.feedback.count(),
    ]);

    return NextResponse.json({ feedbacks, total, page, limit });
  } catch (error) {
    console.error("피드백 조회 실패:", error);
    return NextResponse.json({ error: "피드백을 불러오는 데 실패했습니다." }, { status: 500 });
  }
}

/**
 * POST /api/feedback — 고객 의견 제출
 * body: { storeId, tableNo, content }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getApiSession(request);
    if (!session) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: "내용을 입력해 주세요." }, { status: 400 });
    }

    const storeId = session.storeId ?? body.storeId;
    const tableNo = session.tableNo ?? body.tableNo ?? "";

    const feedback = await prisma.feedback.create({
      data: { storeId, tableNo, content: content.trim() },
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error("피드백 제출 실패:", error);
    return NextResponse.json({ error: "피드백 제출에 실패했습니다." }, { status: 500 });
  }
}
