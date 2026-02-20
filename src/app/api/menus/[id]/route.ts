import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/menus/:id
 * 메뉴 수정 (Admin)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const menuId = Number(id);
    if (isNaN(menuId)) {
      return NextResponse.json({ error: "유효하지 않은 ID입니다." }, { status: 400 });
    }

    const body = await request.json();

    const menu = await prisma.menu.update({
      where: { id: menuId },
      data: body,
      include: {
        category: { select: { name: true } },
        optionGroups: { include: { options: true } },
      },
    });

    return NextResponse.json(menu);
  } catch (error) {
    console.error("메뉴 수정 실패:", error);
    return NextResponse.json({ error: "메뉴 수정에 실패했습니다." }, { status: 500 });
  }
}

/**
 * DELETE /api/menus/:id
 * 메뉴 비활성화 (soft delete)
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const menuId = Number(id);
    if (isNaN(menuId)) {
      return NextResponse.json({ error: "유효하지 않은 ID입니다." }, { status: 400 });
    }

    await prisma.menu.update({
      where: { id: menuId },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, message: "메뉴가 비활성화되었습니다." });
  } catch (error) {
    console.error("메뉴 삭제 실패:", error);
    return NextResponse.json({ error: "메뉴 삭제에 실패했습니다." }, { status: 500 });
  }
}
