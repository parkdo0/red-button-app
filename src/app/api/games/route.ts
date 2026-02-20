import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * GET /api/games
 * 쿼리 파라미터로 필터링:
 *   ?playerCount=2인,3~4인
 *   &genre=전략,추리
 *   &difficulty=EASY,MEDIUM
 *   &search=카탄
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const playerCount = searchParams.get("playerCount")?.split(",").filter(Boolean) ?? [];
    const genre = searchParams.get("genre")?.split(",").filter(Boolean) ?? [];
    const difficulty = searchParams.get("difficulty")?.split(",").filter(Boolean) ?? [];
    const search = searchParams.get("search");

    // 동적 where 조건 구성
    const where: Prisma.GameWhereInput = {
      isActive: true,
    };

    // 검색어 필터
    if (search) {
      where.title = { contains: search };
    }

    // 난이도 필터
    if (difficulty.length > 0) {
      where.difficulty = {
        in: difficulty as Array<"VERY_EASY" | "EASY" | "NORMAL" | "SEMI_HARD" | "HARD" | "EXTREME">,
      };
    }

    // 태그 기반 필터 (인원수, 장르): AND 조건으로 모든 그룹 충족 필요
    const tagFilters: Prisma.GameWhereInput[] = [];

    if (playerCount.length > 0) {
      tagFilters.push({
        tags: {
          some: {
            tag: { group: "player_count", value: { in: playerCount } },
          },
        },
      });
    }

    if (genre.length > 0) {
      tagFilters.push({
        tags: {
          some: {
            tag: { group: "genre", value: { in: genre } },
          },
        },
      });
    }

    if (tagFilters.length > 0) {
      where.AND = tagFilters;
    }

    const games = await prisma.game.findMany({
      where,
      include: {
        tags: {
          include: {
            tag: { select: { group: true, value: true } },
          },
        },
        hashtags: { select: { text: true } },
      },
      orderBy: { title: "asc" },
    });

    // 응답 형태를 프론트엔드 타입에 맞게 변환
    const result = games.map((game) => ({
      id: game.id,
      title: game.title,
      description: game.description,
      thumbnailUrl: game.thumbnailUrl,
      videoUrl: game.videoUrl,
      minPlayers: game.minPlayers,
      maxPlayers: game.maxPlayers,
      playTime: game.playTime,
      difficulty: game.difficulty,
      tags: game.tags.map((gt) => ({
        group: gt.tag.group,
        value: gt.tag.value,
      })),
      hashtags: game.hashtags.map((h) => h.text),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("게임 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "게임 목록을 불러오는 데 실패했습니다." },
      { status: 500 },
    );
  }
}

/**
 * POST /api/games
 * 게임 생성 (Admin)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, thumbnailUrl, videoUrl, minPlayers, maxPlayers,
      recommendedPlayers, playTime, playTimeCategory, difficulty, defaultShelfLoc,
      tagIds, hashtags } = body;

    if (!title || !minPlayers || !maxPlayers || !difficulty) {
      return NextResponse.json(
        { error: "title, minPlayers, maxPlayers, difficulty는 필수입니다." },
        { status: 400 }
      );
    }

    const game = await prisma.game.create({
      data: {
        title,
        description: description ?? "",
        thumbnailUrl: thumbnailUrl ?? null,
        videoUrl: videoUrl ?? null,
        minPlayers,
        maxPlayers,
        recommendedPlayers: recommendedPlayers ?? `${minPlayers}-${maxPlayers}인`,
        playTime: playTime ?? null,
        playTimeCategory: playTimeCategory ?? null,
        difficulty,
        defaultShelfLoc: defaultShelfLoc ?? "",
        // 태그 연결
        ...(tagIds?.length > 0 && {
          tags: {
            create: tagIds.map((tagId: number) => ({ tagId })),
          },
        }),
        // 해시태그 생성
        ...(hashtags?.length > 0 && {
          hashtags: {
            create: hashtags.map((text: string, idx: number) => ({ text, order: idx })),
          },
        }),
      },
      include: {
        tags: { include: { tag: true } },
        hashtags: true,
      },
    });

    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    console.error("게임 생성 실패:", error);
    return NextResponse.json({ error: "게임 생성에 실패했습니다." }, { status: 500 });
  }
}
