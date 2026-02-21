import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/auth";

/**
 * GET /api/tables?storeId=1
 * 매장 테이블 현황 (활성 세션 포함)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getApiSession(request);
    if (!session) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

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
      const activeSession = t.sessions[0];
      const isOccupied = !!activeSession;
      const elapsedMinutes = isOccupied
        ? Math.floor((Date.now() - new Date(activeSession.checkInAt).getTime()) / 60000)
        : 0;
      return {
        id: t.id,
        tableNo: t.tableNo,
        seats: t.seats,
        setupCode: t.setupCode ?? null,
        status: isOccupied ? ("occupied" as const) : ("empty" as const),
        guestCount: activeSession?.guestCount ?? 0,
        elapsedMinutes,
        sessionId: activeSession?.id ?? null,
        checkInAt: activeSession?.checkInAt ?? null,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("테이블 현황 조회 실패:", error);
    return NextResponse.json({ error: "테이블 현황을 불러오는 데 실패했습니다." }, { status: 500 });
  }
}
