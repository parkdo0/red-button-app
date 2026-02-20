import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/tags/:id
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tagId = Number(id);
    if (isNaN(tagId)) {
      return NextResponse.json({ error: "유효하지 않은 ID입니다." }, { status: 400 });
    }

    const body = await request.json();
    const tag = await prisma.tag.update({ where: { id: tagId }, data: body });
    return NextResponse.json(tag);
  } catch (error) {
    console.error("태그 수정 실패:", error);
    return NextResponse.json({ error: "태그 수정에 실패했습니다." }, { status: 500 });
  }
}

/**
 * DELETE /api/tags/:id
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tagId = Number(id);
    if (isNaN(tagId)) {
      return NextResponse.json({ error: "유효하지 않은 ID입니다." }, { status: 400 });
    }

    await prisma.tag.delete({ where: { id: tagId } });
    return NextResponse.json({ success: true, message: "태그가 삭제되었습니다." });
  } catch (error) {
    console.error("태그 삭제 실패:", error);
    return NextResponse.json({ error: "태그 삭제에 실패했습니다." }, { status: 500 });
  }
}
