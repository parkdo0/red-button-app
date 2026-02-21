import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/auth";

/**
 * PATCH /api/sessions/:id
 * 체크아웃 { action: "checkout" }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authSession = await getApiSession(request);
    if (!authSession) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const { id } = await params;
    const sessionId = Number(id);
    if (isNaN(sessionId)) {
      return NextResponse.json({ error: "유효하지 않은 ID입니다." }, { status: 400 });
    }

    const body = await request.json();

    if (body.action === "checkout") {
      const session = await prisma.tableSession.update({
        where: { id: sessionId },
        data: { checkOutAt: new Date() },
      });
      return NextResponse.json(session);
    }

    return NextResponse.json({ error: "지원하지 않는 action입니다." }, { status: 400 });
  } catch (error) {
    console.error("세션 업데이트 실패:", error);
    return NextResponse.json({ error: "세션 업데이트에 실패했습니다." }, { status: 500 });
  }
}
