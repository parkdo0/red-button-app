import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * GET /api/games
 * 쿼리 파라미터로 필터링:
 *   ?playerCount=2인,3~4인
 *   &genre=전략,추리
 *   &difficulty=EASY,MEDIUM
 *   &category=전략
 *   &search=카탄
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const playerCount = searchParams.get("playerCount")?.split(",").filter(Boolean) ?? [];
    const genre = searchParams.get("genre")?.split(",").filter(Boolean) ?? [];
    const difficulty = searchParams.get("difficulty")?.split(",").filter(Boolean) ?? [];
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    // 동적 where 조건 구성
    const where: Prisma.GameWhereInput = {
      isActive: true,
    };

    // 카테고리 필터
    if (category) {
      where.category = { name: category };
    }

    // 검색어 필터
    if (search) {
      where.title = { contains: search };
    }

    // 난이도 필터
    if (difficulty.length > 0) {
      where.difficulty = {
        in: difficulty as Array<"EASY" | "MEDIUM" | "HARD" | "EXPERT">,
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
        category: { select: { name: true } },
        tags: {
          include: {
            tag: { select: { group: true, value: true } },
          },
        },
      },
      orderBy: [{ category: { displayOrder: "asc" } }, { title: "asc" }],
    });

    // 응답 형태를 프론트엔드 타입에 맞게 변환
    const result = games.map((game) => ({
      id: game.id,
      categoryName: game.category.name,
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
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("게임 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "게임 목록을 불러오는 데 실패했습니다." },
      { status: 500 }
    );
  }
}
