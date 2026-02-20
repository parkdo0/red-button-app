import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/events
 * 이벤트 목록 (활성 이벤트만)
 */
export async function GET(request: NextRequest) {
  try {
    const includeInactive = request.nextUrl.searchParams.get("all") === "true";

    const events = await prisma.event.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(events);
  } catch (error) {
    console.error("이벤트 조회 실패:", error);
    return NextResponse.json({ error: "이벤트를 불러오는 데 실패했습니다." }, { status: 500 });
  }
}

/**
 * POST /api/events
 * 이벤트 생성 (Admin)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, subtitle, imageUrl, startDate, endDate, order } = body;

    if (!title) {
      return NextResponse.json({ error: "title은 필수입니다." }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        title,
        subtitle: subtitle ?? null,
        imageUrl: imageUrl ?? null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        order: order ?? 0,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("이벤트 생성 실패:", error);
    return NextResponse.json({ error: "이벤트 생성에 실패했습니다." }, { status: 500 });
  }
}
