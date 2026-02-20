import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/sessions/active?storeId=1&tableNo=31
 * 현재 활성 세션 조회
 */
export async function GET(request: NextRequest) {
  try {
    const storeId = Number(request.nextUrl.searchParams.get("storeId"));
    const tableNo = request.nextUrl.searchParams.get("tableNo") ?? "";

    if (!storeId || !tableNo) {
      return NextResponse.json({ error: "storeId, tableNo는 필수입니다." }, { status: 400 });
    }

    const table = await prisma.table.findFirst({
      where: { storeId, tableNo },
    });

    if (!table) {
      return NextResponse.json(null);
    }

    const session = await prisma.tableSession.findFirst({
      where: { storeId, tableId: table.id, checkOutAt: null },
      orderBy: { checkInAt: "desc" },
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error("세션 조회 실패:", error);
    return NextResponse.json({ error: "세션 조회에 실패했습니다." }, { status: 500 });
  }
}
