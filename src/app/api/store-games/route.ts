import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/store-games?storeId=1
 * 매장별 게임 목록 (전체 게임 + 매장 설정 병합)
 */
export async function GET(request: NextRequest) {
  try {
    const storeId = Number(request.nextUrl.searchParams.get("storeId"));
    if (!storeId) {
      return NextResponse.json({ error: "storeId는 필수입니다." }, { status: 400 });
    }

    const games = await prisma.game.findMany({
      where: { isActive: true },
      include: {
        tags: { include: { tag: { select: { group: true, value: true } } } },
        hashtags: { select: { text: true } },
        storeGames: { where: { storeId } },
      },
      orderBy: { title: "asc" },
    });

    const result = games.map((game) => ({
      id: game.id,
      title: game.title,
      description: game.description,
      thumbnailUrl: game.thumbnailUrl,
      minPlayers: game.minPlayers,
      maxPlayers: game.maxPlayers,
      recommendedPlayers: game.recommendedPlayers,
      difficulty: game.difficulty,
      defaultShelfLoc: game.defaultShelfLoc,
      tags: game.tags.map((gt) => ({ group: gt.tag.group, value: gt.tag.value })),
      hashtags: game.hashtags.map((h) => h.text),
      // 매장별 설정 (없으면 기본값)
      isVisible: game.storeGames[0]?.isVisible ?? true,
      shelfLocation: game.storeGames[0]?.shelfLocation ?? game.defaultShelfLoc,
      hasStoreConfig: game.storeGames.length > 0,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("매장 게임 목록 조회 실패:", error);
    return NextResponse.json({ error: "매장 게임 목록을 불러오는 데 실패했습니다." }, { status: 500 });
  }
}

/**
 * POST /api/store-games
 * 매장별 게임 설정 (upsert: 표시/숨김, 진열위치)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameId, storeId, isVisible, shelfLocation } = body;

    if (!gameId || !storeId) {
      return NextResponse.json({ error: "gameId, storeId는 필수입니다." }, { status: 400 });
    }

    const storeGame = await prisma.storeGame.upsert({
      where: { storeId_gameId: { storeId, gameId } },
      create: {
        storeId,
        gameId,
        isVisible: isVisible ?? true,
        shelfLocation: shelfLocation ?? "",
      },
      update: {
        ...(isVisible !== undefined && { isVisible }),
        ...(shelfLocation !== undefined && { shelfLocation }),
      },
    });

    return NextResponse.json({ success: true, data: storeGame });
  } catch (error) {
    console.error("매장 게임 설정 실패:", error);
    return NextResponse.json({ error: "매장 게임 설정에 실패했습니다." }, { status: 500 });
  }
}

/**
 * DELETE /api/store-games?storeId=1&gameId=1
 * 매장 게임 설정 삭제 (기본값으로 복원)
 */
export async function DELETE(request: NextRequest) {
  try {
    const storeId = Number(request.nextUrl.searchParams.get("storeId"));
    const gameId = Number(request.nextUrl.searchParams.get("gameId"));

    if (!storeId || !gameId) {
      return NextResponse.json({ error: "storeId, gameId는 필수입니다." }, { status: 400 });
    }

    await prisma.storeGame.deleteMany({ where: { storeId, gameId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("매장 게임 설정 삭제 실패:", error);
    return NextResponse.json({ error: "매장 게임 설정 삭제에 실패했습니다." }, { status: 500 });
  }
}
