import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/auth";

/** 주문 생성 요청 바디 타입 */
interface OrderItemRequest {
  menuId: number;
  quantity: number;
  selectedOptionIds: number[];
}

interface CreateOrderRequest {
  storeId: number;
  tableId: number;
  memo?: string;
  items: OrderItemRequest[];
}

/**
 * POST /api/orders
 * 장바구니 → 주문 생성 (트랜잭션)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getApiSession(request);
    if (!session) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const body: CreateOrderRequest = await request.json();

    // 세션에서 storeId/tableId 추출 (클라이언트 값 무시)
    const storeId = session.storeId!;
    const tableId = session.tableId!;

    if (!body.items?.length) {
      return NextResponse.json(
        { error: "주문 항목이 필요합니다." },
        { status: 400 }
      );
    }

    // 트랜잭션으로 주문 생성 (원자적 처리)
    const order = await prisma.$transaction(async (tx) => {
      let totalPrice = 0;

      // 1. 주문 생성 (빈 상태)
      const newOrder = await tx.order.create({
        data: {
          storeId,
          tableId,
          memo: body.memo ?? null,
          totalPrice: 0,
        },
      });

      // 2. 주문 항목 생성
      for (const item of body.items) {
        // 메뉴 조회 (스냅샷용)
        const menu = await tx.menu.findUnique({
          where: { id: item.menuId },
        });

        if (!menu) {
          throw new Error(`메뉴 ID ${item.menuId}를 찾을 수 없습니다.`);
        }

        if (!menu.isActive) {
          throw new Error(`${menu.name}은(는) 현재 품절입니다.`);
        }

        // 선택 옵션 조회
        const selectedOptions = item.selectedOptionIds.length > 0
          ? await tx.menuOption.findMany({
              where: { id: { in: item.selectedOptionIds } },
            })
          : [];

        // 소계 계산
        const optionExtra = selectedOptions.reduce((sum, o) => sum + o.extraPrice, 0);
        const subTotal = (menu.basePrice + optionExtra) * item.quantity;
        totalPrice += subTotal;

        // OrderItem 생성 (메뉴 스냅샷 저장)
        const orderItem = await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            menuId: menu.id,
            menuName: menu.name,
            basePrice: menu.basePrice,
            quantity: item.quantity,
            subTotal,
          },
        });

        // OrderItemOption 생성 (옵션 스냅샷 저장)
        if (selectedOptions.length > 0) {
          await tx.orderItemOption.createMany({
            data: selectedOptions.map((opt) => ({
              orderItemId: orderItem.id,
              optionId: opt.id,
              optionName: opt.name,
              extraPrice: opt.extraPrice,
            })),
          });
        }
      }

      // 3. 총 금액 업데이트
      const updatedOrder = await tx.order.update({
        where: { id: newOrder.id },
        data: { totalPrice },
        include: {
          items: {
            include: { options: true },
          },
        },
      });

      return updatedOrder;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("주문 생성 실패:", error);

    const message =
      error instanceof Error ? error.message : "주문 처리 중 오류가 발생했습니다.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET /api/orders?storeId=1&tableId=1&status=PENDING
 * 주문 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getApiSession(request);
    if (!session) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const storeId = searchParams.get("storeId");
    const tableId = searchParams.get("tableId");
    const status = searchParams.get("status");

    const orders = await prisma.order.findMany({
      where: {
        ...(storeId ? { storeId: Number(storeId) } : {}),
        ...(tableId ? { tableId: Number(tableId) } : {}),
        ...(status ? { status: status as "PENDING" | "CONFIRMED" | "PREPARING" | "COMPLETED" | "CANCELLED" } : {}),
      },
      include: {
        items: {
          include: { options: true },
        },
      },
      orderBy: { orderedAt: "desc" },
      take: 50,
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("주문 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "주문 목록을 불러오는 데 실패했습니다." },
      { status: 500 }
    );
  }
}
