import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/stores
 * 매장 목록 (테이블수, 게임수, 오늘 주문/매출 포함)
 */
export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      orderBy: { id: "asc" },
      include: {
        _count: {
          select: {
            tables: true,
            storeGames: true,
          },
        },
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await Promise.all(
      stores.map(async (store) => {
        const todayOrders = await prisma.order.findMany({
          where: {
            storeId: store.id,
            orderedAt: { gte: today },
          },
          select: { totalPrice: true },
        });

        return {
          id: store.id,
          name: store.name,
          address: store.address,
          isActive: store.isActive,
          tableCount: store._count.tables,
          gameCount: store._count.storeGames,
          todayOrders: todayOrders.length,
          todayRevenue: todayOrders.reduce((sum, o) => sum + o.totalPrice, 0),
        };
      })
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("매장 조회 실패:", error);
    return NextResponse.json({ error: "매장을 불러오는 데 실패했습니다." }, { status: 500 });
  }
}
