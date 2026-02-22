import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/auth";

/**
 * GET /api/coupons — 쿠폰 목록 (관리자) 또는 코드 검증 (고객)
 * ?code=XXXX → 코드 검증 (고객용)
 * ?page=1&limit=20 → 목록 (관리자용)
 */
export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code");

    // 쿠폰 코드 검증 (고객용)
    if (code) {
      const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });

      if (!coupon) {
        return NextResponse.json({ valid: false, error: "존재하지 않는 쿠폰 코드입니다." });
      }
      if (!coupon.isActive) {
        return NextResponse.json({ valid: false, error: "비활성화된 쿠폰입니다." });
      }
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return NextResponse.json({ valid: false, error: "소진된 쿠폰입니다." });
      }
      const now = new Date();
      if (coupon.startDate && now < coupon.startDate) {
        return NextResponse.json({ valid: false, error: "아직 사용 기간이 아닙니다." });
      }
      if (coupon.endDate && now > coupon.endDate) {
        return NextResponse.json({ valid: false, error: "사용 기간이 만료된 쿠폰입니다." });
      }

      return NextResponse.json({
        valid: true,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          name: coupon.name,
          discountAmount: coupon.discountAmount,
          minOrderAmount: coupon.minOrderAmount,
        },
      });
    }

    // 쿠폰 목록 (관리자용)
    const session = await getApiSession(request);
    if (!session || session.role === "TABLE") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const page = Number(request.nextUrl.searchParams.get("page") ?? "1");
    const limit = Number(request.nextUrl.searchParams.get("limit") ?? "50");

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { _count: { select: { usages: true } } },
      }),
      prisma.coupon.count(),
    ]);

    return NextResponse.json({ coupons, total });
  } catch (error) {
    console.error("쿠폰 조회 실패:", error);
    return NextResponse.json({ error: "쿠폰 조회에 실패했습니다." }, { status: 500 });
  }
}

/**
 * POST /api/coupons — 쿠폰 생성 (관리자) 또는 사용 (고객)
 * body.action === "use" → 쿠폰 사용
 * 그 외 → 쿠폰 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 쿠폰 사용 (고객)
    if (body.action === "use") {
      const { couponId, storeId, tableNo, orderId } = body;

      const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
      if (!coupon || !coupon.isActive) {
        return NextResponse.json({ error: "유효하지 않은 쿠폰입니다." }, { status: 400 });
      }
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return NextResponse.json({ error: "소진된 쿠폰입니다." }, { status: 400 });
      }

      // 트랜잭션: 사용 기록 생성 + usedCount 증가
      const [usage] = await prisma.$transaction([
        prisma.couponUsage.create({
          data: { couponId, storeId, tableNo, orderId },
        }),
        prisma.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        }),
      ]);

      return NextResponse.json({ success: true, usage, discountAmount: coupon.discountAmount }, { status: 201 });
    }

    // 쿠폰 생성 (관리자)
    const session = await getApiSession(request);
    if (!session || session.role === "TABLE") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const { code, name, discountAmount, minOrderAmount, maxUses, startDate, endDate } = body;

    if (!code?.trim() || !name?.trim() || !discountAmount) {
      return NextResponse.json({ error: "코드, 이름, 할인금액은 필수입니다." }, { status: 400 });
    }

    // 중복 체크
    const exists = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (exists) {
      return NextResponse.json({ error: "이미 존재하는 쿠폰 코드입니다." }, { status: 409 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        name,
        discountAmount,
        minOrderAmount: minOrderAmount ?? 0,
        maxUses: maxUses ?? null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    console.error("쿠폰 처리 실패:", error);
    return NextResponse.json({ error: "쿠폰 처리에 실패했습니다." }, { status: 500 });
  }
}
