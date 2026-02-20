import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/categories?type=GAME|FOOD
 * 카테고리 목록 조회
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const categories = await prisma.category.findMany({
      where: type ? { type: type as any } : {},
      orderBy: { displayOrder: "asc" },
      select: {
        id: true,
        name: true,
        type: true,
        displayOrder: true,
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("카테고리 조회 실패:", error);
    return NextResponse.json(
      { error: "카테고리를 불러오는 데 실패했습니다." },
      { status: 500 }
    );
  }
}
