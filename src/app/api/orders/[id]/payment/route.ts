import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/orders/[id]/payment
 * 결제 콜백 엔드포인트
 * 
 * 실제 환경: VAN사(KICC, NICE 등)가 카드 단말기 결제 결과를 이 엔드포인트로 전송
 * 클론 환경: 클라이언트에서 mock으로 호출 (현재는 주문 생성 시 바로 COMPLETED로 저장)
 * 
 * 향후 확장 시:
 * 1. 주문 생성 시 paymentStatus = "PENDING"으로 생성
 * 2. VAN사 단말기에 금액 전송 (WebSocket 또는 SDK)
 * 3. 단말기 결제 완료 → VAN사가 이 엔드포인트로 POST
 * 4. paymentStatus 업데이트 → 클라이언트에 결과 전달 (SSE/polling)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = Number(id);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: "유효하지 않은 주문 ID입니다." }, { status: 400 });
    }

    const body = await request.json();
    const { status, transactionId } = body as {
      status: "COMPLETED" | "FAILED";
      transactionId?: string;
    };

    if (!status || !["COMPLETED", "FAILED"].includes(status)) {
      return NextResponse.json(
        { error: "status는 COMPLETED 또는 FAILED여야 합니다." },
        { status: 400 }
      );
    }

    // 주문 존재 확인
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: "주문을 찾을 수 없습니다." }, { status: 404 });
    }

    // 결제 상태 업데이트
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: status,
        ...(status === "COMPLETED" ? { paidAt: new Date() } : {}),
      },
    });

    console.log(
      `[Payment Callback] Order #${orderId}: ${status}` +
      (transactionId ? ` (txn: ${transactionId})` : "")
    );

    return NextResponse.json({
      success: true,
      orderId: updated.id,
      paymentStatus: updated.paymentStatus,
      paidAt: updated.paidAt,
    });
  } catch (error) {
    console.error("결제 콜백 처리 실패:", error);
    return NextResponse.json(
      { error: "결제 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
