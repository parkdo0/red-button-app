import { NextRequest, NextResponse } from "next/server";
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
          phone: store.phone,
          wifiId: store.wifiId,
          wifiPw: store.wifiPw,
          openTime: store.openTime,
          closeTime: store.closeTime,
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

/**
 * POST /api/stores
 * 매장 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, address, phone, openTime, closeTime } = body;

    if (!name) {
      return NextResponse.json({ error: "매장명은 필수입니다." }, { status: 400 });
    }

    const store = await prisma.store.create({
      data: {
        name,
        address: address ?? null,
        phone: phone ?? null,
        openTime: openTime ?? "10:00",
        closeTime: closeTime ?? "23:00",
      },
    });

    return NextResponse.json(store, { status: 201 });
  } catch (error) {
    console.error("매장 생성 실패:", error);
    return NextResponse.json({ error: "매장 생성에 실패했습니다." }, { status: 500 });
  }
}
