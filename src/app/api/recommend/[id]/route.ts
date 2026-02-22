import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * PATCH /api/recommend/:id
 * 추천 카테고리 수정
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const categoryId = Number(id);
    const body = await request.json();
    const { title, subtitle, emoji, order, isActive, gameIds } = body;

    const category = await prisma.recommendCategory.update({
      where: { id: categoryId },
      data: {
        ...(title !== undefined && { title }),
        ...(subtitle !== undefined && { subtitle }),
        ...(emoji !== undefined && { emoji }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    // gameIds가 전달되면 아이템 교체
    if (gameIds !== undefined) {
      await prisma.recommendCategoryItem.deleteMany({ where: { categoryId } });
      if (gameIds.length > 0) {
        await prisma.recommendCategoryItem.createMany({
          data: gameIds.map((gameId: number, idx: number) => ({
            categoryId,
            gameId,
            order: idx,
          })),
        });

        // 추천에 추가된 게임들의 StoreGame이 없으면 자동 생성
        const activeStores = await prisma.store.findMany({ where: { isActive: true }, select: { id: true } });
        for (const gId of gameIds as number[]) {
          await prisma.storeGame.createMany({
            data: activeStores.map((store) => ({
              storeId: store.id,
              gameId: gId,
              isVisible: true,
              shelfLocation: "",
            })),
            skipDuplicates: true,
          });
        }
      }
    }

    const updated = await prisma.recommendCategory.findUnique({
      where: { id: categoryId },
      include: { items: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("추천 카테고리 수정 실패:", error);
    return NextResponse.json({ error: "추천 카테고리 수정에 실패했습니다." }, { status: 500 });
  }
}

/**
 * DELETE /api/recommend/:id
 * 추천 카테고리 삭제
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await prisma.recommendCategory.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("추천 카테고리 삭제 실패:", error);
    return NextResponse.json({ error: "추천 카테고리 삭제에 실패했습니다." }, { status: 500 });
  }
}
