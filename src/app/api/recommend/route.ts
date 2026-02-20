import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/recommend
 * 추천 카테고리 목록 (게임 포함)
 */
export async function GET(request: NextRequest) {
  try {
    const includeInactive = request.nextUrl.searchParams.get("all") === "true";

    const categories = await prisma.recommendCategory.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        items: {
          orderBy: { order: "asc" },
          include: {
            game: {
              include: {
                tags: { include: { tag: { select: { group: true, value: true } } } },
                hashtags: { select: { text: true } },
              },
            },
          },
        },
      },
      orderBy: { order: "asc" },
    });

    const result = categories.map((cat) => ({
      id: cat.id,
      title: cat.title,
      subtitle: cat.subtitle,
      emoji: cat.emoji,
      order: cat.order,
      isActive: cat.isActive,
      games: cat.items.map((item) => ({
        id: item.game.id,
        title: item.game.title,
        description: item.game.description,
        thumbnailUrl: item.game.thumbnailUrl,
        minPlayers: item.game.minPlayers,
        maxPlayers: item.game.maxPlayers,
        recommendedPlayers: item.game.recommendedPlayers,
        difficulty: item.game.difficulty,
        tags: item.game.tags.map((gt) => ({ group: gt.tag.group, value: gt.tag.value })),
        hashtags: item.game.hashtags.map((h) => h.text),
      })),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("추천 카테고리 조회 실패:", error);
    return NextResponse.json({ error: "추천 카테고리를 불러오는 데 실패했습니다." }, { status: 500 });
  }
}

/**
 * POST /api/recommend
 * 추천 카테고리 생성 (Admin)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, subtitle, emoji, order, gameIds } = body;

    if (!title) {
      return NextResponse.json({ error: "title은 필수입니다." }, { status: 400 });
    }

    const category = await prisma.recommendCategory.create({
      data: {
        title,
        subtitle: subtitle ?? "",
        emoji: emoji ?? "🎲",
        order: order ?? 0,
        ...(gameIds?.length > 0 && {
          items: {
            create: gameIds.map((gameId: number, idx: number) => ({
              gameId,
              order: idx,
            })),
          },
        }),
      },
      include: { items: true },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("추천 카테고리 생성 실패:", error);
    return NextResponse.json({ error: "추천 카테고리 생성에 실패했습니다." }, { status: 500 });
  }
}
