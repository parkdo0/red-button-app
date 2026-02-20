import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/dashboard/store?storeId=1
 * 매장 대시보드 통계 (주문현황, 테이블, 매출, 최근주문)
 */
export async function GET(request: NextRequest) {
  try {
    const storeId = Number(request.nextUrl.searchParams.get("storeId"));
    if (!storeId) {
      return NextResponse.json({ error: "storeId는 필수입니다." }, { status: 400 });
    }

    // 오늘 날짜 범위
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 1) 주문 통계
    const orders = await prisma.order.findMany({
      where: { storeId, orderedAt: { gte: todayStart, lte: todayEnd } },
      include: {
        items: { select: { menuName: true, quantity: true, subTotal: true } },
        table: { select: { tableNo: true } },
      },
      orderBy: { orderedAt: "desc" },
    });

    const pendingOrders = orders.filter((o) => o.status === "PENDING").length;
    const preparingOrders = orders.filter((o) => o.status === "PREPARING").length;
    const todayRevenue = orders
      .filter((o) => o.status !== "CANCELLED")
      .reduce((sum, o) => sum + o.totalPrice, 0);

    // 2) 테이블 현황
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

    const tableStatus = tables.map((t) => {
      const activeSession = t.sessions[0];
      const isOccupied = !!activeSession;
      const elapsedMinutes = isOccupied
        ? Math.floor((Date.now() - new Date(activeSession.checkInAt).getTime()) / 60000)
        : 0;
      return {
        id: t.id,
        tableNo: t.tableNo,
        seats: t.seats,
        status: isOccupied ? "occupied" : "empty",
        guestCount: activeSession?.guestCount ?? 0,
        elapsedMinutes,
      };
    });

    const occupiedTables = tableStatus.filter((t) => t.status === "occupied").length;

    // 3) 보유 게임 수
    const visibleGames = await prisma.storeGame.count({
      where: { storeId, isVisible: true },
    });

    // 4) 최근 주문 5건
    const recentOrders = orders.slice(0, 5).map((o) => ({
      id: o.id,
      tableNo: o.table?.tableNo ?? "-",
      status: o.status,
      totalPrice: o.totalPrice,
      orderedAt: o.orderedAt,
      items: o.items.map((i) => ({
        menuName: i.menuName,
        quantity: i.quantity,
        subTotal: i.subTotal,
      })),
    }));

    return NextResponse.json({
      pendingOrders,
      preparingOrders,
      occupiedTables,
      totalTables: tables.length,
      visibleGames,
      todayRevenue,
      recentOrders,
      tableStatus,
    });
  } catch (error) {
    console.error("매장 대시보드 조회 실패:", error);
    return NextResponse.json({ error: "대시보드를 불러오는 데 실패했습니다." }, { status: 500 });
  }
}
