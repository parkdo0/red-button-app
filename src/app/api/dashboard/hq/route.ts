import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/dashboard/hq
 * 본사 대시보드 통계 (매장 현황, 게임수, 전체 주문/매출)
 */
export async function GET() {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 1) 전체 게임 수
    const totalGames = await prisma.game.count({ where: { isActive: true } });

    // 2) 매장별 현황
    const stores = await prisma.store.findMany({
      include: {
        tables: { where: { isActive: true }, select: { id: true } },
        storeGames: { where: { isVisible: true }, select: { gameId: true } },
        orders: {
          where: { orderedAt: { gte: todayStart, lte: todayEnd } },
          select: { totalPrice: true, status: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const storeStats = stores.map((store) => {
      const todayOrders = store.orders.length;
      const todayRevenue = store.orders
        .filter((o) => o.status !== "CANCELLED")
        .reduce((sum, o) => sum + o.totalPrice, 0);
      return {
        id: store.id,
        name: store.name,
        isActive: store.isActive,
        tableCount: store.tables.length,
        gameCount: store.storeGames.length,
        todayOrders,
        todayRevenue,
      };
    });

    const activeStores = storeStats.filter((s) => s.isActive).length;
    const totalOrders = storeStats.reduce((sum, s) => sum + s.todayOrders, 0);
    const totalRevenue = storeStats.reduce((sum, s) => sum + s.todayRevenue, 0);

    return NextResponse.json({
      totalGames,
      activeStores,
      totalStores: stores.length,
      totalOrders,
      totalRevenue,
      stores: storeStats,
    });
  } catch (error) {
    console.error("본사 대시보드 조회 실패:", error);
    return NextResponse.json({ error: "대시보드를 불러오는 데 실패했습니다." }, { status: 500 });
  }
}
