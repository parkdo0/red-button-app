import { NextRequest, NextResponse } from "next/server";
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
        tags: {
          include: { tag: { select: { group: true, value: true } } },
        },
        hashtags: true,
      },
    });

    if (!game) {
      return NextResponse.json({ error: "게임을 찾을 수 없습니다." }, { status: 404 });
    }

    // 관련 게임: 같은 태그를 가진 게임
    const tagValues = game.tags.map((gt) => gt.tag.value);

    const similarGames = await prisma.game.findMany({
      where: {
        id: { not: game.id },
        isActive: true,
        tags: { some: { tag: { value: { in: tagValues } } } },
      },
      include: {
        tags: {
          include: { tag: { select: { group: true, value: true } } },
        },
      },
      take: 4,
    });

    return NextResponse.json({
      ...game,
      tags: game.tags.map((gt) => ({ group: gt.tag.group, value: gt.tag.value })),
      hashtags: game.hashtags.map((h) => h.text),
      similarGames: similarGames.map((sg) => ({
        id: sg.id,
        title: sg.title,
        minPlayers: sg.minPlayers,
        maxPlayers: sg.maxPlayers,
        difficulty: sg.difficulty,
        thumbnailUrl: sg.thumbnailUrl,
        tags: sg.tags.map((gt) => ({ group: gt.tag.group, value: gt.tag.value })),
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

/**
 * PATCH /api/games/:id
 * 게임 수정 (Admin)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const gameId = Number(id);
    if (isNaN(gameId)) {
      return NextResponse.json({ error: "유효하지 않은 ID입니다." }, { status: 400 });
    }

    const body = await request.json();
    const { tagIds, hashtags, ...gameData } = body;

    const game = await prisma.$transaction(async (tx) => {
      // 게임 기본 정보 업데이트
      const updated = await tx.game.update({
        where: { id: gameId },
        data: gameData,
      });

      // 태그 교체 (있을 경우)
      if (tagIds !== undefined) {
        await tx.gameTag.deleteMany({ where: { gameId } });
        if (tagIds.length > 0) {
          await tx.gameTag.createMany({
            data: tagIds.map((tagId: number) => ({ gameId, tagId })),
          });
        }
      }

      // 해시태그 교체 (있을 경우)
      if (hashtags !== undefined) {
        await tx.gameHashtag.deleteMany({ where: { gameId } });
        if (hashtags.length > 0) {
          await tx.gameHashtag.createMany({
            data: hashtags.map((text: string, idx: number) => ({
              gameId,
              text,
              order: idx,
            })),
          });
        }
      }

      return tx.game.findUnique({
        where: { id: gameId },
        include: {
          tags: { include: { tag: true } },
          hashtags: { orderBy: { order: "asc" } },
        },
      });
    });

    return NextResponse.json(game);
  } catch (error) {
    console.error("게임 수정 실패:", error);
    return NextResponse.json({ error: "게임 수정에 실패했습니다." }, { status: 500 });
  }
}

/**
 * DELETE /api/games/:id
 * 게임 비활성화 (soft delete)
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const gameId = Number(id);
    if (isNaN(gameId)) {
      return NextResponse.json({ error: "유효하지 않은 ID입니다." }, { status: 400 });
    }

    await prisma.game.update({
      where: { id: gameId },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, message: "게임이 비활성화되었습니다." });
  } catch (error) {
    console.error("게임 삭제 실패:", error);
    return NextResponse.json({ error: "게임 삭제에 실패했습니다." }, { status: 500 });
  }
}
