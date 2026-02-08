import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/games/:id
 * 게임 상세 + 관련 게임 추천
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const gameId = Number(id);

    if (isNaN(gameId)) {
      return NextResponse.json({ error: "유효하지 않은 ID입니다." }, { status: 400 });
    }

    const game = await prisma.game.findUnique({
      where: { id: gameId, isActive: true },
      include: {
        category: { select: { id: true, name: true } },
        tags: {
          include: { tag: { select: { group: true, value: true } } },
        },
      },
    });

    if (!game) {
      return NextResponse.json({ error: "게임을 찾을 수 없습니다." }, { status: 404 });
    }

    // 관련 게임: 같은 카테고리 또는 같은 태그를 가진 게임
    const tagValues = game.tags.map((gt) => gt.tag.value);

    const similarGames = await prisma.game.findMany({
      where: {
        id: { not: game.id },
        isActive: true,
        OR: [
          { categoryId: game.categoryId },
          { tags: { some: { tag: { value: { in: tagValues } } } } },
        ],
      },
      include: {
        category: { select: { name: true } },
      },
      take: 4,
    });

    return NextResponse.json({
      ...game,
      categoryName: game.category.name,
      tags: game.tags.map((gt) => ({ group: gt.tag.group, value: gt.tag.value })),
      similarGames: similarGames.map((sg) => ({
        id: sg.id,
        title: sg.title,
        categoryName: sg.category.name,
        minPlayers: sg.minPlayers,
        maxPlayers: sg.maxPlayers,
        difficulty: sg.difficulty,
        thumbnailUrl: sg.thumbnailUrl,
      })),
    });
  } catch (error) {
    console.error("게임 상세 조회 실패:", error);
    return NextResponse.json(
      { error: "게임 정보를 불러오는 데 실패했습니다." },
      { status: 500 }
    );
  }
}
