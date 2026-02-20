import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/tags
 * 태그 목록
 */
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: [{ group: "asc" }, { displayOrder: "asc" }],
    });
    return NextResponse.json(tags);
  } catch (error) {
    console.error("태그 조회 실패:", error);
    return NextResponse.json({ error: "태그를 불러오는 데 실패했습니다." }, { status: 500 });
  }
}

/**
 * POST /api/tags
 * 태그 생성 (Admin)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { group, value, displayOrder } = body;

    if (!group || !value) {
      return NextResponse.json({ error: "group, value는 필수입니다." }, { status: 400 });
    }

    const tag = await prisma.tag.create({
      data: { group, value, displayOrder: displayOrder ?? 0 },
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error("태그 생성 실패:", error);
    return NextResponse.json({ error: "태그 생성에 실패했습니다." }, { status: 500 });
  }
}
