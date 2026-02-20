import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/sessions
 * 체크인 (새 세션 생성)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeId, tableId, guestCount } = body;

    if (!storeId || !tableId) {
      return NextResponse.json({ error: "storeId, tableId는 필수입니다." }, { status: 400 });
    }

    // 이미 활성 세션이 있는지 확인
    const existing = await prisma.tableSession.findFirst({
      where: { storeId, tableId, checkOutAt: null },
    });

    if (existing) {
      return NextResponse.json(
        { error: "이미 활성화된 세션이 있습니다. 먼저 체크아웃해주세요." },
        { status: 409 }
      );
    }

    const session = await prisma.tableSession.create({
      data: {
        storeId,
        tableId,
        guestCount: guestCount ?? 1,
      },
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error("체크인 실패:", error);
    return NextResponse.json({ error: "체크인에 실패했습니다." }, { status: 500 });
  }
}
