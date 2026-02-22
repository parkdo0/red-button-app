import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/coupons/:id — 쿠폰 수정
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const couponId = Number(id);
    if (isNaN(couponId)) return NextResponse.json({ error: "유효하지 않은 ID" }, { status: 400 });

    const body = await request.json();

    // startDate/endDate 문자열 → Date 변환
    if (body.startDate) body.startDate = new Date(body.startDate);
    if (body.endDate) body.endDate = new Date(body.endDate);

    const coupon = await prisma.coupon.update({ where: { id: couponId }, data: body });
    return NextResponse.json(coupon);
  } catch (error) {
    console.error("쿠폰 수정 실패:", error);
    return NextResponse.json({ error: "쿠폰 수정에 실패했습니다." }, { status: 500 });
  }
}

/**
 * DELETE /api/coupons/:id — 쿠폰 비활성화
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const couponId = Number(id);
    if (isNaN(couponId)) return NextResponse.json({ error: "유효하지 않은 ID" }, { status: 400 });

    await prisma.coupon.update({ where: { id: couponId }, data: { isActive: false } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("쿠폰 삭제 실패:", error);
    return NextResponse.json({ error: "쿠폰 삭제에 실패했습니다." }, { status: 500 });
  }
}
