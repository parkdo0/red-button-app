/**
 * GET /api/auth/stores
 * 활성 매장 목록 (테이블 로그인 드롭다운용)
 * 공개 API (인증 불필요)
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      where: { isActive: true },
      select: { id: true, name: true, storeCode: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(stores);
  } catch (error) {
    console.error("매장 목록 조회 실패:", error);
    return NextResponse.json({ error: "매장 목록을 불러올 수 없습니다." }, { status: 500 });
  }
}
