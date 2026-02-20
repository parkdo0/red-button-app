import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/events/:id
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 날짜 필드 변환
    if (body.startDate) body.startDate = new Date(body.startDate);
    if (body.endDate) body.endDate = new Date(body.endDate);

    const event = await prisma.event.update({ where: { id: Number(id) }, data: body });
    return NextResponse.json(event);
  } catch (error) {
    console.error("이벤트 수정 실패:", error);
    return NextResponse.json({ error: "이벤트 수정에 실패했습니다." }, { status: 500 });
  }
}

/**
 * DELETE /api/events/:id
 * soft delete
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.event.update({ where: { id: Number(id) }, data: { isActive: false } });
    return NextResponse.json({ success: true, message: "이벤트가 비활성화되었습니다." });
  } catch (error) {
    console.error("이벤트 삭제 실패:", error);
    return NextResponse.json({ error: "이벤트 삭제에 실패했습니다." }, { status: 500 });
  }
}
