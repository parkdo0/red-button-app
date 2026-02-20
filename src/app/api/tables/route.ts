import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/tables?storeId=1
 * 매장 테이블 현황 (활성 세션 포함)
 */
export async function GET(request: NextRequest) {
  try {
    const storeId = Number(request.nextUrl.searchParams.get("storeId"));
    if (!storeId) {
      return NextResponse.json({ error: "storeId는 필수입니다." }, { status: 400 });
    }

    const tables = await prisma.table.findMany({
      where: { storeId, isActive: true },
      include: {
        sessions: {
          where: { checkOutAt: null },
          take: 1,
          orderBy: { checkInAt: "desc" },
        },
      },
      orderBy: { tableNo: "asc" },
    });

    const result = tables.map((t) => {
      const session = t.sessions[0];
      const isOccupied = !!session;
      const elapsedMinutes = isOccupied
        ? Math.floor((Date.now() - new Date(session.checkInAt).getTime()) / 60000)
        : 0;
      return {
        id: t.id,
        tableNo: t.tableNo,
        seats: t.seats,
        status: isOccupied ? ("occupied" as const) : ("empty" as const),
        guestCount: session?.guestCount ?? 0,
        elapsedMinutes,
        sessionId: session?.id ?? null,
        checkInAt: session?.checkInAt ?? null,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("테이블 현황 조회 실패:", error);
    return NextResponse.json({ error: "테이블 현황을 불러오는 데 실패했습니다." }, { status: 500 });
  }
}
