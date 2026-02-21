/**
 * GET /api/auth/tables/verify?storeId=1&code=SW31AA
 * 설정 코드로 테이블 검증 (로그인 전 코드 유효성 확인용)
 * 공개 API (인증 불필요)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const storeId = Number(request.nextUrl.searchParams.get("storeId"));
    const code = request.nextUrl.searchParams.get("code") ?? "";

    if (!storeId || !code) {
      return NextResponse.json({ error: "storeId와 code는 필수입니다." }, { status: 400 });
    }

    // setupCode로 테이블 검색
    const table = await prisma.table.findFirst({
      where: { storeId, setupCode: code.toUpperCase(), isActive: true },
      select: { id: true, tableNo: true, seats: true },
    });

    if (!table) {
      return NextResponse.json({ error: "설정 코드가 올바르지 않습니다." }, { status: 401 });
    }

    return NextResponse.json(table);
  } catch (error) {
    console.error("코드 검증 실패:", error);
    return NextResponse.json({ error: "코드 검증에 실패했습니다." }, { status: 500 });
  }
}
