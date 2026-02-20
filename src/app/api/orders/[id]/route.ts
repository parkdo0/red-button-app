import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/orders/:id
 * 주문 상태 변경 (PENDING → CONFIRMED → PREPARING → COMPLETED / CANCELLED)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = Number(id);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "유효하지 않은 ID입니다." }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    const validStatuses = ["PENDING", "CONFIRMED", "PREPARING", "COMPLETED", "CANCELLED"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `유효하지 않은 상태입니다. (${validStatuses.join(", ")})` },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: { include: { options: true } },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("주문 상태 변경 실패:", error);
    return NextResponse.json(
      { error: "주문 상태 변경에 실패했습니다." },
      { status: 500 }
    );
  }
}
